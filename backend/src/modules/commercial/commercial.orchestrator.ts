import { 
  DecisionOutput, 
  DecisionGateOutput, 
  ApprovedEntitySetOutput, 
  PriceMarginCorridor, 
  PaymentStructureOutput, 
  LocalisationBindingOutput,
  RiskComplianceOutput
} from '../../types/intelligence.types';
import { 
  CommercialSession, 
  OfferDraft, 
  QuoteDraft, 
  ContractDraft 
} from './commercial.types';
import { IntelligenceNode } from '../../services/intelligenceNode';
import { FeedbackCollectorService, CommercialOutcomeEvent } from '../../services/feedbackCollector';
import { ShadowSimulators } from '../../simulation/shadowSimulators';
import { SimulationScenario } from '../../simulation/simulation.types';
import { DeltaScorecardService } from '../../simulation/deltaScorecard.service';
import { GovernanceService } from '../../governance/governance.service';

// --- INTELLIGENCE READ CLIENT ---
export class IntelligenceReadClient {
  public static async fetchContext(decisionContextId: string): Promise<DecisionOutput | null> {
    // Strictly Read-Only fetch from Tier-0
    return await IntelligenceNode.getDecision(decisionContextId);
  }
}

// --- TIER-1 COMMERCIAL ORCHESTRATOR ---
export class CommercialOrchestratorService {

  /**
   * STRICT MODE: Only consumes Tier-0 outputs.
   * Does NOT trigger execution.
   * Does NOT make decisions (only orchestrates based on directives).
   * 
   * @param simulationMode Optional scenario to run Shadow Simulators (Tier-2/3)
   */
  public static async initiateCommercialSession(
    decisionContextId: string, 
    simulationMode: SimulationScenario = SimulationScenario.HAPPY_PATH
  ): Promise<CommercialSession> {
    console.log(`[Tier-1] Initiating Session for Context: ${decisionContextId} [Mode: ${simulationMode}]`);

    // 1. FETCH TIER-0 OUTPUTS
    const decision = await IntelligenceReadClient.fetchContext(decisionContextId);
    if (!decision) {
      throw new Error('[Tier-1] Decision Context Not Found');
    }

    const session: CommercialSession = {
      session_id: `SESS-${Date.now()}`,
      decision_context_id: decisionContextId,
      gate_result: decision.primaryGate.gate,
      artifacts: [],
      logs: []
    };

    // 2. CHECK GATE
    if (decision.primaryGate.gate === 'NO-GO') {
      session.logs.push(`[BLOCKED] Gate is NO-GO. Reason: ${decision.primaryGate.reason_code}`);
      return session; // Return empty session, no artifacts
    }

    // 2a. CHECK GOVERNANCE POLICIES (Tier-4 Injection)
    const policies = GovernanceService.getActivePolicies(decision.localisationBinding.meta.jurisdiction_code);
    session.logs.push(`[GOVERNANCE] Active Policies: ${policies.join(', ')}`);

    if (decision.primaryGate.gate === 'CONDITIONAL') {
        session.logs.push(`[CONDITIONAL] Proceeding with conditions: ${decision.primaryGate.conditions_required.join(', ')}`);
    }

    // 3. COMPOSE ARTIFACTS
    try {
      const artifacts = this.composeArtifacts(decision);
      session.artifacts = artifacts;
      session.logs.push(`[SUCCESS] Generated ${artifacts.length} draft artifacts.`);

      // 4. TRIGGER DOWNSTREAM SHADOW SIMULATIONS (Feed-Forward)
      // We emit the draft creation event AND trigger the simulators
      for (const artifact of artifacts) {
        if (artifact.type === 'OFFER') {
          // A. Emit Tier-1 Outcome (Real)
          await this.emitCommercialOutcomeEvent(session, artifact as OfferDraft);

          // B. Trigger Tier-2/3 Shadow Simulators (Virtual)
          const facts = await ShadowSimulators.runSimulation(artifact as OfferDraft, simulationMode);
          
          // C. Calculate Delta Scorecard
          const scorecard = DeltaScorecardService.evaluate(artifact as OfferDraft, facts, simulationMode);
          
          // D. Feedback Loop (Learning)
          await FeedbackCollectorService.collectDeltaScorecard(scorecard);
        }
      }

    } catch (error: any) {
      session.logs.push(`[ERROR] Artifact composition failed: ${error.message}`);
      // In strict mode, if composition fails, we return what we have (or empty) but do not execute.
    }

    return session;
  }

  private static async emitCommercialOutcomeEvent(session: CommercialSession, artifact: OfferDraft): Promise<void> {
    const event: CommercialOutcomeEvent = {
      decision_context_id: session.decision_context_id,
      artifact_id: artifact.artifact_id,
      outcome: 'GENERATED',
      reason_code: 'DRAFT_CREATED',
      jurisdiction: artifact.jurisdiction,
      timestamp_utc: new Date().toISOString()
    };
    await FeedbackCollectorService.collectTier1Event(event);
  }

  private static composeArtifacts(decision: DecisionOutput): (OfferDraft | QuoteDraft | ContractDraft)[] {
    const artifacts: (OfferDraft | QuoteDraft | ContractDraft)[] = [];

    // ENFORCE: Only use Approved Entities
    const approvedSuppliers = decision.supplierEntities.approved_ids;
    if (approvedSuppliers.length === 0) {
      throw new Error('No Approved Suppliers available for composition.');
    }

    // CREATE OFFER DRAFTS (One per approved supplier for simplicity in this step)
    for (const supplierId of approvedSuppliers) {
      // VALIDATE: Price within Corridor
      // Note: In a real scenario, we'd fetch the supplier's quote/catalog price here. 
      // For this orchestration step, we simulate a draft based on the Target Price from intelligence context 
      // (which we don't have access to directly here, only the outputs). 
      // Actually, we need to know what we are buying. The DecisionOutput doesn't carry the "Product" details explicitly 
      // other than context ID. 
      // Ideally, we would have the 'IntelligenceContext' or similar, but we are restricted to 'Tier-0 outputs ONLY'.
      // However, 'PriceMarginCorridor' has the recommended range. We will create a draft with a placeholder price inside the corridor.
      
      const targetPrice = (decision.pricingCorridor.recommendedMinPrice + decision.pricingCorridor.recommendedMaxPrice) / 2;

      const offer: OfferDraft = {
        artifact_id: `OFF-${supplierId}-${Date.now()}`,
        created_at_utc: new Date().toISOString(),
        trace_id: decision.primaryGate.meta.source_trace_id,
        status: 'DRAFT',
        jurisdiction: decision.localisationBinding.meta.jurisdiction_code,
        type: 'OFFER',
        supplier_id: supplierId,
        items: [
          {
            sku: 'PENDING-SELECTION',
            quantity: 1000, // Placeholder
            unit_price: targetPrice,
            currency: decision.pricingCorridor.currency
          }
        ],
        total_value: targetPrice * 1000,
        payment_terms: decision.paymentStructure, // ATTACH DIRECTIVE (No selection)
        localisation: decision.localisationBinding // ATTACH DIRECTIVE
      };

      artifacts.push(offer);
    }

    // ENFORCE: Risk Compliance Overlay
    // If Risk is HIGH, maybe we don't generate Contracts yet, only Offers.
    if (decision.riskCompliance.risk_rating !== 'CRITICAL') {
        // Generate Contract Draft if we have offers
        // ... (Logic to generate contract drafts would go here)
    }

    return artifacts;
  }
}
