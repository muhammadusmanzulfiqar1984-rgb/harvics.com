import { OfferDraft } from '../modules/commercial/commercial.types';
import { SimulationScenario, SimulationFact } from './simulation.types';

export class LogisticsShadowSimulator {
  public static async simulate(draft: OfferDraft, scenario: SimulationScenario): Promise<SimulationFact[]> {
    console.log(`[ShadowSim] Logistics Simulation for ${draft.artifact_id} [Scenario: ${scenario}]`);

    let delayDays = 0;
    let qaPassPct = 100;
    let otifPct = 100;

    switch (scenario) {
      case SimulationScenario.HAPPY_PATH:
        delayDays = 0;
        break;
      case SimulationScenario.SUPPLIER_DELAY:
        delayDays = Math.floor(Math.random() * 5) + 3; // 3-7 days delay
        otifPct = 80;
        break;
      case SimulationScenario.COMPLIANCE_FRICTION:
        delayDays = 2; // Customs hold
        break;
      default:
        delayDays = 0;
    }

    return [
      { type: 'LOGISTICS', metric: 'delayDays', value: delayDays, timestamp: new Date().toISOString() },
      { type: 'LOGISTICS', metric: 'qaPassPct', value: qaPassPct, timestamp: new Date().toISOString() },
      { type: 'LOGISTICS', metric: 'otifPct', value: otifPct, timestamp: new Date().toISOString() }
    ];
  }
}

export class FinanceShadowSimulator {
  public static async simulate(draft: OfferDraft, scenario: SimulationScenario): Promise<SimulationFact[]> {
    console.log(`[ShadowSim] Finance Simulation for ${draft.artifact_id} [Scenario: ${scenario}]`);

    let settlementDays = 1;
    let chargeback = false;
    // Default rail if not specified in draft (though draft has payment_terms)
    // We'll extract a rail from payment_terms.allowed_payment_rails[0] or default to SWIFT
    const rail = draft.payment_terms.allowed_payment_rails.length > 0 
      ? draft.payment_terms.allowed_payment_rails[0] 
      : 'SWIFT';

    switch (scenario) {
      case SimulationScenario.HAPPY_PATH:
        settlementDays = 1;
        break;
      case SimulationScenario.PAYMENT_RAIL_STRESS:
        settlementDays = 5;
        // 20% chance of chargeback/failure
        if (Math.random() > 0.8) chargeback = true; 
        break;
      case SimulationScenario.BORDERLINE_MARGIN:
        // Finance doesn't fail, but maybe margin is tight (not captured in outcome event yet)
        settlementDays = 1;
        break;
      default:
        settlementDays = 1;
    }

    return [
      { type: 'FINANCE', metric: 'settlementDays', value: settlementDays, timestamp: new Date().toISOString() },
      { type: 'FINANCE', metric: 'chargeback', value: chargeback, timestamp: new Date().toISOString() },
      { type: 'FINANCE', metric: 'railUsed', value: rail, timestamp: new Date().toISOString() }
    ];
  }
}

export class ShadowSimulators {
  public static async runSimulation(draft: OfferDraft, scenario: SimulationScenario = SimulationScenario.HAPPY_PATH): Promise<SimulationFact[]> {
    // Run in parallel
    const [logisticsFacts, financeFacts] = await Promise.all([
      LogisticsShadowSimulator.simulate(draft, scenario),
      FinanceShadowSimulator.simulate(draft, scenario)
    ]);
    return [...logisticsFacts, ...financeFacts];
  }
}
