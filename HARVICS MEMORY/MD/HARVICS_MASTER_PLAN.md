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

## 7. Prompt Engineered Build Brief — 71 Module Architecture Map
**Objective:** Give HARVICS a reusable master prompt that can generate a world-class architecture map aligned to the 71-module target while preserving the platform's AI, reporting, governance, and localisation vision.

**Master Prompt:**

```text
You are the chief enterprise systems architect for HARVICS OS.

Your task is to produce a complete architecture map for HARVICS OS that covers all 71 modules of the platform, benchmarked at the level of SAP, Oracle, and Microsoft Dynamics, but expressed in HARVICS-native architecture language.

You must not produce a generic ERP list. You must produce a structured HARVICS architecture map that shows how the entire platform operates as one intelligence-driven enterprise system.

Context:
- HARVICS OS is a universal enterprise platform spanning 10 industry verticals.
- It includes ERP, AI, governance, platform, and consumer-super-app capabilities.
- The architecture must reflect one backend, one schema philosophy, one AI nervous system, and one Neural Governance model.
- The final count is 71 modules, grouped into enterprise domains, consumer universe modules, and external portals.
- The architecture must show intelligence scale, AI reporting scale, Data Ocean dependencies, and governance checkpoints across every domain.

Mandatory design principles:
- One platform, not disconnected products.
- AI is not a side feature; it is the nervous system running through all modules.
- Neural Governance is not optional; it is the pre-action immune system on every critical workflow.
- Reporting is tiered: operational reporting, management reporting, executive reporting, predictive reporting, and autonomous commentary.
- Data flows upward from transactions to Data Ocean to AI inference to board-level reporting.
- Every module must show its operational purpose, intelligence inputs, reporting outputs, and governance sensitivity.
- Keep HARVICS naming. Do not rename domains, portals, or engines.

Use this exact module universe:

1. Financial Accounting
2. Controlling
3. Accounts Receivable
4. Accounts Payable
5. Treasury & Risk Management
6. HPay Payments
7. Financial Planning & Consolidation
8. CRM + Sales
9. CPQ Engine
10. Sales & Distribution
11. Marketing Automation
12. Distributor / Channel Portal
13. Procurement
14. Vendor Management
15. Contract Lifecycle Management
16. Sourcing & Supplier Network
17. Production Planning
18. Shop Floor Control
19. Bill of Materials
20. Quality Management
21. Recipe / Formulation Management
22. Inventory Management
23. Warehouse Management
24. Demand Planning & Forecasting
25. Fleet & Transport Management
26. Shipping & Freight
27. Trade & Customs
28. Extended Warehouse / 3PL Integration
29. HR Core & Payroll
30. Talent Acquisition
31. Learning Management
32. Performance & Succession
33. Workforce Planning & Time Management
34. Fixed Asset Accounting
35. Plant Maintenance
36. Real Estate & Facility Management
37. GRC Core
38. Internal Audit
39. Legal & Compliance
40. Neural Governance Engine
41. BI & Reporting
42. Board Pack Generator
43. OKR & Strategy Tracking
44. AI Variance Commentary
45. Project Management
46. Service Management
47. Professional Services Automation
48. Tax Engine
49. FX Engine
50. Audit Log
51. Notification Engine
52. Document Vault
53. Admin Console & Security
54. Integration Bus / API Gateway
55. Data Ocean
56. AI Engine
57. Harvoice
58. Globalisation Engine
59. FunFeed
60. Harvics Mall
61. Trade Floor
62. Playroom
63. Experts Hub
64. Jobs + Travel
65. Crypto Lite
66. Harvicoins Wallet
67. HPay Fiat Wallet
68. Circle Referral Engine
69. Customer Portal
70. Vendor Portal
71. Field Officer Portal

Required output structure:

Section 1: Executive architecture thesis
- Explain HARVICS as one enterprise nervous system.
- Explain how the 71 modules resolve into a coherent architecture instead of a feature catalog.
- State how AI, Data Ocean, reporting, and governance operate across all modules.

Section 2: Domain map
- Group the 71 modules into major architecture bands:
  - Finance & Controlling
  - Commercial & Sales
  - Procurement & Sourcing
  - Manufacturing & Production
  - Inventory & Warehouse
  - Logistics & Trade
  - Human Capital
  - Asset & Maintenance
  - Governance, Risk & Compliance
  - Analytics & Intelligence
  - Projects & Services
  - Platform & Infrastructure
  - Data & AI Layer
  - Harvics Universe Consumer Layer
  - External Portals
- Under each band, list the modules and give each module four fields:
  - Core mission
  - Key transactions or workflows
  - AI intelligence layer
  - Reporting and decision outputs

Section 3: Intelligence scale map
- For every architecture band, show five intelligence levels:
  - Level 1: Descriptive visibility
  - Level 2: Diagnostic insight
  - Level 3: Predictive forecasting
  - Level 4: Prescriptive recommendation
  - Level 5: Governed autonomous execution
- Explain what each level means in HARVICS terms.
- Show how modules graduate from transaction capture to autonomous decision support.

Section 4: AI reporting ladder
- Define reporting outputs at five layers:
  - Transaction reporting
  - Operational KPI reporting
  - Management control reporting
  - Executive / board reporting
  - AI narrative commentary and anomaly briefing
- Show which modules are primary producers of each reporting layer.
- Explicitly connect BI & Reporting, Board Pack Generator, OKR & Strategy Tracking, and AI Variance Commentary to upstream modules.

Section 5: Data Ocean dependency map
- Explain what data each module emits into Bronze, Silver, and Gold layers.
- Show how AI Engine models consume Gold features.
- Show how Harvoice, Globalisation Engine, and reporting modules consume intelligence outputs.
- Identify cross-domain signals such as demand, FX, compliance, lead score, fraud score, service risk, and capacity risk.

Section 6: Neural Governance control map
- Show where the 5-point governance engine intervenes:
  - Legal
  - Budget
  - Contract
  - Security
  - Compliance
- Identify high-risk modules that require pre-action gating.
- Explain what should auto-execute, what should escalate, and what should be blocked.

Section 7: Enterprise interaction model
- Map the major end-to-end flows:
  - Lead-to-cash
  - Source-to-pay
  - plan-to-produce
  - forecast-to-fulfil
  - hire-to-retire
  - record-to-report
  - acquire-to-maintain
  - issue-to-resolution
- For each flow, show which modules lead, which modules support, which AI services enrich it, and which reporting outputs it generates.

Section 8: Portal and ecosystem exposure
- Explain how Customer Portal, Vendor Portal, and Field Officer Portal expose controlled slices of the core system.
- Explain which HARVICS Universe consumer modules connect back into ERP intelligence and payments.
- Distinguish internal modules, external portals, and consumer engagement modules clearly.

Section 9: Final architecture summary table
- Produce one compact master table with columns:
  - Module
  - Architecture band
  - System role
  - Intelligence level target
  - Primary reporting output
  - Governance criticality

Style rules:
- Write like a top-tier enterprise architect, not a marketer.
- Be concrete, systems-driven, and structurally precise.
- Avoid vague phrases like “leverages AI” unless you specify what AI does.
- Avoid generic ERP filler.
- Use HARVICS-native language: Data Ocean, Neural Governance, Harvoice, HPay, Globalisation Engine.
- Maintain executive clarity while preserving implementation depth.

Success criteria:
- The result must feel larger and more intelligent than a normal ERP module chart.
- A CTO should be able to turn it into system architecture.
- A product strategist should be able to turn it into roadmap layers.
- An investor should understand why HARVICS is not 71 isolated modules, but one governed intelligence system.
```

**Expected Result:** A reusable prompt that can generate a HARVICS-native 71-module architecture map with explicit intelligence maturity, reporting hierarchy, data lineage, and governance depth.
