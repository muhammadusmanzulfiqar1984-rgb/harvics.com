/**
 * hx-csv-backfill.ts — one-time backfill of CSV contacts into email verify
 *
 * Pushes csv contacts (unverified, with email_pattern) onto hx-email-verify.
 *
 * Run: npx tsx scripts/hx-csv-backfill.ts
 */

import { config } from 'dotenv';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';

import { Pool } from 'pg';
import { Queue } from 'bullmq';

import { hxLogger } from '../packages/lib/hx-logger';
import type { HxQueueJob } from '../packages/types/hx.types';

const ROOT = join(__dirname, '..');
config({ path: join(ROOT, '.env.hx') });

const REDIS_URL = process.env.HX_REDIS_URL    ?? 'redis://localhost:6379';
const DB_URL_RAW = process.env.HX_DATABASE_URL ?? '';
/** Prefer transaction pooler (6543) to avoid session-mode max clients. */
const DB_URL = DB_URL_RAW.replace(/:5432(\/|\?|$)/, ':6543$1');
const MODULE = 'hx-csv-backfill';

const BULK_SIZE    = 10;
const PUSHES_PER_S = 20;
const BULK_DELAY   = Math.ceil((BULK_SIZE / PUSHES_PER_S) * 1_000);

const pool = new Pool({
  connectionString: DB_URL,
  ssl: { rejectUnauthorized: false },
  max: 1,
});

const emailVerifyQueue = new Queue('hx-email-verify', {
  connection: {
    url: REDIS_URL,
    maxRetriesPerRequest: null,
    retryStrategy: (times: number) => Math.min(200 * 2 ** (times - 1), 8_000),
  },
});

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

interface CsvRow {
  id: string;
  email_pattern: string;
}

async function main(): Promise<void> {
  if (!DB_URL) {
    console.error('HX_DATABASE_URL missing in .env.hx');
    process.exit(1);
  }

  hxLogger.info(MODULE, 'loading csv contacts for backfill');

  let rows: CsvRow[] = [];
  for (let attempt = 1; attempt <= 5; attempt++) {
    try {
      const res = await pool.query<CsvRow>(
        `SELECT id, email_pattern
         FROM hx_contacts
         WHERE source = 'csv'
           AND email_verified = false
           AND email_pattern IS NOT NULL`,
      );
      rows = res.rows;
      break;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      hxLogger.warn(MODULE, 'db query retry', { attempt, err: msg });
      if (attempt === 5) throw err;
      await delay(2_000 * attempt);
    }
  }

  hxLogger.info(MODULE, 'contacts loaded', { total: rows.length });

  let queued = 0;
  let errors = 0;

  for (let i = 0; i < rows.length; i += BULK_SIZE) {
    const chunk = rows.slice(i, i + BULK_SIZE);

    try {
      await emailVerifyQueue.addBulk(
        chunk.map((row) => {
          const job: HxQueueJob<{ contact_id: string; candidates: string[] }> = {
            job_id:        randomUUID(),
            job_type:      'email_verify',
            source_module: MODULE,
            attempts:      0,
            created_at:    new Date().toISOString(),
            payload: {
              contact_id: row.id,
              candidates: [row.email_pattern],
            },
          };
          return {
            name: 'email_verify',
            data: job,
            opts: {
              attempts: 3,
              backoff: { type: 'exponential', delay: 5_000 },
              removeOnComplete: { count: 2_000 },
              removeOnFail:     { count: 500 },
            },
          };
        }),
      );
      queued += chunk.length;
    } catch (err) {
      errors += chunk.length;
      hxLogger.error(MODULE, 'bulk push failed', {
        err: err instanceof Error ? err.message : String(err),
        offset: i,
      });
    }

    if (queued > 0 && queued % 500 === 0) {
      hxLogger.info(MODULE, 'progress', { queued, errors, total: rows.length });
    }

    if (i + BULK_SIZE < rows.length) {
      await delay(BULK_DELAY);
    }
  }

  hxLogger.info(MODULE, 'backfill complete', {
    total: rows.length,
    queued,
    errors,
  });

  await emailVerifyQueue.close();
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
