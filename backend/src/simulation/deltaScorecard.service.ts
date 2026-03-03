import { OfferDraft } from '../modules/commercial/commercial.types';
import { SimulationScenario, SimulationFact, DeltaScorecard } from './simulation.types';

export class DeltaScorecardService {
  
  public static evaluate(draft: OfferDraft, facts: SimulationFact[], scenario: SimulationScenario): DeltaScorecard {
    console.log(`[DeltaScorecard] Evaluating ${facts.length} facts against draft ${draft.artifact_id}`);

    const deltas: DeltaScorecard['deltas'] = [];
    let overallStatus: 'PASS' | 'WARN' | 'FAIL' = 'PASS';

    // 1. EVALUATE LOGISTICS
    const delayFact = facts.find(f => f.metric === 'delayDays');
    if (delayFact) {
      const delay = Number(delayFact.value);
      const expectedDelay = 0; // Strict expectation
      
      let severity: 'GREEN' | 'AMBER' | 'RED' = 'GREEN';
      if (delay > 0) severity = 'AMBER';
      if (delay > 2) severity = 'RED';

      deltas.push({
        category: 'TIME',
        expected: expectedDelay,
        actual: delay,
        delta: delay - expectedDelay,
        severity
      });

      if (severity === 'RED') {
        overallStatus = 'FAIL';
      } else if (severity === 'AMBER' && overallStatus !== ('FAIL' as string)) {
        overallStatus = 'WARN';
      }
    }

    // 2. EVALUATE FINANCE
    const chargebackFact = facts.find(f => f.metric === 'chargeback');
    if (chargebackFact) {
      const isChargeback = Boolean(chargebackFact.value);
      
      if (isChargeback) {
        deltas.push({
          category: 'RISK',
          expected: false,
          actual: true,
          delta: 'CHARGEBACK_EVENT',
          severity: 'RED'
        });
        overallStatus = 'FAIL';
      }
    }

    const settlementFact = facts.find(f => f.metric === 'settlementDays');
    if (settlementFact) {
      const days = Number(settlementFact.value);
      const expected = 1; // T+1 standard
      
      let severity: 'GREEN' | 'AMBER' | 'RED' = 'GREEN';
      if (days > 2) severity = 'AMBER';
      if (days > 4) severity = 'RED';

      deltas.push({
        category: 'COST', // Cost of capital / cashflow
        expected: expected,
        actual: days,
        delta: days - expected,
        severity
      });
      
      if (severity === 'RED') {
        overallStatus = 'FAIL';
      } else if (severity === 'AMBER' && overallStatus !== ('FAIL' as string)) {
        overallStatus = 'WARN';
      }
    }

    return {
      scorecardId: `SC-${Date.now()}`,
      traceId: draft.trace_id,
      artifactId: draft.artifact_id,
      scenario,
      deltas,
      overallStatus,
      generatedAt: new Date().toISOString()
    };
  }
}
