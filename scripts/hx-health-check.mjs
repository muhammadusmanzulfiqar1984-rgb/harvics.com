/**
 * hx-health-check.mjs — connectivity smoke test for HarvyX Data Bank
 * Tests: Redis (BullMQ), Postgres pool. Exits 0 if both pass, 1 otherwise.
 * Usage: HX_REDIS_URL=... HX_DATABASE_URL=... node scripts/hx-health-check.mjs
 */
import { Queue } from 'bullmq';
import pg from 'pg';

const REDIS_URL = process.env.HX_REDIS_URL;
const DB_URL    = process.env.HX_DATABASE_URL;

let failed = false;

// ── Redis / BullMQ ────────────────────────────────────────────────────────────
try {
  if (!REDIS_URL) throw new Error('HX_REDIS_URL not set');
  const url = new URL(REDIS_URL);
  const queue = new Queue('hx-healthcheck', {
    connection: {
      host: url.hostname,
      port: Number(url.port || 6379),
      username: url.username || undefined,
      password: url.password || undefined,
      tls: url.protocol === 'rediss:' ? {} : undefined,
      maxRetriesPerRequest: 2,
      connectTimeout: 10_000,
    },
  });
  const client = await queue.client;
  const pong = await client.ping();
  console.log(`REDIS: OK (${pong}) host=${url.hostname}`);
  await queue.close();
} catch (e) {
  console.log(`REDIS: FAIL — ${e.message}`);
  failed = true;
}

// ── Postgres ──────────────────────────────────────────────────────────────────
try {
  if (!DB_URL) throw new Error('HX_DATABASE_URL not set');
  const pool = new pg.Pool({ connectionString: DB_URL, connectionTimeoutMillis: 10_000, max: 2 });
  const r = await pool.query("SELECT count(*)::int AS n FROM information_schema.tables WHERE table_schema='public' AND table_name LIKE 'hx_%'");
  console.log(`POSTGRES: OK (${r.rows[0].n} hx_ tables visible)`);
  await pool.end();
} catch (e) {
  console.log(`POSTGRES: FAIL — ${e.message}`);
  failed = true;
}

process.exit(failed ? 1 : 0);
