# HPay Production Upgrade (executed)

## Checklist mapping

1. **Database** — `src/db/schema.sql` + Drizzle (`src/db/client.ts`, `drizzle-schema.ts`) + `server/db/pg.cjs` (SERIALIZABLE).  
   Activate: `npm run db:up` → `npm run db:migrate` → set `DATABASE_URL`.  
   Without Docker/Postgres, SQLite trial bank remains active.

2. **Idempotency** — `X-Idempotency-Key` on money POSTs including `/api/v1/payouts` (`payoutPath`). Persists to `idempotency_keys` when Postgres is bound.

3. **WebAuthn** — `@simplewebauthn/server` via `server/webauthn.cjs` (L3).  
   Routes: register-challenge, authentication-challenge, verify.  
   Demo: `WEBAUTHN_ALLOW_SIM=true`.

4. **Live rail adapters** — `server/adapters/index.cjs` → Fireblocks, Circle, SWIFT/CBUAE, Chainalysis, Gemini (`server/providers.cjs`).

5. **Security headers / audit** — L7 perimeter headers; schema tables `security_audit_logs`, `enclave_security_headers` (FIPS / PQC / ZK metadata).
