# Project Structure Snapshot

*Date: 2026-06-06*

This document captures the current top‑level directory layout and key files of the HARVICS website project. It is intended for reference and backup before any structural changes.

## Top‑Level Directories

- `.cursorrules`
- `.dockerignore`
- `.env.example`
- `.eslintrc.json`
- `.gitattributes`
- `.gitignore`
- `COLOR_SYSTEM_UNIFICATION_COMPLETE.md`
- `COPILOT_NOTES.md`
- `deploy.sh`
- `docker-compose.production.yml`
- `docker-compose.staging.yml`
- `docker-compose.yml`
- `Dockerfile`
- `download_map.py`
- `ecosystem.config.js`
- `fix_backgrounds.py`
- `fix-crm-styles.js`
- `GEMINI_NOTES.md`
- `HARVICS_CATEGORY_TREE_T1-T4.txt`
- `HARVICS_MASTER_PLAN.md`
- `HARVICS_OS_MASTER_SPEC.md`
- `HARVICS_SYSTEM_RULES.md`
- `LOGO_DESIGN_RESEARCH.md`
- `netlify.toml`
- `NEXT_STEPS.md`
- `next.config.js`
- `open-next.config.ts`
- `package-lock.json`
- `package.json`
- `PORT_CONFIGURATION.md`
- `postcss.config.js`
- `prisma.config.ts`
- `README.md`
- `SESSION_HANDOFF_2026-06-02_IMAGE_GENERATION.md`
- `SESSION_LOG_2026-06-01.md`
- `start-servers.sh`
- `tailwind.config.js`
- `test_engine.sh`
- `TRADING_HOUSE_LOGO_RESEARCH.md`
- `tsconfig.json`
- `update-crm-layout.js`
- `wrangler.jsonc`

## Important Sub‑Projects

- `ai-engine/` – Python AI monitoring service.
- `archive/` – Historical documentation and assets.
- `backend/` – Backend source code and scripts.
- `db/` – Database migrations.
- `docs/` – Documentation and guides.
- `plans/` – Architectural and planning documents.
- `prisma/` – Prisma schema and migrations.
- `public/` – Public assets (images, media, brand assets, verticals, etc.).
- `scripts/` – Utility scripts (image generation, SEO, deployment, etc.).
- `src/` – Main Next.js application source code.
- `trial/` – Experimental HTML layout.

## Key Files

- `src/app/api/groq/process/route.ts` – GROQ image generation API route.
- `src/lib/promptTemplates.ts` – Prompt templates for AI generation.
- `src/data/leafImageMap.ts` – Mapping of product keywords to leaf image URLs.
- `src/components/shared/VapiWidget.tsx` – Vapi voice AI widget component.
- `src/app/[locale]/layout.tsx` – Root layout that includes global providers and widgets.

*This snapshot is stored in version control and can be used to restore the original structure if needed.*