import { 
  DecisionGateOutput, 
  ApprovedEntitySetOutput, 
  PriceMarginCorridor, 
  RiskComplianceOutput, 
  PaymentStructureOutput, 
  LocalisationBindingOutput 
} from '../../types/intelligence.types';

export type DraftStatus = 'DRAFT' | 'PENDING_REVIEW' | 'REJECTED' | 'APPROVED';

export interface BaseArtifact {
  artifact_id: string;
  created_at_utc: string;
  trace_id: string; // Links back to Tier-0
  status: DraftStatus;
  jurisdiction: string;
}

export interface OfferDraft extends BaseArtifact {
  type: 'OFFER';
  supplier_id: string; // Must be from ApprovedEntitySet
  items: {
    sku: string;
    quantity: number;
    unit_price: number; // Must be within Corridor
    currency: string;
  }[];
  total_value: number;
  payment_terms: PaymentStructureOutput; // Attached directive
  localisation: LocalisationBindingOutput; // Attached directive
}

export interface QuoteDraft extends BaseArtifact {
  type: 'QUOTE';
  customer_id: string;
  validity_period: {
    start: string;
    end: string;
  };
  commercial_terms: {
    incoterms: string;
    pricing_model: 'FIXED' | 'TIERED';
    margin_check_passed: boolean;
  };
}

export interface ContractDraft extends BaseArtifact {
  type: 'CONTRACT';
  parties: {
    buyer_id: string;
    supplier_id: string;
  };
  clauses: string[]; // Generated from LocalisationBinding
  governing_law: string;
  payment_schedule: {
    milestone: string;
    percentage: number;
    due_date?: string;
  }[];
  risk_assessment_snapshot: RiskComplianceOutput; // Immutable record
}

export interface CommercialSession {
  session_id: string;
  decision_context_id: string;
  gate_result: 'GO' | 'NO-GO' | 'CONDITIONAL';
  artifacts: (OfferDraft | QuoteDraft | ContractDraft)[];
  logs: string[];
}
