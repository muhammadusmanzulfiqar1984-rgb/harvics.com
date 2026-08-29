/**
 * HPay Drizzle / Postgres client — SERIALIZABLE isolation for money paths.
 */
import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from './drizzle-schema';

const { Pool } = pg;

let pool: pg.Pool | null = null;
let db: ReturnType<typeof drizzle<typeof schema>> | null = null;

export function getDatabaseUrl() {
  return process.env.DATABASE_URL || '';
}

export function isPostgresEnabled() {
  const engine = (process.env.HPAY_BANK_ENGINE || '').toLowerCase();
  const url = getDatabaseUrl();
  if (engine === 'sqlite') return false;
  if (engine === 'postgres' || engine === 'postgresql') return Boolean(url);
  return Boolean(url);
}

export function getPool() {
  if (!isPostgresEnabled()) {
    throw new Error('DATABASE_URL not configured — set HPAY_BANK_ENGINE=postgres and DATABASE_URL');
  }
  if (!pool) {
    pool = new Pool({
      connectionString: getDatabaseUrl(),
      max: Number(process.env.PG_POOL_MAX || 10),
      ssl: process.env.PG_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
    });
  }
  return pool;
}

export function getDb() {
  if (!db) {
    db = drizzle(getPool(), { schema });
  }
  return db;
}

/** Run work under SERIALIZABLE isolation (exactly-once money semantics). */
export async function withSerializable<T>(fn: (client: pg.PoolClient) => Promise<T>): Promise<T> {
  const client = await getPool().connect();
  try {
    await client.query('BEGIN ISOLATION LEVEL SERIALIZABLE');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (e) {
    try {
      await client.query('ROLLBACK');
    } catch {
      /* ignore */
    }
    throw e;
  } finally {
    client.release();
  }
}

export async function applySchemaSql(sqlText: string) {
  const client = await getPool().connect();
  try {
    await client.query(sqlText);
  } finally {
    client.release();
  }
}

export { schema };
