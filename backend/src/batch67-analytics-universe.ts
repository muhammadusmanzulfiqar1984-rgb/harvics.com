/**
 * HARVICS Batch 6 + 7: Analytics/AI/Platform + Universe/Portals
 * Final 21 modules to complete all 71
 */

// ─────── BATCH 6: Analytics + AI + Platform (10) ───────────────────────────

export interface DemoBIReport {
  id: string; name: string; type: string; period: string;
  views: number; lastRun: string; status: 'Ready' | 'Running' | 'Failed';
}

export interface DemoOKR {
  id: string; objective: string; owner: string; progress: number;
  keyResults: number; completed: number; period: string;
  status: 'On Track' | 'At Risk' | 'Behind' | 'Completed';
}

export interface DemoAIInsight {
  id: string; type: 'Recommendation' | 'Anomaly' | 'Forecast' | 'Alert';
  headline: string; detail: string; confidence: number;
  module: string; createdAt: string; status: 'New' | 'Reviewed' | 'Actioned';
}

export interface DemoTaxRecord {
  id: string; country: string; taxType: string; rate: number;
  appliedTo: string; effectiveDate: string; status: 'Active' | 'Superseded';
}

export interface DemoFXRate {
  id: string; fromCurrency: string; toCurrency: string;
  rate: number; source: string; updatedAt: string; status: 'Live' | 'Stale';
}

export interface DemoDocument {
  id: string; title: string; category: string; module: string;
  uploadedBy: string; uploadedAt: string; fileSize: string;
  status: 'Active' | 'Archived' | 'Pending Review';
}

export interface DemoIntegration {
  id: string; name: string; type: string; direction: 'Inbound' | 'Outbound' | 'Bidirectional';
  status: 'Active' | 'Error' | 'Paused'; lastSync: string; recordsProcessed: number;
}

export interface DemoAdminUser {
  id: string; username: string; role: string; lastLogin: string;
  mfaEnabled: boolean; status: 'Active' | 'Suspended' | 'Pending';
}

export interface DemoDataOceanStream {
  id: string; streamName: string; source: string; recordsPerHour: number;
  latency: number; status: 'Live' | 'Paused' | 'Error';
}

export interface DemoBoardPack {
  id: string; title: string; period: string; generatedAt: string;
  sections: string[]; status: 'Draft' | 'Final' | 'Distributed';
}

// ─────── BATCH 7: Universe + Portals (11) ──────────────────────────────────

export interface DemoFunFeedPost {
  id: string; author: string; content: string; likes: number;
  comments: number; createdAt: string; status: 'Published' | 'Removed';
}

export interface DemoMallListing {
  id: string; productName: string; seller: string; price: number;
  currency: string; category: string; stock: number;
  status: 'Listed' | 'Sold Out' | 'Draft';
}

export interface DemoTradeFloor {
  id: string; commodity: string; bidPrice: number; askPrice: number;
  volume: number; currency: string; change24h: number; status: 'Open' | 'Closed';
}

export interface DemoCryptoLite {
  id: string; symbol: string; name: string; price: number;
  change24h: number; marketCap: number; volume24h: number; status: 'Active' | 'Delisted';
}

export interface DemoHarvicoins {
  id: string; userId: string; balance: number; earned: number;
  spent: number; tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum'; lastActivity: string;
}

export interface DemoHPay {
  id: string; userId: string; walletBalance: number; currency: string;
  totalTransactions: number; status: 'Active' | 'Suspended';
}

export interface DemoReferral {
  id: string; referrerId: string; refereeId: string; reward: number;
  currency: string; status: 'Pending' | 'Credited' | 'Expired'; createdAt: string;
}

export interface DemoJobListing {
  id: string; title: string; company: string; location: string;
  type: 'Full-time' | 'Part-time' | 'Freelance'; applications: number;
  status: 'Open' | 'Closed' | 'Draft';
}

export interface DemoExpert {
  id: string; name: string; specialty: string; rating: number;
  sessionsCompleted: number; hourlyRate: number; currency: string;
  status: 'Available' | 'Busy' | 'Offline';
}

export interface DemoPortalActivity {
  id: string; portalType: 'Customer' | 'Vendor' | 'Field';
  userId: string; action: string; module: string;
  timestamp: string; status: 'Success' | 'Failed';
}

export interface DemoPlayroom {
  id: string; gameName: string; category: string; activePlayers: number;
  totalPlays: number; avgSessionMin: number; status: 'Live' | 'Maintenance';
}

// ─────── SEEDS ──────────────────────────────────────────────────────────────

export const BATCH_67_SEED = {
  biReports: [
    { id: 'bi-001', name: 'Monthly Revenue Dashboard', type: 'Revenue', period: 'May 2026', views: 124, lastRun: new Date().toISOString(), status: 'Ready' as const },
    { id: 'bi-002', name: 'Inventory Aging Report', type: 'Inventory', period: 'May 2026', views: 45, lastRun: new Date().toISOString(), status: 'Ready' as const },
    { id: 'bi-003', name: 'Pipeline Velocity', type: 'CRM', period: 'Q2 2026', views: 67, lastRun: new Date().toISOString(), status: 'Ready' as const },
  ] as DemoBIReport[],

  okr: [
    { id: 'okr-001', objective: 'Expand MENA market share to 25%', owner: 'CEO', progress: 38, keyResults: 4, completed: 1, period: 'H1 2026', status: 'On Track' as const },
    { id: 'okr-002', objective: 'Achieve $1M quarterly revenue', owner: 'Sales Dir', progress: 74, keyResults: 3, completed: 2, period: 'Q2 2026', status: 'On Track' as const },
  ] as DemoOKR[],

  aiInsights: [
    { id: 'ai-001', type: 'Anomaly' as const, headline: 'Cairo Foods Co — 40% order drop', detail: 'Potential churn risk. Last order 45 days ago.', confidence: 87, module: 'CRM', createdAt: new Date().toISOString(), status: 'New' as const },
    { id: 'ai-002', type: 'Recommendation' as const, headline: 'Reorder FMCG-004 now', detail: 'Below reorder point. Lead time 14 days.', confidence: 94, module: 'Inventory', createdAt: new Date().toISOString(), status: 'New' as const },
    { id: 'ai-003', type: 'Forecast' as const, headline: 'Q3 revenue forecast: $285k', detail: 'Based on pipeline + seasonal index.', confidence: 72, module: 'Finance', createdAt: new Date().toISOString(), status: 'Reviewed' as const },
  ] as DemoAIInsight[],

  taxRecords: [
    { id: 'tax-001', country: 'AE', taxType: 'VAT', rate: 5, appliedTo: 'All goods', effectiveDate: '2018-01-01', status: 'Active' as const },
    { id: 'tax-002', country: 'PK', taxType: 'GST', rate: 17, appliedTo: 'Manufactured goods', effectiveDate: '2023-07-01', status: 'Active' as const },
    { id: 'tax-003', country: 'GB', taxType: 'VAT', rate: 20, appliedTo: 'All goods', effectiveDate: '2011-01-04', status: 'Active' as const },
  ] as DemoTaxRecord[],

  fxRates: [
    { id: 'fx-001', fromCurrency: 'USD', toCurrency: 'AED', rate: 3.6725, source: 'ECB', updatedAt: new Date().toISOString(), status: 'Live' as const },
    { id: 'fx-002', fromCurrency: 'USD', toCurrency: 'PKR', rate: 278.5, source: 'SBP', updatedAt: new Date().toISOString(), status: 'Live' as const },
    { id: 'fx-003', fromCurrency: 'USD', toCurrency: 'GBP', rate: 0.792, source: 'ECB', updatedAt: new Date().toISOString(), status: 'Live' as const },
  ] as DemoFXRate[],

  documents: [
    { id: 'doc-001', title: 'Q1 2026 Financial Statements', category: 'Finance', module: 'Finance', uploadedBy: 'emp-001', uploadedAt: '2026-04-15', fileSize: '2.4 MB', status: 'Active' as const },
    { id: 'doc-002', title: 'Supplier Agreement - Mega Foods', category: 'Contracts', module: 'Procurement', uploadedBy: 'emp-002', uploadedAt: '2026-03-10', fileSize: '1.1 MB', status: 'Active' as const },
  ] as DemoDocument[],

  integrations: [
    { id: 'int-001', name: 'Shopify Storefront', type: 'E-Commerce', direction: 'Inbound' as const, status: 'Active' as const, lastSync: new Date().toISOString(), recordsProcessed: 1240 },
    { id: 'int-002', name: 'QuickBooks Accounting', type: 'Finance', direction: 'Bidirectional' as const, status: 'Active' as const, lastSync: new Date().toISOString(), recordsProcessed: 450 },
  ] as DemoIntegration[],

  adminUsers: [
    { id: 'adm-001', username: 'admin', role: 'Super Admin', lastLogin: new Date().toISOString(), mfaEnabled: true, status: 'Active' as const },
    { id: 'adm-002', username: 'hq_user', role: 'HQ Manager', lastLogin: new Date().toISOString(), mfaEnabled: false, status: 'Active' as const },
  ] as DemoAdminUser[],

  dataOcean: [
    { id: 'ocean-001', streamName: 'Orders Firehose', source: 'ERP Core', recordsPerHour: 340, latency: 120, status: 'Live' as const },
    { id: 'ocean-002', streamName: 'Market Price Feed', source: 'External API', recordsPerHour: 8600, latency: 45, status: 'Live' as const },
  ] as DemoDataOceanStream[],

  boardPacks: [
    { id: 'bp-001', title: 'May 2026 Board Pack', period: 'May 2026', generatedAt: new Date().toISOString(), sections: ['P&L', 'Cash Flow', 'KPIs', 'Risks'], status: 'Final' as const },
  ] as DemoBoardPack[],

  funFeed: [
    { id: 'ff-001', author: 'Ayesha Khan', content: 'Q2 results looking strong! Team crushed it 🚀', likes: 42, comments: 8, createdAt: new Date().toISOString(), status: 'Published' as const },
  ] as DemoFunFeedPost[],

  mallListings: [
    { id: 'mall-001', productName: 'Premium Coffee 500g', seller: 'Harvics Direct', price: 12.5, currency: 'USD', category: 'Beverages', stock: 1200, status: 'Listed' as const },
    { id: 'mall-002', productName: 'Dates Premium 1kg', seller: 'Harvics Direct', price: 22.0, currency: 'USD', category: 'Snacks', stock: 320, status: 'Listed' as const },
  ] as DemoMallListing[],

  tradeFloor: [
    { id: 'tf-001', commodity: 'Arabica Coffee', bidPrice: 2.34, askPrice: 2.36, volume: 50000, currency: 'USD', change24h: 1.2, status: 'Open' as const },
    { id: 'tf-002', commodity: 'Wheat', bidPrice: 5.21, askPrice: 5.24, volume: 120000, currency: 'USD', change24h: -0.5, status: 'Open' as const },
  ] as DemoTradeFloor[],

  crypto: [
    { id: 'crypto-001', symbol: 'BTC', name: 'Bitcoin', price: 68400, change24h: 2.1, marketCap: 1350000000000, volume24h: 28000000000, status: 'Active' as const },
    { id: 'crypto-002', symbol: 'ETH', name: 'Ethereum', price: 3720, change24h: -0.8, marketCap: 448000000000, volume24h: 14000000000, status: 'Active' as const },
  ] as DemoCryptoLite[],

  harvicoins: [
    { id: 'hc-001', userId: 'cust-001', balance: 1250, earned: 3400, spent: 2150, tier: 'Gold' as const, lastActivity: new Date().toISOString() },
    { id: 'hc-002', userId: 'cust-002', balance: 320, earned: 820, spent: 500, tier: 'Silver' as const, lastActivity: new Date().toISOString() },
  ] as DemoHarvicoins[],

  hpay: [
    { id: 'hpay-001', userId: 'cust-001', walletBalance: 5400, currency: 'USD', totalTransactions: 84, status: 'Active' as const },
    { id: 'hpay-002', userId: 'emp-001', walletBalance: 1200, currency: 'USD', totalTransactions: 12, status: 'Active' as const },
  ] as DemoHPay[],

  referrals: [
    { id: 'ref-001', referrerId: 'cust-001', refereeId: 'cust-003', reward: 50, currency: 'USD', status: 'Credited' as const, createdAt: new Date().toISOString() },
  ] as DemoReferral[],

  jobs: [
    { id: 'job-001', title: 'Regional Sales Manager', company: 'Harvics Global', location: 'Dubai, UAE', type: 'Full-time' as const, applications: 34, status: 'Open' as const },
    { id: 'job-002', title: 'Logistics Coordinator', company: 'Harvics Global', location: 'Islamabad, PK', type: 'Full-time' as const, applications: 18, status: 'Open' as const },
  ] as DemoJobListing[],

  experts: [
    { id: 'exp-001', name: 'Dr. Sara Ahmed', specialty: 'Supply Chain Strategy', rating: 4.9, sessionsCompleted: 142, hourlyRate: 150, currency: 'USD', status: 'Available' as const },
    { id: 'exp-002', name: 'Ahmed Raza', specialty: 'Financial Planning', rating: 4.7, sessionsCompleted: 88, hourlyRate: 120, currency: 'USD', status: 'Busy' as const },
  ] as DemoExpert[],

  portalActivity: [
    { id: 'port-001', portalType: 'Customer' as const, userId: 'cust-001', action: 'Order Placed', module: 'Orders', timestamp: new Date().toISOString(), status: 'Success' as const },
    { id: 'port-002', portalType: 'Vendor' as const, userId: 'ven-001', action: 'Invoice Submitted', module: 'Procurement', timestamp: new Date().toISOString(), status: 'Success' as const },
    { id: 'port-003', portalType: 'Field' as const, userId: 'emp-003', action: 'Delivery Confirmed', module: 'Logistics', timestamp: new Date().toISOString(), status: 'Success' as const },
  ] as DemoPortalActivity[],

  playroom: [
    { id: 'play-001', gameName: 'Trade Tycoon', category: 'Strategy', activePlayers: 240, totalPlays: 8400, avgSessionMin: 18, status: 'Live' as const },
    { id: 'play-002', gameName: 'Supply Chain Quest', category: 'Simulation', activePlayers: 85, totalPlays: 2100, avgSessionMin: 12, status: 'Live' as const },
  ] as DemoPlayroom[],
};
