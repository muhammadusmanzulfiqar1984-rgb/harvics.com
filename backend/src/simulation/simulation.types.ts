
export enum SimulationScenario {
  HAPPY_PATH = 'HAPPY_PATH',
  BORDERLINE_MARGIN = 'BORDERLINE_MARGIN',
  COMPLIANCE_FRICTION = 'COMPLIANCE_FRICTION',
  SUPPLIER_DELAY = 'SUPPLIER_DELAY',
  PAYMENT_RAIL_STRESS = 'PAYMENT_RAIL_STRESS'
}

export interface SimulationFact {
  type: 'LOGISTICS' | 'FINANCE';
  metric: string;
  value: number | boolean | string;
  timestamp: string;
}

export interface DeltaScorecard {
  scorecardId: string;
  traceId: string;
  artifactId: string;
  scenario: SimulationScenario;
  deltas: {
    category: 'TIME' | 'COST' | 'QUALITY' | 'RISK';
    expected: any;
    actual: any;
    delta: any;
    severity: 'GREEN' | 'AMBER' | 'RED';
  }[];
  overallStatus: 'PASS' | 'WARN' | 'FAIL';
  generatedAt: string;
}
