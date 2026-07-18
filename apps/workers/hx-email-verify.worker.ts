/**
 * hx-email-verify.worker.ts — SMTP email verification
 * Source: HARVYX_DATABANK_ARCH.md § 4.2
 *
 * Queue consumed: hx:email-verify
 * Queue emitted:  hx:icp-score
 *
 * Concurrency: 10 (SMTP is the bottleneck; keep low to avoid IP bans)
 */

import { Worker, Queue } from 'bullmq';
import { randomUUID }    from 'crypto';

import { bronzeWrite }   from '../../packages/lib/hx-bronze';
import { hxLogger }      from '../../packages/lib/hx-logger';
import { smtpVerify }    from '../../packages/lib/hx-email-verifier';
import type { HxQueueJob } from '../../packages/types/hx.types';
import { pool } from '../../packages/db';

// ── Config ────────────────────────────────────────────────────────────────────

const REDIS_URL = process.env.HX_REDIS_URL    ?? 'redis://localhost:6379';
const MODULE    = 'hx-email-verify.worker';

// ── Singletons ────────────────────────────────────────────────────────────────


const icpScoreQueue = new Queue('hx-icp-score', {
  connection: { url: REDIS_URL, maxRetriesPerRequest: null },
});

// ── DB helpers ────────────────────────────────────────────────────────────────

interface ContactRow {
  id:           string;
  source:       string;
  first_name:   string | null;
  last_name:    string | null;
  company_name: string | null;
  country:      string | null;
  vertical:     string | null;
}

async function getContact(contactId: string): Promise<ContactRow | null> {
  const { rows } = await pool.query<ContactRow>(
    `SELECT id, source, first_name, last_name, company_name, country, vertical
     FROM hx_contacts WHERE id = $1`,
    [contactId],
  );
  return rows[0] ?? null;
}

async function writeEmailVerification(params: {
  contactId:    string;
  email:        string | null;
  verified:     boolean;
  candidates:   string[];
}): Promise<void> {
  const emailCandidate = params.email ?? params.candidates[0] ?? '';
  await pool.query(
    `INSERT INTO hx_email_verifications
       (id, contact_id, email_candidate, mx_host, smtp_response_code, verified, verified_at)
     VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6)`,
    [
      params.contactId,
      emailCandidate,
      null,
      null,
      params.verified,
      new Date().toISOString(),
    ],
  );
}

async function markContactVerified(
  contactId: string,
  email: string,
): Promise<void> {
  await pool.query(
    `UPDATE hx_contacts
     SET email_pattern      = $1,
         email_verified     = TRUE,
         email_verified_at  = NOW(),
         updated_at         = NOW()
     WHERE id = $2`,
    [email, contactId],
  );
}

// ── Worker ────────────────────────────────────────────────────────────────────

type VerifyPayload = { contact_id: string; candidates: string[] };

const worker = new Worker<HxQueueJob<VerifyPayload>>(
  'hx-email-verify',
  async (job) => {
    const { contact_id, candidates } = job.data.payload;

    const contact = await getContact(contact_id);
    if (!contact) {
      hxLogger.warn(MODULE, 'contact not found, skipping', { contact_id });
      return;
    }

    // Run SMTP handshake against all candidates
    const verifiedEmail = await smtpVerify(candidates);
    const isVerified    = Boolean(verifiedEmail);

    // Persist result to hx_email_verifications
    await writeEmailVerification({
      contactId:  contact_id,
      email:      verifiedEmail,
      verified:   isVerified,
      candidates,
    });

    // Update hx_contacts if verified
    if (verifiedEmail) {
      await markContactVerified(contact_id, verifiedEmail);
    }

    // Push to hx:icp-score regardless of verification outcome
    const icpJob: HxQueueJob<{ contact_id: string }> = {
      job_id:        randomUUID(),
      job_type:      'icp_score',
      source_module: MODULE,
      attempts:      0,
      created_at:    new Date().toISOString(),
      payload:       { contact_id },
    };

    await icpScoreQueue.add('icp_score', icpJob, {
      attempts: 3,
      removeOnComplete: { count: 2_000 },
      removeOnFail:     { count: 500 },
    });

    await bronzeWrite({
      event_type:    'contact.email_verified',
      source_module: MODULE,
      entity_id:     contact_id,
      entity_type:   'hx_contact',
      payload: {
        verified:       isVerified,
        verified_email: verifiedEmail ?? null,
        candidates_tried: candidates.length,
      },
    });

    hxLogger.info(MODULE, 'email verify complete', {
      contact_id,
      verified: isVerified,
      email:    verifiedEmail ?? 'none',
    });
  },
  {
    connection:  { url: REDIS_URL, maxRetriesPerRequest: null },
    concurrency: 10,
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

hxLogger.info(MODULE, 'worker started', { concurrency: 10, queue: 'hx-email-verify' });

export { worker };
