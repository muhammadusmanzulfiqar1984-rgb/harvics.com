/**
 * hx-reply-classifier.worker.ts — inbound reply NLP classification
 * Module 3 Session 3 — replaces Module 1B version
 *
 * Queue consumed: hx-reply-classify
 * Emits: hx-notify, hx-pipeline
 *
 * Concurrency: 20
 */

import { Worker, Queue } from 'bullmq';
import { randomUUID } from 'crypto';

import { bronzeWrite } from '../../packages/lib/hx-bronze';
import { hxLogger } from '../../packages/lib/hx-logger';
import type { HxQueueJob, HxWhatsAppNotification } from '../../packages/types/hx.types';
import { pool } from '../../packages/db';

const REDIS_URL = process.env.HX_REDIS_URL ?? 'redis://localhost:6379';
const GROQ_KEY = process.env.HX_GROQ_API_KEY ?? process.env.GROQ_API_KEY ?? '';
const GROQ_MODEL = process.env.HX_GROQ_MODEL ?? 'llama-3.1-8b-instant';
const OPERATOR_WA = process.env.HX_OPERATOR_WHATSAPP ?? '';
const FETCH_TIMEOUT = 15_000;
const MODULE = 'hx-reply-classifier.worker';

const notifyQueue = new Queue('hx-notify', {
  connection: { url: REDIS_URL, maxRetriesPerRequest: null },
});
const pipelineQueue = new Queue('hx-pipeline', {
  connection: { url: REDIS_URL, maxRetriesPerRequest: null },
});

type ClassifiedIntent = 'positive' | 'question' | 'negative' | 'no_reply_risk';

interface ReplyPayload {
  reply_id: string;
  contact_id: string;
  channel: string;
  reply_text: string;
  outreach_log_id?: string | null;
}

interface GroqClassification {
  intent: ClassifiedIntent;
  confidence: number;
  summary: string;
  suggested_response: string;
}

interface ContactRow {
  id: string;
  full_name: string | null;
  company_name: string | null;
  email_pattern: string | null;
  phone: string | null;
}

const CLASSIFY_PROMPT = `You are a B2B sales reply classifier.
Classify the reply intent as one of:
positive — interested, wants to meet, asking for details
question — asking something, needs more info
negative — not interested, unsubscribe, stop
no_reply_risk — out of office, bounced, automated

Return JSON only:
{ "intent": "positive|question|negative|no_reply_risk",
  "confidence": 0.0-1.0,
  "summary": "one line summary",
  "suggested_response": "optional draft reply" }`;

const DRAFT_PROMPT = `You are Harvey, Harvics Global's B2B sales AI.
Write a short, professional reply to the prospect's message.
Keep it under 120 words. No fluff. Return plain text only.`;

async function classifyReply(text: string): Promise<GroqClassification> {
  const fallback: GroqClassification = {
    intent: 'question',
    confidence: 0.5,
    summary: 'Classification unavailable — defaulted to question',
    suggested_response: '',
  };

  if (!GROQ_KEY) {
    hxLogger.warn(MODULE, 'GROQ_API_KEY missing — defaulting to question');
    return fallback;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${GROQ_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        temperature: 0,
        max_tokens: 400,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: CLASSIFY_PROMPT },
          { role: 'user', content: text.slice(0, 4_000) },
        ],
      }),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw new Error(`Groq ${res.status}: ${body.slice(0, 200)}`);
    }

    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const raw = data.choices?.[0]?.message?.content?.trim() ?? '{}';
    const parsed = JSON.parse(raw) as {
      intent?: string;
      confidence?: number;
      summary?: string;
      suggested_response?: string;
    };

    const intent = (
      ['positive', 'question', 'negative', 'no_reply_risk'] as const
    ).includes(parsed.intent as ClassifiedIntent)
      ? (parsed.intent as ClassifiedIntent)
      : 'question';

    return {
      intent,
      confidence: Math.min(1, Math.max(0, Number(parsed.confidence) || 0.5)),
      summary: String(parsed.summary ?? '').slice(0, 500),
      suggested_response: String(parsed.suggested_response ?? ''),
    };
  } catch (err) {
    hxLogger.error(MODULE, 'classify failed', {
      err: err instanceof Error ? err.message : String(err),
    });
    return fallback;
  } finally {
    clearTimeout(timer);
  }
}

/** Harvey AI draft for question replies (operator approval required). */
async function generateHarveyDraft(
  contact: ContactRow,
  replyText: string,
): Promise<string> {
  if (!GROQ_KEY) return '';

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT);
  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${GROQ_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        temperature: 0.4,
        max_tokens: 300,
        messages: [
          { role: 'system', content: DRAFT_PROMPT },
          {
            role: 'user',
            content:
              `Contact: ${contact.full_name ?? 'Unknown'} @ ${contact.company_name ?? 'Unknown'}\n` +
              `Their message:\n${replyText.slice(0, 3_000)}`,
          },
        ],
      }),
    });
    if (!res.ok) return '';
    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    return (data.choices?.[0]?.message?.content ?? '').trim();
  } catch {
    return '';
  } finally {
    clearTimeout(timer);
  }
}

function isBounceSignal(text: string, summary: string): boolean {
  const hay = `${text}\n${summary}`.toLowerCase();
  return /bounce|undeliverable|delivery.*fail|mailbox.*not|user unknown|550 |551 |553 /.test(hay);
}

function isOooSignal(text: string, summary: string): boolean {
  const hay = `${text}\n${summary}`.toLowerCase();
  return /out of office|ooo|away from (the )?office|on leave|vacation|holiday|automatic reply|auto[- ]?reply/.test(hay);
}

async function getContact(contactId: string): Promise<ContactRow | null> {
  const { rows } = await pool.query<ContactRow>(
    `SELECT id, full_name, company_name, email_pattern, phone
     FROM hx_contacts WHERE id = $1`,
    [contactId],
  );
  return rows[0] ?? null;
}

async function pushNotify(notification: HxWhatsAppNotification): Promise<void> {
  const job: HxQueueJob<HxWhatsAppNotification> = {
    job_id: randomUUID(),
    job_type: 'notify',
    source_module: MODULE,
    attempts: 0,
    created_at: new Date().toISOString(),
    payload: notification,
  };
  await notifyQueue.add('notify', job, { priority: 1, attempts: 3 });
}

async function pushPipeline(contactId: string, replyId: string): Promise<void> {
  const job: HxQueueJob<{ contact_id: string; reply_id: string; intent: string }> = {
    job_id: randomUUID(),
    job_type: 'pipeline',
    source_module: MODULE,
    attempts: 0,
    created_at: new Date().toISOString(),
    payload: { contact_id: contactId, reply_id: replyId, intent: 'positive' },
  };
  await pipelineQueue.add('pipeline', job, { attempts: 3 });
}

async function unsubscribeEnrollments(contactId: string): Promise<void> {
  await pool.query(
    `UPDATE hx_sequence_enrollments
     SET status = 'unsubscribed',
         completed_at = COALESCE(completed_at, NOW()),
         next_step_at = NULL,
         updated_at = NOW()
     WHERE contact_id = $1 AND status = 'active'`,
    [contactId],
  );
}

async function pauseEnrollments(contactId: string): Promise<void> {
  await pool.query(
    `UPDATE hx_sequence_enrollments
     SET status = 'paused',
         next_step_at = NULL,
         updated_at = NOW()
     WHERE contact_id = $1 AND status = 'active'`,
    [contactId],
  );
}

async function scheduleOooResume(contactId: string): Promise<void> {
  await pool.query(
    `UPDATE hx_sequence_enrollments
     SET status = 'active',
         next_step_at = NOW() + INTERVAL '5 days',
         updated_at = NOW()
     WHERE contact_id = $1 AND status IN ('active', 'paused')`,
    [contactId],
  );
}

const worker = new Worker<HxQueueJob<ReplyPayload>>(
  'hx-reply-classify',
  async (job) => {
    const { reply_id, contact_id, channel, reply_text } = job.data.payload;

    const contact = await getContact(contact_id);
    if (!contact) {
      hxLogger.warn(MODULE, 'contact not found', { contact_id });
      return;
    }

    const classified = await classifyReply(reply_text);
    let suggested = classified.suggested_response;

    if (classified.intent === 'question') {
      const draft = await generateHarveyDraft(contact, reply_text);
      if (draft) suggested = draft;
    }

    await pool.query(
      `UPDATE hx_replies SET
         intent = $2,
         confidence = $3,
         intent_score = $3,
         summary = $4,
         suggested_response = $5,
         draft_body = $5,
         draft_ready = $6,
         processed = TRUE,
         raw = COALESCE(raw, '{}'::jsonb) || $7::jsonb,
         raw_json = COALESCE(raw_json, '{}'::jsonb) || $7::jsonb
       WHERE id = $1`,
      [
        reply_id,
        classified.intent,
        classified.confidence,
        classified.summary || null,
        suggested || null,
        classified.intent === 'question' && Boolean(suggested),
        JSON.stringify({
          classified_intent: classified.intent,
          confidence: classified.confidence,
          summary: classified.summary,
        }),
      ],
    );

    await bronzeWrite({
      event_type: 'reply.classified',
      source_module: MODULE,
      entity_id: reply_id,
      entity_type: 'hx_reply',
      payload: {
        contact_id,
        contact_name: contact.full_name,
        company_name: contact.company_name,
        channel,
        intent: classified.intent,
        confidence: classified.confidence,
        summary: classified.summary,
        draft_ready: classified.intent === 'question' && Boolean(suggested),
      },
    });

    if (classified.intent === 'positive') {
      await pushNotify({
        to: OPERATOR_WA,
        type: 'action_required',
        module: 'outreach',
        headline: `Positive reply — ${(contact.full_name ?? 'Contact').slice(0, 40)}`,
        body:
          `Intent: positive (${classified.confidence.toFixed(2)}) via ${channel}. ` +
          `${classified.summary || 'No summary.'}`,
        entity_name: contact.full_name ?? undefined,
        entity_id: contact.id,
        action_url: `https://harvyx.com/replies/${reply_id}`,
        timestamp: new Date().toISOString(),
      });
      await pushPipeline(contact_id, reply_id);
    } else if (classified.intent === 'question') {
      await pushNotify({
        to: OPERATOR_WA,
        type: 'action_required',
        module: 'outreach',
        headline: `Draft ready — ${(contact.full_name ?? 'Contact').slice(0, 40)}`,
        body:
          `Question reply via ${channel}. Harvey drafted a response — approve to send.\n` +
          `Summary: ${classified.summary || 'n/a'}\n` +
          `Draft: ${(suggested || '—').slice(0, 280)}`,
        entity_name: contact.full_name ?? undefined,
        entity_id: contact.id,
        action_url: `https://harvyx.com/replies/${reply_id}`,
        timestamp: new Date().toISOString(),
      });
    } else if (classified.intent === 'negative') {
      await unsubscribeEnrollments(contact_id);
      await pool.query(
        `UPDATE hx_contacts
         SET in_nurture_pool = TRUE,
             sequence_enrolled = FALSE,
             updated_at = NOW()
         WHERE id = $1`,
        [contact_id],
      );
    } else if (classified.intent === 'no_reply_risk') {
      if (isBounceSignal(reply_text, classified.summary)) {
        await pauseEnrollments(contact_id);
        await pool.query(
          `UPDATE hx_replies SET intent = 'bounce' WHERE id = $1`,
          [reply_id],
        );
      } else if (isOooSignal(reply_text, classified.summary)) {
        await scheduleOooResume(contact_id);
        await pool.query(
          `UPDATE hx_replies SET intent = 'ooo' WHERE id = $1`,
          [reply_id],
        );
      } else {
        // Ambiguous auto-reply — pause conservatively
        await pauseEnrollments(contact_id);
      }
    }

    hxLogger.info(MODULE, 'reply classified', {
      reply_id,
      contact_id,
      intent: classified.intent,
      confidence: classified.confidence,
      channel,
    });
  },
  {
    connection: { url: REDIS_URL, maxRetriesPerRequest: null },
    concurrency: 20,
  },
);

worker.on('failed', (job, err) => {
  hxLogger.error(MODULE, 'job failed', {
    jobId: job?.id,
    attempt: job?.attemptsMade,
    err: err.message,
  });
});

worker.on('error', (err) => {
  hxLogger.error(MODULE, 'worker error', { err: err.message });
});

hxLogger.info(MODULE, 'worker started', {
  concurrency: 20,
  queue: 'hx-reply-classify',
});

export { worker };
