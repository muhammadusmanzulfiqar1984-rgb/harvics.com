/**
 * LOGISTICS CRUD Controller
 * 
 * Routes:     POST/GET/PUT/DELETE /api/logistics/routes
 * Deliveries: PATCH /api/logistics/routes/:id/status
 * Summary:    GET /api/logistics/summary
 */

import { Router, Request, Response } from 'express';
import { routesStore } from '../../core/dataStore';
import { eventBus } from '../../core/eventBus';

const router = Router();

// ── SUMMARY ─────────────────────────────────────────────────────────
router.get('/summary', (_req: Request, res: Response) => {
  const routes = routesStore.list({}, 1, 10000);
  const byStatus: Record<string, number> = {};
  routes.data.forEach(r => {
    byStatus[r.status] = (byStatus[r.status] || 0) + 1;
  });
  const totalDistance = routes.data.reduce((s, r) => s + (r.distance || 0), 0);

  res.json({
    success: true,
    data: {
      totalRoutes: routes.total,
      byStatus,
      totalDistance,
      activeDeliveries: routes.data.filter(r => r.status === 'In Transit').length,
      completedToday: routes.data.filter(r => r.status === 'Completed').length,
      onTimeRate: 94.2 // Would be calculated from real delivery data
    }
  });
});

// ── ROUTES ───────────────────────────────────────────────────────────
router.get('/routes', (req: Request, res: Response) => {
  const { status, driver, page, limit } = req.query;
  const result = routesStore.list({ status, driver }, Number(page) || 1, Number(limit) || 50);
  res.json({ success: true, ...result });
});

router.get('/routes/:id', (req: Request, res: Response) => {
  const route = routesStore.get(req.params.id);
  if (!route) return res.status(404).json({ success: false, error: 'Route not found' });
  res.json({ success: true, data: route });
});

router.post('/routes', (req: Request, res: Response) => {
  const { origin, destination, driver, vehicle, distance, orderId } = req.body;
  if (!origin || !destination) return res.status(400).json({ success: false, error: 'origin and destination required' });
  
  const count = routesStore.count();
  const route = routesStore.create({
    routeId: `RT-${String(count + 1).padStart(3, '0')}`,
    origin, destination, driver: driver || 'Unassigned',
    vehicle: vehicle || 'TBD', status: 'Pending',
    eta: new Date(Date.now() + 24 * 3600000).toISOString(),
    distance: distance || 0, orderId
  }, 'logistics.route.created');
  
  res.status(201).json({ success: true, data: route });
});

router.put('/routes/:id', (req: Request, res: Response) => {
  const updated = routesStore.update(req.params.id, req.body);
  if (!updated) return res.status(404).json({ success: false, error: 'Route not found' });
  res.json({ success: true, data: updated });
});

router.patch('/routes/:id/status', (req: Request, res: Response) => {
  const { status } = req.body;
  if (!status) return res.status(400).json({ success: false, error: 'status is required' });
  
  const updated = routesStore.update(req.params.id, { status });
  if (!updated) return res.status(404).json({ success: false, error: 'Route not found' });

  if (status === 'Completed') {
    eventBus.emitDomain('logistics.delivery.completed', {
      routeId: updated.routeId,
      orderId: updated.orderId,
      destination: updated.destination
    }, 'logistics');
  }
  if (status === 'Delayed') {
    eventBus.emitDomain('logistics.delivery.delayed', {
      routeId: updated.routeId,
      orderId: updated.orderId,
      reason: req.body.reason || 'Unknown'
    }, 'logistics');
  }
  
  res.json({ success: true, data: updated });
});

router.delete('/routes/:id', (req: Request, res: Response) => {
  if (!routesStore.get(req.params.id)) return res.status(404).json({ success: false, error: 'Route not found' });
  routesStore.delete(req.params.id);
  res.json({ success: true, message: 'Route deleted' });
});

export default router;
