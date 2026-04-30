import { Router, Request, Response } from 'express';
import { DomainStore } from '../../core/dataStore';

const getLocale = (req: Request): string => (req as any).locale || 'en';

const createModuleRouter = (
  moduleName: string,
  summaryBuilder: (rows: any[]) => Record<string, any>,
  seed: Record<string, any>[]
) => {
  const router = Router();
  const store = new DomainStore(moduleName, seed);

  router.get('/summary', (req: Request, res: Response) => {
    const rows = store.list({}, 1, 10000).data;
    res.json({
      success: true,
      locale: getLocale(req),
      module: moduleName,
      data: summaryBuilder(rows),
    });
  });

  router.get('/', (req: Request, res: Response) => {
    const { page, limit, q } = req.query;
    const filters = q ? { name: q } : {};
    const result = store.list(filters, Number(page) || 1, Number(limit) || 50);
    res.json({ success: true, module: moduleName, ...result });
  });

  router.get('/:id', (req: Request, res: Response) => {
    const row = store.get(req.params.id);
    if (!row) {
      return res.status(404).json({ success: false, error: `${moduleName} record not found` });
    }
    return res.json({ success: true, data: row });
  });

  router.post('/', (req: Request, res: Response) => {
    const payload = req.body || {};
    if (!payload.name) {
      return res.status(400).json({ success: false, error: 'name is required' });
    }
    const created = store.create(payload, `${moduleName}.created` as any);
    return res.status(201).json({ success: true, data: created });
  });

  router.put('/:id', (req: Request, res: Response) => {
    const updated = store.update(req.params.id, req.body || {}, `${moduleName}.updated` as any);
    if (!updated) {
      return res.status(404).json({ success: false, error: `${moduleName} record not found` });
    }
    return res.json({ success: true, data: updated });
  });

  router.delete('/:id', (req: Request, res: Response) => {
    const exists = store.get(req.params.id);
    if (!exists) {
      return res.status(404).json({ success: false, error: `${moduleName} record not found` });
    }
    store.delete(req.params.id);
    return res.json({ success: true, message: 'Deleted successfully' });
  });

  return router;
};

export const manufacturingCrudRouter = createModuleRouter(
  'manufacturing',
  (rows) => ({
    totalOrders: rows.length,
    activeOrders: rows.filter((r) => r.status === 'In Production').length,
    avgYieldPct:
      rows.length > 0
        ? Number((rows.reduce((sum, r) => sum + Number(r.yieldPct || 0), 0) / rows.length).toFixed(1))
        : 0,
    delayedOrders: rows.filter((r) => r.status === 'Delayed').length,
  }),
  [
    { name: 'PO-2026-4001', line: 'Beverages Line 1', sku: 'FMCG-012', plannedQty: 18000, completedQty: 12600, yieldPct: 93.4, status: 'In Production' },
    { name: 'PO-2026-4002', line: 'Confectionery Line 2', sku: 'FMCG-018', plannedQty: 9000, completedQty: 9000, yieldPct: 97.1, status: 'Completed' },
    { name: 'PO-2026-4003', line: 'Textile Stitching Unit A', sku: 'TEX-015', plannedQty: 4200, completedQty: 2800, yieldPct: 89.9, status: 'Delayed' },
  ]
);

export const qualityCrudRouter = createModuleRouter(
  'quality',
  (rows) => ({
    totalInspections: rows.length,
    passed: rows.filter((r) => r.decision === 'Pass').length,
    failed: rows.filter((r) => r.decision === 'Fail').length,
    passRatePct:
      rows.length > 0
        ? Number(((rows.filter((r) => r.decision === 'Pass').length / rows.length) * 100).toFixed(1))
        : 0,
  }),
  [
    { name: 'QC-2026-1001', batchNo: 'BT-2026-0001', parameter: 'Microbiology', decision: 'Pass', inspector: 'Aisha N.', severity: 'Low' },
    { name: 'QC-2026-1002', batchNo: 'BT-2026-0006', parameter: 'Expiry Integrity', decision: 'Fail', inspector: 'Yuki T.', severity: 'High' },
    { name: 'QC-2026-1003', batchNo: 'BT-2026-0004', parameter: 'Moisture Content', decision: 'Pass', inspector: 'Bilal R.', severity: 'Low' },
  ]
);

export const projectManagementCrudRouter = createModuleRouter(
  'projects',
  (rows) => ({
    totalProjects: rows.length,
    activeProjects: rows.filter((r) => r.status === 'In Progress').length,
    atRisk: rows.filter((r) => r.health === 'At Risk').length,
    completedProjects: rows.filter((r) => r.status === 'Completed').length,
  }),
  [
    { name: 'Dubai Warehouse Expansion', owner: 'Operations PMO', budget: 420000, spent: 238500, progressPct: 54, health: 'On Track', status: 'In Progress' },
    { name: 'UK Distribution Automation', owner: 'Logistics PMO', budget: 310000, spent: 120000, progressPct: 38, health: 'At Risk', status: 'In Progress' },
    { name: 'Q1 ERP Localization Rollout', owner: 'Technology PMO', budget: 140000, spent: 138000, progressPct: 100, health: 'On Track', status: 'Completed' },
  ]
);

export const biCrudRouter = createModuleRouter(
  'bi',
  (rows) => ({
    totalReports: rows.length,
    scheduledReports: rows.filter((r) => r.type === 'Scheduled').length,
    boardPackReady: rows.filter((r) => r.status === 'Ready').length,
    datasetsMonitored: 24,
  }),
  [
    { name: 'Executive Weekly Board Pack', type: 'Scheduled', owner: 'FP&A', status: 'Ready', cadence: 'Weekly' },
    { name: 'Cash Flow Forecast 13W', type: 'Ad Hoc', owner: 'Treasury Office', status: 'Draft', cadence: 'On Demand' },
    { name: 'Country P&L Variance', type: 'Scheduled', owner: 'Finance Control', status: 'Ready', cadence: 'Monthly' },
  ]
);

export const treasuryCrudRouter = createModuleRouter(
  'treasury',
  (rows) => ({
    totalAccounts: rows.length,
    activeAccounts: rows.filter((r) => r.status === 'Active').length,
    totalLiquidity:
      rows.length > 0
        ? rows.reduce((sum, r) => sum + Number(r.balance || 0), 0)
        : 0,
    fxExposures: rows.filter((r) => Number(r.fxExposure || 0) > 0).length,
  }),
  [
    { name: 'HSBC UAE Main', country: 'UAE', currency: 'USD', balance: 4820000, fxExposure: 430000, status: 'Active' },
    { name: 'Barclays UK Ops', country: 'UK', currency: 'GBP', balance: 1180000, fxExposure: 220000, status: 'Active' },
    { name: 'SCB Pakistan Settlement', country: 'Pakistan', currency: 'PKR', balance: 410000000, fxExposure: 0, status: 'Active' },
  ]
);

export const digitalFinanceCrudRouter = createModuleRouter(
  'digital-finance',
  (rows) => ({
    totalWallets: rows.length,
    activeWallets: rows.filter((r) => r.status === 'Active').length,
    totalStablecoin:
      rows.length > 0
        ? rows.filter((r) => ['USDT', 'USDC', 'DAI'].includes(String(r.asset || ''))).reduce((sum, r) => sum + Number(r.balance || 0), 0)
        : 0,
    escalatedTxns: rows.filter((r) => r.risk === 'High').length,
  }),
  [
    { name: 'HPAY-MAIN', asset: 'USDT', balance: 845200, risk: 'Low', status: 'Active' },
    { name: 'HPAY-SETTLEMENT', asset: 'USDC', balance: 322900, risk: 'Low', status: 'Active' },
    { name: 'HPAY-TRADING', asset: 'ETH', balance: 128.4, risk: 'Medium', status: 'Active' },
  ]
);

export const marketingCrudRouter = createModuleRouter(
  'marketing',
  (rows) => ({
    totalCampaigns: rows.length,
    activeCampaigns: rows.filter((r) => r.status === 'Active').length,
    avgCtrPct:
      rows.length > 0
        ? Number((rows.reduce((sum, r) => sum + Number(r.ctrPct || 0), 0) / rows.length).toFixed(2))
        : 0,
    roiPositive: rows.filter((r) => Number(r.roi || 0) > 1).length,
  }),
  [
    { name: 'FMCG Ramadan Push', channel: 'Multi-Channel', ctrPct: 5.6, roi: 2.8, status: 'Active' },
    { name: 'Textile UK Buyer Drive', channel: 'Email + LinkedIn', ctrPct: 4.1, roi: 1.9, status: 'Active' },
    { name: 'Commodity Market Pulse', channel: 'Social', ctrPct: 3.7, roi: 1.2, status: 'Planned' },
  ]
);

export const shippingTradeCrudRouter = createModuleRouter(
  'shipping-trade',
  (rows) => ({
    totalShipments: rows.length,
    inTransit: rows.filter((r) => r.status === 'In Transit').length,
    delayed: rows.filter((r) => r.status === 'Delayed').length,
    complianceClear: rows.filter((r) => r.compliance === 'Cleared').length,
  }),
  [
    { name: 'SHP-2026-7811', mode: 'Sea', incoterm: 'CIF', status: 'In Transit', compliance: 'Cleared' },
    { name: 'SHP-2026-7812', mode: 'Sea', incoterm: 'FOB', status: 'Delayed', compliance: 'Review' },
    { name: 'SHP-2026-7813', mode: 'Road', incoterm: 'DAP', status: 'In Transit', compliance: 'Cleared' },
  ]
);
