/**
 * hx-lusha-reveal.worker.ts — Lusha phone + email reveal
 * Source: HARVYX_DATABANK_ARCH.md § 4.5
 *
 * Queue consumed: hx:lusha-reveal
 * Queue emitted:  hx:notify  (after every successful reveal)
 *
 * Rules:
 *   - checkLushaCredits() before every reveal — abort job if < 10 remaining.
 *   - Reveal mobile + direct phone. Prefer mobile.
 *   - Only update phone if not already set (never overwrite existing number).
 *   - phone_source always set to 'lusha'.
 *   - Sets enriched_lusha = true, enriched_lusha_at = NOW().
 *
 * Concurrency: 3  (Lusha enforces strict per-second rate limits)
 */

import { Worker, Queue } from 'bullmq';
import { randomUUID }    from 'crypto';

import { bronzeWrite }   from '../../packages/lib/hx-bronze';
import { hxLogger }      from '../../packages/lib/hx-logger';
import type { HxQueueJob, HxWhatsAppNotification } from '../../packages/types/hx.types';
import { pool } from '../../packages/db';

// ── Config ────────────────────────────────────────────────────────────────────

const REDIS_URL      = process.env.HX_REDIS_URL    ?? 'redis://localhost:6379';
const LUSHA_API_KEY  = process.env.LUSHA_API_KEY   ?? '';
const LUSHA_BASE     = 'https://api.lusha.com';
const FETCH_TIMEOUT  = 12_000;
const CREDIT_MINIMUM = 10;           // Abort if fewer than this many credits remain
const MODULE         = 'hx-lusha-reveal.worker';

// ── Singletons ────────────────────────────────────────────────────────────────


const notifyQueue = new Queue('hx-notify', {
  connection: { url: REDIS_URL, maxRetriesPerRequest: null },
});

// ── In-process credits cache ──────────────────────────────────────────────────
// Updated after each Lusha call to avoid a separate credit-check API call.

let cachedCreditsRemaining: number = -1;   // -1 = unknown

// ── Lusha API types ───────────────────────────────────────────────────────────

interface LushaPhone {
  localizedNumber?: string;
  internationalNumber?: string;
  type?: 'mobile' | 'direct' | 'hq' | string;
}

interface LushaEmail {
  email?: string;
  type?:  'work' | 'personal' | string;
}

interface LushaContact {
  firstName?:    string;
  lastName?:     string;
  title?:        string;
  emails?:       LushaEmail[];
  phoneNumbers?: LushaPhone[];
}

interface LushaRevealResponse {
  data?: {
    contacts?: LushaContact[];
  };
  credits?: {
    used?:      number;
    remaining?: number;
  };
  error?: string;
  status?: number;
}

interface LushaUsageResponse {
  data?: {
    credits?: {
      remaining?: number;
      used?:      number;
      total?:     number;
    };
  };
}

// ── Lusha fetch helper ────────────────────────────────────────────────────────

async function lushaFetch<T>(
  path: string,
  method: 'GET' | 'POST',
  body?: Record<string, unknown>,
): Promise<T | null> {
  const controller = new AbortController();
  const timer      = setTimeout(() => controller.abort(), FETCH_TIMEOUT);
  const url        = `${LUSHA_BASE}${path}`;

  try {
    const res = await fetch(url, {
      method,
      signal:  controller.signal,
      headers: {
        'api_key':      LUSHA_API_KEY,
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (res.status === 402) {
      // Payment required — credits exhausted
      cachedCreditsRemaining = 0;
      hxLogger.warn(MODULE, 'Lusha credits exhausted (402)');
      return null;
    }

    if (res.status === 429) {
      hxLogger.warn(MODULE, 'Lusha rate-limited (429)');
      return null;
    }

    if (!res.ok) {
      hxLogger.warn(MODULE, `Lusha ${res.status}`, { path });
      return null;
    }

    return (await res.json()) as T;
  } catch (err) {
    const isTimeout = err instanceof Error && err.name === 'AbortError';
    hxLogger.warn(MODULE, isTimeout ? 'Lusha timeout' : 'Lusha fetch error', {
      err: err instanceof Error ? err.message : String(err),
    });
    return null;
  } finally {
    clearTimeout(timer);
  }
}

// ── checkLushaCredits ─────────────────────────────────────────────────────────
// Returns remaining credits. Throws if key is invalid. Returns cached value if
// a recent reveal already updated it.

async function checkLushaCredits(): Promise<number> {
  // Use cached value if we already know we're low
  if (cachedCreditsRemaining !== -1 && cachedCreditsRemaining < CREDIT_MINIMUM) {
    throw new Error(`LUSHA_CREDITS_LOW:${cachedCreditsRemaining}`);
  }

  // Hit the usage endpoint for a fresh count
  const usage = await lushaFetch<LushaUsageResponse>('/usage', 'GET');

  if (!usage) {
    // Cannot reach Lusha — be conservative, allow through with warning
    hxLogger.warn(MODULE, 'credits check unreachable, proceeding cautiously');
    return cachedCreditsRemaining === -1 ? 999 : cachedCreditsRemaining;
  }

  const remaining = usage.data?.credits?.remaining ?? -1;
  cachedCreditsRemaining = remaining;

  hxLogger.debug(MODULE, 'Lusha credits', {
    remaining,
    used:  usage.data?.credits?.used,
    total: usage.data?.credits?.total,
  });

  if (remaining !== -1 && remaining < CREDIT_MINIMUM) {
    throw new Error(`LUSHA_CREDITS_LOW:${remaining}`);
  }

  return remaining;
}

// ── DB helpers ────────────────────────────────────────────────────────────────

interface ContactRow {
  id:           string;
  first_name:   string | null;
  last_name:    string | null;
  full_name:    string | null;
  company_name: string | null;
  email_pattern: string | null;
  phone:        string | null;
  icp_score:    number;
  country:      string | null;
  vertical:     string | null;
}

async function getContact(contactId: string): Promise<ContactRow | null> {
  const { rows } = await pool.query<ContactRow>(
    `SELECT id, first_name, last_name, full_name, company_name,
            email_pattern, phone, icp_score, country, vertical
     FROM hx_contacts WHERE id = $1`,
    [contactId],
  );
  return rows[0] ?? null;
}

async function applyLushaReveal(params: {
  contactId:  string;
  phone:      string | null;
  email:      string | null;
}): Promise<void> {
  await pool.query(
    `UPDATE hx_contacts SET
       -- Only update phone if not already set (never overwrite existing number)
       phone              = CASE WHEN phone IS NULL AND $1 IS NOT NULL THEN $1 ELSE phone END,
       phone_source       = CASE WHEN phone IS NULL AND $1 IS NOT NULL THEN 'lusha' ELSE phone_source END,
       -- Update email only if not already verified
       email_pattern      = CASE WHEN email_verified = FALSE AND $2 IS NOT NULL THEN $2 ELSE email_pattern END,
       email_verified     = CASE WHEN email_verified = FALSE AND $2 IS NOT NULL THEN TRUE ELSE email_verified END,
       email_verified_at  = CASE WHEN email_verified = FALSE AND $2 IS NOT NULL THEN NOW() ELSE email_verified_at END,
       enriched_lusha     = TRUE,
       enriched_lusha_at  = NOW(),
       updated_at         = NOW()
     WHERE id = $3`,
    [params.phone, params.email, params.contactId],
  );
}

// ── Phone picker — prefer mobile, fall back to direct ────────────────────────

function pickBestPhone(phones: LushaPhone[]): string | null {
  if (!phones.length) return null;

  const mobile = phones.find(
    (p) => p.type === 'mobile' || p.type?.toLowerCase().includes('mobile'),
  );
  const direct = phones.find(
    (p) => p.type === 'direct' || p.type?.toLowerCase().includes('direct'),
  );
  const any = phones[0];

  const chosen = mobile ?? direct ?? any;
  return chosen?.internationalNumber ?? chosen?.localizedNumber ?? null;
}

function pickWorkEmail(emails: LushaEmail[]): string | null {
  if (!emails.length) return null;
  const work = emails.find((e) => e.type === 'work');
  return (work ?? emails[0])?.email ?? null;
}

// ── hx:notify job builder ─────────────────────────────────────────────────────

function buildNotifyJob(
  contact: ContactRow,
  phone: string | null,
  email: string | null,
): HxQueueJob<HxWhatsAppNotification> {
  return {
    job_id:        randomUUID(),
    job_type:      'notify_lusha_reveal',
    source_module: MODULE,
    attempts:      0,
    created_at:    new Date().toISOString(),
    payload: {
      to:          process.env.HX_OPERATOR_WHATSAPP ?? '',
      type:        'action_required',
      module:      'lusha-reveal',
      headline:    'Lusha reveal complete — prime lead ready',
      body: [
        `Name: ${contact.full_name ?? [contact.first_name, contact.last_name].filter(Boolean).join(' ')}`,
        `Company: ${contact.company_name ?? 'Unknown'}`,
        `Phone: ${phone ?? '—'}`,
        `Email: ${email ?? '—'}`,
        `ICP: ${contact.icp_score}`,
        `Vertical: ${contact.vertical ?? '—'}`,
      ].join('\n'),
      entity_name: contact.full_name ?? contact.company_name ?? undefined,
      entity_id:   contact.id,
      timestamp:   new Date().toISOString(),
    },
  };
}

// ── Worker ────────────────────────────────────────────────────────────────────

type LushaRevealPayload = { contact_id: string; icp_score: number };

const worker = new Worker<HxQueueJob<LushaRevealPayload>>(
  'hx-lusha-reveal',
  async (job) => {
    const { contact_id } = job.data.payload;

    // ── Credit gate ───────────────────────────────────────────────────────────
    await checkLushaCredits();

    const contact = await getContact(contact_id);
    if (!contact) {
      hxLogger.warn(MODULE, 'contact not found, skipping', { contact_id });
      return;
    }

    // ── Lusha reveal ──────────────────────────────────────────────────────────
    const revealBody: Record<string, unknown> = {
      firstName:   contact.first_name ?? undefined,
      lastName:    contact.last_name  ?? undefined,
      company:     contact.company_name ?? undefined,
    };

    const revealRes = await lushaFetch<LushaRevealResponse>(
      '/contacts',
      'POST',
      revealBody,
    );

    // Update cached credits from response
    if (revealRes?.credits?.remaining !== undefined) {
      cachedCreditsRemaining = revealRes.credits.remaining;
    }

    const lushaContact = revealRes?.data?.contacts?.[0] ?? null;
    const phone        = lushaContact ? pickBestPhone(lushaContact.phoneNumbers ?? []) : null;
    const email        = lushaContact ? pickWorkEmail(lushaContact.emails ?? [])       : null;

    // ── Apply to hx_contacts ──────────────────────────────────────────────────
    await applyLushaReveal({ contactId: contact_id, phone, email });

    // ── Push to hx:notify ─────────────────────────────────────────────────────
    const notifyJob = buildNotifyJob(contact, phone, email);

    await notifyQueue.add('notify_lusha_reveal', notifyJob, {
      attempts: 3,
      backoff:  { type: 'exponential', delay: 5_000 },
      removeOnComplete: { count: 1_000 },
      removeOnFail:     { count: 500 },
    });

    // ── Bronze event ──────────────────────────────────────────────────────────
    await bronzeWrite({
      event_type:    'contact.lusha_revealed',
      source_module: MODULE,
      entity_id:     contact_id,
      entity_type:   'hx_contact',
      payload: {
        matched:          Boolean(lushaContact),
        has_phone:        Boolean(phone),
        has_email:        Boolean(email),
        credits_remaining: cachedCreditsRemaining,
        icp_score:        contact.icp_score,
        job_id:           job.id,
      },
    });

    hxLogger.info(MODULE, 'Lusha reveal complete', {
      contact_id,
      matched:   Boolean(lushaContact),
      has_phone: Boolean(phone),
      has_email: Boolean(email),
      credits:   cachedCreditsRemaining,
    });
  },
  {
    connection:  { url: REDIS_URL, maxRetriesPerRequest: null },
    concurrency: 3,
  },
);

worker.on('failed', (job, err) => {
  const isCreditsLow = err.message.startsWith('LUSHA_CREDITS_LOW');
  hxLogger.error(MODULE, isCreditsLow ? 'credits low — job deferred' : 'job failed', {
    jobId:   job?.id,
    attempt: job?.attemptsMade,
    err:     err.message,
  });
});

worker.on('error', (err) => {
  hxLogger.error(MODULE, 'worker error', { err: err.message });
});

hxLogger.info(MODULE, 'worker started', {
  concurrency:     3,
  credit_minimum:  CREDIT_MINIMUM,
  queue:           'hx-lusha-reveal',
});

export { worker };
