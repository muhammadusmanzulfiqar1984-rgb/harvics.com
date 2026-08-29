# HARVICS OS — CRM + SALES MODULE MASTER SPECIFICATION
## Cursor Build Constitution · Module 05
**Classification:** Confidential — Internal Build Document  
**System:** Harvics OS / Harvics Universe  
**Module:** 05 — CRM + Sales  
**Plane:** OS / Commercial  
**Owner Domain:** Commercial  
**Build Status:** S3 approaching S4  
**Document Authority:** This file governs all Cursor actions on the CRM + Sales module.  
**Rule:** Read this file completely before touching any CRM-related file in the repository.

---

## 0. HOW TO USE THIS DOCUMENT

This document operates at four zoom levels.

**Moon** — understand CRM's role in the organism before writing a line.  
**Earth** — understand how CRM connects to Finance, Inventory, Legal, and HPay.  
**New York** — understand CRM as a complete system: entities, workflows, APIs, AI, governance.  
**Manhattan** — understand every workflow step-by-step: trigger → fields → validation → AI → governance → write → event → audit.

Do not jump to Manhattan without reading Moon first. The most common build error is implementing an isolated feature without understanding where it sits in the organism.

---

## 1. CRM POSITION IN THE HARVICS ORGANISM

```text
                     HARVEY ENGINE
                          ↓
                     DATA OCEAN
                          ↓
              ┌──────── HARVICS OS ────────┐
              │                            │
         CRM + SALES ←─────────────────── Marketing (06)
              │                            │
              ↓                            ↓
         Finance (01) ← AR          Procurement (07)
              │                            │
              ↓                            ↓
         HPay (03)              Inventory + WMS (10)
              │                            │
              └──────── SETTLEMENT ────────┘
```

CRM is the commercial system of record. Every revenue event in Harvics OS originates here. Finance, Inventory, Procurement, Trade and HPay are downstream consumers of CRM state transitions. No module should write customer or lead state without going through this domain.

**HarvyX is an outreach engine. It feeds CRM. It is not a second CRM.** Leads captured by HarvyX are imported into Module 05 Wave 8 as the canonical record. The join is a one-way import job. HarvyX has no write-back authority over customer or deal state.

---

## 2. SOURCE-OF-TRUTH HIERARCHY FOR THIS MODULE

When sources conflict, resolve in this order:

1. **This file** — governs Cursor behaviour on Module 05.
2. **MASTER.md** (repository root) — governs all modules.
3. **module-registry.json** — canonical status flags.
4. **05-crm-sales.md** (HARVICS_MODULE_ARCHITECTURE) — scope definition.
5. **Harvics-OS-Board-Briefing.html** — honest implementation truth as of August 2026.
6. **Harvics_Master_Blueprint.pdf** — original architecture intent.
7. **HARVICS_SUPREME_MASTER_PLAN** — universe-level strategy.
8. **Existing Prisma schema** — authoritative for what is currently modelled.
9. **Existing repository code** — authoritative only for what is actually implemented.

**Specification ≠ Implementation. Implementation ≠ Production. Production ≠ Commercial validation.**

Use these labels on every claim:
- `IMPLEMENTED` — verified in the Prisma schema and running API.
- `SPECIFIED` — defined by architecture; not yet in repository.
- `TARGET` — intended future capability.
- `UNKNOWN` — specification exists; implementation status unverified.
- `TBD` — source is silent; requires decision before building.

---

## 3. CURRENT HONEST STATE (August 2026)

```text
WHAT IS BUILT (S3 approaching S4)
──────────────────────────────────
✓  Prisma models: Customer, Lead, Deal, CrmActivity    [IMPLEMENTED]
✓  Wave 8 APIs: /api/wave8/*                           [IMPLEMENTED]
✓  CRM customer API: /api/crm/customers                [IMPLEMENTED]
✓  Pipeline API: /api/wave3/crm/pipeline               [IMPLEMENTED]
✓  Smart CRM UI: /os/crm                               [IMPLEMENTED]
✓  Customer 360 view                                   [IMPLEMENTED]
✓  AI lead scoring via Groq                            [IMPLEMENTED]
✓  AI draft generation via Groq                        [IMPLEMENTED]
✓  JWT auth (Bearer, 15-min + refresh rotation)        [IMPLEMENTED]

WHAT IS SCAFFOLD ONLY
──────────────────────
~  Generic /api/m/05 CRUD via factory                  [SCAFFOLD — not CRM product]
~  71 OS routes including /os/crm/*                    [ROUTES EXIST — screens vary]

WHAT IS NOT BUILT
──────────────────
✗  Quote / CPQ module                                  [SPECIFIED]
✗  Sales Order lifecycle                               [SPECIFIED]
✗  Contract management                                 [SPECIFIED]
✗  Subscription + Loyalty + Rebates + Returns + SLA    [SPECIFIED]
✗  Unified Lead table (dual /api/crm/leads vs Wave 8)  [KNOWN GAP — must unify]
✗  Neural Governance as live control plane on writes   [SPECIFIED — middleware present]
✗  /api/v2/* auth scope (actorId/actorRole = null)     [KNOWN SECURITY GAP]
✗  8 Python AI models connected to live Prisma data    [SPECIFIED]
✗  Data Ocean Bronze/Silver/Gold                       [SPECIFIED]
✗  Full RBAC per-route                                 [SPECIFIED]
✗  Rate limiting on AI endpoints                       [SPECIFIED]

DO NOT SHOW / PRESENT
──────────────────────
✗  Legacy mock KPIs (847 accounts, $4.82M pipeline)    [REMOVE]
✗  Portal EnterpriseCRM component (map/stocks)         [DO NOT PRESENT AS CRM]
✗  Generic /os/module/[id] placeholders for CRM        [DO NOT PRESENT]
```

---

## 4. MODULE BOUNDARY AND OWNERSHIP RULES

### 4.1 CRM owns these objects
CRM is the sole authoritative writer for:
- `Customer` — identity, classification, credit status
- `Contact` — individuals at a customer
- `Lead` — inbound/outbound prospect record
- `Deal` — active sales opportunity with probability and value
- `Opportunity` — formal pipeline opportunity linked to a Deal
- `Quote` + `QuoteLine` — priced proposal to a Customer
- `SalesOrder` + `SalesOrderLine` — confirmed commercial commitment
- `CrmActivity` — calls, emails, meetings, notes against any CRM object
- `CreditLimit` — approved credit by customer
- `PriceList` — pricing tiers, volume breaks, customer-specific pricing
- `Subscription` — recurring commercial arrangement
- `Rebate` — volume/performance rebate agreement
- `Return` — return merchandise authorisation
- `SupportTicket` — post-sale customer issue
- `SLA` — committed service level per customer/contract

### 4.2 Other modules must NOT write directly into CRM
All cross-domain writes must use:
- Typed application contracts (API call with schema validation), or
- Domain events (subscribed by CRM event handler).

Finance does not write to `Customer`. It reads `Customer.id` and `CreditLimit` to drive AR. Inventory does not write to `SalesOrder`. It reads `SalesOrderLine` to drive reservation. This is not negotiable.

### 4.3 Shared objects CRM reads (never owns)
- `User` / `Tenant` — from Identity / Admin (Module 16)
- `Product` / `SKU` — from Product Catalogue (cross-cutting)
- `TaxRate` — from Tax Engine (Module 17)
- `FXRate` — from FX Engine (Module 18)
- `LegalEntity` / `JurisdictionConfig` — from Globalisation Engine
- `GovernanceDecision` — written by Neural Governance (Module 22), read by CRM

---

## 5. COMPLETE ENTITY MODEL

### 5.1 Customer

```prisma
model Customer {
  id                String          @id @default(cuid())
  tenantId          String          // ENFORCE — never query without tenantId
  externalId        String?         // HarvyX or third-party reference
  code              String          // internal reference code, unique per tenant
  name              String
  legalName         String?
  tradingName       String?
  type              CustomerType    // ENTERPRISE | SME | DISTRIBUTOR | CONSUMER | GOVERNMENT
  classification    String?         // e.g., A-class, strategic, key-account
  status            CustomerStatus  // PROSPECT | ACTIVE | ON_HOLD | INACTIVE | BLACKLISTED
  industryCode      String?         // ISIC / NAICS code
  countryCode       String          // ISO 3166-1 alpha-2
  currencyCode      String          // ISO 4217
  languageCode      String?         // IETF BCP 47
  taxId             String?
  vatNumber         String?
  website           String?
  phone             String?
  email             String?
  billingAddressId  String?
  shippingAddressId String?
  assignedSalesRep  String?         // User.id
  assignedAccountMgr String?        // User.id
  sourceChannel     String?         // HARVYX | REFERRAL | TRADE_SHOW | INBOUND | etc.
  parentCustomerId  String?         // for group / subsidiary relationships
  creditLimitId     String?
  priceListId       String?
  paymentTerms      String?         // NET30 | NET60 | CIA | etc.
  notes             String?
  tags              String[]
  metaData          Json?
  createdAt         DateTime        @default(now())
  updatedAt         DateTime        @updatedAt
  createdBy         String          // User.id
  updatedBy         String?
  deletedAt         DateTime?       // soft delete only
  // relations
  contacts          Contact[]
  deals             Deal[]
  orders            SalesOrder[]
  activities        CrmActivity[]
  creditLimit       CreditLimit?
  priceList         PriceList?
  tickets           SupportTicket[]
  subscriptions     Subscription[]
}

enum CustomerType {
  ENTERPRISE SME DISTRIBUTOR CONSUMER GOVERNMENT
}

enum CustomerStatus {
  PROSPECT ACTIVE ON_HOLD INACTIVE BLACKLISTED
}
```

### 5.2 Contact

```prisma
model Contact {
  id            String    @id @default(cuid())
  tenantId      String
  customerId    String
  firstName     String
  lastName      String
  title         String?   // Mr | Ms | Dr | etc.
  jobTitle      String?
  department    String?
  email         String?
  phone         String?
  mobile        String?
  linkedIn      String?
  isPrimary     Boolean   @default(false)
  isDecisionMaker Boolean @default(false)
  preferredLang String?
  notes         String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  createdBy     String
  deletedAt     DateTime?
  customer      Customer  @relation(fields: [customerId], references: [id])
  activities    CrmActivity[]
}
```

### 5.3 Lead

```prisma
model Lead {
  id                String      @id @default(cuid())
  tenantId          String
  externalId        String?     // HarvyX import reference
  source            LeadSource  // HARVYX | WEB | REFERRAL | TRADE_SHOW | COLD_OUTREACH | INBOUND_CALL | OTHER
  status            LeadStatus  // NEW | CONTACTED | QUALIFIED | DISQUALIFIED | CONVERTED
  firstName         String
  lastName          String
  email             String?
  phone             String?
  company           String?
  jobTitle          String?
  countryCode       String?
  industryCode      String?
  estimatedValue    Decimal?    @db.Decimal(18, 4)
  currency          String?     @default("USD")
  productInterest   String[]
  assignedTo        String?     // User.id
  score             Int?        // 0–100 AI score
  scoreModel        String?     // model/version used for score
  scoreAt           DateTime?
  qualificationNotes String?
  disqualifyReason  String?
  convertedAt       DateTime?
  convertedCustomerId String?
  convertedDealId   String?
  lastContactedAt   DateTime?
  nextFollowUpAt    DateTime?
  tags              String[]
  metaData          Json?
  createdAt         DateTime    @default(now())
  updatedAt         DateTime    @updatedAt
  createdBy         String
  updatedBy         String?
  deletedAt         DateTime?
  activities        CrmActivity[]
}

enum LeadSource {
  HARVYX WEB REFERRAL TRADE_SHOW COLD_OUTREACH INBOUND_CALL OTHER
}

enum LeadStatus {
  NEW CONTACTED QUALIFIED DISQUALIFIED CONVERTED
}
```

### 5.4 Deal

```prisma
model Deal {
  id                String      @id @default(cuid())
  tenantId          String
  customerId        String
  contactId         String?
  name              String
  stage             DealStage   // DISCOVERY | QUALIFIED | PROPOSAL | NEGOTIATION | CLOSED_WON | CLOSED_LOST
  probability       Int         // 0–100 percent
  value             Decimal     @db.Decimal(18, 4)
  currency          String      @default("USD")
  valueLocal        Decimal?    @db.Decimal(18, 4)
  localCurrency     String?
  fxRateApplied     Decimal?    @db.Decimal(18, 6)
  assignedTo        String?     // User.id
  expectedCloseDate DateTime?
  actualCloseDate   DateTime?
  lostReason        String?
  competitorNotes   String?
  nextAction        String?
  nextActionDue     DateTime?
  forecastCategory  String?     // COMMIT | BEST_CASE | PIPELINE | OMITTED
  tags              String[]
  metaData          Json?
  createdAt         DateTime    @default(now())
  updatedAt         DateTime    @updatedAt
  createdBy         String
  updatedBy         String?
  deletedAt         DateTime?
  customer          Customer    @relation(fields: [customerId], references: [id])
  quotes            Quote[]
  orders            SalesOrder[]
  activities        CrmActivity[]
}

enum DealStage {
  DISCOVERY QUALIFIED PROPOSAL NEGOTIATION CLOSED_WON CLOSED_LOST
}
```

### 5.5 Quote + QuoteLine

```prisma
model Quote {
  id              String        @id @default(cuid())
  tenantId        String
  quoteNumber     String        // system-generated, unique per tenant
  dealId          String
  customerId      String
  contactId       String?
  status          QuoteStatus   // DRAFT | SUBMITTED | APPROVED | REJECTED | EXPIRED | CONVERTED
  validUntil      DateTime
  currency        String
  subtotal        Decimal       @db.Decimal(18, 4)
  discountAmount  Decimal       @db.Decimal(18, 4) @default(0)
  taxAmount       Decimal       @db.Decimal(18, 4) @default(0)
  totalAmount     Decimal       @db.Decimal(18, 4)
  paymentTerms    String?
  deliveryTerms   String?       // Incoterms
  notes           String?
  internalNotes   String?
  approvedBy      String?       // User.id
  approvedAt      DateTime?
  rejectedBy      String?
  rejectedAt      DateTime?
  rejectionReason String?
  convertedOrderId String?
  governanceRef   String?       // Neural Governance decision ID
  documentVaultId String?       // signed PDF reference
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
  createdBy       String
  updatedBy       String?
  deletedAt       DateTime?
  lines           QuoteLine[]
  deal            Deal          @relation(fields: [dealId], references: [id])
}

model QuoteLine {
  id              String    @id @default(cuid())
  quoteId         String
  lineNumber      Int
  productId       String    // Product Catalogue reference
  sku             String
  description     String
  quantity        Decimal   @db.Decimal(18, 4)
  uom             String    // unit of measure
  unitPrice       Decimal   @db.Decimal(18, 4)
  discount        Decimal   @db.Decimal(5, 4) @default(0) // fractional e.g. 0.05 = 5%
  taxCode         String?
  taxRate         Decimal?  @db.Decimal(5, 4)
  taxAmount       Decimal   @db.Decimal(18, 4) @default(0)
  lineTotal       Decimal   @db.Decimal(18, 4)
  deliveryDate    DateTime?
  notes           String?
  quote           Quote     @relation(fields: [quoteId], references: [id])
}

enum QuoteStatus {
  DRAFT SUBMITTED APPROVED REJECTED EXPIRED CONVERTED
}
```

### 5.6 SalesOrder + SalesOrderLine

```prisma
model SalesOrder {
  id                String          @id @default(cuid())
  tenantId          String
  orderNumber       String          // system-generated, unique per tenant
  dealId            String?
  quoteId           String?
  customerId        String
  contactId         String?
  status            SalesOrderStatus // DRAFT | CONFIRMED | CREDIT_HOLD | IN_FULFILLMENT | SHIPPED | DELIVERED | INVOICED | CANCELLED
  orderDate         DateTime
  requestedDelivery DateTime?
  confirmedDelivery DateTime?
  currency          String
  subtotal          Decimal         @db.Decimal(18, 4)
  discountAmount    Decimal         @db.Decimal(18, 4) @default(0)
  taxAmount         Decimal         @db.Decimal(18, 4) @default(0)
  totalAmount       Decimal         @db.Decimal(18, 4)
  paymentTerms      String?
  deliveryTerms     String?
  deliveryAddress   Json?
  warehouseId       String?
  creditCheckPassed Boolean?
  creditCheckAt     DateTime?
  governanceRef     String?
  inventoryReservationId String?
  invoiceId         String?         // AR invoice reference (Finance)
  notes             String?
  internalNotes     String?
  createdAt         DateTime        @default(now())
  updatedAt         DateTime        @updatedAt
  createdBy         String
  updatedBy         String?
  deletedAt         DateTime?
  lines             SalesOrderLine[]
  customer          Customer        @relation(fields: [customerId], references: [id])
}

model SalesOrderLine {
  id            String      @id @default(cuid())
  orderId       String
  lineNumber    Int
  productId     String
  sku           String
  description   String
  quantity      Decimal     @db.Decimal(18, 4)
  uom           String
  unitPrice     Decimal     @db.Decimal(18, 4)
  discount      Decimal     @db.Decimal(5, 4) @default(0)
  taxCode       String?
  taxRate       Decimal?    @db.Decimal(5, 4)
  taxAmount     Decimal     @db.Decimal(18, 4) @default(0)
  lineTotal     Decimal     @db.Decimal(18, 4)
  reservedQty   Decimal?    @db.Decimal(18, 4)
  shippedQty    Decimal?    @db.Decimal(18, 4)
  invoicedQty   Decimal?    @db.Decimal(18, 4)
  notes         String?
  order         SalesOrder  @relation(fields: [orderId], references: [id])
}

enum SalesOrderStatus {
  DRAFT CONFIRMED CREDIT_HOLD IN_FULFILLMENT SHIPPED DELIVERED INVOICED CANCELLED
}
```

### 5.7 CrmActivity

```prisma
model CrmActivity {
  id            String        @id @default(cuid())
  tenantId      String
  type          ActivityType  // CALL | EMAIL | MEETING | DEMO | NOTE | TASK | WHATSAPP
  subject       String
  body          String?
  status        ActivityStatus // PLANNED | COMPLETED | CANCELLED
  dueAt         DateTime?
  completedAt   DateTime?
  durationMins  Int?
  direction     String?       // INBOUND | OUTBOUND
  outcome       String?
  linkedType    String        // LEAD | CUSTOMER | DEAL | QUOTE | ORDER | CONTACT
  linkedId      String        // polymorphic reference
  customerId    String?
  contactId     String?
  leadId        String?
  dealId        String?
  assignedTo    String        // User.id
  createdBy     String
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt
  customer      Customer?     @relation(fields: [customerId], references: [id])
  contact       Contact?      @relation(fields: [contactId], references: [id])
  lead          Lead?         @relation(fields: [leadId], references: [id])
  deal          Deal?         @relation(fields: [dealId], references: [id])
}

enum ActivityType {
  CALL EMAIL MEETING DEMO NOTE TASK WHATSAPP
}

enum ActivityStatus {
  PLANNED COMPLETED CANCELLED
}
```

### 5.8 CreditLimit

```prisma
model CreditLimit {
  id              String    @id @default(cuid())
  tenantId        String
  customerId      String    @unique
  approvedLimit   Decimal   @db.Decimal(18, 4)
  currency        String
  usedAmount      Decimal   @db.Decimal(18, 4) @default(0)
  availableAmount Decimal   @db.Decimal(18, 4)  // computed: approvedLimit - usedAmount
  basis           String?   // TRADE_HISTORY | CREDIT_REPORT | MANUAL
  reviewDate      DateTime?
  approvedBy      String    // User.id
  approvedAt      DateTime
  notes           String?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  customer        Customer  @relation(fields: [customerId], references: [id])
}
```

### 5.9 PriceList

```prisma
model PriceList {
  id          String          @id @default(cuid())
  tenantId    String
  name        String
  currency    String
  type        PriceListType   // STANDARD | CUSTOMER_SPECIFIC | VOLUME | PROMOTIONAL
  validFrom   DateTime
  validTo     DateTime?
  isDefault   Boolean         @default(false)
  createdAt   DateTime        @default(now())
  updatedAt   DateTime        @updatedAt
  createdBy   String
  entries     PriceListEntry[]
  customers   Customer[]
}

model PriceListEntry {
  id          String    @id @default(cuid())
  priceListId String
  productId   String
  sku         String
  minQty      Decimal   @db.Decimal(18, 4) @default(1)
  unitPrice   Decimal   @db.Decimal(18, 4)
  discount    Decimal   @db.Decimal(5, 4) @default(0)
  priceList   PriceList @relation(fields: [priceListId], references: [id])
}

enum PriceListType {
  STANDARD CUSTOMER_SPECIFIC VOLUME PROMOTIONAL
}
```

### 5.10 Subscription, Rebate, Return, SupportTicket, SLA

```prisma
// STATUS: SPECIFIED — build after Quote-to-Cash is complete

model Subscription {
  id            String    @id @default(cuid())
  tenantId      String
  customerId    String
  planId        String    // TBD — subscription plan master
  status        String    // ACTIVE | PAUSED | CANCELLED | EXPIRED
  billingCycle  String    // MONTHLY | QUARTERLY | ANNUAL
  nextBillingAt DateTime?
  startDate     DateTime
  endDate       DateTime?
  mrr           Decimal?  @db.Decimal(18, 4)
  currency      String
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  customer      Customer  @relation(fields: [customerId], references: [id])
}

model Rebate {
  id              String    @id @default(cuid())
  tenantId        String
  customerId      String
  type            String    // VOLUME | PERFORMANCE | PROMOTIONAL
  basis           String    // PERCENTAGE | FIXED_AMOUNT
  rate            Decimal?  @db.Decimal(5, 4)
  fixedAmount     Decimal?  @db.Decimal(18, 4)
  currency        String
  periodStart     DateTime
  periodEnd       DateTime
  thresholdValue  Decimal?  @db.Decimal(18, 4)
  earnedAmount    Decimal   @db.Decimal(18, 4) @default(0)
  settledAmount   Decimal   @db.Decimal(18, 4) @default(0)
  status          String    // ACTIVE | SETTLED | CANCELLED
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}

model Return {
  id              String    @id @default(cuid())
  tenantId        String
  customerId      String
  orderId         String    // SalesOrder reference
  rmaNumber       String    // Return Merchandise Authorisation number
  status          String    // REQUESTED | APPROVED | RECEIVED | PROCESSED | REFUNDED | REJECTED
  reason          String    // DAMAGED | WRONG_ITEM | QUALITY | OVERSTOCK | OTHER
  requestedAt     DateTime
  approvedAt      DateTime?
  receivedAt      DateTime?
  totalValue      Decimal   @db.Decimal(18, 4)
  currency        String
  resolution      String?   // REFUND | REPLACEMENT | CREDIT_NOTE
  notes           String?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}

model SupportTicket {
  id              String    @id @default(cuid())
  tenantId        String
  ticketNumber    String
  customerId      String
  contactId       String?
  orderId         String?
  type            String    // COMPLAINT | INQUIRY | DELIVERY | QUALITY | BILLING | OTHER
  priority        String    // LOW | MEDIUM | HIGH | CRITICAL
  status          String    // OPEN | IN_PROGRESS | PENDING_CUSTOMER | RESOLVED | CLOSED
  subject         String
  description     String
  assignedTo      String?
  firstResponseAt DateTime?
  resolvedAt      DateTime?
  closedAt        DateTime?
  slaId           String?
  slaBreach       Boolean   @default(false)
  resolution      String?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  customer        Customer  @relation(fields: [customerId], references: [id])
}

model SLA {
  id                    String    @id @default(cuid())
  tenantId              String
  name                  String
  customerType          String?   // applies to customer type or specific customers
  priority              String    // ticket priority this SLA governs
  firstResponseMins     Int       // minutes to first response
  resolutionMins        Int       // minutes to resolution
  businessHoursOnly     Boolean   @default(true)
  escalationAt          Int       // minutes before breach to escalate
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt
}
```

---

## 6. COMPLETE WORKFLOW SPECIFICATIONS (MANHATTAN LEVEL)

### GOLDEN RULE — every mutation follows this spine:
```text
Request received
  ↓
1. Authentication       — valid Bearer JWT, tenant extracted, not expired
2. Authorisation        — actor has required permission for this action
3. Tenant isolation     — tenantId from JWT, NEVER from request body
4. Schema validation    — Zod schema, typed inputs, fail fast with 400
5. Master data reads    — load required entities, check existence
6. Business rules       — domain invariants (credit, pricing, status machine)
7. AI decision          — if applicable, structured intent → typed tool → result
8. Neural Governance    — Legal / Budget / Contract / Security / Compliance
9. Human approval       — if governance requires or threshold exceeded
10. Transactional write — single DB transaction, idempotency key where needed
11. Domain event        — publish to event bus
12. Notification        — relevant actors notified
13. Audit record        — immutable, includes governance result + AI ref
14. Response            — typed response envelope
```

---

### 6.1 CAPTURE LEAD

**Business purpose:** Record an inbound or outbound prospect as a Lead in the CRM system of record. This is the entry point of the entire commercial pipeline.

**Trigger:** POST /api/crm/leads — from web form, HarvyX import job, sales rep, or API.

**Actor:** SalesRep | SalesManager | System (HarvyX import) | API client

**Input schema:**
```typescript
interface CreateLeadInput {
  source: LeadSource                  // required
  firstName: string                   // required, max 100
  lastName: string                    // required, max 100
  email?: string                      // validated email format
  phone?: string                      // E.164 format
  company?: string
  jobTitle?: string
  countryCode?: string                // ISO 3166-1 alpha-2
  industryCode?: string
  estimatedValue?: number             // positive decimal
  currency?: string                   // ISO 4217, default USD
  productInterest?: string[]
  externalId?: string                 // HarvyX ref, must be unique if provided
  assignedTo?: string                 // User.id — defaults to current actor
  tags?: string[]
  metaData?: Record<string, unknown>
}
```

**Business rules:**
- If `externalId` is provided and already exists in this tenant → reject with 409 Conflict (idempotency).
- `email` must be globally unique per tenant (not per lead — check Customer and Contact tables too).
- `estimatedValue` must be positive if provided.
- `assignedTo` must be a valid User.id within the tenant with role ≥ SalesRep.

**AI decision:** After save, trigger async AI lead scoring via Groq. Do not block the write on AI. Store `score`, `scoreModel`, `scoreAt` as a subsequent update. If Groq is unavailable, log and continue — score remains null, not fabricated.

**Neural Governance:** Lead creation is LOW risk. Governance check runs but is not expected to block unless sanctions match on company name (Compliance check). Log governance decision regardless of outcome.

**Database write:**
```sql
BEGIN;
INSERT INTO "Lead" (...) VALUES (...) RETURNING id;
INSERT INTO "AuditLog" (actor, tenantId, action, objectType, objectId, ...) VALUES (...);
COMMIT;
```

**Domain event emitted:** `lead.created` `{ leadId, tenantId, source, assignedTo, estimatedValue, currency }`

**Outbound notification:** Assigned sales rep notified via Notifications module (Module 20).

**Audit record must include:**
- actor (User.id or system)
- tenantId
- action: `LEAD_CREATED`
- objectType: `Lead`
- objectId: lead.id
- correlationId: request ID
- governanceDecision: PASS | BLOCK | ESCALATE
- aiRef: null (score arrives async)

**Response:**
```typescript
interface CreateLeadResponse {
  id: string
  leadNumber: string    // formatted reference
  status: LeadStatus
  assignedTo: string
  createdAt: string
  _links: { self: string; qualify: string; convert: string }
}
```

---

### 6.2 QUALIFY LEAD

**Business purpose:** Advance a Lead from NEW or CONTACTED to QUALIFIED or DISQUALIFIED based on defined criteria (BANT or equivalent). This gates whether a Deal is created.

**Trigger:** PATCH /api/crm/leads/:id/qualify

**Actor:** SalesRep | SalesManager

**Pre-conditions:**
- Lead exists, belongs to tenant, is not CONVERTED or DISQUALIFIED.
- Actor has UPDATE permission on Lead.

**Input schema:**
```typescript
interface QualifyLeadInput {
  outcome: 'QUALIFIED' | 'DISQUALIFIED'
  qualificationNotes: string          // required
  disqualifyReason?: string           // required if outcome = DISQUALIFIED
  estimatedValue?: number             // update if known
  expectedCloseDate?: string          // ISO 8601
  nextFollowUpAt?: string
}
```

**Business rules:**
- If QUALIFIED: `qualificationNotes` must have at least 20 characters.
- If DISQUALIFIED: `disqualifyReason` must be provided.
- Status machine: NEW → QUALIFIED | CONTACTED → QUALIFIED | NEW → DISQUALIFIED | CONTACTED → DISQUALIFIED. Any other current status → reject 409.

**AI decision:** AI may provide a qualification recommendation (score threshold ≥ 60 = suggest QUALIFIED). AI suggestion is advisory. Human decision is final.

**Neural Governance:** MEDIUM risk. Contract check (if lead references an existing contract). Compliance check (sanctions on company). Log result.

**Database write:**
```sql
BEGIN;
UPDATE "Lead" SET status = $status, qualificationNotes = $notes, updatedBy = $actor, updatedAt = NOW() WHERE id = $id AND tenantId = $tenantId;
INSERT INTO "AuditLog" (...);
COMMIT;
```

**Domain event emitted:** `lead.qualified` or `lead.disqualified`

---

### 6.3 CONVERT LEAD

**Business purpose:** Convert a QUALIFIED Lead into a Customer + Contact + Deal. This is the most important state transition in the commercial pipeline. It is a multi-table transactional operation.

**Trigger:** POST /api/crm/leads/:id/convert

**Actor:** SalesRep | SalesManager

**Pre-conditions:**
- Lead status = QUALIFIED.
- No existing Customer with same `externalId` (if provided).

**Input schema:**
```typescript
interface ConvertLeadInput {
  createCustomer: boolean             // true = create new Customer; false = link to existing
  existingCustomerId?: string         // required if createCustomer = false
  customerName?: string               // required if createCustomer = true
  customerType?: CustomerType
  countryCode?: string
  currencyCode?: string
  createDeal: boolean
  dealName?: string                   // required if createDeal = true
  dealStage?: DealStage               // default DISCOVERY
  dealValue?: number
  dealCurrency?: string
  expectedCloseDate?: string
  assignedTo?: string
}
```

**Business rules:**
- Cannot convert a lead that is not QUALIFIED.
- Cannot convert a lead that is already CONVERTED.
- If `createCustomer = false`, `existingCustomerId` must exist and belong to the same tenant.
- `dealValue` must be positive if provided.
- This is an atomic operation. If any part fails, roll back all.

**Neural Governance:** HIGH risk. All five checks run:
- Legal: entity name check, country risk
- Budget: no budget impact at conversion
- Contract: any existing framework agreement with the company?
- Security: actor permissions validated at domain level
- Compliance: AML/sanctions on customer name + country. If BLOCK, conversion halts, escalation ticket created.

**Database write (atomic transaction):**
```sql
BEGIN;
-- 1. Create or link Customer
INSERT INTO "Customer" (...) VALUES (...) RETURNING customerId;
-- 2. Create Contact from Lead fields
INSERT INTO "Contact" (...) VALUES (...);
-- 3. Optionally create Deal
INSERT INTO "Deal" (...) VALUES (...) RETURNING dealId;
-- 4. Update Lead status to CONVERTED
UPDATE "Lead" SET status = 'CONVERTED', convertedAt = NOW(), convertedCustomerId = $cid, convertedDealId = $did WHERE id = $leadId;
-- 5. Audit
INSERT INTO "AuditLog" (...);
COMMIT;
```

**Domain events emitted:**
- `customer.created` (if new customer)
- `deal.created` (if deal created)
- `lead.converted` `{ leadId, customerId, dealId, tenantId }`

---

### 6.4 CREATE OPPORTUNITY

**Business purpose:** Formalise a Deal into a tracked Opportunity with probability, forecast category, and timeline. Opportunities drive pipeline reporting.

**Trigger:** PATCH /api/crm/deals/:id — stage advancement + forecast metadata update. Or POST /api/crm/deals for a net-new deal not arising from lead conversion.

**Input schema:**
```typescript
interface CreateOpportunityInput {
  name: string
  customerId: string
  stage: DealStage
  probability: number               // 0–100
  value: number
  currency: string
  expectedCloseDate: string
  forecastCategory: 'COMMIT' | 'BEST_CASE' | 'PIPELINE' | 'OMITTED'
  assignedTo?: string
  nextAction?: string
  nextActionDue?: string
  competitorNotes?: string
  tags?: string[]
}
```

**Business rules:**
- `probability` must be 0–100 integer.
- `value` must be positive.
- `expectedCloseDate` must be in the future.
- `forecastCategory = COMMIT` requires `probability ≥ 80` — enforce server-side.
- A deal in CLOSED_WON or CLOSED_LOST may not be re-opened without explicit escalation.

**Domain event emitted:** `deal.created` or `deal.updated`

---

### 6.5 CREATE QUOTE (CPQ)

**Business purpose:** Generate a priced proposal from a Deal. Quote lines pull from PriceList with applicable discounts. Tax is calculated via Tax Engine (Module 17). FX conversion via FX Engine (Module 18) if multi-currency.

**Trigger:** POST /api/crm/deals/:id/quotes

**Actor:** SalesRep | SalesManager

**Input schema:**
```typescript
interface CreateQuoteInput {
  contactId?: string
  validUntil: string                  // ISO 8601, must be future
  currency: string
  paymentTerms?: string
  deliveryTerms?: string              // Incoterms: EXW | FOB | CIF | DDP | etc.
  notes?: string
  lines: Array<{
    productId: string
    quantity: number
    uomOverride?: string
    unitPriceOverride?: number        // sales manager only; logs override reason
    discountOverride?: number         // 0–1 fraction; requires approval if > threshold
    taxCodeOverride?: string
    notes?: string
  }>
}
```

**Business rules:**
- `validUntil` must be at least 24 hours in the future.
- Each `productId` must exist in Product Catalogue and be active.
- `quantity` must be positive.
- `unitPrice` is resolved from PriceList in this priority: customer-specific → volume → promotional → standard. Override requires SalesManager permission.
- Discount above `tenant.maxSalesRepDiscount` requires SalesManager approval (governance threshold).
- Tax is calculated per line via Tax Engine API (synchronous call, required). If Tax Engine unavailable, quote cannot be created — do not estimate tax.
- If quote currency ≠ deal currency, apply FX rate from FX Engine and record the rate used.
- `totalAmount = Σ(lineTotal) + taxAmount - discountAmount`. Verify server-side. Never trust client-submitted total.

**AI decision:** CPQ AI suggests unit price adjustments based on:
- demand forecast from Data Ocean (if available)
- customer's historical purchase behaviour
- current competitor pricing (if Data Ocean signal exists)
AI suggestion is advisory. Sales rep accepts or overrides.

**Neural Governance:** HIGH risk — financial commitment.
- Budget check: does this quote value fall within sales rep's delegated authority?
- Contract check: does the customer have a framework agreement that constrains pricing?
- Legal check: export control on the products (HS code check)?
- Compliance: is the customer active and not on hold?
- Security: actor permissions.

**Database write:**
```sql
BEGIN;
INSERT INTO "Quote" (...) RETURNING quoteId;
INSERT INTO "QuoteLine" (...) -- one per line
INSERT INTO "AuditLog" (...);
COMMIT;
```

**Domain events emitted:** `quote.created` `{ quoteId, dealId, customerId, totalAmount, currency, tenantId }`

---

### 6.6 APPROVE QUOTE

**Business purpose:** Quotes above sales rep delegation threshold require manager approval before being sent to the customer.

**Trigger:** POST /api/crm/quotes/:id/approve or /reject

**Actor:** SalesManager | Director (depending on threshold)

**Pre-conditions:**
- Quote status = SUBMITTED.
- Actor has APPROVE permission.
- Actor is not the quote creator (four-eyes principle for high-value quotes — threshold TBD).

**Input schema:**
```typescript
interface ApproveQuoteInput {
  decision: 'APPROVED' | 'REJECTED'
  reason?: string                     // required if REJECTED
  conditionsNotes?: string
}
```

**Business rules:**
- Only SUBMITTED quotes can be approved or rejected.
- Approval sets `status = APPROVED`, `approvedBy`, `approvedAt`.
- Rejection sets `status = REJECTED`, `rejectedBy`, `rejectedAt`, `rejectionReason`.
- Approved quote may then be sent to customer and awaits conversion to order.

**Neural Governance:** Runs again at approval. Budget authority check is the critical gate.

**Domain events emitted:** `quote.approved` or `quote.rejected`

---

### 6.7 CREATE SALES ORDER

**Business purpose:** Convert an APPROVED Quote into a binding Sales Order. This is the commercial commitment that triggers inventory reservation, production planning, and AR invoice.

**Trigger:** POST /api/crm/quotes/:id/convert-to-order

**Actor:** SalesManager | System (if auto-conversion policy set)

**Pre-conditions:**
- Quote status = APPROVED.
- Customer status = ACTIVE.
- No active credit hold on the customer.

**Input schema:**
```typescript
interface CreateSalesOrderInput {
  requestedDeliveryDate?: string
  deliveryAddress?: {
    line1: string; line2?: string; city: string; state?: string;
    postalCode: string; countryCode: string
  }
  warehouseId?: string
  notes?: string
  internalNotes?: string
  idempotencyKey: string              // required — prevent duplicate orders
}
```

**Business rules:**
- `idempotencyKey` must be checked before insert. If a completed order with the same key exists, return it. Do not create a duplicate.
- Customer credit check is mandatory. Call CreditLimit service — if `usedAmount + orderTotal > approvedLimit`, order goes to CREDIT_HOLD status. Do not block silently.
- Order lines are copied from QuoteLines with quantities and prices locked at quote values.
- Once confirmed, order lines are immutable (require cancellation + new order to change).
- Order total must be recomputed server-side from quote lines; do not use client-submitted total.

**AI decision:** Delivery date prediction based on inventory levels, production schedule, and logistics capacity (TARGET — not currently live).

**Neural Governance:** CRITICAL risk — all five checks.
- Legal: export licence required for the destination country + product?
- Budget: does the order require board-level approval based on value?
- Contract: customer has active contract? Pricing consistent with framework?
- Security: actor has ORDER permission?
- Compliance: no sanctions hit on delivery address country?

**Database write (atomic):**
```sql
BEGIN;
INSERT INTO "SalesOrder" (...) RETURNING orderId;
INSERT INTO "SalesOrderLine" (...) -- one per quote line
UPDATE "Quote" SET status = 'CONVERTED', convertedOrderId = $orderId WHERE id = $quoteId;
INSERT INTO "AuditLog" (...);
COMMIT;
```

**Domain events emitted:**
- `sales.order.confirmed` — consumed by Inventory (reservation), Finance (AR staging), Production Planning
- `inventory.reservation.requested` — CRM publishes; Inventory responds with `inventory.reservation.confirmed`

---

### 6.8 RELEASE ORDER TO FULFILLMENT

**Business purpose:** Move a CONFIRMED order into active fulfillment, signalling Inventory + Logistics to execute.

**Trigger:** POST /api/crm/orders/:id/release

**Pre-conditions:**
- Order status = CONFIRMED (not CREDIT_HOLD).
- Inventory reservation confirmed.
- Credit check passed.

**Business rules:**
- If credit hold active → must be manually cleared by Finance or Credit Manager.
- Release is logged as an explicit action, not an automatic status change. Human intent is required.

**Domain events emitted:** `sales.order.released` — consumed by Logistics (Module 13) and WMS (Module 10).

---

### 6.9 CREATE INVOICE (HANDOFF TO FINANCE)

**Business purpose:** After delivery confirmed (POD received), trigger invoice creation. CRM initiates; Finance (Module 01 AR) owns the invoice.

**Trigger:** POST /api/crm/orders/:id/request-invoice — or automatic on POD event from Logistics.

**Actor:** Billing Clerk | System (on POD event)

**Business rules:**
- Order status must be DELIVERED or SHIPPED (with POD).
- Invoice is created in Finance module via typed API call. CRM does not own the Invoice entity.
- `invoiceId` is written back to `SalesOrder.invoiceId` on successful creation.
- If Finance API call fails, retry with exponential backoff. Do not silently succeed. Record failure state.

**Domain events emitted:** `invoice.requested` — consumed by Finance (AR).
Finance publishes `invoice.created` back — CRM updates `SalesOrder.invoiceId`.

---

### 6.10 HANDLE RETURN (RMA)

**Business purpose:** Customer requests to return goods. Creates a Return record, triggers QC inspection and refund/credit note in Finance.

**Trigger:** POST /api/crm/returns

**Input schema:**
```typescript
interface CreateReturnInput {
  customerId: string
  orderId: string
  reason: string                      // DAMAGED | WRONG_ITEM | QUALITY | OVERSTOCK | OTHER
  lines: Array<{
    orderLineId: string
    quantity: number
    description?: string
  }>
  resolution: 'REFUND' | 'REPLACEMENT' | 'CREDIT_NOTE'
  notes?: string
}
```

**Business rules:**
- Order must be in DELIVERED or INVOICED status.
- Return quantity must not exceed delivered quantity.
- Return window policy (e.g., 30 days from delivery) — configurable per tenant. Reject if outside window (unless SalesManager overrides).
- RMA number is system-generated: `RMA-{YYYYMMDD}-{sequence}`.

**Neural Governance:** MEDIUM risk. Financial impact triggers budget check.

**Domain events emitted:** `return.created` — consumed by Inventory (reverse stock), Finance (credit note), Quality (inspection).

---

### 6.11 OPEN SUPPORT TICKET

**Business purpose:** Record a post-sale customer issue and track it to resolution within SLA.

**Trigger:** POST /api/crm/tickets

**Input schema:**
```typescript
interface CreateTicketInput {
  customerId: string
  contactId?: string
  orderId?: string
  type: string                        // COMPLAINT | INQUIRY | DELIVERY | QUALITY | BILLING | OTHER
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  subject: string                     // max 200 chars
  description: string                 // max 5000 chars
  assignedTo?: string
  slaId?: string                      // auto-resolved from customer type if not provided
}
```

**Business rules:**
- CRITICAL priority tickets must have `assignedTo` set or auto-assigned to on-call.
- SLA is resolved from `Customer.type` if not explicitly provided.
- `firstResponseAt` must be recorded within SLA.firstResponseMins of creation.
- SLA breach monitoring runs as a background job — not as a UI display hack.

**Domain events emitted:** `support.ticket.created`

---

## 7. LEAD-TO-CASH COMPLETE FLOW

This is the primary commercial highway. Every step below is a governed state transition.

```text
LEAD CREATED                          lead.created
  ↓
  [AI Score — async]                  → score, scoreModel written to Lead
  ↓
LEAD QUALIFIED                        lead.qualified
  ↓
LEAD CONVERTED                        customer.created + deal.created + lead.converted
  ↓
OPPORTUNITY MANAGED                   deal.updated (stage progressions)
  ↓
QUOTE CREATED                         quote.created
  [Tax Engine called]
  [FX Engine called if multi-currency]
  [CPQ AI suggestion — advisory]
  ↓
QUOTE APPROVED                        quote.approved
  [Governance: Budget authority]
  ↓
SALES ORDER CREATED                   sales.order.confirmed
  [Credit check]
  [idempotency key enforced]
  [Governance: ALL FIVE CHECKS]
  ↓
INVENTORY RESERVATION                 inventory.reservation.requested
  ↓
ORDER RELEASED                        sales.order.released
  ↓
SHIPPED / DELIVERED / POD             (Logistics Module 13 events)
  ↓
INVOICE REQUESTED                     invoice.requested → Finance AR
  ↓
INVOICE CREATED                       invoice.created (Finance publishes)
  ↓
PAYMENT RECEIVED                      payment.received (HPay publishes)
  ↓
LEDGER POSTED                         ledger.posted (Finance GL)
  ↓
DEAL CLOSED WON                       deal.closed_won
  ↓
DATA OCEAN                            transaction data → Bronze → Silver → Gold
  ↓
AI LEARNING                           demand, pricing, coverage models updated
```

**Priority for this build (Board Briefing directive):**
`CRM → Quote-to-Cash → Books`

That means: Lead → Customer → Deal → Quote → Order → Invoice. This path must work end-to-end before any other CRM feature is extended.

---

## 8. API CONTRACT

### 8.1 Base path: `/api/crm`

All routes:
- Require `Authorization: Bearer <jwt>` header
- Enforce `tenantId` from JWT claims — never from request body
- Return typed error envelope: `{ error: { code, message, field? }, requestId }`
- All mutating endpoints require idempotency consideration

### 8.2 Route table

```text
METHOD  PATH                                    PERMISSION         STATUS
──────────────────────────────────────────────────────────────────────────────
LEADS
POST    /api/crm/leads                          crm:lead:create    IMPLEMENTED (Wave 8 + unify)
GET     /api/crm/leads                          crm:lead:read      IMPLEMENTED
GET     /api/crm/leads/:id                      crm:lead:read      IMPLEMENTED
PATCH   /api/crm/leads/:id                      crm:lead:update    IMPLEMENTED
POST    /api/crm/leads/:id/qualify              crm:lead:qualify   SPECIFIED
POST    /api/crm/leads/:id/convert              crm:lead:convert   SPECIFIED
DELETE  /api/crm/leads/:id                      crm:lead:delete    IMPLEMENTED (soft)

CUSTOMERS
POST    /api/crm/customers                      crm:cust:create    IMPLEMENTED
GET     /api/crm/customers                      crm:cust:read      IMPLEMENTED
GET     /api/crm/customers/:id                  crm:cust:read      IMPLEMENTED
GET     /api/crm/customers/:id/360              crm:cust:read      IMPLEMENTED
PATCH   /api/crm/customers/:id                  crm:cust:update    IMPLEMENTED
DELETE  /api/crm/customers/:id                  crm:cust:delete    IMPLEMENTED (soft)

CONTACTS
POST    /api/crm/customers/:id/contacts         crm:contact:create SPECIFIED
GET     /api/crm/customers/:id/contacts         crm:contact:read   SPECIFIED
PATCH   /api/crm/contacts/:id                   crm:contact:update SPECIFIED

DEALS
POST    /api/crm/deals                          crm:deal:create    IMPLEMENTED
GET     /api/crm/deals                          crm:deal:read      IMPLEMENTED
GET     /api/crm/deals/:id                      crm:deal:read      IMPLEMENTED
PATCH   /api/crm/deals/:id                      crm:deal:update    IMPLEMENTED

QUOTES (CPQ)
POST    /api/crm/deals/:id/quotes               crm:quote:create   SPECIFIED
GET     /api/crm/quotes                         crm:quote:read     SPECIFIED
GET     /api/crm/quotes/:id                     crm:quote:read     SPECIFIED
POST    /api/crm/quotes/:id/submit              crm:quote:submit   SPECIFIED
POST    /api/crm/quotes/:id/approve             crm:quote:approve  SPECIFIED
POST    /api/crm/quotes/:id/reject              crm:quote:approve  SPECIFIED
POST    /api/crm/quotes/:id/convert-to-order    crm:order:create   SPECIFIED

SALES ORDERS
POST    /api/crm/orders                         crm:order:create   SPECIFIED
GET     /api/crm/orders                         crm:order:read     SPECIFIED
GET     /api/crm/orders/:id                     crm:order:read     SPECIFIED
POST    /api/crm/orders/:id/release             crm:order:release  SPECIFIED
POST    /api/crm/orders/:id/request-invoice     crm:order:invoice  SPECIFIED
POST    /api/crm/orders/:id/cancel              crm:order:cancel   SPECIFIED

ACTIVITIES
POST    /api/crm/activities                     crm:act:create     SPECIFIED
GET     /api/crm/activities                     crm:act:read       SPECIFIED
PATCH   /api/crm/activities/:id                 crm:act:update     SPECIFIED

CREDIT LIMITS
GET     /api/crm/customers/:id/credit           crm:credit:read    SPECIFIED
PUT     /api/crm/customers/:id/credit           crm:credit:manage  SPECIFIED

RETURNS
POST    /api/crm/returns                        crm:return:create  SPECIFIED
GET     /api/crm/returns/:id                    crm:return:read    SPECIFIED

SUPPORT TICKETS
POST    /api/crm/tickets                        crm:ticket:create  SPECIFIED
GET     /api/crm/tickets                        crm:ticket:read    SPECIFIED
PATCH   /api/crm/tickets/:id                    crm:ticket:update  SPECIFIED
```

### 8.3 Standard response envelope

```typescript
// Success (single)
{ data: T, meta: { requestId: string, timestamp: string } }

// Success (list)
{ data: T[], meta: { requestId: string, timestamp: string, page: number, perPage: number, total: number } }

// Error
{ error: { code: string, message: string, field?: string }, meta: { requestId: string, timestamp: string } }
```

### 8.4 Critical API rules
- Never return a 200 with an error inside it.
- Auth failures → 401. Permission failures → 403. Not found → 404. Conflict → 409. Validation → 400 with field.
- All 5xx errors must be logged with full trace before responding.
- Rate limiting: AI-touching endpoints (lead scoring, CPQ AI) must have per-tenant rate limiting. `SPECIFIED`

---

## 9. AI INTEGRATION

### 9.1 Currently live (IMPLEMENTED)
- **Lead Scoring** — Groq Llama 3.3 70B. Input: lead fields → Output: score 0–100 + reasoning. Runs async after lead creation. Stored in `Lead.score`, `Lead.scoreModel`, `Lead.scoreAt`.
- **Communication Drafts** — Groq. Generates email/message drafts for CrmActivity. Actor reviews before sending.

### 9.2 Specified (not yet live)
- **CPQ Pricing AI** — price.py. Inputs: demand elasticity, competitor pricing, cost floor, target margin → recommended price + volume/revenue/margin impact.
- **Churn Prediction** — credit_scoring.py adapted. Flag deals at risk.
- **Territory Strategy** — strategy.py. Priority retailers, optimal visit sequence.

### 9.3 AI execution rules (non-negotiable)
```text
AI NEVER does:
  ✗ direct SQL writes
  ✗ payment initiation
  ✗ governance bypass
  ✗ fabricate inventory/pricing data

AI ALWAYS does:
  ✓ reads from Gold layer (Data Ocean) or live Prisma
  ✓ returns structured typed decision
  ✓ is bounded by governance
  ✓ has fallback (null score / human decision) if unavailable
  ✓ records model version + input reference in audit
```

### 9.4 AI audit record (every AI-influenced action)
```typescript
{
  actor: 'ai',
  model: 'groq/llama-3.3-70b',
  modelVersion: string,
  decision: string,
  confidence: number,
  inputReference: string,     // hash or ID of input data used
  governanceResult: string,
  executionReference: string  // correlates to the mutation it influenced
}
```

---

## 10. NEURAL GOVERNANCE INTEGRATION

### 10.1 Five checks — CRM relevance map

| Check | CRM Application | Threshold |
|-------|----------------|-----------|
| Legal | Export control on products. Customer country risk. Sanctions match on company name. | TBD per jurisdiction |
| Budget | Quote / order value vs sales rep delegated authority. Discount > threshold. | TBD per tenant config |
| Contract | Framework agreement pricing constraints. Customer contract status. | TBD |
| Security | Actor permission for the specific action. Role vs action mapping. | Always enforced |
| Compliance | AML/KYC status of customer. Credit hold. Active sanctions. | Always enforced on order creation |

### 10.2 Governance call pattern
```typescript
// Every governed mutation calls this before the DB write
async function runGovernance(context: GovernanceContext): Promise<GovernanceResult> {
  // context: { tenantId, actorId, actionType, objectType, objectId, payload, riskScore }
  // result: { decision: 'PASS' | 'BLOCK' | 'ESCALATE', failedChecks: string[], explanation: string, decisionId: string }
}
```

### 10.3 Governance does not live in the UI
Governance middleware is server-side. A UI badge saying "governance pending" is not governance. Every governed POST/PUT/PATCH/DELETE runs the check before the DB write, not after.

### 10.4 Current truth
Governance middleware exists in the codebase. It is `UNKNOWN` whether it is correctly wired to all CRM mutation paths. Before marking any endpoint as S4, verify governance is on the execution path — not just present in the project.

---

## 11. PERMISSIONS (RBAC)

### 11.1 Permission capability classes

```text
crm:lead:read       — view leads
crm:lead:create     — create leads
crm:lead:update     — update lead fields
crm:lead:qualify    — move lead to qualified/disqualified
crm:lead:convert    — convert lead to customer + deal
crm:lead:delete     — soft-delete lead
crm:cust:read       — view customers
crm:cust:create     — create customers
crm:cust:update     — update customer fields
crm:cust:delete     — soft-delete
crm:contact:*       — contact CRUD
crm:deal:read       — view deals and pipeline
crm:deal:create     — create deals
crm:deal:update     — update deal stage, value, forecast
crm:deal:close      — close won / close lost
crm:quote:create    — create quotes
crm:quote:submit    — submit quote for approval
crm:quote:approve   — approve or reject quotes
crm:quote:override  — override unit price or discount
crm:order:create    — create sales orders
crm:order:release   — release order to fulfillment
crm:order:cancel    — cancel order
crm:order:invoice   — trigger invoice request
crm:credit:read     — view credit limits
crm:credit:manage   — set and modify credit limits
crm:return:create   — raise return request
crm:return:approve  — approve returns
crm:ticket:create   — raise support ticket
crm:ticket:update   — update ticket / resolve
crm:act:create      — log activities
crm:act:read        — view activities
crm:act:update      — update activities
```

### 11.2 Role → permission matrix

```text
Role            Permissions
─────────────────────────────────────────────────────────────────────
SalesRep        read all CRM, create leads, create activities,
                create quotes (within authority), create deals
SalesManager    all SalesRep + qualify/convert leads, approve quotes,
                credit limit read, discount overrides within policy
Director        all SalesManager + approve high-value quotes,
                credit limit management, close deals above threshold
Finance         credit:read, order:read, return:read
CreditManager   credit:read, credit:manage, order:read (credit check)
Support         ticket:*, activity:create
SystemImport    lead:create (HarvyX import job — scoped, no UI access)
TenantAdmin     all CRM permissions
```

Exact matrix is `TBD` — must be formalised in the RBAC configuration before S4 certification.

---

## 12. BUILD GRADUATION ROADMAP (S0 → S4)

### Stage definitions

| Stage | Meaning | Language allowed |
|-------|---------|-----------------|
| S0 Catalogue | Name, band, route in registry | "On the map" |
| S1 Factory | JSON CRUD at /api/m/:id via generic factory | "Scaffold — never 'live product'" |
| S2 Domain API | Prisma model + typed Wave/domain controller | "API exists" |
| S3 Operator UI | Real OS page with real data, no mock KPIs | "In use internally" |
| S4 Controlled | Auth, audit, governance on all writes, RBAC complete | "Fit for customer data" |

### CRM Module 05 — Current vs Target

```text
FEATURE                     CURRENT     TARGET    NEXT ACTION
─────────────────────────────────────────────────────────────────────────
Lead CRUD                   S3          S4        Wire governance, fix dual table
Customer 360                S3          S4        Remove mock KPIs, verify audit
Deal / Pipeline             S3          S4        Governance on close
CrmActivity                 S3          S4        Rate limiting
AI Lead Scoring             S3          S4        Fallback when Groq down
Quote / CPQ                 S0          S4        Full build — priority 2
Sales Order                 S1          S4        Upgrade from scaffold
Credit Check                S1          S4        Real CreditLimit Prisma model
Quote Approval              S0          S4        Requires Quote first
Order → Invoice handoff     S0          S4        Requires Order + Finance API
Return (RMA)                S0          S3        Medium priority
Support Tickets             S0          S3        Medium priority
Subscription / Loyalty      S0          TARGET    Low priority — post Q2
Rebates / SLA               S0          TARGET    Low priority — post Q2
Governance on all writes    UNKNOWN     S4        Verify and wire — blocker for S4
Full RBAC                   PARTIAL     S4        Blocker for S4
Rate limiting AI endpoints  NONE        S4        Blocker for S4
/api/v2/* auth scope        BROKEN      S4        Security gap — fix immediately
```

### Build sequence (priority order, per Board Briefing directive)

#### Sprint 1 — Foundation integrity (Days 1–14)
1. **Kill dual Lead table.** Unify `/api/crm/leads` and Wave 8 into one canonical Lead Prisma model with one API. Deprecate the other. Do not run two systems.
2. **Remove mock KPIs from the UI.** No `847 accounts`, no `$4.82M pipeline` unless the data is real. Replace with real record counts or blank state.
3. **Fix /api/v2/* auth scope.** `actorId` and `actorRole` must never be null. This is a live security gap.
4. **Honest registry flags.** Update `module-registry.json` so the CRM sub-features reflect actual S0–S4 status. Remove "71 live" claim from any public surface.

#### Sprint 2 — CRM as single commercial system of record (Days 15–45)
5. Implement `qualify` and `convert` actions on Lead with full workflow, governance, and atomic DB transaction.
6. Implement `Contact` entity and full CRUD under Customer.
7. Complete `CreditLimit` Prisma model, creation + read API.
8. Complete `CrmActivity` with all activity types (currently partial).
9. Customer 360 page shows real Prisma data: customer summary, contacts, deals, recent activities, credit status.
10. HarvyX import job — one-way import to canonical Lead table. Job logs all imported records. Idempotent on externalId.

#### Sprint 3 — Quote-to-Cash thin slice (Days 46–90)
11. Build `PriceList` + `PriceListEntry` Prisma models.
12. Build Quote + QuoteLine with Tax Engine integration (synchronous). If Tax Engine not available, block quote creation — never estimate tax.
13. Build Quote approval workflow with governance on budget authority.
14. Build `SalesOrder` + `SalesOrderLine` from approved Quote, with idempotency key enforcement and credit check.
15. Build Order → Invoice handoff (domain event to Finance / typed API call to Finance AR).
16. Wire Neural Governance to Quote creation and Order confirmation — verified on execution path, not just in middleware file.

#### Sprint 4 — Operations + Controls (Q2)
17. Returns (RMA) workflow.
18. Support Tickets with SLA monitoring.
19. Full RBAC matrix implemented in auth middleware.
20. Rate limiting on AI endpoints.
21. Governance audit log verified for all CRM mutations.
22. Per-route auth test suite.

#### Sprint 5 — Scale + Intelligence (H2)
23. CPQ AI (price.py) connected to live Prisma data.
24. Churn risk signal on deals.
25. Data Ocean Bronze: CRM transactions → Kafka topic `crm.order.confirmed`.
26. Board pack KPIs drawn from real Finance + CRM data (Modules 01 + 05 combined).
27. Subscription / Loyalty / Rebates — only after commercial path is stable.

---

## 13. UI ARCHITECTURE

### 13.1 Route structure
```text
/os/crm                           — CRM home / dashboard (real data only)
/os/crm/leads                     — Lead list
/os/crm/leads/new                 — Create lead
/os/crm/leads/:id                 — Lead detail
/os/crm/leads/:id/qualify         — Qualify action
/os/crm/leads/:id/convert         — Convert action
/os/crm/customers                 — Customer list
/os/crm/customers/new             — Create customer
/os/crm/customers/:id             — Customer 360
/os/crm/customers/:id/contacts    — Contacts
/os/crm/customers/:id/deals       — Deals
/os/crm/customers/:id/orders      — Orders
/os/crm/customers/:id/tickets     — Support tickets
/os/crm/deals                     — Pipeline view
/os/crm/deals/:id                 — Deal detail
/os/crm/deals/:id/quotes          — Deal quotes
/os/crm/quotes                    — Quote list
/os/crm/quotes/:id                — Quote detail + approval
/os/crm/orders                    — Sales order list
/os/crm/orders/:id                — Order detail
/os/crm/activities                — Activity feed
/os/crm/returns                   — Return list
/os/crm/tickets                   — Support ticket queue
/os/crm/admin/pricelists          — Price lists (admin only)
/os/crm/admin/credit              — Credit limit management
```

### 13.2 UI rules (non-negotiable)
- No fake KPIs. If data is not in the database, show empty state — not a placeholder number.
- No `847 accounts` or `$4.82M`. These are legacy mocks and must be removed.
- No mock pipeline deals with invented values.
- No generic `/os/module/05` placeholder — the CRM module has real screens; use them.
- All list views must show actual counts from the database.
- Loading states must be genuine — a spinner that resolves to real data, not a timed display.
- Error states must be shown and must be informative.

### 13.3 Design system
```text
Background:        #050816
Card background:   #0f172a
Gold accent:       #fbbf24
Typography KPIs:   Cormorant Garamond
Typography body:   DM Sans
Typography IDs:    JetBrains Mono
```

Comply with `HARVICS_SYSTEM_RULES.md` at all times.

---

## 14. NOTIFICATIONS

CRM must trigger notifications via Module 20 (Notifications) — not ad-hoc email code inside CRM.

| Event | Recipient | Channel |
|-------|-----------|---------|
| Lead assigned | Assigned sales rep | In-app + email |
| Lead scored | Assigned sales rep | In-app |
| Quote submitted | SalesManager | In-app + email |
| Quote approved | Sales rep | In-app + email |
| Quote rejected | Sales rep | In-app + email |
| Quote expiring (48h) | Sales rep | In-app + email |
| Order confirmed | Customer (external) | Email |
| Order on credit hold | Sales rep + Finance | In-app + email |
| Return approved | Sales rep + Customer | Email |
| Ticket SLA breach | Support manager | In-app + email (CRITICAL) |
| Deal stage change | Sales manager | In-app |
| Governance block | Actor + escalation owner | In-app + email |

---

## 15. AUDIT REQUIREMENTS

Every CRM mutation must produce an immutable AuditLog record.

```typescript
interface CrmAuditRecord {
  id: string                        // cuid
  tenantId: string
  correlationId: string             // request ID, traces across services
  actor: string                     // User.id or 'system' or 'ai'
  actorRole: string
  timestamp: string                 // ISO 8601 UTC
  action: string                    // LEAD_CREATED | LEAD_QUALIFIED | DEAL_CREATED | QUOTE_APPROVED | ORDER_CONFIRMED | etc.
  objectType: string                // Lead | Customer | Deal | Quote | SalesOrder | etc.
  objectId: string
  before: Record<string, unknown>   // material fields before change (null for creates)
  after: Record<string, unknown>    // material fields after change
  governanceDecision: string        // PASS | BLOCK | ESCALATE | NOT_REQUIRED
  governanceDecisionId?: string     // Neural Governance decision ID
  aiModel?: string                  // if AI influenced this action
  aiModelVersion?: string
  aiConfidence?: number
  aiDecision?: string
  ipAddress?: string
  userAgent?: string
}
```

Audit records are append-only. No UPDATE or DELETE on AuditLog — ever.

---

## 16. FAILURE AND RECOVERY

| Scenario | Required behaviour |
|----------|--------------------|
| Groq unavailable (AI scoring) | Log, set score = null, continue. Do not block lead creation. |
| Tax Engine unavailable (Quote) | Block quote creation with 503. Do not estimate tax. |
| FX Engine unavailable (multi-currency Quote) | Block quote creation. Do not use stale rate. |
| Finance API unavailable (invoice request) | Retry with exponential backoff. Log failure state on order. |
| Inventory reservation fails | Order goes to explicit PENDING_RESERVATION status. Do not silently proceed. |
| Governance times out | Conservative: treat as BLOCK. Log timeout. Notify escalation owner. |
| Duplicate order (same idempotency key) | Return existing order. Do not create duplicate. |
| Customer credit check API fails | Conservative: treat as CREDIT_HOLD. Log. Notify Finance. |

---

## 17. REPORTING AND KPIs

All KPIs must come from real Prisma data. No computed stubs.

```text
Pipeline KPIs
─────────────────────────────────────────────────
Lead volume           — COUNT(Lead) per period
Lead conversion rate  — COUNT(CONVERTED) / COUNT(total) per period
Pipeline value        — SUM(Deal.value WHERE stage NOT IN (CLOSED_WON, CLOSED_LOST))
Weighted pipeline     — SUM(Deal.value * Deal.probability / 100)
Win rate              — COUNT(CLOSED_WON) / COUNT(CLOSED_WON + CLOSED_LOST)
Average deal size     — AVG(Deal.value WHERE stage = CLOSED_WON)
Average sales cycle   — AVG(days from lead.createdAt to deal.actualCloseDate)
Quote-to-order rate   — COUNT(SalesOrder) / COUNT(Quote WHERE status = APPROVED)
AI score distribution — histogram of Lead.score values

Revenue KPIs (require Finance integration)
────────────────────────────────────────────────────────
Booked revenue        — SUM(SalesOrder.totalAmount WHERE status = CONFIRMED+)
Invoiced revenue      — SUM via Finance AR (not duplicated in CRM)
Outstanding AR        — via Finance AR (not duplicated in CRM)
```

---

## 18. SECURITY AND COMPLIANCE

```text
✓  Tenant isolation enforced at every query (tenantId from JWT, never request body)
✓  Soft delete only — no hard DELETE on Customer, Lead, Deal, Order, Quote
✓  Sensitive fields (credit limit, pricing overrides) — permission-gated at API
✓  No secrets in frontend, logs, or API responses
✓  Credit card / payment data — never stored in CRM; use HPay token reference
✓  GDPR / PDPA: customer PII retention policy configurable per tenant jurisdiction
✓  Audit log immutable — no update/delete
✓  API keys for HarvyX import scoped to lead:create only
✓  No customer data accessible without tenant context
✓  All AI input/output logged for compliance review
```

---

## 19. DEPENDENCY MAP

```text
CRM + SALES (Module 05)

UPSTREAM (CRM reads from / depends on)
────────────────────────────────────────────────────────
Identity / Auth (M16)     → User, Tenant, RBAC
Product Catalogue         → Product, SKU, UOM
Tax Engine (M17)          → TaxRate per product+jurisdiction
FX Engine (M18)           → Exchange rate for multi-currency quotes
Legal + Compliance (M08)  → AML/KYC status, framework contracts
HarvyX                    → Lead import (one-way)
Data Ocean                → Gold layer for AI models (TARGET)
AI Engine                 → Lead scoring, CPQ AI, strategy (PARTIAL/TARGET)
Neural Governance (M22)   → Pre-write governance decisions

DOWNSTREAM (CRM publishes to / triggers)
────────────────────────────────────────────────────────
Finance Core (M01)        → sales.order.confirmed → AR invoice
                            invoice.requested → invoice.created callback
Inventory + WMS (M10)     → inventory.reservation.requested
                            sales.order.released → fulfillment
Procurement (M07)         → deal.created (trigger production PR)
Logistics + Fleet (M13)   → sales.order.released → delivery
Marketing (M06)           → lead.qualified → marketing journey trigger
HPay (M03)                → payment.received → settlement
Notifications (M20)       → all CRM events → actor notifications
Audit Log (M19)           → all CRM mutations → immutable audit
Data Ocean                → all confirmed orders → Bronze ingestion
```

---

## 20. WHAT CURSOR MUST NOT DO

```text
✗  Do not use GenericModuleRecord for Lead, Customer, Deal, Quote, or Order data.
   These entities have explicit Prisma models. Use them.

✗  Do not render mock KPI numbers (847 accounts, $4.82M, etc.) anywhere.
   If real data is not there, show empty state.

✗  Do not accept tenantId from the request body.
   Always extract from JWT claims server-side.

✗  Do not call the Tax Engine and silently use a default if it fails.
   Quote creation must block if Tax Engine is unavailable.

✗  Do not mark a workflow as complete if governance is not on the execution path.
   "Governance middleware exists" ≠ "governance is wired to this endpoint."

✗  Do not write actorId = null or actorRole = null to the audit log.
   If auth scope is missing on /api/v2/*, fix it — do not work around it.

✗  Do not create a second CRM system.
   HarvyX feeds CRM. CRM is the record of truth.

✗  Do not fabricate AI scores if Groq is unavailable.
   Null is correct. An invented score is fraud.

✗  Do not skip idempotency key checks on SalesOrder creation.
   Duplicate orders are a commercial and financial integrity failure.

✗  Do not hard-delete any Customer, Lead, Deal, Quote, or Order.
   Soft delete (deletedAt timestamp) only. Financial history must be permanent.

✗  Do not present /os/module/05 generic scaffold as the CRM.
   Navigate to /os/crm/* with real screens.
```

---

## 21. ACCEPTANCE CRITERIA — GATE FOR S4

A CRM feature is not complete because the route renders.

### Functional
- [ ] Intended workflow works end-to-end with real Prisma data
- [ ] All validation rules enforced server-side (Zod)
- [ ] Error states return correct HTTP codes and typed error envelope
- [ ] Permission checks block unauthorised access with 403
- [ ] Idempotency enforced where specified

### Data
- [ ] Correct Prisma migration exists and has been applied
- [ ] No duplicate data written across two tables for the same entity
- [ ] Soft delete implemented — `deletedAt` present, hard delete impossible
- [ ] Audit record written on every mutation

### Security
- [ ] tenantId from JWT — never from request body
- [ ] Unauthorised access returns 401/403 — tested
- [ ] No mock data, no test credentials visible in production paths

### AI
- [ ] AI result stored with model version + input reference
- [ ] Fallback works when AI service unavailable
- [ ] AI does not mutate database directly

### Governance
- [ ] Neural Governance runs on every governed mutation — verified in execution trace
- [ ] Blocked actions return explanation — not a silent 500
- [ ] Governance decision recorded in audit log

### Observability
- [ ] requestId present in all responses and logs
- [ ] correlationId traces across services (Lead → Order → Finance event)
- [ ] Error path logged with full context before response

### Tests
- [ ] Unit tests for business rule functions (credit check, price resolution, status machine)
- [ ] Integration tests for all API endpoints in route table
- [ ] Workflow test: capture lead → qualify → convert → quote → order (happy path)
- [ ] Workflow test: credit hold scenario
- [ ] Governance block scenario tested
- [ ] Permission tests: SalesRep cannot approve quote
- [ ] Idempotency test: duplicate order submission

---

## 22. DOCUMENT MAINTENANCE

When this file is modified, update:
1. Section 3 (Honest State) — adjust status labels
2. Section 12 (Build Graduation Roadmap) — move features up the stage table
3. `module-registry.json` — update the status field for module 05 and sub-features
4. `MASTER.md` — if any architectural principle changes

Do not update this file to reflect aspirational state. Update it to reflect actual state.

**Last updated:** August 2026  
**Author:** Harvics build constitution — compiled from all source documents  
**Next review:** On completion of Sprint 2 (Days 15–45)

---

**END OF CRM_MASTER.md**
