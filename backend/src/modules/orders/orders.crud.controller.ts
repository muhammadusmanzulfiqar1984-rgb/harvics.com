/**
 * ORDERS CRUD Controller (Prisma-backed)
 * POST /api/orders — create order
 * GET  /api/orders — list orders
 * GET  /api/orders/:id — get order
 * PUT  /api/orders/:id — update order
 * PATCH /api/orders/:id/status — change status
 * DELETE /api/orders/:id — cancel order
 * 
 * LOCALIZATION: All responses are locale-aware based on req.locale
 */

import { Router, Request, Response } from 'express';
import { ordersDb } from '../../core/db';
import { eventBus } from '../../core/eventBus';
import { translateOrderStatus, translateError, translateMessage } from '../../core/translate';
// Import locale middleware types
import '../../middleware/locale';

const router = Router();

// Helper to get locale with fallback
const getLocale = (req: Request): string => (req as any).locale || 'en';

// Helper to add translated status to orders
const localizeOrder = (order: any, locale: string) => {
  if (!order) return order;
  return {
    ...order,
    statusText: translateOrderStatus(order.status, locale),
  };
};

router.get('/', async (req: Request, res: Response) => {
  const locale = getLocale(req);
  const { status, customer, city, page, limit } = req.query;
  const result = await ordersDb.list(
    { status, customer, city },
    Number(page) || 1,
    Number(limit) || 50
  );
  // Localize all orders in response
  const localizedData = result.data.map((order: any) => localizeOrder(order, locale));
  res.json({ success: true, ...result, data: localizedData });
});

router.get('/summary', async (req: Request, res: Response) => {
  const locale = getLocale(req);
  const all = await ordersDb.list({}, 1, 10000);
  const pending = all.data.filter((o: any) => o.status === 'Pending').length;
  const completed = all.data.filter((o: any) => o.status === 'Completed').length;
  const totalAmount = all.data.reduce((s: number, o: any) => s + (o.amount || 0), 0);
  res.json({
    success: true,
    data: { 
      totalOrders: all.total, 
      pending, 
      completed, 
      totalAmount,
      message: translateMessage('fetched', locale)
    }
  });
});

router.get('/:id', async (req: Request, res: Response) => {
  const locale = getLocale(req);
  const order = await ordersDb.get(req.params.id);
  if (!order) return res.status(404).json({ success: false, error: translateError('notFound', locale) });
  res.json({ success: true, data: localizeOrder(order, locale) });
});

router.post('/', async (req: Request, res: Response) => {
  const locale = getLocale(req);
  const { customer, city, channel, amount, currency, items, shippingAddress } = req.body;
  if (!customer || !items) {
    return res.status(400).json({ success: false, error: translateError('missingFields', locale) });
  }
  const order = await ordersDb.create({
    customer, city, channel, amount: amount || 0, currency: currency || 'USD',
    items, shippingAddress, status: 'Pending',
  }, 'order.created');
  res.status(201).json({ success: true, data: localizeOrder(order, locale), message: translateMessage('created', locale) });
});

router.put('/:id', async (req: Request, res: Response) => {
  const locale = getLocale(req);
  const updated = await ordersDb.update(req.params.id, req.body, 'order.updated');
  if (!updated) return res.status(404).json({ success: false, error: translateError('notFound', locale) });
  res.json({ success: true, data: localizeOrder(updated, locale), message: translateMessage('updated', locale) });
});

router.patch('/:id/status', async (req: Request, res: Response) => {
  const locale = getLocale(req);
  const { status } = req.body;
  if (!status) return res.status(400).json({ success: false, error: translateError('missingFields', locale) });
  const updated = await ordersDb.update(req.params.id, { status }, 'order.updated');
  if (!updated) return res.status(404).json({ success: false, error: translateError('notFound', locale) });
  if (status === 'Completed') {
    eventBus.emitDomain('order.completed', updated, 'orders');
  }
  if (status === 'Cancelled') {
    eventBus.emitDomain('order.cancelled', updated, 'orders');
  }
  res.json({ success: true, data: localizeOrder(updated, locale), message: translateMessage('updated', locale) });
});

router.delete('/:id', async (req: Request, res: Response) => {
  const locale = getLocale(req);
  const exists = await ordersDb.get(req.params.id);
  if (!exists) return res.status(404).json({ success: false, error: translateError('notFound', locale) });
  await ordersDb.delete(req.params.id);
  res.json({ success: true, message: translateMessage('deleted', locale) });
});

export default router;
