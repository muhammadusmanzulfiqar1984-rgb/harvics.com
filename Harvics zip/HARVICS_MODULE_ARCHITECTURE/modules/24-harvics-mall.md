# Module 24 — Harvics Mall

**Plane:** Universe  
**Owner domain:** Universe  
**Current status:** TARGET / implementation status UNKNOWN

## 1. Source-defined scope

B2C marketplace; seller onboarding; catalogue; variants; cart; HPay checkout; cashback; recommendations; reverse logistics; reviews; seller dashboard.

## 2. Purpose

Marketplace module.

## 3. Architectural boundary

- This module owns the business state defined below.
- Other domains must not write directly into its private persistence layer.
- Cross-domain interaction uses typed application contracts or domain events.
- Shared universal objects must not be duplicated without a documented bounded-context reason.
- Primary platform dependency: Shared identity, tenant, audit, notifications and governance.

## 4. Master data / entities

- `Seller`
- `Listing`
- `Product`
- `Variant`
- `Cart`
- `CartItem`
- `Order`
- `OrderItem`
- `Review`
- `Return`
- `Cashback`
- `SellerPayout`

### Field-level rule

The uploaded sources do not define every database field for every module. Cursor must derive final fields from the canonical Prisma schema and actual workflow requirements. Where the source is silent, mark the requirement `TBD`; do not invent a regulatory or business rule.

## 5. Core workflows

### 5.1 Onboard seller

```text
Trigger
  ↓
Authentication / tenant / permission
  ↓
Input validation
  ↓
Read module master data
  ↓
Apply domain rules
  ↓
AI decision if applicable
  ↓
Neural Governance
  ↓
Human approval if required
  ↓
Transactional write
  ↓
Domain event
  ↓
Audit / notification
```

### 5.2 Create listing

```text
Trigger
  ↓
Authentication / tenant / permission
  ↓
Input validation
  ↓
Read module master data
  ↓
Apply domain rules
  ↓
AI decision if applicable
  ↓
Neural Governance
  ↓
Human approval if required
  ↓
Transactional write
  ↓
Domain event
  ↓
Audit / notification
```

### 5.3 Add to cart

```text
Trigger
  ↓
Authentication / tenant / permission
  ↓
Input validation
  ↓
Read module master data
  ↓
Apply domain rules
  ↓
AI decision if applicable
  ↓
Neural Governance
  ↓
Human approval if required
  ↓
Transactional write
  ↓
Domain event
  ↓
Audit / notification
```

### 5.4 Checkout

```text
Trigger
  ↓
Authentication / tenant / permission
  ↓
Input validation
  ↓
Read module master data
  ↓
Apply domain rules
  ↓
AI decision if applicable
  ↓
Neural Governance
  ↓
Human approval if required
  ↓
Transactional write
  ↓
Domain event
  ↓
Audit / notification
```

### 5.5 Fulfil order

```text
Trigger
  ↓
Authentication / tenant / permission
  ↓
Input validation
  ↓
Read module master data
  ↓
Apply domain rules
  ↓
AI decision if applicable
  ↓
Neural Governance
  ↓
Human approval if required
  ↓
Transactional write
  ↓
Domain event
  ↓
Audit / notification
```

### 5.6 Review

```text
Trigger
  ↓
Authentication / tenant / permission
  ↓
Input validation
  ↓
Read module master data
  ↓
Apply domain rules
  ↓
AI decision if applicable
  ↓
Neural Governance
  ↓
Human approval if required
  ↓
Transactional write
  ↓
Domain event
  ↓
Audit / notification
```

### 5.7 Return

```text
Trigger
  ↓
Authentication / tenant / permission
  ↓
Input validation
  ↓
Read module master data
  ↓
Apply domain rules
  ↓
AI decision if applicable
  ↓
Neural Governance
  ↓
Human approval if required
  ↓
Transactional write
  ↓
Domain event
  ↓
Audit / notification
```

## 6. Inbound events / triggers

- `seller.approved`
- `checkout.completed`
- `order.created`

## 7. Outbound events

- `order.confirmed`
- `payment.requested`
- `seller.payout.requested`
- `return.created`

## 8. API contract

The sources do not provide a complete endpoint list for this module. Cursor must define typed resource/action endpoints from the workflows rather than generating blind CRUD.

Suggested resource families:

```text
/<module>
/<module>/:id
/<module>/:id/actions/*
```

Every mutation must enforce:

- Authentication
- Authorisation
- Tenant context
- Schema validation
- Idempotency where retry can duplicate an action
- Governance where applicable
- Audit ID
- Structured error envelope

## 9. AI / Intelligence

- Recommendations
- seller scoring

AI must not directly mutate database state.

```text
AI
→ structured intent/tool
→ domain validation
→ governance
→ transaction
→ audit
```

## 10. Neural Governance

- Kyc/Kyb
- Consumer Protection
- Security

Governed mutation:

```text
Request
→ Legal
→ Budget
→ Contract
→ Security
→ Compliance
→ Execute / Block / Escalate
```

Exact thresholds are `UNKNOWN/TBD` unless explicitly defined by the source.

## 11. Human approval

Approval is explicit where policy, threshold, legal/compliance requirements or insufficient AI confidence require it.

Do not manufacture approval steps merely for appearance.

## 12. Permissions

Minimum capability classes:

- Read
- Create
- Update
- Approve
- Execute
- Export
- Admin

Exact role matrix is `TBD` and must come from the tenant/RBAC model.

## 13. UI architecture

Recommended workspace:

```text
/os/{slug}
```

Mature module screens:

- Overview
- Master Data / Records
- Create / Edit
- Detail
- Workflow / Approval
- Reports
- AI
- Audit / Security

The UI must show actual data/state. No fake KPIs, fake records or fake completion.

## 14. Notifications

- Material workflow success
- Approval request
- Exception/block
- Due/expiry reminder where applicable
- Provider failure where applicable

## 15. Audit

Record:

- actor
- tenant
- timestamp
- action
- object/type/id
- material before/after
- correlation ID
- governance decision
- AI model/version when AI influenced the action

## 16. Failure / recovery

- External failure must never create false success.
- Retries must be idempotent.
- Long-running work requires explicit status.
- Financial operations require reconciliation.
- Blocked governance actions remain auditable.
- Recovery/backfill procedures are required for event-driven workflows.

## 17. Reporting / KPIs

At minimum:

- volume
- completion/conversion
- exception rate
- SLA where applicable
- financial impact where applicable
- AI quality where applicable

Exact KPI formulas are `TBD` unless source-defined.

## 18. Security / compliance

- Tenant isolation
- Least privilege
- Sensitive-field protection
- Auditability
- Data retention by jurisdiction
- Provider credential isolation
- No secrets in frontend/source/logs

## 19. Acceptance criteria

- [ ] Domain model is explicit.
- [ ] Prisma migration exists.
- [ ] Typed API contract exists.
- [ ] Real workflow works end-to-end.
- [ ] Server-side permissions work.
- [ ] Audit exists.
- [ ] Governance exists for governed writes.
- [ ] No fake KPI/data.
- [ ] Critical unit/integration/workflow tests pass.
- [ ] Failure states are tested.
- [ ] Documentation matches implementation.

## 20. Source notes

Primary source:
`Harvics_Master_Blueprint.pdf`

Cross-reference:
`HARVICS_SUPREME_MASTER_PLAN.html`

Production normalisation:
`harvics_production_blueprint.pdf`

Current implementation truth:
`Harvics-OS-Board-Briefing.html`

HPay-specific detail where applicable:
`HPay™ V1 — Product & Engineering Specification.pdf`

### Additional source-defined detail

Supreme plan specifies cashback in Harvicoins, AI recommendations, reverse logistics, seller dashboards and Circle referral commission.
