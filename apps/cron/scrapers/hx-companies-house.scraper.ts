/**
 * hx-companies-house.scraper.ts
 * Source: HARVYX_DATABANK_ARCH.md § 3.1
 *
 * Responsibilities:
 *  1. Search Companies House by vertical keyword (UK-registered buyers/traders)
 *  2. Fetch officer list per company; skip resigned officers
 *  3. Write raw JSON to Cloudflare R2
 *  4. Push job to hx:scrape BullMQ queue
 *  5. Write run record to hx_scrape_runs
 *  6. bronzeWrite() on scrape completion
 *
 * Rate limit: 600 ms between every API call (CH allows 600 req/min)
 * Timeout:    10 s AbortController on every fetch
 */

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { Queue }                       from 'bullmq';
import { Pool }                        from 'pg';
import { randomUUID }                  from 'crypto';

import { bronzeWrite }   from '../../../packages/lib/hx-bronze';
import { hxLogger }      from '../../../packages/lib/hx-logger';
import type { HxQueueJob } from '../../../packages/types/hx.types';

// ── Config from env ───────────────────────────────────────────────────────────

const CH_API_KEY      = process.env.COMPANIES_HOUSE_API_KEY ?? '';
const CH_BASE         = 'https://api.company-information.service.gov.uk';
const CH_ITEMS_PAGE   = 100;

const R2_ENDPOINT     = process.env.HX_R2_ENDPOINT ?? '';          // https://<accountid>.r2.cloudflarestorage.com
const R2_BUCKET       = process.env.HX_R2_BUCKET   ?? 'harvyx-raw';
const R2_KEY_ID       = process.env.HX_R2_ACCESS_KEY_ID     ?? '';
const R2_SECRET       = process.env.HX_R2_SECRET_ACCESS_KEY ?? '';

const REDIS_URL       = process.env.HX_REDIS_URL   ?? 'redis://localhost:6379';
const DB_URL          = process.env.HX_DATABASE_URL ?? '';

const CALL_DELAY_MS   = 600;
const FETCH_TIMEOUT_MS = 10_000;
const MODULE          = 'hx-companies-house.scraper';

// ── Vertical keywords  ── HARVYX_DATABANK_ARCH.md § 3.1 ──────────────────────
// Keywords mapped to Harvics verticals for UK company search.

interface VerticalKeyword {
  vertical: string;
  keyword:  string;
}

const VERTICAL_KEYWORDS: VerticalKeyword[] = [
  // Apparel / Textiles
  { vertical: 'apparel',      keyword: 'textile importer'         },
  { vertical: 'apparel',      keyword: 'garment wholesale'        },
  { vertical: 'apparel',      keyword: 'denim fabric trader'      },
  { vertical: 'apparel',      keyword: 'clothing manufacturer'    },
  { vertical: 'apparel',      keyword: 'fashion sourcing'         },

  // FMCG
  { vertical: 'fmcg',         keyword: 'food importer wholesale'  },
  { vertical: 'fmcg',         keyword: 'fmcg distributor'         },
  { vertical: 'fmcg',         keyword: 'consumer goods trader'    },
  { vertical: 'fmcg',         keyword: 'beverage importer'        },

  // Commodities
  { vertical: 'commodities',  keyword: 'commodity trader'         },
  { vertical: 'commodities',  keyword: 'agricultural commodities' },
  { vertical: 'commodities',  keyword: 'grain importer'           },
  { vertical: 'commodities',  keyword: 'sugar trader'             },

  // Industrial
  { vertical: 'industrial',   keyword: 'industrial equipment'     },
  { vertical: 'industrial',   keyword: 'chemical importer'        },
  { vertical: 'industrial',   keyword: 'machinery wholesale'      },

  // Minerals
  { vertical: 'minerals',     keyword: 'minerals trader'          },
  { vertical: 'minerals',     keyword: 'metal importer'           },
  { vertical: 'minerals',     keyword: 'copper cathode trader'    },

  // Oil & Gas
  { vertical: 'oil_gas',      keyword: 'petroleum products'       },
  { vertical: 'oil_gas',      keyword: 'fuel oil trader'          },

  // Sourcing & Logistics
  { vertical: 'sourcing',     keyword: 'global sourcing'          },
  { vertical: 'sourcing',     keyword: 'procurement services'     },
  { vertical: 'sourcing',     keyword: 'freight forwarder'        },

  // Trade Finance
  { vertical: 'finance',      keyword: 'trade finance'            },
  { vertical: 'finance',      keyword: 'letter of credit'         },
];

// ── Companies House API types ─────────────────────────────────────────────────

interface ChCompany {
  company_number:   string;
  title:            string;
  company_type?:    string;
  company_status?:  string;
  date_of_creation?: string;
  registered_office_address?: {
    address_line_1?: string;
    locality?:       string;
    postal_code?:    string;
    country?:        string;
  };
  sic_codes?: string[];
}

interface ChSearchResponse {
  items?: ChCompany[];
  total_results?: number;
}

interface ChOfficer {
  name:           string;
  officer_role:   string;
  resigned_on?:   string;
  nationality?:   string;
  occupation?:    string;
  date_of_birth?: { month: number; year: number };
  address?: {
    address_line_1?: string;
    locality?:       string;
    postal_code?:    string;
    country?:        string;
  };
}

interface ChOfficersResponse {
  items?: ChOfficer[];
  total_results?: number;
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

// ── Utility: delay ────────────────────────────────────────────────────────────

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ── Utility: fetch with timeout + error boundary ──────────────────────────────

async function chFetch<T>(path: string): Promise<T | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  const url = `${CH_BASE}${path}`;

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        Authorization: `Basic ${Buffer.from(`${CH_API_KEY}:`).toString('base64')}`,
        Accept: 'application/json',
      },
    });

    if (!res.ok) {
      hxLogger.warn(MODULE, `CH API ${res.status}`, { path, status: res.status });
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

// ── Utility: write raw JSON to R2 ────────────────────────────────────────────

async function writeToR2(key: string, body: unknown): Promise<void> {
  try {
    await r2.send(new PutObjectCommand({
      Bucket:      R2_BUCKET,
      Key:         key,
      Body:        JSON.stringify(body),
      ContentType: 'application/json',
    }));
    hxLogger.debug(MODULE, 'R2 written', { key });
  } catch (err) {
    hxLogger.error(MODULE, 'R2 write failed', { key, err });
    throw err;
  }
}

// ── Utility: push to BullMQ hx:scrape queue ──────────────────────────────────

async function pushToQueue(
  companyNumber: string,
  companyName: string,
  vertical: string,
  r2Key: string,
): Promise<void> {
  const job: HxQueueJob<{
    company_number: string;
    company_name:   string;
    vertical:       string;
    source:         string;
    r2_key:         string;
  }> = {
    job_id:        randomUUID(),
    job_type:      'companies_house_parse',
    source_module: MODULE,
    attempts:      0,
    created_at:    new Date().toISOString(),
    payload: {
      company_number: companyNumber,
      company_name:   companyName,
      vertical,
      source:         'companies_house',
      r2_key:         r2Key,
    },
  };

  await scrapeQueue.add('companies_house_parse', job, {
    attempts:  3,
    backoff: { type: 'exponential', delay: 5_000 },
    removeOnComplete: { count: 1_000 },
    removeOnFail:     { count: 500 },
  });
}

// ── Utility: write run record to hx_scrape_runs ───────────────────────────────

async function writeScrapeRun(params: {
  runId:    string;
  source:   string;
  startedAt: Date;
  scraped:  number;
  ingested: number;
  rejected: number;
  errors:   number;
  status:   'completed' | 'failed';
  summary:  Record<string, unknown>;
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
      params.scraped,
      params.ingested,
      params.rejected,
      params.errors,
      params.status,
      JSON.stringify(params.summary),
    ],
  );
}

// ── Core: scrape one keyword ──────────────────────────────────────────────────

async function scrapeKeyword(
  vk: VerticalKeyword,
  stats: { scraped: number; ingested: number; rejected: number; errors: number },
): Promise<void> {
  const encoded = encodeURIComponent(vk.keyword);
  const searchPath = `/search/companies?q=${encoded}&items_per_page=${CH_ITEMS_PAGE}`;

  await delay(CALL_DELAY_MS);
  const searchResult = await chFetch<ChSearchResponse>(searchPath);

  if (!searchResult?.items?.length) {
    hxLogger.debug(MODULE, 'no results', { keyword: vk.keyword });
    return;
  }

  hxLogger.info(MODULE, `found ${searchResult.items.length} companies`, {
    keyword: vk.keyword,
    vertical: vk.vertical,
  });

  for (const company of searchResult.items) {
    stats.scraped++;

    if (!company.company_number) {
      stats.rejected++;
      continue;
    }

    // Fetch officers — 600 ms gap respected per loop iteration
    await delay(CALL_DELAY_MS);
    const officersResult = await chFetch<ChOfficersResponse>(
      `/company/${company.company_number}/officers?items_per_page=50`,
    );

    if (!officersResult) {
      stats.errors++;
      continue;
    }

    // Skip resigned officers; keep only active
    const activeOfficers = (officersResult.items ?? []).filter(
      (o) => !o.resigned_on,
    );

    const rawRecord = {
      company,
      officers: activeOfficers,
      vertical: vk.vertical,
      keyword:  vk.keyword,
      fetched_at: new Date().toISOString(),
    };

    // Write to R2
    const r2Key = `companies-house/${vk.vertical}/${company.company_number}/${Date.now()}.json`;
    try {
      await writeToR2(r2Key, rawRecord);
    } catch {
      stats.errors++;
      continue;
    }

    // Push to queue
    try {
      await pushToQueue(
        company.company_number,
        company.title ?? '',
        vk.vertical,
        r2Key,
      );
      stats.ingested++;
    } catch (err) {
      hxLogger.error(MODULE, 'queue push failed', { company_number: company.company_number, err });
      stats.errors++;
    }
  }
}

// ── Public entry point ────────────────────────────────────────────────────────

export async function runCompaniesHouseScraper(): Promise<void> {
  const runId    = randomUUID();
  const startedAt = new Date();
  const stats    = { scraped: 0, ingested: 0, rejected: 0, errors: 0 };

  hxLogger.info(MODULE, 'scrape run started', { runId, keywords: VERTICAL_KEYWORDS.length });

  let runStatus: 'completed' | 'failed' = 'completed';

  try {
    for (const vk of VERTICAL_KEYWORDS) {
      try {
        await scrapeKeyword(vk, stats);
      } catch (err) {
        stats.errors++;
        hxLogger.error(MODULE, 'keyword scrape failed', { vertical: vk.vertical, keyword: vk.keyword, err });
      }
    }
  } catch (err) {
    runStatus = 'failed';
    hxLogger.error(MODULE, 'scrape run fatal error', { runId, err });
  }

  // Write scrape run record
  try {
    await writeScrapeRun({
      runId,
      source:    'companies_house',
      startedAt,
      scraped:   stats.scraped,
      ingested:  stats.ingested,
      rejected:  stats.rejected,
      errors:    stats.errors,
      status:    runStatus,
      summary: {
        keywords_processed: VERTICAL_KEYWORDS.length,
        duration_ms: Date.now() - startedAt.getTime(),
      },
    });
  } catch (err) {
    hxLogger.error(MODULE, 'hx_scrape_runs write failed', { runId, err });
  }

  // Bronze event — append-only audit trail
  await bronzeWrite({
    event_type:    'scrape.run.completed',
    source_module: MODULE,
    entity_id:     runId,
    entity_type:   'hx_scrape_run',
    payload: {
      source:    'companies_house',
      status:    runStatus,
      scraped:   stats.scraped,
      ingested:  stats.ingested,
      rejected:  stats.rejected,
      errors:    stats.errors,
      duration_ms: Date.now() - startedAt.getTime(),
    },
  });

  hxLogger.info(MODULE, 'scrape run finished', { runId, runStatus, ...stats });
}
