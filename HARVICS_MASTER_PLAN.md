# HARVICS UNIVERSE MASTER PLAN

Based on the blueprint review (`HARVICS_360_VOLUME0_SOUL_1.docx` and `GEMINI_NOTES.md`), here is the comprehensive execution plan to align the current codebase with the official Harvics specifications.

## 1. The Visual Identity & UI Alignment
**Objective:** Replace the "SUPREME" Maroon/Ivory theme with the mandated Deep Dark Navy Glassmorphism theme.
- **Actions:**
  - Update `tailwind.config.js` with deep space colors (Bg: `#050816`, Cards: `#0f172a`, Accent: Gold `#fbbf24`).
  - Implement required typography: `Cormorant Garamond` (KPIs), `DM Sans` (body), `JetBrains Mono` (IDs).
  - Enforce the **5-Element Rule** across all screens (Header, KPI Row, Main Content, AI Alerts Panel, Gold Pill Primary Button).
  - Create the centralized `@harvics/ui` component library with strict schemas and styling (radius: `999px` for buttons, dark glass for cards).

## 2. The Data Ocean (PostgreSQL + Prisma)
**Objective:** Build the three-tier data architecture to feed the AI engine.
- **Actions:**
  - **Bronze Layer (Raw):** Append-only tables for raw JSON (Weather, FX rates every 60s, Cultural calendars, Sanctions daily).
  - **Silver Layer (Cleaned):** Normalized tables (UTC dates, ISO 3166 codes).
  - **Gold Layer (Analytics):** Pre-joined feature vectors updated hourly for AI models.
  - Build Node.js background ingestion services (`DataOceanService`) connected via Kafka topics (`dataocean.fx.updated`, etc.).

## 3. The AI Engine (Python Microservice)
**Objective:** Deploy the 8 core predictive models.
- **Actions:**
  - Create a FastAPI service in `/ai-engine/src/models/`.
  - Implement `demand.py` (forecasts based on history + weather + culture).
  - Implement `price.py` (optimizes pricing using elasticity and competitor data).
  - Implement `fraud_model.py` (scores transactions 0.00 to 1.00).
  - Implement `strategy.py`, `coverage.py`, `sku.py`, `credit_scoring.py`.
  - Integrate main Node.js backend controllers to call FastAPI for live `aiSuggestions`.

## 4. Harvoice & Live Globalisation
**Objective:** Voice-driven interaction and instant 200ms localization.
- **Actions:**
  - **Harvoice:** Integrate Gemini Live API. Setup NestJS backend to issue ephemeral tokens for WebSocket streaming (16kHz PCM audio).
  - **Globalisation:** Read `X-Locale`, country codes, and IP to auto-set currency, tax rules, date formats, and cultural context (e.g., Ramadan impacts) instantly before screen render.

## 5. Neural Governance
**Objective:** The 5-point immune system checks on every data write.
- **Actions:**
  - Implement middleware (`GovernanceService.check()`) on all POST/PUT/PATCH/DELETE routes.
  - Build the 5 parallel checks: Legal, Budget, Contract, Security, and Compliance (AML/Sanctions).
  - Log all passes and failures immutably to an `AuditLog` table.

## 6. App Routing & Directory Restructuring
**Objective:** Strict module organization.
- **Actions:**
  - Refactor Next.js routing to exactly follow `/os/[domain]/[module]/[screen]` (e.g., `/os/finance/ar/invoices`).
  - Migrate away from legacy locale structures that conflict with the new system.
