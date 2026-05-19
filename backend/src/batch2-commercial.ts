/**
 * HARVICS Batch 2: Commercial Ring Modules
 * 10 new modules for sales/commercial operations
 * Pricing, Sales Ops, Customer Service, Marketing, Contracts, Competitor Analysis, Territory, Commission, Deal Desk, Forecasting
 */

// ─────────────────────────────────────────────────────────────
// TYPE DEFINITIONS
// ─────────────────────────────────────────────────────────────

export interface DemoPricingRecord {
  id: string;
  sku: string;
  territory: string;
  listPrice: number;
  discountPercent: number;
  effectivePrice: number;
  currency: string;
  minVolume: number;
  maxVolume: number;
  validFrom: string;
  validTo: string;
  status: 'Active' | 'Archived';
}

export interface DemoSalesOpsRecord {
  id: string;
  type: 'quota' | 'forecast' | 'pipeline' | 'target';
  owner: string;
  ownerRole: string;
  territory: string;
  value: number;
  currency: string;
  period: string;
  status: 'On Track' | 'At Risk' | 'Overachieving';
  lastUpdated: string;
}

export interface DemoCustomerServiceCase {
  id: string;
  customerId: string;
  subject: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  assignedTo: string;
  createdAt: string;
  resolvedAt?: string;
}

export interface DemoMarketingCampaign {
  id: string;
  name: string;
  channel: 'Email' | 'Social' | 'Web' | 'Event' | 'Direct';
  targetAudience: string;
  budget: number;
  spend: number;
  currency: string;
  status: 'Planning' | 'Active' | 'Paused' | 'Completed';
  startDate: string;
  endDate?: string;
  leadsGenerated: number;
  conversions: number;
}

export interface DemoContract {
  id: string;
  contractNumber: string;
  counterparty: string;
  type: 'Supply' | 'Service' | 'Distribution' | 'License';
  value: number;
  currency: string;
  status: 'Draft' | 'Pending Sign' | 'Active' | 'Expired';
  startDate: string;
  endDate: string;
  renewalTerms: string;
  createdAt: string;
}

export interface DemoCompetitor {
  id: string;
  name: string;
  territory: string;
  productLines: string[];
  estimatedMarketShare: number;
  pricePosition: 'Premium' | 'Mid' | 'Budget';
  lastAnalyzedAt: string;
  strengths: string[];
  weaknesses: string[];
}

export interface DemoTerritory {
  id: string;
  code: string;
  name: string;
  manager: string;
  region: string;
  potentialRevenue: number;
  actualRevenue: number;
  currency: string;
  achievementPercent: number;
  status: 'Active' | 'New' | 'Underperforming';
  updatedAt: string;
}

export interface DemoCommission {
  id: string;
  employeeId: string;
  employeeName: string;
  period: string;
  baseRevenue: number;
  commissionRate: number;
  commissionAmount: number;
  currency: string;
  status: 'Calculated' | 'Approved' | 'Paid';
  paidDate?: string;
}

export interface DemoDealDeskRequest {
  id: string;
  dealName: string;
  customerId: string;
  opportunityValue: number;
  requestedDiscount: number;
  requiredMargin: number;
  currency: string;
  submittedBy: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Negotiating';
  approvedDiscount?: number;
  decisionDate?: string;
}

export interface DemoSalesForecasts {
  id: string;
  forecastPeriod: string;
  ownerId: string;
  ownerTerritory: string;
  bestCase: number;
  baseCase: number;
  worstCase: number;
  currency: string;
  confidence: number;
  lastUpdated: string;
  notes: string;
}

// ─────────────────────────────────────────────────────────────
// SEED DATA
// ─────────────────────────────────────────────────────────────

export const BATCH_2_SEED = {
  pricing: [
    { id: 'price-001', sku: 'FMCG-001', territory: 'AE', listPrice: 12.5, discountPercent: 0, effectivePrice: 12.5, currency: 'USD', minVolume: 1, maxVolume: 99, validFrom: '2026-01-01', validTo: '2027-12-31', status: 'Active' as const },
    { id: 'price-002', sku: 'FMCG-001', territory: 'AE', listPrice: 12.5, discountPercent: 5, effectivePrice: 11.875, currency: 'USD', minVolume: 100, maxVolume: 499, validFrom: '2026-01-01', validTo: '2027-12-31', status: 'Active' as const },
    { id: 'price-003', sku: 'FMCG-001', territory: 'AE', listPrice: 12.5, discountPercent: 10, effectivePrice: 11.25, currency: 'USD', minVolume: 500, maxVolume: 999999, validFrom: '2026-01-01', validTo: '2027-12-31', status: 'Active' as const },
  ] as DemoPricingRecord[],
  
  salesOps: [
    { id: 'sops-001', type: 'quota' as const, owner: 'emp-002', ownerRole: 'Sales Lead', territory: 'AE', value: 250000, currency: 'USD', period: 'Q2 2026', status: 'On Track' as const, lastUpdated: new Date().toISOString() },
    { id: 'sops-002', type: 'forecast' as const, owner: 'emp-002', ownerRole: 'Sales Lead', territory: 'AE', value: 185000, currency: 'USD', period: 'Q2 2026', status: 'At Risk' as const, lastUpdated: new Date().toISOString() },
  ] as DemoSalesOpsRecord[],
  
  customerService: [
    { id: 'cs-001', customerId: 'cust-001', subject: 'Delivery delay on order demo-001', description: 'Package did not arrive on promised date', priority: 'High' as const, status: 'In Progress' as const, assignedTo: 'emp-001', createdAt: new Date().toISOString() },
  ] as DemoCustomerServiceCase[],
  
  marketing: [
    { id: 'camp-001', name: 'Q2 Email Campaign', channel: 'Email' as const, targetAudience: 'Distributors in AE', budget: 5000, spend: 2100, currency: 'USD', status: 'Active' as const, startDate: '2026-04-01', leadsGenerated: 42, conversions: 7 },
  ] as DemoMarketingCampaign[],
  
  contracts: [
    { id: 'contract-001', contractNumber: 'CNT-2026-001', counterparty: 'Global Retail LLC', type: 'Distribution' as const, value: 500000, currency: 'USD', status: 'Active' as const, startDate: '2026-01-15', endDate: '2027-01-14', renewalTerms: 'Auto-renew annual', createdAt: new Date().toISOString() },
  ] as DemoContract[],
  
  competitors: [
    { id: 'comp-001', name: 'Global Foods Inc', territory: 'AE', productLines: ['FMCG', 'Beverages'], estimatedMarketShare: 18, pricePosition: 'Premium' as const, lastAnalyzedAt: new Date().toISOString(), strengths: ['Brand recognition', 'Supply chain'], weaknesses: ['High costs'] },
  ] as DemoCompetitor[],
  
  territories: [
    { id: 'terr-001', code: 'AE', name: 'United Arab Emirates', manager: 'emp-001', region: 'MENA', potentialRevenue: 2000000, actualRevenue: 580000, currency: 'USD', achievementPercent: 29, status: 'Active' as const, updatedAt: new Date().toISOString() },
  ] as DemoTerritory[],
  
  commissions: [
    { id: 'comm-001', employeeId: 'emp-002', employeeName: 'Omar Farouk', period: 'April 2026', baseRevenue: 185000, commissionRate: 2.5, commissionAmount: 4625, currency: 'USD', status: 'Calculated' as const },
  ] as DemoCommission[],
  
  dealDesk: [
    { id: 'deal-001', dealName: 'Bulk Order - Emirates Trade Co', customerId: 'cust-003', opportunityValue: 125000, requestedDiscount: 15, requiredMargin: 18, currency: 'USD', submittedBy: 'emp-002', status: 'Pending' as const },
  ] as DemoDealDeskRequest[],
  
  forecasts: [
    { id: 'forecast-001', forecastPeriod: 'Q2 2026', ownerId: 'emp-002', ownerTerritory: 'AE', bestCase: 220000, baseCase: 185000, worstCase: 155000, currency: 'USD', confidence: 72, lastUpdated: new Date().toISOString(), notes: 'Conservative due to supply chain delays' },
  ] as DemoSalesForecasts[],
};

// ─────────────────────────────────────────────────────────────
// STORE HOLDER (imported into routes.ts and mutated)
// ─────────────────────────────────────────────────────────────

export interface Batch2Stores {
  pricing: DemoPricingRecord[];
  pricingSeq: number;
  salesOps: DemoSalesOpsRecord[];
  salesOpsSeq: number;
  customerService: DemoCustomerServiceCase[];
  csSeq: number;
  marketing: DemoMarketingCampaign[];
  marketingSeq: number;
  contracts: DemoContract[];
  contractSeq: number;
  competitors: DemoCompetitor[];
  competitorSeq: number;
  territories: DemoTerritory[];
  territorySeq: number;
  commissions: DemoCommission[];
  commissionSeq: number;
  dealDesk: DemoDealDeskRequest[];
  dealDeskSeq: number;
  forecasts: DemoSalesForecasts[];
  forecastSeq: number;
}

export const BATCH_2_EMPTY: Batch2Stores = {
  pricing: BATCH_2_SEED.pricing,
  pricingSeq: 4,
  salesOps: BATCH_2_SEED.salesOps,
  salesOpsSeq: 3,
  customerService: BATCH_2_SEED.customerService,
  csSeq: 2,
  marketing: BATCH_2_SEED.marketing,
  marketingSeq: 2,
  contracts: BATCH_2_SEED.contracts,
  contractSeq: 2,
  competitors: BATCH_2_SEED.competitors,
  competitorSeq: 2,
  territories: BATCH_2_SEED.territories,
  territorySeq: 2,
  commissions: BATCH_2_SEED.commissions,
  commissionSeq: 2,
  dealDesk: BATCH_2_SEED.dealDesk,
  dealDeskSeq: 2,
  forecasts: BATCH_2_SEED.forecasts,
  forecastSeq: 2,
};
