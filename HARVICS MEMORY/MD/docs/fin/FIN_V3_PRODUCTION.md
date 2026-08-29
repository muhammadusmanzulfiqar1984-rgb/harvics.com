# HARVICS FIN — PRODUCTION KNOWLEDGE BASE (load into Intercom)

**Version:** 3.0 Production  
**Synced to:** www.harvics.com (EN paths; substitute locale from `site_locale`)  
**Source master:** `FIN_V3_MASTER.md`  
**Upload rule:** One Help Center article per **PROD-XXX** block below.

### Article template (every article)

| Field | Required |
|-------|----------|
| Article ID | PROD-XXX |
| Title | |
| Customer question | |
| Short answer | |
| Detailed answer | |
| Keywords | |
| Related questions | PROD IDs |
| CTA | |
| URL | |
| Product | |
| Truth status | |
| Escalation rule | |
| CRM fields to capture | |

### Shared defaults

**Contacts:** info@harvics.com · support@harvics.com · sourcing@harvics.com · partnerships@harvics.com · +44 7405 527427  
**Directory:** https://www.harvics.com/en/contact  
**RFQ:** https://www.harvics.com/en/harvictrade/rfq  
**Don't know:** *I don't have confirmed information on that yet, and I don't want to give you inaccurate information. I can help connect you with the appropriate Harvics team.*

---

## PROD-001 — What is Harvics?

- **Customer question:** What is Harvics?
- **Short answer:** Harvics is building an AI-driven global commerce ecosystem that connects businesses, buyers, suppliers, products, trade workflows, supply chains, data, technology, and digital business infrastructure.
- **Detailed answer:** Harvics Global Ventures (Private) Limited develops an operating environment for global commerce beyond a conventional marketplace—so businesses can discover opportunities, source products, manage trade workflows, connect supply chains, access intelligence, and use AI-driven technology. Positioning: *We do not simply list products. We build systems that help businesses trade, connect, operate, and grow.*
- **Keywords:** Harvics, company, about, global commerce, ecosystem
- **Related:** PROD-002, PROD-003, PROD-033
- **CTA:** Explore the site or tell FIN what you need (buy, sell, distribute, partner, tech).
- **URL:** https://www.harvics.com/en · https://www.harvics.com/en/about
- **Product:** Harvics (company)
- **Truth status:** LIVE
- **Escalation:** None for overview
- **CRM fields:** intent=general · page_path · site_locale

---

## PROD-002 — Is Harvics a marketplace?

- **Customer question:** Is Harvics a marketplace?
- **Short answer:** Harvics may provide marketplace and commerce functionality, but its vision goes beyond a traditional marketplace.
- **Detailed answer:** Traditional marketplaces primarily connect buyers and sellers through listings. Harvics aims to connect the commercial lifecycle: Discover → Source → RFQ → Verify → Negotiate → Trade → Finance → Move → Comply → Deliver → Analyze → Repeat. HarvicTrade is the B2B marketplace surface within that wider vision.
- **Keywords:** marketplace, listing, operating layer, HarvicTrade
- **Related:** PROD-001, PROD-020, PROD-032
- **CTA:** Browse HarvicTrade or submit an RFQ.
- **URL:** https://www.harvics.com/en/harvictrade
- **Product:** HarvicTrade / company positioning
- **Truth status:** LIVE
- **Escalation:** None
- **CRM fields:** intent=general

---

## PROD-003 — What does Harvics do?

- **Customer question:** What does Harvics do?
- **Short answer:** Harvics operates across global trade, sourcing, RFQs, distribution, supply-chain intelligence, business/AI technology, FMCG, and partnership pathways—availability varies by product and market.
- **Detailed answer:** Ecosystem areas include import/export, B2B sourcing, buyer–supplier connections, RFQ workflows, supplier relationships, distribution, supply-chain intelligence, HR/VAT/event technology concepts, digital commerce, FMCG, payment infrastructure concepts, and strategic partnerships. Always apply Truth Status per product.
- **Keywords:** services, offerings, ecosystem
- **Related:** PROD-001, PROD-020, PROD-041
- **CTA:** Ask which area matters; deep-link.
- **URL:** https://www.harvics.com/en
- **Product:** Harvics (company)
- **Truth status:** LIVE (company); products vary
- **Escalation:** Formal capability statements for tenders → human
- **CRM fields:** intent · industry interest

---

## PROD-004 — Who can use Harvics?

- **Customer question:** Who is Harvics for?
- **Short answer:** Manufacturers, suppliers, exporters, importers, buyers, distributors, retailers, wholesalers, enterprises, SMEs, logistics, technology providers, financial institutions, event organizers, and strategic partners.
- **Detailed answer:** FIN detects role, then runs the matching qualification flow (buyer/supplier/distributor/enterprise/partner).
- **Keywords:** audience, who, customers, partners
- **Related:** PROD-021, PROD-024, PROD-031, PROD-110
- **CTA:** “Are you looking to buy, supply, distribute, or partner?”
- **URL:** https://www.harvics.com/en/contact
- **Product:** Harvics
- **Truth status:** LIVE
- **Escalation:** P1 strategic → human after capture
- **CRM fields:** intent · role · company · country

---

## PROD-005 — What makes Harvics different?

- **Customer question:** What makes Harvics different?
- **Short answer:** Harvics aims to connect sourcing, trade, supply chains, data, and operations instead of leaving businesses in disconnected tools.
- **Detailed answer:** Core line: we do not simply list products—we build systems that help businesses trade, connect, operate, and grow.
- **Keywords:** differentiation, integrated, vs marketplace
- **Related:** PROD-001, PROD-010, PROD-002
- **CTA:** Offer Trade vs OS deep-dive.
- **URL:** https://www.harvics.com/en/about
- **Product:** Harvics
- **Truth status:** LIVE (positioning)
- **Escalation:** None
- **CRM fields:** intent=general

---

## PROD-010 — What is Harvics OS?

- **Customer question:** What is Harvics OS?
- **Short answer:** Harvics OS (Harvics Global OS) is the central digital operating layer of the Harvics ecosystem.
- **Detailed answer:** Designed to connect business operations, global trade, procurement, sourcing, supply chains, finance, HR, compliance, data, AI, and business intelligence. Conceptual stack: Digital Channels → CRM → Harvics OS → Data Ocean → Harvey AI. Example reply (§30): use Short + one detail + offer enterprise follow-up.
- **Keywords:** Harvics OS, Global OS, operating system
- **Related:** PROD-011, PROD-012, PROD-013, PROD-014
- **CTA:** Enterprise interest → technology@harvics.com or /en/contact
- **URL:** https://www.harvics.com/en/contact (enterprise routing)
- **Product:** Harvics OS
- **Truth status:** DEVELOPMENT
- **Escalation:** Enterprise OS / RFP → Priority 1 human
- **CRM fields:** intent=enterprise_tech · company · industry · requirement · platform=harvics_os · timeline · size

---

## PROD-011 — Purpose of Harvics OS

- **Customer question:** What is the purpose of Harvics OS?
- **Short answer:** Help businesses connect operational data, manage workflows, improve visibility, automate processes, monitor performance, report in real time, and use AI-driven intelligence across trade and supply chain.
- **Detailed answer:** Distinguish vision from LIVE modules. Do not claim a visitor’s org already runs OS.
- **Keywords:** purpose, benefits, visibility, automation
- **Related:** PROD-010, PROD-012
- **CTA:** Which function do you want connected?
- **URL:** https://www.harvics.com/en/contact
- **Product:** Harvics OS
- **Truth status:** DEVELOPMENT
- **Escalation:** RFP → human
- **CRM fields:** intent=enterprise_tech · requirement

---

## PROD-012 — 72 Harvics OS modules

- **Customer question:** What are the 72 Harvics OS modules?
- **Short answer:** Harvics OS is designed around 72 interconnected AI-driven modules across identity, CRM, trade, suppliers/buyers, supply chain, finance, compliance, people, data/AI, geographic intelligence, events, and platform intelligence.
- **Detailed answer:** Working proposed architecture exists for trainers (`FIN_72_MODULES_PROPOSED.md`). FIN must **not invent** a full public list of 72 names as confirmed fact until the official technical specification is finalized. Offer high-level domains only; escalate for official catalogue.
- **Keywords:** 72 modules, architecture, modules list
- **Related:** PROD-010, PROD-013
- **CTA:** Connect with specialist for official module overview.
- **URL:** https://www.harvics.com/en/contact
- **Product:** Harvics OS
- **Truth status:** CONCEPT (catalogue controlled)
- **Escalation:** Always for full module list / due diligence
- **CRM fields:** intent=enterprise_tech · notes=module_catalogue_request

---

## PROD-013 — What is Data Ocean?

- **Customer question:** What is Harvics Data Ocean?
- **Short answer:** The central data and intelligence layer designed to connect information across the Harvics ecosystem.
- **Detailed answer:** Intended to support data integration, real-time reporting, BI, AI analytics, predictive intelligence, supply-chain intelligence, executive dashboards, and cross-platform insights.
- **Keywords:** Data Ocean, data layer, analytics
- **Related:** PROD-010, PROD-014
- **CTA:** technology@harvics.com
- **URL:** https://www.harvics.com/en/contact
- **Product:** Data Ocean
- **Truth status:** CONCEPT
- **Escalation:** Security / data residency questionnaires → human
- **CRM fields:** intent=enterprise_tech · platform=data_ocean

---

## PROD-014 — What is Harvey AI?

- **Customer question:** What is Harvey AI?
- **Short answer:** Harvey is Harvics' AI intelligence ecosystem for analysis, automation, interaction, BI, reporting, recommendations, and workflow automation.
- **Detailed answer:** FIN is one customer-facing interface within that wider architecture. Do not claim every Harvey capability is LIVE in Intercom chat.
- **Keywords:** Harvey, Harvey AI, intelligence
- **Related:** PROD-010, PROD-001
- **CTA:** technology@harvics.com
- **URL:** https://www.harvics.com/en/ai
- **Product:** Harvey AI
- **Truth status:** CONCEPT
- **Escalation:** Enterprise AI procurement → human
- **CRM fields:** intent=enterprise_tech · platform=harvey

---

## PROD-020 — What is Harvics Trade?

- **Customer question:** What is Harvics Trade?
- **Short answer:** The global B2B commerce and trade ecosystem connecting buyers, suppliers, products, RFQs, trade operations, logistics, compliance, and finance.
- **Detailed answer:** Public surfaces include industry verticals and HarvicTrade marketplace/RFQ flows.
- **Keywords:** Harvics Trade, B2B, commerce, sourcing
- **Related:** PROD-021, PROD-022, PROD-032
- **CTA:** Open HarvicTrade or start RFQ.
- **URL:** https://www.harvics.com/en/harvictrade
- **Product:** Harvics Trade / HarvicTrade
- **Truth status:** LIVE
- **Escalation:** None for overview
- **CRM fields:** intent · vertical

---

## PROD-021 — Can I buy / source through Harvics?

- **Customer question:** Can I buy or source products through Harvics?
- **Short answer:** Yes—Harvics is designed to help businesses discover products, source suppliers, submit requirements, and explore trade opportunities.
- **Detailed answer:** May support product sourcing, supplier discovery, RFQs, quotations, buyer–supplier connections, and trade workflows depending on product and market. Clarify personal vs wholesale vs import/export. Example (§27): for volume (e.g. 100,000 energy drinks) ask destination → specs → company/contact.
- **Keywords:** buy, source, import, wholesale
- **Related:** PROD-022, PROD-100, PROD-Q-BUYER
- **CTA:** RFQ or sourcing@harvics.com
- **URL:** https://www.harvics.com/en/harvictrade/rfq
- **Product:** Harvics Trade
- **Truth status:** LIVE
- **Escalation:** Binding quote / P1–P2 volume → human after qualify
- **CRM fields:** intent=buyer · name · company · country · product · quantity · destination · timeline · email · phone · lead_priority

---

## PROD-022 — How do I request a quotation (RFQ)?

- **Customer question:** What is an RFQ / how do I get a quote?
- **Short answer:** RFQ = Request for Quotation. Submit product, quantity, specs, destination, delivery, packaging, certifications, and commercial requirements.
- **Detailed answer:** Harvics uses the brief to structure and route the sourcing request. Never invent prices in chat.
- **Keywords:** RFQ, quotation, quote
- **Related:** PROD-021, PROD-023
- **CTA:** Submit RFQ form.
- **URL:** https://www.harvics.com/en/harvictrade/rfq
- **Product:** HarvicTrade RFQ
- **Truth status:** LIVE
- **Escalation:** Binding quotation → human
- **CRM fields:** intent=buyer · product · quantity · destination · specs · timeline · contact

---

## PROD-023 — Can Harvics find suppliers for me?

- **Customer question:** Can you find suppliers for me?
- **Short answer:** Harvics is designed to help buyers identify and connect with suitable suppliers.
- **Detailed answer:** Suitability may depend on category, country, capacity, certifications, compliance, and commercial terms. Never invent supplier identities. Never claim verification without confirmation (PROD-032).
- **Keywords:** find suppliers, matching, discovery
- **Related:** PROD-021, PROD-032
- **CTA:** Collect brief → RFQ / sourcing@
- **URL:** https://www.harvics.com/en/sourcing
- **Product:** Sourcing
- **Truth status:** LIVE
- **Escalation:** Named supplier vetting certificates → human
- **CRM fields:** intent=buyer · product · country · quantity

---

## PROD-024 — Can I become a supplier?

- **Customer question:** Can I become a Harvics supplier?
- **Short answer:** Yes—express interest with company, country, products, manufacturing/trading status, capacity, certifications, export markets, website, and contact details.
- **Detailed answer:** Onboarding/verification varies by product and market. Example (§28): rice manufacturer → ask those fields, then route.
- **Keywords:** become supplier, vendor, sell to Harvics
- **Related:** PROD-030, PROD-032, PROD-110
- **CTA:** partnerships@ · /en/harvictrade/sell
- **URL:** https://www.harvics.com/en/harvictrade/sell
- **Product:** Supplier onboarding
- **Truth status:** LIVE
- **Escalation:** Major strategic supplier → P1/P2 human
- **CRM fields:** intent=supplier · company · country · product · manufacturing_or_trading · capacity · certifications · export_markets · email · phone · website

---

## PROD-025 — Can I become a buyer?

- **Customer question:** How do I become a Harvics buyer?
- **Short answer:** Submit product requirements, quantity, destination, specifications, target price, delivery timeline, and certifications; FIN qualifies then routes.
- **Detailed answer:** Use buyer field set (§21). Prefer RFQ for structured briefs.
- **Keywords:** become buyer, importer, purchase programme
- **Related:** PROD-021, PROD-022, PROD-Q-BUYER
- **CTA:** RFQ / sourcing@ / info@
- **URL:** https://www.harvics.com/en/harvictrade/rfq
- **Product:** Harvics Trade
- **Truth status:** LIVE
- **Escalation:** Enterprise / retail chain → P1 human
- **CRM fields:** intent=buyer · (buyer field set)

---

## PROD-030 — Supplier onboarding flow

- **Customer question:** What information do you need from suppliers?
- **Short answer:** Company name, country, product categories, manufacturing or trading, capacity, certifications, export markets, website, contact details.
- **Detailed answer:** Ask one useful follow-up at a time when possible; then route to onboarding.
- **Keywords:** supplier onboarding, qualification
- **Related:** PROD-024, PROD-032
- **CTA:** partnerships@harvics.com
- **URL:** https://www.harvics.com/en/contact
- **Product:** Supplier programme
- **Truth status:** LIVE
- **Escalation:** P1/P2 → human
- **CRM fields:** intent=supplier · (supplier field set) · lead_priority

---

## PROD-031 — Become a distributor

- **Customer question:** How can I become a Harvics distributor?
- **Short answer:** Share company, country, territory, distribution network, retail/wholesale coverage, warehousing, sales channels, and product category of interest.
- **Detailed answer:** Example (§29): Saudi distribution rights → collect profile, territory coverage in KSA, network, retail channels, warehousing, products of interest → route BD (partnerships@).
- **Keywords:** distributor, distribution rights, territory
- **Related:** PROD-110, PROD-100
- **CTA:** partnerships@harvics.com
- **URL:** https://www.harvics.com/en/contact
- **Product:** Distribution
- **Truth status:** LIVE
- **Escalation:** Exclusivity / major territory → P1 human
- **CRM fields:** intent=distributor · company · country · territory · product · network · warehousing · sales_channels · email · phone · lead_priority

---

## PROD-032 — Supplier verification policy

- **Customer question:** Does Harvics verify suppliers?
- **Short answer:** Harvics aims to support structured supplier discovery and verification—but FIN must never say a supplier is verified unless the system confirms that status.
- **Detailed answer:** Hard rule: never invent audits, certificates, or “verified” badges.
- **Keywords:** verification, verified supplier, audit
- **Related:** PROD-023, PROD-024
- **CTA:** Ask for category; route verification questions to human.
- **URL:** https://www.harvics.com/en/sourcing
- **Product:** Supplier Verification
- **Truth status:** LIVE (policy)
- **Escalation:** Formal verification proof → human
- **CRM fields:** intent · notes=verification_request

---

## PROD-040 — Supply Chain Intelligence

- **Customer question:** What is Harvics Supply Chain Intelligence?
- **Short answer:** A technology vision to improve visibility across suppliers, orders, inventory, logistics, shipments, warehouses, performance, and risks—with potential AI insights.
- **Detailed answer:** Potential AI: predictive insights, risk alerts, performance analytics, real-time reporting. Do not promise live tracking unless connected (PROD-041).
- **Keywords:** supply chain, visibility, logistics AI
- **Related:** PROD-041, PROD-010
- **CTA:** Describe operational need → operations@ / contact
- **URL:** https://www.harvics.com/en/contact
- **Product:** Supply Chain Intelligence
- **Truth status:** CONCEPT
- **Escalation:** Live ops claims → human
- **CRM fields:** intent=enterprise_tech · requirement

---

## PROD-041 — Can you track my shipment?

- **Customer question:** Can Harvics track my shipment?
- **Short answer:** Only if the shipment is connected to a Harvics-enabled tracking system—FIN must check / not assume.
- **Detailed answer:** If not connected: *Harvics may support supply-chain and logistics workflows, but I don't have access to live tracking information for your shipment. Please provide your order or reference number so the relevant team can assist you.*
- **Keywords:** track, shipment, tracking number, order status
- **Related:** PROD-040
- **CTA:** Collect reference → escalate ops/support
- **URL:** https://www.harvics.com/en/contact
- **Product:** Shipment Tracking
- **Truth status:** PARTNER-DEPENDENT
- **Escalation:** Always with reference number
- **CRM fields:** intent=support · order_or_reference · email · phone · lead_priority=P4

---

## PROD-050 — What is HPay?

- **Customer question:** What is HPay?
- **Short answer:** HPay is Harvics' payment and embedded-finance infrastructure concept connecting financial workflows with the commerce ecosystem.
- **Detailed answer:** Potential: business payments, merchant transactions, trade settlement, embedded finance, cross-border commerce. Availability depends on market, regulation, licensing, banking/payment partners, and launch status.
- **Keywords:** HPay, payments, fintech, settlement
- **Related:** PROD-051, PROD-052
- **CTA:** /en/apps/hpay · finance brief via contact
- **URL:** https://www.harvics.com/en/apps/hpay
- **Product:** HPay
- **Truth status:** DEVELOPMENT (PARTNER-DEPENDENT)
- **Escalation:** Licensing / regulated products → human
- **CRM fields:** intent=enterprise_tech · platform=hpay · country · company

---

## PROD-051 — Is HPay a bank?

- **Customer question:** Is HPay a bank?
- **Short answer:** No. FIN must not describe HPay as a bank unless Harvics obtains relevant banking authorization.
- **Detailed answer:** Where services require regulated providers, they may be offered through licensed partners.
- **Keywords:** bank, banking license, regulation
- **Related:** PROD-050
- **CTA:** Route regulated questions to human Finance/Compliance
- **URL:** https://www.harvics.com/en/apps/hpay
- **Product:** HPay
- **Truth status:** DEVELOPMENT
- **Escalation:** Always
- **CRM fields:** intent · notes=licensing_question · lead_priority=P1

---

## PROD-052 — Can I open an HPay account?

- **Customer question:** Can I open an HPay account?
- **Short answer:** Account availability and specific financial services depend on product rollout, market, and regulatory requirements.
- **Detailed answer:** Example (§31): explain vision + dependency + offer to route to the appropriate team—do not promise instant account opening.
- **Keywords:** HPay account, signup, wallet
- **Related:** PROD-050, PROD-051
- **CTA:** Collect company/country/contact → escalate
- **URL:** https://www.harvics.com/en/apps/hpay
- **Product:** HPay
- **Truth status:** DEVELOPMENT
- **Escalation:** Yes
- **CRM fields:** intent · company · country · email · phone · platform=hpay

---

## PROD-060 — What is Hvatify?

- **Customer question:** What is Hvatify?
- **Short answer:** Harvics' VAT and tax technology platform to support VAT calculations, information, tax workflows, compliance support, reporting, and system integration.
- **Detailed answer:** Technology platform—not automatically a substitute for professional tax, legal, or accounting advice (PROD-061).
- **Keywords:** Hvatify, VAT, tax tech
- **Related:** PROD-061
- **CTA:** technology@ / contact
- **URL:** https://www.harvics.com/en/contact
- **Product:** Hvatify
- **Truth status:** CONCEPT
- **Escalation:** Tax advice → human
- **CRM fields:** intent=enterprise_tech · platform=hvatify · country

---

## PROD-061 — Does Hvatify replace an accountant? / Can it calculate VAT?

- **Customer question:** Can Hvatify calculate VAT? Does it replace my accountant?
- **Short answer:** Hvatify is designed to support VAT-related calculations and workflows; exact countries, rules, and features depend on implementation. It does not automatically replace professional advice.
- **Detailed answer:** Example (§32): answer capability carefully with implementation caveat.
- **Keywords:** VAT calculate, accountant, tax advice
- **Related:** PROD-060
- **CTA:** Route professional advice to human
- **URL:** https://www.harvics.com/en/contact
- **Product:** Hvatify
- **Truth status:** CONCEPT
- **Escalation:** Professional tax/legal → always
- **CRM fields:** intent · country · notes=tax_advice_request

---

## PROD-070 — What is Harvics HR?

- **Customer question:** What is Harvics HR?
- **Short answer:** An HR technology platform for employee management, recruitment, attendance, leave, HR records, workforce management, reporting, and AI-assisted HR workflows.
- **Detailed answer:** Exact features depend on version/deployment—use Truth Status.
- **Keywords:** Harvics HR, HRIS
- **Related:** PROD-010
- **CTA:** partnerships@ or technology@
- **URL:** https://www.harvics.com/en/contact
- **Product:** Harvics HR
- **Truth status:** CONCEPT
- **Escalation:** Enterprise HR RFP → human
- **CRM fields:** intent=enterprise_tech · platform=harvics_hr

---

## PROD-080 — What is Harvics Event?

- **Customer question:** What is Harvics Event?
- **Short answer:** Event and expo technology connecting organizers, exhibitors, buyers, visitors, and business participants.
- **Detailed answer:** Potential: registration, exhibitor management, digital booths, networking, B2B matchmaking, buyer–seller connections.
- **Keywords:** Harvics Event, expo, matchmaking
- **Related:** PROD-110
- **CTA:** partnerships@harvics.com
- **URL:** https://www.harvics.com/en/contact
- **Product:** Harvics Event
- **Truth status:** CONCEPT
- **Escalation:** Large expo contracts → human
- **CRM fields:** intent=partner · partnership_type=event · company · country

---

## PROD-090 — What is Harvics Universe?

- **Customer question:** What is Harvics Universe?
- **Short answer:** Broader digital ecosystem concept combining social interaction, commerce, marketplace, trading, gamification, rewards, and community—positioned as Fun-Commerce.
- **Detailed answer:** Never invent rewards balances, tokens, or live game economies.
- **Keywords:** Universe, Fun-Commerce, gamification
- **Related:** PROD-001, PROD-002
- **CTA:** partnerships@ / technology@
- **URL:** https://www.harvics.com/en
- **Product:** Harvics Universe
- **Truth status:** CONCEPT
- **Escalation:** Token/crypto claims → human
- **CRM fields:** intent · platform=universe

---

## PROD-100 — FMCG products & brands

- **Customer question:** What FMCG products / brands does Harvics offer?
- **Short answer:** Portfolio may include energy drinks, juices, flavored milk, confectionery, wafers, chocolate, chewing gum. Brands/concepts include Harvics Energy, SNAPBAR, Harvics Molten, Harvics Sweetverse, Goal.
- **Detailed answer:** Exact pricing, stock, ingredients, pack sizes, availability, and territories **only** from the official product catalogue. If unavailable: collect interest and route—never invent. Also offer broader verticals if needed (/en/fmcg and other industries).
- **Keywords:** FMCG, energy drink, SNAPBAR, Molten, Sweetverse, Goal
- **Related:** PROD-021, PROD-031, PROD-041V
- **CTA:** /en/fmcg · RFQ for volume · sourcing@
- **URL:** https://www.harvics.com/en/fmcg
- **Product:** FMCG
- **Truth status:** LIVE (categories); brands DEVELOPMENT until catalogue confirmed
- **Escalation:** Spec sheets / pricing → human + catalogue
- **CRM fields:** intent=buyer|distributor · product · quantity · country · brand_interest

---

## PROD-110 — Partnerships

- **Customer question:** How can I partner with Harvics?
- **Short answer:** Harvics welcomes manufacturers, suppliers, buyers, distributors, retailers, logistics, technology, financial institutions, strategic partners, event organizers, and investors—FIN qualifies then routes.
- **Detailed answer:** Collect partnership type, company, country, proposed value, market, contact. Apply Priority 1–3.
- **Keywords:** partnership, collaboration, investor, JV
- **Related:** PROD-024, PROD-031, PROD-Q-PARTNER
- **CTA:** partnerships@harvics.com · /en/contact
- **URL:** https://www.harvics.com/en/contact
- **Product:** Partnerships
- **Truth status:** LIVE
- **Escalation:** Investment / major strategic → P1 human
- **CRM fields:** intent=partner · partnership_type · company · country · market · proposed_value · email · phone · lead_priority

---

## PROD-120 — Contact Harvics

- **Customer question:** How do I contact Harvics?
- **Short answer:** Phone/WhatsApp +44 7405 527427 · info@harvics.com · support@harvics.com · full email directory on the contact page · typical specialist reply within 24 hours on briefs.
- **Detailed answer:** Route: sourcing@ · partnerships@ · billing@ / accounts@ · america@ / gcc@ / asia@ / apac@ · technology@ · office@ · ceo@/founder@ only when appropriate.
- **Keywords:** contact, email, phone, support
- **Related:** PROD-121, PROD-122
- **CTA:** Open contact directory.
- **URL:** https://www.harvics.com/en/contact
- **Product:** Support
- **Truth status:** LIVE
- **Escalation:** None for contact info
- **CRM fields:** intent=support|general · email · phone

---

## PROD-121 — Login / access triage

- **Customer question:** How do I log in?
- **Short answer:** Partner portals → /en/login · HarvyX → /en/harvyx or /app/sign-in · presentations (La Pres) → /en/la-pres with programme code from your Harvics contact.
- **Detailed answer:** La Pres codes ≠ company passwords. Never invent codes. Apps catalogue may be invite-gated.
- **Keywords:** login, sign in, HarvyX, portals, La Pres
- **Related:** PROD-130, PROD-122
- **CTA:** Match correct URL; support@ for lockouts
- **URL:** https://www.harvics.com/en/login · https://www.harvics.com/en/harvyx · https://www.harvics.com/en/la-pres
- **Product:** Access
- **Truth status:** LIVE
- **Escalation:** Auth failures → support@ / technology@
- **CRM fields:** intent=support · platform=login|harvyx|la_pres · lead_priority=P4

---

## PROD-122 — Escalation & priority

- **Customer question:** When will I speak to a person?
- **Short answer:** FIN escalates for binding quotes, contracts, negotiation, high-value leads, legal/tax/regulatory/licensing, refund disputes, serious complaints, security, technical incidents, confidential info, investment, and media.
- **Detailed answer:** Priority: P1 Strategic · P2 Commercial · P3 Standard · P4 Support. Use don't-know policy when unsure.
- **Keywords:** escalate, human, handoff, priority
- **Related:** PROD-120
- **CTA:** Collect contact + summary; hand off
- **URL:** https://www.harvics.com/en/contact
- **Product:** Support ops
- **Truth status:** LIVE
- **Escalation:** This article defines rules
- **CRM fields:** lead_priority · handoff_reason · email · phone · summary

---

## PROD-130 — What is HarvyX?

- **Customer question:** What is HarvyX?
- **Short answer:** HarvyX is Harvics' Growth OS for B2B lead intelligence, outreach, reply desk, and verified contact data bank.
- **Detailed answer:** Marketing /en/apps/harvyx · operators /en/harvyx · Clerk /app/sign-in.
- **Keywords:** HarvyX, Growth OS, leads, outreach
- **Related:** PROD-121, PROD-131
- **CTA:** Sign-in or product page
- **URL:** https://www.harvics.com/en/apps/harvyx · https://www.harvics.com/en/harvyx
- **Product:** HarvyX
- **Truth status:** LIVE
- **Escalation:** Account lockout → support/tech
- **CRM fields:** intent · platform=harvyx

---

## PROD-131 — What is Harvoice?

- **Customer question:** What is Harvoice?
- **Short answer:** AI voice/chat assistant for B2B operators (buyer discovery, lead capture, outreach drafting).
- **Detailed answer:** Public status BETA.
- **Keywords:** Harvoice, voice AI
- **Related:** PROD-130, PROD-014
- **CTA:** Product page
- **URL:** https://www.harvics.com/en/apps/harvoice
- **Product:** Harvoice
- **Truth status:** BETA
- **Escalation:** Incidents → technology@
- **CRM fields:** platform=harvoice

---

## PROD-132 — What is HarvicTrade?

- **Customer question:** What is HarvicTrade?
- **Short answer:** Harvics' B2B marketplace surface for products, suppliers, and RFQ workflows within the broader commerce operating layer.
- **Detailed answer:** Home, RFQ, and sell paths on the site. Catalogue scale claims are marketing—confirm via RFQ.
- **Keywords:** HarvicTrade, marketplace
- **Related:** PROD-002, PROD-020, PROD-022
- **CTA:** Browse or RFQ
- **URL:** https://www.harvics.com/en/harvictrade
- **Product:** HarvicTrade
- **Truth status:** LIVE
- **Escalation:** Listing disputes → human
- **CRM fields:** intent · vertical

---

## PROD-140 — Tabraiz Town

- **Customer question:** What is Tabraiz Town?
- **Short answer:** Flagship mixed-use commercial project in Rahim Yar Khan, Pakistan (30 Kanal), marketed via Harvics Real Estate.
- **Detailed answer:** Confirm brochure before legal/payment commitments. Project contact info@tabraiztown.com. Do not invent unit prices.
- **Keywords:** Tabraiz, real estate, Rahim Yar Khan
- **Related:** PROD-041V
- **CTA:** Project page
- **URL:** https://www.harvics.com/en/projects/tabraiz-town
- **Product:** Tabraiz Town
- **Truth status:** LIVE (project marketing)
- **Escalation:** Pricing/contracts → project team
- **CRM fields:** intent · product=tabraiz · country · contact

---

## PROD-041V — Ten industry verticals

- **Customer question:** What industries / verticals does Harvics cover?
- **Short answer:** Textiles, FMCG, Commodities, Industrial, Minerals, Oil & Gas, Real Estate, Sourcing, Finance & HPay, AI & Technology.
- **Detailed answer:** Deep-link `/en/{textiles|fmcg|commodities|industrial|minerals|oil-gas|real-estate|sourcing|finance|ai}`.
- **Keywords:** verticals, industries, sectors
- **Related:** PROD-100, PROD-020
- **CTA:** Ask which vertical
- **URL:** https://www.harvics.com/en/fmcg (example)
- **Product:** Verticals
- **Truth status:** LIVE
- **Escalation:** None
- **CRM fields:** vertical · intent

---

## PROD-Q-BUYER — Buyer qualification script

- **Customer question:** (Internal) How should FIN qualify a buyer?
- **Short answer:** Collect name, company, country, product, quantity, destination, timeline, contact—then CTA RFQ/sourcing and set priority.
- **Detailed answer:** Example: “I need 100,000 energy drinks.” → destination → packaging/specs → company + contact → route. One useful follow-up at a time.
- **Keywords:** qualify buyer, lead flow
- **Related:** PROD-021, PROD-022, PROD-122
- **CTA:** RFQ
- **URL:** https://www.harvics.com/en/harvictrade/rfq
- **Product:** Lead qualification
- **Truth status:** LIVE
- **Escalation:** P1/P2 after capture
- **CRM fields:** full buyer set · lead_priority

---

## PROD-Q-SUPPLIER — Supplier qualification script

- **Customer question:** (Internal) How should FIN qualify a supplier?
- **Short answer:** Company, country, product, manufacturing/trading, capacity, certifications, export markets, contact.
- **Detailed answer:** Example rice supplier script (§28).
- **Keywords:** qualify supplier
- **Related:** PROD-024, PROD-030
- **CTA:** partnerships@ / sell
- **URL:** https://www.harvics.com/en/harvictrade/sell
- **Product:** Lead qualification
- **Truth status:** LIVE
- **Escalation:** Major supplier → human
- **CRM fields:** full supplier set · lead_priority

---

## PROD-Q-DISTRIBUTOR — Distributor qualification script

- **Customer question:** (Internal) How should FIN qualify a distributor?
- **Short answer:** Company, country, territory, product, network, warehousing, sales channels.
- **Detailed answer:** Example Saudi rights script (§29).
- **Keywords:** qualify distributor
- **Related:** PROD-031
- **CTA:** partnerships@
- **URL:** https://www.harvics.com/en/contact
- **Product:** Lead qualification
- **Truth status:** LIVE
- **Escalation:** Exclusivity → P1
- **CRM fields:** full distributor set · lead_priority

---

## PROD-Q-ENTERPRISE — Enterprise qualification script

- **Customer question:** (Internal) How should FIN qualify enterprise tech interest?
- **Short answer:** Company, industry, size, requirement, platform of interest, implementation scope, timeline.
- **Detailed answer:** Platforms may include Harvics OS, Data Ocean, Harvey, HPay, Hvatify, HR, Event.
- **Keywords:** qualify enterprise
- **Related:** PROD-010, PROD-050
- **CTA:** technology@ / human
- **URL:** https://www.harvics.com/en/contact
- **Product:** Lead qualification
- **Truth status:** LIVE
- **Escalation:** Usually P1
- **CRM fields:** full enterprise set · lead_priority=P1

---

## PROD-Q-PARTNER — Strategic partner qualification script

- **Customer question:** (Internal) How should FIN qualify a strategic partner?
- **Short answer:** Company, country, partnership type, proposed value, market, contact—then escalate.
- **Detailed answer:** Investors and financial institutions are typically Priority 1.
- **Keywords:** qualify partner, investor
- **Related:** PROD-110
- **CTA:** partnerships@ + human
- **URL:** https://www.harvics.com/en/contact
- **Product:** Lead qualification
- **Truth status:** LIVE
- **Escalation:** Always for P1 strategic
- **CRM fields:** full partner set · lead_priority=P1

---

## PROD-T-000 — Truth status & never invent

- **Customer question:** Is this available now? / Why won't you give me a price?
- **Short answer:** FIN labels offerings LIVE / BETA / LAUNCHING / DEVELOPMENT / PLANNED / CONCEPT / PARTNER-DEPENDENT and never invents prices, stock, dates, identities, licenses, or legal conclusions.
- **Detailed answer:** Use don't-know policy when uncertain. Never claim licenses/certifications/authorizations unless confirmed.
- **Keywords:** truth status, availability, policy
- **Related:** PROD-122
- **CTA:** Offer human handoff when needed
- **URL:** https://www.harvics.com/en/contact
- **Product:** FIN policy
- **Truth status:** LIVE
- **Escalation:** Status disputes → product owner
- **CRM fields:** notes

---

### Production index

| ID | Title |
|----|--------|
| PROD-001 | What is Harvics? |
| PROD-002 | Marketplace? |
| PROD-003 | What does Harvics do? |
| PROD-004 | Who can use Harvics? |
| PROD-005 | Differentiation |
| PROD-010–014 | OS · purpose · 72 modules · Data Ocean · Harvey |
| PROD-020–025 | Trade · buy/source · RFQ · find suppliers · become supplier/buyer |
| PROD-030–032 | Supplier flow · distributor · verification |
| PROD-040–041 | Supply chain · shipment tracking |
| PROD-050–052 | HPay · bank? · open account |
| PROD-060–061 | Hvatify |
| PROD-070 | Harvics HR |
| PROD-080 | Harvics Event |
| PROD-090 | Harvics Universe |
| PROD-100 | FMCG & brands |
| PROD-110 | Partnerships |
| PROD-120–122 | Contact · login · escalation |
| PROD-130–132 | HarvyX · Harvoice · HarvicTrade |
| PROD-140 | Tabraiz Town |
| PROD-041V | Ten verticals |
| PROD-Q-* | Qualification scripts |
| PROD-T-000 | Truth / never invent |

**Next production expansions:** official FMCG catalogue rows · official 72-module articles (after sign-off) · remaining vertical deep-dives · locale-specific CTAs.
