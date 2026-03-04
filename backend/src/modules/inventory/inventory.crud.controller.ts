/**
 * INVENTORY CRUD Controller
 * POST /api/inventory — add stock item
 * GET  /api/inventory — list stock
 * GET  /api/inventory/:id — get item
 * PUT  /api/inventory/:id — update item
 * POST /api/inventory/adjust — stock adjustment
 * POST /api/inventory/transfer — warehouse transfer
 * DELETE /api/inventory/:id — remove item
 */

import { Router, Request, Response } from 'express';
import { inventoryStore } from '../../core/dataStore';
import { eventBus } from '../../core/eventBus';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  const { category, warehouse, sku, page, limit } = req.query;
  const result = inventoryStore.list(
    { category, warehouse, sku },
    Number(page) || 1,
    Number(limit) || 50
  );
  // Add low-stock flag
  const data = result.data.map(item => ({
    ...item,
    lowStock: item.onHand < (item.minStock || 0)
  }));
  res.json({ success: true, ...result, data });
});

router.get('/low-stock', (_req: Request, res: Response) => {
  const all = inventoryStore.list({}, 1, 1000);
  const lowStock = all.data.filter(item => item.onHand < (item.minStock || 0));
  res.json({ success: true, data: lowStock, total: lowStock.length });
});

router.get('/:id', (req: Request, res: Response) => {
  const item = inventoryStore.get(req.params.id);
  if (!item) return res.status(404).json({ success: false, error: 'Item not found' });
  res.json({ success: true, data: item });
});

router.post('/', (req: Request, res: Response) => {
  const { sku, description, category, onHand, minStock, warehouse, unitCost } = req.body;
  if (!sku || !description) {
    return res.status(400).json({ success: false, error: 'sku and description are required' });
  }
  const item = inventoryStore.create({
    sku, description, category, onHand: onHand || 0, minStock: minStock || 0,
    warehouse: warehouse || 'DEFAULT', unitCost: unitCost || 0
  });
  res.status(201).json({ success: true, data: item });
});

router.post('/adjust', (req: Request, res: Response) => {
  const { id, quantity, reason } = req.body;
  if (!id || quantity === undefined) {
    return res.status(400).json({ success: false, error: 'id and quantity are required' });
  }
  const item = inventoryStore.get(id);
  if (!item) return res.status(404).json({ success: false, error: 'Item not found' });

  const newOnHand = item.onHand + quantity;
  const updated = inventoryStore.update(id, { onHand: newOnHand }, 'inventory.adjusted');

  // Check low stock
  if (updated && updated.onHand < (updated.minStock || 0)) {
    eventBus.emitDomain('inventory.low-stock', {
      sku: updated.sku,
      onHand: updated.onHand,
      minStock: updated.minStock,
      reorderQuantity: (updated.minStock || 0) * 2 - updated.onHand
    }, 'inventory');
  }

  res.json({ success: true, data: updated, adjustment: { quantity, reason } });
});

router.post('/transfer', (req: Request, res: Response) => {
  const { id, fromWarehouse, toWarehouse, quantity } = req.body;
  if (!id || !toWarehouse || !quantity) {
    return res.status(400).json({ success: false, error: 'id, toWarehouse, and quantity are required' });
  }
  const item = inventoryStore.get(id);
  if (!item) return res.status(404).json({ success: false, error: 'Item not found' });
  if (item.onHand < quantity) return res.status(400).json({ success: false, error: 'Insufficient stock' });

  // Deduct from source, we'd create a new entry at target in a real DB
  const updated = inventoryStore.update(id, { onHand: item.onHand - quantity }, 'inventory.transfer');
  res.json({ success: true, data: updated, transfer: { fromWarehouse: item.warehouse, toWarehouse, quantity } });
});

router.put('/:id', (req: Request, res: Response) => {
  const updated = inventoryStore.update(req.params.id, req.body);
  if (!updated) return res.status(404).json({ success: false, error: 'Item not found' });
  res.json({ success: true, data: updated });
});

router.delete('/:id', (req: Request, res: Response) => {
  if (!inventoryStore.get(req.params.id)) return res.status(404).json({ success: false, error: 'Item not found' });
  inventoryStore.delete(req.params.id);
  res.json({ success: true, message: 'Item removed' });
});

export default router;
