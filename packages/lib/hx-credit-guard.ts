/**
 * hx-credit-guard.ts — Apollo + Lusha credit monitoring
 * Source: HARVYX_BACKEND_RULES.md § 8
 *
 * Rules:
 *  - checkApolloCredits() → WhatsApp alert if remaining < 20
 *  - checkLushaCredits()  → WhatsApp alert if remaining < 10
 *  - Both write bronzeWrite({ event_type: 'credits.checked' })
 *  - Both return the remaining credit count (or -1 if unknown)
 *  - Neither throws — callers treat -1 as "proceed with caution"
 *
 * Called from:
 *  - hx-apollo-enrich.worker (before each batch)
 *  - hx-lusha-reveal.worker  (before each reveal)
 *  - hx-scrape-orchestrator  (on cron tick)
 */

import { Queue }        from 'bullmq';
import { bronzeWrite }  from './hx-bronze';
import { hxLogger }     from './hx-logger';
import type { HxQueueJob, HxWhatsAppNotification } from '../types/hx.types';

// ── Config ────────────────────────────────────────────────────────────────────

const APOLLO_API_KEY  = process.env.APOLLO_API_KEY  ?? '';
const LUSHA_API_KEY   = process.env.LUSHA_API_KEY   ?? '';
const REDIS_URL       = process.env.HX_REDIS_URL    ?? 'redis://localhost:6379';
const OPERATOR_WA     = process.env.HX_OPERATOR_WHATSAPP ?? '';

const APOLLO_CREDIT_THRESHOLD = 20;
const LUSHA_CREDIT_THRESHOLD  = 10;
const FETCH_TIMEOUT           = 8_000;
const MODULE                  = 'hx-credit-guard';

// ── Queue for alert dispatch ──────────────────────────────────────────────────

let _notifyQueue: Queue | null = null;

function notifyQueue(): Queue {
  if (!_notifyQueue) {
    _notifyQueue = new Queue('hx-notify', { connection: { url: REDIS_URL } });
  }
  return _notifyQueue;
}

// ── Fetch helper ──────────────────────────────────────────────────────────────

async function guardFetch<T>(
  url:     string,
  options: RequestInit,
): Promise<T | null> {
  const controller = new AbortController();
  const timer      = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

// ── WhatsApp alert helper ─────────────────────────────────────────────────────

async function sendCreditAlert(
  provider:  'Apollo' | 'Lusha',
  remaining: number,
  threshold: number,
): Promise<void> {
  if (!OPERATOR_WA) return;

  const notification: HxWhatsAppNotification = {
    to:        OPERATOR_WA,
    type:      'alert',
    module:    MODULE,
    headline:  `${provider} credits low — ${remaining} remaining`,
    body: [
      `Provider: ${provider}`,
      `Remaining credits: ${remaining}`,
      `Alert threshold: ${threshold}`,
      `Enrichment pipeline will pause automatically when credits hit 0.`,
      `Top up at: ${provider === 'Apollo' ? 'app.apollo.io' : 'lusha.com/upgrade'}`,
    ].join('\n'),
    timestamp: new Date().toISOString(),
  };

  const job: HxQueueJob<HxWhatsAppNotification> = {
    job_id:        crypto.randomUUID(),
    job_type:      'notify_credit_alert',
    source_module: MODULE,
    attempts:      0,
    created_at:    new Date().toISOString(),
    payload:       notification,
  };

  try {
    await notifyQueue().add('notify_credit_alert', job, {
      attempts: 2,
      removeOnComplete: { count: 200 },
      removeOnFail:     { count: 100 },
    });
    hxLogger.info(MODULE, `${provider} credit alert queued`, { remaining, threshold });
  } catch (err) {
    hxLogger.error(MODULE, 'failed to queue credit alert', {
      provider,
      err: err instanceof Error ? err.message : String(err),
    });
  }
}

// ── Apollo credit check ───────────────────────────────────────────────────────

interface ApolloHealthResponse {
  is_logged_in?:               boolean;
  credits_used_current_month?: number;
  credits_limit_monthly?:      number;
}

/**
 * checkApolloCredits
 * Calls Apollo /auth/health, derives remaining credits.
 * Fires WhatsApp alert if remaining < APOLLO_CREDIT_THRESHOLD (20).
 * Always writes bronzeWrite('credits.checked').
 * Returns remaining count or -1 if unknown.
 */
export async function checkApolloCredits(): Promise<number> {
  if (!APOLLO_API_KEY) {
    hxLogger.warn(MODULE, 'APOLLO_API_KEY not set');
    return -1;
  }

  const health = await guardFetch<ApolloHealthResponse>(
    'https://api.apollo.io/v1/auth/health',
    { headers: { 'X-Api-Key': APOLLO_API_KEY, 'Cache-Control': 'no-cache' } },
  );

  let remaining = -1;

  if (health) {
    if (health.is_logged_in === false) {
      hxLogger.error(MODULE, 'Apollo API key invalid');
      remaining = 0;
    } else if (
      typeof health.credits_limit_monthly    === 'number' &&
      typeof health.credits_used_current_month === 'number'
    ) {
      remaining = health.credits_limit_monthly - health.credits_used_current_month;
    }
  }

  hxLogger.debug(MODULE, 'Apollo credits checked', { remaining });

  // Alert if below threshold (and we have a real number)
  if (remaining !== -1 && remaining < APOLLO_CREDIT_THRESHOLD) {
    await sendCreditAlert('Apollo', remaining, APOLLO_CREDIT_THRESHOLD);
  }

  // Append-only audit trail
  await bronzeWrite({
    event_type:    'credits.checked',
    source_module: MODULE,
    payload: {
      provider:          'apollo',
      remaining,
      threshold:         APOLLO_CREDIT_THRESHOLD,
      alert_sent:        remaining !== -1 && remaining < APOLLO_CREDIT_THRESHOLD,
      key_valid:         health?.is_logged_in !== false,
    },
  }).catch((err) => {
    hxLogger.warn(MODULE, 'bronzeWrite failed for Apollo check', {
      err: err instanceof Error ? err.message : String(err),
    });
  });

  return remaining;
}

// ── Lusha credit check ────────────────────────────────────────────────────────

interface LushaUsageResponse {
  data?: {
    credits?: {
      remaining?: number;
      used?:      number;
      total?:     number;
    };
  };
}

/**
 * checkLushaCredits
 * Calls Lusha /usage, reads remaining credits.
 * Fires WhatsApp alert if remaining < LUSHA_CREDIT_THRESHOLD (10).
 * Always writes bronzeWrite('credits.checked').
 * Returns remaining count or -1 if unknown.
 */
export async function checkLushaCredits(): Promise<number> {
  if (!LUSHA_API_KEY) {
    hxLogger.warn(MODULE, 'LUSHA_API_KEY not set');
    return -1;
  }

  const usage = await guardFetch<LushaUsageResponse>(
    'https://api.lusha.com/usage',
    { headers: { 'api_key': LUSHA_API_KEY } },
  );

  const remaining = usage?.data?.credits?.remaining ?? -1;

  hxLogger.debug(MODULE, 'Lusha credits checked', {
    remaining,
    used:  usage?.data?.credits?.used,
    total: usage?.data?.credits?.total,
  });

  // Alert if below threshold
  if (remaining !== -1 && remaining < LUSHA_CREDIT_THRESHOLD) {
    await sendCreditAlert('Lusha', remaining, LUSHA_CREDIT_THRESHOLD);
  }

  await bronzeWrite({
    event_type:    'credits.checked',
    source_module: MODULE,
    payload: {
      provider:   'lusha',
      remaining,
      threshold:  LUSHA_CREDIT_THRESHOLD,
      alert_sent: remaining !== -1 && remaining < LUSHA_CREDIT_THRESHOLD,
      used:       usage?.data?.credits?.used  ?? null,
      total:      usage?.data?.credits?.total ?? null,
    },
  }).catch((err) => {
    hxLogger.warn(MODULE, 'bronzeWrite failed for Lusha check', {
      err: err instanceof Error ? err.message : String(err),
    });
  });

  return remaining;
}
