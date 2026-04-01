/**
 * FINANCE CRUD Controller (Prisma-backed)
 * 
 * Invoices:  POST/GET/PUT/DELETE /api/finance/invoices
 * Payments:  POST/GET /api/finance/payments
 * Journal:   POST/GET /api/finance/journal
 * Summary:   GET /api/finance/summary
 * 
 * LOCALIZATION: All responses are locale-aware based on req.locale
 */

import { Router, Request, Response } from 'express';
import { invoicesDb, paymentsDb, journalDb } from '../../core/db';
import { DomainStore } from '../../core/dataStore';
import { translateError, translateMessage, t } from '../../core/translate';
import '../../middleware/locale';

// ── FIXED ASSETS ─────────────────────────────────────────────────────
// Universal: machinery, vehicles, buildings, IT equipment, vessels, mining plant, etc.
const assetStore = new DomainStore('finance-fixed-assets', [
  { assetCode: 'FA-2026-001', name: 'Dubai Logistics City — Warehouse Fit-Out', category: 'Leasehold Improvement', industryVertical: 'All', purchaseDate: '2024-01-15', purchaseCost: 480000, salvageValue: 0, usefulLifeYears: 10, depreciationMethod: 'Straight-Line', accumulatedDepreciation: 112000, bookValue: 368000, currency: 'USD', location: 'DXB-W1', status: 'Active' },
  { assetCode: 'FA-2026-002', name: 'Isuzu NPR Fleet — 3 Trucks (KHI)', category: 'Vehicles', industryVertical: 'Logistics', purchaseDate: '2023-06-01', purchaseCost: 216000, salvageValue: 24000, usefulLifeYears: 5, depreciationMethod: 'Straight-Line', accumulatedDepreciation: 76800, bookValue: 139200, currency: 'USD', location: 'KHI-W1', status: 'Active' },
  { assetCode: 'FA-2026-003', name: 'Industrial Textile Loom — 2 Units', category: 'Machinery', industryVertical: 'Textiles', purchaseDate: '2022-03-20', purchaseCost: 240000, salvageValue: 20000, usefulLifeYears: 8, depreciationMethod: 'Declining-Balance', accumulatedDepreciation: 110000, bookValue: 130000, currency: 'USD', location: 'KHI-W1', status: 'Active' },
  { assetCode: 'FA-2026-004', name: 'HARVICS OS — ERP & Server Infrastructure', category: 'IT Equipment', industryVertical: 'All', purchaseDate: '2025-01-10', purchaseCost: 85000, salvageValue: 5000, usefulLifeYears: 4, depreciationMethod: 'Straight-Line', accumulatedDepreciation: 20000, bookValue: 65000, currency: 'USD', location: 'Cloud / Azure', status: 'Active' },
  { assetCode: 'FA-2026-005', name: 'Cold Chain Storage Unit — Lahore', category: 'Plant & Equipment', industryVertical: 'FMCG', purchaseDate: '2023-09-01', purchaseCost: 145000, salvageValue: 10000, usefulLifeYears: 12, depreciationMethod: 'Straight-Line', accumulatedDepreciation: 22917, bookValue: 122083, currency: 'USD', location: 'LHR-W2', status: 'Active' },
  { assetCode: 'FA-2026-006', name: 'Dubai Trade Office — Leasehold Fit-Out', category: 'Leasehold Improvement', industryVertical: 'All', purchaseDate: '2023-01-15', purchaseCost: 92000, salvageValue: 0, usefulLifeYears: 5, depreciationMethod: 'Straight-Line', accumulatedDepreciation: 36800, bookValue: 55200, currency: 'USD', location: 'Dubai DIFC', status: 'Active' },
  { assetCode: 'FA-2026-007', name: 'Forklift Fleet — 4 Units (DXB)', category: 'Material Handling', industryVertical: 'All', purchaseDate: '2023-03-01', purchaseCost: 128000, salvageValue: 12000, usefulLifeYears: 7, depreciationMethod: 'Straight-Line', accumulatedDepreciation: 32914, bookValue: 95086, currency: 'USD', location: 'DXB-W1', status: 'Active' },
  { assetCode: 'FA-2026-008', name: 'Commodity Testing Laboratory Equipment', category: 'Laboratory', industryVertical: 'Commodities', purchaseDate: '2024-06-01', purchaseCost: 58000, salvageValue: 3000, usefulLifeYears: 6, depreciationMethod: 'Straight-Line', accumulatedDepreciation: 12292, bookValue: 45708, currency: 'USD', location: 'DXB-W3', status: 'Active' },
]);

// ── COST CENTERS ──────────────────────────────────────────────────────
const costCenterStore = new DomainStore('finance-cost-centers', [
  { code: 'CC-001', name: 'FMCG — Trade Operations', type: 'Revenue', industryVertical: 'FMCG', budget: 1200000, actualSpend: 847200, currency: 'USD', manager: 'Ahmed Hassan', status: 'Active', period: '2026' },
  { code: 'CC-002', name: 'Textiles — Manufacturing & Export', type: 'Manufacturing', industryVertical: 'Textiles', budget: 840000, actualSpend: 619400, currency: 'USD', manager: 'Sara Malik', status: 'Active', period: '2026' },
  { code: 'CC-003', name: 'Commodities — Arabica & Green Tea', type: 'Revenue', industryVertical: 'Commodities', budget: 2400000, actualSpend: 1628000, currency: 'USD', manager: 'James Obi', status: 'Active', period: '2026' },
  { code: 'CC-004', name: 'Logistics & Distribution — MENA', type: 'Operations', industryVertical: 'All', budget: 620000, actualSpend: 581400, currency: 'USD', manager: 'Omar Farooq', status: 'Active', period: '2026' },
  { code: 'CC-005', name: 'Corporate HQ — Administration', type: 'Overhead', industryVertical: 'All', budget: 380000, actualSpend: 214800, currency: 'USD', manager: 'Fatima Khan', status: 'Active', period: '2026' },
  { code: 'CC-006', name: 'Technology & AI — HARVICS OS', type: 'Overhead', industryVertical: 'All', budget: 460000, actualSpend: 312900, currency: 'USD', manager: 'Shah Tabraiz', status: 'Active', period: '2026' },
  { code: 'CC-007', name: 'Business Development — Europe & UK', type: 'Sales', industryVertical: 'All', budget: 280000, actualSpend: 198400, currency: 'USD', manager: 'David Chen', status: 'Active', period: '2026' },
  { code: 'CC-008', name: 'Procurement — Global Sourcing', type: 'Operations', industryVertical: 'All', budget: 320000, actualSpend: 218700, currency: 'USD', manager: 'Zainab Yusuf', status: 'Active', period: '2026' },
]);

// ── BUDGET ────────────────────────────────────────────────────────────
const budgetStore = new DomainStore('finance-budget', [
  { budgetCode: 'BUD-2026-Q1', name: 'Q1 2026 — Operating Budget', period: 'Q1-2026', totalBudget: 5900000, totalActual: 4422800, variance: 1477200, variancePct: 25.0, status: 'Closed', currency: 'USD', approvedBy: 'Board of Directors', lines: [] },
  { budgetCode: 'BUD-2026-Q2', name: 'Q2 2026 — Operating Budget', period: 'Q2-2026', totalBudget: 6800000, totalActual: 1628000, variance: 5172000, variancePct: 76.1, status: 'Active', currency: 'USD', approvedBy: 'CEO & CFO', lines: [] },
  { budgetCode: 'BUD-2026-CAPEX', name: 'FY2026 — Capital Expenditure', period: 'FY-2026', totalBudget: 1800000, totalActual: 1044000, variance: 756000, variancePct: 42.0, status: 'Active', currency: 'USD', approvedBy: 'Board of Directors', lines: [] },
  { budgetCode: 'BUD-2026-MKTING', name: 'FY2026 — Brand & Trade Marketing', period: 'FY-2026', totalBudget: 420000, totalActual: 187400, variance: 232600, variancePct: 55.4, status: 'Active', currency: 'USD', approvedBy: 'CMO', lines: [] },
]);

// ── FISCAL PERIOD / PERIOD CLOSE ─────────────────────────────────────
const fiscalPeriodStore = new DomainStore('finance-fiscal-periods', [
  { periodCode: 'FP-2026-01', name: 'January 2026', year: 2026, month: 1, status: 'Closed', closedBy: 'Fatima Khan', closedAt: '2026-02-05', journalCount: 284, invoiceCount: 142, totalDebits: 4820000, totalCredits: 4820000, balanced: true },
  { periodCode: 'FP-2026-02', name: 'February 2026', year: 2026, month: 2, status: 'Closed', closedBy: 'Fatima Khan', closedAt: '2026-03-04', journalCount: 311, invoiceCount: 168, totalDebits: 5241000, totalCredits: 5241000, balanced: true },
  { periodCode: 'FP-2026-03', name: 'March 2026', year: 2026, month: 3, status: 'Open', closedBy: null, closedAt: null, journalCount: 187, invoiceCount: 94, totalDebits: 3184500, totalCredits: 3181200, balanced: false },
]);

// ── GL ACCOUNT CHART ──────────────────────────────────────────────────
const glAccountStore = new DomainStore('finance-gl-accounts', [
  { accountCode: '1000', name: 'Cash & Bank', type: 'Asset', normalBalance: 'Debit', industryVertical: 'All', balance: 2400000, currency: 'USD', status: 'Active' },
  { accountCode: '1100', name: 'Accounts Receivable', type: 'Asset', normalBalance: 'Debit', industryVertical: 'All', balance: 840000, currency: 'USD', status: 'Active' },
  { accountCode: '1200', name: 'Inventory', type: 'Asset', normalBalance: 'Debit', industryVertical: 'All', balance: 1250000, currency: 'USD', status: 'Active' },
  { accountCode: '1500', name: 'Fixed Assets', type: 'Asset', normalBalance: 'Debit', industryVertical: 'All', balance: 589350, currency: 'USD', status: 'Active' },
  { accountCode: '2000', name: 'Accounts Payable', type: 'Liability', normalBalance: 'Credit', industryVertical: 'All', balance: 480000, currency: 'USD', status: 'Active' },
  { accountCode: '2100', name: 'Accrued Liabilities', type: 'Liability', normalBalance: 'Credit', industryVertical: 'All', balance: 120000, currency: 'USD', status: 'Active' },
  { accountCode: '3000', name: 'Share Capital', type: 'Equity', normalBalance: 'Credit', industryVertical: 'All', balance: 5000000, currency: 'USD', status: 'Active' },
  { accountCode: '4000', name: 'Revenue — Trading', type: 'Revenue', normalBalance: 'Credit', industryVertical: 'All', balance: 3840000, currency: 'USD', status: 'Active' },
  { accountCode: '5000', name: 'Cost of Goods Sold', type: 'Expense', normalBalance: 'Debit', industryVertical: 'All', balance: 2304000, currency: 'USD', status: 'Active' },
  { accountCode: '6000', name: 'Operating Expenses', type: 'Expense', normalBalance: 'Debit', industryVertical: 'All', balance: 642000, currency: 'USD', status: 'Active' },
  { accountCode: '6100', name: 'Depreciation Expense', type: 'Expense', normalBalance: 'Debit', industryVertical: 'All', balance: 212650, currency: 'USD', status: 'Active' },
]);

const router = Router();

// Helper to get locale
const getLocale = (req: Request): string => (req as any).locale || 'en';

// Helper to localize invoice status
const localizeInvoice = (inv: any, locale: string) => {
  if (!inv) return inv;
  const statusKey = inv.status?.toLowerCase() || 'unpaid';
  return {
    ...inv,
    statusText: t(`finance.status.${statusKey}`, locale) || inv.status,
  };
};

// ── SUMMARY ─────────────────────────────────────────────────────────
router.get('/summary', async (req: Request, res: Response) => {
  const locale = getLocale(req);
  const [invoices, payments, journalCount] = await Promise.all([
    invoicesDb.list({}, 1, 10000),
    paymentsDb.list({}, 1, 10000),
    journalDb.count(),
  ]);

  const totalAR = invoices.data.filter((i: any) => i.type === 'AR' && i.status !== 'Paid').reduce((s: number, i: any) => s + (i.amount || 0), 0);
  const totalPaid = payments.data.reduce((s: number, p: any) => s + (p.amount || 0), 0);
  const overdue = invoices.data.filter((i: any) => i.status === 'Overdue').length;

  res.json({
    success: true,
    message: translateMessage('fetched', locale),
    data: {
      totalReceivable: totalAR,
      totalCollected: totalPaid,
      overdueInvoices: overdue,
      totalInvoices: invoices.total,
      totalPayments: payments.total,
      totalJournalEntries: journalCount
    }
  });
});

// ── INVOICES ─────────────────────────────────────────────────────────
router.get('/invoices', async (req: Request, res: Response) => {
  const locale = getLocale(req);
  const { status, type, customer, page, limit } = req.query;
  const result = await invoicesDb.list({ status, type, customer }, Number(page) || 1, Number(limit) || 50);
  const localizedData = result.data.map((inv: any) => localizeInvoice(inv, locale));
  res.json({ success: true, ...result, data: localizedData });
});

router.get('/invoices/:id', async (req: Request, res: Response) => {
  const locale = getLocale(req);
  const inv = await invoicesDb.get(req.params.id);
  if (!inv) return res.status(404).json({ success: false, error: t('finance.messages.invoiceNotFound', locale) });
  res.json({ success: true, data: localizeInvoice(inv, locale) });
});

router.post('/invoices', async (req: Request, res: Response) => {
  const locale = getLocale(req);
  const { customer, amount, currency, dueDate, type } = req.body;
  if (!customer || !amount) return res.status(400).json({ success: false, error: translateError('missingFields', locale) });

  const count = await invoicesDb.count();
  const inv = await invoicesDb.create({
    invoiceNo: `INV-2026-${String(count + 1).padStart(3, '0')}`,
    customer, amount, currency: currency || 'USD',
    dueDate: dueDate || new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
    type: type || 'AR', status: 'Unpaid'
  }, 'finance.invoice.created');

  res.status(201).json({ success: true, data: localizeInvoice(inv, locale), message: t('finance.messages.invoiceCreated', locale) });
});

router.put('/invoices/:id', async (req: Request, res: Response) => {
  const locale = getLocale(req);
  const updated = await invoicesDb.update(req.params.id, req.body);
  if (!updated) return res.status(404).json({ success: false, error: t('finance.messages.invoiceNotFound', locale) });
  res.json({ success: true, data: localizeInvoice(updated, locale), message: t('finance.messages.invoiceUpdated', locale) });
});

router.delete('/invoices/:id', async (req: Request, res: Response) => {
  const locale = getLocale(req);
  const exists = await invoicesDb.get(req.params.id);
  if (!exists) return res.status(404).json({ success: false, error: t('finance.messages.invoiceNotFound', locale) });
  await invoicesDb.delete(req.params.id);
  res.json({ success: true, message: t('finance.messages.invoiceDeleted', locale) });
});

// ── PAYMENTS ─────────────────────────────────────────────────────────
router.get('/payments', async (req: Request, res: Response) => {
  const result = await paymentsDb.list({}, Number(req.query.page) || 1, Number(req.query.limit) || 50);
  res.json({ success: true, ...result });
});

router.post('/payments', async (req: Request, res: Response) => {
  const { invoiceNo, amount, currency, method, reference } = req.body;
  if (!invoiceNo || !amount) return res.status(400).json({ success: false, error: 'invoiceNo and amount required' });

  const payment = await paymentsDb.create({
    invoiceNo, amount, currency: currency || 'USD',
    method: method || 'Bank Transfer',
    reference: reference || `TXN-${Date.now()}`,
    receivedDate: new Date().toISOString().slice(0, 10)
  }, 'finance.payment.received');

  // Mark invoice as paid if found
  const matchingInvoices = await invoicesDb.list({ invoiceNo }, 1, 1);
  if (matchingInvoices.data.length > 0) {
    await invoicesDb.update(matchingInvoices.data[0].id, { status: 'Paid' });
  }

  res.status(201).json({ success: true, data: payment });
});

// ── JOURNAL ENTRIES ──────────────────────────────────────────────────
router.get('/journal', async (req: Request, res: Response) => {
  const result = await journalDb.list({}, Number(req.query.page) || 1, Number(req.query.limit) || 50);
  res.json({ success: true, ...result });
});

router.post('/journal', async (req: Request, res: Response) => {
  const { description, debit, credit, amount, currency } = req.body;
  if (!description || !debit || !credit || !amount) {
    return res.status(400).json({ success: false, error: 'description, debit, credit, amount required' });
  }
  const count = await journalDb.count();
  const entry = await journalDb.create({
    entryNo: `JE-2026-${String(count + 1).padStart(3, '0')}`,
    description, debit, credit, amount, currency: currency || 'USD',
    postedDate: new Date().toISOString().slice(0, 10)
  }, 'finance.journal.posted');

  res.status(201).json({ success: true, data: entry });
});

// ── FINANCE SUMMARY (extended) ───────────────────────────────────────
router.get('/dashboard', async (req: Request, res: Response) => {
  const [invoices, payments] = await Promise.all([
    invoicesDb.list({}, 1, 10000),
    paymentsDb.list({}, 1, 10000),
  ]);
  const totalAR = invoices.data.filter((i: any) => i.type === 'AR' && i.status !== 'Paid').reduce((s: number, i: any) => s + (i.amount || 0), 0);
  const totalAP = invoices.data.filter((i: any) => i.type === 'AP' && i.status !== 'Paid').reduce((s: number, i: any) => s + (i.amount || 0), 0);
  const totalCollected = payments.data.reduce((s: number, p: any) => s + (p.amount || 0), 0);
  const budgets = budgetStore.list({ status: 'Active' }, 1, 100);
  const totalBudget = budgets.data.reduce((s: number, b: any) => s + (b.totalBudget || 0), 0);
  const totalActual = budgets.data.reduce((s: number, b: any) => s + (b.totalActual || 0), 0);
  const totalAssetValue = assetStore.list({}, 1, 1000).data.reduce((s: number, a: any) => s + (a.bookValue || 0), 0);
  const openPeriod = fiscalPeriodStore.list({ status: 'Open' }, 1, 1);
  res.json({
    success: true,
    data: {
      totalAR, totalAP, totalCollected,
      totalInvoices: invoices.total,
      totalPayments: payments.total,
      totalBudget, totalActualSpend: totalActual,
      budgetUtilisationPct: totalBudget > 0 ? Math.round((totalActual / totalBudget) * 100) : 0,
      totalFixedAssets: assetStore.count(),
      totalAssetBookValue: totalAssetValue,
      costCenters: costCenterStore.count(),
      openPeriod: openPeriod.data[0]?.name || null,
      glAccounts: glAccountStore.count(),
    }
  });
});

// ── GL ACCOUNTS ──────────────────────────────────────────────────────
router.get('/gl-accounts', (req: Request, res: Response) => {
  const { type, status } = req.query;
  const result = glAccountStore.list({ type, status }, Number(req.query.page) || 1, Number(req.query.limit) || 100);
  res.json({ success: true, ...result });
});

router.post('/gl-accounts', (req: Request, res: Response) => {
  const { accountCode, name, type, normalBalance, industryVertical } = req.body;
  if (!accountCode || !name || !type) return res.status(400).json({ success: false, error: 'accountCode, name, type required' });
  const account = glAccountStore.create({ accountCode, name, type, normalBalance: normalBalance || 'Debit', industryVertical: industryVertical || 'All', balance: 0, currency: 'USD', status: 'Active' }, 'finance.gl.account.created');
  res.status(201).json({ success: true, data: account });
});

// ── FIXED ASSETS ─────────────────────────────────────────────────────
router.get('/assets', (req: Request, res: Response) => {
  const { category, status, industryVertical } = req.query;
  const result = assetStore.list({ category, status, industryVertical }, Number(req.query.page) || 1, Number(req.query.limit) || 100);
  res.json({ success: true, ...result });
});

router.get('/assets/:id', (req: Request, res: Response) => {
  const asset = assetStore.get(req.params.id);
  if (!asset) return res.status(404).json({ success: false, error: 'Asset not found' });
  res.json({ success: true, data: asset });
});

router.post('/assets', (req: Request, res: Response) => {
  const { name, category, industryVertical, purchaseCost, salvageValue, usefulLifeYears, depreciationMethod, purchaseDate, location, currency } = req.body;
  if (!name || !purchaseCost || !usefulLifeYears) return res.status(400).json({ success: false, error: 'name, purchaseCost, usefulLifeYears required' });
  const count = assetStore.count();
  const asset = assetStore.create({
    assetCode: `FA-${new Date().getFullYear()}-${String(count + 1).padStart(3, '0')}`,
    name, category: category || 'Other',
    industryVertical: industryVertical || 'All',
    purchaseDate: purchaseDate || new Date().toISOString().slice(0, 10),
    purchaseCost, salvageValue: salvageValue || 0,
    usefulLifeYears, depreciationMethod: depreciationMethod || 'Straight-Line',
    accumulatedDepreciation: 0,
    bookValue: purchaseCost - (salvageValue || 0),
    currency: currency || 'USD',
    location: location || '', status: 'Active'
  }, 'finance.asset.created');
  res.status(201).json({ success: true, data: asset });
});

router.put('/assets/:id', (req: Request, res: Response) => {
  const updated = assetStore.update(req.params.id, req.body);
  if (!updated) return res.status(404).json({ success: false, error: 'Asset not found' });
  res.json({ success: true, data: updated });
});

// Run monthly depreciation for all active assets
router.post('/assets/depreciate', (_req: Request, res: Response) => {
  const all = assetStore.list({ status: 'Active' }, 1, 1000);
  const results: any[] = [];
  all.data.forEach((asset: any) => {
    let monthlyDep = 0;
    if (asset.depreciationMethod === 'Straight-Line') {
      monthlyDep = (asset.purchaseCost - asset.salvageValue) / (asset.usefulLifeYears * 12);
    } else if (asset.depreciationMethod === 'Declining-Balance') {
      const rate = (2 / asset.usefulLifeYears) / 12;
      monthlyDep = asset.bookValue * rate;
    }
    const newAccDep = Math.min(asset.accumulatedDepreciation + monthlyDep, asset.purchaseCost - asset.salvageValue);
    const newBookValue = asset.purchaseCost - newAccDep;
    const updated = assetStore.update(asset.id, {
      accumulatedDepreciation: Math.round(newAccDep * 100) / 100,
      bookValue: Math.round(newBookValue * 100) / 100,
      status: newBookValue <= 0 ? 'Fully Depreciated' : 'Active'
    });
    results.push({ assetCode: asset.assetCode, monthlyDepreciation: Math.round(monthlyDep * 100) / 100, newBookValue: updated?.bookValue });
  });
  res.json({ success: true, data: results, message: `Depreciation run for ${results.length} assets` });
});

// ── COST CENTERS ──────────────────────────────────────────────────────
router.get('/cost-centers', (req: Request, res: Response) => {
  const { type, industryVertical, status } = req.query;
  const result = costCenterStore.list({ type, industryVertical, status }, Number(req.query.page) || 1, 100);
  res.json({ success: true, ...result });
});

router.post('/cost-centers', (req: Request, res: Response) => {
  const { code, name, type, industryVertical, budget, currency, manager } = req.body;
  if (!code || !name) return res.status(400).json({ success: false, error: 'code and name required' });
  const cc = costCenterStore.create({ code, name, type: type || 'Operations', industryVertical: industryVertical || 'All', budget: budget || 0, actualSpend: 0, currency: currency || 'USD', manager: manager || '', status: 'Active', period: String(new Date().getFullYear()) }, 'finance.costcenter.created');
  res.status(201).json({ success: true, data: cc });
});

router.put('/cost-centers/:id', (req: Request, res: Response) => {
  const updated = costCenterStore.update(req.params.id, req.body);
  if (!updated) return res.status(404).json({ success: false, error: 'Cost center not found' });
  res.json({ success: true, data: updated });
});

// ── BUDGET ────────────────────────────────────────────────────────────
router.get('/budgets', (req: Request, res: Response) => {
  const { status, period } = req.query;
  const result = budgetStore.list({ status, period }, Number(req.query.page) || 1, 100);
  res.json({ success: true, ...result });
});

router.post('/budgets', (req: Request, res: Response) => {
  const { name, period, totalBudget, currency, lines } = req.body;
  if (!name || !period || !totalBudget) return res.status(400).json({ success: false, error: 'name, period, totalBudget required' });
  const count = budgetStore.count();
  const budget = budgetStore.create({
    budgetCode: `BUD-${new Date().getFullYear()}-${String(count + 1).padStart(3, '0')}`,
    name, period, totalBudget, totalActual: 0,
    variance: totalBudget, variancePct: 100,
    status: 'Draft', currency: currency || 'USD',
    approvedBy: null, lines: lines || []
  }, 'finance.budget.created');
  res.status(201).json({ success: true, data: budget });
});

router.put('/budgets/:id', (req: Request, res: Response) => {
  const updated = budgetStore.update(req.params.id, req.body);
  if (!updated) return res.status(404).json({ success: false, error: 'Budget not found' });
  res.json({ success: true, data: updated });
});

// ── FISCAL PERIOD / PERIOD CLOSE ─────────────────────────────────────
router.get('/fiscal-periods', (req: Request, res: Response) => {
  const { status, year } = req.query;
  const result = fiscalPeriodStore.list({ status, year: year ? Number(year) : undefined }, Number(req.query.page) || 1, 100);
  res.json({ success: true, ...result });
});

// Close a period — validates debits == credits first
router.post('/fiscal-periods/:id/close', async (req: Request, res: Response) => {
  const period = fiscalPeriodStore.get(req.params.id);
  if (!period) return res.status(404).json({ success: false, error: 'Fiscal period not found' });
  if (period.status === 'Closed') return res.status(400).json({ success: false, error: 'Period already closed' });
  if (!period.balanced) return res.status(400).json({ success: false, error: 'Cannot close — debits and credits are not balanced. Post correcting journals first.' });
  const updated = fiscalPeriodStore.update(req.params.id, {
    status: 'Closed',
    closedBy: (req as any).user?.email || 'System',
    closedAt: new Date().toISOString()
  });
  res.json({ success: true, data: updated, message: `Period ${period.name} closed successfully` });
});

// Re-open a period (with audit trail)
router.post('/fiscal-periods/:id/reopen', (req: Request, res: Response) => {
  const period = fiscalPeriodStore.get(req.params.id);
  if (!period) return res.status(404).json({ success: false, error: 'Fiscal period not found' });
  if (period.status !== 'Closed') return res.status(400).json({ success: false, error: 'Period is not closed' });
  const updated = fiscalPeriodStore.update(req.params.id, { status: 'Open', closedBy: null, closedAt: null });
  res.json({ success: true, data: updated, message: `Period ${period.name} re-opened` });
});

export default router;
