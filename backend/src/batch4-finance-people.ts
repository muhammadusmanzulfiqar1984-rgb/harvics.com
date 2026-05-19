/**
 * HARVICS Batch 4: Finance + People Ring Modules
 * 10 new modules for finance operations and human capital management
 */

export type FinancePeopleStatus = 'Active' | 'Pending' | 'Approved' | 'Rejected' | 'Completed' | 'On Track' | 'At Risk';

export interface DemoPayroll {
  id: string;
  employeeId: string;
  employeeName: string;
  period: string;
  baseSalary: number;
  deductions: number;
  netPay: number;
  currency: string;
  status: 'Calculated' | 'Approved' | 'Processed';
  processedDate?: string;
}

export interface DemoAR {
  id: string;
  invoiceId: string;
  customerId: string;
  customerName: string;
  amount: number;
  currency: string;
  daysOutstanding: number;
  status: 'Open' | 'Partial' | 'Paid' | 'Overdue';
  dueDate: string;
}

export interface DemoAP {
  id: string;
  poId: string;
  vendorId: string;
  vendorName: string;
  amount: number;
  currency: string;
  daysOutstanding: number;
  status: 'Open' | 'Partial' | 'Paid' | 'Overdue';
  dueDate: string;
}

export interface DemoTreasury {
  id: string;
  type: 'Cash Position' | 'Forecast' | 'Exposure' | 'Liquidity';
  currency: string;
  amount: number;
  riskLevel: 'Low' | 'Medium' | 'High';
  lastUpdated: string;
  status: FinancePeopleStatus;
}

export interface DemoFinancialPlan {
  id: string;
  period: string;
  category: 'Revenue' | 'COGS' | 'OpEx' | 'CapEx';
  planned: number;
  actual: number;
  variance: number;
  currency: string;
  status: FinancePeopleStatus;
}

export interface DemoRecruitment {
  id: string;
  jobTitle: string;
  department: string;
  applicants: number;
  status: 'Open' | 'In Progress' | 'Filled' | 'Cancelled';
  postedDate: string;
  targetHireDate?: string;
}

export interface DemoPerformance {
  id: string;
  employeeId: string;
  employeeName: string;
  reviewPeriod: string;
  rating: number;
  feedback: string;
  status: 'Draft' | 'In Review' | 'Completed';
  reviewerName: string;
}

export interface DemoLearning {
  id: string;
  courseTitle: string;
  provider: string;
  enrolledCount: number;
  completedCount: number;
  duration: string;
  status: 'Active' | 'Archived' | 'Planning';
}

export interface DemoWorkforcePlan {
  id: string;
  department: string;
  currentHeadcount: number;
  plannedHeadcount: number;
  openRoles: number;
  retentionRiskCount: number;
  period: string;
  status: FinancePeopleStatus;
}

export interface DemoTalentAcquisition {
  id: string;
  candidateName: string;
  position: string;
  stage: 'Applied' | 'Screened' | 'Interviewed' | 'Offered' | 'Hired' | 'Rejected';
  score: number;
  appliedDate: string;
  status: FinancePeopleStatus;
}

export const BATCH_4_SEED = {
  payroll: [
    { id: 'pr-001', employeeId: 'emp-001', employeeName: 'Ayesha Khan', period: 'May 2026', baseSalary: 9500, deductions: 1425, netPay: 8075, currency: 'USD', status: 'Processed' as const, processedDate: '2026-05-15' },
    { id: 'pr-002', employeeId: 'emp-002', employeeName: 'Omar Farouk', period: 'May 2026', baseSalary: 6200, deductions: 930, netPay: 5270, currency: 'USD', status: 'Approved' as const },
  ] as DemoPayroll[],

  ar: [
    { id: 'ar-001', invoiceId: 'inv-0001', customerId: 'cust-001', customerName: 'Khalid Mansour', amount: 12500, currency: 'USD', daysOutstanding: 15, status: 'Open' as const, dueDate: '2026-06-05' },
    { id: 'ar-002', invoiceId: 'inv-0002', customerId: 'cust-002', customerName: 'Sara Ahmed', amount: 8200, currency: 'USD', daysOutstanding: 32, status: 'Overdue' as const, dueDate: '2026-05-10' },
  ] as DemoAR[],

  ap: [
    { id: 'ap-001', poId: 'po-0001', vendorId: 'ven-001', vendorName: 'Mega Foods Supply', amount: 5000, currency: 'USD', daysOutstanding: 8, status: 'Open' as const, dueDate: '2026-06-10' },
    { id: 'ap-002', poId: 'po-0002', vendorId: 'ven-002', vendorName: 'Desert Logistics', amount: 3200, currency: 'USD', daysOutstanding: 0, status: 'Paid' as const, dueDate: '2026-05-18' },
  ] as DemoAP[],

  treasury: [
    { id: 'trs-001', type: 'Cash Position', currency: 'USD', amount: 125000, riskLevel: 'Low' as const, lastUpdated: new Date().toISOString(), status: 'Active' as const },
    { id: 'trs-002', type: 'Forecast', currency: 'USD', amount: 95000, riskLevel: 'Medium' as const, lastUpdated: new Date().toISOString(), status: 'On Track' as const },
  ] as DemoTreasury[],

  financialPlan: [
    { id: 'fp-001', period: 'Q2 2026', category: 'Revenue', planned: 250000, actual: 185000, variance: -65000, currency: 'USD', status: 'On Track' as const },
    { id: 'fp-002', period: 'Q2 2026', category: 'OpEx', planned: 80000, actual: 72000, variance: 8000, currency: 'USD', status: 'On Track' as const },
  ] as DemoFinancialPlan[],

  recruitment: [
    { id: 'rec-001', jobTitle: 'Senior Sales Manager', department: 'Sales', applicants: 24, status: 'In Progress' as const, postedDate: '2026-04-15', targetHireDate: '2026-06-30' },
    { id: 'rec-002', jobTitle: 'Data Analyst', department: 'IT', applicants: 18, status: 'Open' as const, postedDate: '2026-05-01' },
  ] as DemoRecruitment[],

  performance: [
    { id: 'perf-001', employeeId: 'emp-001', employeeName: 'Ayesha Khan', reviewPeriod: 'Q1 2026', rating: 4.5, feedback: 'Excellent leadership and team coordination', status: 'Completed' as const, reviewerName: 'CEO' },
    { id: 'perf-002', employeeId: 'emp-002', employeeName: 'Omar Farouk', reviewPeriod: 'Q1 2026', rating: 4.0, feedback: 'Strong sales performance, areas for improvement in documentation', status: 'In Review' as const, reviewerName: 'Sales Director' },
  ] as DemoPerformance[],

  learning: [
    { id: 'lms-001', courseTitle: 'Leadership Excellence', provider: 'LinkedIn Learning', enrolledCount: 42, completedCount: 28, duration: '6 weeks', status: 'Active' as const },
    { id: 'lms-002', courseTitle: 'Advanced Excel', provider: 'Coursera', enrolledCount: 15, completedCount: 8, duration: '4 weeks', status: 'Active' as const },
  ] as DemoLearning[],

  workforcePlan: [
    { id: 'wfp-001', department: 'Sales', currentHeadcount: 12, plannedHeadcount: 15, openRoles: 3, retentionRiskCount: 1, period: 'H2 2026', status: 'On Track' as const },
    { id: 'wfp-002', department: 'Operations', currentHeadcount: 8, plannedHeadcount: 10, openRoles: 2, retentionRiskCount: 0, period: 'H2 2026', status: 'On Track' as const },
  ] as DemoWorkforcePlan[],

  talentAcquisition: [
    { id: 'ta-001', candidateName: 'Fatima Hassan', position: 'Senior Sales Manager', stage: 'Interviewed', score: 8.5, appliedDate: '2026-04-20', status: 'On Track' as const },
    { id: 'ta-002', candidateName: 'Ahmed Mohamed', position: 'Data Analyst', stage: 'Screened', score: 7.8, appliedDate: '2026-05-02', status: 'On Track' as const },
  ] as DemoTalentAcquisition[],
};

export interface Batch4Stores {
  payroll: DemoPayroll[];
  payrollSeq: number;
  ar: DemoAR[];
  arSeq: number;
  ap: DemoAP[];
  apSeq: number;
  treasury: DemoTreasury[];
  treasurySeq: number;
  financialPlan: DemoFinancialPlan[];
  planSeq: number;
  recruitment: DemoRecruitment[];
  recruitmentSeq: number;
  performance: DemoPerformance[];
  performanceSeq: number;
  learning: DemoLearning[];
  learningSeq: number;
  workforcePlan: DemoWorkforcePlan[];
  workforceSeq: number;
  talentAcquisition: DemoTalentAcquisition[];
  talentSeq: number;
}

export const BATCH_4_EMPTY: Batch4Stores = {
  payroll: BATCH_4_SEED.payroll,
  payrollSeq: 3,
  ar: BATCH_4_SEED.ar,
  arSeq: 3,
  ap: BATCH_4_SEED.ap,
  apSeq: 3,
  treasury: BATCH_4_SEED.treasury,
  treasurySeq: 3,
  financialPlan: BATCH_4_SEED.financialPlan,
  planSeq: 3,
  recruitment: BATCH_4_SEED.recruitment,
  recruitmentSeq: 3,
  performance: BATCH_4_SEED.performance,
  performanceSeq: 3,
  learning: BATCH_4_SEED.learning,
  learningSeq: 3,
  workforcePlan: BATCH_4_SEED.workforcePlan,
  workforceSeq: 3,
  talentAcquisition: BATCH_4_SEED.talentAcquisition,
  talentSeq: 3,
};
