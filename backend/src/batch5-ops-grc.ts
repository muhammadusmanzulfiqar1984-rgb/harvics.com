/**
 * HARVICS Batch 5: Ops + Asset + GRC Ring Modules
 * 10 modules for operations, assets, governance, risk, and compliance
 */

export type OpsGRCStatus = 'Active' | 'Pending' | 'Completed' | 'At Risk' | 'Closed' | 'Open' | 'In Review';

export interface DemoProject {
  id: string;
  name: string;
  owner: string;
  startDate: string;
  endDate?: string;
  budget: number;
  spent: number;
  currency: string;
  status: 'Planning' | 'In Progress' | 'On Hold' | 'Completed' | 'Cancelled';
}

export interface DemoMaintenance {
  id: string;
  assetId: string;
  assetName: string;
  maintenanceType: 'Preventive' | 'Corrective' | 'Predictive';
  scheduledDate: string;
  completedDate?: string;
  cost: number;
  currency: string;
  status: OpsGRCStatus;
}

export interface DemoAsset {
  id: string;
  name: string;
  category: string;
  location: string;
  acquisitionDate: string;
  originalCost: number;
  currentValue: number;
  currency: string;
  depreciationRate: number;
  status: 'Active' | 'Retired' | 'Disposed';
}

export interface DemoGRC {
  id: string;
  domain: 'Governance' | 'Risk' | 'Compliance';
  title: string;
  owner: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  dueDate: string;
  status: OpsGRCStatus;
  description: string;
}

export interface DemoAudit {
  id: string;
  auditType: string;
  scope: string;
  startDate: string;
  endDate?: string;
  findingsCount: number;
  findingsSeverity: 'Low' | 'Medium' | 'High';
  status: 'Planned' | 'In Progress' | 'Completed' | 'Follow-up';
}

export interface DemoCompliance {
  id: string;
  controlName: string;
  framework: string;
  frequency: 'Daily' | 'Weekly' | 'Monthly' | 'Quarterly' | 'Annual';
  lastExecuted: string;
  nextDue: string;
  status: 'Compliant' | 'Non-Compliant' | 'In Progress';
}

export interface DemoRisk {
  id: string;
  description: string;
  category: string;
  probability: number;
  impact: number;
  riskScore: number;
  mitigation: string;
  owner: string;
  status: 'Open' | 'Mitigating' | 'Closed';
}

export interface DemoFacility {
  id: string;
  name: string;
  location: string;
  area: number;
  capacity: number;
  utilizationPct: number;
  maintenanceStatus: 'Good' | 'Fair' | 'Poor';
  lastInspection: string;
}

export interface DemoIncident {
  id: string;
  title: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  reportedDate: string;
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  resolution?: string;
  resolvedDate?: string;
}

export interface DemoAuditTrail {
  id: string;
  action: string;
  module: string;
  userId: string;
  timestamp: string;
  entityType: string;
  entityId: string;
  changes: Record<string, any>;
}

export const BATCH_5_SEED = {
  projects: [
    { id: 'proj-001', name: 'ERP Implementation Phase 2', owner: 'emp-001', startDate: '2026-03-01', endDate: '2026-09-30', budget: 150000, spent: 45000, currency: 'USD', status: 'In Progress' as const },
    { id: 'proj-002', name: 'Supply Chain Optimization', owner: 'emp-002', startDate: '2026-04-15', budget: 80000, spent: 12000, currency: 'USD', status: 'In Progress' as const },
  ],

  maintenance: [
    { id: 'maint-001', assetId: 'ast-001', assetName: 'Warehouse Forklift', maintenanceType: 'Preventive' as const, scheduledDate: '2026-06-01', cost: 2500, currency: 'USD', status: 'Pending' as const },
    { id: 'maint-002', assetId: 'ast-002', assetName: 'Production Line A', maintenanceType: 'Corrective' as const, completedDate: '2026-05-10', cost: 5000, currency: 'USD', status: 'Completed' as const },
  ] as DemoMaintenance[],

  assets: [
    { id: 'ast-001', name: 'Warehouse Forklift', category: 'Equipment', location: 'Dubai-W1', acquisitionDate: '2020-01-15', originalCost: 35000, currentValue: 21000, currency: 'USD', depreciationRate: 15, status: 'Active' as const },
    { id: 'ast-002', name: 'Production Line A', category: 'Machinery', location: 'Manufacturing', acquisitionDate: '2018-06-01', originalCost: 500000, currentValue: 225000, currency: 'USD', depreciationRate: 12, status: 'Active' as const },
  ],

  grc: [
    { id: 'grc-001', domain: 'Compliance' as const, title: 'Annual Tax Audit Readiness', owner: 'emp-001', priority: 'High' as const, dueDate: '2026-07-31', status: 'In Progress' as const, description: 'Prepare all tax documentation for external audit' },
    { id: 'grc-002', domain: 'Risk' as const, title: 'Supply Chain Disruption Mitigation', owner: 'emp-002', priority: 'Critical' as const, dueDate: '2026-06-15', status: 'Open' as const, description: 'Identify backup suppliers for critical SKUs' },
  ] as DemoGRC[],

  audit: [
    { id: 'audit-001', auditType: 'Internal Financial', scope: 'Q1 2026 Ledger', startDate: '2026-05-01', endDate: '2026-05-15', findingsCount: 3, findingsSeverity: 'Medium' as const, status: 'Completed' as const },
    { id: 'audit-002', auditType: 'IT Systems', scope: 'Access Control Review', startDate: '2026-05-18', findingsCount: 0, findingsSeverity: 'Low' as const, status: 'In Progress' as const },
  ],

  compliance: [
    { id: 'comp-001', controlName: 'Daily Cash Reconciliation', framework: 'SOX', frequency: 'Daily' as const, lastExecuted: '2026-05-17', nextDue: '2026-05-18', status: 'Compliant' as const },
    { id: 'comp-002', controlName: 'Quarterly Inventory Audit', framework: 'Internal', frequency: 'Quarterly' as const, lastExecuted: '2026-04-01', nextDue: '2026-07-01', status: 'Compliant' as const },
  ],

  risk: [
    { id: 'risk-001', description: 'Key supplier concentration risk', category: 'Supply Chain', probability: 0.3, impact: 0.8, riskScore: 0.24, mitigation: 'Diversify supplier base', owner: 'emp-002', status: 'Mitigating' as const },
    { id: 'risk-002', description: 'Currency volatility exposure', category: 'Financial', probability: 0.7, impact: 0.4, riskScore: 0.28, mitigation: 'Implement hedging strategy', owner: 'emp-001', status: 'Open' as const },
  ],

  facilities: [
    { id: 'fac-001', name: 'Dubai Headquarters', location: 'Dubai, UAE', area: 50000, capacity: 500, utilizationPct: 72, maintenanceStatus: 'Good' as const, lastInspection: '2026-04-15' },
    { id: 'fac-002', name: 'Islamabad Distribution', location: 'Islamabad, PK', area: 25000, capacity: 300, utilizationPct: 85, maintenanceStatus: 'Fair' as const, lastInspection: '2026-03-20' },
  ],

  incidents: [
    { id: 'inc-001', title: 'Warehouse temperature control failure', severity: 'High' as const, reportedDate: '2026-05-10', status: 'Resolved' as const, resolution: 'Replaced HVAC compressor', resolvedDate: '2026-05-12' },
    { id: 'inc-002', title: 'Data access anomaly detected', severity: 'Critical' as const, reportedDate: '2026-05-16', status: 'In Progress' as const },
  ],

  auditTrail: [
    { id: 'trail-001', action: 'CREATE', module: 'Orders', userId: 'emp-002', timestamp: '2026-05-18T10:30:00Z', entityType: 'Order', entityId: 'demo-001', changes: { customer: 'Global Retail LLC', amount: 12500 } },
    { id: 'trail-002', action: 'UPDATE', module: 'Ledger', userId: 'emp-001', timestamp: '2026-05-18T11:45:00Z', entityType: 'LedgerEntry', entityId: 'gl-0001', changes: { status: 'Posted' } },
  ],
};

export interface Batch5Stores {
  projects: DemoProject[];
  projectSeq: number;
  maintenance: DemoMaintenance[];
  maintenanceSeq: number;
  assets: DemoAsset[];
  assetSeq: number;
  grc: DemoGRC[];
  grcSeq: number;
  audit: DemoAudit[];
  auditSeq: number;
  compliance: DemoCompliance[];
  complianceSeq: number;
  risk: DemoRisk[];
  riskSeq: number;
  facilities: DemoFacility[];
  facilitySeq: number;
  incidents: DemoIncident[];
  incidentSeq: number;
  auditTrail: DemoAuditTrail[];
  trailSeq: number;
}

export const BATCH_5_EMPTY: Batch5Stores = {
  projects: BATCH_5_SEED.projects,
  projectSeq: 3,
  maintenance: BATCH_5_SEED.maintenance,
  maintenanceSeq: 3,
  assets: BATCH_5_SEED.assets,
  assetSeq: 3,
  grc: BATCH_5_SEED.grc,
  grcSeq: 3,
  audit: BATCH_5_SEED.audit,
  auditSeq: 3,
  compliance: BATCH_5_SEED.compliance,
  complianceSeq: 3,
  risk: BATCH_5_SEED.risk,
  riskSeq: 3,
  facilities: BATCH_5_SEED.facilities,
  facilitySeq: 3,
  incidents: BATCH_5_SEED.incidents,
  incidentSeq: 3,
  auditTrail: BATCH_5_SEED.auditTrail,
  trailSeq: 3,
};
