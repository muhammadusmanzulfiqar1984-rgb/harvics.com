/**
 * HARVICS OS — Stub Module Catalog
 *
 * Single source of placeholder/demo data for the 38 modules that were
 * previously status='stub' in the registry. Exposes a uniform shape so the
 * 71-module explorer can render a coherent preview for every module:
 *
 *   GET /api/modules/stub/:moduleId
 *     -> { success, data: { id, name, band, summary: KPI[], records: any[] } }
 *
 * Goal: lift these modules to status='demo' so the explorer no longer shows
 * a dead route. Records are intentionally short — one to three rows each —
 * since this is preview-only seed data, not a real implementation.
 */

import { Request, Response, Router } from 'express';

export interface StubKpi {
  label: string;
  value: string;
  trend?: string;
}

export interface StubModuleSeed {
  id: number;
  name: string;
  band: string;
  summary: StubKpi[];
  records: Record<string, any>[];
}

const today = () => new Date().toISOString().slice(0, 10);

export const STUB_CATALOG: Record<number, StubModuleSeed> = {
  2: { id: 2, name: 'Controlling', band: 'Finance & Controlling',
    summary: [
      { label: 'Cost Centers', value: '47', trend: '+3 QoQ' },
      { label: 'Budget Variance', value: '-2.8%', trend: 'under budget' },
      { label: 'Profit Centers', value: '12' },
    ],
    records: [
      { code: 'CC-1001', name: 'Operations Dubai', planned: 250000, actual: 243800, variance: -2.5, currency: 'USD' },
      { code: 'CC-1002', name: 'Manufacturing PK', planned: 180000, actual: 192100, variance: 6.7, currency: 'USD' },
    ] },

  6: { id: 6, name: 'HPay Payments', band: 'Finance & Controlling',
    summary: [
      { label: 'Volume (30d)', value: 'USD 4.2M' },
      { label: 'Settlement Time', value: '1.8s' },
      { label: 'Approval Rate', value: '99.4%' },
    ],
    records: [
      { id: 'hpay-001', sender: 'Global Retail LLC', receiver: 'HARVICS Holdings', amount: 12500, currency: 'USD', rail: 'HPay', status: 'Settled', at: today() },
    ] },

  7: { id: 7, name: 'Financial Planning', band: 'Finance & Controlling',
    summary: [
      { label: 'Plans Active', value: '7' },
      { label: 'Re-forecasts', value: '3 this Q' },
      { label: 'FY Outlook', value: '+8.4%' },
    ],
    records: [
      { id: 'fp-001', name: 'FY2026 Base Plan', revenue: 14_500_000, ebitda: 2_300_000, currency: 'USD', confidence: 78, status: 'Locked' },
    ] },

  9: { id: 9, name: 'CPQ Engine', band: 'Commercial & Sales',
    summary: [
      { label: 'Quotes (MTD)', value: '142' },
      { label: 'Win Rate', value: '34%' },
      { label: 'Avg Discount', value: '8.2%' },
    ],
    records: [
      { id: 'cpq-001', customer: 'Emirates Trade Co', sku: 'FMCG-001', qty: 500, listPrice: 12.5, finalPrice: 11.25, marginPct: 28, status: 'Sent' },
    ] },

  15: { id: 15, name: 'Contract Lifecycle', band: 'Procurement & Sourcing',
    summary: [
      { label: 'Active', value: '63' },
      { label: 'Expiring 90d', value: '11' },
      { label: 'In Review', value: '4' },
    ],
    records: [
      { id: 'clm-001', counterparty: 'Atlas Logistics', type: 'Supply', value: 480000, currency: 'USD', expires: '2027-03-31', status: 'Active' },
    ] },

  16: { id: 16, name: 'Sourcing Network', band: 'Procurement & Sourcing',
    summary: [
      { label: 'Suppliers', value: '218' },
      { label: 'Qualified', value: '167' },
      { label: 'RFQs Open', value: '9' },
    ],
    records: [
      { id: 'src-001', supplier: 'Nile Packaging', region: 'EG', category: 'Packaging', rating: 4.6, status: 'Preferred' },
    ] },

  18: { id: 18, name: 'Shop Floor Control', band: 'Manufacturing',
    summary: [
      { label: 'Active Lines', value: '6' },
      { label: 'OEE', value: '82.3%' },
      { label: 'Downtime (h)', value: '4.1' },
    ],
    records: [
      { line: 'Line-A', shift: 'Shift-2', output: 18450, defects: 32, oee: 84.2, status: 'Running' },
    ] },

  19: { id: 19, name: 'Bill of Materials', band: 'Manufacturing',
    summary: [
      { label: 'BOMs', value: '94' },
      { label: 'Components', value: '1,247' },
      { label: 'Versions', value: '3 avg' },
    ],
    records: [
      { sku: 'FMCG-001', version: 'v3', components: 7, totalCost: 4.85, currency: 'USD', status: 'Released' },
    ] },

  21: { id: 21, name: 'Recipe Management', band: 'Manufacturing',
    summary: [
      { label: 'Recipes', value: '38' },
      { label: 'Approved', value: '34' },
      { label: 'Yield Avg', value: '96.8%' },
    ],
    records: [
      { id: 'rcp-001', product: 'Beverage Mix A', batchSize: 1000, unit: 'L', yieldPct: 97.2, status: 'Approved' },
    ] },

  23: { id: 23, name: 'Warehouse Management', band: 'Inventory & Warehouse',
    summary: [
      { label: 'Warehouses', value: '14' },
      { label: 'Utilization', value: '71%' },
      { label: 'Pick Accuracy', value: '99.6%' },
    ],
    records: [
      { code: 'WH-DXB-01', city: 'Dubai', utilization: 78, capacity: 12000, status: 'Active' },
    ] },

  24: { id: 24, name: 'Demand Planning', band: 'Inventory & Warehouse',
    summary: [
      { label: 'SKUs Tracked', value: '847' },
      { label: 'Forecast Accuracy', value: '88.4%' },
      { label: 'Stockouts (30d)', value: '12' },
    ],
    records: [
      { sku: 'FMCG-001', territory: 'AE', forecast: 14500, baseline: 13800, confidence: 0.82, period: 'Q2 2026' },
    ] },

  28: { id: 28, name: '3PL Integration', band: 'Logistics & Trade',
    summary: [
      { label: '3PL Partners', value: '11' },
      { label: 'Shipments Active', value: '236' },
      { label: 'On-Time %', value: '94.1%' },
    ],
    records: [
      { id: '3pl-001', partner: 'Aramex', lane: 'AE→PK', shipments30d: 84, otp: 95.2, costPerKg: 2.4 },
    ] },

  30: { id: 30, name: 'Talent Acquisition', band: 'Human Capital',
    summary: [
      { label: 'Open Reqs', value: '23' },
      { label: 'Time-to-Hire', value: '38d' },
      { label: 'Offer Accept', value: '82%' },
    ],
    records: [
      { id: 'req-001', role: 'Sales Manager — MENA', dept: 'Commercial', stage: 'Interview', candidates: 7, opened: '2026-04-12' },
    ] },

  31: { id: 31, name: 'Learning Management', band: 'Human Capital',
    summary: [
      { label: 'Courses', value: '142' },
      { label: 'Completion %', value: '76%' },
      { label: 'Certifications', value: '38' },
    ],
    records: [
      { id: 'lrn-001', title: 'GDPR Essentials', mandatory: true, completedPct: 84, dueDate: '2026-07-01' },
    ] },

  32: { id: 32, name: 'Performance & Succession', band: 'Human Capital',
    summary: [
      { label: 'Reviews YTD', value: '312' },
      { label: 'High Performers', value: '47' },
      { label: 'Succession Slots', value: '18' },
    ],
    records: [
      { id: 'perf-001', employeeId: 'emp-002', rating: 4.6, potential: 'High', nextRole: 'Sales Director', readiness: '12m' },
    ] },

  33: { id: 33, name: 'Workforce Planning', band: 'Human Capital',
    summary: [
      { label: 'Headcount', value: '417' },
      { label: 'Open Roles', value: '23' },
      { label: 'Attrition (YTD)', value: '8.2%' },
    ],
    records: [
      { dept: 'Commercial', headcount: 124, target: 138, gap: 14, fillPlanQuarter: 'Q3 2026' },
    ] },

  35: { id: 35, name: 'Plant Maintenance', band: 'Asset & Maintenance',
    summary: [
      { label: 'Assets Tracked', value: '624' },
      { label: 'MTBF (h)', value: '847' },
      { label: 'Pending WOs', value: '17' },
    ],
    records: [
      { wo: 'WO-2026-0142', asset: 'Production Line A', type: 'Preventive', due: '2026-06-01', priority: 'Medium', status: 'Scheduled' },
    ] },

  36: { id: 36, name: 'Real Estate & Facilities', band: 'Asset & Maintenance',
    summary: [
      { label: 'Sites', value: '24' },
      { label: 'Sq Ft', value: '482k' },
      { label: 'Lease Expiring', value: '3' },
    ],
    records: [
      { id: 'fac-001', name: 'Dubai HQ', city: 'Dubai', sqft: 50000, utilizationPct: 72, leaseExpires: '2028-12-31', status: 'Active' },
    ] },

  41: { id: 41, name: 'BI & Reporting', band: 'Analytics & Intelligence',
    summary: [
      { label: 'Dashboards', value: '38' },
      { label: 'Reports/day', value: '142' },
      { label: 'Active Users', value: '94' },
    ],
    records: [
      { id: 'bi-001', name: 'Global Sales Pulse', type: 'Operational', period: 'Daily', views30d: 1247, status: 'Ready' },
    ] },

  42: { id: 42, name: 'Board Pack Generator', band: 'Analytics & Intelligence',
    summary: [
      { label: 'Packs YTD', value: '12' },
      { label: 'Avg Pages', value: '47' },
      { label: 'AI Sections', value: '8' },
    ],
    records: [
      { id: 'bp-001', name: 'May 2026 Board Pack', period: 'May 2026', pages: 52, status: 'Distributed', generatedAt: today() },
    ] },

  44: { id: 44, name: 'AI Variance Commentary', band: 'Analytics & Intelligence',
    summary: [
      { label: 'Commentaries', value: '184' },
      { label: 'Avg Confidence', value: '0.79' },
      { label: 'Actioned %', value: '62%' },
    ],
    records: [
      { id: 'var-001', metric: 'Gross Margin', planned: 32.4, actual: 29.8, deltaPct: -8.0, narrative: 'Higher input costs in Q2 driven by oil prices.', confidence: 0.81 },
    ] },

  46: { id: 46, name: 'Service Management', band: 'Projects & Services',
    summary: [
      { label: 'Open Tickets', value: '47' },
      { label: 'MTTR (h)', value: '6.4' },
      { label: 'CSAT', value: '4.6/5' },
    ],
    records: [
      { id: 'tkt-001', subject: 'Distributor portal slow loading', priority: 'Medium', sla: '4h', status: 'In Progress' },
    ] },

  47: { id: 47, name: 'Professional Services', band: 'Projects & Services',
    summary: [
      { label: 'Active Engagements', value: '14' },
      { label: 'Utilization', value: '78%' },
      { label: 'Backlog (USD)', value: '$2.4M' },
    ],
    records: [
      { id: 'psa-001', client: 'Atlas Trade', engagement: 'ERP Migration', billable: 480, recognized: 192000, currency: 'USD', status: 'On Track' },
    ] },

  54: { id: 54, name: 'Integration Bus', band: 'Platform & Infrastructure',
    summary: [
      { label: 'Connectors', value: '23' },
      { label: 'Events/min', value: '1,847' },
      { label: 'Error Rate', value: '0.04%' },
    ],
    records: [
      { id: 'int-001', source: 'SAP S/4', target: 'HARVICS GL', topic: 'finance.journal.posted', tps: 142, status: 'Healthy' },
    ] },

  57: { id: 57, name: 'Harvoice', band: 'Data & AI',
    summary: [
      { label: 'Voice Sessions', value: '4,217' },
      { label: 'Languages', value: '47' },
      { label: 'Avg Length', value: '2m 14s' },
    ],
    records: [
      { id: 'voice-001', user: 'CEO', intent: 'KPI query — MENA revenue', locale: 'en-US', durationSec: 38, status: 'Completed' },
    ] },

  59: { id: 59, name: 'FunFeed', band: 'HARVICS Universe',
    summary: [
      { label: 'Posts/day', value: '847' },
      { label: 'DAU', value: '12,420' },
      { label: 'Engagement', value: '6.8%' },
    ],
    records: [
      { id: 'post-001', author: 'fmcg-distributor-001', text: 'Hit 120% of Q2 quota!', likes: 142, comments: 18, at: today() },
    ] },

  60: { id: 60, name: 'Harvics Mall', band: 'HARVICS Universe',
    summary: [
      { label: 'Listings', value: '38,420' },
      { label: 'GMV (30d)', value: 'USD 1.2M' },
      { label: 'Conv Rate', value: '3.4%' },
    ],
    records: [
      { sku: 'MALL-FMCG-001', title: 'Premium Beverage Mix 1L', price: 12.5, currency: 'USD', stock: 4250, rating: 4.6 },
    ] },

  61: { id: 61, name: 'Trade Floor', band: 'HARVICS Universe',
    summary: [
      { label: 'Listings', value: '142' },
      { label: 'Bids Active', value: '38' },
      { label: 'Cleared (30d)', value: 'USD 880k' },
    ],
    records: [
      { id: 'lot-001', commodity: 'Wheat', grade: 'A', qty: 250, unit: 'MT', bestBid: 320, currency: 'USD', status: 'Open' },
    ] },

  62: { id: 62, name: 'Playroom', band: 'HARVICS Universe',
    summary: [
      { label: 'Games', value: '14' },
      { label: 'DAU', value: '3,840' },
      { label: 'Tournaments', value: '6' },
    ],
    records: [
      { id: 'game-001', name: 'TradeRunner', players24h: 1240, avgSession: '8m', status: 'Live' },
    ] },

  63: { id: 63, name: 'Experts Hub', band: 'HARVICS Universe',
    summary: [
      { label: 'Experts', value: '218' },
      { label: 'Bookings (30d)', value: '94' },
      { label: 'Avg Rating', value: '4.8/5' },
    ],
    records: [
      { id: 'exp-001', name: 'Dr. Aisha Khan', specialty: 'FMCG Strategy', rate: 250, currency: 'USD/hr', rating: 4.9 },
    ] },

  64: { id: 64, name: 'Jobs + Travel', band: 'HARVICS Universe',
    summary: [
      { label: 'Open Jobs', value: '142' },
      { label: 'Travel Listings', value: '38' },
      { label: 'Applications', value: '1,247' },
    ],
    records: [
      { id: 'job-001', title: 'Field Sales — Karachi', employer: 'HARVICS PK', type: 'FT', salary: '$1,800/mo', applicants: 47 },
    ] },

  65: { id: 65, name: 'Crypto Lite', band: 'HARVICS Universe',
    summary: [
      { label: 'Markets', value: '24' },
      { label: 'Volume 24h', value: 'USD 4.8M' },
      { label: 'Active Wallets', value: '8,420' },
    ],
    records: [
      { pair: 'HVC/USDT', last: 1.84, change24h: 4.2, volume: 1_200_000, high: 1.92, low: 1.74 },
    ] },

  66: { id: 66, name: 'Harvicoins', band: 'HARVICS Universe',
    summary: [
      { label: 'Holders', value: '14,820' },
      { label: 'Circulating', value: '42.1M HVC' },
      { label: 'Burn (30d)', value: '184k HVC' },
    ],
    records: [
      { wallet: '0xA1...e7', balance: 12480, rank: 47, tier: 'Gold', status: 'Active' },
    ] },

  67: { id: 67, name: 'HPay Wallet', band: 'HARVICS Universe',
    summary: [
      { label: 'Wallets', value: '24,180' },
      { label: 'Volume 30d', value: 'USD 12.4M' },
      { label: 'Avg Tx', value: 'USD 84' },
    ],
    records: [
      { id: 'wlt-001', user: 'distributor-001', balance: 4250, currency: 'USD', lastTx: today(), status: 'Active' },
    ] },

  68: { id: 68, name: 'Circle Referral', band: 'HARVICS Universe',
    summary: [
      { label: 'Referrers', value: '3,420' },
      { label: 'Conversions', value: '1,184' },
      { label: 'Paid Out', value: 'USD 47k' },
    ],
    records: [
      { id: 'ref-001', referrer: 'user-018', invited: 24, converted: 11, earnings: 540, currency: 'USD', tier: 'Silver' },
    ] },

  69: { id: 69, name: 'Customer Portal', band: 'Portals',
    summary: [
      { label: 'Customers Active', value: '4,820' },
      { label: 'Self-Service %', value: '72%' },
      { label: 'CSAT', value: '4.7/5' },
    ],
    records: [
      { id: 'cust-001', name: 'Global Retail LLC', segment: 'Distributor', country: 'AE', lastLogin: today(), orders: 47 },
    ] },

  70: { id: 70, name: 'Vendor Portal', band: 'Portals',
    summary: [
      { label: 'Vendors Active', value: '218' },
      { label: 'POs Open', value: '94' },
      { label: 'Invoices Pending', value: '38' },
    ],
    records: [
      { id: 'vnd-001', name: 'Atlas Logistics', category: 'Logistics', poOpen: 4, invoicesPending: 2, lastActivity: today() },
    ] },

  71: { id: 71, name: 'Field Officer Portal', band: 'Portals',
    summary: [
      { label: 'Field Officers', value: '94' },
      { label: 'Visits Today', value: '482' },
      { label: 'Geo-Tagged %', value: '98.4%' },
    ],
    records: [
      { id: 'fo-001', name: 'Omar Farouk', territory: 'AE', visitsToday: 12, samplesCollected: 47, locationLast: today() },
    ] },
};

export const stubCatalogRouter = Router();

stubCatalogRouter.get('/stub/:id', (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1 || id > 71) {
    return res.status(400).json({ success: false, error: 'Invalid module id (must be 1..71)' });
  }
  const seed = STUB_CATALOG[id];
  if (!seed) {
    return res.status(404).json({
      success: false,
      error: 'Module not in stub catalog. It may already be promoted to demo or live.',
      moduleId: id,
    });
  }
  return res.json({ success: true, data: seed });
});

stubCatalogRouter.get('/stub', (_req: Request, res: Response) => {
  const ids = Object.keys(STUB_CATALOG).map(Number).sort((a, b) => a - b);
  return res.json({ success: true, data: ids, total: ids.length });
});
