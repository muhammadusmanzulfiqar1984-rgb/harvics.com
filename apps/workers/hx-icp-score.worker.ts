/**
 * hx-icp-score.worker.ts — ICP scoring + threshold gate
 * Source: HARVYX_DATABANK_ARCH.md § 4.3
 *
 * Queue consumed: hx:icp-score
 * Queue emitted:  hx:apollo-enrich  (score 70-84: standard priority)
 *                 hx:apollo-enrich  (score 85-100: priority flag set)
 *
 * Threshold gates:
 *   score = 0 / < 50  → DELETE from hx_contacts
 *   score 50–69        → in_nurture_pool = true, stop pipeline
 *   score 70–84        → push hx:apollo-enrich (standard)
 *   score 85–100       → push hx:apollo-enrich (priority = true)
 *
 * Concurrency: 50 (pure CPU; no SMTP, no external calls)
 */

import { Worker, Queue } from 'bullmq';
import { randomUUID }    from 'crypto';

import { bronzeWrite }   from '../../packages/lib/hx-bronze';
import { hxLogger }      from '../../packages/lib/hx-logger';
import { scoreICP }      from '../../packages/lib/hx-icp-scorer';
import type { HxQueueJob, HxSource } from '../../packages/types/hx.types';
import { pool } from '../../packages/db';

// ── Config ────────────────────────────────────────────────────────────────────

const REDIS_URL = process.env.HX_REDIS_URL    ?? 'redis://localhost:6379';
const MODULE    = 'hx-icp-score.worker';

// ── Singletons ────────────────────────────────────────────────────────────────


const apolloEnrichQueue = new Queue('hx-apollo-enrich', {
  connection: { url: REDIS_URL, maxRetriesPerRequest: null },
});

// ── DB helpers ────────────────────────────────────────────────────────────────

interface ContactRow {
  id:             string;
  source:         HxSource;
  country:        string | null;
  vertical:       string | null;
  title:          string | null;
  email_verified: boolean;
  phone:          string | null;
  linkedin_url:   string | null;
}

async function getContact(contactId: string): Promise<ContactRow | null> {
  const { rows } = await pool.query<ContactRow>(
    `SELECT id, source, country, vertical, title,
            email_verified, phone, linkedin_url
     FROM hx_contacts WHERE id = $1`,
    [contactId],
  );
  return rows[0] ?? null;
}

async function persistScore(contactId: string, score: number): Promise<void> {
  await pool.query(
    `UPDATE hx_contacts
     SET icp_score      = $1,
         icp_scored_at  = NOW(),
         updated_at     = NOW()
     WHERE id = $2`,
    [score, contactId],
  );
}

async function setNurture(contactId: string): Promise<void> {
  await pool.query(
    `UPDATE hx_contacts
     SET in_nurture_pool = TRUE,
         updated_at      = NOW()
     WHERE id = $1`,
    [contactId],
  );
}

async function deleteContact(contactId: string): Promise<void> {
  await pool.query(`DELETE FROM hx_contacts WHERE id = $1`, [contactId]);
}

// ── Worker ────────────────────────────────────────────────────────────────────

type IcpPayload = { contact_id: string };

const worker = new Worker<HxQueueJob<IcpPayload>>(
  'hx-icp-score',
  async (job) => {
    const { contact_id } = job.data.payload;

    const contact = await getContact(contact_id);
    if (!contact) {
      hxLogger.warn(MODULE, 'contact not found, skipping', { contact_id });
      return;
    }

    // Pure function — no I/O
    const score = scoreICP({
      country:    contact.country,
      vertical:   contact.vertical,
      title:      contact.title,
      hasEmail:   contact.email_verified,
      hasPhone:   Boolean(contact.phone),
      hasLinkedIn: Boolean(contact.linkedin_url),
      source:     contact.source,
    });

    // ── Threshold gates ───────────────────────────────────────────────────────

    if (score === 0) {
      // Below 50 — discard
      await deleteContact(contact_id);

      await bronzeWrite({
        event_type:    'contact.icp_scored',
        source_module: MODULE,
        entity_id:     contact_id,
        entity_type:   'hx_contact',
        payload: { score, action: 'deleted', source: contact.source },
      });

      hxLogger.debug(MODULE, 'contact discarded', { contact_id, score });
      return;
    }

    // Persist score for surviving contacts
    await persistScore(contact_id, score);

    if (score >= 50 && score <= 69) {
      // Nurture pool — no outreach yet
      await setNurture(contact_id);

      await bronzeWrite({
        event_type:    'contact.icp_scored',
        source_module: MODULE,
        entity_id:     contact_id,
        entity_type:   'hx_contact',
        payload: { score, action: 'nurture', source: contact.source },
      });

      hxLogger.info(MODULE, 'contact → nurture', { contact_id, score });
      return;
    }

    // score 70-100 → Apollo enrichment
    const isPriority = score >= 85;

    const enrichJob: HxQueueJob<{
      contact_id: string;
      priority:   boolean;
      icp_score:  number;
    }> = {
      job_id:        randomUUID(),
      job_type:      'apollo_enrich',
      source_module: MODULE,
      attempts:      0,
      created_at:    new Date().toISOString(),
      payload: {
        contact_id,
        priority:  isPriority,
        icp_score: score,
      },
    };

    await apolloEnrichQueue.add('apollo_enrich', enrichJob, {
      priority: isPriority ? 1 : 10,   // BullMQ: lower number = higher priority
      attempts: 3,
      backoff:  { type: 'exponential', delay: 8_000 },
      removeOnComplete: { count: 2_000 },
      removeOnFail:     { count: 500 },
    });

    await bronzeWrite({
      event_type:    'contact.icp_scored',
      source_module: MODULE,
      entity_id:     contact_id,
      entity_type:   'hx_contact',
      payload: {
        score,
        action:      'apollo_enrich',
        priority:    isPriority,
        source:      contact.source,
      },
    });

    hxLogger.info(MODULE, `contact → apollo-enrich`, {
      contact_id,
      score,
      priority: isPriority,
    });
  },
  {
    connection:  { url: REDIS_URL, maxRetriesPerRequest: null },
    concurrency: 50,
  },
);

worker.on('failed', (job, err) => {
  hxLogger.error(MODULE, 'job failed', {
    jobId:   job?.id,
    attempt: job?.attemptsMade,
    err:     err.message,
  });
});

worker.on('error', (err) => {
  hxLogger.error(MODULE, 'worker error', { err: err.message });
});

hxLogger.info(MODULE, 'worker started', { concurrency: 50, queue: 'hx-icp-score' });

export { worker };
