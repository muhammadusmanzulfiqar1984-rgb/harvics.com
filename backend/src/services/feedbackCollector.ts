import { FeedbackSignal, IntelligenceLearningUpdate } from '../types/feedback.types';
import { IntelligenceNode } from './intelligenceNode';
import { DeltaScorecard } from '../simulation/simulation.types';

// --- TIER-SPECIFIC EVENT TYPES ---

// TIER-1: Commercial Outcome
export interface CommercialOutcomeEvent {
  decision_context_id: string;
  artifact_id: string;
  outcome: 'ACCEPTED' | 'REJECTED' | 'EXPIRED' | 'GENERATED'; // Added GENERATED for initial creation
  reason_code: string;
  jurisdiction: string;
  timestamp_utc: string;
}

// TIER-2: Operational Outcome
export interface OperationalOutcomeEvent {
  decision_context_id: string;
  supplier_id: string;
  otif_pct: number; // On-Time In-Full %
  qa_pass_pct: number;
  delay_days: number;
  timestamp_utc: string;
}

// TIER-3: Financial Outcome
export interface FinancialOutcomeEvent {
  decision_context_id: string;
  rail_used: string;
  settlement_days: number;
  chargeback: boolean;
  timestamp_utc: string;
}

// TIER-4 (Future): Exception Event
export interface ExceptionEvent {
  decision_context_id: string;
  exception_type: 'DISPUTE' | 'OVERRIDE' | 'ANOMALY';
  severity: 'LOW' | 'MED' | 'HIGH';
  authority: 'TIER-4 (future)';
  timestamp_utc: string;
}

// --- FEEDBACK COLLECTOR SERVICE ---

export class FeedbackCollectorService {

  /**
   * READ-ONLY COLLECTOR
   * Accepts events from Tiers 1-3 and converts them into standardized FeedbackSignals for Tier-0.
   */
  
  public static async collectTier1Event(event: CommercialOutcomeEvent): Promise<void> {
    console.log(`[FeedbackCollector] Received Tier-1 Event: ${event.outcome} for ${event.artifact_id}`);
    
    const signal: FeedbackSignal = {
      feedbackId: `FB-T1-${Date.now()}`,
      originalTraceId: event.decision_context_id,
      decisionId: event.decision_context_id,
      timestamp: event.timestamp_utc,
      sourceTier: 'Tier-1 (Execution)',
      outcome: {
        success: ['ACCEPTED', 'GENERATED'].includes(event.outcome),
        // Map detailed outcome
      }
    };

    await this.dispatchToIntelligence(signal);
  }

  // --- NEW: INGEST DELTA SCORECARD (Replacing direct Tier-2/3 calls) ---
  public static async collectDeltaScorecard(scorecard: DeltaScorecard): Promise<void> {
    console.log(`[FeedbackCollector] Received Delta Scorecard: ${scorecard.scorecardId} [${scorecard.overallStatus}]`);

    // 1. Decompose Scorecard into Feedback Signals (or pass mostly raw if Intelligence can handle it)
    // We will create a signal that summarizes the scorecard
    
    const signal: FeedbackSignal = {
      feedbackId: `FB-SC-${Date.now()}`,
      originalTraceId: scorecard.traceId,
      decisionId: scorecard.traceId, // Assuming traceId maps to decisionId
      timestamp: scorecard.generatedAt,
      sourceTier: 'Tier-1 (Execution)', // Scorecard aggregates multiple tiers, but is part of the orchestration feedback loop
      outcome: {
        success: scorecard.overallStatus !== 'FAIL',
        qualityIssues: scorecard.deltas.filter(d => d.severity !== 'GREEN').map(d => `${d.category}: ${d.delta}`),
        // Map specific metrics if available
        fulfillmentDelayDays: Number(scorecard.deltas.find(d => d.category === 'TIME')?.actual || 0),
        supplierPerformance: {
            responsiveness: scorecard.overallStatus === 'FAIL' ? 1 : 4, // Simplified
            complianceAdherence: scorecard.overallStatus !== 'FAIL'
        }
      }
    };

    // Also explicitly map Chargeback if present in deltas
    const riskDelta = scorecard.deltas.find(d => d.category === 'RISK');
    if (riskDelta && riskDelta.delta === 'CHARGEBACK_EVENT') {
        signal.outcome.chargeback = true;
    }

    await this.dispatchToIntelligence(signal);
  }

  public static async collectTier2Outcome(event: OperationalOutcomeEvent): Promise<void> {
    console.log(`[FeedbackCollector] Received Tier-2 Outcome for Supplier: ${event.supplier_id}`);
    
    const signal: FeedbackSignal = {
        feedbackId: `FB-T2-${Date.now()}`,
        originalTraceId: event.decision_context_id,
        decisionId: event.decision_context_id,
        timestamp: event.timestamp_utc,
        sourceTier: 'Tier-2 (Logistics)',
        outcome: {
            success: event.delay_days === 0 && event.qa_pass_pct > 90,
            fulfillmentDelayDays: event.delay_days,
            supplierPerformance: {
                responsiveness: event.delay_days === 0 ? 5 : 2,
                complianceAdherence: event.qa_pass_pct > 95
            }
        }
    };
    await this.dispatchToIntelligence(signal);
  }

  public static async collectTier3Settlement(event: FinancialOutcomeEvent): Promise<void> {
    console.log(`[FeedbackCollector] Received Tier-3 Settlement. Rail: ${event.rail_used}`);
    
    const signal: FeedbackSignal = {
        feedbackId: `FB-T3-${Date.now()}`,
        originalTraceId: event.decision_context_id,
        decisionId: event.decision_context_id,
        timestamp: event.timestamp_utc,
        sourceTier: 'Tier-3 (Finance)',
        outcome: {
            success: !event.chargeback,
            fulfillmentDelayDays: event.settlement_days,
            chargeback: event.chargeback
        }
    };
    await this.dispatchToIntelligence(signal);
  }

  public static async collectExceptionEvent(event: ExceptionEvent): Promise<void> {
    console.log(`[FeedbackCollector] Received Exception Event: ${event.exception_type} (${event.severity})`);

    const signal: FeedbackSignal = {
      feedbackId: `FB-T4-${Date.now()}`,
      originalTraceId: event.decision_context_id,
      decisionId: event.decision_context_id,
      timestamp: event.timestamp_utc,
      sourceTier: 'Tier-1 (Execution)', // Exceptions can come from any tier, defaulting to Execution context or we need a new Tier enum
      outcome: {
        success: false, // Exceptions usually imply something went wrong or needed override
        exceptionType: event.exception_type,
        severity: event.severity
      }
    };
    // Note: sourceTier might need adjustment if ExceptionEvent comes from specific tiers, but for now assuming it's a general signal.
    
    await this.dispatchToIntelligence(signal);
  }

  private static async dispatchToIntelligence(signal: FeedbackSignal): Promise<void> {
    // Send "Curated Signals" to Tier-0
    await IntelligenceNode.ingestFeedback(signal);
  }

  // --- FEEDBACK MAPPER (The "Brain" of the Collector) ---
  // Maps Signals --> Engine Updates
  public static mapToEngineUpdates(signal: FeedbackSignal): IntelligenceLearningUpdate[] {
    const updates: IntelligenceLearningUpdate[] = [];

    // 1. Supplier Reliability Index
    if (signal.outcome.supplierPerformance) {
      updates.push({
        target: 'SupplierProfile',
        entityId: 'SUP-XXX', // In real system, derived from trace ID lookup
        adjustment: {
          metric: 'responsiveness',
          delta: signal.outcome.supplierPerformance.responsiveness > 4 ? 2 : -2,
          newConfidenceScore: 85 // Placeholder logic
        }
      });
    }

    // 2. Market Demand Weights (Triggered by Commercial Acceptance/Rejection)
    if (signal.sourceTier === 'Tier-1 (Execution)' && !signal.outcome.exceptionType) {
        updates.push({
            target: 'MarketEngine',
            adjustment: {
                metric: 'demandWeight',
                delta: signal.outcome.success ? 0.05 : -0.05,
                newConfidenceScore: 90
            }
        });
    }

    // 3. Cost Confidence Bands (Triggered by Financial Settlement delay/success)
    if (signal.sourceTier === 'Tier-3 (Finance)') {
        updates.push({
            target: 'MarketEngine', // Cost is often part of Market/Pricing engine
            adjustment: {
                metric: 'costConfidence',
                delta: (signal.outcome.fulfillmentDelayDays || 0) > 2 ? -5 : 1,
                newConfidenceScore: 80
            }
        });
    }

    // 4. Risk Scores (Triggered by Exceptions or High Risk Outcomes)
    if (signal.outcome.exceptionType || signal.outcome.chargeback) {
        updates.push({
            target: 'RiskModel',
            adjustment: {
                metric: 'riskScore',
                delta: signal.outcome.severity === 'HIGH' || signal.outcome.chargeback ? 20 : 5, // Increase risk
                newConfidenceScore: 60 // Confidence drops
            }
        });
    }

    // 5. Payment Rail Confidence (Triggered by Financial Success)
    if (signal.sourceTier === 'Tier-3 (Finance)') {
      updates.push({
        target: 'RiskModel',
        adjustment: {
          metric: 'paymentRailConfidence',
          delta: signal.outcome.success ? 1 : -3,
          newConfidenceScore: 75
        }
      });
    }

    return updates;
  }
}
