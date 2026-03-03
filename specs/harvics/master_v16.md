# HARVICS GLOBAL OS — VERSION 16 (MASTER BLUEPRINT)

> Single source of truth for the full Harvics digital system:

> Website → CRM → OS → Data Ocean → AI → Harvey Engine

---

## 1. PURPOSE

This document defines the **global architecture** and **scope** of Harvics OS V16:

- What the system is
- All tiers (T0–T4)
- OS domains (modules)
- High-level data & AI flow
- Master Mermaid diagram for architects and AI agents (Cursor, etc.)

Detailed implementation of new Phase-1 modules (Legal, Import/Export, GPS, Competitor) is in:

- `specs/HARVICS_PHASE1_BLUEPRINT.md`

---

## 2. ONE-LINE DEFINITION

> **Harvics Global OS** is a multi-portal, multi-country enterprise system for FMCG distribution, running Website → CRM → OS (ERP) → Data Ocean → AI → Harvey Engine, built on **Next.js 15 + TypeScript + PostgreSQL**, with **38-language localization** and **8-level geographic hierarchy**.

---

## 3. ARCHITECTURE LAYERS (T0 → T4)

### TIER 0 – FOUNDATIONAL ENGINES (INVISIBLE TO USER)

These are root services used by all portals and modules:

1. **Identity & Access Engine**
   - User types (HQ, Region, Country, City, Route, Distributor, Supplier, Staff)
   - Departments (Sales, Finance, HR, Procurement, Logistics, Production, CRM)
   - Roles & permissions (CFO, RM, Territory Sales Officer, etc.)
   - SSO, sessions, unified login (Web + OS)

2. **Localisation Engine**
   - Full hierarchy: Global → Continent → Region → Country → City → District → Area → Location
   - Currency, language, tax rules per country
   - Legal / compliance flags per market

3. **Geo Engine**
   - Territory + route maps
   - Warehouse / factory / office coordinates
   - Sales officer & vehicle GPS trails
   - Satellite tiles for white spaces / density heatmaps

4. **Master Data Engine**
   - SKU Master (products, packs, categories)
   - Customer / Retailer Master
   - Distributor & Import Partner Master
   - Supplier & Co-packer Master
   - Location & Territory Master
   - Finance Master (Chart of Accounts, VAT/GST codes)

5. **Data Ocean Platform** (conceptual layer, physical views/tables in DB)
   - Finance Ocean
   - Sales & Distribution Ocean
   - HR & Talent Ocean
   - Supplier & Procurement Ocean
   - Inventory Ocean
   - Logistics & Route Ocean
   - Production Ocean
   - CRM & Brand / Tickets Ocean
   - Competitor / Market Intelligence Ocean
   - Geo / Tiles Ocean
   - Harvey Data Bank (products, distributors, scraped_leads, markets, pricing_intel)

6. **AI Foundation (Model Layer – logical)**
   - AI-Sales (demand, mix, price intelligence)
   - AI-Finance (credit scoring, fraud, cashflow)
   - AI-HR (performance, promotion, attrition risk)
   - AI-Procurement (RM forecast, supplier risk)
   - AI-Logistics (route optimisation, ETA, fuel)
   - AI-Geo (heatmaps, white spaces, tile scoring)
   - AI-Competitor (price, promotion, share signals)

7. **Integration / API Layer**
   - Maps (Google Maps / Mapbox), Weather APIs
   - Payment Gateways
   - Email / SMS / WhatsApp / Push
   - Connectors to external ERPs / retailers / market data

---

### TIER 1 – CORE HARVICS OS DOMAINS (PORTALS)

These are the main "domains" exposed as portals / app sections:

1. **Market & Distribution OS**
2. **Supplier & Procurement OS**
3. **Orders / Sales OS**
4. **Inventory OS**
5. **Logistics & Transport OS**
6. **Finance OS**
7. **Customer & Brand CRM OS**
8. **HR & Talent OS**
9. **Legal / IPR & Compliance OS** *(Phase-1)*
10. **Import / Export OS** *(Phase-1)*
11. **GPS Tracking OS** *(Phase-1)*
12. **Competitor Intelligence OS** *(Phase-1)*
13. **Executive Control Tower**

Each OS domain uses T0 engines for identity, localization, geo and integration.

---

### TIER 2 – SUB-MODULES INSIDE EACH DOMAIN (EXAMPLES)

**Market & Distribution OS**
- Distributor Master & Hierarchy
- Import Partners & Key Accounts
- Route-to-Market & Territories
- Pricing & Trade Terms (per country/channel)
- Promotion / Activation Planning

**Supplier & Procurement OS**
- RM Supplier & Co-packer Master
- 3PL / Transport Provider Master
- RFQ & Purchase Contracts
- GRN / QC & Non-conformance
- Supplier Performance & Scorecards

**HR & Talent OS**
- Workforce Master & Org Chart
- Attendance & Field Movement (GPS)
- KPIs & Performance Reviews
- Payroll / Compensation Rules
- Recruitment & Onboarding

**CRM / Customer & Brand OS**
- Retailer / Customer Master
- Complaints & Ticketing
- Campaigns & Promotions
- Surveys / NPS / Feedback
- Competitor Watch & Benchmarking

**Finance OS**
- AR (Distributors / Key Accounts)
- AP (Suppliers / Vendors)
- GL / Cost Centres / P&L Structures
- Tax (VAT / GST / Duties)
- Cash Management & Settlements

**Inventory OS**
- Warehouse & Location Setup
- SKU / Batch / Expiry Tracking
- Replenishment & Min/Max Rules
- Stock Adjustments / Shrinkage
- Stock Valuation & Reports

**Logistics & Transport OS**
- Fleet & Vehicle Master
- Route Planning & Dispatch
- GPS Tracking & Proof of Delivery
- Network Efficiency & White-space Analytics
- 3PL / Transporter Management

**Production / Factory OS** *(future extension)*
- BOM & Recipes
- Production Orders & Scheduling
- QC & Lab Results
- Yield & Wastage
- Finished Goods Handover to Warehouse

**Executive Control Tower**
- P&L & Margin by Market / SKU
- Coverage & White-space Maps (AI-Geo)
- Competitor Overview (AI-Competitor)
- KPI Dashboard (Sales, HR, Finance, Logistics)
- Risk & Opportunity Alerts (AI-driven)

Legal, Import/Export, GPS, Competitor submodules are detailed in Phase-1 blueprint.

---

### TIER 3 – OPERATIONAL SCREENS / LISTS / DASHBOARDS

Examples (not exhaustive):

- Distributor / Supplier / Customer Lists & Detail Views
- Route & Territory Maps, GPS Route Replay
- Ticket Boards, Campaign Dashboards, NPS Dashboards
- AR / AP Aging, GL / Trial Balance, Tax Summary Views
- Stock by Warehouse / SKU, Expiry & Exception Views
- Dispatch Lists, Vehicle Utilisation, Network Heatmaps
- Production Order Boards, QC Result Screens, Yield Dashboards
- Executive P&L & KPI Dashboards (Country / Category)
- Legal Case Boards, Contract Expiry Alert Screens
- Competitor price & promotion boards

---

### TIER 4 – ACTIONS / OPERATIONS (ONE ACTION = ONE PERFORMANCE)

Representative actions (across all domains):

- Market & Distribution: Create / Approve Distributor, Assign Territory, Set / Update Price & Discounts, Approve Promotions, Freeze / Block Distributor
- Supplier & Procurement: Approve / Reject Supplier, Create / Amend RFQ, Create / Approve PO, Record QC Result, Update Supplier Status / Score
- HR & Talent: Add / Edit Employee, Approve Attendance Exceptions, Launch / Close Performance Reviews, Run Payroll, Move Candidate → Hire / Reject
- CRM & Brand: Create / Assign Ticket, Update Status / Resolution, Launch / Close Campaign, Record Competitor Activity, Trigger Survey / NPS
- Finance: Post Invoice / Receipt, Allocate Payment, Approve Credit Limit / Hold, Post Journal Entry, Finalise Period / Close Month
- Inventory: Post GRN / Issue, Approve Stock Adjustment, Confirm Replenishment Proposal, Transfer Stock, Block / Release Batch
- Logistics: Create / Schedule Dispatch, Assign Vehicle / Driver, Confirm POD, Re-route Delivery, Close Trip / Route
- Production: Release Production Order, Record Output / Consumption, Record QC Decision, Close Order, Approve Yield / Variance
- Legal / Compliance: Register New Brand / IP, Upload / Approve Contract, Log Legal Case / Notice, Mark Case / Contract Closed
- Import/Export, GPS, Competitor actions: see Phase-1 blueprint.

---

## 4. GLOBAL JOURNEY SPINE (WEB → CRM → OS → DATA OCEAN → AI)

Every major path follows the same backbone:

1. **WEB ACTION**
   - Become a Distributor / Supplier / Import Partner
   - SKU Enquiry / Sales Inquiry
   - Complaint / Feedback
   - Job Application
   - Login (Distributor / Supplier / Staff)

2. **CRM RECORD CREATED + PIPELINE**
   - Distributor_Leads / Supplier_Leads / ImportPartner_Leads / Sales_Leads / SKU_Interest / Tickets / Applicants
   - Pipeline stages: New → Qualification → Approved / Rejected → Handover to OS

3. **OS MODULE CONSUMES IT FOR REAL OPERATIONS**
   - Distributor onboarding, supplier approval, shipment creation, ticket handling, hiring, etc.

4. **TRANSACTIONS & STATE CHANGES WRITTEN TO DATA OCEAN**
   - All financial, sales, logistics, HR, CRM, competitor events feed into Data Ocean / Harvey Data Bank.

5. **AI MODELS LEARN & PRODUCE INSIGHTS / ALERTS / PROPOSALS**
   - AI-Sales, AI-Fin, AI-Geo, AI-Logistics, AI-HR, AI-Competitor.

6. **HARVEY ENGINE TURNS INSIGHTS INTO ACTION**
   - Marketing campaigns, distributor proposals, competitor positioning, lead generation, content.

7. **INSIGHTS FED BACK INTO OS / WEB / HARVEY APP**
   - Executive dashboards, portal recommendations, dynamic website content, Harvey chat responses.

---

## 5. MASTER MERMAID DIAGRAM (V16)

```mermaid
flowchart TD

    %% ENTRY LAYER
    subgraph CH[ENTRY – FRONT CHANNELS]
        W[Website\nharvics.com]
        H[Harvey App\n(Chat + MI)]
        B[Social / Bots\n(WhatsApp, FB, IG, etc.)]
    end

    subgraph CRM[CRM LAYER – Journeys & Pipelines]
        DL[Distributor_Leads]
        IL[ImportPartner_Leads]
        SL[Sales_Leads\n+ SKU_Interest]
        SPL[Supplier_Leads]
        TK[Tickets\n(Feedback / Complaints)]
        AP[Applicants\n(Careers)]
    end

    W --> CRM
    H --> CRM
    B --> CRM

    subgraph T0[TIER 0 – FOUNDATIONAL ENGINES]
        IA[Identity & Access\n(RBAC + SSO)]
        LOC[Localisation Engine\n8-level Geo]
        GEO[Geo Engine\n(GPS, Tiles, Routes)]
        MD[Master Data Engine\n(SKU, Parties, Locations)]
        INT[Integration Layer\n(Maps, Weather, Payments,\nEmail/SMS/WhatsApp)]
    end

    subgraph T1[TIER 1 – HARVICS OS DOMAINS]
        MKTOS[Market & Distribution OS]
        SUPOS[Supplier & Procurement OS]
        ORDOS[Orders / Sales OS]
        INVOS[Inventory OS]
        LOGOS[Logistics & Transport OS]
        FINOS[Finance OS]
        CRMOS[Customer & Brand CRM OS]
        HROS[HR & Talent OS]
        LEGOS[Legal & Compliance OS\n(Phase 1)]
        IMPOS[Import / Export OS\n(Phase 1)]
        GPSOS[GPS Tracking OS\n(Phase 1)]
        COMPOS[Competitor Intelligence OS\n(Phase 1)]
        EXEC[Executive Control Tower]
    end

    CRM --> T1
    IA --> T1
    LOC --> T1
    GEO --> T1
    MD --> T1
    INT --> T1

    subgraph T234[TIER 2–4 – Submodules, Screens, Actions]
        SUB[Sub-Modules\n(Masters, Pricing, Routes,\nContracts, Shipments, etc.)]
        SCR[Operational Screens\n(Lists, Dashboards, Maps)]
        ACT[Actions & Workflows\n(Create, Approve, Dispatch,\nClose, Review)]
    end

    T1 --> SUB --> SCR --> ACT

    subgraph DO[DATA OCEAN]
        DOF[Finance Ocean]
        DOS[Sales Ocean]
        DOI[Inventory Ocean]
        DOL[Logistics Ocean]
        DOP[Production Ocean]
        DOPR[Procurement Ocean]
        DOHR[HR Ocean]
        DOCRM[CRM & Tickets Ocean]
        DOC[Competitor & Market Intel Ocean]
        DOG[Geo / Tiles Ocean]
        HDB[Harvey Data Bank]
    end

    ACT --> DO
    LOC --> DO
    GEO --> DO

    subgraph AI[AI LAYER]
        AIS[AI-Sales]
        AIF[AI-Finance]
        AIP[AI-Procurement]
        AIL[AI-Logistics]
        AIHR[AI-HR]
        AIG[AI-Geo]
        AIC[AI-Competitor]
    end

    DO --> AI

    subgraph HE[HARVEY ENGINE]
        MKTENG[Marketing Engine]
        SCRENG[Scraping Engine]
        KGRAPH[Knowledge Graph]
    end

    AI --> HE
    DO --> HE

    HE --> CRM
    HE --> T1
    HE --> W
    HE --> H

    EXEC --> T1
    DO --> EXEC
    AI --> EXEC
```

---

## 6. IMPLEMENTATION NOTES

### Database Patterns
- **Tables**: Use snake_case naming
- **Primary Keys**: TEXT id with UUID format (e.g., `'ipr_' + uuidv4()`)
- **Timestamps**: `created_at DATETIME DEFAULT CURRENT_TIMESTAMP`, `updated_at DATETIME DEFAULT CURRENT_TIMESTAMP`
- **Foreign Keys**: Always enable foreign key constraints
- **Indexes**: Index foreign keys and frequently queried columns
- **Territory Fields**: Always include `territory TEXT` and 8-level geo fields

### Backend Patterns
- **Routes**: Mount under `/api/<domain>` (e.g., `/api/legal`, `/api/import`)
- **Response Format**: `{ success: boolean, data?: any, error?: string }`
- **Error Handling**: Try-catch blocks, proper HTTP status codes
- **Input Validation**: Validate all inputs, use parameterized queries
- **RBAC**: Use `rbac()` middleware from `middleware/rbac.js`
- **Territory Filtering**: Always filter by `distributorId`/`territory` from user scope

### Frontend Patterns
- **Routes**: `/os/<domain>/<page>` structure
- **Layouts**: Use domain-specific layouts (e.g., `OSLegalLayout`)
- **Components**: Reuse existing table, form, modal components
- **Localization**: Use `useTranslations()`, `formatCurrency()`, `formatDate()`
- **RBAC**: Use `AuthGuard` component with `allowedRoles` prop
- **Error Boundaries**: Wrap all pages in `ErrorBoundary`

### Security Requirements
- No hardcoded secrets
- No `console.log` in production code
- No `any` types in TypeScript
- Input validation on frontend AND backend
- Parameterized SQL queries only
- CSRF protection on state-changing routes
- JWT + refresh tokens for authentication

---

## 7. REFERENCE DOCUMENTS

- Phase-1 Implementation: `specs/HARVICS_PHASE1_BLUEPRINT.md`
- Database Schema: See migration files in `db/`
- API Documentation: See route files in `server/routes/`
- Frontend Components: See `src/components/`

---

*Last Updated: Version 16 Master Blueprint*
