/**
 * hx-r2-requeue.ts — recover Companies House records stuck in R2
 *
 * Lists companies-house/ objects in R2, pushes hx-scrape jobs in bulk.
 * No Redis reads — local Set tracks processed keys; only queue writes.
 *
 * Run: npx tsx scripts/hx-r2-requeue.ts
 */

import { config } from 'dotenv';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';

import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { Queue } from 'bullmq';

import { hxLogger } from '../packages/lib/hx-logger';
import type { HxQueueJob } from '../packages/types/hx.types';

const ROOT = join(__dirname, '..');
config({ path: join(ROOT, '.env.hx') });

const R2_ENDPOINT = process.env.HX_R2_ENDPOINT          ?? '';
const R2_BUCKET   = process.env.HX_R2_BUCKET            ?? 'harvyx-raw';
const R2_KEY_ID   = process.env.HX_R2_ACCESS_KEY_ID     ?? '';
const R2_SECRET   = process.env.HX_R2_SECRET_ACCESS_KEY ?? '';
const REDIS_URL   = process.env.HX_REDIS_URL            ?? 'redis://localhost:6379';

const PREFIX    = 'companies-house/';
const BULK_SIZE = 50;
const MODULE    = 'hx-r2-requeue';

const r2 = new S3Client({
  region: 'auto',
  endpoint: R2_ENDPOINT,
  credentials: { accessKeyId: R2_KEY_ID, secretAccessKey: R2_SECRET },
});

const scrapeQueue = new Queue('hx-scrape', {
  connection: {
    url: REDIS_URL,
    maxRetriesPerRequest: null,
    retryStrategy: (times: number) => Math.min(200 * 2 ** (times - 1), 8_000),
  },
});

/** companies-house/{vertical}/{company_number}/{ts}.json */
function parseKey(key: string): { vertical: string; company_number: string } | null {
  const parts = key.split('/');
  if (parts.length < 4 || !key.endsWith('.json')) return null;
  const vertical = parts[1];
  const company_number = parts[2];
  if (!vertical || !company_number) return null;
  return { vertical, company_number };
}

function buildJob(key: string, vertical: string, company_number: string): HxQueueJob<{
  source: string;
  r2_key: string;
  company_number: string;
  company_name: string;
  vertical: string;
}> {
  return {
    job_id:        randomUUID(),
    job_type:      'companies_house_parse',
    source_module: MODULE,
    attempts:      0,
    created_at:    new Date().toISOString(),
    payload: {
      source:         'companies_house',
      r2_key:         key,
      company_number,
      company_name:   '',
      vertical,
    },
  };
}

async function listAllKeys(): Promise<string[]> {
  const keys: string[] = [];
  let token: string | undefined;

  do {
    const res = await r2.send(new ListObjectsV2Command({
      Bucket: R2_BUCKET,
      Prefix: PREFIX,
      ContinuationToken: token,
    }));

    for (const obj of res.Contents ?? []) {
      if (obj.Key?.endsWith('.json')) keys.push(obj.Key);
    }
    token = res.IsTruncated ? res.NextContinuationToken : undefined;
  } while (token);

  return keys;
}

async function main(): Promise<void> {
  if (!R2_ENDPOINT || !R2_KEY_ID) {
    console.error('R2 credentials missing — set HX_R2_* in .env.hx');
    process.exit(1);
  }

  hxLogger.info(MODULE, 'listing R2 objects', { prefix: PREFIX, bucket: R2_BUCKET });
  const keys = await listAllKeys();
  hxLogger.info(MODULE, 'found objects', { total: keys.length });

  const processed = new Set<string>();
  let queued = 0;
  let skipped = 0;
  let errors = 0;

  const pending: Array<ReturnType<typeof buildJob>> = [];

  for (const key of keys) {
    if (processed.has(key)) {
      skipped++;
      continue;
    }

    const parsed = parseKey(key);
    if (!parsed) {
      errors++;
      continue;
    }

    processed.add(key);
    pending.push(buildJob(key, parsed.vertical, parsed.company_number));
  }

  hxLogger.info(MODULE, 'ready to requeue', {
    pending: pending.length,
    skipped,
    errors,
  });

  for (let i = 0; i < pending.length; i += BULK_SIZE) {
    const chunk = pending.slice(i, i + BULK_SIZE);

    try {
      await scrapeQueue.addBulk(
        chunk.map((job) => ({
          name: 'companies_house_parse',
          data: job,
          opts: {
            attempts: 3,
            backoff: { type: 'exponential', delay: 5_000 },
            removeOnComplete: { count: 1_000 },
            removeOnFail:     { count: 500 },
          },
        })),
      );
      queued += chunk.length;
    } catch (err) {
      errors += chunk.length;
      hxLogger.error(MODULE, 'bulk requeue failed', {
        err: err instanceof Error ? err.message : String(err),
        offset: i,
      });
    }

    if (queued > 0 && queued % 500 === 0) {
      hxLogger.info(MODULE, 'progress', { queued, skipped, errors, total: keys.length });
    }
  }

  hxLogger.info(MODULE, 'requeue complete', {
    total: keys.length,
    queued,
    skipped,
    errors,
  });

  await scrapeQueue.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
