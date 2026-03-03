/**
 * INTELLIGENCE FEEDBACK LOOP ARCHITECTURE
 * 
 * Purpose: Post-facto learning and accuracy adjustment.
 * Constraint: READ-ONLY for Intelligence Core (updates weights/history, not active decisions).
 * NO EXECUTION LOGIC.
 */

// --- DELIVERABLE 1: FEEDBACK DATA OBJECTS ---

export interface FeedbackSignal {
  feedbackId: string;
  originalTraceId: string; // Links back to the Intelligence Context
  decisionId: string; // Links back to the Decision Output
  timestamp: string;
  sourceTier: TierLevel;
  outcome: OutcomeReport;
}

export type TierLevel = 'Tier-1 (Execution)' | 'Tier-2 (Logistics)' | 'Tier-3 (Finance)';

export interface OutcomeReport {
  success: boolean;
  actualMargin?: number; // vs Target Margin
  fulfillmentDelayDays?: number; // vs Expected
  qualityIssues?: string[]; // vs QA Score
  supplierPerformance?: {
    responsiveness: number; // 0-5
    complianceAdherence: boolean;
  };
  // Exception data for Tier-4 / Governance
  exceptionType?: 'DISPUTE' | 'OVERRIDE' | 'ANOMALY';
  severity?: 'LOW' | 'MED' | 'HIGH';
  // Financial specifics
  chargeback?: boolean;
}

// --- DELIVERABLE 3: WHAT INTELLIGENCE UPDATES ---

export interface IntelligenceLearningUpdate {
  target: 'SupplierProfile' | 'MarketEngine' | 'RiskModel';
  entityId?: string; // e.g., Supplier ID
  adjustment: {
    metric: string; // e.g., 'performanceRating', 'riskScore'
    delta: number; // e.g., -5, +2
    newConfidenceScore: number;
  };
}

// --- DELIVERABLE 4: WHAT FEEDBACK CANNOT CHANGE ---
// STRICT IMMUTABILITY RULES:
// 1. Feedback CANNOT alter the original Decision Output (History is immutable).
// 2. Feedback CANNOT trigger a "Re-Do" or "Compensation" workflow automatically.
// 3. Feedback CANNOT change hard constraints (e.g., Legal Regulations, Sanctions).

// --- DELIVERABLE 2: REPORTING TIERS ---

/*
 * REPORTING HIERARCHY:
 * 
 * 1. ProcurementService (Tier-1) -> Reports: Supplier Responsiveness, Quote Variance
 * 2. LogisticsService (Tier-2)   -> Reports: Delivery Delays, Customs Holds
 * 3. FinanceService (Tier-3)     -> Reports: Payment Failures, Cashflow Impact
 * 4. QualityService (Tier-2)     -> Reports: Inspection Failures, Returns
 */
