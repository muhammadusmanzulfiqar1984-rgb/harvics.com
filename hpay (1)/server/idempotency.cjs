/**
 * L5 — Idempotency & distributed locking
 * Memory store always; persists to Postgres idempotency_keys when pgBank is bound.
 * Enforced on money POSTs (especially /api/v1/payouts*).
 */
const { createHash, randomUUID } = require('node:crypto');

function createIdempotencyStore(options = {}) {
  /** @type {any} */
  let pgBank = options.pgBank || null;
  /** @type {string|null} */
  let defaultOrgId = options.defaultOrgId || null;

  /** @type {Map<string, any>} */
  const keys = new Map();
  const TTL_MS = 24 * 60 * 60 * 1000;

  function bindPg(bank, orgId) {
    pgBank = bank;
    if (orgId) defaultOrgId = orgId;
  }

  function prune() {
    const now = Date.now();
    for (const [k, v] of keys) {
      if (now - v.createdAt > TTL_MS) keys.delete(k);
    }
  }

  function fingerprint(req) {
    const raw = `${req.method}|${req.path}|${JSON.stringify(req.body || {})}`;
    return createHash('sha256').update(raw).digest('hex');
  }

  function middleware(req, res, next) {
    prune();
    if (!['POST', 'PUT', 'PATCH'].includes(req.method)) return next();

    const key =
      req.headers['x-idempotency-key'] ||
      req.headers['idempotency-key'] ||
      req.body?.idempotency_key;

    if (!key || !String(key).trim()) {
      return res.status(400).json({
        error: 'X-Idempotency-Key header required for money path',
        code: 'IDEMPOTENCY_REQUIRED',
        layer: 'L5',
      });
    }

    const id = String(key).trim();
    const hash = fingerprint(req);
    const existing = keys.get(id);
    const now = Date.now();

    const finish = () => {
      keys.set(id, {
        status: 'PROCESSING',
        requestHash: hash,
        lockedUntil: now + 30_000,
        createdAt: now,
      });
      req.idempotencyKey = id;

      const originalJson = res.json.bind(res);
      res.json = (body) => {
        const entry = keys.get(id);
        const statusCode = res.statusCode;
        const status = statusCode >= 400 ? 'FAILED' : 'COMPLETED';
        if (entry) {
          entry.status = status;
          entry.statusCode = statusCode;
          entry.body = body;
          entry.lockedUntil = 0;
          keys.set(id, entry);
        }
        if (pgBank && defaultOrgId) {
          Promise.resolve(
            pgBank.completeIdempotency(id, statusCode, body, status)
          ).catch((e) => console.error('[idempotency] pg complete failed', e.message));
        }
        return originalJson(body);
      };
      next();
    };

    if (existing) {
      if (existing.requestHash && existing.requestHash !== hash) {
        return res.status(409).json({
          error: 'Idempotency key reused with different payload',
          code: 'IDEMPOTENCY_PAYLOAD_MISMATCH',
          layer: 'L5',
        });
      }
      if (existing.status === 'COMPLETED' && existing.body != null) {
        res.setHeader('X-Idempotency-Replay', 'true');
        return res.status(existing.statusCode || 200).json(existing.body);
      }
      if (existing.status === 'PROCESSING' && existing.lockedUntil > now) {
        return res.status(409).json({
          error: 'Request already in flight for this idempotency key',
          code: 'IDEMPOTENCY_IN_FLIGHT',
          layer: 'L5',
        });
      }
    }

    if (pgBank && defaultOrgId) {
      const lockedUntil = new Date(now + 30_000).toISOString();
      Promise.resolve(
        pgBank.upsertIdempotency({
          key: id,
          orgId: defaultOrgId,
          requestPath: req.path,
          requestHash: hash,
          lockedUntil,
        })
      )
        .then((row) => {
          if (row && row.status === 'COMPLETED' && row.response_body) {
            res.setHeader('X-Idempotency-Replay', 'true');
            return res.status(row.response_status || 200).json(row.response_body);
          }
          if (row && row.status === 'PROCESSING' && new Date(row.locked_until).getTime() > now && row.request_hash === hash) {
            // first writer continues
          }
          if (row && row.request_hash && row.request_hash !== hash && row.status === 'COMPLETED') {
            return res.status(409).json({
              error: 'Idempotency key reused with different payload',
              code: 'IDEMPOTENCY_PAYLOAD_MISMATCH',
              layer: 'L5',
            });
          }
          finish();
        })
        .catch((e) => {
          console.error('[idempotency] pg upsert failed, continuing in-memory', e.message);
          finish();
        });
      return;
    }

    finish();
  }

  /** Dedicated stack for /api/v1/payouts* */
  const payoutsOnly = (req, res, next) => middleware(req, res, next);

  return { middleware, payoutsOnly, bindPg, keys, fingerprint };
}

module.exports = { createIdempotencyStore };
