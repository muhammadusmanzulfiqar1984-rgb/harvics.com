/**
 * hx-apollo-enrich.worker.ts — Apollo.io people enrichment
 * Source: HARVYX_DATABANK_ARCH.md § 4.4
 *
 * Queue consumed: hx:apollo-enrich
 * Queue emitted:  hx:lusha-reveal  (when icp_score >= 85)
 *
 * Batch model:
 *   - Jobs are dequeued individually by BullMQ (concurrency 5).
 *   - Up to 10 contacts are accumulated per batch flush then sent to
 *     Apollo bulk_people_enrichment. After each flush, credits are
 *     re-checked before continuing.
 *   - If credits < CREDIT_RESERVE, the job is rejected with a delay
 *     so BullMQ will retry after backoff.
 *
 * Concurrency: 5
 */

import { Worker, Queue, Job } from 'bullmq';
import { randomUUID }         from 'crypto';

import { bronzeWrite }   from '../../packages/lib/hx-bronze';
import { hxLogger }      from '../../packages/lib/hx-logger';
import type { HxQueueJob } from '../../packages/types/hx.types';
import { pool } from '../../packages/db';

// ── Config ────────────────────────────────────────────────────────────────────

const REDIS_URL      = process.env.HX_REDIS_URL    ?? 'redis://localhost:6379';
const APOLLO_API_KEY = process.env.APOLLO_API_KEY  ?? '';
const APOLLO_BASE    = 'https://api.apollo.io/v1';
const FETCH_TIMEOUT  = 15_000;
const BATCH_SIZE     = 10;           // Apollo's documented match batch limit
const CREDIT_RESERVE = 20;          // Stop enriching if fewer credits remain
const MODULE         = 'hx-apollo-enrich.worker';

// ── Singletons ────────────────────────────────────────────────────────────────


const lushaQueue = new Queue('hx-lusha-reveal', {
  connection: { url: REDIS_URL, maxRetriesPerRequest: null },
});

// ── Apollo types ──────────────────────────────────────────────────────────────

interface ApolloHealthResponse {
  is_logged_in?:    boolean;
  // Apollo includes email_credits_used / credits_used_current_month in some plans
  credits_used_current_month?: number;
  credits_limit_monthly?:      number;
}

interface ApolloPersonMatch {
  first_name?:         string;
  last_name?:          string;
  name?:               string;
  email?:              string;
  linkedin_url?:       string;
  title?:              string;
  organization_name?:  string;
  organization?:       { primary_domain?: string };
}

interface ApolloMatchRequest {
  first_name?:         string;
  last_name?:          string;
  name?:               string;
  organization_name?:  string;
  domain?:             string;
}

interface ApolloMatchResponse {
  person?:  ApolloPersonMatch | null;
  matches?: ApolloPersonMatch[];
  credits_left?: number;
}

interface ApolloBulkMatchRequest {
  details: ApolloMatchRequest[];
}

interface ApolloBulkMatchResponse {
  matches?:      ApolloPersonMatch[];
  credits_left?: number;
  error_code?:   string;
}

// ── DB types ──────────────────────────────────────────────────────────────────

interface ContactRow {
  id:           string;
  source:       string;
  first_name:   string | null;
  last_name:    string | null;
  full_name:    string | null;
  company_name: string | null;
  company_domain: string | null;
  icp_score:    number;
  email_verified: boolean;
}

// ── Apollo API helpers ────────────────────────────────────────────────────────

async function apolloFetch<T>(
  path: string,
  method: 'GET' | 'POST',
  body?: Record<string, unknown>,
): Promise<T | null> {
  const controller = new AbortController();
  const timer      = setTimeout(() => controller.abort(), FETCH_TIMEOUT);
  const url        = `${APOLLO_BASE}${path}`;

  try {
    const res = await fetch(url, {
      method,
      signal:  controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'X-Api-Key':    APOLLO_API_KEY,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (res.status === 429) {
      hxLogger.warn(MODULE, 'Apollo rate-limited (429)', { path });
      return null;
    }

    if (!res.ok) {
      hxLogger.warn(MODULE, `Apollo ${res.status}`, { path });
      return null;
    }

    return (await res.json()) as T;
  } catch (err) {
    const isTimeout = err instanceof Error && err.name === 'AbortError';
    hxLogger.warn(MODULE, isTimeout ? 'Apollo timeout' : 'Apollo fetch error', {
      path,
      err: err instanceof Error ? err.message : String(err),
    });
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * checkApolloCredits
 * Calls Apollo /auth/health to confirm the API key is active and credits
 * remain. Returns remaining credits estimate, or -1 if unknown (allow through).
 * Throws if the key is invalid so BullMQ can dead-letter the job.
 */
async function checkApolloCredits(): Promise<number> {
  const health = await apolloFetch<ApolloHealthResponse>('/auth/health', 'GET');

  if (!health) {
    // Network error — be conservative, let current batch continue
    hxLogger.warn(MODULE, 'credits check failed (network), continuing');
    return -1;
  }

  if (health.is_logged_in === false) {
    throw new Error('APOLLO_API_KEY is invalid or revoked');
  }

  // If the plan exposes monthly limits, derive remaining
  if (
    typeof health.credits_limit_monthly === 'number' &&
    typeof health.credits_used_current_month === 'number'
  ) {
    const remaining = health.credits_limit_monthly - health.credits_used_current_month;
    hxLogger.debug(MODULE, 'Apollo credits', {
      used:      health.credits_used_current_month,
      limit:     health.credits_limit_monthly,
      remaining,
    });
    return remaining;
  }

  // Plan does not expose credits — allow through
  return -1;
}

// ── DB helpers ────────────────────────────────────────────────────────────────

async function getContacts(contactIds: string[]): Promise<ContactRow[]> {
  if (!contactIds.length) return [];
  const { rows } = await pool.query<ContactRow>(
    `SELECT id, source, first_name, last_name, full_name,
            company_name, company_domain, icp_score, email_verified
     FROM hx_contacts
     WHERE id = ANY($1::uuid[])`,
    [contactIds],
  );
  return rows;
}

async function applyEnrichment(params: {
  contactId:   string;
  email:       string | null;
  linkedinUrl: string | null;
  title:       string | null;
}): Promise<void> {
  await pool.query(
    `UPDATE hx_contacts SET
       email_pattern      = COALESCE($1, email_pattern),
       email_verified     = CASE WHEN $1 IS NOT NULL THEN TRUE ELSE email_verified END,
       email_verified_at  = CASE WHEN $1 IS NOT NULL THEN NOW() ELSE email_verified_at END,
       linkedin_url       = COALESCE($2, linkedin_url),
       title              = COALESCE($3, title),
       enriched_apollo    = TRUE,
       enriched_apollo_at = NOW(),
       updated_at         = NOW()
     WHERE id = $4`,
    [params.email, params.linkedinUrl, params.title, params.contactId],
  );
}

// ── Batch accumulator ─────────────────────────────────────────────────────────
// Accumulates jobs until BATCH_SIZE or flush is called.

interface PendingJob {
  job:       Job<HxQueueJob<ApolloEnrichPayload>>;
  contact:   ContactRow;
  resolve:   () => void;
  reject:    (err: Error) => void;
}

let pendingBatch: PendingJob[] = [];
let flushTimer: ReturnType<typeof setTimeout> | null = null;

async function flushBatch(): Promise<void> {
  if (!pendingBatch.length) return;

  const batch     = pendingBatch.splice(0, BATCH_SIZE);
  flushTimer      = null;

  hxLogger.info(MODULE, `flushing batch of ${batch.length}`);

  // ── Credit check ──────────────────────────────────────────────────────────
  let credits: number;
  try {
    credits = await checkApolloCredits();
  } catch (err) {
    // Invalid key — reject all with non-retryable error
    for (const item of batch) {
      item.reject(err instanceof Error ? err : new Error(String(err)));
    }
    return;
  }

  if (credits !== -1 && credits < CREDIT_RESERVE) {
    hxLogger.warn(MODULE, 'Apollo credits low, requeueing batch', { credits });
    for (const item of batch) {
      item.reject(new Error(`APOLLO_CREDITS_LOW:${credits}`));
    }
    return;
  }

  // ── Build Apollo bulk match request ───────────────────────────────────────
  const details: ApolloMatchRequest[] = batch.map(({ contact: c }) => ({
    first_name:        c.first_name ?? undefined,
    last_name:         c.last_name  ?? undefined,
    name:              c.full_name  ?? undefined,
    organization_name: c.company_name ?? undefined,
    domain:            c.company_domain ?? undefined,
  }));

  const bulkRes = await apolloFetch<ApolloBulkMatchResponse>(
    '/people/bulk_match',
    'POST',
    { details } satisfies ApolloBulkMatchRequest,
  );

  // Fallback: individual people/match if bulk endpoint unavailable
  const matchResults: (ApolloPersonMatch | null)[] = bulkRes?.matches
    ? bulkRes.matches
    : await Promise.all(
        batch.map(async ({ contact: c }) => {
          const res = await apolloFetch<ApolloMatchResponse>('/people/match', 'POST', {
            first_name:        c.first_name   ?? undefined,
            last_name:         c.last_name    ?? undefined,
            organization_name: c.company_name ?? undefined,
            domain:            c.company_domain ?? undefined,
            reveal_personal_emails: false,
          });
          return res?.person ?? null;
        }),
      );

  // ── Apply results ─────────────────────────────────────────────────────────
  for (let i = 0; i < batch.length; i++) {
    const { job, contact, resolve, reject } = batch[i];
    const match = matchResults[i] ?? null;

    try {
      await applyEnrichment({
        contactId:   contact.id,
        email:       match?.email        ?? null,
        linkedinUrl: match?.linkedin_url ?? null,
        title:       match?.title        ?? null,
      });

      // High-score contacts → Lusha reveal for phone number
      if (contact.icp_score >= 85) {
        const lushaJob: HxQueueJob<{ contact_id: string; icp_score: number }> = {
          job_id:        randomUUID(),
          job_type:      'lusha_reveal',
          source_module: MODULE,
          attempts:      0,
          created_at:    new Date().toISOString(),
          payload:       { contact_id: contact.id, icp_score: contact.icp_score },
        };

        await lushaQueue.add('lusha_reveal', lushaJob, {
          priority: 1,    // highest — these are prime leads
          attempts: 3,
          backoff:  { type: 'exponential', delay: 10_000 },
          removeOnComplete: { count: 2_000 },
          removeOnFail:     { count: 500 },
        });
      }

      await bronzeWrite({
        event_type:    'contact.apollo_enriched',
        source_module: MODULE,
        entity_id:     contact.id,
        entity_type:   'hx_contact',
        payload: {
          matched:      Boolean(match),
          has_email:    Boolean(match?.email),
          has_linkedin: Boolean(match?.linkedin_url),
          icp_score:    contact.icp_score,
          lusha_queued: contact.icp_score >= 85,
          job_id:       job.id,
        },
      });

      hxLogger.info(MODULE, 'contact enriched', {
        contact_id:  contact.id,
        matched:     Boolean(match),
        icp_score:   contact.icp_score,
        lusha_queued: contact.icp_score >= 85,
      });

      resolve();
    } catch (err) {
      reject(err instanceof Error ? err : new Error(String(err)));
    }
  }
}

function scheduleFlush(): void {
  if (flushTimer) return;
  // Auto-flush after 2 s if batch doesn't fill to BATCH_SIZE
  flushTimer = setTimeout(() => {
    flushBatch().catch((err) =>
      hxLogger.error(MODULE, 'scheduled flush error', { err }),
    );
  }, 2_000);
}

// ── Worker ────────────────────────────────────────────────────────────────────

type ApolloEnrichPayload = {
  contact_id: string;
  priority:   boolean;
  icp_score:  number;
};

const worker = new Worker<HxQueueJob<ApolloEnrichPayload>>(
  'hx-apollo-enrich',
  async (job) => {
    const { contact_id } = job.data.payload;

    const [contact] = await getContacts([contact_id]);
    if (!contact) {
      hxLogger.warn(MODULE, 'contact not found, skipping', { contact_id });
      return;
    }

    // Accumulate into batch, resolve when flush completes for this item
    await new Promise<void>((resolve, reject) => {
      pendingBatch.push({ job, contact, resolve, reject });

      if (pendingBatch.length >= BATCH_SIZE) {
        // Batch full — flush immediately
        if (flushTimer) { clearTimeout(flushTimer); flushTimer = null; }
        flushBatch().catch((err) =>
          hxLogger.error(MODULE, 'immediate flush error', { err }),
        );
      } else {
        scheduleFlush();
      }
    });
  },
  {
    connection:  { url: REDIS_URL, maxRetriesPerRequest: null },
    concurrency: 5,
  },
);

worker.on('failed', (job, err) => {
  const isCreditsLow = err.message.startsWith('APOLLO_CREDITS_LOW');
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
  concurrency: 5,
  batch_size:  BATCH_SIZE,
  queue:       'hx-apollo-enrich',
});

export { worker };
