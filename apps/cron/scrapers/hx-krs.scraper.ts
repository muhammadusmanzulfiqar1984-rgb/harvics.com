/**
 * hx-krs.scraper.ts — Polish KRS (Krajowy Rejestr Sądowy) scraper
 * Source: HARVYX_DATABANK_ARCH.md § 3.2
 *
 * PKD codes: 14 (apparel), 13 (textiles), 46.41 (textile wholesale)
 *
 * API discovery (2026): official api-krs.ms.gov.pl returns 404.
 * Probes candidate endpoints; falls back to eKRS HTML search if all fail.
 */

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { Queue }                       from 'bullmq';
import { Pool }                        from 'pg';
import { randomUUID }                  from 'crypto';

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

const CALL_DELAY_MS    = 1_000;
const FETCH_TIMEOUT_MS = 15_000;
const PAGE_SIZE        = 50;
const MAX_PAGES        = 20;
const MODULE           = 'hx-krs.scraper';

const PKD_CODES: Array<{ code: string; vertical: string; label: string }> = [
  { code: '14',    vertical: 'apparel', label: 'Produkcja odzieży' },
  { code: '13',    vertical: 'apparel', label: 'Produkcja wyrobów tekstylnych' },
  { code: '46.41', vertical: 'apparel', label: 'Sprzedaż hurtowa wyrobów tekstylnych' },
];

/** Candidate JSON APIs — first that returns HTTP 200 with parseable entities wins. */
const API_CANDIDATES: Array<{
  name: string;
  buildUrl: (pkd: string, page: number) => string;
}> = [
  {
    name: 'api.rejestry.net',
    buildUrl: (pkd, page) =>
      `https://api.rejestry.net/krs/v2/entities?pkd=${encodeURIComponent(pkd)}&page=${page}`,
  },
  {
    name: 'ekrs.ms.gov.pl',
    buildUrl: (pkd, page) =>
      `https://ekrs.ms.gov.pl/api/wyszukiwanie?pkd=${encodeURIComponent(pkd)}&page=${page}`,
  },
  {
    name: 'rejestr.io',
    buildUrl: (pkd, page) =>
      `https://rejestr.io/api/v1/krs/companies?pkd_code=${encodeURIComponent(pkd)}&page=${page}`,
  },
];

const EKRS_HTML_SEARCH =
  'https://ekrs.ms.gov.pl/web/wyszukiwarka-krs/strona-glowna';

const BROWSER_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

// ── Types ─────────────────────────────────────────────────────────────────────

interface KrsSearchItem {
  numerKRS?: string;
  nazwa?:    string;
  nip?:      string;
  regon?:    string;
  siedziba?: { miejscowosc?: string; kraj?: string; kodPocztowy?: string };
}

interface KrsBoardMember {
  imiona?:          string;
  nazwisko?:        string;
  funkcja?:         string;
  dataWygasniecia?: string | null;
}

interface ActiveApi {
  name: string;
  buildUrl: (pkd: string, page: number) => string;
}

// ── Singletons ────────────────────────────────────────────────────────────────

const r2 = new S3Client({
  region:   'auto',
  endpoint: R2_ENDPOINT,
  credentials: { accessKeyId: R2_KEY_ID, secretAccessKey: R2_SECRET },
});

const scrapeQueue = new Queue('hx-scrape', {
  connection: { url: REDIS_URL, maxRetriesPerRequest: null },
});

const pool = new Pool({ connectionString: DB_URL, max: 3 });

// ── Helpers ───────────────────────────────────────────────────────────────────

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchRaw(
  url: string,
  accept = 'application/json, text/html;q=0.9, */*;q=0.8',
): Promise<{ status: number; body: string; ok: boolean }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: accept,
        'User-Agent': BROWSER_UA,
      },
      redirect: 'follow',
    });
    const body = await res.text();
    return { status: res.status, body, ok: res.ok };
  } catch (err) {
    hxLogger.warn(MODULE, 'fetch error', {
      url,
      err: err instanceof Error ? err.message : String(err),
    });
    return { status: 0, body: '', ok: false };
  } finally {
    clearTimeout(timer);
  }
}

function looksLikeJson(body: string): boolean {
  const t = body.trim();
  return t.startsWith('{') || t.startsWith('[');
}

/** Normalize heterogeneous API payloads into KrsSearchItem[]. */
function extractEntities(payload: unknown): KrsSearchItem[] {
  if (!payload || typeof payload !== 'object') return [];

  const root = payload as Record<string, unknown>;

  const arrays: unknown[] = [];
  for (const key of ['entities', 'podmioty', 'companies', 'data', 'items', 'results', 'content']) {
    if (Array.isArray(root[key])) arrays.push(...(root[key] as unknown[]));
  }
  if (Array.isArray(payload)) arrays.push(...payload);

  const nested = root['data'];
  if (nested && typeof nested === 'object' && !Array.isArray(nested)) {
    const d = nested as Record<string, unknown>;
    for (const key of ['entities', 'companies', 'items', 'content']) {
      if (Array.isArray(d[key])) arrays.push(...(d[key] as unknown[]));
    }
  }

  const out: KrsSearchItem[] = [];
  for (const row of arrays) {
    if (!row || typeof row !== 'object') continue;
    const r = row as Record<string, unknown>;
    const numerKRS = String(
      r['numerKRS'] ?? r['krs'] ?? r['krs_number'] ?? r['krsNumber'] ?? r['number'] ?? '',
    ).trim();
    const nazwa = String(
      r['nazwa'] ?? r['name'] ?? r['company_name'] ?? r['companyName'] ?? '',
    ).trim();
    if (!numerKRS && !nazwa) continue;
    out.push({
      numerKRS: numerKRS || undefined,
      nazwa:    nazwa || undefined,
      nip:      r['nip'] ? String(r['nip']) : undefined,
      regon:    r['regon'] ? String(r['regon']) : undefined,
    });
  }
  return out;
}

/**
 * Probe candidate endpoints with PKD=14.
 * Logs status + first 500 chars. Returns first JSON-200 API, else null.
 */
async function probeApis(): Promise<ActiveApi | null> {
  hxLogger.info(MODULE, 'probing KRS API candidates');

  for (const candidate of API_CANDIDATES) {
    const url = candidate.buildUrl('14', 1);
    const { status, body, ok } = await fetchRaw(url);
    const preview = body.slice(0, 500);

    hxLogger.info(MODULE, 'KRS endpoint probe', {
      name: candidate.name,
      url,
      status,
      preview,
    });

    if (ok && status === 200 && looksLikeJson(body)) {
      try {
        const parsed = JSON.parse(body) as unknown;
        const entities = extractEntities(parsed);
        hxLogger.info(MODULE, 'KRS endpoint selected', {
          name: candidate.name,
          entitySample: entities.length,
        });
        return candidate;
      } catch {
        hxLogger.warn(MODULE, 'KRS endpoint 200 but JSON parse failed', {
          name: candidate.name,
        });
      }
    }
  }

  hxLogger.warn(MODULE, 'all KRS JSON APIs failed — falling back to HTML scrape');
  return null;
}

async function writeToR2(key: string, body: unknown): Promise<void> {
  await r2.send(new PutObjectCommand({
    Bucket:      R2_BUCKET,
    Key:         key,
    Body:        JSON.stringify(body),
    ContentType: 'application/json',
  }));
  hxLogger.debug(MODULE, 'R2 written', { key });
}

async function pushToQueue(
  krsNumber: string,
  companyName: string,
  vertical: string,
  r2Key: string,
): Promise<void> {
  const job: HxQueueJob<{
    krs_number:   string;
    company_name: string;
    vertical:     string;
    source:       string;
    r2_key:       string;
  }> = {
    job_id:        randomUUID(),
    job_type:      'krs_parse',
    source_module: MODULE,
    attempts:      0,
    created_at:    new Date().toISOString(),
    payload: {
      krs_number:   krsNumber,
      company_name: companyName,
      vertical,
      source:       'krs',
      r2_key:       r2Key,
    },
  };

  await scrapeQueue.add('krs_parse', job, {
    attempts: 3,
    backoff:  { type: 'exponential', delay: 5_000 },
    removeOnComplete: { count: 1_000 },
    removeOnFail:     { count: 500 },
  });
}

async function writeScrapeRun(params: {
  runId:     string;
  startedAt: Date;
  scraped:   number;
  ingested:  number;
  rejected:  number;
  errors:    number;
  status:    'completed' | 'failed';
  summary:   Record<string, unknown>;
}): Promise<void> {
  await pool.query(
    `INSERT INTO hx_scrape_runs
       (id, source, started_at, completed_at,
        records_scraped, records_ingested, records_rejected,
        error_count, status, summary)
     VALUES ($1, $2, $3, NOW(), $4, $5, $6, $7, $8, $9)`,
    [
      params.runId,
      'krs',
      params.startedAt.toISOString(),
      params.scraped,
      params.ingested,
      params.rejected,
      params.errors,
      params.status,
      JSON.stringify(params.summary),
    ],
  );
}

async function persistSubject(
  subject: KrsSearchItem,
  pkd: { code: string; vertical: string },
  stats: { scraped: number; ingested: number; rejected: number; errors: number },
  extra: Record<string, unknown> = {},
): Promise<void> {
  const krsNumber = subject.numerKRS ?? `name:${(subject.nazwa ?? '').slice(0, 40)}`;
  if (!subject.nazwa && !subject.numerKRS) {
    stats.rejected++;
    return;
  }

  stats.scraped++;

  const rawRecord = {
    krs_number:    subject.numerKRS ?? null,
    company_name:  subject.nazwa ?? null,
    nip:           subject.nip ?? null,
    regon:         subject.regon ?? null,
    siedziba:      subject.siedziba ?? { kraj: 'PL' },
    board_members: [] as KrsBoardMember[],
    vertical:      pkd.vertical,
    pkd_target:    pkd.code,
    fetched_at:    new Date().toISOString(),
    ...extra,
  };

  const safeId = (subject.numerKRS ?? createSlug(subject.nazwa ?? 'unknown')).replace(/\W+/g, '_');
  const r2Key = `krs/${pkd.vertical}/${safeId}/${Date.now()}.json`;

  try {
    await writeToR2(r2Key, rawRecord);
  } catch (err) {
    hxLogger.error(MODULE, 'R2 write failed', { krs: krsNumber, err });
    stats.errors++;
    return;
  }

  try {
    await pushToQueue(
      subject.numerKRS ?? safeId,
      subject.nazwa ?? '',
      pkd.vertical,
      r2Key,
    );
    stats.ingested++;
  } catch (err) {
    hxLogger.error(MODULE, 'queue push failed', { krs: krsNumber, err });
    stats.errors++;
  }
}

function createSlug(s: string): string {
  return s.toLowerCase().replace(/\s+/g, '_').slice(0, 48);
}

/** Parse company rows from eKRS / PRS HTML tables. */
function parseCompaniesFromHtml(html: string): KrsSearchItem[] {
  const items: KrsSearchItem[] = [];
  const seen = new Set<string>();

  // Table rows: <tr>…</tr>
  const rowRe = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  let rowMatch: RegExpExecArray | null;
  while ((rowMatch = rowRe.exec(html)) !== null) {
    const row = rowMatch[1];
    const cells = [...row.matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi)].map((m) =>
      m[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(),
    );
    if (cells.length < 1) continue;

    const krsCell = cells.find((c) => /^\d{6,10}$/.test(c.replace(/\s/g, '')));
    const nameCell = cells.find((c) => c.length > 3 && !/^\d+$/.test(c) && !/krs|nip|regon|pkd/i.test(c));
    if (!nameCell && !krsCell) continue;

    const key = `${krsCell ?? ''}|${nameCell ?? ''}`;
    if (seen.has(key)) continue;
    seen.add(key);

    items.push({
      numerKRS: krsCell?.replace(/\s/g, ''),
      nazwa:    nameCell,
      siedziba: { kraj: 'PL' },
    });
  }

  // Fallback: linked company names
  if (!items.length) {
    const linkRe = /<a[^>]+>([^<]{4,120})<\/a>/gi;
    let lm: RegExpExecArray | null;
    while ((lm = linkRe.exec(html)) !== null) {
      const name = lm[1].replace(/\s+/g, ' ').trim();
      if (/logowanie|szukaj|menu|start|english|polski/i.test(name)) continue;
      if (seen.has(name)) continue;
      seen.add(name);
      items.push({ nazwa: name, siedziba: { kraj: 'PL' } });
      if (items.length >= 100) break;
    }
  }

  return items;
}

async function scrapePkdViaApi(
  api: ActiveApi,
  pkd: { code: string; vertical: string; label: string },
  stats: { scraped: number; ingested: number; rejected: number; errors: number },
): Promise<void> {
  hxLogger.info(MODULE, `scraping PKD ${pkd.code} via ${api.name}`, { label: pkd.label });

  for (let page = 1; page <= MAX_PAGES; page++) {
    await delay(CALL_DELAY_MS);
    const url = api.buildUrl(pkd.code, page);
    const { status, body, ok } = await fetchRaw(url);

    if (!ok || status !== 200 || !looksLikeJson(body)) {
      hxLogger.warn(MODULE, 'API page failed', { api: api.name, pkd: pkd.code, page, status });
      break;
    }

    let subjects: KrsSearchItem[] = [];
    try {
      subjects = extractEntities(JSON.parse(body) as unknown);
    } catch {
      stats.errors++;
      break;
    }

    if (!subjects.length) {
      hxLogger.debug(MODULE, `PKD ${pkd.code} exhausted at page ${page}`);
      break;
    }

    for (const subject of subjects) {
      await persistSubject(subject, pkd, stats, { api: api.name });
      await delay(200);
    }

    if (subjects.length < PAGE_SIZE) break;
  }
}

/**
 * HTML fallback — eKRS search portal.
 * Fetches the search page (and PKD-query variants) and extracts table/link names.
 */
async function scrapePkdViaHtml(
  pkd: { code: string; vertical: string; label: string },
  stats: { scraped: number; ingested: number; rejected: number; errors: number },
): Promise<void> {
  hxLogger.info(MODULE, `HTML fallback for PKD ${pkd.code}`, { label: pkd.label });

  const urls = [
    `${EKRS_HTML_SEARCH}?pkd=${encodeURIComponent(pkd.code)}`,
    `${EKRS_HTML_SEARCH}?kodPkd=${encodeURIComponent(pkd.code)}`,
    `https://ekrs.ms.gov.pl/web/wyszukiwarka-krs/strona-glowna/index.html?pkd=${encodeURIComponent(pkd.code)}`,
    EKRS_HTML_SEARCH,
  ];

  let all: KrsSearchItem[] = [];

  for (const url of urls) {
    await delay(CALL_DELAY_MS);
    const { status, body, ok } = await fetchRaw(url, 'text/html,application/xhtml+xml');
    hxLogger.info(MODULE, 'HTML scrape fetch', {
      url,
      status,
      preview: body.slice(0, 500),
    });

    if (!ok || !body) {
      stats.errors++;
      continue;
    }

    const parsed = parseCompaniesFromHtml(body);
    hxLogger.info(MODULE, 'HTML parse result', { url, count: parsed.length });
    if (parsed.length) {
      all = parsed;
      break;
    }
  }

  if (!all.length) {
    hxLogger.warn(MODULE, 'HTML fallback found no companies', { pkd: pkd.code });
    return;
  }

  for (const subject of all) {
    await persistSubject(subject, pkd, stats, { source_mode: 'html_fallback' });
    await delay(100);
  }
}

// ── Public entry point ────────────────────────────────────────────────────────

export async function runKrsScraper(): Promise<void> {
  const runId     = randomUUID();
  const startedAt = new Date();
  const stats     = { scraped: 0, ingested: 0, rejected: 0, errors: 0 };

  hxLogger.info(MODULE, 'KRS scrape run started', {
    runId,
    pkdCodes: PKD_CODES.map((p) => p.code),
  });

  let runStatus: 'completed' | 'failed' = 'completed';
  let mode: string = 'none';

  try {
    const api = await probeApis();
    mode = api ? `api:${api.name}` : 'html_fallback';

    for (const pkd of PKD_CODES) {
      try {
        if (api) {
          await scrapePkdViaApi(api, pkd, stats);
        } else {
          await scrapePkdViaHtml(pkd, stats);
        }
      } catch (err) {
        stats.errors++;
        hxLogger.error(MODULE, 'PKD scrape failed', {
          code: pkd.code,
          err: err instanceof Error ? err.message : String(err),
        });
      }
    }
  } catch (err) {
    runStatus = 'failed';
    hxLogger.error(MODULE, 'KRS scrape run fatal error', {
      runId,
      err: err instanceof Error ? err.message : String(err),
    });
  }

  try {
    await writeScrapeRun({
      runId,
      startedAt,
      scraped:   stats.scraped,
      ingested:  stats.ingested,
      rejected:  stats.rejected,
      errors:    stats.errors,
      status:    runStatus,
      summary: {
        mode,
        pkd_codes:   PKD_CODES.map((p) => p.code),
        duration_ms: Date.now() - startedAt.getTime(),
      },
    });
  } catch (err) {
    hxLogger.error(MODULE, 'hx_scrape_runs write failed', { runId, err });
  }

  await bronzeWrite({
    event_type:    'scrape.run.completed',
    source_module: MODULE,
    entity_id:     runId,
    entity_type:   'hx_scrape_run',
    payload: {
      source:      'krs',
      status:      runStatus,
      mode,
      scraped:     stats.scraped,
      ingested:    stats.ingested,
      rejected:    stats.rejected,
      errors:      stats.errors,
      duration_ms: Date.now() - startedAt.getTime(),
    },
  });

  hxLogger.info(MODULE, 'KRS scrape run finished', { runId, runStatus, mode, ...stats });
}
