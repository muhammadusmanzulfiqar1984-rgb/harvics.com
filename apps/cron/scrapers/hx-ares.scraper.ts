/**
 * hx-ares.scraper.ts — Czech ARES (Administrativní Registr Ekonomických Subjektů) scraper
 * Source: HARVYX_DATABANK_ARCH.md § 3.3
 *
 * Phase 1: Company records only. No director extraction.
 *
 * Responsibilities:
 *  1. Search ARES REST API by keyword (Czech textile/FMCG/commodity terms)
 *  2. Write raw company record to Cloudflare R2
 *  3. Push to hx:scrape BullMQ queue
 *  4. Write run record to hx_scrape_runs
 *  5. bronzeWrite() on completion
 *
 * Rate limit: 500 ms between every API call
 * Timeout:    10 s AbortController on every fetch
 *
 * API: https://ares.gov.cz/ekonomicke-subjekty-v-be/rest
 *   POST /ekonomicke-subjekty/vyhledat
 *   Body: { obchodniJmeno: string, start: number, pocet: number }
 */

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { Queue }                       from 'bullmq';
import { Pool }                        from 'pg';
import { randomUUID }                  from 'crypto';

import { bronzeWrite }     from '../../../packages/lib/hx-bronze';
import { hxLogger }        from '../../../packages/lib/hx-logger';
import type { HxQueueJob } from '../../../packages/types/hx.types';

// ── Config ────────────────────────────────────────────────────────────────────

const ARES_BASE        = 'https://ares.gov.cz/ekonomicke-subjekty-v-be/rest';
const R2_ENDPOINT      = process.env.HX_R2_ENDPOINT          ?? '';
const R2_BUCKET        = process.env.HX_R2_BUCKET            ?? 'harvyx-raw';
const R2_KEY_ID        = process.env.HX_R2_ACCESS_KEY_ID     ?? '';
const R2_SECRET        = process.env.HX_R2_SECRET_ACCESS_KEY ?? '';
const REDIS_URL        = process.env.HX_REDIS_URL            ?? 'redis://localhost:6379';
const DB_URL           = process.env.HX_DATABASE_URL         ?? '';

const CALL_DELAY_MS    = 500;
const FETCH_TIMEOUT_MS = 10_000;
const PAGE_SIZE        = 100;
const MAX_PAGES        = 10;   // cap: 1 000 records per keyword
const MODULE           = 'hx-ares.scraper';

// ── Search terms — HARVYX_DATABANK_ARCH.md § 3.3 ─────────────────────────────
// Czech language search terms mapped to Harvics verticals.

interface AresSearchTerm {
  vertical: string;
  term:     string;
}

const SEARCH_TERMS: AresSearchTerm[] = [
  // Apparel / Textiles (Czech: textil, oděvy, konfekce)
  { vertical: 'apparel', term: 'textil'             },
  { vertical: 'apparel', term: 'oděvy'              },
  { vertical: 'apparel', term: 'konfekce'           },
  { vertical: 'apparel', term: 'látky'              },
  { vertical: 'apparel', term: 'módní'              },

  // FMCG (Czech: potraviny, nápoje, spotřební zboží)
  { vertical: 'fmcg',    term: 'potraviny import'   },
  { vertical: 'fmcg',    term: 'velkoobchod potraviny' },
  { vertical: 'fmcg',    term: 'nápoje distribuce'  },
  { vertical: 'fmcg',    term: 'spotřební zboží'    },

  // Commodities (Czech: komodity, obiloviny, zemědělství)
  { vertical: 'commodities', term: 'komodity'       },
  { vertical: 'commodities', term: 'obiloviny'      },
  { vertical: 'commodities', term: 'zemědělský obchod' },
  { vertical: 'commodities', term: 'cukr obchod'    },

  // Industrial (Czech: průmyslové vybavení, chemie, strojírenství)
  { vertical: 'industrial', term: 'průmyslové vybavení' },
  { vertical: 'industrial', term: 'chemie import'   },
  { vertical: 'industrial', term: 'strojírenství'   },

  // Sourcing & Logistics (Czech: nákup, logistika, přeprava)
  { vertical: 'sourcing', term: 'globální nákup'    },
  { vertical: 'sourcing', term: 'logistika mezinárodní' },
  { vertical: 'sourcing', term: 'přeprava zboží'    },

  // Trade Finance (Czech: obchodní financování)
  { vertical: 'finance', term: 'obchodní financování' },
  { vertical: 'finance', term: 'akreditiv'          },
];

// ── ARES API types ────────────────────────────────────────────────────────────

interface AresSubject {
  ico?:           string;         // company registration number
  obchodniJmeno?: string;         // business name
  sidlo?: {
    textovaAdresa?:  string;
    nazevObce?:      string;
    psc?:            string;
    nazevStatu?:     string;
  };
  pravniForma?:   string;
  datumVzniku?:   string;
  datumZaniku?:   string | null;
  primarySource?: string;
  czNace?: string[];
}

interface AresSearchResponse {
  pocetCelkem?: number;
  ekonomickeSubjekty?: AresSubject[];
}

// ── Singletons ────────────────────────────────────────────────────────────────

const r2 = new S3Client({
  region:   'auto',
  endpoint: R2_ENDPOINT,
  credentials: { accessKeyId: R2_KEY_ID, secretAccessKey: R2_SECRET },
});

const scrapeQueue = new Queue('hx-scrape', {
  connection: { url: REDIS_URL },
});

const pool = new Pool({ connectionString: DB_URL, max: 3 });

// ── Helpers ───────────────────────────────────────────────────────────────────

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function aresPost<T>(
  path: string,
  body: Record<string, unknown>,
): Promise<T | null> {
  const controller = new AbortController();
  const timer      = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  const url        = `${ARES_BASE}${path}`;

  try {
    const res = await fetch(url, {
      method:  'POST',
      signal:  controller.signal,
      headers: {
        'Content-Type': 'application/json',
        Accept:         'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      hxLogger.warn(MODULE, `ARES API ${res.status}`, { path, body });
      return null;
    }

    return (await res.json()) as T;
  } catch (err) {
    const isTimeout = err instanceof Error && err.name === 'AbortError';
    hxLogger.warn(MODULE, isTimeout ? 'fetch timeout' : 'fetch error', {
      path,
      err: err instanceof Error ? err.message : String(err),
    });
    return null;
  } finally {
    clearTimeout(timer);
  }
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
  ico: string,
  companyName: string,
  vertical: string,
  r2Key: string,
): Promise<void> {
  const job: HxQueueJob<{
    ico:          string;
    company_name: string;
    vertical:     string;
    source:       string;
    r2_key:       string;
  }> = {
    job_id:        randomUUID(),
    job_type:      'ares_parse',
    source_module: MODULE,
    attempts:      0,
    created_at:    new Date().toISOString(),
    payload: {
      ico,
      company_name: companyName,
      vertical,
      source:       'ares',
      r2_key:       r2Key,
    },
  };

  await scrapeQueue.add('ares_parse', job, {
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
      'ares',
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

// ── Core: scrape one search term ──────────────────────────────────────────────

async function scrapeTerm(
  st: AresSearchTerm,
  stats: { scraped: number; ingested: number; rejected: number; errors: number },
): Promise<void> {
  hxLogger.info(MODULE, `scraping ARES term "${st.term}"`, { vertical: st.vertical });

  for (let page = 0; page < MAX_PAGES; page++) {
    await delay(CALL_DELAY_MS);

    const result = await aresPost<AresSearchResponse>(
      '/ekonomicke-subjekty/vyhledat',
      {
        obchodniJmeno: st.term,
        start:         page * PAGE_SIZE,
        pocet:         PAGE_SIZE,
      },
    );

    const subjects = result?.ekonomickeSubjekty ?? [];
    if (!subjects.length) {
      hxLogger.debug(MODULE, `term "${st.term}" exhausted at page ${page}`);
      break;
    }

    for (const subject of subjects) {
      if (!subject.ico) {
        stats.rejected++;
        continue;
      }

      // Skip dissolved companies (datumZaniku set)
      if (subject.datumZaniku) {
        stats.rejected++;
        continue;
      }

      stats.scraped++;

      const rawRecord = {
        ico:          subject.ico,
        company_name: subject.obchodniJmeno,
        sidlo:        subject.sidlo,
        pravni_forma: subject.pravniForma,
        datum_vzniku: subject.datumVzniku,
        cz_nace:      subject.czNace ?? [],
        vertical:     st.vertical,
        search_term:  st.term,
        fetched_at:   new Date().toISOString(),
      };

      const r2Key = `ares/${st.vertical}/${subject.ico}/${Date.now()}.json`;

      try {
        await writeToR2(r2Key, rawRecord);
      } catch (err) {
        hxLogger.error(MODULE, 'R2 write failed', { ico: subject.ico, err });
        stats.errors++;
        continue;
      }

      try {
        await pushToQueue(
          subject.ico,
          subject.obchodniJmeno ?? '',
          st.vertical,
          r2Key,
        );
        stats.ingested++;
      } catch (err) {
        hxLogger.error(MODULE, 'queue push failed', { ico: subject.ico, err });
        stats.errors++;
      }
    }

    // No next page needed if fewer results returned than requested
    if (subjects.length < PAGE_SIZE) break;
  }
}

// ── Public entry point ────────────────────────────────────────────────────────

export async function runAresScraper(): Promise<void> {
  const runId     = randomUUID();
  const startedAt = new Date();
  const stats     = { scraped: 0, ingested: 0, rejected: 0, errors: 0 };

  hxLogger.info(MODULE, 'ARES scrape run started', {
    runId,
    terms: SEARCH_TERMS.length,
  });

  let runStatus: 'completed' | 'failed' = 'completed';

  try {
    for (const st of SEARCH_TERMS) {
      try {
        await scrapeTerm(st, stats);
      } catch (err) {
        stats.errors++;
        hxLogger.error(MODULE, 'term scrape failed', { term: st.term, err });
      }
    }
  } catch (err) {
    runStatus = 'failed';
    hxLogger.error(MODULE, 'ARES scrape run fatal error', { runId, err });
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
        search_terms: SEARCH_TERMS.map(s => s.term),
        duration_ms:  Date.now() - startedAt.getTime(),
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
      source:      'ares',
      status:      runStatus,
      scraped:     stats.scraped,
      ingested:    stats.ingested,
      rejected:    stats.rejected,
      errors:      stats.errors,
      duration_ms: Date.now() - startedAt.getTime(),
    },
  });

  hxLogger.info(MODULE, 'ARES scrape run finished', { runId, runStatus, ...stats });
}
