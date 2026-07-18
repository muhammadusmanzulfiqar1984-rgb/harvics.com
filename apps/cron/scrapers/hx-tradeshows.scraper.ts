/**
 * hx-tradeshows.scraper.ts — trade show exhibitor directory scraper
 * Source: HARVYX_DATABANK_ARCH.md § 3.5
 *
 * Scrapes Bluezone, INNATEX, Source Fashion, Supreme Düsseldorf exhibitor lists.
 * Extracts company name, stand, hall, area, website.
 * Writes raw JSON to R2, pushes hx-scrape queue jobs, bronzeWrite on completion.
 *
 * Trigger: manual POST /api/v1/databank/scrape/tradeshows
 *          or auto-run 30 days before each show (KV-stored dates).
 *
 * Rate limit: 2 s between requests.
 */

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { Queue }                       from 'bullmq';
import { Pool }                        from 'pg';
import { randomUUID, createHash }      from 'crypto';
import Redis                           from 'ioredis';

import { bronzeWrite }     from '../../../packages/lib/hx-bronze';
import { hxLogger }        from '../../../packages/lib/hx-logger';
import type { HxQueueJob } from '../../../packages/types/hx.types';

// ── Config ────────────────────────────────────────────────────────────────────

const R2_ENDPOINT  = process.env.HX_R2_ENDPOINT          ?? '';
const R2_BUCKET    = process.env.HX_R2_BUCKET            ?? 'harvyx-raw';
const R2_KEY_ID    = process.env.HX_R2_ACCESS_KEY_ID     ?? '';
const R2_SECRET    = process.env.HX_R2_SECRET_ACCESS_KEY ?? '';
const REDIS_URL    = process.env.HX_REDIS_URL            ?? 'redis://localhost:6379';
const DB_URL       = process.env.HX_DATABASE_URL         ?? '';
const CF_ACCOUNT   = process.env.HX_CLOUDFLARE_ACCOUNT_ID ?? '';
const CF_KV_NS     = process.env.HX_CLOUDFLARE_KV_NAMESPACE ?? '4b280fea825840faae3e4b78be9568f9';
const CF_TOKEN     = process.env.HX_CF_API_TOKEN          ?? process.env.CLOUDFLARE_API_TOKEN ?? '';

const CALL_DELAY_MS    = 2_000;
const FETCH_TIMEOUT_MS = 12_000;
const DAYS_BEFORE_SHOW = 30;
const MODULE           = 'hx-tradeshows.scraper';

// ── Show catalogue ────────────────────────────────────────────────────────────

interface TradeShow {
  source: string;
  name:   string;
  url:    string;
  date:   string;
}

const TRADE_SHOWS: TradeShow[] = [
  {
    source: 'bluezone',
    name:   'Bluezone Munich',
    url:    'https://www.munich-fabric-start.com/en/exhibitors',
    date:   '2026-09-02',
  },
  {
    source: 'innatex',
    name:   'INNATEX',
    url:    'https://www.innatex.de/aussteller',
    date:   '2026-01-20',
  },
  {
    source: 'source_fashion',
    name:   'Source Fashion',
    url:    'https://www.sourcefashion.com/exhibitors',
    date:   '2026-07-14',
  },
  {
    source: 'supreme_dus',
    name:   'Supreme Düsseldorf',
    url:    'https://www.supreme-duesseldorf.com/exhibitors',
    date:   '2026-02-04',
  },
];

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ExhibitorRecord {
  company_name: string;
  stand?:       string;
  hall?:        string;
  area?:        string;
  website?:     string;
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
const redis       = new Redis(REDIS_URL, { maxRetriesPerRequest: 2, lazyConnect: true });

// ── Utilities ─────────────────────────────────────────────────────────────────

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function sourceId(show: string, company: string, stand?: string): string {
  const basis = `${show}|${company}|${stand ?? ''}`.toLowerCase();
  return createHash('sha1').update(basis).digest('hex').slice(0, 24);
}

/** Fetch HTML with timeout and browser-like headers. */
async function fetchHtml(url: string): Promise<string | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml',
      },
      redirect: 'follow',
    });
    const text = await res.text();
    hxLogger.info(MODULE, 'fetch response', {
      url,
      status: res.status,
      preview: text.slice(0, 500),
    });
    if (!res.ok) {
      hxLogger.warn(MODULE, `HTTP ${res.status}`, { url });
      // Bluezone: try non-hyphenated munichfabricstart.com mirror
      if (url.includes('munich-fabric-start.com')) {
        const alt = url.replace('munich-fabric-start.com', 'munichfabricstart.com');
        if (alt !== url) {
          hxLogger.info(MODULE, 'trying bluezone alternate host', { alt });
          return fetchHtml(alt);
        }
      }
      return null;
    }
    return text;
  } catch (err) {
    hxLogger.warn(MODULE, 'fetch failed', {
      url,
      err: err instanceof Error ? err.message : String(err),
    });
    if (url.includes('munich-fabric-start.com')) {
      const alt = url.replace('munich-fabric-start.com', 'munichfabricstart.com');
      if (alt !== url) {
        hxLogger.info(MODULE, 'trying bluezone alternate host after error', { alt });
        return fetchHtml(alt);
      }
    }
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/** Parse exhibitor rows from directory HTML via regex heuristics. */
export function parseExhibitorHtml(html: string): ExhibitorRecord[] {
  const records: ExhibitorRecord[] = [];
  const seen = new Set<string>();

  const blockPattern = /<(?:article|div|li|tr)[^>]*class="[^"]*(?:exhibitor|aussteller|company|stand)[^"]*"[^>]*>([\s\S]*?)<\/(?:article|div|li|tr)>/gi;
  const blocks = html.match(blockPattern) ?? [html];

  for (const block of blocks) {
    const nameMatch =
      block.match(/class="[^"]*(?:company|name|title)[^"]*"[^>]*>([^<]{2,120})</i) ??
      block.match(/<h[2-4][^>]*>([^<]{2,120})<\/h[2-4]>/i) ??
      block.match(/<a[^>]+href="[^"]*"[^>]*>([^<]{2,120})<\/a>/i);

    const company = nameMatch?.[1]?.replace(/\s+/g, ' ').trim();
    if (!company || seen.has(company.toLowerCase())) continue;
    seen.add(company.toLowerCase());

    const stand = block.match(/stand[^>]*>[\s:]*([^<\n]{1,40})/i)?.[1]?.trim();
    const hall  = block.match(/hall[^>]*>[\s:]*([^<\n]{1,40})/i)?.[1]?.trim();
    const area  = block.match(/area[^>]*>[\s:]*([^<\n]{1,40})/i)?.[1]?.trim();
    const site  = block.match(/href="(https?:\/\/[^"]+)"/i)?.[1]?.trim();

    records.push({
      company_name: company,
      stand,
      hall,
      area,
      website: site,
    });
  }

  if (!records.length) {
    const linkPattern = /<a[^>]+href="(https?:\/\/[^"]+)"[^>]*>([^<]{3,120})<\/a>/gi;
    let m: RegExpExecArray | null;
    while ((m = linkPattern.exec(html)) !== null) {
      const company = m[2].replace(/\s+/g, ' ').trim();
      if (!company || seen.has(company.toLowerCase())) continue;
      if (/cookie|privacy|login|register|exhibitor/i.test(company)) continue;
      seen.add(company.toLowerCase());
      records.push({ company_name: company, website: m[1] });
    }
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

async function pushToQueue(
  show: TradeShow,
  exhibitor: ExhibitorRecord,
  r2Key: string,
): Promise<void> {
  const job: HxQueueJob<{
    source: string;
    r2_key: string;
    company_name: string;
    vertical: string;
  }> = {
    job_id:        randomUUID(),
    job_type:      `${show.source}_parse`,
    source_module: MODULE,
    attempts:      0,
    created_at:    new Date().toISOString(),
    payload: {
      source:       show.source,
      r2_key:       r2Key,
      company_name: exhibitor.company_name,
      vertical:     'apparel',
    },
  };

  await scrapeQueue.add(`${show.source}_parse`, job, {
    attempts: 3,
    backoff: { type: 'exponential', delay: 5_000 },
    removeOnComplete: { count: 1_000 },
    removeOnFail:     { count: 500 },
  });
}

async function writeScrapeRun(params: {
  runId: string;
  source: string;
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
     VALUES ($1, $2, $3, NOW(), $4, $5, $6, $7, $8, $9)`,
    [
      params.runId,
      params.source,
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

// ── KV show-date scheduling ───────────────────────────────────────────────────

async function kvGet(key: string): Promise<string | null> {
  if (CF_ACCOUNT && CF_TOKEN) {
    const url = `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT}/storage/kv/namespaces/${CF_KV_NS}/values/${encodeURIComponent(key)}`;
    try {
      const res = await fetch(url, { headers: { Authorization: `Bearer ${CF_TOKEN}` } });
      if (res.ok) return await res.text();
    } catch { /* fall through */ }
  }
  try {
    if (redis.status !== 'ready') await redis.connect().catch(() => undefined);
    return await redis.get(`hx:tradeshow:${key}`);
  } catch {
    return null;
  }
}

async function kvPut(key: string, value: string): Promise<void> {
  if (CF_ACCOUNT && CF_TOKEN) {
    const url = `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT}/storage/kv/namespaces/${CF_KV_NS}/values/${encodeURIComponent(key)}`;
    try {
      await fetch(url, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${CF_TOKEN}`, 'Content-Type': 'text/plain' },
        body: value,
      });
    } catch { /* ignore */ }
  }
  try {
    if (redis.status !== 'ready') await redis.connect().catch(() => undefined);
    await redis.set(`hx:tradeshow:${key}`, value);
  } catch { /* ignore */ }
}

/** Return shows that should auto-run (within 30 days of show date). */
export async function getShowsDueForAutoRun(): Promise<TradeShow[]> {
  const now = Date.now();
  const due: TradeShow[] = [];

  for (const show of TRADE_SHOWS) {
    const showMs = new Date(show.date).getTime();
    const windowStart = showMs - DAYS_BEFORE_SHOW * 86_400_000;
    if (now < windowStart || now > showMs) continue;

    const lastRun = await kvGet(`last_run:${show.source}`);
    if (lastRun && now - Number(lastRun) < 86_400_000) continue;

    due.push(show);
  }

  return due;
}

async function scrapeShow(show: TradeShow, stats: RunStats): Promise<void> {
  await delay(CALL_DELAY_MS);
  const html = await fetchHtml(show.url);
  if (!html) {
    stats.errors++;
    return;
  }

  const exhibitors = parseExhibitorHtml(html);
  hxLogger.info(MODULE, `parsed ${exhibitors.length} exhibitors`, { show: show.source });

  for (const exhibitor of exhibitors) {
    stats.scraped++;
    if (!exhibitor.company_name) {
      stats.rejected++;
      continue;
    }

    const raw = {
      show:       show.source,
      show_name:  show.name,
      exhibitor,
      fetched_at: new Date().toISOString(),
    };

    const r2Key = `tradeshows/${show.source}/${sourceId(show.source, exhibitor.company_name, exhibitor.stand)}/${Date.now()}.json`;

    try {
      await writeToR2(r2Key, raw);
      await pushToQueue(show, exhibitor, r2Key);
      stats.ingested++;
    } catch (err) {
      stats.errors++;
      hxLogger.error(MODULE, 'exhibitor ingest failed', {
        show: show.source,
        company: exhibitor.company_name,
        err: err instanceof Error ? err.message : String(err),
      });
    }
  }

  await kvPut(`last_run:${show.source}`, String(Date.now()));
  await kvPut('show_dates', JSON.stringify(TRADE_SHOWS.map((s) => ({
    source: s.source, date: s.date, name: s.name,
  }))));
}

// ── Public entry points ───────────────────────────────────────────────────────

/** Run all trade show scrapers (manual or scheduled). */
export async function runTradeShowsScraper(opts?: {
  shows?: string[];
  manual?: boolean;
}): Promise<{ runId: string; status: string; stats: RunStats }> {
  const runId     = randomUUID();
  const startedAt = new Date();
  const stats: RunStats = { scraped: 0, ingested: 0, rejected: 0, errors: 0 };

  let targets = TRADE_SHOWS;
  if (opts?.shows?.length) {
    targets = TRADE_SHOWS.filter((s) => opts.shows!.includes(s.source));
  } else if (!opts?.manual) {
    targets = await getShowsDueForAutoRun();
    if (!targets.length) {
      hxLogger.info(MODULE, 'no shows due for auto-run');
      return { runId, status: 'skipped', stats };
    }
  }

  hxLogger.info(MODULE, 'scrape run started', {
    runId, shows: targets.map((s) => s.source), manual: Boolean(opts?.manual),
  });

  let status: 'completed' | 'failed' = 'completed';

  try {
    for (const show of targets) {
      try {
        await scrapeShow(show, stats);
      } catch (err) {
        stats.errors++;
        hxLogger.error(MODULE, 'show scrape failed', {
          show: show.source,
          err: err instanceof Error ? err.message : String(err),
        });
      }
    }
  } catch {
    status = 'failed';
  }

  await writeScrapeRun({
    runId,
    source: 'tradeshows',
    startedAt,
    stats,
    status,
    summary: {
      shows: targets.map((s) => s.source),
      manual: Boolean(opts?.manual),
      duration_ms: Date.now() - startedAt.getTime(),
    },
  });

  await bronzeWrite({
    event_type:    'scrape.run.completed',
    source_module: MODULE,
    entity_id:     runId,
    entity_type:   'hx_scrape_run',
    payload: {
      source:   'tradeshows',
      status,
      scraped:  stats.scraped,
      ingested: stats.ingested,
      rejected: stats.rejected,
      errors:   stats.errors,
      shows:    targets.map((s) => s.source),
    },
  });

  hxLogger.info(MODULE, 'scrape run finished', { runId, status, ...stats });
  return { runId, status, stats };
}
