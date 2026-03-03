# FINAL INTERNAL STATE CAPTURE — HARVICS OS + CRM

**Date:** 2026-02-04
**Scope:** Full System Audit (Backend)
**Status:** FACT EXTRACTION ONLY

---

## SECTION A — MODULE INVENTORY

### 1. Harvics OS Core
*   `backend/src/middleware/`: Auth, Locale, AI Protocol Enforcement. **[Active]**
*   `backend/src/services/globalDataInflow.ts`: Global data ingestion. **[Active]**
*   `backend/src/services/discoveryNode.ts`: Network discovery. **[Active]**
*   `backend/src/modules/system/`: System status controller. **[Active]**
*   `backend/src/modules/auth/`: User authentication and scoping. **[Active]**

### 2. Tier-0 Intelligence
*   `backend/src/services/intelligenceNode.ts`: "The Brain" - Central decision engine. **[Active]**
*   `backend/src/services/harvicsAlphaEngine.ts`: Alpha engine implementation. **[Active]**
*   `backend/src/services/engines/countryRuleEngine.ts`: Country-specific rules. **[Active]**
*   `backend/src/services/marketScraper.ts`: Market data ingestion. **[Stub/Partial]**
*   `backend/src/modules/ai/`: AI Controller/Client. **[Active]**

### 3. Tier-1 Commercial
*   `backend/src/modules/commercial/commercial.orchestrator.ts`: Orchestrates draft generation and simulation. **[Active]**
*   `backend/src/services/productSynthesizer.ts`: Product draft generation logic. **[Active]**

### 4. Tier-2 Ops (Logistics/Supply Chain)
*   `backend/src/modules/gps/`: GPS tracking service. **[Active]**
*   `backend/src/modules/navigation/`: Route navigation. **[Active]**
*   `backend/src/modules/satellite/`: Satellite imagery service. **[Active]**
*   `backend/src/modules/territory/`: Territory management. **[Active]**
*   `backend/src/modules/fmcgGraph/`: Supply chain graph service. **[Active]**

### 5. Tier-3 Finance
*   `backend/src/modules/trade/`: Trade finance controller. **[Active]**
*   `backend/src/services/loyaltyV2.ts`: Loyalty program engine. **[Active]**

### 6. Governance (Tier-4)
*   `backend/src/governance/governance.service.ts`: Read-only audit log and policy provider. **[Active - Read Only]**

### 7. Procurement CRM
*   `backend/src/modules/procurement/`: Supplier onboarding and RFQ management. **[Active - In-Memory]**

### 8. Sales CRM
*   `backend/src/modules/sales/`: Opportunity management and data collection. **[Active - In-Memory]**

### 9. Enterprise CRM (Aggregator)
*   `backend/src/modules/domains/`: Cross-domain data aggregation (Country/Executive views). **[Active - Stub Data]**

### 10. Legacy / Duplicate Systems
*   `backend/src/modules/localisation/countries.service.ts`: Internal static country list. **[Duplicate]**
*   `backend/src/services/countryService.ts`: External API (RestCountries) fetcher. **[Duplicate]**
*   `backend/src/modules/localisation/productGenerator.service.ts`: Likely overlaps with `productSynthesizer.ts`. **[Redundant]**
*   `backend/src/modules/dataOcean/`: Likely overlaps with `globalDataInflow.ts`. **[Redundant]**

---

## SECTION B — DATA OBJECTS & STORES

| Entity | Location / Store | Ownership | Persistence |
| :--- | :--- | :--- | :--- |
| **Supplier** | `ProcurementService.suppliers` | Procurement CRM | In-Memory `Map` |
| **RFQ / Quote** | `ProcurementService.rfqs` | Procurement CRM | In-Memory `Map` |
| **Opportunity** | `SalesCRMService.opportunities` | Sales CRM | In-Memory `Map` |
| **Customer** | `SalesCRMService.customers` | Sales CRM | In-Memory `Map` |
| **DecisionOutput** | `IntelligenceNode.decisionStore` | Tier-0 Intelligence | In-Memory `Map` |
| **Contract/Offer Draft** | `CommercialSession.artifacts` | Tier-1 Orchestrator | Transient (Session) |
| **Governance Policies** | `GovernanceService.getActivePolicies` | Governance | Hardcoded Code |
| **Country Data (Internal)** | `CountriesService.countriesStore` | Localisation Module | In-Memory Array |
| **Country Data (External)** | `CountryService.cachedCountries` | External Service | In-Memory Cache |

---

## SECTION C — REAL DATA FLOW (END-TO-END)

1.  **Ingestion (Gap):**
    *   Sales/Procurement CRMs collect data into local In-Memory Maps.
    *   **CRITICAL GAP:** No automatic trigger sends this data to `IntelligenceNode`. `SalesCRMService` has a `getIntelligenceSignal` method, but it is passive (must be polled). `ProcurementService` has commented-out `IntelligenceNode.ingestData` calls.

2.  **Intelligence Processing:**
    *   `IntelligenceNode.processTransaction(ctx)` is the entry point.
    *   It executes engines (Market, Supplier, Cost, Risk, Localisation).
    *   It produces `DecisionOutput` (GO/NO-GO).
    *   It emits high-risk flags to `GovernanceService` (Fire-and-Forget).

3.  **Orchestration (Tier-1):**
    *   `CommercialOrchestrator.initiateCommercialSession(contextId)` is called manually/via API.
    *   It **PULLS** the decision from `IntelligenceNode` (Read-Only).
    *   It **PULLS** policies from `GovernanceService` (Read-Only).
    *   It generates Artifacts (Offers, Contracts).

4.  **Simulation & Feedback (Loop):**
    *   `CommercialOrchestrator` triggers `ShadowSimulators.runSimulation()` (Logistics + Finance).
    *   Simulators generate `SimulationFact`s (Virtual Data).
    *   `DeltaScorecardService` compares Artifact vs. Facts.
    *   `FeedbackCollectorService` ingests Scorecard.
    *   `FeedbackCollector` dispatches signal to `IntelligenceNode`.

---

## SECTION D — LAYER VIOLATIONS

1.  **Decision Logic in CRM (Procurement):**
    *   `ProcurementService.calculateInitialRisk`: Contains hardcoded risk logic (`highRiskCountries = ['KP', 'IR'...]`). This bypasses the Tier-0 Risk Engine.
2.  **Decision Logic in CRM (Sales):**
    *   `SalesCRMService.calculateUrgency`: Contains logic to determine urgency based on stage/customer segment. Should be an Intelligence inference.
3.  **Synchronous Simulation Dependency:**
    *   `CommercialOrchestrator` awaits `ShadowSimulators`. While architecturally "Shadow", the implementation blocks the session return until simulation completes.
4.  **In-Memory "Databases":**
    *   All core services (`Procurement`, `Sales`, `Intelligence`, `Localisation`) use in-memory Maps/Arrays. **Any server restart results in 100% data loss.**

---

## SECTION E — DUPLICATION / CONFLICT MAP

1.  **Country Data Source of Truth:**
    *   **Conflict:** `modules/localisation/countries.service.ts` (Internal List) vs `services/countryService.ts` (External API).
    *   **Risk:** Different parts of the system may see different country data/codes.
2.  **Product Generation:**
    *   **Overlap:** `modules/localisation/productGenerator.service.ts` vs `services/productSynthesizer.ts`. Both seem to generate product data.
3.  **Data Ingestion:**
    *   **Overlap:** `modules/dataOcean` vs `services/globalDataInflow.ts`. Unclear strict boundary.

---

## SECTION F — COLLAPSE RISKS

1.  **Data Persistence Failure:** The entire system runs on in-memory structures. A production deployment will lose all state on restart/crash.
2.  **Disconnected CRMs:** Sales and Procurement CRMs are data islands. They do not automatically feed Intelligence, meaning the "Brain" is starved of real-time operational data unless manually fed.
3.  **Hardcoded Logic Bypass:** The hardcoded risk rules in `ProcurementService` mean a supplier could be flagged "Safe" locally even if the Intelligence Engine would flag them "High Risk", creating a compliance liability.
4.  **Inconsistent Geography:** Dual country services could lead to one module validating "USA" and another "US", causing logic breaks in jurisdiction checks.
5.  **Mock Dependency:** High reliance on "Stub" data and "Mock Providers" in `external/` means the system may behave unpredictably when switched to real live data feeds.
6.  **Orchestrator Bottleneck:** The `CommercialOrchestrator` doing heavy lifting (Artifact Composition + Simulation Trigger) in one flow could timeout under load.
7.  **Missing Error Handling:** Many "fire-and-forget" promises (Governance emission, Feedback dispatch) catch errors only to `console.error` without retry mechanisms, leading to silent data loss.
8.  **Type Divergence:** `STUB_SALES_SIGNAL` in types vs actual CRM data shapes are loosely coupled; drift is likely.
9.  **No Authentication on Internal Services:** Internal class methods assume trust; if exposed via API without strict Middleware, any service can call any other.
10. **Shadow Simulation Reality Gap:** Simulators use `Math.random()` for delays/risks. This is not a "Digital Twin" but a "Random Number Generator", providing false confidence in system resilience.

---

INTERNAL HARVICS OS & CRM STATE CAPTURE COMPLETE — AWAITING ARCHITECT DIRECTIVE.
