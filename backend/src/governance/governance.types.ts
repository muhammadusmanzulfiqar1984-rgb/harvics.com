export type AuthorityType = 
  | 'BOARD_COMMITTEE' 
  | 'COMPLIANCE_OFFICER' 
  | 'GOVERNMENT_OBSERVER' 
  | 'REGULATOR_INTERFACE';

export interface GovernanceAuthority {
  authority_id: string;
  authority_type: AuthorityType;
  jurisdiction: string;
  powers: string[]; // e.g., ['VETO', 'AUDIT', 'POLICY_OVERRIDE']
  escalation_level: number; // 1-5
}

export interface GovernanceEvent {
  decision_context_id: string;
  authority_id: string;
  override_type: 'FORCE_APPROVE' | 'FORCE_BLOCK' | 'REQUIRE_DUAL_SIG' | 'POLICY_UPDATE';
  justification: string;
  evidence_refs: string[]; // URLs or document IDs
  scope: 'TRANSACTION' | 'ENTITY' | 'MARKET' | 'GLOBAL';
  expiry?: string; // ISO Date
  timestamp: string;
}

export interface GovernanceLogEntry {
  eventId: string;
  event: GovernanceEvent;
  status: 'PENDING' | 'APPLIED' | 'REJECTED_BY_SYSTEM'; // System might reject if violates immutable laws
  appliedAt: string;
}
