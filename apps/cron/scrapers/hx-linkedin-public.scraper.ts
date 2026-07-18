/**
 * hx-linkedin-public.scraper.ts — LinkedIn public company people page scraper
 * Source: HARVYX_DATABANK_ARCH.md § 3.6
 *
 * Manual trigger ONLY — never automated via cron.
 * Fetches linkedin.com/company/{slug}/people public HTML.
 * Extracts name, title, company. Max 20 pages, 5 s delay between pages.
 * Pushes hx-scrape queue. bronzeWrite on completion.
 */

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { Queue }                       from 'bullmq';
import { Pool }                        from 'pg';
import { randomUUID, createHash }      from 'crypto';

import { bronzeWrite }     from '../../../packages/lib/hx-bronze';
import { hxLogger }        from '../../../packages/lib/hx-logger';
import type { HxQueueJob } from '../../../packages/types/hx.types';

// ── Config ────────────────────────────────────────────────────────────────────

const R2_ENDPOINT      = process.env.HX_R2_ENDPOINT          ?? '';
const R2_BUCKET        = process.env.HX_R2_BUCKET            ?? 'harvyx-raw';
const R2_KEY_ID        = process.env.HX_R2_ACCESS_KEY_ID     ?? '';
const R2_SECRET        = process.env.HX_R2_SECRET_ACCESS_KEY ?? '';
const REDIS_URL        = process.env.HX_REDIS_URL            ?? 'redis://localhost:6379';
const DB_URL           = process.env.HX_DATABASE_URL         ?? '';

const MAX_PAGES        = 20;
const PAGE_DELAY_MS    = 5_000;
const FETCH_TIMEOUT_MS = 12_000;
const MODULE           = 'hx-linkedin-public.scraper';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface LinkedInPersonRecord {
  name:         string;
  title:        string;
  company_name: string;
  linkedin_slug: string;
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

function personId(slug: string, name: string): string {
  return createHash('sha1').update(`${slug}|${name}`.toLowerCase()).digest('hex').slice(0, 24);
}

async function fetchHtml(url: string): Promise<string | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; HarvyX/1.0; +https://harvics.com)',
        Accept: 'text/html,application/xhtml+xml',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });
    if (!res.ok) {
      hxLogger.warn(MODULE, `HTTP ${res.status}`, { url });
      return null;
    }
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

/** Parse public people listings from LinkedIn company HTML. */
export function parseLinkedInPeopleHtml(
  html: string,
  slug: string,
  companyName: string,
): LinkedInPersonRecord[] {
  const records: LinkedInPersonRecord[] = [];
  const seen = new Set<string>();

  const cardPattern = /<(?:li|div)[^>]*class="[^"]*(?:org-people-profile-card|profile-card)[^"]*"[^>]*>([\s\S]*?)<\/(?:li|div)>/gi;
  const cards = html.match(cardPattern) ?? [];

  const sources = cards.length ? cards : [html];

  for (const block of sources) {
    const nameMatch =
      block.match(/aria-label="([^"]{2,100})"/i) ??
      block.match(/class="[^"]*(?:name|actor-name)[^"]*"[^>]*>([^<]{2,100})</i) ??
      block.match(/<span[^>]*dir="ltr"[^>]*>([^<]{2,100})<\/span>/i);

    const titleMatch =
      block.match(/class="[^"]*(?:title|subtitle|headline)[^"]*"[^>]*>([^<]{2,200})</i) ??
      block.match(/<div[^>]*class="[^"]*artdeco-entity-lockup__subtitle[^"]*"[^>]*>([^<]{2,200})</i);

    const name = nameMatch?.[1]?.replace(/\s+/g, ' ').trim();
    if (!name || seen.has(name.toLowerCase())) continue;
    seen.add(name.toLowerCase());

    const title = titleMatch?.[1]?.replace(/\s+/g, ' ').trim() ?? '';
    records.push({
      name,
      title,
      company_name: companyName,
      linkedin_slug: slug,
    });
  }

  return records;
}

function extractCompanyName(html: string, slug: string): string {
  const match =
    html.match(/<h1[^>]*>([^<]{2,120})<\/h1>/i) ??
    html.match(/class="[^"]*org-top-card-summary__title[^"]*"[^>]*>([^<]{2,120})</i);
  return match?.[1]?.replace(/\s+/g, ' ').trim() ?? slug;
}

async function writeToR2(key: string, body: unknown): Promise<void> {
  await r2.send(new PutObjectCommand({
    Bucket: R2_BUCKET,
    Key: key,
    Body: JSON.stringify(body),
    ContentType: 'application/json',
  }));
}

async function pushToQueue(
  person: LinkedInPersonRecord,
  r2Key: string,
): Promise<void> {
  const job: HxQueueJob<{
    source: string;
    r2_key: string;
    company_name: string;
    vertical: string;
  }> = {
    job_id:        randomUUID(),
    job_type:      'linkedin_public_parse',
    source_module: MODULE,
    attempts:      0,
    created_at:    new Date().toISOString(),
    payload: {
      source:       'linkedin_public',
      r2_key:       r2Key,
      company_name: person.company_name,
      vertical:     'apparel',
    },
  };

  await scrapeQueue.add('linkedin_public_parse', job, {
    attempts: 2,
    backoff: { type: 'fixed', delay: 15_000 },
    removeOnComplete: { count: 500 },
    removeOnFail:     { count: 200 },
  });
}

async function writeScrapeRun(params: {
  runId: string;
  startedAt: Date;
  stats: RunStats;
  status: 'completed' | 'failed';
  slug: string;
  summary: Record<string, unknown>;
}): Promise<void> {
  await pool.query(
    `INSERT INTO hx_scrape_runs
       (id, source, started_at, completed_at,
        records_scraped, records_ingested, records_rejected,
        error_count, status, summary)
     VALUES ($1, 'linkedin_public', $2, NOW(), $3, $4, $5, $6, $7, $8)`,
    [
      params.runId,
      params.startedAt.toISOString(),
      params.stats.scraped,
      params.stats.ingested,
      params.stats.rejected,
      params.stats.errors,
      params.status,
      JSON.stringify({ slug: params.slug, ...params.summary }),
    ],
  );
}

// ── Public entry point ────────────────────────────────────────────────────────

/**
 * Scrape public LinkedIn people page for one company slug.
 * Manual trigger only — max 20 paginated pages per run.
 */
export async function runLinkedInPublicScraper(slug: string): Promise<{
  runId: string;
  status: string;
  stats: RunStats;
}> {
  const cleanSlug = slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
  if (!cleanSlug) throw new Error('Invalid LinkedIn slug');

  const runId     = randomUUID();
  const startedAt = new Date();
  const stats: RunStats = { scraped: 0, ingested: 0, rejected: 0, errors: 0 };
  let status: 'completed' | 'failed' = 'completed';
  let companyName = cleanSlug;

  hxLogger.info(MODULE, 'manual scrape started', { runId, slug: cleanSlug });

  try {
    for (let page = 1; page <= MAX_PAGES; page++) {
      const url = page === 1
        ? `https://www.linkedin.com/company/${cleanSlug}/people/`
        : `https://www.linkedin.com/company/${cleanSlug}/people/?page=${page}`;

      if (page > 1) await delay(PAGE_DELAY_MS);

      const html = await fetchHtml(url);
      if (!html) {
        stats.errors++;
        break;
      }

      if (page === 1) companyName = extractCompanyName(html, cleanSlug);

      const people = parseLinkedInPeopleHtml(html, cleanSlug, companyName);
      if (!people.length) break;

      for (const person of people) {
        stats.scraped++;
        const raw = { person, page, fetched_at: new Date().toISOString() };
        const r2Key = `linkedin-public/${cleanSlug}/${personId(cleanSlug, person.name)}/${Date.now()}.json`;

        try {
          await writeToR2(r2Key, raw);
          await pushToQueue(person, r2Key);
          stats.ingested++;
        } catch {
          stats.errors++;
        }
      }
    }
  } catch (err) {
    status = 'failed';
    hxLogger.error(MODULE, 'scrape run failed', {
      runId,
      err: err instanceof Error ? err.message : String(err),
    });
  }

  await writeScrapeRun({
    runId,
    startedAt,
    stats,
    status,
    slug: cleanSlug,
    summary: {
      company_name: companyName,
      pages_max: MAX_PAGES,
      duration_ms: Date.now() - startedAt.getTime(),
    },
  });

  await bronzeWrite({
    event_type:    'scrape.run.completed',
    source_module: MODULE,
    entity_id:     runId,
    entity_type:   'hx_scrape_run',
    payload: {
      source:       'linkedin_public',
      status,
      slug:         cleanSlug,
      company_name: companyName,
      scraped:      stats.scraped,
      ingested:     stats.ingested,
      rejected:     stats.rejected,
      errors:       stats.errors,
    },
  });

  hxLogger.info(MODULE, 'manual scrape finished', { runId, status, ...stats });
  return { runId, status, stats };
}
