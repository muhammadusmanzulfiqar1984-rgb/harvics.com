# MASTER SYSTEM ARCHITECTURE – HARVICS OS (TIER-0 INTELLIGENCE)

## 1. The Core Philosophy: Intelligence Upstream, Execution Downstream

In HARVICS OS, **Tier-0 (Intelligence)** is not a passive dashboard. It is the **Active Brain**.
All other tiers (Commercial, Operations, Finance) are **Limbs** that execute the Brain's decisions.

```mermaid
graph TD
    subgraph TIER_0_INTELLIGENCE_LAYER ["🧠 TIER-0: INTELLIGENCE LAYER (The Brain)"]
        direction TB
        DE[Decision Engine]
        LE[Localisation Engine]
        RE[Risk Engine]
        PE[Profit Sentinel]
    end

    subgraph DATA_INPUTS ["DATA STREAMS (Sensors)"]
        direction LR
        PCRM[Procurement CRM] --> TIER_0_INTELLIGENCE_LAYER
        SCRM[Sales CRM] --> TIER_0_INTELLIGENCE_LAYER
        FIN[Finance & Banks] --> TIER_0_INTELLIGENCE_LAYER
        OPS[Logistics & Ops] --> TIER_0_INTELLIGENCE_LAYER
        EXT[External Markets] --> TIER_0_INTELLIGENCE_LAYER
    end

    subgraph EXECUTION_OUTPUTS ["EXECUTION COMMANDS (Limbs)"]
        direction LR
        TIER_0_INTELLIGENCE_LAYER --> |"Auto-Configured Workflow"| W1[Procurement Workflows]
        TIER_0_INTELLIGENCE_LAYER --> |"Pricing & Credit Limits"| W2[Sales Workflows]
        TIER_0_INTELLIGENCE_LAYER --> |"Route & Carrier Selection"| W3[Logistics Workflows]
        TIER_0_INTELLIGENCE_LAYER --> |"Hedging & Payment Terms"| W4[Financial Workflows]
    end
```

---

## 2. Procurement CRM Architecture

The **Procurement CRM** is a dedicated module feeding the Intelligence Layer. It is NOT just a database of suppliers; it is a **Strategic Sourcing Engine**.

```mermaid
classDiagram
    class ProcurementCRM {
        +SupplierDirectory
        +RFQManager
        +CostModeler
        +NegotiationRoom
        +ComplianceVault
    }

    class Supplier {
        +id: UUID
        +score: float
        +capabilities: string[]
        +riskLevel: string
    }

    class RFQ {
        +id: UUID
        +specs: JSON
        +targetPrice: float
        +status: string
    }

    class IntelligenceFeed {
        +marketPrices: Map
        +supplierRisk: Map
        +demandForecast: Map
    }

    ProcurementCRM --> Supplier : Manages
    ProcurementCRM --> RFQ : Generates
    ProcurementCRM ..> IntelligenceFeed : Consumes
```

### Procurement Workflow: From Need to Contract

```mermaid
sequenceDiagram
    participant B as Buyer (Internal)
    participant P as Procurement CRM
    participant I as Intelligence Layer (Tier-0)
    participant S as Supplier (External)

    B->>P: Raise Requisition (Raw Materials)
    P->>I: Request Sourcing Strategy
    I->>I: Analyze Market Prices
    I->>I: Check Supplier Risk Scores
    I->>I: Apply Localisation Rules (e.g., Import Duty)
    I-->>P: Return Optimal Strategy (Target Price, Approved Suppliers)
    
    P->>S: Auto-Send RFQ (to Shortlist)
    S-->>P: Submit Quote
    
    P->>I: Validate Quote vs Cost Model
    I-->>P: "Green Light" or "Negotiate" (Margin Analysis)
    
    P->>S: Contract Award
```

---

## 3. End-to-End Workflow: The "Auto-Configured" Reality

How the **Localisation Engine** dictates the flow for a Global Trade deal (e.g., Importing Electronics to UAE).

```mermaid
flowchart TB
    START((New Deal Initiated)) --> LOC[Localisation Engine Scan]
    
    subgraph "AUTO-CONFIGURATION PHASE"
        LOC --> |"Detect Jurisdiction: UAE"| RULES[Load UAE Rules]
        RULES --> |"Compliance"| R1[Require ESMA Certification]
        RULES --> |"Finance"| R2[Currency: AED/USD, VAT: 5%]
        RULES --> |"Logistics"| R3[Port: Jebel Ali]
    end

    R1 & R2 & R3 --> CONFIG[Generate Deal Workflow]

    subgraph "EXECUTION PHASE"
        CONFIG --> STEP1[Supplier Uploads Certs]
        STEP1 --> STEP2[Finance Locks FX Rate]
        STEP2 --> STEP3[Logistics Books Container]
        STEP3 --> STEP4[Customs Clearance (Pre-filled)]
    end

    STEP4 --> FINISH((Delivery & Payment))
```
