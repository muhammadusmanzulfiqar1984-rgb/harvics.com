/**
 * HARVICS OS — Wave 4 Controller (Bucket A completions, Session 39)
 *   #2  Controlling          — cost centers + allocations + variance
 *   #7  Financial Planning   — budgets + budget-vs-actual
 *   #10 Sales & Distribution — channels + route-by-priority + delivery slots
 *   #19 Bill of Materials    — standalone BOM + explode (multi-level)
 *   #21 Recipe Management    — recipe scaling
 *   #23 Warehouse Management — warehouses + bins + putaway strategy
 *   #24 Demand Planning      — moving-avg forecast from history
 *   #25 Fleet Management     — vehicles + trips + simple route-opt
 */
import { Request, Response, Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../core/prisma';

export const wave4Router = Router();

function zerr(err: unknown, res: Response): Response | undefined {
  if (err instanceof z.ZodError) return res.status(400).json({ success: false, error: 'validation', issues: err.issues });
  return undefined;
}

// ════════════════════════════════════════════════════════════════════════════
// #2 CONTROLLING — Cost centers + Allocations + Variance report
// ════════════════════════════════════════════════════════════════════════════
const CCcreate = z.object({
  code: z.string().min(1).max(20),
  name: z.string().min(1).max(120),
  manager: z.string().max(60).optional().nullable(),
});

wave4Router.get('/cost-centers', async (_req, res) => {
  const rows = await prisma.costCenter.findMany({ orderBy: { code: 'asc' } });
  res.json({ success: true, data: rows, total: rows.length });
});

wave4Router.post('/cost-centers', async (req, res) => {
  try {
    const body = CCcreate.parse(req.body);
    const row = await prisma.costCenter.create({ data: body });
    res.status(201).json({ success: true, data: row });
  } catch (err: any) {
    const z = zerr(err, res); if (z) return;
    if (err?.code === 'P2002') return res.status(409).json({ success: false, error: 'Code exists' });
    res.status(500).json({ success: false, error: 'create failed' });
  }
});

const AllocCreate = z.object({
  period: z.string().min(4).max(20),
  fromAccount: z.string().min(1).max(20),
  toCostCenter: z.string().min(1).max(20),
  amount: z.number().nonnegative(),
  currency: z.string().regex(/^[A-Z]{3}$/).default('USD'),
  basis: z.string().max(30).optional().nullable(),
  notes: z.string().max(500).optional().nullable(),
});

wave4Router.get('/allocations', async (req, res) => {
  const where: any = {};
  if (req.query.period) where.period = String(req.query.period);
  if (req.query.toCostCenter) where.toCostCenter = String(req.query.toCostCenter);
  const rows = await prisma.costAllocation.findMany({ where, orderBy: { period: 'desc' } });
  res.json({ success: true, data: rows, total: rows.length });
});

wave4Router.post('/allocations', async (req, res) => {
  try {
    const body = AllocCreate.parse(req.body);
    const row = await prisma.costAllocation.create({ data: body });
    res.status(201).json({ success: true, data: row });
  } catch (err) { const z = zerr(err, res); if (z) return; res.status(500).json({ success: false, error: 'create failed' }); }
});

wave4Router.get('/variance', async (req, res) => {
  const period = String(req.query.period || '');
  if (!period) return res.status(400).json({ success: false, error: 'period required (e.g. 2026-05)' });
  const [budgets, actuals] = await Promise.all([
    prisma.budgetLine.findMany({ where: { period, scenario: 'Base' } }),
    prisma.costAllocation.findMany({ where: { period } }),
  ]);
  const byKey = new Map<string, { account: string; costCenter: string; budgeted: number; actual: number }>();
  budgets.forEach(b => {
    const k = `${b.account}|${b.costCenter || ''}`;
    byKey.set(k, { account: b.account, costCenter: b.costCenter || '', budgeted: b.budgeted, actual: 0 });
  });
  actuals.forEach(a => {
    const k = `${a.fromAccount}|${a.toCostCenter}`;
    const r = byKey.get(k) || { account: a.fromAccount, costCenter: a.toCostCenter, budgeted: 0, actual: 0 };
    r.actual += a.amount;
    byKey.set(k, r);
  });
  const rows = Array.from(byKey.values()).map(r => ({
    ...r,
    variance: +(r.actual - r.budgeted).toFixed(2),
    variancePct: r.budgeted ? +(((r.actual - r.budgeted) / r.budgeted) * 100).toFixed(2) : null,
  }));
  const totalB = rows.reduce((s, r) => s + r.budgeted, 0);
  const totalA = rows.reduce((s, r) => s + r.actual, 0);
  res.json({ success: true, data: rows, summary: { period, totalBudget: totalB, totalActual: totalA, variance: +(totalA - totalB).toFixed(2) } });
});

// ════════════════════════════════════════════════════════════════════════════
// #7 FINANCIAL PLANNING — Budgets
// ════════════════════════════════════════════════════════════════════════════
const BudgetCreate = z.object({
  period: z.string().min(4).max(20),
  account: z.string().min(1).max(20),
  costCenter: z.string().max(20).optional().nullable(),
  budgeted: z.number(),
  scenario: z.enum(['Base', 'Upside', 'Downside']).default('Base'),
  notes: z.string().max(500).optional().nullable(),
});

wave4Router.get('/budgets', async (req, res) => {
  const where: any = {};
  if (req.query.period) where.period = String(req.query.period);
  if (req.query.scenario) where.scenario = String(req.query.scenario);
  const rows = await prisma.budgetLine.findMany({ where, orderBy: [{ period: 'desc' }, { account: 'asc' }] });
  res.json({ success: true, data: rows, total: rows.length });
});

wave4Router.post('/budgets', async (req, res) => {
  try {
    const body = BudgetCreate.parse(req.body);
    const row = await prisma.budgetLine.upsert({
      where: { period_account_costCenter_scenario: { period: body.period, account: body.account, costCenter: body.costCenter || '', scenario: body.scenario } },
      create: { ...body, costCenter: body.costCenter || null },
      update: { budgeted: body.budgeted, notes: body.notes ?? null },
    });
    res.status(201).json({ success: true, data: row });
  } catch (err) { const z = zerr(err, res); if (z) return; res.status(500).json({ success: false, error: 'create failed' }); }
});

// ════════════════════════════════════════════════════════════════════════════
// #10 SALES & DISTRIBUTION — Channels + delivery slots + smart routing
// ════════════════════════════════════════════════════════════════════════════
const ChannelCreate = z.object({
  code: z.string().min(1).max(20),
  name: z.string().min(1).max(120),
  type: z.enum(['direct', 'distributor', 'online', 'retail', 'wholesale']),
  priority: z.number().int().min(0).max(100).default(50),
  leadTimeDays: z.number().int().nonnegative().default(1),
});

wave4Router.get('/channels', async (_req, res) => {
  const rows = await prisma.salesChannel.findMany({ orderBy: { priority: 'asc' } });
  res.json({ success: true, data: rows, total: rows.length });
});

wave4Router.post('/channels', async (req, res) => {
  try {
    const body = ChannelCreate.parse(req.body);
    const row = await prisma.salesChannel.create({ data: body });
    res.status(201).json({ success: true, data: row });
  } catch (err: any) {
    const z = zerr(err, res); if (z) return;
    if (err?.code === 'P2002') return res.status(409).json({ success: false, error: 'Code exists' });
    res.status(500).json({ success: false, error: 'create failed' });
  }
});

wave4Router.post('/route-order', async (req, res) => {
  const RouteBody = z.object({
    customerType: z.enum(['direct', 'distributor', 'online', 'retail', 'wholesale']).optional(),
    requestedBy: z.coerce.date().optional(),
    region: z.string().optional(),
  });
  try {
    const body = RouteBody.parse(req.body);
    const channels = await prisma.salesChannel.findMany({ where: { active: true }, orderBy: { priority: 'asc' } });
    if (channels.length === 0) return res.status(404).json({ success: false, error: 'No active channels configured' });
    // Routing: prefer exact type match, else lowest priority that meets lead time
    let candidates = body.customerType ? channels.filter(c => c.type === body.customerType) : channels;
    if (candidates.length === 0) candidates = channels;
    if (body.requestedBy) {
      const daysFromNow = Math.max(0, Math.ceil((body.requestedBy.getTime() - Date.now()) / 86400000));
      candidates = candidates.filter(c => c.leadTimeDays <= daysFromNow);
      if (candidates.length === 0) {
        return res.json({ success: true, data: null, reason: 'No channel can meet requested delivery date', minLeadTime: Math.min(...channels.map(c => c.leadTimeDays)) });
      }
    }
    const picked = candidates[0];
    res.json({ success: true, data: { picked, alternatives: candidates.slice(1, 4) } });
  } catch (err) { const z = zerr(err, res); if (z) return; res.status(500).json({ success: false, error: 'route failed' }); }
});

const SlotCreate = z.object({
  orderId: z.string().max(60).optional().nullable(),
  channelCode: z.string().min(1).max(20),
  scheduledFor: z.coerce.date(),
  windowStart: z.string().regex(/^\d{2}:\d{2}$/).optional().nullable(),
  windowEnd: z.string().regex(/^\d{2}:\d{2}$/).optional().nullable(),
  driver: z.string().max(60).optional().nullable(),
  vehicle: z.string().max(60).optional().nullable(),
});

wave4Router.get('/delivery-slots', async (req, res) => {
  const where: any = {};
  if (req.query.status) where.status = String(req.query.status);
  if (req.query.from) where.scheduledFor = { gte: new Date(String(req.query.from)) };
  const rows = await prisma.deliverySlot.findMany({ where, orderBy: { scheduledFor: 'asc' }, take: 200 });
  res.json({ success: true, data: rows, total: rows.length });
});

wave4Router.post('/delivery-slots', async (req, res) => {
  try {
    const body = SlotCreate.parse(req.body);
    const row = await prisma.deliverySlot.create({ data: { ...body, status: 'Scheduled' } });
    res.status(201).json({ success: true, data: row });
  } catch (err) { const z = zerr(err, res); if (z) return; res.status(500).json({ success: false, error: 'create failed' }); }
});

// ════════════════════════════════════════════════════════════════════════════
// #19 BILL OF MATERIALS — standalone + explode
// ════════════════════════════════════════════════════════════════════════════
const BomCreate = z.object({
  productSku: z.string().min(1).max(60),
  productName: z.string().min(1).max(160),
  version: z.string().max(20).default('v1'),
  uom: z.string().max(10).default('EA'),
});

const BomComp = z.object({
  componentSku: z.string().min(1).max(60),
  componentName: z.string().max(160).optional().nullable(),
  qtyPer: z.number().positive(),
  uom: z.string().max(10).default('EA'),
  scrapPercent: z.number().min(0).max(100).default(0),
  unitCost: z.number().nonnegative().default(0),
});

wave4Router.get('/boms', async (_req, res) => {
  const rows = await prisma.billOfMaterial.findMany({ include: { components: true }, orderBy: { productSku: 'asc' } });
  res.json({ success: true, data: rows, total: rows.length });
});

wave4Router.post('/boms', async (req, res) => {
  try {
    const body = BomCreate.parse(req.body);
    const row = await prisma.billOfMaterial.create({ data: body });
    res.status(201).json({ success: true, data: row });
  } catch (err: any) {
    const z = zerr(err, res); if (z) return;
    if (err?.code === 'P2002') return res.status(409).json({ success: false, error: 'SKU already has BOM' });
    res.status(500).json({ success: false, error: 'create failed' });
  }
});

wave4Router.post('/boms/:id/components', async (req, res) => {
  try {
    const body = BomComp.parse(req.body);
    const bom = await prisma.billOfMaterial.findUnique({ where: { id: req.params.id } });
    if (!bom) return res.status(404).json({ success: false, error: 'BOM not found' });
    const row = await prisma.bOMComponent.create({ data: { bomId: bom.id, ...body } });
    res.status(201).json({ success: true, data: row });
  } catch (err) { const z = zerr(err, res); if (z) return; res.status(500).json({ success: false, error: 'create failed' }); }
});

wave4Router.delete('/boms/components/:id', async (req, res) => {
  const ex = await prisma.bOMComponent.findUnique({ where: { id: req.params.id } });
  if (!ex) return res.status(404).json({ success: false, error: 'Component not found' });
  await prisma.bOMComponent.delete({ where: { id: ex.id } });
  res.json({ success: true, data: { id: ex.id, deleted: true } });
});

// Multi-level explode — recursively traverse BOMs by SKU
wave4Router.get('/boms/explode/:sku', async (req, res) => {
  const targetQty = Number(req.query.qty || 1);
  if (targetQty <= 0) return res.status(400).json({ success: false, error: 'qty must be > 0' });
  const seen = new Set<string>();
  const visited = new Set<string>(); // cycle guard
  const totalCost = { value: 0 };

  async function expand(sku: string, qty: number, depth: number): Promise<any> {
    if (visited.has(sku)) return { sku, error: 'circular', children: [] };
    if (depth > 8) return { sku, error: 'depth-limit', children: [] };
    visited.add(sku);
    const bom = await prisma.billOfMaterial.findUnique({ where: { productSku: sku }, include: { components: true } });
    visited.delete(sku);
    if (!bom) return { sku, qty, leaf: true, children: [] };
    const children = [] as any[];
    for (const c of bom.components) {
      const reqQty = +(c.qtyPer * qty * (1 + c.scrapPercent / 100)).toFixed(4);
      const lineCost = +(c.unitCost * reqQty).toFixed(2);
      totalCost.value += lineCost;
      seen.add(c.componentSku);
      const child = await expand(c.componentSku, reqQty, depth + 1);
      children.push({
        sku: c.componentSku,
        name: c.componentName,
        qty: reqQty,
        uom: c.uom,
        scrapPercent: c.scrapPercent,
        unitCost: c.unitCost,
        lineCost,
        ...child,
      });
    }
    return { sku, name: bom.productName, qty, uom: bom.uom, children };
  }

  const tree = await expand(req.params.sku, targetQty, 0);
  res.json({ success: true, data: tree, summary: { totalCost: +totalCost.value.toFixed(2), uniqueComponents: seen.size } });
});

// ════════════════════════════════════════════════════════════════════════════
// #21 RECIPE MANAGEMENT
// ════════════════════════════════════════════════════════════════════════════
const RecipeCreate = z.object({
  code: z.string().min(1).max(40),
  name: z.string().min(1).max(160),
  category: z.string().max(60).optional().nullable(),
  baseYield: z.number().positive().default(1),
  baseUom: z.string().max(10).default('L'),
  notes: z.string().max(500).optional().nullable(),
});

const IngCreate = z.object({
  ingredient: z.string().min(1).max(120),
  qty: z.number().positive(),
  uom: z.string().max(10).default('kg'),
  unitCost: z.number().nonnegative().default(0),
  notes: z.string().max(300).optional().nullable(),
});

wave4Router.get('/recipes', async (_req, res) => {
  const rows = await prisma.recipe.findMany({ include: { ingredients: true }, orderBy: { code: 'asc' } });
  res.json({ success: true, data: rows, total: rows.length });
});

wave4Router.post('/recipes', async (req, res) => {
  try {
    const body = RecipeCreate.parse(req.body);
    const row = await prisma.recipe.create({ data: body });
    res.status(201).json({ success: true, data: row });
  } catch (err: any) {
    const z = zerr(err, res); if (z) return;
    if (err?.code === 'P2002') return res.status(409).json({ success: false, error: 'Code exists' });
    res.status(500).json({ success: false, error: 'create failed' });
  }
});

wave4Router.post('/recipes/:id/ingredients', async (req, res) => {
  try {
    const body = IngCreate.parse(req.body);
    const r = await prisma.recipe.findUnique({ where: { id: req.params.id } });
    if (!r) return res.status(404).json({ success: false, error: 'Recipe not found' });
    const row = await prisma.recipeIngredient.create({ data: { recipeId: r.id, ...body } });
    res.status(201).json({ success: true, data: row });
  } catch (err) { const z = zerr(err, res); if (z) return; res.status(500).json({ success: false, error: 'create failed' }); }
});

wave4Router.get('/recipes/:id/scale', async (req, res) => {
  const targetYield = Number(req.query.yield || 0);
  if (targetYield <= 0) return res.status(400).json({ success: false, error: 'yield query param required' });
  const r = await prisma.recipe.findUnique({ where: { id: req.params.id }, include: { ingredients: true } });
  if (!r) return res.status(404).json({ success: false, error: 'Recipe not found' });
  const factor = targetYield / r.baseYield;
  const scaled = r.ingredients.map(i => ({
    ingredient: i.ingredient,
    qty: +(i.qty * factor).toFixed(4),
    uom: i.uom,
    unitCost: i.unitCost,
    lineCost: +(i.qty * factor * i.unitCost).toFixed(2),
  }));
  const totalCost = +scaled.reduce((s, x) => s + x.lineCost, 0).toFixed(2);
  res.json({
    success: true,
    data: {
      recipe: { code: r.code, name: r.name, baseYield: r.baseYield, baseUom: r.baseUom },
      targetYield,
      factor: +factor.toFixed(4),
      ingredients: scaled,
      totalCost,
      costPerUnit: +(totalCost / targetYield).toFixed(4),
    },
  });
});

// ════════════════════════════════════════════════════════════════════════════
// #23 WAREHOUSE MANAGEMENT — warehouses + bins + putaway
// ════════════════════════════════════════════════════════════════════════════
const WHCreate = z.object({
  code: z.string().min(1).max(20),
  name: z.string().min(1).max(120),
  location: z.string().max(160).optional().nullable(),
  type: z.enum(['DC', 'Store', 'Cold', 'Bonded']).default('DC'),
});

const BinCreate = z.object({
  code: z.string().min(1).max(20),
  aisle: z.string().max(10).optional().nullable(),
  rack: z.string().max(10).optional().nullable(),
  level: z.string().max(10).optional().nullable(),
  zone: z.enum(['pick', 'reserve', 'bulk', 'cold']).optional().nullable(),
  capacityUom: z.string().max(10).default('EA'),
  capacity: z.number().nonnegative().default(0),
});

wave4Router.get('/warehouses', async (_req, res) => {
  const rows = await prisma.warehouse.findMany({ include: { bins: true }, orderBy: { code: 'asc' } });
  res.json({ success: true, data: rows, total: rows.length });
});

wave4Router.post('/warehouses', async (req, res) => {
  try {
    const body = WHCreate.parse(req.body);
    const row = await prisma.warehouse.create({ data: body });
    res.status(201).json({ success: true, data: row });
  } catch (err: any) {
    const z = zerr(err, res); if (z) return;
    if (err?.code === 'P2002') return res.status(409).json({ success: false, error: 'Code exists' });
    res.status(500).json({ success: false, error: 'create failed' });
  }
});

wave4Router.post('/warehouses/:id/bins', async (req, res) => {
  try {
    const body = BinCreate.parse(req.body);
    const wh = await prisma.warehouse.findUnique({ where: { id: req.params.id } });
    if (!wh) return res.status(404).json({ success: false, error: 'Warehouse not found' });
    const row = await prisma.bin.create({ data: { warehouseId: wh.id, ...body } });
    res.status(201).json({ success: true, data: row });
  } catch (err: any) {
    const z = zerr(err, res); if (z) return;
    if (err?.code === 'P2002') return res.status(409).json({ success: false, error: 'Bin code exists in warehouse' });
    res.status(500).json({ success: false, error: 'create failed' });
  }
});

const PutawayBody = z.object({
  sku: z.string().min(1).max(60),
  qty: z.number().positive(),
  warehouseId: z.string().min(1),
  strategy: z.enum(['nearest-pick', 'zone-match', 'least-full']).default('least-full'),
  preferZone: z.enum(['pick', 'reserve', 'bulk', 'cold']).optional(),
  movedBy: z.string().max(60).optional().nullable(),
});

wave4Router.post('/putaway/suggest', async (req, res) => {
  try {
    const body = PutawayBody.parse(req.body);
    const bins = await prisma.bin.findMany({ where: { warehouseId: body.warehouseId, active: true } });
    if (bins.length === 0) return res.status(404).json({ success: false, error: 'No active bins' });
    let candidates = bins.filter(b => b.capacity - b.occupied >= body.qty);
    if (candidates.length === 0) return res.json({ success: true, data: null, reason: 'No bin with sufficient free capacity', suggestions: bins.slice(0, 3) });
    if (body.preferZone) candidates = candidates.filter(b => b.zone === body.preferZone).concat(candidates.filter(b => b.zone !== body.preferZone));
    if (body.strategy === 'least-full') candidates.sort((a, b) => (a.occupied / Math.max(a.capacity, 1)) - (b.occupied / Math.max(b.capacity, 1)));
    if (body.strategy === 'nearest-pick') candidates.sort((a, b) => (a.zone === 'pick' ? -1 : 1) - (b.zone === 'pick' ? -1 : 1));
    res.json({ success: true, data: candidates[0], alternatives: candidates.slice(1, 4) });
  } catch (err) { const z = zerr(err, res); if (z) return; res.status(500).json({ success: false, error: 'suggest failed' }); }
});

wave4Router.post('/putaway/execute', async (req, res) => {
  const Exec = z.object({ sku: z.string(), qty: z.number().positive(), toBinId: z.string(), fromBinId: z.string().optional().nullable(), strategy: z.string().optional(), movedBy: z.string().optional().nullable() });
  try {
    const body = Exec.parse(req.body);
    const bin = await prisma.bin.findUnique({ where: { id: body.toBinId } });
    if (!bin) return res.status(404).json({ success: false, error: 'Destination bin not found' });
    if (bin.capacity - bin.occupied < body.qty) return res.status(409).json({ success: false, error: 'Insufficient capacity in bin' });
    const [move] = await prisma.$transaction([
      prisma.putawayMove.create({ data: { sku: body.sku, qty: body.qty, toBinId: body.toBinId, fromBinId: body.fromBinId || null, strategy: body.strategy || null, movedBy: body.movedBy || null } }),
      prisma.bin.update({ where: { id: bin.id }, data: { occupied: bin.occupied + body.qty } }),
      ...(body.fromBinId ? [prisma.bin.update({ where: { id: body.fromBinId }, data: { occupied: { decrement: body.qty } } })] : []),
    ]);
    res.status(201).json({ success: true, data: move });
  } catch (err) { const z = zerr(err, res); if (z) return; res.status(500).json({ success: false, error: 'execute failed' }); }
});

// ════════════════════════════════════════════════════════════════════════════
// #24 DEMAND PLANNING — history + moving-average forecast
// ════════════════════════════════════════════════════════════════════════════
const HistCreate = z.object({
  sku: z.string().min(1).max(60),
  period: z.string().min(4).max(20),
  units: z.number().nonnegative(),
  revenue: z.number().nonnegative().default(0),
});

wave4Router.get('/demand/history', async (req, res) => {
  const where: any = {};
  if (req.query.sku) where.sku = String(req.query.sku);
  if (req.query.period) where.period = String(req.query.period);
  const rows = await prisma.demandHistory.findMany({ where, orderBy: { period: 'desc' }, take: 200 });
  res.json({ success: true, data: rows, total: rows.length });
});

wave4Router.post('/demand/history', async (req, res) => {
  try {
    const body = HistCreate.parse(req.body);
    const row = await prisma.demandHistory.upsert({
      where: { sku_period: { sku: body.sku, period: body.period } },
      create: body,
      update: { units: body.units, revenue: body.revenue },
    });
    res.status(201).json({ success: true, data: row });
  } catch (err) { const z = zerr(err, res); if (z) return; res.status(500).json({ success: false, error: 'create failed' }); }
});

wave4Router.post('/demand/forecast', async (req, res) => {
  const FcBody = z.object({
    sku: z.string().min(1).max(60),
    nextPeriods: z.number().int().min(1).max(12).default(3),
    window: z.number().int().min(2).max(12).default(3),
    seasonality: z.number().min(0.1).max(5).default(1),
  });
  try {
    const body = FcBody.parse(req.body);
    const hist = await prisma.demandHistory.findMany({ where: { sku: body.sku }, orderBy: { period: 'asc' } });
    if (hist.length < body.window) return res.status(400).json({ success: false, error: `Need at least ${body.window} historical periods` });
    const recent = hist.slice(-body.window).map(h => h.units);
    const movingAvg = recent.reduce((s, v) => s + v, 0) / body.window;
    const variance = recent.reduce((s, v) => s + Math.pow(v - movingAvg, 2), 0) / body.window;
    const confidence = Math.max(0.1, 1 - Math.sqrt(variance) / Math.max(movingAvg, 1));
    const forecasts: any[] = [];
    const lastPeriod = hist[hist.length - 1].period;
    for (let i = 1; i <= body.nextPeriods; i++) {
      const period = nextPeriod(lastPeriod, i);
      const f = +(movingAvg * body.seasonality).toFixed(2);
      const row = await prisma.demandForecast.upsert({
        where: { sku_period_method: { sku: body.sku, period, method: 'moving_avg' } },
        create: { sku: body.sku, period, forecastUnits: f, method: 'moving_avg', confidence: +confidence.toFixed(3), seasonality: body.seasonality },
        update: { forecastUnits: f, confidence: +confidence.toFixed(3), seasonality: body.seasonality },
      });
      forecasts.push(row);
    }
    res.json({ success: true, data: forecasts, summary: { window: body.window, movingAvg: +movingAvg.toFixed(2), confidence: +confidence.toFixed(3) } });
  } catch (err) { const z = zerr(err, res); if (z) return; res.status(500).json({ success: false, error: 'forecast failed' }); }
});

function nextPeriod(period: string, offset: number): string {
  // Supports YYYY-MM only
  const m = period.match(/^(\d{4})-(\d{2})$/);
  if (!m) return `${period}+${offset}`;
  const d = new Date(Number(m[1]), Number(m[2]) - 1 + offset, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

// ════════════════════════════════════════════════════════════════════════════
// #25 FLEET — vehicles + trips + simple route optimization
// ════════════════════════════════════════════════════════════════════════════
const VehCreate = z.object({
  plate: z.string().min(1).max(20),
  type: z.enum(['van', 'truck', 'car', 'reefer']),
  capacityKg: z.number().nonnegative().default(0),
  homeDepot: z.string().max(120).optional().nullable(),
  driver: z.string().max(60).optional().nullable(),
  fuelType: z.string().max(20).optional().nullable(),
});

wave4Router.get('/vehicles', async (_req, res) => {
  const rows = await prisma.fleetVehicle.findMany({ orderBy: { plate: 'asc' } });
  res.json({ success: true, data: rows, total: rows.length });
});

wave4Router.post('/vehicles', async (req, res) => {
  try {
    const body = VehCreate.parse(req.body);
    const row = await prisma.fleetVehicle.create({ data: body });
    res.status(201).json({ success: true, data: row });
  } catch (err: any) {
    const z = zerr(err, res); if (z) return;
    if (err?.code === 'P2002') return res.status(409).json({ success: false, error: 'Plate exists' });
    res.status(500).json({ success: false, error: 'create failed' });
  }
});

const TripStop = z.object({
  seq: z.number().int().optional(),
  address: z.string().max(200),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

const TripCreate = z.object({
  vehicleId: z.string().min(1),
  driver: z.string().max(60).optional().nullable(),
  stops: z.array(TripStop).min(2),
  optimize: z.boolean().default(true),
});

// Haversine distance in km
function haversine(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371;
  const dLat = (b.lat - a.lat) * Math.PI / 180;
  const dLng = (b.lng - a.lng) * Math.PI / 180;
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * Math.PI / 180) * Math.cos(b.lat * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
}

function totalDistance(stops: { lat: number; lng: number }[]): number {
  let d = 0;
  for (let i = 1; i < stops.length; i++) d += haversine(stops[i - 1], stops[i]);
  return d;
}

// Nearest-neighbour heuristic from stop[0] (depot)
function nearestNeighbour(stops: any[]): any[] {
  if (stops.length <= 2) return stops;
  const route = [stops[0]];
  const remaining = stops.slice(1);
  while (remaining.length > 0) {
    const last = route[route.length - 1];
    let bestIdx = 0;
    let bestDist = Infinity;
    remaining.forEach((s, i) => {
      const d = haversine(last, s);
      if (d < bestDist) { bestDist = d; bestIdx = i; }
    });
    route.push(remaining[bestIdx]);
    remaining.splice(bestIdx, 1);
  }
  return route;
}

wave4Router.get('/trips', async (req, res) => {
  const where: any = {};
  if (req.query.status) where.status = String(req.query.status);
  if (req.query.vehicleId) where.vehicleId = String(req.query.vehicleId);
  const rows = await prisma.fleetTrip.findMany({ where, orderBy: { createdAt: 'desc' }, take: 100 });
  res.json({ success: true, data: rows, total: rows.length });
});

wave4Router.post('/trips', async (req, res) => {
  try {
    const body = TripCreate.parse(req.body);
    const veh = await prisma.fleetVehicle.findUnique({ where: { id: body.vehicleId } });
    if (!veh) return res.status(404).json({ success: false, error: 'Vehicle not found' });
    const original = body.stops.map((s, i) => ({ ...s, seq: i + 1, status: 'pending' }));
    const naiveKm = +totalDistance(original).toFixed(2);
    const optimized = body.optimize ? nearestNeighbour(original).map((s, i) => ({ ...s, seq: i + 1 })) : original;
    const optimizedKm = +totalDistance(optimized).toFixed(2);
    const savingsKm = +(naiveKm - optimizedKm).toFixed(2);
    const row = await prisma.fleetTrip.create({
      data: {
        vehicleId: veh.id,
        driver: body.driver || veh.driver || null,
        stops: optimized,
        distanceKm: naiveKm,
        optimizedKm,
        savingsKm,
        status: 'Planned',
      },
    });
    res.status(201).json({ success: true, data: row, optimization: { naiveKm, optimizedKm, savingsKm, percentSaved: naiveKm ? +(savingsKm / naiveKm * 100).toFixed(1) : 0 } });
  } catch (err) { const z = zerr(err, res); if (z) return; res.status(500).json({ success: false, error: 'create failed' }); }
});

wave4Router.post('/trips/:id/start', async (req, res) => {
  const ex = await prisma.fleetTrip.findUnique({ where: { id: req.params.id } });
  if (!ex) return res.status(404).json({ success: false, error: 'Trip not found' });
  if (ex.status !== 'Planned') return res.status(409).json({ success: false, error: `Cannot start from '${ex.status}'` });
  const row = await prisma.fleetTrip.update({ where: { id: ex.id }, data: { status: 'Active', startedAt: new Date() } });
  res.json({ success: true, data: row });
});

wave4Router.post('/trips/:id/complete', async (req, res) => {
  const ex = await prisma.fleetTrip.findUnique({ where: { id: req.params.id } });
  if (!ex) return res.status(404).json({ success: false, error: 'Trip not found' });
  if (ex.status !== 'Active') return res.status(409).json({ success: false, error: `Cannot complete from '${ex.status}'` });
  const row = await prisma.fleetTrip.update({ where: { id: ex.id }, data: { status: 'Completed', completedAt: new Date() } });
  res.json({ success: true, data: row });
});
