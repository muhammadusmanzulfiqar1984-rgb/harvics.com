/**
 * hx-scrape-orchestrator.ts — Cloudflare Worker cron orchestrator
 * Source: HARVYX_DATABANK_ARCH.md § 6
 *
 * Cron: 0 * /6 * * *  (every 6 hours)
 *
 * Responsibilities per tick:
 *  1. KV rate-gate each source — max 4 runs / source / day
 *  2. Trigger all scrapers in parallel via SCRAPE_QUEUE messages
 *  3. Write orchestration run summary to hx_scrape_runs (Hyperdrive → Postgres)
 *  4. Inline bronzeWrite scrape.run.completed
 *  5. Delete R2 objects flagged as parsed (keys listed in KV parse-registry)
 *
 * No Node.js APIs. Cloudflare bindings only.
 */

import postgres from 'postgres';

// ── Env interface (must match wrangler.toml bindings) ────────────────────────

export interface Env {
  // Cloudflare Queue — orchestration trigger messages
  SCRAPE_QUEUE: Queue;

  // KV — rate counters + R2 parsed-key registry
  RATE_KV: KVNamespace;

  // R2 — raw scrape data store
  R2_BUCKET: R2Bucket;

  // Hyperdrive — Postgres connection pooling
  HYPERDRIVE: Hyperdrive;

  // Secrets
  COMPANIES_HOUSE_API_KEY: string;
  APOLLO_API_KEY:          string;
  LUSHA_API_KEY:           string;
  HX_DATABASE_URL:         string;   // fallback if Hyperdrive unavailable
}

// ── Constants ─────────────────────────────────────────────────────────────────

const SOURCES = ['companies_house', 'krs', 'ares'] as const;
type Source = typeof SOURCES[number];

const MAX_RUNS_PER_DAY      = 4;    // cron fires every 6 h → 4 × per day
const R2_PARSED_REGISTRY_NS = 'r2:parsed:';   // KV key prefix for parsed R2 objects
const R2_PARSED_MAX_AGE_H   = 24;
const MODULE                = 'hx-scrape-orchestrator';

// ── KV helpers ────────────────────────────────────────────────────────────────

function rateCtrKey(source: Source, dateStr: string): string {
  return `rate:${source}:${dateStr}`;
}

async function checkAndIncrementRate(
  kv: KVNamespace,
  source: Source,
  dateStr: string,
): Promise<{ allowed: boolean; count: number }> {
  const key   = rateCtrKey(source, dateStr);
  const raw   = await kv.get(key);
  const count = parseInt(raw ?? '0', 10);

  if (count >= MAX_RUNS_PER_DAY) {
    return { allowed: false, count };
  }

  // Increment; expire at midnight + 1h buffer (90 000 s)
  await withRedisBackoff(
    () => kv.put(key, String(count + 1), { expirationTtl: 90_000 }),
    'kv.put.rate',
  );
  return { allowed: true, count: count + 1 };
}

// ── Queue trigger ─────────────────────────────────────────────────────────────

interface ScrapeOrchestratorMessage {
  scraper:    Source;
  run_id:     string;
  triggered_at: string;
}

/** Exponential backoff retry for KV / Queue / R2 transient errors. */
async function withRedisBackoff<T>(
  fn: () => Promise<T>,
  label: string,
  maxAttempts = 4,
): Promise<T> {
  let lastErr: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (attempt === maxAttempts) break;
      const delayMs = Math.min(200 * 2 ** (attempt - 1), 5_000);
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error(`${label} failed`);
}

async function triggerScrapersBulk(
  queue: Queue,
  sources: Source[],
  runId: string,
): Promise<void> {
  if (!sources.length) return;

  const messages = sources.map((source) => ({
    body: {
      scraper:      source,
      run_id:       `${runId}:${source}`,
      triggered_at: new Date().toISOString(),
    } satisfies ScrapeOrchestratorMessage,
    contentType: 'json' as const,
  }));

  await withRedisBackoff(
    () => queue.sendBatch(messages),
    'queue.sendBatch',
  );
}

// ── Postgres helpers (via Hyperdrive) ─────────────────────────────────────────

type SqlClient = ReturnType<typeof postgres>;

function getDbClient(env: Env): SqlClient {
  return postgres(env.HYPERDRIVE.connectionString, { max: 5 });
}

async function writeScrapeRunRecord(
  sql: SqlClient,
  params: {
    runId:     string;
    source:    Source;
    status:    'completed' | 'failed';
    triggered: boolean;
    skipped:   boolean;
    reason?:   string;
  },
): Promise<void> {
  await sql`
    INSERT INTO hx_scrape_runs
      (id, source, started_at, completed_at,
       records_scraped, records_ingested, records_rejected,
       error_count, status, summary)
    VALUES (
      ${params.runId}, ${params.source}, NOW(), NOW(),
      0, 0, 0, 0, ${params.status},
      ${JSON.stringify({
        orchestrated: true,
        triggered:    params.triggered,
        skipped:      params.skipped,
        reason:       params.reason ?? null,
        module:       MODULE,
      })}
    )
    ON CONFLICT (id) DO NOTHING
  `;
}

async function writeBronzeEvent(
  sql: SqlClient,
  params: {
    runId:   string;
    source:  Source;
    payload: Record<string, unknown>;
  },
): Promise<void> {
  await sql`
    INSERT INTO hx_events_bronze
      (event_type, source_module, entity_id, entity_type, payload)
    VALUES (
      'scrape.run.completed',
      ${MODULE},
      ${params.runId},
      'hx_scrape_run',
      ${JSON.stringify(params.payload)}
    )
  `;
}

// ── R2 cleanup — delete objects flagged as parsed ─────────────────────────────
// After the parse worker successfully processes a raw file, it writes the
// R2 key to KV under the namespace `r2:parsed:{key}` with a timestamp value.
// This routine lists all such KV entries, checks age, and deletes from R2.

async function cleanupParsedR2Objects(
  kv: KVNamespace,
  r2: R2Bucket,
): Promise<{ deleted: number; errors: number }> {
  let deleted = 0;
  let errors  = 0;
  const cutoff = Date.now() - R2_PARSED_MAX_AGE_H * 3_600_000;

  let cursor: string | undefined;

  do {
    const list = await kv.list({
      prefix: R2_PARSED_REGISTRY_NS,
      limit:  100,
      cursor,
    });

    for (const kvKey of list.keys) {
      const raw = await kv.get(kvKey.name);
      if (!raw) continue;

      const { r2_key, parsed_at } = JSON.parse(raw) as {
        r2_key:    string;
        parsed_at: string;
      };

      if (new Date(parsed_at).getTime() > cutoff) continue; // too recent

      try {
        await r2.delete(r2_key);
        await kv.delete(kvKey.name);
        deleted++;
      } catch {
        errors++;
      }
    }

    cursor = list.list_complete ? undefined : (list as { cursor?: string }).cursor;
  } while (cursor);

  return { deleted, errors };
}

// ── Main orchestration ────────────────────────────────────────────────────────

async function orchestrate(
  event: ScheduledEvent,
  env: Env,
): Promise<void> {
  const now     = new Date(event.scheduledTime);
  const dateStr = now.toISOString().slice(0, 10);   // YYYY-MM-DD

  // ── Step 1: R2 cleanup (fire before scrapers so space is available) ────────
  const { deleted, errors: cleanupErrors } = await cleanupParsedR2Objects(
    env.RATE_KV,
    env.R2_BUCKET,
  );

  // ── Step 2: Rate-gate sources, then one sendBatch (fewer queue ops) ───────
  const runId = crypto.randomUUID();
  const gateResults = await Promise.all(
    SOURCES.map(async (source) => {
      const { allowed, count } = await checkAndIncrementRate(
        env.RATE_KV,
        source,
        dateStr,
      );
      return { source, allowed, count };
    }),
  );

  const toTrigger = gateResults.filter((g) => g.allowed).map((g) => g.source);
  if (toTrigger.length) {
    await triggerScrapersBulk(env.SCRAPE_QUEUE, toTrigger, runId);
  }

  const results: PromiseSettledResult<{
    source: Source;
    triggered: boolean;
    skipped: boolean;
    reason?: string;
  }>[] = gateResults.map((g) => ({
    status: 'fulfilled' as const,
    value: g.allowed
      ? { source: g.source, triggered: true, skipped: false }
      : { source: g.source, triggered: false, skipped: true, reason: `rate_limit:${g.count}` },
  }));

  // ── Step 3: DB writes (Hyperdrive) ─────────────────────────────────────────
  const sql = getDbClient(env);

  try {
    for (const result of results) {
      const outcome = result.status === 'fulfilled'
        ? result.value
        : { source: 'unknown' as Source, triggered: false, skipped: false, reason: String((result as PromiseRejectedResult).reason) };

      await writeScrapeRunRecord(sql, {
        runId:     `${runId}:${outcome.source}`,
        source:    outcome.source,
        status:    'completed',
        triggered: outcome.triggered,
        skipped:   outcome.skipped,
        reason:    outcome.reason,
      });

      await writeBronzeEvent(sql, {
        runId:  `${runId}:${outcome.source}`,
        source: outcome.source,
        payload: {
          orchestrator_run_id: runId,
          triggered:           outcome.triggered,
          skipped:             outcome.skipped,
          reason:              outcome.reason ?? null,
          r2_cleaned:          deleted,
          r2_clean_errors:     cleanupErrors,
          cron_time:           now.toISOString(),
        },
      });
    }
  } finally {
    await sql.end();
  }
}

// ── Cloudflare Worker export ──────────────────────────────────────────────────

export default {
  async scheduled(
    event: ScheduledEvent,
    env: Env,
    ctx: ExecutionContext,
  ): Promise<void> {
    ctx.waitUntil(orchestrate(event, env));
  },
} satisfies ExportedHandler<Env>;
