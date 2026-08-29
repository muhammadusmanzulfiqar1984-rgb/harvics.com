# HARVICS OS — FINAL VERSION 1
**Date:** April 29, 2026
**Time:** 20:30 GST
**Author:** Shah Tabraiz
**Session:** Architecture Study, Gap Analysis, Deploy Plan, Decision Architecture

---

## PART 1 — WHAT HARVICS IS

Harvics is not a product. It is a parallel economic operating system.

A 32-module sovereign architecture that merges:
- Enterprise ERP (CRM, finance, manufacturing, logistics, procurement, HR, governance)
- Consumer super-app (social feed, marketplace, crypto wallet, games, referral engine)
- AI intelligence layer (decision orchestration, demand, price, fraud, credit, strategy)
- Proprietary currency (Harvicoins — ledger-native monetary network)

**The ambition:** The system through which trade, money, people, and intelligence move across borders. Not a tool that plugs into existing systems. The system itself.

Think: Alibaba's infrastructure fused with a sovereign wealth fund's operating logic, run by one founder with AI as the workforce.

---

## PART 2 — REAL STATE OF THE PROJECT (April 29, 2026)

### Frontend (Next.js / App Router — Port 3002)
| Area | Status |
|---|---|
| OS domain routing shell (20+ pages) | ✅ BUILT |
| 17 OS domain content components | ✅ BUILT |
| Company / Distributor / Supplier portals | ✅ BUILT |
| Auth / login (demo credentials) | ✅ BUILT |
| OSDomainTierStructure, KPICard, PortalOSNavigation | ✅ BUILT |
| EnterpriseCRM thin shell (was 6,447 → 121 lines) | ✅ BUILT |
| AICopilot, AIInsightsPanel components | ✅ BUILT |
| Portal sub-pages (13 pages) | ⚠️ WIREFRAME SHELLS |
| Blueprint typography (Cormorant Garamond/DM Sans/JetBrains Mono) | ❌ NOT APPLIED |
| Blueprint color (deep navy #050816 / Gold #fbbf24) | ❌ NOT APPLIED |
| Fixed 240px AI Alerts Panel on all screens | ❌ PARTIAL |
| @harvics/ui component library | ❌ DOES NOT EXIST |

### Backend (Node.js / Express — Port 4000)
| Module | Status |
|---|---|
| Auth (JWT signed, RBAC, login audit) | ✅ REAL |
| Neural Governance (5-check middleware on all writes) | ✅ WIRED |
| Rate limiting (200/min general, 20/min auth) | ✅ BUILT |
| Finance (GL, AR, AP, Cash, Assets, Cost Centers, Budget, Period Close) | ✅ REAL |
| Inventory (Stock, Batch/Lot, FEFO, Warehouses, UOM, Movements) | ✅ REAL |
| Orders, CRM, HR, Logistics (Prisma-backed CRUD) | ✅ REAL |
| Procurement (Vendor, RFQ, PO, GRN, 3-way match, approval workflow) | ✅ REAL |
| Communications (Socket.IO real-time, notifications, approvals, escalation) | ✅ BUILT |
| Audit Log (5000-entry in-memory, REST API) | ✅ BUILT |
| Intelligence controller (reads real DB) | ✅ REAL (not Math.random) |
| Localisation engine (38 languages, rule engine, country profiles) | ✅ BUILT |
| Territory hierarchy | ✅ BUILT |
| DataOcean service | ⚠️ MOCK/DEFAULT |
| Trade / Shipping module | ⚠️ CONTROLLER ONLY, no Prisma models |
| Manufacturing | ❌ NOT BUILT |
| Quality Management | ❌ NOT BUILT |
| Treasury & Banking | ❌ NOT BUILT |
| Payments / HPAY / Crypto / Harvicoins | ❌ NOT BUILT |
| Legal & Compliance domain | ❌ NOT BUILT |
| BI & FP&A | ❌ NOT BUILT |
| Project Management | ❌ NOT BUILT |
| Persisted User model (auth uses mock file) | ❌ NOT IN SCHEMA |
| MFA / SSO | ❌ NOT BUILT |

### Database (Prisma / SQLite dev → PostgreSQL production)
**Real Prisma models:**
Customer, Order, OrderItem, Lead, Campaign, Employee, Payroll, Invoice, InventoryItem, Route

**In-memory DomainStore only (not Prisma):**
PurchaseOrder, GRN, Vendor, RFQ, FixedAsset, CostCenter, Budget, FiscalPeriod, GLAccount, JournalEntry, Notification, AuditLog, User

### AI Engine (Python FastAPI — Port 8001)
| Model | Status |
|---|---|
| strategy.py | ✅ REAL logic |
| demand.py | ✅ REAL logic |
| price.py | ✅ REAL logic |
| coverage.py, sku.py, enhanced_demand.py | ✅ FILES EXIST |
| FastAPI exposes /strategy + /health only | ⚠️ PARTIAL |
| /demand, /price, /coverage, /sku not exposed | ❌ NOT WIRED |
| Data Ocean Bronze/Silver/Gold pipeline | ❌ NOT BUILT |
| Harvoice (Gemini Live WebSocket) | ❌ NOT BUILT |
| Fraud model, credit scoring | ❌ NOT BUILT |

### Active Runtime Issues (found in backend logs)
- ProfitSentinel crash loop: `TypeError: Cannot read properties of undefined (reading 'marketVoidScore')`
- HarvicsAlphaEngine: `[Tier-0] Validation Error: Missing critical signals`
- These fire every 60s on inflation spike triggers

---

## PART 3 — SOVEREIGN ARCHITECTURE (THE DOCTRINE)

### Core Pillars
1. **Economic Core** — primary operating substrate for cross-border value flow, not a SaaS layer
2. **Dual Engine Architecture** — enterprise OS + consumer super-app in one architecture creating closed-loop flywheels
3. **Intelligence-First** — AI is not a feature layer; it is the decision and orchestration layer
4. **Transaction Sovereignty** — Neural Governance is mandatory pre-execution control
5. **Monetary Sovereignty** — Harvicoins shifts platform into monetary network effects

### 10 Non-Negotiable Architecture Principles
1. One Identity Spine: every actor is verifiable, scoped, auditable
2. One Transaction Rail: all value movement enters a unified ledger and policy engine
3. Governance Before Execution: legal, budget, sanctions, compliance checks are mandatory pre-write
4. Data Ocean as Source of Truth: no critical decision from isolated service data
5. Event-Driven Core: each domain emits and consumes canonical events
6. AI as Orchestrator: AI proposes and prioritizes, humans approve policy overrides
7. Currency Layer as Protocol: Harvicoins must be ledger-native, not a side wallet
8. Sovereign Observability: every flow has traceability, replayability, and anomaly detection
9. Module Expansion by Dependency Readiness: no module launches without rails readiness
10. Country-Aware by Design: localization, tax, compliance, jurisdiction logic are core

---

## PART 4 — DECISION ARCHITECTURE (NO LOOPHOLES)

### Hard Data + AI Chain (7 layers, mandatory in sequence)

**Layer 1 — Data Ingestion**
- Internal signals: orders, inventory, finance, procurement, CRM, HR, logistics
- External signals: FX rates, weather, sanctions, geo-risk, competitor prices
- Rule: every event must carry source, timestamp, confidence, jurisdiction in canonical schema

**Layer 2 — Data Certification (Data Ocean)**
- Bronze: raw immutable events (append-only)
- Silver: normalized and validated facts (UTC dates, ISO codes, canonical currency)
- Gold: feature views, pre-joined, updated on schedule for model queries
- Rule: AI is forbidden from reading raw app tables directly in production decisions

**Layer 3 — AI Inference Layer**
- Explicit model services: strategy, demand, price, coverage, credit, fraud
- Every inference returns: output, confidence score, features-used hash, model version, expiry timestamp
- Rule: no opaque "recommendation text only" — structured output contract mandatory

**Layer 4 — Decision Compiler (IntelligenceNode)**
- Runs 5 parallel engines: Market/Demand, Supplier Intelligence, Cost/Margin, Risk/Compliance, Localisation Rule
- Compiles one Decision Object:
  - `gate`: GO | CONDITIONAL | NO-GO
  - `reason_codes`
  - `required_human_approvals`
  - `execution_plan`
- Rule: this is the brain output. Not UI hints. Not suggestions.

**Layer 5 — Neural Governance Layer (Pre-Write)**
- 5 simultaneous checks before any POST/PUT/PATCH/DELETE:
  1. Legal — sanctions list, jurisdiction-banned entities
  2. Budget — transaction vs approved cost center budget
  3. Contract — referenced contract active and covers transaction type
  4. Security — user role has write scope for this resource
  5. Compliance — GDPR/RERA/HACCP data-handling rules
- Block + immutable audit log on any failure
- Rule: no route bypasses this in production

**Layer 6 — Execution Layer**
- GO: executes automatically
- CONDITIONAL: requires human approval by role (mapped to escalation rules)
- NO-GO: blocked, escalated, logged — cannot execute regardless of user

**Layer 7 — Audit + Replay Layer**
- Persists: input snapshot hash, model outputs, decision object, governance outcome, actor, timestamp, final action
- Must be replayable for regulator/audit review
- Rule: nothing is deleted from audit layer

### What Is Weak Right Now (Honest)
1. AI engine exposes only `/strategy`, not full model mesh
2. Data Ocean has no real Bronze/Silver/Gold pipeline — returns mock defaults
3. Runtime errors in Tier-0 show missing mandatory signal validation causing crash loops
4. Some decision paths use fallbacks instead of certified data
5. Auth is mock-file based, not persisted User model in DB
6. Audit log is in-memory only — not persisted to DB

---

## PART 5 — DEPLOY NOW PLAN

### Production Scope (Wave A — Deploy Now)
These modules are production-ready and can be deployed:
- Auth + RBAC + Audit
- Finance core (GL, AR, AP, Cash, Fixed Assets, Cost Centers, Budget, Period Close)
- Inventory (Stock, Batch/Lot, FEFO, Warehouses, UOM)
- Orders, CRM basic, HR basic, Logistics
- Procurement (Vendor, RFQ, PO, GRN, 3-way match)
- Communications (real-time push, approvals, escalation)
- Localisation (38 languages, rule engine, country profiles)
- AI Strategy endpoint
- Company / Distributor / Supplier portals
- All 17 OS domain content pages

### P0 Blockers Before Launch
1. Fix backend crash loops (ProfitSentinel/AlphaEngine) — currently fires every 60s
2. Remove ignoreBuildErrors and ignoreDuringBuilds from next.config.js
3. Lock JWT_SECRET, ALLOWED_ORIGINS, DATABASE_URL in production environment
4. Move auth off mock credential files to real User model
5. Persist audit log and notifications to DB, not in-memory
6. Wire AI engine: expose /demand, /price endpoints in FastAPI main.py
7. Clean route conflicts between legacy pages and OS pages
8. Hide or gate unfinished modules from production navigation

### Production Topology
```
[User Browser]
     ↓
[Nginx / CDN — HTTPS termination]
     ↓
[Next.js Frontend — Port 3000]
     ↓
[Express Backend API — Port 4000]    [FastAPI AI Engine — Port 8001]
     ↓
[PostgreSQL — Managed DB]
```

### Environment Matrix
**Frontend:**
- NEXT_PUBLIC_API_URL
- BACKEND_URL
- NODE_ENV=production

**Backend:**
- PORT=4000
- DATABASE_URL (PostgreSQL production URL)
- JWT_SECRET (strong random secret, not fallback)
- ALLOWED_ORIGINS (production domain only)
- AI_ENGINE_URL (production AI service URL)
- USE_MOCK_PROVIDERS=false

**AI Engine:**
- PORT=8001

### Go/No-Go Criteria
1. No backend crash loops for 30+ minutes
2. All three portals load and authenticate correctly
3. Auth tokens issue and verify
4. DB read/write stable
5. Governance middleware blocks test-invalid writes
6. AI strategy endpoint returns valid response
7. 0 routes bypassing auth + governance on write paths

---

## PART 6 — 12-MONTH BUILD SEQUENCE

| Wave | Months | Focus |
|---|---|---|
| A — Sovereign Rails | 1-2 | Identity, policy engine, immutable audit, event bus, observability |
| B — Enterprise Spine | 3-4 | Finance, procurement, inventory, logistics, CRM, HR on shared ledger semantics |
| C — Monetary Layer | 5-6 | Harvicoins ledger, wallet service, treasury controls, FX logic, fraud rules |
| D — Consumer Super-App Core | 7-8 | Marketplace, social feed, referrals, gamification loop, wallet UX |
| E — Intelligence Economy | 9-12 | Real Data Ocean, feature pipelines, AI model mesh, control tower, voice layer |

### Module Dependency Graph (Build Order)
1. Identity + Policy → everything else depends on this
2. Event Bus + Data Ocean contracts → required before AI automation
3. Finance + Ledger → required before Wallet and Harvicoins
4. Procurement + Inventory + Logistics → required before Marketplace scale
5. Compliance + Sanctions engine → required before cross-border expansion
6. Observability + Incident Response → required before high-volume rollout

---

## PART 7 — SOVEREIGN KPI DASHBOARD

| KPI | What It Measures |
|---|---|
| Rail Integrity | % of writes passing mandatory governance path |
| Economic Throughput | GMV, settlement volume, net margin by corridor |
| Decision Quality | AI recommendation adoption + outcome uplift |
| Compliance Health | Sanctions hits blocked, policy violations, audit completeness |
| Liquidity Health | Wallet float, conversion velocity, treasury risk |
| Supply Health | Fill rate, stockouts, lead-time variance |
| Trust & Reliability | Uptime, error budget burn, MTTR |
| Growth Loop Health | Retention, referral conversion, cohort payback |

---

## PART 8 — FOUNDER OPERATING MODEL

1. Founder sets doctrine, thresholds, and capital allocation rules
2. AI agents run daily planning, anomaly triage, and optimization loops
3. Human approvals reserved for: policy exceptions, capital risk, legal escalations
4. Weekly control tower reviews enforce ruthless sequencing and module gating
5. No module launches without dependency readiness confirmed

---

## STATUS SUMMARY

**What works today:** Sovereign rails foundation, enterprise cashflow spine (partial), governance enforcement, localisation, portals, real-time comms, AI strategy

**What is at risk:** Data Ocean is mock, auth is file-based, AI mesh is partial, some background services have crash loops

**What does not exist yet:** Harvicoins, wallet, marketplace, social feed, voice AI, full fraud/credit AI, treasury, manufacturing, quality, legal full suite, BI/FP&A

**Next session task (one task):** Fix the P0 backend crash loop in ProfitSentinel → stabilize backend → then proceed to production hardening

---

*FINAL VERSION 1 — Saved April 29, 2026 — HARVICS OS Sovereign Architecture Session*
