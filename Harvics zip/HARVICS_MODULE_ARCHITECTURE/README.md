# HARVICS — Detailed Module Architecture

This ZIP is the module-level architecture package for Cursor.

Read `HARVICS_CURSOR_MASTER.md` first.

## Contents

- `modules/` — 32 canonical product module architecture files.
- `cross-cutting/` — Data Ocean, AI, Harvoice, Globalisation, Governance, HPay, platform spine and Brand Engine.
- `registries/` — taxonomy, status model, dependency matrix and machine-readable registry.
- `workflows/` — Lead-to-Cash, Procure-to-Pay and Trade.
- `SOURCE-MATRIX.md` — source authority.

## Critical rule

The sources contain 32 product modules, a production-normalised 20-domain OS implementation model, and a 71-module/15-band catalogue.

Do not collapse these into one number.

The Board Briefing states that the generic factory is scaffold and that CRM is the current commercial system of record. Never mark a module live simply because its route or generic CRUD exists.

Where the sources do not define a field, threshold, endpoint, legal rule or provider contract, the architecture explicitly says `TBD` or `UNKNOWN`.

This is deliberate. Cursor must not invent missing business requirements.
