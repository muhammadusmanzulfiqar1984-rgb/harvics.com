import { CountryProfile } from './country-rules';

// --- TIER-0 INTELLIGENCE LAYER DATA OBJECTS ---
// Inputs matching strictly to the Master Architecture Flowchart

// 1. SALES CRM
// [BASELINE LOCK] SALES CRM STATUS: NOT IMPLEMENTED
// Any runtime dependency must be satisfied with a PLACEHOLDER / NULL object.
export const STUB_SALES_SIGNAL: SalesSignal = {
  opportunityId: 'STUB-000',
  demandType: 'Spot',
  productCategory: 'Unknown',
  volume: 0,
  targetPrice: 0,
  urgency: 'Low',
  jurisdiction: 'UK',
  useCase: 'BULK_TRADE'
};

export interface SalesSignal {
  opportunityId: string;
  demandType: 'Spot' | 'Contract' | 'Tender';
  productCategory: string;
  volume: number;
  targetPrice: number;
  urgency: 'High' | 'Medium' | 'Low';
  jurisdiction: string; // e.g. 'US', 'UK', 'EU'
  useCase: 'SAMPLES' | 'BULK_TRADE' | 'INTERNAL_SETTLEMENT' | 'FEES';
}

// --- TIER-4 GOVERNANCE OVERRIDE POLICY ---
// Manual overrides for critical financial/risk decisions
export interface GovernanceOverridePolicy {
  policyId: string;
  target_rail: string; // e.g. 'DIGITAL_ASSET'
  override_action: 'FORCE_BLOCK' | 'FORCE_APPROVE' | 'REQUIRE_DUAL_SIG';
  justification: string;
  authorized_by: string; // User ID
  expires_at: string;
}

// 2. BUYER SYSTEMS (Direct ERP Integration)
export interface BuyerSignal {
  buyerId: string;
  erpIntegrationStatus: 'Active' | 'Manual';
  creditScore: number; // 0-100
  paymentHistory: {
    averageDelayDays: number;
    defaultRisk: number; // 0-100
  };
  inventoryLevels?: number; // Real-time stock
}

// 3. PROCUREMENT CRM
export interface ProcurementSignal {
  rfqId: string;
  sourcingStatus: 'Open' | 'Shortlisted' | 'Negotiating';
  negotiatedMargin: number;
  contractReadiness: number; // 0-100
}

// 4. SUPPLIER SYSTEMS (Direct Portal/ERP)
export interface SupplierSignal {
  supplierId: string;
  liveCapacity: number;
  productionQueueDays: number;
  qaPassRate: number; // %
  sustainabilityRating: number;
}

// 5. OPERATIONS & QA
export interface OperationsSignal {
  logisticsRouteStatus: 'Open' | 'Congested' | 'Blocked';
  warehouseCapacity: number;
  inspectionAvailability: boolean;
  freightCostIndex: number; // Normalized 0-100
}

// 6. FINANCE & RISK
export interface FinanceSignal {
  cashflowStatus: 'Positive' | 'Neutral' | 'Negative';
  currencyExposure: number; // Amount in risk
  creditLimitAvailable: number;
  sanctionsMatch: boolean;
}

// 7. LOCALISATION & JURISDICTION
export interface LocalisationSignal {
  countryCode: string;
  tradeBarrierScore: number; // 0-100 (High is bad)
  complianceComplexity: 'High' | 'Medium' | 'Low';
  legalReviewRequired: boolean;
  requiredCertifications: string[];
}

// 8. EXTERNAL DATA (Markets, Policy, Banks, Customs)
export interface ExternalSignal {
  marketPriceIndex: number;
  commodityTrend: 'Bullish' | 'Bearish' | 'Neutral';
  weatherRisk: number; // 0-100
  geopoliticalAlerts: string[];
  bankLiquidityStatus: 'High' | 'Low';
}

// --- SCORING & DECISION OBJECTS ---

export interface IntelligenceScore {
  commercialViability: number; // 0-100
  operationalFeasibility: number; // 0-100
  financialHealth: number; // 0-100
  riskIndex: number; // 0-100 (High is bad)
  complianceConfidence: number; // 0-100
}

/**
 * STEP 2: LOCKED INTELLIGENCE OUTPUT CONTRACT
 * 
 * DELIVERABLE 1: Enumerate all Tier-0 Intelligence outputs
 * DELIVERABLE 2: Define their schema (fields, constraints)
 * DELIVERABLE 3: Define allowed consumers
 * DELIVERABLE 4: Define prohibited decisions
 */

// 1. Approved Supplier Set
export interface ApprovedSupplierSet {
  supplierIds: string[];
  ranking: 'Price-Focus' | 'Quality-Focus' | 'Balanced';
  restrictionReason?: string; // If set is empty
}

// 2. Price & Margin Corridor
export interface PriceMarginCorridor {
  recommendedMinPrice: number;
  recommendedMaxPrice: number;
  targetMarginPercent: number;
  currency: string;
  validityPeriodHours: number;
}

// 3. Permitted Payment Structures
export interface PermittedPaymentStructures {
  allowedMethods: Array<'LC' | 'TT' | 'Escrow' | 'Credit'>;
  maxCreditExposure: number;
  requiredDownPaymentPercent: number;
  currencyConstraints: string[];
}

// 4. Compliance Clearance
export interface ComplianceClearance {
  isCleared: boolean;
  clearanceLevel: 'Full' | 'Provisional' | 'Restricted' | 'Denied';
  requiredCertificates: string[];
  embargoCheckPassed: boolean;
}

// DELIVERABLE 3: Allowed Consumers
// ONLY these Tier-1 services may consume Tier-0 outputs.
export type AllowedConsumer = 
  | 'ProcurementService' 
  | 'SalesService' 
  | 'FinanceService' 
  | 'RiskDashboard';

// DELIVERABLE 4: Prohibited Decisions (Documentation Contract)
// Intelligence Layer is STRICTLY FORBIDDEN from making these decisions:
export type ProhibitedDecisions = 
  | 'EXECUTE_PAYMENT' 
  | 'SIGN_CONTRACT' 
  | 'SEND_PO_TO_SUPPLIER' 
  | 'MODIFY_INVENTORY' 
  | 'CHANGE_USER_PERMISSIONS';

// --- INTELLIGENCE OUTPUT ENVELOPE (Standard Header) ---
export interface IntelligenceOutputEnvelope {
  output_id: string;
  output_type: string; // e.g., 'TIER0_DECISION'
  version: string; // e.g., '1.0'
  issued_at_utc: string;
  expires_at_utc: string;
  jurisdiction_code: string;
  currency_code: string;
  language_code: string;
  confidence_band: 'LOW' | 'MED' | 'HIGH';
  source_trace_id: string;
  decision_context_id: string;
}

export interface DecisionGateOutput {
  meta: IntelligenceOutputEnvelope;
  gate: 'GO' | 'NO-GO' | 'CONDITIONAL';
  reason_code: 'CRITICAL_RISK' | 'FINANCIAL_HEALTH' | 'SANCTIONS' | 'COMMERCIAL_VIABILITY' | 'COMPLIANCE_FAIL' | 'NO_SUPPLIERS' | 'CLEARED';
  blocking_factors: string[];
  conditions_required: string[];
  next_allowed_actions: string[];
}

export interface ApprovedEntitySetOutput {
  meta: IntelligenceOutputEnvelope;
  entity_type: 'SUPPLIER' | 'ROUTE' | 'BANK' | 'INSPECTOR' | 'LOGISTICS';
  approved_ids: string[];
  rejected_ids: string[];
  rationale_by_id: Record<string, string>;
  selection_policy: 'BEST_VALUE' | 'LOWEST_RISK' | 'FASTEST' | 'BLENDED';
}

export interface RiskComplianceOutput {
  meta: IntelligenceOutputEnvelope;
  compliance_status: 'CLEAR' | 'CONDITIONAL' | 'BLOCKED';
  risk_rating: 'LOW' | 'MED' | 'HIGH' | 'CRITICAL';
  sanctions_flags: string[];
  required_certifications: string[];
  mandatory_controls: string[]; // inspection, lab, audit
  blocked_reasons: string[];
}

export interface RailConstraintProfile {
  allowed_countries?: string[];
  max_transaction_value?: number;
  allowed_use?: string[];
  prohibited_for?: string[];
  chargeback_risk?: 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH';
  settlement_delay_days?: number;
  kyc_required?: boolean;
  
  // Digital Asset Specifics
  status?: 'ACTIVE' | 'CONDITIONAL' | 'SUSPENDED';
  allowed_assets?: string[];
  compliance_requirements?: string[];
  governance_approval_required?: boolean;
}

export interface PaymentStructureOutput {
  meta: IntelligenceOutputEnvelope;
  allowed_instruments: string[]; 
  allowed_payment_rails: string[];
  rail_constraints: Record<string, RailConstraintProfile>;
  max_credit_days: number;
  exposure_limit: number;
  settlement_currency: string;
  receiving_entity_type: string;
  compliance_mode: string;
}

export interface LocalisationBindingOutput {
  meta: IntelligenceOutputEnvelope;
  governing_law: string;
  dispute_forum: string;
  mandatory_documents: string[]; // COO/COA/BL/HealthCert/etc.
  labeling_requirements: string[];
  tax_duty_rules_refs: string[];
  customs_rules_refs: string[];
  banking_norms_refs: string[];
}

export interface DecisionOutput {
  // D1: Primary Decision Gate (Enveloped)
  primaryGate: DecisionGateOutput;
  
  // D2: Approved Entities (Suppliers)
  supplierEntities: ApprovedEntitySetOutput;
  
  // D5: Risk & Compliance
  riskCompliance: RiskComplianceOutput;

  // D4: Payment Structure
  paymentStructure: PaymentStructureOutput;

  // D6: Localisation Binding
  localisationBinding: LocalisationBindingOutput;

  // D3: Pricing (Legacy Contract until Diagrammed)
  pricingCorridor: PriceMarginCorridor;
}

// --- MASTER INTELLIGENCE CONTEXT ---
export interface IntelligenceContext {
  traceId: string;
  sales: SalesSignal;
  buyer: BuyerSignal;
  procurement: ProcurementSignal;
  suppliers: SupplierSignal[]; // Multiple potential suppliers
  operations: OperationsSignal;
  finance: FinanceSignal;
  localisation: LocalisationSignal;
  external: ExternalSignal;
}
