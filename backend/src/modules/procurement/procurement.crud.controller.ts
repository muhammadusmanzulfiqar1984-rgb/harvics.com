/**
 * PROCUREMENT CRUD Controller
 * 
 * Purchase Orders: POST/GET/PUT/DELETE /api/procurement-crud/po
 * GRN:             POST/GET /api/procurement-crud/grn
 * Summary:         GET /api/procurement-crud/summary
 */

import { Router, Request, Response } from 'express';
import { purchaseOrdersStore, DomainStore } from '../../core/dataStore';
import { eventBus } from '../../core/eventBus';

const grnStore = new DomainStore('procurement-grn', [
  { grnNo: 'GRN-2026-001', poNumber: 'PO-2026-001', supplier: 'Vietnam Textiles Co', items: [{ sku: 'TEX-010', received: 4800, ordered: 5000 }], status: 'Partial', receivedDate: '2026-03-01' },
]);

const router = Router();

// ── SUMMARY ─────────────────────────────────────────────────────────
router.get('/summary', (_req: Request, res: Response) => {
  const pos = purchaseOrdersStore.list({}, 1, 10000);
  const grns = grnStore.list({}, 1, 10000);
  const totalValue = pos.data.reduce((s, p) => s + (p.total || 0), 0);
  const pending = pos.data.filter(p => p.status === 'Pending').length;

  res.json({
    success: true,
    data: {
      totalPOs: pos.total,
      pendingPOs: pending,
      approvedPOs: pos.data.filter(p => p.status === 'Approved').length,
      totalValue,
      totalGRNs: grns.total,
      pendingGRNs: grns.data.filter(g => g.status === 'Partial').length
    }
  });
});

// ── PURCHASE ORDERS ──────────────────────────────────────────────────
router.get('/po', (req: Request, res: Response) => {
  const { status, supplier, page, limit } = req.query;
  const result = purchaseOrdersStore.list({ status, supplier }, Number(page) || 1, Number(limit) || 50);
  res.json({ success: true, ...result });
});

router.get('/po/:id', (req: Request, res: Response) => {
  const po = purchaseOrdersStore.get(req.params.id);
  if (!po) return res.status(404).json({ success: false, error: 'PO not found' });
  res.json({ success: true, data: po });
});

router.post('/po', (req: Request, res: Response) => {
  const { supplier, items, currency } = req.body;
  if (!supplier || !items) return res.status(400).json({ success: false, error: 'supplier and items required' });
  
  const total = items.reduce((s: number, i: any) => s + (i.qty * (i.unitPrice || 0)), 0);
  const count = purchaseOrdersStore.count();
  const po = purchaseOrdersStore.create({
    poNumber: `PO-2026-${String(count + 1).padStart(3, '0')}`,
    supplier, items, total, currency: currency || 'USD',
    status: total > 10000 ? 'Pending' : 'Approved', // Auto-approve small POs
    expectedDate: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10)
  }, 'procurement.po.created');

  // If large PO, request approval
  if (total > 10000) {
    eventBus.emitDomain('approval.requested', {
      type: 'purchase_order',
      referenceId: po.poNumber,
      description: `${supplier} — ${items.length} items`,
      amount: total,
      currency: currency || 'USD',
      tier: total > 100000 ? 'regional' : 'country'
    }, 'procurement');
  }

  res.status(201).json({ success: true, data: po });
});

router.put('/po/:id', (req: Request, res: Response) => {
  const updated = purchaseOrdersStore.update(req.params.id, req.body);
  if (!updated) return res.status(404).json({ success: false, error: 'PO not found' });
  res.json({ success: true, data: updated });
});

router.delete('/po/:id', (req: Request, res: Response) => {
  if (!purchaseOrdersStore.get(req.params.id)) return res.status(404).json({ success: false, error: 'PO not found' });
  purchaseOrdersStore.delete(req.params.id);
  res.json({ success: true, message: 'PO deleted' });
});

// ── GRN (Goods Received Notes) ───────────────────────────────────────
router.get('/grn', (req: Request, res: Response) => {
  const result = grnStore.list({}, Number(req.query.page) || 1, Number(req.query.limit) || 50);
  res.json({ success: true, ...result });
});

router.post('/grn', (req: Request, res: Response) => {
  const { poNumber, supplier, items } = req.body;
  if (!poNumber || !items) return res.status(400).json({ success: false, error: 'poNumber and items required' });

  const count = grnStore.count();
  const grn = grnStore.create({
    grnNo: `GRN-2026-${String(count + 1).padStart(3, '0')}`,
    poNumber, supplier, items,
    status: items.every((i: any) => i.received >= i.ordered) ? 'Complete' : 'Partial',
    receivedDate: new Date().toISOString().slice(0, 10)
  }, 'procurement.grn.received');

  res.status(201).json({ success: true, data: grn });
});

export default router;
