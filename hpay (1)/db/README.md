# HPay Bank Schema

## Trial (now)
- Engine: SQLite via `node:sqlite`
- File: `data/hpay-bank.sqlite`
- Module: `server/bankDb.cjs`

## Enterprise target (this folder)
- Engine: PostgreSQL
- Schema: [`schema/hpay_enterprise_v1.sql`](./schema/hpay_enterprise_v1.sql)
- Orgs/users, double-entry journals + lines, idempotency, immutable audit, merchants, market quotes

### Apply
```bash
psql "$DATABASE_URL" -f db/schema/hpay_enterprise_v1.sql
```

### Env
```bash
DATABASE_URL=postgres://hpay:hpay@localhost:5432/hpay
HPAY_BANK_ENGINE=postgres
```

### Balance law
Never stored. View `account_balances`:
- ASSET / EXPENSE → Σ debit − Σ credit
- LIABILITY / EQUITY / REVENUE / ESCROW → Σ credit − Σ debit
Customer wallets = LIABILITY.
