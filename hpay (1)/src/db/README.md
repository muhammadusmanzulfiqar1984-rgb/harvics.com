# HPay Database (Production)

- **Schema:** [`schema.sql`](./schema.sql) — enterprise Postgres (double-entry, idempotency, audit, WebAuthn, enclave headers)
- **Drizzle:** [`drizzle-schema.ts`](./drizzle-schema.ts) + [`client.ts`](./client.ts) (`SERIALIZABLE` via `withSerializable`)
- **Runtime:** `server/db/pg.cjs` when `DATABASE_URL` is set; SQLite remains local trial fallback

```bash
npm run db:up
npm run db:migrate
# then npm run dev
```
