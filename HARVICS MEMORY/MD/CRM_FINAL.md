# Session notes — finance + commercial spine

**Date:** 2026-08-14  
**Status:** Phase 2 finance + Phase 3 commercial (#8–12) + Phase 4 procurement (#13–16) in code.  
**Reminder:** **2026-08-18** investor walkthrough.

---

## Built (localhost:3333 · admin/admin · API :4000)

| # | Module | URL |
|---|--------|-----|
| 1 | GL | /en/os/finance |
| 2 | Controlling | /en/os/controlling |
| 3 | AR | /en/os/ar-aging |
| 4 | AP | /en/os/ap-aging |
| 7 | Planning | /en/os/budgets |
| 8 | CRM | /en/os/crm |
| 9 | CPQ | /en/os/cpq |
| 10 | Sales & Distribution | /en/os/sales-distribution |
| 11 | Marketing | /en/os/marketing |
| 12 | Distributors | /en/os/distributors |
| 13 | RFQ | /en/os/rfq |
| 14 | Vendor Scorecards | /en/os/vendor-scorecards |
| 15 | Contracts | /en/os/contracts |
| 16 | Sourcing | /en/os/sourcing |

---

## Apply pending SQL

```bash
npx prisma db execute --schema prisma/schema.prisma --file prisma/manual/module10_sales_additive.sql
npx prisma db execute --schema prisma/schema.prisma --file prisma/manual/module11_marketing_additive.sql
npx prisma db execute --schema prisma/schema.prisma --file prisma/manual/module12_distributor_additive.sql
npx prisma db execute --schema prisma/schema.prisma --file prisma/manual/module13_16_procurement_additive.sql
```

Restart backend after.

---

## Next

Rehearse the 18 Aug loop. Procurement #13–16 UI is live (wave3 RFQ/scorecards, wave5 contracts/sourcing).

---

## Non-goals

- No invented partner branding.
- No full `db push --accept-data-loss`.
- No commit unless asked.
