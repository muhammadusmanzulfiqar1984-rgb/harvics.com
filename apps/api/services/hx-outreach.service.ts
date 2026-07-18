/**
 * hx-outreach.service.ts — Outreach Engine core send + enroll
 * Module 3 Session 2
 *
 * Channel senders used by hx-sequence.worker and API routes.
 * enrollContact creates the enrollment, schedules next_step_at,
 * and pushes hx-outreach-dispatch.
 */

import { randomUUID } from 'crypto';
import { Queue } from 'bullmq';

import { bronzeWrite } from '../../../packages/lib/hx-bronze';
import { hxLogger } from '../../../packages/lib/hx-logger';
import { pool } from '../../../packages/db';
import { enrollContact as insertEnrollment } from '../../../packages/db/repositories/hx-outreach.repository';
import type { HxQueueJob } from '../../../packages/types/hx.types';
import type {
  HxSequenceEnrollment,
  HxSequenceStep,
} from '../../../packages/types/hx-outreach.types';

const MODULE = 'hx-outreach.service';
const REDIS_URL = process.env.HX_REDIS_URL ?? 'redis://localhost:6379';
const RESEND_KEY = process.env.HX_RESEND_API_KEY ?? process.env.RESEND_API_KEY ?? '';
const RESEND_FROM = process.env.HX_RESEND_FROM ?? 'outreach@harvics.com';
const TWILIO_SID = process.env.HX_TWILIO_ACCOUNT_SID ?? '';
const TWILIO_TOKEN = process.env.HX_TWILIO_AUTH_TOKEN ?? '';
const TWILIO_WA_FROM = process.env.HX_TWILIO_WHATSAPP_FROM ?? '';
const TWILIO_SMS_FROM = process.env.HX_TWILIO_SMS_FROM ?? '';
const FETCH_TIMEOUT = 12_000;

export interface OutreachContact {
  id: string;
  first_name: string | null;
  last_name: string | null;
  full_name: string | null;
  company_name: string | null;
  email_pattern: string | null;
  phone: string | null;
  linkedin_url: string | null;
}

export interface SendEmailResult {
  sent: boolean;
  message_id: string;
  bounced?: boolean;
}

export interface SendTwilioResult {
  sent: boolean;
  sid: string;
}

type DispatchPayload = {
  enrollment_id: string;
};

let dispatchQueue: Queue<HxQueueJob<DispatchPayload>> | null = null;

function getDispatchQueue(): Queue<HxQueueJob<DispatchPayload>> {
  if (!dispatchQueue) {
    dispatchQueue = new Queue<HxQueueJob<DispatchPayload>>('hx-outreach-dispatch', {
      connection: {
        url: REDIS_URL,
        maxRetriesPerRequest: null,
      },
    });
  }
  return dispatchQueue;
}

/** Replace {{token}} placeholders in a sequence body/subject template. */
export function renderTemplate(template: string, contact: OutreachContact): string {
  const tokens: Record<string, string> = {
    first_name: contact.first_name ?? '',
    last_name: contact.last_name ?? '',
    full_name: contact.full_name ?? '',
    company_name: contact.company_name ?? '',
    company: contact.company_name ?? '',
  };
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => tokens[key] ?? '');
}

export async function sendEmail(
  contact: OutreachContact,
  step: Pick<HxSequenceStep, 'subject' | 'body_template'>,
): Promise<SendEmailResult> {
  const to = contact.email_pattern?.trim() ?? '';
  if (!RESEND_KEY || !to) {
    hxLogger.warn(MODULE, 'sendEmail skipped — missing key or email', {
      contact_id: contact.id,
      has_key: Boolean(RESEND_KEY),
    });
    return { sent: false, message_id: '' };
  }

  const subject = step.subject
    ? renderTemplate(step.subject, contact)
    : 'Harvics — partnership enquiry';
  const html = renderTemplate(step.body_template, contact);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT);
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${RESEND_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: RESEND_FROM,
        to: [to],
        subject,
        html,
        // Opens/clicks tracked via Resend webhooks (email.opened / email.delivered)
        tags: [{ name: 'module', value: 'hx-outreach' }],
      }),
    });

    const body = (await res.json().catch(() => ({}))) as {
      id?: string;
      message?: string;
      name?: string;
    };

    if (res.status === 422) {
      return { sent: false, message_id: body.id ?? '', bounced: true };
    }

    if (!res.ok) {
      hxLogger.error(MODULE, 'Resend send failed', {
        status: res.status,
        message: body.message ?? body.name,
        contact_id: contact.id,
      });
      return { sent: false, message_id: body.id ?? '' };
    }

    return { sent: true, message_id: body.id ?? '' };
  } catch (err) {
    hxLogger.error(MODULE, 'Resend send error', {
      err: err instanceof Error ? err.message : String(err),
      contact_id: contact.id,
    });
    return { sent: false, message_id: '' };
  } finally {
    clearTimeout(timer);
  }
}

async function sendTwilio(
  contact: OutreachContact,
  step: Pick<HxSequenceStep, 'body_template'>,
  channel: 'whatsapp' | 'sms',
): Promise<SendTwilioResult> {
  const toRaw = contact.phone?.trim() ?? '';
  if (!TWILIO_SID || !TWILIO_TOKEN || !toRaw) {
    hxLogger.warn(MODULE, `${channel} skipped — missing credentials or phone`, {
      contact_id: contact.id,
    });
    return { sent: false, sid: '' };
  }

  const from =
    channel === 'whatsapp'
      ? `whatsapp:${TWILIO_WA_FROM.replace(/^whatsapp:/, '')}`
      : TWILIO_SMS_FROM;

  if (!from) {
    hxLogger.warn(MODULE, `${channel} skipped — missing from number`);
    return { sent: false, sid: '' };
  }

  const to =
    channel === 'whatsapp'
      ? `whatsapp:${toRaw.replace(/^whatsapp:/, '')}`
      : toRaw;

  const body = renderTemplate(step.body_template, contact);
  const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_SID}/Messages.json`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

  try {
    const res = await fetch(url, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        Authorization: `Basic ${Buffer.from(`${TWILIO_SID}:${TWILIO_TOKEN}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({ From: from, To: to, Body: body }).toString(),
    });

    const payload = (await res.json().catch(() => ({}))) as {
      sid?: string;
      message?: string;
      error_message?: string;
    };

    if (!res.ok) {
      hxLogger.error(MODULE, `Twilio ${channel} failed`, {
        status: res.status,
        message: payload.message ?? payload.error_message,
        contact_id: contact.id,
      });
      return { sent: false, sid: payload.sid ?? '' };
    }

    return { sent: true, sid: payload.sid ?? '' };
  } catch (err) {
    hxLogger.error(MODULE, `Twilio ${channel} error`, {
      err: err instanceof Error ? err.message : String(err),
      contact_id: contact.id,
    });
    return { sent: false, sid: '' };
  } finally {
    clearTimeout(timer);
  }
}

export async function sendWhatsApp(
  contact: OutreachContact,
  step: Pick<HxSequenceStep, 'body_template'>,
): Promise<SendTwilioResult> {
  return sendTwilio(contact, step, 'whatsapp');
}

export async function sendSMS(
  contact: OutreachContact,
  step: Pick<HxSequenceStep, 'body_template'>,
): Promise<SendTwilioResult> {
  return sendTwilio(contact, step, 'sms');
}

/**
 * Enroll a contact into a sequence.
 * Sets next_step_at = NOW() + first step delay_days, queues dispatch.
 */
export async function enrollContact(
  contact_id: string,
  sequence_id: string,
): Promise<HxSequenceEnrollment> {
  const contactRes = await pool.query(`SELECT id FROM hx_contacts WHERE id = $1`, [contact_id]);
  if (!contactRes.rows[0]) throw new Error('contact_not_found');

  const seqRes = await pool.query(
    `SELECT id, status FROM hx_sequences WHERE id = $1`,
    [sequence_id],
  );
  if (!seqRes.rows[0]) throw new Error('sequence_not_found');
  if (seqRes.rows[0].status === 'archived') throw new Error('sequence_archived');

  const stepRes = await pool.query<{ delay_days: number; step_number: number }>(
    `SELECT delay_days, step_number FROM hx_sequence_steps
     WHERE sequence_id = $1
     ORDER BY step_number ASC
     LIMIT 1`,
    [sequence_id],
  );
  if (!stepRes.rows[0]) throw new Error('sequence_has_no_steps');

  const first = stepRes.rows[0];
  const delayMs = Math.max(0, first.delay_days) * 24 * 60 * 60 * 1000;
  const nextStepAt = new Date(Date.now() + delayMs).toISOString();

  const enrollment = await insertEnrollment({
    contact_id,
    sequence_id,
    current_step: first.step_number,
    status: 'active',
    next_step_at: nextStepAt,
  });

  await pool.query(
    `UPDATE hx_contacts
     SET sequence_enrolled = true,
         sequence_enrolled_at = COALESCE(sequence_enrolled_at, NOW()),
         updated_at = NOW()
     WHERE id = $1`,
    [contact_id],
  );

  await bronzeWrite({
    event_type: 'outreach.enrolled',
    source_module: MODULE,
    entity_id: enrollment.id,
    entity_type: 'hx_sequence_enrollment',
    payload: { contact_id, sequence_id, next_step_at: nextStepAt },
  });

  const job: HxQueueJob<DispatchPayload> = {
    job_id: randomUUID(),
    job_type: 'outreach_dispatch',
    payload: { enrollment_id: enrollment.id },
    attempts: 0,
    created_at: new Date().toISOString(),
    source_module: MODULE,
  };

  await getDispatchQueue().add('dispatch', job, {
    jobId: job.job_id,
    delay: delayMs,
    removeOnComplete: 100,
    removeOnFail: 50,
  });

  hxLogger.info(MODULE, 'contact enrolled', {
    enrollment_id: enrollment.id,
    contact_id,
    sequence_id,
    next_step_at: nextStepAt,
  });

  return enrollment;
}

export async function queueEnrollmentDispatch(
  enrollment_id: string,
  delayMs = 0,
): Promise<void> {
  const job: HxQueueJob<DispatchPayload> = {
    job_id: randomUUID(),
    job_type: 'outreach_dispatch',
    payload: { enrollment_id },
    attempts: 0,
    created_at: new Date().toISOString(),
    source_module: MODULE,
  };

  await getDispatchQueue().add('dispatch', job, {
    jobId: `${enrollment_id}:${job.job_id}`,
    delay: Math.max(0, delayMs),
    removeOnComplete: 100,
    removeOnFail: 50,
  });
}
