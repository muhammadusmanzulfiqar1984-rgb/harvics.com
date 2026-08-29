/**
 * Postgres bank driver (production path) — Neon / local.
 * SERIALIZABLE isolation. Balance NEVER stored.
 * Tables live in schema HPAY_PG_SCHEMA (default: hpay) to avoid
 * colliding with HarvyX/CRM tables in public.
 */
const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');

let Pool = null;
try {
  Pool = require('pg').Pool;
} catch {
  Pool = null;
}

function schemaName() {
  const raw = (process.env.HPAY_PG_SCHEMA || 'hpay').trim();
  if (!/^[a-z_][a-z0-9_]*$/i.test(raw)) return 'hpay';
  return raw;
}

function pgEnabled() {
  const engine = (process.env.HPAY_BANK_ENGINE || 'auto').toLowerCase();
  const url = process.env.DATABASE_URL || '';
  if (!url || !Pool) return false;
  if (engine === 'sqlite') return false;
  return true;
}

function sslConfig(url) {
  if (process.env.PG_SSL === 'true' || /neon\.tech/i.test(url) || /sslmode=require/i.test(url)) {
    return { rejectUnauthorized: false };
  }
  return undefined;
}

function createPgPool() {
  if (!pgEnabled()) return null;
  const url = process.env.DATABASE_URL;
  const schema = schemaName();
  const pool = new Pool({
    connectionString: url,
    max: Number(process.env.PG_POOL_MAX || 10),
    ssl: sslConfig(url),
  });
  // Neon pooler rejects search_path in startup options — set per connection
  pool.on('connect', (client) => {
    client.query(`SET search_path TO ${schema}, public`);
  });
  return pool;
}

function createPgBank(pool) {
  const schema = schemaName();

  async function withSerializable(fn) {
    const client = await pool.connect();
    try {
      await client.query(`SET search_path TO ${schema}, public`);
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

  async function migrate() {
    const schemaPath = path.join(__dirname, '..', '..', 'src', 'db', 'schema.sql');
    let sql = fs.readFileSync(schemaPath, 'utf8');

    // Neon-friendly UUIDs (core gen_random_uuid; no uuid-ossp required)
    sql = sql.replace(/uuid_generate_v4\(\)/g, 'gen_random_uuid()');
    sql = sql.replace(/CREATE EXTENSION IF NOT EXISTS "uuid-ossp";\s*/g, '');
    sql = sql.replace(/CREATE EXTENSION IF NOT EXISTS "pgcrypto";\s*/g, '');

    await pool.query(`CREATE SCHEMA IF NOT EXISTS ${schema}`);
    await pool.query(`SET search_path TO ${schema}, public`);

    // Try optional extensions (ignore if not permitted)
    for (const ext of ['pgcrypto', 'uuid-ossp']) {
      try {
        await pool.query(`CREATE EXTENSION IF NOT EXISTS "${ext}"`);
      } catch {
        /* Neon Free may already provide gen_random_uuid in core */
      }
    }

    const exists = await pool.query(`SELECT to_regclass($1) AS t`, [`${schema}.organizations`]);
    if (exists.rows[0]?.t) {
      return { ok: true, skipped: true, schema, schemaPath };
    }

    // Enum may already exist from a partial run
    sql = sql.replace(/CREATE TYPE account_type AS ENUM \([\s\S]*?\);/, () =>
      `DO $$ BEGIN
  CREATE TYPE account_type AS ENUM ('ASSET','LIABILITY','EQUITY','REVENUE','EXPENSE','ESCROW');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;`
    );

    await pool.query(sql);
    return { ok: true, skipped: false, schema, schemaPath };
  }

  async function getBalance(accountId) {
    const { rows } = await pool.query(
      `SELECT
         CASE
           WHEN a.type IN ('ASSET', 'EXPENSE')
             THEN COALESCE(SUM(l.debit),0) - COALESCE(SUM(l.credit),0)
           ELSE
             COALESCE(SUM(l.credit),0) - COALESCE(SUM(l.debit),0)
         END AS balance
       FROM accounts a
       LEFT JOIN ledger_lines l ON l.account_id = a.id
       WHERE a.id = $1
       GROUP BY a.id, a.type`,
      [accountId]
    );
    const bal = Number(rows[0]?.balance || 0);
    return Math.round(bal * 100);
  }

  async function upsertIdempotency({ key, orgId, requestPath, requestHash, lockedUntil }) {
    await pool.query(
      `INSERT INTO idempotency_keys (key, org_id, request_path, request_hash, status, locked_until)
       VALUES ($1,$2,$3,$4,'PROCESSING',$5)
       ON CONFLICT (key) DO NOTHING`,
      [key, orgId, requestPath, requestHash, lockedUntil]
    );
    const { rows } = await pool.query(`SELECT * FROM idempotency_keys WHERE key = $1`, [key]);
    return rows[0] || null;
  }

  async function completeIdempotency(key, statusCode, body, status = 'COMPLETED') {
    await pool.query(
      `UPDATE idempotency_keys
       SET status = $2, response_status = $3, response_body = $4::jsonb, completed_at = NOW(), locked_until = NOW()
       WHERE key = $1`,
      [key, status, statusCode, JSON.stringify(body)]
    );
  }

  async function writeSecurityAudit({ orgId, userId, eventType, ip, userAgent, payload }) {
    const signature = createHash('sha256')
      .update(JSON.stringify({ eventType, payload, at: Date.now() }))
      .digest('hex');
    await pool.query(
      `INSERT INTO security_audit_logs (org_id, user_id, event_type, ip_address, user_agent, signature, payload)
       VALUES ($1,$2,$3,$4,$5,$6,$7::jsonb)`,
      [orgId || null, userId || null, eventType, ip || '0.0.0.0', userAgent || null, signature, JSON.stringify(payload || {})]
    );
  }

  async function writeEnclaveHeader({ orgId, requestId, zkProofId, layers, payload }) {
    await pool.query(
      `INSERT INTO enclave_security_headers
         (org_id, request_id, fips_level, pqc_kem, zk_proof_id, protocol_id, layers_cleared, payload)
       VALUES ($1,$2,'FIPS-140-2-L4','ML-KEM-1024',$3,'HPAY-REAL-MONEY-V2',$4,$5::jsonb)`,
      [
        orgId || null,
        requestId || null,
        zkProofId || null,
        layers || ['L7', 'L6', 'L5', 'L4', 'L3', 'L2', 'L1'],
        JSON.stringify(payload || {}),
      ]
    );
  }

  return {
    pool,
    engine: 'postgres',
    schema,
    withSerializable,
    migrate,
    getBalance,
    upsertIdempotency,
    completeIdempotency,
    writeSecurityAudit,
    writeEnclaveHeader,
    async health() {
      const r = await pool.query('SELECT NOW() AS now, current_database() AS db, current_schema() AS schema');
      return {
        ok: true,
        now: r.rows[0].now,
        database: r.rows[0].db,
        schema: r.rows[0].schema,
        engine: 'postgres',
        provider: /neon\.tech/i.test(process.env.DATABASE_URL || '') ? 'neon' : 'postgres',
      };
    },
    async close() {
      await pool.end();
    },
  };
}

module.exports = { pgEnabled, createPgPool, createPgBank, schemaName };
