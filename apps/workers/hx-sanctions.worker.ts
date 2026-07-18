/**
 * hx-sanctions.worker.ts — OFAC + EU sanctions screening
 * Source: HARVYX_BACKEND_RULES.md § 8, § 11
 *
 * Queue consumed: hx-sanctions
 * Queue emitted:  hx-notify (on blocked)
 *
 * Screens company name + director names against OFAC SDN and EU consolidated
 * lists. Lists cached in Cloudflare KV (24h refresh) with Redis fallback.
 *
 * Result: clear | blocked | manual_review
 * Hard stop on blocked — never proceed to payment.
 *
 * Concurrency: 5
 */

import { Worker, Queue } from 'bullmq';
import { randomUUID }    from 'crypto';
import Redis             from 'ioredis';

import { bronzeWrite }  from '../../packages/lib/hx-bronze';
import { hxLogger }     from '../../packages/lib/hx-logger';
import type { HxQueueJob, HxWhatsAppNotification } from '../../packages/types/hx.types';
import { pool } from '../../packages/db';

// ── Config ────────────────────────────────────────────────────────────────────

const REDIS_URL   = process.env.HX_REDIS_URL              ?? 'redis://localhost:6379';
const CF_ACCOUNT  = process.env.HX_CLOUDFLARE_ACCOUNT_ID   ?? '';
const CF_KV_NS    = process.env.HX_CLOUDFLARE_KV_NAMESPACE ?? '4b280fea825840faae3e4b78be9568f9';
const CF_TOKEN    = process.env.HX_CF_API_TOKEN            ?? process.env.CLOUDFLARE_API_TOKEN ?? '';
const OPERATOR_WA = process.env.HX_OPERATOR_WHATSAPP       ?? '';

const OFAC_URL = 'https://sanctionslistservice.ofac.treas.gov/api/PublicationPreview/exports/XML';
const EU_URL   = 'https://webgate.ec.europa.eu/fsd/fsf/public/files/xmlFullSanctionsList_1_1/content';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const FETCH_TIMEOUT = 30_000;
const MODULE = 'hx-sanctions.worker';

// ── Singletons ────────────────────────────────────────────────────────────────

const redis = new Redis(REDIS_URL, { maxRetriesPerRequest: 3, lazyConnect: true });

const notifyQueue = new Queue('hx-notify', { connection: { url: REDIS_URL, maxRetriesPerRequest: null } });

// ── Types ─────────────────────────────────────────────────────────────────────

type SanctionsResult = 'clear' | 'blocked' | 'manual_review';

interface SanctionsPayload {
  company_id?:     string;
  contact_id?:     string;
  deal_id?:        string;
  company_name:    string;
  director_names?: string[];
  payment_id?:     string;
}

interface ScreenOutcome {
  result:   SanctionsResult;
  matches:  string[];
  subjects: string[];
}

// ── Name helpers ──────────────────────────────────────────────────────────────

/** Normalise a name for fuzzy sanctions matching. */
function normaliseName(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Extract sanction entity names from OFAC / EU XML bodies. */
function extractNamesFromXml(xml: string): string[] {
  const names = new Set<string>();
  const patterns = [
    /<lastName>([^<]+)<\/lastName>/gi,
    /<firstName>([^<]+)<\/firstName>/gi,
    /<wholeName>([^<]+)<\/wholeName>/gi,
    /<nameAlias[^>]*wholeName="([^"]+)"/gi,
    /<sdnEntry>[\s\S]*?<lastName>([^<]+)<\/lastName>/gi,
  ];

  for (const pattern of patterns) {
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(xml)) !== null) {
      const norm = normaliseName(match[1] ?? '');
      if (norm.length >= 3) names.add(norm);
    }
  }

  return Array.from(names);
}

/** Score overlap between two normalised name strings. */
function overlapScore(a: string, b: string): number {
  if (!a || !b) return 0;
  if (a === b || a.includes(b) || b.includes(a)) return 1;
  const aTokens = new Set(a.split(' ').filter(Boolean));
  const bTokens = new Set(b.split(' ').filter(Boolean));
  if (!aTokens.size || !bTokens.size) return 0;
  let shared = 0;
  for (const t of aTokens) if (bTokens.has(t)) shared++;
  return shared / Math.max(aTokens.size, bTokens.size);
}

// ── Cache layer (KV primary, Redis fallback) ──────────────────────────────────

async function kvGet(key: string): Promise<string | null> {
  if (!CF_ACCOUNT || !CF_TOKEN) return null;
  const url = `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT}/storage/kv/namespaces/${CF_KV_NS}/values/${encodeURIComponent(key)}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { Authorization: `Bearer ${CF_TOKEN}` },
    });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

async function kvPut(key: string, value: string): Promise<void> {
  if (!CF_ACCOUNT || !CF_TOKEN) return;
  const url = `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT}/storage/kv/namespaces/${CF_KV_NS}/values/${encodeURIComponent(key)}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT);
  try {
    await fetch(url, {
      method: 'PUT',
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${CF_TOKEN}`,
        'Content-Type': 'text/plain',
      },
      body: value,
    });
  } catch (err) {
    hxLogger.warn(MODULE, 'KV write failed', {
      err: err instanceof Error ? err.message : String(err),
    });
  } finally {
    clearTimeout(timer);
  }
}

async function cacheGet(key: string): Promise<string | null> {
  const kv = await kvGet(key);
  if (kv) return kv;
  try {
    if (redis.status !== 'ready') await redis.connect().catch(() => undefined);
    return await redis.get(`hx:sanctions:${key}`);
  } catch {
    return null;
  }
}

async function cachePut(key: string, value: string): Promise<void> {
  await kvPut(key, value);
  try {
    if (redis.status !== 'ready') await redis.connect().catch(() => undefined);
    await redis.set(`hx:sanctions:${key}`, value, 'EX', 86_400);
  } catch (err) {
    hxLogger.warn(MODULE, 'Redis cache write failed', {
      err: err instanceof Error ? err.message : String(err),
    });
  }
}

/** Download a sanctions XML feed with timeout protection. */
async function downloadXml(url: string): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
    return await res.text();
  } finally {
    clearTimeout(timer);
  }
}

/** Load OFAC + EU name lists, refreshing cache every 24 hours. */
async function loadSanctionsNames(): Promise<string[]> {
  const metaRaw = await cacheGet('meta');
  const now = Date.now();
  if (metaRaw) {
    const meta = JSON.parse(metaRaw) as { refreshed_at: number; count: number };
    if (now - meta.refreshed_at < CACHE_TTL_MS) {
      const cached = await cacheGet('names');
      if (cached) return JSON.parse(cached) as string[];
    }
  }

  const [ofacXml, euXml] = await Promise.all([downloadXml(OFAC_URL), downloadXml(EU_URL)]);
  const names = Array.from(new Set([
    ...extractNamesFromXml(ofacXml),
    ...extractNamesFromXml(euXml),
  ]));

  await cachePut('names', JSON.stringify(names));
  await cachePut('meta', JSON.stringify({ refreshed_at: now, count: names.length }));
  hxLogger.info(MODULE, 'sanctions lists refreshed', { count: names.length });
  return names;
}

// ── Screening ─────────────────────────────────────────────────────────────────

/** Screen subject names against consolidated sanctions lists. */
function screenSubjects(subjects: string[], sanctions: string[]): ScreenOutcome {
  const matches: string[] = [];
  let maxScore = 0;

  for (const subject of subjects) {
    const normSubject = normaliseName(subject);
    if (!normSubject) continue;

    for (const entry of sanctions) {
      const score = overlapScore(normSubject, entry);
      if (score >= 0.85) {
        matches.push(`${subject} ↔ ${entry}`);
        maxScore = Math.max(maxScore, score);
      } else if (score >= 0.6) {
        matches.push(`${subject} ~ ${entry}`);
        maxScore = Math.max(maxScore, score);
      }
    }
  }

  if (maxScore >= 0.85) {
    return { result: 'blocked', matches, subjects };
  }
  if (maxScore >= 0.6) {
    return { result: 'manual_review', matches, subjects };
  }
  return { result: 'clear', matches: [], subjects };
}

async function loadDirectorNames(companyId?: string): Promise<string[]> {
  if (!companyId) return [];
  const { rows } = await pool.query<{ directors: unknown }>(
    `SELECT directors FROM hx_companies WHERE id = $1`,
    [companyId],
  );
  const raw = rows[0]?.directors;
  if (!Array.isArray(raw)) return [];

  return raw
    .map((d) => {
      if (typeof d !== 'object' || d === null) return '';
      const rec = d as Record<string, unknown>;
      return String(rec.name ?? rec.full_name ?? `${rec.first_name ?? ''} ${rec.last_name ?? ''}`).trim();
    })
    .filter(Boolean);
}

async function dispatchBlockedAlert(
  payload: SanctionsPayload,
  outcome: ScreenOutcome,
): Promise<void> {
  const notification: HxWhatsAppNotification = {
    to:         OPERATOR_WA,
    type:       'alert',
    module:     'sanctions-check',
    headline:   `SANCTIONS BLOCK — ${payload.company_name.slice(0, 40)}`,
    body:       `Match flagged on ${outcome.matches[0] ?? 'sanctions list'}. Payment blocked.`,
    entity_name: payload.company_name,
    entity_id:   payload.deal_id ?? payload.contact_id,
    action_url:  payload.deal_id
      ? `https://harvyx.com/governance/sanctions/${payload.deal_id}`
      : undefined,
    timestamp:  new Date().toISOString(),
  };

  const notifyJob: HxQueueJob<HxWhatsAppNotification> = {
    job_id:        randomUUID(),
    job_type:      'notify',
    source_module: MODULE,
    attempts:      0,
    created_at:    new Date().toISOString(),
    payload:       notification,
  };

  await notifyQueue.add('notify', notifyJob, {
    priority: 1,
    attempts: 3,
    removeOnComplete: { count: 500 },
    removeOnFail:     { count: 200 },
  });
}

// ── Worker ────────────────────────────────────────────────────────────────────

const worker = new Worker<HxQueueJob<SanctionsPayload>>(
  'hx-sanctions',
  async (job) => {
    const payload = job.data.payload;
    const directors = [
      ...(payload.director_names ?? []),
      ...(await loadDirectorNames(payload.company_id)),
    ];
    const subjects = [payload.company_name, ...directors].filter(Boolean);

    const sanctions = await loadSanctionsNames();
    const outcome   = screenSubjects(subjects, sanctions);

    await bronzeWrite({
      event_type:    'sanctions.checked',
      source_module: MODULE,
      entity_id:     payload.deal_id ?? payload.contact_id,
      entity_type:   payload.deal_id ? 'hx_pipeline_deal' : 'hx_contact',
      payload: {
        result:      outcome.result,
        company:     payload.company_name,
        matches:     outcome.matches,
        payment_id:  payload.payment_id ?? null,
        hard_stop:   outcome.result === 'blocked',
      },
    });

    if (outcome.result === 'blocked') {
      await dispatchBlockedAlert(payload, outcome);
      hxLogger.warn(MODULE, 'sanctions blocked — hard stop', {
        company: payload.company_name,
        matches: outcome.matches.slice(0, 3),
      });
      return { result: 'blocked', proceed: false };
    }

    hxLogger.info(MODULE, 'sanctions screen complete', {
      company: payload.company_name,
      result:  outcome.result,
    });

    return {
      result:  outcome.result,
      proceed: outcome.result === 'clear',
      matches: outcome.matches,
    };
  },
  {
    connection:  { url: REDIS_URL, maxRetriesPerRequest: null },
    concurrency: 5,
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

hxLogger.info(MODULE, 'worker started', { concurrency: 5, queue: 'hx-sanctions' });

export { worker };
