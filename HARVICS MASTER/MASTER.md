# HARVICS — MASTER.md
## Cursor Master Specification & Build Constitution

**Classification:** Confidential — Internal Build Document  
**System:** Harvics Universe / Harvics Global Ventures  
**Purpose:** Top-level instruction and source-of-truth document for Cursor, developers, designers and AI coding agents  
**Status:** Master architectural specification assembled from the current Harvics source documents  
**Rule:** This document defines the intended system. It does **not** by itself prove that a capability is already implemented in production.

---

# 0. READ THIS FIRST

You are working on **Harvics Universe**.

Harvics is a unified operating platform connecting:

1. **Harvics OS** — enterprise operating/orchestration layer.
2. **Harvics Apps** — purpose-built applications generating enterprise activity.
3. **HarvicsTrade** — commercial/trade execution layer.
4. **Harvey Engine** — intelligence and decision layer.
5. **Data Ocean** — structured world and enterprise data layer.
6. **HPay** — programmable financial and settlement orchestration layer.
7. **Harvoice** — secure voice/communications interface.
8. **Live Globalisation Engine** — jurisdiction/context adaptation.
9. **Neural Governance** — policy, compliance and execution control.
10. **Harvics Universe** — consumer-facing ecosystem.

The architecture is described through four zoom levels:

> **Moon → Earth → New York → Manhattan**

At Moon level, understand the organism.  
At Earth level, understand the modules and their relationships.  
At New York level, understand one module as a complete system.  
At Manhattan level, understand one workflow down to fields, APIs, database writes, AI decisions and audit trail.

Do not jump to implementation from a vague feature request. First locate the feature inside this architecture.

---

# 1. SOURCE-OF-TRUTH HIERARCHY

When sources appear to overlap, use this order:

1. **Harvics Supreme Master Plan** — highest-level unified architecture and strategic direction.
2. **HARVICS 360° Volume 0 — The Soul** — shared intelligence, Data Ocean, AI Engine, Harvoice, globalisation and governance.
3. **Harvics Master Blueprint** — concrete module inventory and technical build model.
4. **HPay V1 Product & Engineering Specification** — authoritative HPay V1 scope.
5. **Harvics Universe System Diagrams** — architecture and data-flow relationships.
6. **HarvicsTrade / pitch architecture** — current commercial positioning and trade workflow.
7. **Harvics Brand Engine** — brand/marketing automation architecture.
8. Existing repository/code — authoritative only for what is **actually implemented**, not for what the target architecture says should exist.

### Critical implementation rule

Never convert a target specification into a false claim of implementation.

Use these labels when appropriate:

- `SPECIFIED` — defined by architecture/specification.
- `TARGET` — intended future capability.
- `IN DEVELOPMENT` — explicitly described as active development.
- `IMPLEMENTED` — verified in the repository.
- `LIVE` — verified operational production capability.
- `UNKNOWN` — specification exists but implementation status has not been verified.

If uncertain, use `UNKNOWN`.

---

# 2. THE HARVICS ORGANISM

Harvics is not a collection of unrelated applications.

The intended hierarchy is:

```text
                    HARVEY ENGINE
                         ↓
                    DATA OCEAN
                         ↓
                    HARVICS OS
                  /      |       \
                 /       |        \
          HARVICS APPS  HPay   HARVICSTRADE
                 \       |        /
                  \      |       /
                   ENTERPRISE /
                  TRADE ACTIVITY
                         ↓
                    DATA FEEDBACK
                         ↓
                    AI IMPROVEMENT
```

### Architectural principle

Apps generate activity.

HarvicsTrade executes commerce.

Harvics OS orchestrates identity, workflow and jurisdiction.

Data Ocean accumulates structured knowledge.

Harvey Engine turns data into predictions and decisions.

HPay orchestrates value movement through regulated rails and partners.

Harvoice provides the human voice interface.

Governance controls what the system is allowed to execute.

---

# 3. THE FOUR ZOOM LEVELS

## 3.1 MOON — ORGANISM

At Moon level see:

- Harvics OS as the enterprise organism.
- 32 OS/Universe modules as connected organs.
- Data Ocean as the mind/data layer.
- AI as continuously operating intelligence.
- HPay as financial circulation.
- Harvoice as voice interface.
- Globalisation as the jurisdiction adaptor.
- Neural Governance as the immune system.
- Automation loops as the operating metabolism.

Do not expose low-level implementation detail at this level.

## 3.2 EARTH — MODULE SYSTEM

At Earth level:

- modules become named regions;
- adjacent modules exchange data;
- major business highways become visible;
- Lead-to-Cash, Procure-to-Pay and Earn Loop are treated as cross-module flows;
- shared services remain cross-cutting.

## 3.3 NEW YORK — MODULE

One module becomes the entire world.

Every module should be understood through:

1. Master Data
2. Operations
3. Workflows
4. Compliance
5. Reporting
6. AI
7. Integrations
8. Security

Also document:

- inbound triggers;
- outbound triggers;
- events;
- dependencies;
- data ownership;
- audit requirements.

## 3.4 MANHATTAN — WORKFLOW

Every important workflow must eventually be traceable through:

```text
Trigger
  ↓
Input fields
  ↓
Validation
  ↓
Data reads
  ↓
AI decision(s)
  ↓
Governance checks
  ↓
Human approval, if required
  ↓
API execution
  ↓
Database writes
  ↓
External integrations
  ↓
Notifications
  ↓
Audit trail
  ↓
Next workflow/event
```

---

# 4. THE SOUL — SHARED INTELLIGENCE LAYER

The Soul is not a normal product module.

It is the shared operating condition of the organism.

The five principal Soul components are:

1. Data Ocean
2. AI Engine
3. Harvoice
4. Live Globalisation Engine
5. Neural Governance

Automation loops operate through them.

---

# 5. DATA OCEAN

## Purpose

Data Ocean is the permanent structured world-knowledge and enterprise-data reservoir.

The specification describes data coverage across approximately 190 countries.

Examples include:

- FX rates;
- weather by GPS coordinate;
- cultural and religious calendars;
- national events;
- commodity prices;
- sanctions lists;
- competitor intelligence;
- consumer behaviour;
- HS code data;
- regulatory/jurisdiction information.

## Data layers

### Bronze

Raw ingestion.

Rules:

- preserve source response;
- append-only;
- do not silently overwrite raw source data;
- retain source metadata;
- retain ingestion timestamp.

### Silver

Cleaned and normalised.

Examples:

- deduplicate;
- standardise currency;
- normalise dates;
- normalise country codes;
- clean source anomalies.

### Gold

Analytics-ready.

Contains:

- joined feature tables;
- feature vectors;
- party features;
- product features;
- territory features;
- country features.

AI models should read from Gold unless there is an explicit reason to consume another layer.

## Kafka/event topics described by the specification

Examples:

```text
dataocean.fx.updated
dataocean.sanctions.updated
dataocean.cultural.event
dataocean.weather.updated
dataocean.hs.updated
dataocean.competitor.signal
```

Modules should subscribe only to the data they require.

---

# 6. AI ENGINE

The Soul specification defines eight principal ML models:

```text
demand.py
enhanced_demand.py
strategy.py
price.py
coverage.py
sku.py
fraud_model.py
credit_scoring.py
```

## 6.1 demand.py

Inputs include:

- sales history;
- weather index;
- cultural calendar uplift;
- territory assignment.

Outputs:

- 7-day demand;
- 30-day demand;
- 90-day demand;
- SKU/territory forecast.

The specification states a target MAPE below 15%.

## 6.2 enhanced_demand.py

Extends demand forecasting with:

- competitor pricing;
- consumer sentiment;
- macroeconomic index.

Used for:

- production planning;
- capital planning.

## 6.3 strategy.py

Inputs include:

- coverage;
- GPS retailer coordinates;
- whitespace;
- competitor positions;
- demand forecast.

Outputs:

- territory attack plan;
- priority retailers;
- SKU recommendations;
- GPS-optimal visit sequence.

The specification describes a daily 5am run.

## 6.4 price.py

Inputs:

- demand elasticity;
- competitor pricing;
- cost floor;
- target margin.

Outputs:

- recommended price;
- volume impact;
- revenue impact;
- margin impact;
- comparison against ±5% and ±10%.

## 6.5 coverage.py

Produces territory health scoring.

The specification describes:

- 0–100 territory health;
- underperforming territory heatmaps;
- retailer/order/visit signals.

## 6.6 sku.py

Portfolio decisions:

```text
PUSH
MAINTAIN
REDUCE
DELIST
```

## 6.7 fraud_model.py

Produces fraud probability in the range:

```text
0.00 → 1.00
```

The specification describes automatic blocking above `0.70`.

This threshold is a **specified target**, not proof that production currently uses it.

## 6.8 credit_scoring.py

Produces:

- credit score 0–100;
- recommended credit limit.

---

# 7. AI OPERATING PRINCIPLES

AI does not merely observe.

The target architecture permits AI to:

- predict;
- recommend;
- classify;
- score;
- optimise;
- prepare actions;
- execute automatically where governance permits.

Every autonomous action must be:

1. explainable;
2. governed;
3. auditable;
4. reversible where commercially and technically possible;
5. attributable to a model/version;
6. linked to the source data used.

Never allow an AI model to directly mutate critical business state without passing through application validation and governance.

---

# 8. HARVOICE

Harvoice is the voice interface to the organism.

The specification describes:

- Gemini Live API foundation;
- 16kHz PCM16 audio;
- multilingual speech;
- server-side session management;
- ephemeral client tokens;
- long-lived keys never exposed to the browser;
- translation;
- structured command extraction;
- API execution;
- spoken response.

### Conceptual flow

```text
Human speech
    ↓
Harvoice session
    ↓
Speech understanding
    ↓
Language / intent detection
    ↓
Structured command
    ↓
Permission / validation
    ↓
Governance
    ↓
API execution
    ↓
Result
    ↓
Natural-language / voice response
```

Harvoice is not a generic chatbot.

It is an interface into governed application workflows.

---

# 9. LIVE GLOBALISATION ENGINE

The globalisation layer adapts the system to jurisdiction.

The specification describes automatic configuration in under 200ms.

Potential context includes:

- country;
- currency;
- tax;
- payment methods;
- date format;
- legal jurisdiction;
- document language;
- cultural calendar;
- seasonal patterns.

### Principle

Do not hard-code country-specific behaviour throughout the application.

Prefer:

```text
Country / Jurisdiction
        ↓
Country Configuration
        ↓
Policy / Tax / Currency / Locale / Payment / Compliance
        ↓
Application behaviour
```

Use configuration and policy layers rather than duplicating country logic.

---

# 10. NEURAL GOVERNANCE

Neural Governance is the execution control layer.

Before every important write operation:

```text
POST
PUT
PATCH
DELETE
```

the system should evaluate the applicable governance rules.

The five principal checks are:

1. Legal
2. Budget
3. Contract
4. Security
5. Compliance

### Decision

```text
ALL PASS
   ↓
EXECUTE

ANY FAIL
   ↓
BLOCK
   ↓
EXPLAIN
   ↓
ESCALATE TO APPROPRIATE HUMAN
```

Governance must not be implemented merely as a UI warning.

It must sit on the server-side execution path.

The specification describes governance as independently running and the final line of defence.

---

# 11. HUMAN APPROVAL MODEL

The system is intended to minimise unnecessary human intervention.

Human approval is required where:

- a policy requires it;
- a threshold is exceeded;
- the AI confidence is insufficient;
- legal/compliance rules demand review;
- a transaction is otherwise classified as high risk.

Represent approval explicitly:

```text
AI Decision ✦
      ↓
Governance ⚑
      ↓
Human Approval ⊕
      ↓
Execution
```

Do not create artificial approval steps simply to imitate bureaucracy.

---

# 12. HARVICS OS — ENTERPRISE MODULES

The Master Blueprint describes Harvics OS as the enterprise ERP/orchestration system.

The module inventory includes the following groups.

## GROUP A — FINANCE

### 1. Finance Core

- General Ledger
- Chart of Accounts
- Cost Centers
- Accounts Receivable
- Credit Limits
- Accounts Payable
- 3-Way Match
- Period Close Engine

### 2. Treasury

- Bank Register
- Auto-Reconciliation
- Cash Pooling
- Hedge Accounting

### 3. HPay / Payments

- Multi-currency wallet
- SWIFT/SEPA-oriented capability in the broader specification
- USDT rail
- KYC
- AML
- Sanctions

For current implementation, defer to the dedicated HPay V1 specification.

### 4. BI + Planning

- P&L by business unit/country
- Board pack generation
- OKR tracking
- AI variance commentary

---

# 13. COMMERCIAL MODULES

### 5. CRM + Sales

- Lead management
- CPQ
- Sales orders
- Customer 360

### 6. Marketing

- Campaign management
- Journey builder
- NPS
- Surveys

### 7. Procurement

- RFQ
- Quote comparison
- Purchase orders
- 3-Way Match
- Vendor scoring

### 8. Legal + Compliance

- Contract lifecycle
- E-signature
- Obligation tracking
- AML
- KYB

---

# 14. OPERATIONS MODULES

### 9. Manufacturing

- BOM
- MRP
- Shop-floor control
- Yield tracking
- HACCP gates

### 10. Inventory + WMS

- FEFO
- FIFO
- Batch tracking
- Lot tracking
- Bin management

### 11. Quality Management

- QC inspections
- Non-conformance
- Batch release gate
- CAPA

### 12. Projects

- Gantt
- Timeline
- Resource allocation
- Project P&L

---

# 15. SUPPORT / TRADE MODULES

### 13. Logistics + Fleet

- GPS fleet tracking
- Route planning
- Proof of delivery
- Cold-chain monitoring

### 14. Shipping + Trade

- Bill of lading generation
- HS code database
- Customs declaration
- Sanctions checks

Additional modules from the full blueprint must be preserved when implementing the complete 32-module system. Do not collapse modules merely to simplify the UI.

Where the current repository contains an explicit module registry, treat that registry as implementation truth and map it back to this architecture.

---

# 16. HARVICS UNIVERSE

Harvics Universe is the consumer-facing side of the organism.

It is described as including:

- social functionality;
- marketplace;
- wallet;
- creators;
- gamification;
- consumer activity;
- crypto-related functionality.

The 360 specification identifies 10 Universe modules.

Implement each as a bounded domain.

Do not merge consumer financial logic with enterprise accounting logic merely because both use HPay.

---

# 17. HPAY

HPay V1 is explicitly defined as:

> The programmable financial and settlement layer of the Harvics Universe.

Critical positioning:

> HPay is **not a bank**.

It is a financial intelligence and orchestration layer above regulated payment rails and partners.

Core thesis:

```text
Commerce
   →
Payment
   →
Ledger
   →
Settlement
   →
Intelligence
```

## HPay V1 priority modules

### P0

- Identity & Auth
- KYC/KYB
- Accounts & Wallets
- Double-entry Ledger
- Payments
- Payment Methods
- Merchant Onboarding
- Checkout
- Payouts
- Refunds
- Admin Panel
- Webhooks

### P1

- Settlements
- Risk Engine

### P2

- Harvey read-only financial queries

## HPay architecture

```text
HARVICS UNIVERSE
       ↓
COMMERCE / TRADE / SOCIAL
       ↓
HARVICS OS
       ↓
HPay
       ↓
┌─────────────┬────────────┬──────────────┐
│ Wallet      │ Pay        │ Settle       │
│ Accounts    │ Checkout   │ Escrow / FX  │
│ Balances    │ QR / Links │ Settlement   │
└─────────────┴────────────┴──────────────┘
       ↓
PAYMENT ORCHESTRATION
       ↓
Banks / PSPs / Rails
```

## HPay financial integrity

All financial movements must use double-entry accounting.

Never mutate balances as the primary source of truth.

Use:

```text
Transaction
    ↓
Ledger Entries
    ↓
Balance Projection
```

rather than:

```text
Balance = balance + amount
```

Every financial event must be auditable.

---

# 18. HARVICSTRADE

HarvicsTrade is the commercial/trade execution layer.

It is **not** merely another app card.

Core product surface:

1. Product Discovery
2. RFQ
3. Supplier Sourcing
4. Verification
5. Compliance
6. Finance
7. Logistics
8. Settlement

### Trade flow

```text
PRODUCT DISCOVERY
       ↓
RFQ
       ↓
SUPPLIER SOURCING
       ↓
VERIFICATION
       ↓
COMPLIANCE
       ↓
FINANCE
       ↓
LOGISTICS
       ↓
SETTLEMENT
```

Current positioning materials describe:

- food & beverage;
- industrial;
- consumer;
- healthcare;
- agri;
- specialty trade.

The trade layer should connect buyers, suppliers, finance, compliance and logistics into one accountable workflow.

---

# 19. HARVICS APPS

Apps are activity nodes under Harvics OS.

Current architecture materials identify examples such as:

- Harviсs CRM;
- Harvics HR;
- Harvics Event OS;
- Vatify OS;
- HarvYX;
- HarvYX Concierge;
- Harvoice;
- HPay.

Do not treat these as isolated SaaS products.

They should use shared:

- identity;
- permissions;
- localisation;
- data;
- governance;
- events;
- AI;
- audit;
- payment primitives where applicable.

---

# 20. HARVEY ENGINE

Harvey is the intelligence layer.

Harvey should be able to work across:

- sales;
- demand;
- pricing;
- finance;
- inventory;
- logistics;
- procurement;
- compliance;
- executive reporting.

Examples of intended behaviour:

```text
"Show me P&L for Dubai this quarter."
"Raise a quote for Al Raha, 500 units, SKU-042."
"Who is at risk of churning?"
"What is our current stock?"
"When will the next production run complete?"
"What is the duty rate for chocolate into Saudi?"
"Where is the driver?"
```

Harvey should answer from system data rather than fabricate.

If data is unavailable:

```text
UNKNOWN
```

not invented certainty.

---

# 21. CORE BUSINESS HIGHWAYS

The system should explicitly support cross-module flows.

## Lead → Cash

```text
Lead
 ↓
Qualification
 ↓
Quote / CPQ
 ↓
Contract
 ↓
Sales Order
 ↓
Inventory / Production
 ↓
Logistics
 ↓
Invoice
 ↓
Payment
 ↓
Settlement
 ↓
Accounting
```

## Procure → Pay

```text
Need
 ↓
PR
 ↓
RFQ
 ↓
Supplier comparison
 ↓
Vendor approval
 ↓
PO
 ↓
Receipt
 ↓
QC
 ↓
3-Way Match
 ↓
Invoice
 ↓
Payment
 ↓
Ledger
```

## Trade lifecycle

```text
Discovery
 ↓
RFQ
 ↓
Source
 ↓
Verify
 ↓
Compliance
 ↓
Finance
 ↓
Ship
 ↓
Settle
```

---

# 22. DATA OWNERSHIP

Every domain must have a clear owner.

Examples:

- Finance owns financial accounting records.
- CRM owns customer/lead lifecycle state.
- Procurement owns supplier procurement workflows.
- Inventory owns stock state.
- Logistics owns shipment/vehicle movement state.
- HPay owns payment and ledger records.
- Data Ocean owns external intelligence and derived shared features.
- AI Engine owns model artefacts, predictions and model metadata.
- Governance owns policy decisions and governance audit records.

Do not create duplicate sources of truth.

---

# 23. EVENT-DRIVEN ARCHITECTURE

Use domain events for cross-module propagation.

Example:

```text
sales.order.confirmed
inventory.reservation.requested
inventory.reservation.confirmed
production.plan.required
shipment.created
invoice.issued
payment.authorized
payment.settled
ledger.posted
```

Event names must be:

- domain-specific;
- stable;
- versionable;
- documented.

Consumers should be idempotent.

Never assume an event is delivered exactly once.

---

# 24. API PRINCIPLES

Every API must define:

- authentication;
- authorisation;
- request schema;
- response schema;
- error schema;
- idempotency requirements;
- audit behaviour;
- governance behaviour;
- rate limits where applicable;
- versioning.

For mutation APIs:

```text
Request
 ↓
Authentication
 ↓
Authorization
 ↓
Validation
 ↓
Business rules
 ↓
AI decision if applicable
 ↓
Governance
 ↓
Transaction
 ↓
Event
 ↓
Audit
```

Never bypass governance through an alternate endpoint.

---

# 25. SECURITY

Minimum principles:

- least privilege;
- RBAC;
- MFA where required;
- tenant isolation;
- secure secret handling;
- no production secrets in source;
- server-side enforcement;
- immutable/auditable financial history;
- secure webhook verification;
- idempotent financial operations;
- encryption in transit;
- encryption at rest where supported;
- rate limiting;
- security logging;
- audit trails.

Harvoice credentials and long-lived AI/provider keys must never be exposed to the browser.

---

# 26. MULTI-TENANCY

The enterprise architecture must assume multiple organisations, countries and business units.

Every tenant-sensitive object must have explicit ownership/context.

Do not rely solely on frontend filtering.

Enforce tenant boundaries at:

- API;
- service;
- query/data access;
- authorisation;
- audit layer.

---

# 27. LOCALISATION

Localisation is more than translating text.

It includes:

- language;
- currency;
- number formats;
- date formats;
- timezone;
- tax;
- legal jurisdiction;
- payment methods;
- commercial conventions;
- cultural calendar.

Do not scatter locale-specific conditionals throughout components.

Use a central configuration/context model.

---

# 28. TECHNICAL BUILD MODEL

The Master Blueprint specifies:

```text
Turborepo Monorepo
Next.js 15
NestJS
Supabase
Clerk
```

The architecture also references:

- PostgreSQL;
- Kafka/event infrastructure;
- Python AI services;
- managed cloud services;
- external APIs.

### Practical rule

Do not introduce another framework or database unless:

1. the existing stack cannot reasonably support the requirement;
2. there is a measurable benefit;
3. the dependency boundary is documented;
4. operational complexity is justified.

Prefer managed services where they reduce operational burden without compromising control.

---

# 29. REPOSITORY STRUCTURE

A suitable target structure is:

```text
/apps
  /web
  /admin
  /harvoice
  /ai-engine
  /api

/packages
  /ui
  /auth
  /config
  /localisation
  /governance
  /events
  /data-access
  /domain
  /api-contracts
  /observability
  /security

/services
  /finance
  /crm
  /procurement
  /inventory
  /logistics
  /manufacturing
  /quality
  /legal
  /hpay
  /trade

/docs
  /architecture
  /modules
  /workflows
  /api
  /decisions
```

This is an architectural target, not a claim about the current repository.

Before creating folders, inspect the existing repository and preserve working structure where possible.

---

# 30. DATABASE PRINCIPLES

Prefer PostgreSQL for transactional enterprise state.

Principles:

- explicit primary keys;
- foreign keys;
- indexes based on query patterns;
- timestamps;
- audit metadata;
- soft deletion only where appropriate;
- immutable financial records;
- migrations under version control;
- no destructive migration without explicit approval;
- database constraints for critical invariants.

Do not use JSON blobs as an excuse to avoid modelling core business entities.

---

# 31. AUDITABILITY

Every material action should answer:

- Who did it?
- What did they do?
- When?
- From where/context?
- What changed?
- Why?
- Which AI model influenced it?
- Which governance rules were evaluated?
- Was human approval required?
- What was the previous state?
- What is the resulting state?

For autonomous AI:

```text
actor = AI
model = model/version
decision = ...
confidence = ...
input_reference = ...
governance_result = ...
execution_reference = ...
```

---

# 32. AI + GOVERNANCE CONTRACT

AI proposes or executes decisions only through governed interfaces.

Never:

```text
LLM → direct SQL
LLM → direct payment
LLM → direct production mutation
LLM → unrestricted filesystem
```

Prefer:

```text
LLM
 ↓
Structured Intent
 ↓
Typed Tool / API
 ↓
Validation
 ↓
Governance
 ↓
Transaction
 ↓
Audit
```

---

# 33. UI / UX PRINCIPLES

The interface should communicate the architecture without becoming decorative.

Priorities:

1. clarity;
2. information hierarchy;
3. fast workflows;
4. operational density where appropriate;
5. responsive behaviour;
6. strong typography;
7. consistent navigation;
8. obvious system state;
9. visible approvals/governance;
10. minimal unnecessary animation.

Harvics brand direction uses a premium visual language associated with:

- deep burgundy/maroon;
- ivory/cream;
- brushed gold;
- restrained serif display typography;
- modern sans-serif interface typography.

Do not apply branding at the expense of usability.

---

# 34. BRAND ENGINE

The Brand Engine is a separate operational workflow that can use the broader Harvics intelligence architecture.

It has two parallel tracks:

### Track A
Event/market urgency and immediate lead generation.

### Track B
Permanent personal + company brand engine.

The source describes:

- 11 tools activated;
- 3 build phases;
- emphasis on existing tooling;
- personal/company brand split;
- event-driven lead intelligence;
- content planning;
- KPIs.

Tooling described includes examples such as:

- Apollo;
- Sales Navigator;
- Airtable;
- Midjourney;
- Claude.

Do not hard-wire these vendors into core Harvics OS architecture. They belong to the Brand Engine operational layer unless formally integrated.

---

# 35. BRAND ENGINE PIPELINE

Target flow:

```text
Event / Market Signal
       ↓
Target Account Discovery
       ↓
Decision-Maker Discovery
       ↓
Lead Qualification
       ↓
Airtable / CRM Record
       ↓
Research / Intelligence
       ↓
Personalised Outreach
       ↓
Content / Authority Signal
       ↓
Conversation
       ↓
Meeting
       ↓
Opportunity
       ↓
CRM
       ↓
Commercial Outcome
```

The Brand Engine should optimise for measurable business outcomes, not vanity metrics.

---

# 36. METRICS

Prefer commercial KPIs:

- qualified leads;
- response rate;
- meeting rate;
- qualified opportunity rate;
- pipeline value;
- conversion;
- customer acquisition cost;
- revenue attributable;
- distributor acquisition;
- buyer/supplier activation;
- trade volume;
- GMV;
- payment volume;
- gross margin;
- retention.

Do not celebrate impressions, likes or follower count unless they contribute to a measurable objective.

---

# 37. CODING AGENT RULES FOR CURSOR

## Rule 1 — Inspect before editing

Before modifying a feature:

- inspect repository;
- inspect routes;
- inspect database;
- inspect existing components;
- inspect APIs;
- inspect tests;
- inspect configuration.

Do not rebuild existing functionality because the architecture document describes it differently.

## Rule 2 — Preserve working systems

Do not rewrite working modules for aesthetic reasons.

## Rule 3 — No speculative complexity

Do not add:

- unnecessary microservices;
- unnecessary queues;
- unnecessary abstractions;
- unnecessary packages;
- duplicate state;
- duplicate APIs.

## Rule 4 — Type everything important

Use typed contracts for:

- API inputs;
- API outputs;
- domain events;
- AI tool calls;
- financial operations;
- governance decisions.

## Rule 5 — No fake functionality

Never create:

- fake database responses;
- fake AI results;
- fake payment success;
- fake compliance approval;
- fake production status.

If a capability is not implemented, label it clearly.

## Rule 6 — No silent architectural drift

If implementation requires a change to the architecture:

1. identify the conflict;
2. document it;
3. make the smallest safe change;
4. update architecture documentation.

## Rule 7 — Critical writes are governed

All sensitive mutations must pass through the correct governance boundary.

## Rule 8 — Financial state is sacred

No balance mutation without ledger integrity.

## Rule 9 — AI is bounded

AI must interact with typed tools and explicit permissions.

## Rule 10 — Build incrementally

A working vertical slice is preferable to ten incomplete modules.

---

# 38. FEATURE IMPLEMENTATION TEMPLATE

For every major feature, Cursor should reason in this order:

```text
1. Business purpose
2. Owning module
3. User/actor
4. Trigger
5. Inputs
6. Master data
7. Workflow
8. AI involvement
9. Governance checks
10. Human approval
11. API
12. Database changes
13. Events
14. Integrations
15. Audit
16. UI
17. Tests
18. Observability
19. Rollback/recovery
```

---

# 39. ACCEPTANCE CRITERIA

A feature is not complete because the UI renders.

A production-grade feature should satisfy:

### Functional

- intended workflow works end-to-end;
- validation works;
- error states work;
- permissions work.

### Data

- correct records created/updated;
- constraints enforced;
- no duplicate state;
- audit trail exists.

### Security

- unauthorised access blocked;
- secrets protected;
- tenant boundaries enforced.

### AI

If AI is involved:

- inputs defined;
- output schema defined;
- model/version recorded;
- fallback exists;
- confidence/risk handled.

### Governance

- relevant policies evaluated;
- blocked actions explain why;
- escalation path exists.

### Observability

- meaningful logs;
- errors traceable;
- critical events observable.

### Tests

At minimum:

- unit tests for core rules;
- integration tests for important APIs;
- workflow tests for critical business paths;
- security/permission tests for sensitive areas.

---

# 40. CURRENT IMPLEMENTATION VS TARGET ARCHITECTURE

This is a permanent rule.

The architecture documents contain ambitious target capabilities.

The repository may contain only a subset.

Therefore:

```text
SPECIFICATION ≠ IMPLEMENTATION
IMPLEMENTATION ≠ PRODUCTION
PRODUCTION ≠ COMMERCIAL VALIDATION
```

Cursor must not tell the user that a system is:

- live;
- production-ready;
- secure;
- compliant;
- regulated;
- autonomous;

unless evidence in the repository and/or operational environment supports the claim.

---

# 41. COMMERCIAL REALITY

Harvics is ultimately intended to create commercial infrastructure.

Architecture decisions should therefore be evaluated against:

- revenue;
- gross margin;
- transaction economics;
- working capital;
- capital efficiency;
- implementation cost;
- customer acquisition;
- switching costs;
- data accumulation;
- network effects;
- regulatory exposure;
- operational risk.

Technology is subordinate to commercial outcomes.

Do not build a technically elegant system that has no economic purpose.

---

# 42. MOAT

The source architecture identifies several potential compounding advantages:

### 1. Cross-domain orchestration

Enterprise, trade, payments and intelligence operate through one architecture.

### 2. Jurisdiction intelligence

Country context is part of system behaviour rather than an afterthought.

### 3. Data compounding

Transactions generate structured trade and enterprise intelligence.

### 4. AI participation

AI is integrated into workflows rather than placed beside them as a chat interface.

### 5. Governance

Autonomy is constrained by explicit legal, financial, contractual, security and compliance controls.

The moat is not the number of screens.

---

# 43. IMPLEMENTATION PRIORITY

When deciding what to build first, prefer:

## P0 — Commercial core

- Identity
- Tenant/organisation foundation
- Core CRM
- Product/catalogue
- RFQ
- Supplier workflow
- Verification
- Compliance basics
- Trade workflow
- Orders
- Inventory basics
- Payments integration
- Ledger foundation
- Audit
- Governance foundation

## P1 — Operating leverage

- Logistics
- Procurement
- Finance expansion
- AI demand/pricing
- Harvoice
- Globalisation
- Advanced CRM
- Reporting

## P2 — Scale/expansion

- Manufacturing depth
- Quality depth
- Advanced treasury
- Consumer ecosystem
- Crypto-related features
- Advanced AI autonomy
- Full 360 module coverage

This priority is an execution recommendation derived from the architecture; it does not replace the official phase plan.

---

# 44. VERTICAL SLICE PRINCIPLE

Prefer a complete commercial path over isolated module completion.

Example:

```text
Buyer
 ↓
Product Discovery
 ↓
RFQ
 ↓
Supplier Match
 ↓
Verification
 ↓
Compliance
 ↓
Quote
 ↓
Order
 ↓
Payment
 ↓
Logistics
 ↓
Settlement
 ↓
Ledger
 ↓
Data Ocean
 ↓
AI learning
```

A complete path creates more real value than ten disconnected dashboards.

---

# 45. OBSERVABILITY

Every production workflow should expose:

- request ID;
- correlation ID;
- tenant ID;
- actor;
- service;
- event;
- duration;
- outcome;
- error code;
- governance result where applicable.

AI actions should also expose:

- model;
- version;
- confidence;
- feature/reference context;
- decision;
- execution status.

---

# 46. FAILURE DESIGN

Assume:

- external APIs fail;
- payment providers fail;
- AI becomes unavailable;
- Kafka messages duplicate;
- webhooks arrive late;
- users retry;
- network calls timeout;
- countries change regulations;
- data sources become stale.

Every important integration needs:

- timeout;
- retry policy;
- idempotency;
- dead-letter/recovery strategy where appropriate;
- user-visible status;
- auditability.

The Soul specification explicitly anticipates AI degradation and describes fallback to stored recommendations.

---

# 47. DATA FRESHNESS

Data that changes quickly must carry freshness metadata.

Examples:

```text
FX → high-frequency
Weather → location/time sensitive
Sanctions → daily or source-defined
Competitor signals → source-defined
Regulation → versioned
AI predictions → model timestamp
```

Do not present stale intelligence as current truth.

---

# 48. SECURITY AND COMPLIANCE BOUNDARY

The system must distinguish:

```text
Software capability
vs
regulated financial activity
vs
legal/compliance obligation
```

For HPay in particular:

- HPay is an orchestration layer;
- regulated payment rails/providers remain external where applicable;
- KYC/KYB/AML/sanctions controls must be designed around applicable providers and jurisdictions;
- never represent a software feature as a regulatory licence.

---

# 49. DOCUMENTATION RULES

Every major module should have:

```text
README.md
ARCHITECTURE.md
WORKFLOWS.md
API.md
DATA.md
SECURITY.md
AI.md
GOVERNANCE.md
```

Not every tiny package needs all seven files.

Documentation should reflect the actual implementation.

---

# 50. DECISION LOG

Architectural decisions must be recorded when they materially affect:

- data ownership;
- API contracts;
- financial integrity;
- security;
- tenancy;
- AI autonomy;
- governance;
- external integrations;
- infrastructure.

Recommended format:

```text
Decision:
Context:
Options:
Decision:
Reason:
Trade-offs:
Date:
Owner:
```

---

# 51. CURSOR RESPONSE PROTOCOL

When asked to implement something, Cursor should respond internally through this reasoning sequence:

```text
ARCHITECTURE
→ identify module

DOMAIN
→ identify business owner

DATA
→ identify records

WORKFLOW
→ identify state transitions

AI
→ identify decisions

GOVERNANCE
→ identify controls

API
→ define contract

UI
→ implement surface

TEST
→ verify

AUDIT
→ verify traceability

STATUS
→ mark implemented/unknown
```

Do not begin by generating a large amount of code.

---

# 52. WHAT NOT TO DO

Never:

- invent undocumented business rules;
- claim integrations exist when they do not;
- expose secrets;
- bypass auth;
- bypass governance;
- directly mutate financial balances;
- give an LLM unrestricted database access;
- create duplicate sources of truth;
- hard-code country rules across UI components;
- silently alter API contracts;
- rewrite the architecture because a feature is inconvenient;
- add technology merely because it is fashionable;
- confuse a mockup with a production capability;
- confuse an AI response with verified enterprise data.

---

# 53. FINAL BUILD PHILOSOPHY

Harvics should feel like one organism even though it contains many modules.

The user should not have to understand the internal architecture to operate it.

The system should internally understand:

```text
WHO
WHAT
WHERE
WHEN
WHY
HOW MUCH
UNDER WHICH JURISDICTION
UNDER WHICH POLICY
WITH WHAT RISK
AND WHAT SHOULD HAPPEN NEXT
```

The ultimate operating loop is:

```text
REAL-WORLD ACTIVITY
       ↓
DATA
       ↓
DATA OCEAN
       ↓
AI
       ↓
DECISION
       ↓
GOVERNANCE
       ↓
EXECUTION
       ↓
RESULT
       ↓
AUDIT
       ↓
LEARNING
       ↓
BETTER NEXT DECISION
```

That loop is the heart of Harvics.

---

# 54. MASTER COMMAND TO CURSOR

When this file is present at repository root, treat it as the governing architectural instruction.

Before implementing any significant feature:

> **Read MASTER.md. Locate the feature within the Harvics architecture. Inspect the existing repository. Preserve existing working systems. Implement the smallest production-grade change that advances the target architecture. Do not invent capabilities. Do not bypass governance, security, tenancy or financial controls. Distinguish specified, implemented and live capabilities. Update documentation when architecture changes.**

**END OF MASTER.md**
