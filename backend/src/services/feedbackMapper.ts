import { FeedbackSignal, IntelligenceLearningUpdate } from '../types/feedback.types';

export class FeedbackMapper {
  
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
