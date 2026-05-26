/**
 * HARVICS OS — Wave 3 Controller (Session 39)
 * Adds missing endpoints + workflows for the 11 incomplete modules:
 *   #1  Financial Accounting     — chart of accounts + posting periods
 *   #3  Accounts Receivable      — aging buckets (computed)
 *   #4  Accounts Payable         — 3-way match (computed)
 *   #8  CRM Pipeline             — deals + stage transitions
 *   #13 Procurement              — RFQ + responses
 *   #14 Vendor Management        — vendor scorecards
 *   #22 Inventory                — cycle count + ABC analysis (computed)
 *   #25 Fleet                    — alerts (computed from existing data)
 *   #26 Shipping & Freight       — shipments + tracking events
 *   #27 Trade & Customs          — HS codes + duty calc
 *   #29 HR Core                  — leave requests + attendance
 */
import { Request, Response, Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../core/prisma';

export const wave3Router = Router();

function zerr(err: unknown, res: Response): Response | undefined {
  if (err instanceof z.ZodError) return res.status(400).json({ success: false, error: 'validation', issues: err.issues });
  return undefined;
}

// ════════════════════════════════════════════════════════════════════════════
// #1 FINANCIAL ACCOUNTING — chart of accounts + posting periods
// ════════════════════════════════════════════════════════════════════════════
const CoAcreate = z.object({
  code: z.string().min(1).max(20),
  name: z.string().min(1).max(120),
  accountType: z.enum(['Asset', 'Liability', 'Equity', 'Revenue', 'Expense']),
  parentCode: z.string().max(20).optional().nullable(),
  active: z.boolean().default(true),
});

wave3Router.get('/coa', async (req, res) => {
  const where: any = {};
  if (req.query.type) where.accountType = String(req.query.type);
  if (req.query.active !== undefined) where.active = String(req.query.active) === 'true';
  const rows = await prisma.chartAccount.findMany({ where, orderBy: { code: 'asc' } });
  return res.json({ success: true, data: rows, total: rows.length });
});

wave3Router.get('/coa/tree', async (_req, res) => {
  const rows = await prisma.chartAccount.findMany({ orderBy: { code: 'asc' } });
  const byCode = new Map(rows.map(r => [r.code, { ...r, children: [] as any[] }]));
  const roots: any[] = [];
  byCode.forEach(node => {
    if (node.parentCode && byCode.has(node.parentCode)) byCode.get(node.parentCode)!.children.push(node);
    else roots.push(node);
  });
  return res.json({ success: true, data: roots, total: rows.length });
});

wave3Router.post('/coa', async (req, res) => {
  try {
    const body = CoAcreate.parse(req.body);
    const row = await prisma.chartAccount.create({ data: body });
    return res.status(201).json({ success: true, data: row });
  } catch (err: any) {
    const z = zerr(err, res); if (z) return z;
    if (err?.code === 'P2002') return res.status(409).json({ success: false, error: 'Code already exists' });
    return res.status(500).json({ success: false, error: 'create failed' });
  }
});

wave3Router.delete('/coa/:id', async (req, res) => {
  const existing = await prisma.chartAccount.findUnique({ where: { id: req.params.id } });
  if (!existing) return res.status(404).json({ success: false, error: 'Account not found' });
  await prisma.chartAccount.delete({ where: { id: existing.id } });
  return res.json({ success: true, data: { id: existing.id, deleted: true } });
});

const PeriodCreate = z.object({
  code: z.string().min(4).max(20),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
});

wave3Router.get('/periods', async (_req, res) => {
  const rows = await prisma.postingPeriod.findMany({ orderBy: { startDate: 'desc' } });
  return res.json({ success: true, data: rows, total: rows.length });
});

wave3Router.post('/periods', async (req, res) => {
  try {
    const body = PeriodCreate.parse(req.body);
    if (body.endDate <= body.startDate) return res.status(400).json({ success: false, error: 'endDate must be after startDate' });
    const row = await prisma.postingPeriod.create({ data: { ...body, status: 'Open' } });
    return res.status(201).json({ success: true, data: row });
  } catch (err: any) {
    const z = zerr(err, res); if (z) return z;
    if (err?.code === 'P2002') return res.status(409).json({ success: false, error: 'Period code already exists' });
    return res.status(500).json({ success: false, error: 'create failed' });
  }
});

wave3Router.post('/periods/:id/close', async (req, res) => {
  const existing = await prisma.postingPeriod.findUnique({ where: { id: req.params.id } });
  if (!existing) return res.status(404).json({ success: false, error: 'Period not found' });
  if (existing.status === 'Closed') return res.status(409).json({ success: false, error: 'Already closed' });
  const row = await prisma.postingPeriod.update({
    where: { id: existing.id },
    data: { status: 'Closed', closedAt: new Date(), closedBy: (req as any).user?.userId || null },
  });
  return res.json({ success: true, data: row });
});

// ════════════════════════════════════════════════════════════════════════════
// #3 AR — Aging buckets (computed from existing Invoice/Payment models)
// ════════════════════════════════════════════════════════════════════════════
wave3Router.get('/ar/aging', async (_req, res) => {
  const invoices = await prisma.invoice.findMany({
    where: { status: { in: ['Unpaid', 'Overdue', 'Partial'] } },
    include: { payments: true },
  });
  const buckets = { current: 0, d30: 0, d60: 0, d90: 0, d90plus: 0 };
  const now = Date.now();
  const detail: any[] = [];
  invoices.forEach(inv => {
    const paid = inv.payments.reduce((s, p) => s + p.amount, 0);
    const outstanding = +(inv.amount - paid).toFixed(2);
    if (outstanding <= 0) return;
    const due = inv.dueDate ? new Date(inv.dueDate).getTime() : now;
    const daysOverdue = Math.floor((now - due) / 86400000);
    let bucket: keyof typeof buckets = 'current';
    if (daysOverdue > 90) bucket = 'd90plus';
    else if (daysOverdue > 60) bucket = 'd90';
    else if (daysOverdue > 30) bucket = 'd60';
    else if (daysOverdue > 0) bucket = 'd30';
    buckets[bucket] += outstanding;
    detail.push({ invoiceNo: inv.invoiceNo, customerName: inv.customerName, amount: inv.amount, paid, outstanding, daysOverdue, bucket });
  });
  return res.json({ success: true, data: detail, summary: buckets, total: detail.length });
});

// ════════════════════════════════════════════════════════════════════════════
// #4 AP — 3-way match (PO + GR + Invoice) + Goods Receipt CRUD
// ════════════════════════════════════════════════════════════════════════════
const GRCreate = z.object({
  receiptNo: z.string().min(2).max(40),
  purchaseOrderId: z.string().min(1),
  qtyReceived: z.number().int().nonnegative(),
  receivedBy: z.string().max(60).optional().nullable(),
  notes: z.string().max(500).optional().nullable(),
});

wave3Router.get('/ap/receipts', async (req, res) => {
  const where: any = {};
  if (req.query.purchaseOrderId) where.purchaseOrderId = String(req.query.purchaseOrderId);
  const rows = await prisma.goodsReceipt.findMany({ where, orderBy: { receivedDate: 'desc' } });
  return res.json({ success: true, data: rows, total: rows.length });
});

wave3Router.post('/ap/receipts', async (req, res) => {
  try {
    const body = GRCreate.parse(req.body);
    const po = await prisma.purchaseOrder.findUnique({ where: { id: body.purchaseOrderId } });
    if (!po) return res.status(404).json({ success: false, error: 'PO not found' });
    const row = await prisma.goodsReceipt.create({ data: body });
    return res.status(201).json({ success: true, data: row });
  } catch (err: any) {
    const z = zerr(err, res); if (z) return z;
    if (err?.code === 'P2002') return res.status(409).json({ success: false, error: 'Receipt no already exists' });
    return res.status(500).json({ success: false, error: 'create failed' });
  }
});

wave3Router.get('/ap/three-way-match/:poId', async (req, res) => {
  const po = await prisma.purchaseOrder.findUnique({ where: { id: req.params.poId }, include: { items: true } });
  if (!po) return res.status(404).json({ success: false, error: 'PO not found' });
  const receipts = await prisma.goodsReceipt.findMany({ where: { purchaseOrderId: po.id } });
  const poQty = po.items.reduce((s, i) => s + i.qty, 0);
  const grQty = receipts.reduce((s, r) => s + r.qtyReceived, 0);
  // Match invoices by supplier+amount (best-effort heuristic in absence of explicit link)
  const candidateInvoices = await prisma.invoice.findMany({
    where: { customerName: po.supplier, type: 'Vendor' },
    take: 20,
    orderBy: { createdAt: 'desc' },
  });
  const invoiceAmount = candidateInvoices.reduce((s, i) => s + i.amount, 0);
  const poAmount = po.total;
  const match = {
    poId: po.id,
    poNumber: po.poNumber,
    supplier: po.supplier,
    poQty,
    grQty,
    qtyMatch: grQty >= poQty,
    poAmount,
    invoiceAmount,
    amountMatch: Math.abs(poAmount - invoiceAmount) < 0.01,
    candidateInvoices: candidateInvoices.map(i => ({ id: i.id, invoiceNo: i.invoiceNo, amount: i.amount, status: i.status })),
    receipts: receipts.length,
    canPay: grQty >= poQty && Math.abs(poAmount - invoiceAmount) < 0.01,
  };
  return res.json({ success: true, data: match });
});

// ════════════════════════════════════════════════════════════════════════════
// #8 CRM — Deals + pipeline stages
// ════════════════════════════════════════════════════════════════════════════
const STAGES = ['Prospecting', 'Qualified', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'] as const;
const DealCreate = z.object({
  name: z.string().min(2).max(160),
  customerId: z.string().max(60).optional().nullable(),
  ownerId: z.string().max(60).optional().nullable(),
  stage: z.enum(STAGES).default('Prospecting'),
  value: z.number().nonnegative(),
  currency: z.string().regex(/^[A-Z]{3}$/).default('USD'),
  probability: z.number().int().min(0).max(100).default(20),
  expectedClose: z.coerce.date().optional().nullable(),
  source: z.string().max(60).optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
});

wave3Router.get('/crm/deals', async (req, res) => {
  const where: any = {};
  if (req.query.stage) where.stage = String(req.query.stage);
  if (req.query.ownerId) where.ownerId = String(req.query.ownerId);
  const rows = await prisma.deal.findMany({ where, orderBy: { createdAt: 'desc' } });
  return res.json({ success: true, data: rows, total: rows.length });
});

wave3Router.get('/crm/pipeline', async (_req, res) => {
  const rows = await prisma.deal.findMany();
  const pipeline = STAGES.map(stage => {
    const stageDeals = rows.filter(d => d.stage === stage);
    const value = stageDeals.reduce((s, d) => s + d.value, 0);
    const weighted = stageDeals.reduce((s, d) => s + d.value * d.probability / 100, 0);
    return { stage, count: stageDeals.length, value: +value.toFixed(2), weighted: +weighted.toFixed(2), deals: stageDeals };
  });
  const totalPipeline = pipeline.reduce((s, p) => s + p.value, 0);
  const totalWeighted = pipeline.reduce((s, p) => s + p.weighted, 0);
  return res.json({ success: true, data: pipeline, summary: { totalPipeline: +totalPipeline.toFixed(2), totalWeighted: +totalWeighted.toFixed(2) } });
});

wave3Router.post('/crm/deals', async (req, res) => {
  try {
    const body = DealCreate.parse(req.body);
    const row = await prisma.deal.create({ data: body });
    return res.status(201).json({ success: true, data: row });
  } catch (err) { const z = zerr(err, res); if (z) return z; return res.status(500).json({ success: false, error: 'create failed' }); }
});

wave3Router.post('/crm/deals/:id/stage', async (req, res) => {
  const StageBody = z.object({ stage: z.enum(STAGES) });
  try {
    const body = StageBody.parse(req.body);
    const existing = await prisma.deal.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ success: false, error: 'Deal not found' });
    const probMap: Record<typeof STAGES[number], number> = {
      'Prospecting': 20, 'Qualified': 40, 'Proposal': 60, 'Negotiation': 80, 'Closed Won': 100, 'Closed Lost': 0,
    };
    const row = await prisma.deal.update({ where: { id: existing.id }, data: { stage: body.stage, probability: probMap[body.stage] } });
    return res.json({ success: true, data: row });
  } catch (err) { const z = zerr(err, res); if (z) return z; return res.status(500).json({ success: false, error: 'update failed' }); }
});

wave3Router.delete('/crm/deals/:id', async (req, res) => {
  const existing = await prisma.deal.findUnique({ where: { id: req.params.id } });
  if (!existing) return res.status(404).json({ success: false, error: 'Deal not found' });
  await prisma.deal.delete({ where: { id: existing.id } });
  return res.json({ success: true, data: { id: existing.id, deleted: true } });
});

// ════════════════════════════════════════════════════════════════════════════
// #13 PROCUREMENT — RFQ + responses
// ════════════════════════════════════════════════════════════════════════════
const RfqCreate = z.object({
  rfqNo: z.string().min(2).max(40),
  title: z.string().min(2).max(200),
  description: z.string().max(2000).optional().nullable(),
  category: z.string().max(60).optional().nullable(),
  dueDate: z.coerce.date().optional().nullable(),
  createdBy: z.string().max(60).optional().nullable(),
});

const RfqRespCreate = z.object({
  vendorId: z.string().min(1).max(60),
  vendorName: z.string().max(120).optional().nullable(),
  amount: z.number().nonnegative(),
  currency: z.string().regex(/^[A-Z]{3}$/).default('USD'),
  leadTimeDays: z.number().int().nonnegative().optional().nullable(),
  notes: z.string().max(500).optional().nullable(),
});

wave3Router.get('/procurement/rfqs', async (req, res) => {
  const where: any = {};
  if (req.query.status) where.status = String(req.query.status);
  const rows = await prisma.rFQ.findMany({ where, include: { responses: true }, orderBy: { createdAt: 'desc' } });
  return res.json({ success: true, data: rows, total: rows.length });
});

wave3Router.post('/procurement/rfqs', async (req, res) => {
  try {
    const body = RfqCreate.parse(req.body);
    const row = await prisma.rFQ.create({ data: { ...body, status: 'Draft' } });
    return res.status(201).json({ success: true, data: row });
  } catch (err: any) {
    const z = zerr(err, res); if (z) return z;
    if (err?.code === 'P2002') return res.status(409).json({ success: false, error: 'RFQ no exists' });
    return res.status(500).json({ success: false, error: 'create failed' });
  }
});

wave3Router.post('/procurement/rfqs/:id/open', async (req, res) => {
  const existing = await prisma.rFQ.findUnique({ where: { id: req.params.id } });
  if (!existing) return res.status(404).json({ success: false, error: 'RFQ not found' });
  if (existing.status !== 'Draft') return res.status(409).json({ success: false, error: `Cannot open from '${existing.status}'` });
  const row = await prisma.rFQ.update({ where: { id: existing.id }, data: { status: 'Open' } });
  return res.json({ success: true, data: row });
});

wave3Router.post('/procurement/rfqs/:id/responses', async (req, res) => {
  try {
    const body = RfqRespCreate.parse(req.body);
    const rfq = await prisma.rFQ.findUnique({ where: { id: req.params.id } });
    if (!rfq) return res.status(404).json({ success: false, error: 'RFQ not found' });
    if (rfq.status !== 'Open') return res.status(409).json({ success: false, error: 'RFQ not open for responses' });
    const row = await prisma.rFQResponse.create({ data: { rfqId: rfq.id, ...body } });
    return res.status(201).json({ success: true, data: row });
  } catch (err) { const z = zerr(err, res); if (z) return z; return res.status(500).json({ success: false, error: 'create failed' }); }
});

wave3Router.post('/procurement/rfqs/:id/award/:respId', async (req, res) => {
  const rfq = await prisma.rFQ.findUnique({ where: { id: req.params.id } });
  if (!rfq) return res.status(404).json({ success: false, error: 'RFQ not found' });
  if (rfq.status !== 'Open') return res.status(409).json({ success: false, error: 'RFQ not open' });
  const resp = await prisma.rFQResponse.findUnique({ where: { id: req.params.respId } });
  if (!resp || resp.rfqId !== rfq.id) return res.status(404).json({ success: false, error: 'Response not found' });
  const [updatedRfq] = await prisma.$transaction([
    prisma.rFQ.update({ where: { id: rfq.id }, data: { status: 'Awarded', awardedTo: resp.vendorId, awardedAt: new Date() } }),
    prisma.rFQResponse.update({ where: { id: resp.id }, data: { status: 'Awarded' } }),
    prisma.rFQResponse.updateMany({ where: { rfqId: rfq.id, id: { not: resp.id } }, data: { status: 'Rejected' } }),
  ]);
  return res.json({ success: true, data: updatedRfq });
});

// ════════════════════════════════════════════════════════════════════════════
// #14 VENDOR SCORECARD
// ════════════════════════════════════════════════════════════════════════════
const ScoreCreate = z.object({
  vendorId: z.string().min(1).max(60),
  vendorName: z.string().max(120).optional().nullable(),
  period: z.string().min(4).max(20),
  onTimePercent: z.number().min(0).max(100),
  qualityScore: z.number().min(0).max(100),
  priceScore: z.number().min(0).max(100),
  responseScore: z.number().min(0).max(100),
  notes: z.string().max(500).optional().nullable(),
});

function recommend(overall: number): string {
  if (overall >= 85) return 'Promote';
  if (overall >= 70) return 'Maintain';
  if (overall >= 50) return 'Warn';
  return 'Drop';
}

wave3Router.get('/vendors/scorecards', async (req, res) => {
  const where: any = {};
  if (req.query.period) where.period = String(req.query.period);
  if (req.query.vendorId) where.vendorId = String(req.query.vendorId);
  const rows = await prisma.vendorScorecard.findMany({ where, orderBy: { overallScore: 'desc' } });
  return res.json({ success: true, data: rows, total: rows.length });
});

wave3Router.post('/vendors/scorecards', async (req, res) => {
  try {
    const body = ScoreCreate.parse(req.body);
    const overall = +((body.onTimePercent + body.qualityScore + body.priceScore + body.responseScore) / 4).toFixed(2);
    const row = await prisma.vendorScorecard.upsert({
      where: { vendorId_period: { vendorId: body.vendorId, period: body.period } },
      create: { ...body, overallScore: overall, recommendation: recommend(overall) },
      update: { ...body, overallScore: overall, recommendation: recommend(overall) },
    });
    return res.status(201).json({ success: true, data: row });
  } catch (err) { const z = zerr(err, res); if (z) return z; return res.status(500).json({ success: false, error: 'create failed' }); }
});

// ════════════════════════════════════════════════════════════════════════════
// #22 INVENTORY — cycle count + ABC analysis
// ════════════════════════════════════════════════════════════════════════════
const CycleCreate = z.object({
  sku: z.string().min(1).max(60),
  warehouseId: z.string().max(60).optional().nullable(),
  systemQty: z.number().int(),
  countedQty: z.number().int().nonnegative(),
  countedBy: z.string().max(60).optional().nullable(),
  notes: z.string().max(500).optional().nullable(),
});

wave3Router.get('/inventory/cycle-counts', async (req, res) => {
  const where: any = {};
  if (req.query.status) where.status = String(req.query.status);
  if (req.query.sku) where.sku = String(req.query.sku);
  const rows = await prisma.cycleCount.findMany({ where, orderBy: { countedAt: 'desc' }, take: 200 });
  return res.json({ success: true, data: rows, total: rows.length });
});

wave3Router.post('/inventory/cycle-counts', async (req, res) => {
  try {
    const body = CycleCreate.parse(req.body);
    const variance = body.countedQty - body.systemQty;
    const row = await prisma.cycleCount.create({ data: { ...body, variance, status: 'Pending' } });
    return res.status(201).json({ success: true, data: row });
  } catch (err) { const z = zerr(err, res); if (z) return z; return res.status(500).json({ success: false, error: 'create failed' }); }
});

wave3Router.post('/inventory/cycle-counts/:id/confirm', async (req, res) => {
  const existing = await prisma.cycleCount.findUnique({ where: { id: req.params.id } });
  if (!existing) return res.status(404).json({ success: false, error: 'Count not found' });
  const row = await prisma.cycleCount.update({ where: { id: existing.id }, data: { status: 'Confirmed' } });
  return res.json({ success: true, data: row });
});

wave3Router.get('/inventory/abc-analysis', async (_req, res) => {
  // Compute ABC by item value (qty × price) from existing InventoryItem table.
  const items = await prisma.inventoryItem.findMany();
  const valued = items.map(i => ({ sku: i.sku, name: i.description, qty: i.onHand, price: i.unitCost, value: i.onHand * i.unitCost }));
  valued.sort((a, b) => b.value - a.value);
  const totalValue = valued.reduce((s, v) => s + v.value, 0);
  let cum = 0;
  const result = valued.map(v => {
    cum += v.value;
    const cumPct = totalValue ? (cum / totalValue) * 100 : 0;
    let category: 'A' | 'B' | 'C' = 'C';
    if (cumPct <= 70) category = 'A';
    else if (cumPct <= 90) category = 'B';
    return { ...v, cumPct: +cumPct.toFixed(2), category };
  });
  const summary = {
    A: result.filter(r => r.category === 'A').length,
    B: result.filter(r => r.category === 'B').length,
    C: result.filter(r => r.category === 'C').length,
    totalValue: +totalValue.toFixed(2),
  };
  return res.json({ success: true, data: result, summary });
});

// ════════════════════════════════════════════════════════════════════════════
// #25 FLEET — alerts (computed from GPSRetailer state)
// ════════════════════════════════════════════════════════════════════════════
wave3Router.get('/fleet/alerts', async (_req, res) => {
  // Lightweight: look at recent rows and surface anomalies. If table missing fields, fall back.
  const rows = await (prisma as any).gPSRetailer?.findMany?.({ take: 200 }) || [];
  const alerts = rows
    .filter((r: any) => r.status === 'Offline' || r.batteryLevel < 20 || (r.lastSeenAt && Date.now() - new Date(r.lastSeenAt).getTime() > 4 * 3600 * 1000))
    .map((r: any) => ({
      retailerId: r.id || r.retailerId,
      severity: r.batteryLevel < 10 ? 'critical' : 'warn',
      reason: r.status === 'Offline' ? 'Device offline' : (r.batteryLevel < 20 ? `Battery ${r.batteryLevel}%` : 'No GPS ping in 4h'),
    }));
  return res.json({ success: true, data: alerts, total: alerts.length });
});

// ════════════════════════════════════════════════════════════════════════════
// #26 SHIPPING — shipments + tracking events
// ════════════════════════════════════════════════════════════════════════════
const ShipCreate = z.object({
  trackingNo: z.string().min(2).max(40),
  origin: z.string().min(2).max(120),
  destination: z.string().min(2).max(120),
  carrier: z.string().max(60).optional().nullable(),
  service: z.enum(['air', 'sea', 'road', 'rail']).optional().nullable(),
  weightKg: z.number().nonnegative().default(0),
  estimatedEta: z.coerce.date().optional().nullable(),
  orderId: z.string().max(60).optional().nullable(),
});

const TrackEventCreate = z.object({
  location: z.string().min(2).max(120),
  status: z.string().min(2).max(40),
  description: z.string().max(500).optional().nullable(),
});

wave3Router.get('/shipping/shipments', async (req, res) => {
  const where: any = {};
  if (req.query.status) where.status = String(req.query.status);
  if (req.query.carrier) where.carrier = String(req.query.carrier);
  const rows = await prisma.shipment.findMany({ where, include: { events: { orderBy: { eventTime: 'desc' }, take: 5 } }, orderBy: { bookedAt: 'desc' }, take: 200 });
  return res.json({ success: true, data: rows, total: rows.length });
});

wave3Router.post('/shipping/shipments', async (req, res) => {
  try {
    const body = ShipCreate.parse(req.body);
    const row = await prisma.shipment.create({ data: { ...body, status: 'Booked' } });
    return res.status(201).json({ success: true, data: row });
  } catch (err: any) {
    const z = zerr(err, res); if (z) return z;
    if (err?.code === 'P2002') return res.status(409).json({ success: false, error: 'Tracking no exists' });
    return res.status(500).json({ success: false, error: 'create failed' });
  }
});

wave3Router.post('/shipping/shipments/:id/events', async (req, res) => {
  try {
    const body = TrackEventCreate.parse(req.body);
    const ship = await prisma.shipment.findUnique({ where: { id: req.params.id } });
    if (!ship) return res.status(404).json({ success: false, error: 'Shipment not found' });
    const ev = await prisma.trackingEvent.create({ data: { shipmentId: ship.id, ...body } });
    // Auto-advance shipment status based on event status
    let newStatus = ship.status;
    if (body.status.toLowerCase().includes('transit')) newStatus = 'InTransit';
    else if (body.status.toLowerCase().includes('deliver')) newStatus = 'Delivered';
    else if (body.status.toLowerCase().includes('exception')) newStatus = 'Exception';
    if (newStatus !== ship.status) {
      await prisma.shipment.update({
        where: { id: ship.id },
        data: { status: newStatus, ...(newStatus === 'Delivered' ? { actualDelivery: new Date() } : {}) },
      });
    }
    return res.status(201).json({ success: true, data: ev });
  } catch (err) { const z = zerr(err, res); if (z) return z; return res.status(500).json({ success: false, error: 'create failed' }); }
});

wave3Router.get('/shipping/shipments/:id', async (req, res) => {
  const row = await prisma.shipment.findUnique({
    where: { id: req.params.id },
    include: { events: { orderBy: { eventTime: 'desc' } } },
  });
  if (!row) return res.status(404).json({ success: false, error: 'Shipment not found' });
  return res.json({ success: true, data: row });
});

// ════════════════════════════════════════════════════════════════════════════
// #27 TRADE & CUSTOMS — HS codes + duty calc
// ════════════════════════════════════════════════════════════════════════════
const HSCreate = z.object({
  code: z.string().min(4).max(20),
  description: z.string().min(2).max(300),
  category: z.string().max(60).optional().nullable(),
  dutyPercent: z.number().min(0).max(100),
  notes: z.string().max(500).optional().nullable(),
});

wave3Router.get('/trade/hs-codes', async (req, res) => {
  const where: any = {};
  if (req.query.category) where.category = String(req.query.category);
  if (req.query.q) where.OR = [
    { code: { contains: String(req.query.q), mode: 'insensitive' } },
    { description: { contains: String(req.query.q), mode: 'insensitive' } },
  ];
  const rows = await prisma.hSCode.findMany({ where, orderBy: { code: 'asc' }, take: 200 });
  return res.json({ success: true, data: rows, total: rows.length });
});

wave3Router.post('/trade/hs-codes', async (req, res) => {
  try {
    const body = HSCreate.parse(req.body);
    const row = await prisma.hSCode.create({ data: body });
    return res.status(201).json({ success: true, data: row });
  } catch (err: any) {
    const z = zerr(err, res); if (z) return z;
    if (err?.code === 'P2002') return res.status(409).json({ success: false, error: 'HS code exists' });
    return res.status(500).json({ success: false, error: 'create failed' });
  }
});

wave3Router.get('/trade/duty-calc', async (req, res) => {
  const code = String(req.query.code || '');
  const cifValue = Number(req.query.cifValue || 0);
  if (!code || cifValue <= 0) return res.status(400).json({ success: false, error: 'code + cifValue required' });
  const hs = await prisma.hSCode.findUnique({ where: { code } });
  if (!hs) return res.status(404).json({ success: false, error: 'HS code not found' });
  const duty = +(cifValue * hs.dutyPercent / 100).toFixed(2);
  return res.json({
    success: true,
    data: { code: hs.code, description: hs.description, cifValue, dutyPercent: hs.dutyPercent, duty, landedCost: +(cifValue + duty).toFixed(2) },
  });
});

// ════════════════════════════════════════════════════════════════════════════
// #29 HR — leave + attendance
// ════════════════════════════════════════════════════════════════════════════
const LeaveCreate = z.object({
  employeeId: z.string().min(1).max(60),
  leaveType: z.enum(['Annual', 'Sick', 'Unpaid', 'Maternity', 'Paternity', 'Bereavement']),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  reason: z.string().max(500).optional().nullable(),
});

wave3Router.get('/hr/leave', async (req, res) => {
  const where: any = {};
  if (req.query.status) where.status = String(req.query.status);
  if (req.query.employeeId) where.employeeId = String(req.query.employeeId);
  const rows = await prisma.leaveRequest.findMany({ where, orderBy: { createdAt: 'desc' }, take: 200 });
  return res.json({ success: true, data: rows, total: rows.length });
});

wave3Router.post('/hr/leave', async (req, res) => {
  try {
    const body = LeaveCreate.parse(req.body);
    if (body.endDate < body.startDate) return res.status(400).json({ success: false, error: 'endDate must be ≥ startDate' });
    const days = Math.max(1, Math.ceil((body.endDate.getTime() - body.startDate.getTime()) / 86400000) + 1);
    const row = await prisma.leaveRequest.create({ data: { ...body, days, status: 'Pending' } });
    return res.status(201).json({ success: true, data: row });
  } catch (err) { const z = zerr(err, res); if (z) return z; return res.status(500).json({ success: false, error: 'create failed' }); }
});

wave3Router.post('/hr/leave/:id/approve', async (req, res) => {
  const existing = await prisma.leaveRequest.findUnique({ where: { id: req.params.id } });
  if (!existing) return res.status(404).json({ success: false, error: 'Leave not found' });
  if (existing.status !== 'Pending') return res.status(409).json({ success: false, error: `Cannot approve '${existing.status}'` });
  const row = await prisma.leaveRequest.update({
    where: { id: existing.id },
    data: { status: 'Approved', approvedAt: new Date(), approvedBy: (req as any).user?.userId || null },
  });
  return res.json({ success: true, data: row });
});

wave3Router.post('/hr/leave/:id/reject', async (req, res) => {
  const existing = await prisma.leaveRequest.findUnique({ where: { id: req.params.id } });
  if (!existing) return res.status(404).json({ success: false, error: 'Leave not found' });
  if (existing.status !== 'Pending') return res.status(409).json({ success: false, error: `Cannot reject '${existing.status}'` });
  const row = await prisma.leaveRequest.update({ where: { id: existing.id }, data: { status: 'Rejected' } });
  return res.json({ success: true, data: row });
});

const AttendanceCreate = z.object({
  employeeId: z.string().min(1).max(60),
  date: z.coerce.date(),
  clockIn: z.coerce.date().optional().nullable(),
  clockOut: z.coerce.date().optional().nullable(),
  status: z.enum(['Present', 'Absent', 'Late', 'Half-Day', 'WFH']).default('Present'),
  notes: z.string().max(500).optional().nullable(),
});

wave3Router.get('/hr/attendance', async (req, res) => {
  const where: any = {};
  if (req.query.employeeId) where.employeeId = String(req.query.employeeId);
  if (req.query.date) where.date = new Date(String(req.query.date));
  const rows = await prisma.attendance.findMany({ where, orderBy: { date: 'desc' }, take: 200 });
  return res.json({ success: true, data: rows, total: rows.length });
});

wave3Router.post('/hr/attendance', async (req, res) => {
  try {
    const body = AttendanceCreate.parse(req.body);
    const hoursWorked = body.clockIn && body.clockOut ? +((body.clockOut.getTime() - body.clockIn.getTime()) / 3600000).toFixed(2) : 0;
    const row = await prisma.attendance.upsert({
      where: { employeeId_date: { employeeId: body.employeeId, date: body.date } },
      create: { ...body, hoursWorked },
      update: { ...body, hoursWorked },
    });
    return res.status(201).json({ success: true, data: row });
  } catch (err) { const z = zerr(err, res); if (z) return z; return res.status(500).json({ success: false, error: 'create failed' }); }
});
