# FIN V3 Roadmap — Make FIN commercially powerful

**Prerequisite:** V2 Master (`FIN_V2_MASTER.md`) loaded into Intercom as FIN-XXX articles + Guidance from V1.  
**Goal:** FIN becomes more than a chatbot — a qualification and routing layer into CRM → Harvics OS → Data Ocean → Harvey AI.

```
Visitor
  ↓
FIN
  ↓
Intent Detection
  ↓
Lead Qualification
  ↓
CRM
  ↓
Harvics OS
  ↓
Data Ocean
  ↓
Harvey AI
```

---

## A. Full 72-module Harvics OS Knowledge Base

**Input draft:** `FIN_72_MODULES_PROPOSED.md` (72 named modules, proposed).

For **each** official module, produce:

| Field | Description |
|-------|-------------|
| Module name | Canonical name |
| Purpose | One paragraph |
| Users | Roles who use it |
| Features | Bullet list |
| Inputs | Data/events in |
| Outputs | Data/events out |
| AI functionality | What Harvey/AI does |
| Data generated | What lands in Data Ocean |
| Integrations | APIs / sister modules |
| Dependencies | Required modules |
| FIN FAQ | 3–5 customer Q&As |
| Status | Truth Status |

**Deliverable:** `FIN_V3_MODULES_OFFICIAL.md` (controlled) — only after product owner sign-off.

---

## B. 100+ FIN Customer Questions

Expand beyond FIN-001…110 into a mapped Q&A bank (site verticals, apps, Tabraiz, auth, FAQ, brands, Incoterms, MOQ, careers, media, etc.).

**Deliverable:** `FIN_V3_FAQ_100.md` — each row: Question → FIN-XXX or answer → CTA → Escalation → Status.

Reuse titles from legacy `FIN_V2_INDEX.md` Batches 02–03 where useful; renumber under FIN-2xx / FIN-3xx.

---

## C. 15 Lead Qualification Flows

Document exact FIN scripts for:

1. Buyer  
2. Supplier  
3. Distributor  
4. Manufacturer  
5. Exporter  
6. Importer  
7. Enterprise  
8. Technology partner  
9. Logistics partner  
10. Financial partner  
11. Event partner  
12. Investor  
13. Job seeker  
14. Customer support  
15. General inquiry  

Each flow: opening question → follow-ups → required fields → routing email/URL → CRM stage → escalation trigger.

**Deliverable:** `FIN_V3_QUALIFICATION_FLOWS.md`

---

## D. FIN Human Handoff System

Operationalize Part N into Intercom-ready rules:

- Trigger conditions  
- Data to collect before handoff  
- Inbox / team assignment  
- Visitor-facing message templates  
- SLA expectations  

**Deliverable:** `FIN_V3_HANDOFF.md`

---

## E. FIN Sales Intelligence

FIN should tag (when known):

| Signal | Examples |
|--------|----------|
| Intent | buy / sell / distribute / partner / tech / support |
| Country | delivery or HQ country |
| Industry | textiles, FMCG, minerals, … |
| Company | free text |
| Potential deal size | rough qty / AOV band if stated |
| Urgency | timeline |
| Product | category / brand |
| Next action | RFQ / email / handoff / URL |

Map to Intercom custom attributes + CRM write path (V3-G).

**Deliverable:** `FIN_V3_SALES_INTELLIGENCE.md`

---

## F. FIN Website Navigation

Canonical deep-link map so FIN always sends the right URL (locale-aware: prefer visitor `site_locale`).

Cover: home, about, contact, verticals ×10, HarvicTrade, RFQ, sell, apps (HarvyX/HPay/Harvoice), portals, login, La Pres (no codes), Tabraiz, careers, FAQ, privacy/terms.

**Deliverable:** `FIN_V3_NAV_MAP.md` (merge/upgrade `intercom-fin-content-library.md` URL map)

---

## G. FIN Data Collection → CRM → OS → Data Ocean → AI

Define structured payload FIN should capture:

```json
{
  "source": "intercom_fin",
  "intent": "buyer|supplier|distributor|partner|enterprise_tech|support|other",
  "name": "",
  "company": "",
  "country": "",
  "role": "",
  "product_or_service": "",
  "quantity_or_scale": "",
  "timeline": "",
  "email": "",
  "phone": "",
  "page_path": "",
  "site_locale": "",
  "vertical": "",
  "urgency": "",
  "notes": ""
}
```

Then pipeline: Intercom → CRM → Harvics OS → Data Ocean → Harvey AI.

**Deliverable:** `FIN_V3_DATA_PIPELINE.md` + engineering ticket for write API.

---

## Suggested build order

1. **F** Nav map (fast, high visitor value)  
2. **C** Qualification flows (conversion)  
3. **D** Handoff rules (ops safety)  
4. **E** Sales intelligence attributes (Intercom Data)  
5. **B** Expand FAQ bank  
6. **A** Official 72-module KB (needs product owners)  
7. **G** CRM/OS pipeline (engineering)

---

## Done when

- [ ] V2 FIN-XXX articles live in Intercom Content  
- [ ] Guidance = V1 master prompt + V2 Parts O/P/N  
- [ ] At least flows 1–5 (buyer/supplier/distributor/partner/support) live in Fin Procedures/Guidance  
- [ ] Custom attributes for intent/country/vertical wired from site widget  
- [ ] Official 72 list signed off (or FIN continues to refuse inventing modules)
