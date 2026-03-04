/**
 * ORDERS CRUD Controller
 * POST /api/orders — create order
 * GET  /api/orders — list orders
 * GET  /api/orders/:id — get order
 * PUT  /api/orders/:id — update order
 * PATCH /api/orders/:id/status — change status
 * DELETE /api/orders/:id — cancel order
 */

import { Router, Request, Response } from 'express';
import { ordersStore } from '../../core/dataStore';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  const { status, customer, city, page, limit } = req.query;
  const result = ordersStore.list(
    { status, customer, city },
    Number(page) || 1,
    Number(limit) || 50
  );
  res.json({ success: true, ...result });
});

router.get('/:id', (req: Request, res: Response) => {
  const order = ordersStore.get(req.params.id);
  if (!order) return res.status(404).json({ success: false, error: 'Order not found' });
  res.json({ success: true, data: order });
});

router.post('/', (req: Request, res: Response) => {
  const { customer, city, channel, amount, currency, items, shippingAddress } = req.body;
  if (!customer || !items) {
    return res.status(400).json({ success: false, error: 'customer and items are required' });
  }
  const order = ordersStore.create({
    customer, city, channel, amount: amount || 0, currency: currency || 'USD',
    items, shippingAddress, status: 'Pending',
    total: amount || items.reduce((s: number, i: any) => s + (i.qty * (i.unitPrice || 0)), 0)
  }, 'order.created');
  res.status(201).json({ success: true, data: order });
});

router.put('/:id', (req: Request, res: Response) => {
  const updated = ordersStore.update(req.params.id, req.body, 'order.updated');
  if (!updated) return res.status(404).json({ success: false, error: 'Order not found' });
  res.json({ success: true, data: updated });
});

router.patch('/:id/status', (req: Request, res: Response) => {
  const { status } = req.body;
  if (!status) return res.status(400).json({ success: false, error: 'status is required' });
  const updated = ordersStore.update(req.params.id, { status }, 'order.updated');
  if (!updated) return res.status(404).json({ success: false, error: 'Order not found' });
  if (status === 'Completed') {
    // Emit completion event for cross-domain
    const { emitDomain } = require('../../core/eventBus').eventBus;
    emitDomain('order.completed', updated, 'orders');
  }
  if (status === 'Cancelled') {
    const { emitDomain } = require('../../core/eventBus').eventBus;
    emitDomain('order.cancelled', updated, 'orders');
  }
  res.json({ success: true, data: updated });
});

router.delete('/:id', (req: Request, res: Response) => {
  const exists = ordersStore.get(req.params.id);
  if (!exists) return res.status(404).json({ success: false, error: 'Order not found' });
  ordersStore.delete(req.params.id);
  res.json({ success: true, message: 'Order deleted' });
});

export default router;
