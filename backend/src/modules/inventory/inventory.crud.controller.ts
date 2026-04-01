/**
 * INVENTORY CRUD Controller (Prisma-backed)
 * POST /api/inventory — add stock item
 * GET  /api/inventory — list stock
 * GET  /api/inventory/:id — get item
 * PUT  /api/inventory/:id — update item
 * POST /api/inventory/adjust — stock adjustment
 * POST /api/inventory/transfer — warehouse transfer
 * DELETE /api/inventory/:id — remove item
 * 
 * LOCALIZATION: All responses are locale-aware based on req.locale
 */

import { Router, Request, Response } from 'express';
import { inventoryDb } from '../../core/db';
import { DomainStore } from '../../core/dataStore';
import { eventBus } from '../../core/eventBus';
import { translateInventoryCategory, translateError, translateMessage, t } from '../../core/translate';
import '../../middleware/locale';

// ── UNIVERSAL BATCH/LOT STORE — industry-neutral ─────────────────────
// itemType: finished-good | raw-material | commodity | asset | component
// industryVertical: FMCG | Textiles | Commodities | Minerals | Oil & Gas | Industrial | Real Estate | All
const batchStore = new DomainStore('inventory-batch', [
  { batchNo: 'BT-2026-0001', sku: 'FMCG-001', description: 'Chicken Nuggets 500g', itemType: 'finished-good', industryVertical: 'FMCG', qty: 12000, remainingQty: 9400, uom: 'units', mfgDate: '2026-01-10', expiryDate: '2026-07-10', grade: null, dyeLot: null, warehouse: 'DXB-W1', bin: 'A4-R2-B3', status: 'Active', supplierId: null },
  { batchNo: 'BT-2026-0002', sku: 'FMCG-025', description: 'Organic Olive Oil 1L', itemType: 'finished-good', industryVertical: 'FMCG', qty: 3200, remainingQty: 1200, uom: 'units', mfgDate: '2026-03-15', expiryDate: '2026-04-02', grade: null, dyeLot: null, warehouse: 'LHR-W2', bin: 'B1-R1-B1', status: 'Expiring', supplierId: null },
  { batchNo: 'BT-2026-0003', sku: 'TEX-010', description: 'Cotton T-Shirt Blank', itemType: 'finished-good', industryVertical: 'Textiles', qty: 8500, remainingQty: 7800, uom: 'pieces', mfgDate: '2026-02-01', expiryDate: null, grade: null, dyeLot: 'DL-240415', warehouse: 'KHI-W1', bin: 'C2-R3-B5', status: 'Active', supplierId: null },
  { batchNo: 'BT-2026-0004', sku: 'COM-015', description: 'Arabica Coffee Beans 25kg', itemType: 'commodity', industryVertical: 'Commodities', qty: 1500, remainingQty: 1450, uom: 'kg', mfgDate: '2026-01-20', expiryDate: '2027-01-20', grade: 'Grade A', dyeLot: null, warehouse: 'DXB-W3', bin: 'Bulk-Zone-4', status: 'Active', supplierId: 'Brazil Coffee Exports' },
  { batchNo: 'BT-2026-0005', sku: 'IND-003', description: 'Industrial Lubricant 20L', itemType: 'raw-material', industryVertical: 'Industrial', qty: 600, remainingQty: 600, uom: 'liters', mfgDate: '2025-11-01', expiryDate: '2027-11-01', grade: 'ISO VG 46', dyeLot: null, warehouse: 'JED-W1', bin: 'H1-R1-B2', status: 'Active', supplierId: null },
  { batchNo: 'BT-2026-0006', sku: 'FMCG-018', description: 'Dark Chocolate 100g', itemType: 'finished-good', industryVertical: 'FMCG', qty: 4500, remainingQty: 320, uom: 'units', mfgDate: '2025-09-01', expiryDate: '2026-03-01', grade: null, dyeLot: null, warehouse: 'LON-W1', bin: 'D4-R1-B2', status: 'Expired', supplierId: null },
  { batchNo: 'BT-2026-0007', sku: 'TEX-015', description: 'Denim Jeans Blue', itemType: 'finished-good', industryVertical: 'Textiles', qty: 5600, remainingQty: 5600, uom: 'pieces', mfgDate: '2026-01-15', expiryDate: null, grade: null, dyeLot: 'DL-240810', warehouse: 'KHI-W1', bin: 'C3-R1-B2', status: 'Active', supplierId: null },
]);

// ── LOCATION / BIN REGISTRY — Warehouse > Zone > Rack > Bin ──────────
const locationStore = new DomainStore('inventory-location', [
  { locationCode: 'DXB-W1', name: 'Dubai Logistics City', type: 'warehouse', capacityM2: 28000, utilPct: 81, activeSKUs: 1245, status: 'Active', industryVertical: 'All' },
  { locationCode: 'LHR-W2', name: 'Lahore Industrial', type: 'warehouse', capacityM2: 15000, utilPct: 44, activeSKUs: 640, status: 'Active', industryVertical: 'Textiles' },
  { locationCode: 'KHI-W1', name: 'Karachi Port', type: 'warehouse', capacityM2: 35000, utilPct: 58, activeSKUs: 1102, status: 'Active', industryVertical: 'All' },
  { locationCode: 'DXB-W3', name: 'Dubai Commodity Hub', type: 'warehouse', capacityM2: 20000, utilPct: 72, activeSKUs: 420, status: 'Active', industryVertical: 'Commodities' },
  { locationCode: 'JED-W1', name: 'Jeddah Industrial Zone', type: 'warehouse', capacityM2: 18000, utilPct: 44, activeSKUs: 380, status: 'Active', industryVertical: 'Industrial' },
  { locationCode: 'LON-W1', name: 'London Bonded Warehouse', type: 'warehouse', capacityM2: 12000, utilPct: 35, activeSKUs: 290, status: 'Active', industryVertical: 'FMCG' },
]);

// ── STOCK MOVEMENT LOG — IN / OUT / TRANSFER / ADJUSTMENT ────────────
const movementStore = new DomainStore('inventory-movement', [
  { movementType: 'IN', sku: 'FMCG-001', batchNo: 'BT-2026-0001', qty: 12000, uom: 'units', fromLocation: null, toLocation: 'DXB-W1', reference: 'GRN-2026-001', industryVertical: 'FMCG', notes: 'PO receipt', user: 'System' },
  { movementType: 'OUT', sku: 'FMCG-001', batchNo: 'BT-2026-0001', qty: -2600, uom: 'units', fromLocation: 'DXB-W1', toLocation: null, reference: 'ORD-2026-0421', industryVertical: 'FMCG', notes: 'Sales order fulfillment', user: 'Ahmed K.' },
  { movementType: 'TRANSFER', sku: 'TEX-010', batchNo: 'BT-2026-0003', qty: 700, uom: 'pieces', fromLocation: 'KHI-W1', toLocation: 'LHR-W2', reference: 'TRF-0841', industryVertical: 'Textiles', notes: 'Regional redistribution', user: 'Sara M.' },
  { movementType: 'ADJUSTMENT', sku: 'COM-015', batchNo: 'BT-2026-0004', qty: -50, uom: 'kg', fromLocation: 'DXB-W3', toLocation: null, reference: 'ADJ-2026-012', industryVertical: 'Commodities', notes: 'Weight variance on recount', user: 'QC Lab' },
  { movementType: 'OUT', sku: 'FMCG-018', batchNo: 'BT-2026-0006', qty: -4180, uom: 'units', fromLocation: 'LON-W1', toLocation: null, reference: 'DISCARD-001', industryVertical: 'FMCG', notes: 'Expired stock disposal', user: 'Warehouse Manager' },
]);

// ── UOM CATALOG with cross-industry conversion factors ────────────────
const UOM_CATALOG = [
  { uom: 'units',     baseUom: 'units',     factor: 1,       industries: ['All'] },
  { uom: 'pieces',    baseUom: 'units',     factor: 1,       industries: ['Textiles', 'FMCG'] },
  { uom: 'kg',        baseUom: 'kg',        factor: 1,       industries: ['FMCG', 'Commodities', 'All'] },
  { uom: 'MT',        baseUom: 'kg',        factor: 1000,    industries: ['Commodities', 'Industrial', 'Minerals'] },
  { uom: 'liters',    baseUom: 'liters',    factor: 1,       industries: ['FMCG', 'Oil & Gas', 'Industrial'] },
  { uom: 'barrels',   baseUom: 'liters',    factor: 158.987, industries: ['Oil & Gas'] },
  { uom: 'meters',    baseUom: 'meters',    factor: 1,       industries: ['Textiles', 'All'] },
  { uom: 'yards',     baseUom: 'meters',    factor: 0.9144,  industries: ['Textiles'] },
  { uom: 'sq.ft',     baseUom: 'sq.meters', factor: 0.0929,  industries: ['Real Estate'] },
  { uom: 'sq.meters', baseUom: 'sq.meters', factor: 1,       industries: ['Real Estate', 'Industrial'] },
];

const router = Router();

// Helper to get locale with fallback
const getLocale = (req: Request): string => (req as any).locale || 'en';

// Helper to localize inventory item
const localizeInventoryItem = (item: any, locale: string) => {
  if (!item) return item;
  return {
    ...item,
    categoryText: translateInventoryCategory(item.category, locale),
    lowStockText: item.onHand < (item.minStock || 0) ? t('inventory.messages.lowStock', locale) : null,
  };
};

router.get('/', async (req: Request, res: Response) => {
  const locale = getLocale(req);
  const { category, warehouse, sku, page, limit } = req.query;
  const result = await inventoryDb.list(
    { category, warehouse, sku },
    Number(page) || 1,
    Number(limit) || 50
  );
  const data = result.data.map((item: any) => ({
    ...localizeInventoryItem(item, locale),
    lowStock: item.onHand < (item.minStock || 0)
  }));
  res.json({ success: true, ...result, data });
});

router.get('/low-stock', async (req: Request, res: Response) => {
  const locale = getLocale(req);
  const all = await inventoryDb.list({}, 1, 1000);
  const lowStock = all.data
    .filter((item: any) => item.onHand < (item.minStock || 0))
    .map((item: any) => localizeInventoryItem(item, locale));
  res.json({ success: true, data: lowStock, total: lowStock.length, message: t('inventory.messages.lowStock', locale) });
});

// ── INVENTORY SUMMARY ────────────────────────────────────────────────
router.get('/summary', async (req: Request, res: Response) => {
  const all = await inventoryDb.list({}, 1, 10000);
  const totalValue = all.data.reduce((s: number, i: any) => s + (i.onHand * (i.unitCost || 0)), 0);
  const lowStockCount = all.data.filter((i: any) => i.onHand < (i.minStock || 0)).length;
  const batches = batchStore.list({}, 1, 10000);
  const expiring = batches.data.filter((b: any) => b.expiryDate && b.status === 'Expiring').length;
  res.json({
    success: true,
    data: {
      totalSKUs: all.total,
      lowStockItems: lowStockCount,
      totalValue: Math.round(totalValue),
      totalBatches: batches.total,
      activeBatches: batches.data.filter((b: any) => b.status === 'Active').length,
      expiringBatches: expiring,
      expiredBatches: batches.data.filter((b: any) => b.status === 'Expired').length,
      totalLocations: locationStore.count(),
      totalMovements: movementStore.count(),
    }
  });
});

// ── BATCH / LOT TRACKING ─────────────────────────────────────────────
router.get('/batch', (req: Request, res: Response) => {
  const { sku, status, industryVertical, warehouse, page, limit } = req.query;
  const result = batchStore.list({ sku, status, industryVertical, warehouse }, Number(page) || 1, Number(limit) || 100);
  res.json({ success: true, ...result });
});

router.get('/batch/fefo', (req: Request, res: Response) => {
  // FEFO: First Expired First Out — sort by expiryDate ASC, nulls last
  // Universal: applies to food (expiry), chemicals (expiry), textiles (by mfgDate), commodities (by grade)
  const { sku } = req.query;
  const all = batchStore.list({ sku }, 1, 10000);
  const withExpiry = all.data.filter((b: any) => b.expiryDate && b.remainingQty > 0 && b.status !== 'Expired');
  const withoutExpiry = all.data.filter((b: any) => !b.expiryDate && b.remainingQty > 0 && b.status !== 'Expired');
  // Sort FEFO: closest expiry first
  withExpiry.sort((a: any, b: any) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());
  // Fallback FIFO for non-expiry items
  withoutExpiry.sort((a: any, b: any) => new Date(a.mfgDate || a.createdAt).getTime() - new Date(b.mfgDate || b.createdAt).getTime());
  const pickList = [...withExpiry, ...withoutExpiry];
  res.json({ success: true, data: pickList, total: pickList.length, strategy: sku ? 'FEFO+FIFO per SKU' : 'FEFO+FIFO all SKUs' });
});

router.get('/batch/:id', (req: Request, res: Response) => {
  const batch = batchStore.get(req.params.id);
  if (!batch) return res.status(404).json({ success: false, error: 'Batch not found' });
  res.json({ success: true, data: batch });
});

router.post('/batch', (req: Request, res: Response) => {
  const { batchNo, sku, description, itemType, industryVertical, qty, uom, mfgDate, expiryDate, grade, dyeLot, warehouse, bin, status, supplierId } = req.body;
  if (!sku || !qty || !warehouse) return res.status(400).json({ success: false, error: 'sku, qty and warehouse required' });
  const count = batchStore.count();
  const batch = batchStore.create({
    batchNo: batchNo || `BT-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`,
    sku, description: description || sku, itemType: itemType || 'finished-good',
    industryVertical: industryVertical || 'All', qty, remainingQty: qty,
    uom: uom || 'units', mfgDate: mfgDate || null, expiryDate: expiryDate || null,
    grade: grade || null, dyeLot: dyeLot || null, warehouse, bin: bin || null,
    status: status || 'Active', supplierId: supplierId || null
  }, 'inventory.batch.created');
  // Also log the movement
  movementStore.create({ movementType: 'IN', sku, batchNo: batch.batchNo, qty, uom: uom || 'units', fromLocation: null, toLocation: warehouse, reference: batch.batchNo, industryVertical: industryVertical || 'All', notes: 'Batch received', user: 'System' });
  res.status(201).json({ success: true, data: batch });
});

router.put('/batch/:id', (req: Request, res: Response) => {
  const updated = batchStore.update(req.params.id, req.body);
  if (!updated) return res.status(404).json({ success: false, error: 'Batch not found' });
  res.json({ success: true, data: updated });
});

// ── LOCATION / BIN REGISTRY ──────────────────────────────────────────
router.get('/location', (req: Request, res: Response) => {
  const { industryVertical, status, page, limit } = req.query;
  const result = locationStore.list({ industryVertical, status }, Number(page) || 1, Number(limit) || 100);
  res.json({ success: true, ...result });
});

router.post('/location', (req: Request, res: Response) => {
  const { locationCode, name, type, capacityM2, industryVertical } = req.body;
  if (!locationCode || !name) return res.status(400).json({ success: false, error: 'locationCode and name required' });
  const loc = locationStore.create({ locationCode, name, type: type || 'warehouse', capacityM2: capacityM2 || 0, utilPct: 0, activeSKUs: 0, status: 'Active', industryVertical: industryVertical || 'All' }, 'inventory.location.created');
  res.status(201).json({ success: true, data: loc });
});

router.put('/location/:id', (req: Request, res: Response) => {
  const updated = locationStore.update(req.params.id, req.body);
  if (!updated) return res.status(404).json({ success: false, error: 'Location not found' });
  res.json({ success: true, data: updated });
});

// ── STOCK MOVEMENT LOG ───────────────────────────────────────────────
router.get('/movement', (req: Request, res: Response) => {
  const { sku, industryVertical, movementType, page, limit } = req.query;
  const result = movementStore.list({ sku, industryVertical, movementType }, Number(page) || 1, Number(limit) || 100);
  res.json({ success: true, ...result });
});

router.post('/movement', (req: Request, res: Response) => {
  const { movementType, sku, batchNo, qty, uom, fromLocation, toLocation, reference, industryVertical, notes, user } = req.body;
  if (!movementType || !sku || qty === undefined) return res.status(400).json({ success: false, error: 'movementType, sku and qty required' });
  const mov = movementStore.create({ movementType, sku, batchNo: batchNo || null, qty, uom: uom || 'units', fromLocation: fromLocation || null, toLocation: toLocation || null, reference: reference || null, industryVertical: industryVertical || 'All', notes: notes || null, user: user || 'System' }, 'inventory.movement.recorded');
  res.status(201).json({ success: true, data: mov });
});

// ── UOM CATALOG ──────────────────────────────────────────────────────
router.get('/uom', (_req: Request, res: Response) => {
  res.json({ success: true, data: UOM_CATALOG, total: UOM_CATALOG.length });
});

// UOM conversion helper endpoint
router.post('/uom/convert', (req: Request, res: Response) => {
  const { qty, fromUom, toUom } = req.body;
  if (!qty || !fromUom || !toUom) return res.status(400).json({ success: false, error: 'qty, fromUom and toUom required' });
  const from = UOM_CATALOG.find(u => u.uom === fromUom);
  const to = UOM_CATALOG.find(u => u.uom === toUom);
  if (!from || !to) return res.status(400).json({ success: false, error: `UOM not found: ${!from ? fromUom : toUom}` });
  if (from.baseUom !== to.baseUom) return res.status(400).json({ success: false, error: `Cannot convert ${fromUom} to ${toUom} — different base units` });
  const converted = (qty * from.factor) / to.factor;
  res.json({ success: true, data: { qty, fromUom, toUom, converted: Math.round(converted * 10000) / 10000 } });
});

router.get('/:id', async (req: Request, res: Response) => {
  const locale = getLocale(req);
  const item = await inventoryDb.get(req.params.id);
  if (!item) return res.status(404).json({ success: false, error: translateError('notFound', locale) });
  res.json({ success: true, data: localizeInventoryItem(item, locale) });
});

router.post('/', async (req: Request, res: Response) => {
  const locale = getLocale(req);
  const { sku, description, category, onHand, minStock, warehouse, unitCost } = req.body;
  if (!sku || !description) {
    return res.status(400).json({ success: false, error: translateError('missingFields', locale) });
  }
  const item = await inventoryDb.create({
    sku, description, category, onHand: onHand || 0, minStock: minStock || 0,
    warehouse: warehouse || 'DEFAULT', unitCost: unitCost || 0
  });
  res.status(201).json({ success: true, data: localizeInventoryItem(item, locale), message: translateMessage('created', locale) });
});

router.post('/adjust', async (req: Request, res: Response) => {
  const locale = getLocale(req);
  const { id, quantity, reason } = req.body;
  if (!id || quantity === undefined) {
    return res.status(400).json({ success: false, error: translateError('missingFields', locale) });
  }
  const item = await inventoryDb.get(id);
  if (!item) return res.status(404).json({ success: false, error: translateError('notFound', locale) });

  const newOnHand = item.onHand + quantity;
  const updated = await inventoryDb.update(id, { onHand: newOnHand }, 'inventory.adjusted');

  if (updated && updated.onHand < (updated.minStock || 0)) {
    eventBus.emitDomain('inventory.low-stock', {
      sku: updated.sku,
      onHand: updated.onHand,
      minStock: updated.minStock,
      reorderQuantity: (updated.minStock || 0) * 2 - updated.onHand
    }, 'inventory');
  }

  res.json({ success: true, data: localizeInventoryItem(updated, locale), adjustment: { quantity, reason }, message: translateMessage('updated', locale) });
});

router.post('/transfer', async (req: Request, res: Response) => {
  const locale = getLocale(req);
  const { id, fromWarehouse, toWarehouse, quantity } = req.body;
  if (!id || !toWarehouse || !quantity) {
    return res.status(400).json({ success: false, error: translateError('missingFields', locale) });
  }
  const item = await inventoryDb.get(id);
  if (!item) return res.status(404).json({ success: false, error: translateError('notFound', locale) });
  if (item.onHand < quantity) return res.status(400).json({ success: false, error: t('inventory.messages.insufficientStock', locale) || 'Insufficient stock' });

  const updated = await inventoryDb.update(id, { onHand: item.onHand - quantity }, 'inventory.transfer');
  res.json({ success: true, data: localizeInventoryItem(updated, locale), transfer: { fromWarehouse: item.warehouse, toWarehouse, quantity }, message: translateMessage('updated', locale) });
});

router.put('/:id', async (req: Request, res: Response) => {
  const locale = getLocale(req);
  const updated = await inventoryDb.update(req.params.id, req.body);
  if (!updated) return res.status(404).json({ success: false, error: translateError('notFound', locale) });
  res.json({ success: true, data: localizeInventoryItem(updated, locale), message: translateMessage('updated', locale) });
});

router.delete('/:id', async (req: Request, res: Response) => {
  const locale = getLocale(req);
  const exists = await inventoryDb.get(req.params.id);
  if (!exists) return res.status(404).json({ success: false, error: translateError('notFound', locale) });
  await inventoryDb.delete(req.params.id);
  res.json({ success: true, message: translateMessage('deleted', locale) });
});

export default router;
