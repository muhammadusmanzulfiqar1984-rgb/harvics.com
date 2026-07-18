/**
 * hx-handelsregister.scraper.ts — German Handelsregister HTML scraper
 * Source: HARVYX_DATABANK_ARCH.md § 3.4
 *
 * Scrapes handelsregister.de search results for textile/apparel terms.
 * Extracts company name + location. Writes R2, pushes hx-scrape queue.
 * bronzeWrite on completion. 2 s delay between requests.
 */

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { Queue }                       from 'bullmq';
import { Pool }                        from 'pg';
import { randomUUID, createHash }      from 'crypto';

import { bronzeWrite }     from '../../../packages/lib/hx-bronze';
import { hxLogger }        from '../../../packages/lib/hx-logger';
import type { HxQueueJob } from '../../../packages/types/hx.types';

// ── Config ────────────────────────────────────────────────────────────────────

const SEARCH_BASE      = 'https://www.handelsregister.de/rp_web/sucheergebnis.xhtml';
const R2_ENDPOINT      = process.env.HX_R2_ENDPOINT          ?? '';
const R2_BUCKET        = process.env.HX_R2_BUCKET            ?? 'harvyx-raw';
const R2_KEY_ID        = process.env.HX_R2_ACCESS_KEY_ID     ?? '';
const R2_SECRET        = process.env.HX_R2_SECRET_ACCESS_KEY ?? '';
const REDIS_URL        = process.env.HX_REDIS_URL            ?? 'redis://localhost:6379';
const DB_URL           = process.env.HX_DATABASE_URL         ?? '';

const SEARCH_TERMS     = ['Textil', 'Bekleidung', 'Denim', 'Mode', 'Stoff'];
const CALL_DELAY_MS    = 2_000;
const FETCH_TIMEOUT_MS = 12_000;
const MODULE           = 'hx-handelsregister.scraper';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface HandelsregisterRecord {
  company_name: string;
  location:     string;
  search_term:  string;
}

interface RunStats {
  scraped:  number;
  ingested: number;
  rejected: number;
  errors:   number;
}

// ── Singletons ────────────────────────────────────────────────────────────────

const r2 = new S3Client({
  region: 'auto',
  endpoint: R2_ENDPOINT,
  credentials: { accessKeyId: R2_KEY_ID, secretAccessKey: R2_SECRET },
});

const scrapeQueue = new Queue('hx-scrape', { connection: { url: REDIS_URL } });
const pool        = new Pool({ connectionString: DB_URL, max: 3 });

// ── Utilities ─────────────────────────────────────────────────────────────────

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function sourceId(company: string, location: string): string {
  const basis = `${company}|${location}`.toLowerCase();
  return createHash('sha1').update(basis).digest('hex').slice(0, 24);
}

async function fetchHtml(url: string): Promise<string | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'HarvyX-Scraper/1.0 (+https://harvics.com)',
        Accept: 'text/html,application/xhtml+xml',
      },
    });
    if (!res.ok) return null;
    return await res.text();
  } catch (err) {
    hxLogger.warn(MODULE, 'fetch failed', {
      url,
      err: err instanceof Error ? err.message : String(err),
    });
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/** Parse company + location pairs from Handelsregister result HTML. */
export function parseHandelsregisterHtml(
  html: string,
  searchTerm: string,
): HandelsregisterRecord[] {
  const records: HandelsregisterRecord[] = [];
  const seen = new Set<string>();

  const rowPattern = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  let row: RegExpExecArray | null;

  while ((row = rowPattern.exec(html)) !== null) {
    const block = row[1];
    const nameMatch =
      block.match(/<a[^>]*>([^<]{3,200})<\/a>/i) ??
      block.match(/<span[^>]*class="[^"]*fontBold[^"]*"[^>]*>([^<]{3,200})</i);

    const company = nameMatch?.[1]?.replace(/\s+/g, ' ').trim();
    if (!company) continue;

    const locMatch =
      block.match(/<td[^>]*>([^<]{2,80}(?:DE|Deutschland|Germany)[^<]*)</i) ??
      block.match(/(?:Ort|Sitz|Staat)[^>]*>([^<]{2,80})</i) ??
      block.match(/<td[^>]*>([A-ZÄÖÜ][a-zäöüß]+(?:\s+[A-ZÄÖÜ][a-zäöüß]+)*)<\/td>/i);

    const location = locMatch?.[1]?.replace(/\s+/g, ' ').trim() ?? 'DE';
    const key = `${company}|${location}`.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);

    records.push({ company_name: company, location, search_term: searchTerm });
  }

  return records;
}

async function writeToR2(key: string, body: unknown): Promise<void> {
  await r2.send(new PutObjectCommand({
    Bucket: R2_BUCKET,
    Key: key,
    Body: JSON.stringify(body),
    ContentType: 'application/json',
  }));
}

async function pushToQueue(record: HandelsregisterRecord, r2Key: string): Promise<void> {
  const job: HxQueueJob<{
    source: string;
    r2_key: string;
    company_name: string;
    vertical: string;
  }> = {
    job_id:        randomUUID(),
    job_type:      'handelsregister_parse',
    source_module: MODULE,
    attempts:      0,
    created_at:    new Date().toISOString(),
    payload: {
      source:       'handelsregister',
      r2_key:       r2Key,
      company_name: record.company_name,
      vertical:     'apparel',
    },
  };

  await scrapeQueue.add('handelsregister_parse', job, {
    attempts: 3,
    backoff: { type: 'exponential', delay: 5_000 },
    removeOnComplete: { count: 1_000 },
    removeOnFail:     { count: 500 },
  });
}

async function writeScrapeRun(params: {
  runId: string;
  startedAt: Date;
  stats: RunStats;
  status: 'completed' | 'failed';
  summary: Record<string, unknown>;
}): Promise<void> {
  await pool.query(
    `INSERT INTO hx_scrape_runs
       (id, source, started_at, completed_at,
        records_scraped, records_ingested, records_rejected,
        error_count, status, summary)
     VALUES ($1, 'handelsregister', $2, NOW(), $3, $4, $5, $6, $7, $8)`,
    [
      params.runId,
      params.startedAt.toISOString(),
      params.stats.scraped,
      params.stats.ingested,
      params.stats.rejected,
      params.stats.errors,
      params.status,
      JSON.stringify(params.summary),
    ],
  );
}

async function scrapeTerm(term: string, stats: RunStats): Promise<void> {
  const url = `${SEARCH_BASE}?schlagwoerter=${encodeURIComponent(term)}&schlagwortOptionen=all`;
  await delay(CALL_DELAY_MS);

  const html = await fetchHtml(url);
  if (!html) {
    stats.errors++;
    return;
  }

  const records = parseHandelsregisterHtml(html, term);
  hxLogger.info(MODULE, `parsed ${records.length} companies`, { term });

  for (const record of records) {
    stats.scraped++;
    const raw = { record, fetched_at: new Date().toISOString() };
    const r2Key = `handelsregister/${term}/${sourceId(record.company_name, record.location)}/${Date.now()}.json`;

    try {
      await writeToR2(r2Key, raw);
      await pushToQueue(record, r2Key);
      stats.ingested++;
    } catch {
      stats.errors++;
    }
  }
}

// ── Public entry point ────────────────────────────────────────────────────────

/** Run Handelsregister scraper for all configured search terms. */
export async function runHandelsregisterScraper(): Promise<{
  runId: string;
  status: string;
  stats: RunStats;
}> {
  const runId     = randomUUID();
  const startedAt = new Date();
  const stats: RunStats = { scraped: 0, ingested: 0, rejected: 0, errors: 0 };
  let status: 'completed' | 'failed' = 'completed';

  hxLogger.info(MODULE, 'scrape run started', { runId, terms: SEARCH_TERMS.length });

  try {
    for (const term of SEARCH_TERMS) {
      try {
        await scrapeTerm(term, stats);
      } catch (err) {
        stats.errors++;
        hxLogger.error(MODULE, 'term scrape failed', {
          term,
          err: err instanceof Error ? err.message : String(err),
        });
      }
    }
  } catch {
    status = 'failed';
  }

  await writeScrapeRun({
    runId,
    startedAt,
    stats,
    status,
    summary: {
      terms: SEARCH_TERMS,
      duration_ms: Date.now() - startedAt.getTime(),
    },
  });

  await bronzeWrite({
    event_type:    'scrape.run.completed',
    source_module: MODULE,
    entity_id:     runId,
    entity_type:   'hx_scrape_run',
    payload: {
      source:   'handelsregister',
      status,
      scraped:  stats.scraped,
      ingested: stats.ingested,
      rejected: stats.rejected,
      errors:   stats.errors,
    },
  });

  hxLogger.info(MODULE, 'scrape run finished', { runId, status, ...stats });
  return { runId, status, stats };
}
