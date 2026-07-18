/**
 * packages/db/index.ts — shared Postgres pool singleton
 *
 * Every worker, repository, and utility that needs DB access imports
 * from here. A single pool is created per process — no duplicate
 * connections spawned across modules.
 *
 * Workers that already hold their own local Pool can be migrated here
 * incrementally; this export is the canonical instance going forward.
 */

import { Pool, PoolConfig } from 'pg';
import { hxLogger }         from '../lib/hx-logger';

const MODULE = 'packages/db';

const config: PoolConfig = {
  connectionString:        process.env.HX_DATABASE_URL,
  max:                     5,
  idleTimeoutMillis:       10_000,
  connectionTimeoutMillis: 5_000,
  // Allow SSL in production (Neon, Supabase, RDS, etc.)
  ssl: { rejectUnauthorized: false },
};

export const pool = new Pool(config);

pool.on('connect', () => {
  hxLogger.debug(MODULE, 'pg pool: new client connected');
});

pool.on('error', (err: Error) => {
  hxLogger.error(MODULE, 'pg pool idle client error', { err: err.message });
});

/**
 * Gracefully drain all idle connections.
 * Call during process shutdown — after all workers have stopped.
 */
export async function closePool(): Promise<void> {
  await pool.end();
  hxLogger.info(MODULE, 'pg pool closed');
}
