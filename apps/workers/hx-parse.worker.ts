/**
 * hx-parse.worker.ts — parse + normalise raw scrape records
 * Source: HARVYX_DATABANK_ARCH.md § 4.1
 *
 * Queue consumed: hx:scrape
 * Queue emitted:  hx:email-verify  (when individual name known)
 *                 hx:icp-score     (company-only records, e.g. ARES phase 1)
 *
 * Concurrency: 20
 * Idempotent:  ON CONFLICT (source, source_id) DO UPDATE — safe to retry
 */

import { Worker, Queue }                      from 'bullmq';
import { S3Client, GetObjectCommand }          from '@aws-sdk/client-s3';
import { randomUUID }                          from 'crypto';

import { bronzeWrite }        from '../../packages/lib/hx-bronze';
import { hxLogger }           from '../../packages/lib/hx-logger';
import { inferDomain }        from '../../packages/lib/hx-domain-inferrer';
import { inferEmailPatterns } from '../../packages/lib/hx-email-verifier';
import type { HxQueueJob, HxSource } from '../../packages/types/hx.types';
import { pool } from '../../packages/db';

// ── Config ────────────────────────────────────────────────────────────────────

const REDIS_URL   = process.env.HX_REDIS_URL            ?? 'redis://localhost:6379';
const R2_ENDPOINT = process.env.HX_R2_ENDPOINT          ?? '';
const R2_BUCKET   = process.env.HX_R2_BUCKET            ?? 'harvyx-raw';
const R2_KEY_ID   = process.env.HX_R2_ACCESS_KEY_ID     ?? '';
const R2_SECRET   = process.env.HX_R2_SECRET_ACCESS_KEY ?? '';
const MODULE      = 'hx-parse.worker';
const BATCH_SIZE  = 10;

/** Shared BullMQ Redis connection — exponential backoff on transient errors. */
const redisConnection = {
  url: REDIS_URL,
  maxRetriesPerRequest: null as null,
  retryStrategy: (times: number): number => Math.min(200 * 2 ** (times - 1), 8_000),
  reconnectOnError: (err: Error): boolean => /READONLY|ETIMEDOUT|ECONNRESET/i.test(err.message),
};

// ── Singletons ────────────────────────────────────────────────────────────────


const r2 = new S3Client({
  region:   'auto',
  endpoint: R2_ENDPOINT,
  credentials: { accessKeyId: R2_KEY_ID, secretAccessKey: R2_SECRET },
});

const emailVerifyQueue = new Queue('hx-email-verify', {
  connection: redisConnection,
});

const icpScoreQueue = new Queue('hx-icp-score', {
  connection: redisConnection,
});

type DownstreamBulkJob = {
  name: string;
  data: HxQueueJob<Record<string, unknown>>;
  opts: Record<string, unknown>;
};

/** Flush accumulated downstream jobs via addBulk (10 per Redis round-trip). */
async function flushDownstreamJobs(
  verifyJobs: DownstreamBulkJob[],
  icpJobs: DownstreamBulkJob[],
): Promise<void> {
  const flush = async (queue: Queue, jobs: DownstreamBulkJob[]): Promise<void> => {
    for (let i = 0; i < jobs.length; i += BATCH_SIZE) {
      const chunk = jobs.slice(i, i + BATCH_SIZE);
      await queue.addBulk(chunk);
    }
  };

  await Promise.all([
    verifyJobs.length ? flush(emailVerifyQueue, verifyJobs) : Promise.resolve(),
    icpJobs.length    ? flush(icpScoreQueue, icpJobs)       : Promise.resolve(),
  ]);
}

// ── Country normalisation map ─────────────────────────────────────────────────
// Maps raw registry strings → ISO 3166-1 alpha-2 lower-case

const COUNTRY_MAP: Record<string, string> = {
  'united kingdom': 'gb', 'england': 'gb', 'scotland': 'gb', 'wales': 'gb',
  'northern ireland': 'gb', 'gb': 'gb', 'uk': 'gb',
  'poland': 'pl', 'polska': 'pl', 'pl': 'pl',
  'czech republic': 'cz', 'czechia': 'cz', 'česká republika': 'cz', 'cz': 'cz',
  'germany': 'de', 'deutschland': 'de', 'de': 'de',
  'austria': 'at', 'österreich': 'at', 'at': 'at',
  'france': 'fr', 'fr': 'fr',
  'italy': 'it', 'italia': 'it', 'it': 'it',
  'netherlands': 'nl', 'nederland': 'nl', 'nl': 'nl',
  'belgium': 'be', 'belgique': 'be', 'be': 'be',
  'spain': 'es', 'españa': 'es', 'es': 'es',
  'sweden': 'se', 'sverige': 'se', 'se': 'se',
  'denmark': 'dk', 'danmark': 'dk', 'dk': 'dk',
  'norway': 'no', 'norge': 'no', 'no': 'no',
  'finland': 'fi', 'suomi': 'fi', 'fi': 'fi',
  'switzerland': 'ch', 'schweiz': 'ch', 'ch': 'ch',
  'turkey': 'tr', 'türkiye': 'tr', 'tr': 'tr',
  'uae': 'ae', 'united arab emirates': 'ae', 'ae': 'ae',
  'hungary': 'hu', 'magyarország': 'hu', 'hu': 'hu',
  'romania': 'ro', 'românia': 'ro', 'ro': 'ro',
  'slovakia': 'sk', 'slovensko': 'sk', 'sk': 'sk',
  'portugal': 'pt', 'pt': 'pt',
  'greece': 'gr', 'ελλάδα': 'gr', 'gr': 'gr',
};

function normaliseCountry(raw: string | null | undefined): string | null {
  if (!raw) return null;
  return COUNTRY_MAP[raw.trim().toLowerCase()] ?? raw.trim().toLowerCase().slice(0, 2) ?? null;
}

function normaliseVertical(raw: string | null | undefined): string | null {
  if (!raw) return null;
  return raw.trim().toLowerCase().replace(/\s+/g, '_');
}

function normaliseName(raw: string | null | undefined): string | null {
  if (!raw) return null;
  return raw.trim().replace(/\s{2,}/g, ' ') || null;
}

// ── R2 reader ─────────────────────────────────────────────────────────────────

async function readR2<T>(key: string): Promise<T | null> {
  try {
    const obj = await r2.send(new GetObjectCommand({ Bucket: R2_BUCKET, Key: key }));
    const text = await obj.Body?.transformToString();
    if (!text) return null;
    return JSON.parse(text) as T;
  } catch (err) {
    hxLogger.error(MODULE, 'R2 read failed', { key, err });
    return null;
  }
}

// ── Source-specific extractors ────────────────────────────────────────────────

interface NormalisedContact {
  source:       HxSource;
  source_id:    string;
  first_name:   string | null;
  last_name:    string | null;
  full_name:    string | null;
  title:        string | null;
  company_name: string | null;
  company_domain: string | null;
  country:      string | null;
  vertical:     string | null;
  phone:        string | null;
  linkedin_url: string | null;
  email_pattern: string | null;
  raw_json:     Record<string, unknown>;
}

function parseCompaniesHouseRecord(raw: Record<string, unknown>): NormalisedContact[] {
  const company = raw['company'] as Record<string, unknown> | undefined;
  const officers = (raw['officers'] as Array<Record<string, unknown>>) ?? [];
  const vertical = normaliseVertical(raw['vertical'] as string);
  const companyName = normaliseName(company?.['title'] as string);
  const addr = company?.['registered_office_address'] as Record<string, unknown> | undefined;
  const country = normaliseCountry(addr?.['country'] as string);
  const companyNumber = company?.['company_number'] as string ?? '';
  const domain = companyName ? inferDomain(companyName) : null;

  if (!officers.length) {
    // No officers — create company-level contact
    return [{
      source:         'companies_house',
      source_id:      companyNumber,
      first_name:     null,
      last_name:      null,
      full_name:      companyName,
      title:          null,
      company_name:   companyName,
      company_domain: domain,
      country,
      vertical,
      phone:          null,
      linkedin_url:   null,
      email_pattern:  null,
      raw_json:       raw,
    }];
  }

  return officers.map((officer) => {
    const fullName = normaliseName(officer['name'] as string);
    const nameParts = (fullName ?? '').split(',')[0].trim().split(/\s+/);
    const lastName   = nameParts[0] ?? null;           // CH name format: "SMITH JOHN"
    const firstName  = nameParts.slice(1).join(' ') || null;
    const role       = officer['officer_role'] as string | null;
    const titleStr   = normaliseName(officer['occupation'] as string) ?? role;

    return {
      source:         'companies_house',
      source_id:      `${companyNumber}_${(fullName ?? 'unknown').replace(/\s/g, '_').toLowerCase()}`,
      first_name:     firstName,
      last_name:      lastName,
      full_name:      fullName,
      title:          titleStr ?? null,
      company_name:   companyName,
      company_domain: domain,
      country,
      vertical,
      phone:          null,
      linkedin_url:   null,
      email_pattern:  null,
      raw_json:       { ...officer, _company: company },
    };
  });
}

function parseKrsRecord(raw: Record<string, unknown>): NormalisedContact[] {
  const boardMembers = (raw['board_members'] as Array<Record<string, unknown>>) ?? [];
  const vertical    = normaliseVertical(raw['vertical'] as string);
  const companyName = normaliseName(raw['company_name'] as string);
  const siedziba    = raw['siedziba'] as Record<string, unknown> | undefined;
  const country     = normaliseCountry(siedziba?.['kraj'] as string) ?? 'pl';
  const domain      = companyName ? inferDomain(companyName) : null;
  const krsNumber   = raw['krs_number'] as string ?? '';

  if (!boardMembers.length) {
    return [{
      source:         'krs',
      source_id:      krsNumber,
      first_name:     null,
      last_name:      null,
      full_name:      companyName,
      title:          null,
      company_name:   companyName,
      company_domain: domain,
      country,
      vertical,
      phone:          null,
      linkedin_url:   null,
      email_pattern:  null,
      raw_json:       raw,
    }];
  }

  return boardMembers.map((member) => {
    const firstName = normaliseName(member['imiona'] as string);
    const lastName  = normaliseName(member['nazwisko'] as string);
    const fullName  = [firstName, lastName].filter(Boolean).join(' ') || null;
    const title     = normaliseName(member['funkcja'] as string);

    return {
      source:         'krs',
      source_id:      `${krsNumber}_${(fullName ?? 'unknown').replace(/\s/g, '_').toLowerCase()}`,
      first_name:     firstName,
      last_name:      lastName,
      full_name:      fullName,
      title,
      company_name:   companyName,
      company_domain: domain,
      country,
      vertical,
      phone:          null,
      linkedin_url:   null,
      email_pattern:  null,
      raw_json:       { ...member, _company: { krs: krsNumber, name: companyName } },
    };
  });
}

function parseAresRecord(raw: Record<string, unknown>): NormalisedContact[] {
  const vertical    = normaliseVertical(raw['vertical'] as string);
  const companyName = normaliseName(raw['company_name'] as string);
  const sidlo       = raw['sidlo'] as Record<string, unknown> | undefined;
  const country     = normaliseCountry(sidlo?.['nazevStatu'] as string) ?? 'cz';
  const domain      = companyName ? inferDomain(companyName) : null;
  const ico         = raw['ico'] as string ?? '';

  // Phase 1: company record only, no directors
  return [{
    source:         'ares',
    source_id:      ico,
    first_name:     null,
    last_name:      null,
    full_name:      companyName,
    title:          null,
    company_name:   companyName,
    company_domain: domain,
    country,
    vertical,
    phone:          null,
    linkedin_url:   null,
    email_pattern:  null,
    raw_json:       raw,
  }];
}

// ── DB upsert ─────────────────────────────────────────────────────────────────

async function upsertContact(contact: NormalisedContact): Promise<string> {
  const { rows } = await pool.query<{ id: string }>(
    `INSERT INTO hx_contacts (
       id, source, source_id, first_name, last_name, full_name, title,
       company_name, company_domain, country, vertical,
       phone, linkedin_url, email_pattern, raw_json
     ) VALUES (
       gen_random_uuid(), $1, $2, $3, $4, $5, $6,
       $7, $8, $9, $10,
       $11, $12, $13, $14
     )
     ON CONFLICT (source, source_id) DO UPDATE SET
       full_name      = EXCLUDED.full_name,
       title          = EXCLUDED.title,
       company_name   = EXCLUDED.company_name,
       company_domain = EXCLUDED.company_domain,
       country        = EXCLUDED.country,
       vertical       = EXCLUDED.vertical,
       phone          = EXCLUDED.phone,
       linkedin_url   = EXCLUDED.linkedin_url,
       email_pattern  = EXCLUDED.email_pattern,
       raw_json       = EXCLUDED.raw_json,
       updated_at     = NOW()
     RETURNING id`,
    [
      contact.source,
      contact.source_id,
      contact.first_name,
      contact.last_name,
      contact.full_name,
      contact.title,
      contact.company_name,
      contact.company_domain,
      contact.country,
      contact.vertical,
      contact.phone,
      contact.linkedin_url,
      contact.email_pattern,
      JSON.stringify(contact.raw_json),
    ],
  );

  return rows[0].id;
}

// ── Worker ────────────────────────────────────────────────────────────────────

type ScrapeJobPayload = {
  source:         string;
  r2_key:         string;
  company_number?: string;
  krs_number?:     string;
  ico?:            string;
  company_name?:   string;
  vertical?:       string;
};

const worker = new Worker<HxQueueJob<ScrapeJobPayload>>(
  'hx-scrape',
  async (job) => {
    const { source, r2_key } = job.data.payload;

    const raw = await readR2<Record<string, unknown>>(r2_key);
    if (!raw) throw new Error(`R2 read returned null for key: ${r2_key}`);

    // Extract normalised contacts by source
    let contacts: NormalisedContact[];
    if (source === 'companies_house') {
      contacts = parseCompaniesHouseRecord(raw);
    } else if (source === 'krs') {
      contacts = parseKrsRecord(raw);
    } else if (source === 'ares') {
      contacts = parseAresRecord(raw);
    } else {
      hxLogger.warn(MODULE, 'unknown source, skipping', { source, jobId: job.id });
      return;
    }

    const verifyJobs: DownstreamBulkJob[] = [];
    const icpJobs: DownstreamBulkJob[]    = [];

    for (const contact of contacts) {
      const contactId = await upsertContact(contact);

      const hasName = Boolean(contact.first_name && contact.last_name);
      const domain  = contact.company_domain;

      if (hasName && domain) {
        const candidates = inferEmailPatterns(
          contact.first_name!,
          contact.last_name!,
          domain,
        );
        const emailPattern = candidates[0] ?? null;

        if (emailPattern) {
          await pool.query(
            `UPDATE hx_contacts SET email_pattern = $1 WHERE id = $2`,
            [emailPattern, contactId],
          );
        }

        verifyJobs.push({
          name: 'email_verify',
          data: {
            job_id:        randomUUID(),
            job_type:      'email_verify',
            source_module: MODULE,
            attempts:      0,
            created_at:    new Date().toISOString(),
            payload:       { contact_id: contactId, candidates },
          },
          opts: {
            attempts: 2,
            backoff:  { type: 'fixed', delay: 10_000 },
            removeOnComplete: { count: 2_000 },
            removeOnFail:     { count: 500 },
          },
        });
      } else {
        icpJobs.push({
          name: 'icp_score',
          data: {
            job_id:        randomUUID(),
            job_type:      'icp_score',
            source_module: MODULE,
            attempts:      0,
            created_at:    new Date().toISOString(),
            payload:       { contact_id: contactId },
          },
          opts: {
            attempts: 3,
            removeOnComplete: { count: 2_000 },
            removeOnFail:     { count: 500 },
          },
        });
      }

      await bronzeWrite({
        event_type:    'contact.ingested',
        source_module: MODULE,
        entity_id:     contactId,
        entity_type:   'hx_contact',
        payload: {
          source,
          company_name: contact.company_name,
          country:      contact.country,
          vertical:     contact.vertical,
          has_name:     hasName,
        },
      });
    }

    await flushDownstreamJobs(verifyJobs, icpJobs);

    hxLogger.info(MODULE, 'job processed', {
      jobId:    job.id,
      source,
      contacts: contacts.length,
    });
  },
  {
    connection:  redisConnection,
    concurrency: 20,
  },
);

worker.on('failed', (job, err) => {
  hxLogger.error(MODULE, 'job failed', {
    jobId:    job?.id,
    jobType:  job?.data?.job_type,
    attempt:  job?.attemptsMade,
    err:      err.message,
  });
});

worker.on('error', (err) => {
  hxLogger.error(MODULE, 'worker error', { err: err.message });
});

hxLogger.info(MODULE, 'worker started', { concurrency: 20, queue: 'hx-scrape' });

export { worker };
