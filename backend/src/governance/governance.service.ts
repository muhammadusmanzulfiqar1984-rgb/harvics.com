import { GovernanceAuthority, GovernanceEvent, GovernanceLogEntry } from './governance.types';
import { IntelligenceNode } from '../services/intelligenceNode'; // Assuming we'll call back

export class GovernanceService {
  private static authorities: Map<string, GovernanceAuthority> = new Map();
  private static eventLog: GovernanceLogEntry[] = [];

  // Seed some authorities
  static {
    this.authorities.set('AUTH-001', {
      authority_id: 'AUTH-001',
      authority_type: 'COMPLIANCE_OFFICER',
      jurisdiction: 'GLOBAL',
      powers: ['VETO', 'AUDIT'],
      escalation_level: 2
    });
    this.authorities.set('AUTH-002', {
      authority_id: 'AUTH-002',
      authority_type: 'BOARD_COMMITTEE',
      jurisdiction: 'GLOBAL',
      powers: ['POLICY_OVERRIDE', 'FORCE_BLOCK'],
      escalation_level: 5
    });
  }

  // --- 1. RECEIVE FLAG (INT -> GOV) ---
  public static async receiveIntelligenceFlag(flag: { contextId: string; reason: string; severity: string }): Promise<void> {
    console.log(`[Tier-4 Governance] Received Intelligence Flag for ${flag.contextId}: ${flag.reason} [${flag.severity}]`);
    // In a real system, this would notify a human dashboard
    // For now, we just log it
    this.autoReview(flag);
  }

  // Simulation of human review process
  private static async autoReview(flag: { contextId: string; reason: string; severity: string }): Promise<void> {
    // Mock logic: If severity is HIGH, Board Committee blocks it.
    if (flag.severity === 'HIGH') {
      const decision: GovernanceEvent = {
        decision_context_id: flag.contextId,
        authority_id: 'AUTH-002', // Board Committee
        override_type: 'FORCE_BLOCK',
        justification: `Automated safety block due to HIGH severity flag: ${flag.reason}`,
        evidence_refs: ['sys-log-123'],
        scope: 'TRANSACTION',
        timestamp: new Date().toISOString()
      };
      await this.submitDecision(decision);
    }
  }

  // --- 2. SUBMIT DECISION (GOV -> INT) ---
  public static async submitDecision(event: GovernanceEvent): Promise<void> {
    console.log(`[Tier-4 Governance] Submitting Decision: ${event.override_type} by ${event.authority_id}`);
    
    // Validate Authority
    const authority = this.authorities.get(event.authority_id);
    if (!authority) {
      throw new Error('Invalid Authority ID');
    }

    // Log (Immutable Audit Log)
    const logEntry: GovernanceLogEntry = {
      eventId: `GOV-EVT-${Date.now()}`,
      event: event,
      status: 'PENDING',
      appliedAt: new Date().toISOString()
    };
    this.eventLog.push(logEntry);

    // Apply to Intelligence
    try {
      // Call Intelligence Node to apply override
      // [ROLLBACK] Governance cannot modify Intelligence decisions.
      // await IntelligenceNode.applyGovernanceOverride(event); 
      
      logEntry.status = 'APPLIED';
      console.log(`[Tier-4 Governance] Decision Logged (Read-Only Authority).`);
    } catch (error) {
      console.error(`[Tier-4 Governance] Failed to apply decision:`, error);
      logEntry.status = 'REJECTED_BY_SYSTEM';
    }
  }

  // --- 3. POLICY EXPOSURE (GOV -> T1) ---
  public static getActivePolicies(jurisdiction: string): string[] {
    // Placeholder for Policy retrieval
    return ['STRICT_KYC', 'NO_SANCTIONED_ENTITIES'];
  }
}
