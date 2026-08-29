# Harvics OS — 72-Module Catalogue (PROPOSED)

**Status:** PROPOSED ARCHITECTURE — **not** the official final module list  
**Controlled:** Product / OS owners must approve before FIN treats any name as LIVE  
**Source:** FIN Master KB V2 Part Q  
**Related:** FIN-012 · FIN_V3_ROADMAP.md §A

FIN rule: do **not** invent modules beyond this draft; do **not** claim this is the official 72 until published as controlled.

Architecture groups (12 domains × ~6 modules = 72):

---

## 1. Identity & Access (6)
| # | Module | Purpose (one line) |
|---|--------|--------------------|
| 01 | Identity | Core identity records for people and entities |
| 02 | User Management | Create/manage user accounts |
| 03 | Organization Management | Companies, orgs, hierarchies |
| 04 | Roles & Permissions | RBAC / access control |
| 05 | Authentication | Sign-in, sessions, MFA policies |
| 06 | Security | Security controls, threat monitoring hooks |

## 2. CRM & Commercial (6)
| # | Module | Purpose |
|---|--------|---------|
| 07 | CRM | Customer relationship system of record |
| 08 | Lead Management | Capture, score, and progress leads |
| 09 | Sales | Pipeline and sales operations |
| 10 | Customer Management | Customer 360 / lifecycle |
| 11 | Account Management | Key accounts and stewardship |
| 12 | Business Development | Partner and BD opportunity tracking |

## 3. Trade (6)
| # | Module | Purpose |
|---|--------|---------|
| 13 | Global Trade | Cross-border trade operations |
| 14 | Sourcing | Requirement → supplier discovery |
| 15 | RFQ | Request for quotation workflows |
| 16 | Quotation | Quote creation and comparison |
| 17 | Procurement | Purchase / buy-side execution |
| 18 | Contracts | Commercial contract records |

## 4. Supplier & Buyer (6)
| # | Module | Purpose |
|---|--------|---------|
| 19 | Supplier Management | Supplier master data |
| 20 | Supplier Verification | Vetting / verification workflows |
| 21 | Buyer Management | Buyer master data |
| 22 | Buyer Intelligence | Buyer insights and ICP signals |
| 23 | Distributor Management | Distributor network management |
| 24 | Partner Management | Strategic / channel partners |

## 5. Supply Chain (6)
| # | Module | Purpose |
|---|--------|---------|
| 25 | Supply Chain | End-to-end SC orchestration |
| 26 | Inventory | Stock and inventory visibility |
| 27 | Order Management | Orders lifecycle |
| 28 | Logistics | Freight and logistics coordination |
| 29 | Shipment Tracking | Tracking when system-enabled |
| 30 | Warehouse | Warehouse / WMS-oriented workflows |

## 6. Finance (6)
| # | Module | Purpose |
|---|--------|---------|
| 31 | Finance | Core financial workflows |
| 32 | Billing | Invoicing and billing |
| 33 | Payments | Payment initiation / status |
| 34 | Settlement | Settlement and reconciliation |
| 35 | HPay | Embedded payments / HPay integration |
| 36 | Financial Intelligence | Finance analytics and insights |

## 7. Compliance (6)
| # | Module | Purpose |
|---|--------|---------|
| 37 | VAT | VAT-related records and rules |
| 38 | Hvatify | Hvatify VAT/tax technology integration |
| 39 | Compliance | Policy and compliance workflows |
| 40 | Trade Documentation | Trade docs (e.g. commercial docs) |
| 41 | Regulatory Intelligence | Regulatory monitoring support |
| 42 | Audit | Audit trails and audit support |

## 8. People (6)
| # | Module | Purpose |
|---|--------|---------|
| 43 | HR | Core HR platform |
| 44 | Recruitment | Hiring pipelines |
| 45 | Employee Management | Employee records |
| 46 | Payroll | Payroll workflows (partner-dependent) |
| 47 | Attendance | Attendance / time |
| 48 | Workforce Intelligence | People analytics |

## 9. Data & AI (6)
| # | Module | Purpose |
|---|--------|---------|
| 49 | Data Ocean | Unified ecosystem data layer |
| 50 | AI Gateway | AI service routing / governance |
| 51 | Harvey AI | Harvey intelligence assistant layer |
| 52 | AI Analytics | Model-driven analytics |
| 53 | Real-Time Reporting | Live / near-real-time reports |
| 54 | Predictive Intelligence | Forecasting / predictive insights |

## 10. Geographic Intelligence (6)
| # | Module | Purpose |
|---|--------|---------|
| 55 | Geo Engine | Geographic hierarchy and mapping |
| 56 | Market Intelligence | Market-level insights |
| 57 | Localization | Locale / content localization |
| 58 | Multi-language | Language support layer |
| 59 | Regional Intelligence | Region desks / regional insights |
| 60 | Global Expansion | Expansion planning support |

## 11. Engagement & Events (6)
| # | Module | Purpose |
|---|--------|---------|
| 61 | Harvics Event | Event platform core |
| 62 | Expo Management | Expo / fair operations |
| 63 | Digital Booths | Virtual / digital booths |
| 64 | Networking | Participant networking |
| 65 | B2B Matchmaking | Buyer–seller matching |
| 66 | Harvics Universe | Fun-Commerce / community layer |

## 12. Platform Intelligence (6)
| # | Module | Purpose |
|---|--------|---------|
| 67 | API & Integrations | External and internal integrations |
| 68 | Workflow Automation | Automations and orchestrations |
| 69 | Notifications | Alerts and messaging |
| 70 | Document Intelligence | Document extract / classify |
| 71 | Search & Discovery | Enterprise search |
| 72 | Executive Intelligence | Leadership dashboards / command views |

---

## Per-module template (for V3-A fill-in)

When promoting a module to official:

```
Module ID:
Module name:
Purpose:
Users:
Features:
Inputs:
Outputs:
AI functionality:
Data generated:
Integrations:
Dependencies:
FIN FAQ:
Truth Status: LIVE | BETA | LAUNCHING | DEVELOPMENT | PLANNED | CONCEPT | PARTNER-DEPENDENT
```

**Default Truth Status for all rows above until approved:** CONCEPT / DEVELOPMENT
