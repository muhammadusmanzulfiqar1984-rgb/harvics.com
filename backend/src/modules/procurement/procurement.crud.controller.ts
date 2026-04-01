/**
 * PROCUREMENT CRUD Controller (Prisma-backed)
 * 
 * Purchase Orders: POST/GET/PUT/DELETE /api/procurement-crud/po
 * GRN:             POST/GET /api/procurement-crud/grn
 * Summary:         GET /api/procurement-crud/summary
 * 
 * LOCALIZATION: All responses are locale-aware based on req.locale
 */

import { Router, Request, Response } from 'express';
import { purchaseOrdersDb } from '../../core/db';
import { DomainStore } from '../../core/dataStore';
import { eventBus } from '../../core/eventBus';
import { translateError, translateMessage, t } from '../../core/translate';
import '../../middleware/locale';

// GRN stays in-memory (low volume, no persistence requirement yet)
const grnStore = new DomainStore('procurement-grn', [
  { grnNo: 'GRN-2026-001', poNumber: 'PO-2026-001', supplier: 'Vietnam Textiles Co', items: [{ sku: 'TEX-010', received: 4800, ordered: 5000 }], status: 'Partial', receivedDate: '2026-03-01' },
]);

// Declared here so summary endpoint can reference them at request time
let vendorStore: DomainStore;
let rfqStore: DomainStore;

const router = Router();

// Helper to get locale
const getLocale = (req: Request): string => (req as any).locale || 'en';

// Helper to localize PO status
const localizePO = (po: any, locale: string) => {
  if (!po) return po;
  const statusKey = po.status?.toLowerCase() || 'pending';
  return {
    ...po,
    statusText: t(`procurement.status.${statusKey}`, locale) || po.status,
  };
};

// ── SUMMARY ─────────────────────────────────────────────────────────
router.get('/summary', async (req: Request, res: Response) => {
  const locale = getLocale(req);
  const pos = await purchaseOrdersDb.list({}, 1, 10000);
  const grns = grnStore.list({}, 1, 10000);
  const totalValue = pos.data.reduce((s: number, p: any) => s + (p.total || 0), 0);
  const pending = pos.data.filter((p: any) => p.status === 'Pending').length;

  res.json({
    success: true,
    message: translateMessage('fetched', locale),
    data: {
      totalPOs: pos.total,
      pendingPOs: pending,
      approvedPOs: pos.data.filter((p: any) => p.status === 'Approved').length,
      totalValue,
      totalGRNs: grns.total,
      pendingGRNs: grns.data.filter((g: any) => g.status === 'Partial').length,
      totalVendors: vendorStore ? vendorStore.count() : 0,
      activeVendors: vendorStore ? vendorStore.list({ status: 'Active' }).total : 0,
      openRFQs: rfqStore ? rfqStore.list({ status: 'Open' }).total : 0,
      totalRFQs: rfqStore ? rfqStore.count() : 0,
    }
  });
});

// ── PURCHASE ORDERS ──────────────────────────────────────────────────
router.get('/po', async (req: Request, res: Response) => {
  const locale = getLocale(req);
  const { status, supplier, page, limit } = req.query;
  const result = await purchaseOrdersDb.list({ status, supplier }, Number(page) || 1, Number(limit) || 50);
  const localizedData = result.data.map((po: any) => localizePO(po, locale));
  res.json({ success: true, ...result, data: localizedData });
});

router.get('/po/:id', async (req: Request, res: Response) => {
  const locale = getLocale(req);
  const po = await purchaseOrdersDb.get(req.params.id);
  if (!po) return res.status(404).json({ success: false, error: t('procurement.messages.poNotFound', locale) });
  res.json({ success: true, data: localizePO(po, locale) });
});

router.post('/po', async (req: Request, res: Response) => {
  const locale = getLocale(req);
  const { supplier, items, currency } = req.body;
  if (!supplier || !items) return res.status(400).json({ success: false, error: translateError('missingFields', locale) });

  const total = items.reduce((s: number, i: any) => s + (i.qty * (i.unitPrice || 0)), 0);
  const count = await purchaseOrdersDb.count();
  const po = await purchaseOrdersDb.create({
    poNumber: `PO-2026-${String(count + 1).padStart(3, '0')}`,
    supplier, items, total, currency: currency || 'USD',
    status: total > 10000 ? 'Pending' : 'Approved',
    expectedDate: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10)
  }, 'procurement.po.created');

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

  const message = total > 10000 ? t('procurement.messages.approvalPending', locale) : t('procurement.messages.poCreated', locale);
  res.status(201).json({ success: true, data: localizePO(po, locale), message });
});

router.put('/po/:id', async (req: Request, res: Response) => {
  const updated = await purchaseOrdersDb.update(req.params.id, req.body);
  if (!updated) return res.status(404).json({ success: false, error: 'PO not found' });
  res.json({ success: true, data: updated });
});

router.delete('/po/:id', async (req: Request, res: Response) => {
  const exists = await purchaseOrdersDb.get(req.params.id);
  if (!exists) return res.status(404).json({ success: false, error: 'PO not found' });
  await purchaseOrdersDb.delete(req.params.id);
  res.json({ success: true, message: 'PO deleted' });
});

// ── GRN (Goods Received Notes) — remains in-memory ───────────────────
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

// ── VENDOR MASTER ────────────────────────────────────────────────────
vendorStore = new DomainStore('procurement-vendor', [
  { name: 'Vietnam Textiles Co', country: 'Vietnam', category: 'Textiles', contactEmail: 'contact@vntextiles.vn', paymentTerms: 'Net 30', status: 'Active', riskScore: 'Low', rating: 4.8 },
  { name: 'Brazil Coffee Exports', country: 'Brazil', category: 'FMCG', contactEmail: 'trade@brazilcoffee.br', paymentTerms: 'Net 45', status: 'Active', riskScore: 'Low', rating: 4.5 },
  { name: 'Morocco Phosphate Ltd', country: 'Morocco', category: 'Minerals', contactEmail: 'ops@maphos.ma', paymentTerms: 'LC 60', status: 'Active', riskScore: 'Medium', rating: 4.1 },
  { name: 'UAE Workwear Solutions', country: 'UAE', category: 'Apparel', contactEmail: 'b2b@uaeworkwear.ae', paymentTerms: 'Net 30', status: 'Under Review', riskScore: 'Medium', rating: 3.9 },
]);

router.get('/vendor', (req: Request, res: Response) => {
  const { status, category, page, limit } = req.query;
  const result = vendorStore.list({ status, category }, Number(page) || 1, Number(limit) || 50);
  res.json({ success: true, ...result });
});

router.get('/vendor/:id', (req: Request, res: Response) => {
  const vendor = vendorStore.get(req.params.id);
  if (!vendor) return res.status(404).json({ success: false, error: 'Vendor not found' });
  res.json({ success: true, data: vendor });
});

router.post('/vendor', (req: Request, res: Response) => {
  const { name, country, category, contactEmail, paymentTerms } = req.body;
  if (!name || !country || !category) return res.status(400).json({ success: false, error: 'name, country and category required' });
  const vendor = vendorStore.create({
    name, country, category,
    contactEmail: contactEmail || '',
    paymentTerms: paymentTerms || 'Net 30',
    status: 'Active', riskScore: 'Low', rating: 0
  }, 'procurement.vendor.created');
  res.status(201).json({ success: true, data: vendor });
});

router.put('/vendor/:id', (req: Request, res: Response) => {
  const updated = vendorStore.update(req.params.id, req.body);
  if (!updated) return res.status(404).json({ success: false, error: 'Vendor not found' });
  res.json({ success: true, data: updated });
});

router.delete('/vendor/:id', (req: Request, res: Response) => {
  const vendor = vendorStore.get(req.params.id);
  if (!vendor) return res.status(404).json({ success: false, error: 'Vendor not found' });
  vendorStore.delete(req.params.id);
  res.json({ success: true, message: 'Vendor deleted' });
});

// ── RFQ (Request for Quotation) ──────────────────────────────────────
rfqStore = new DomainStore('procurement-rfq', [
  { rfqNo: 'RFQ-2026-001', title: 'Organic Cotton — 10,000 units', category: 'Textiles', targetPrice: 28000, currency: 'USD', deadline: '2026-04-15', status: 'Open', suppliersInvited: 3, quotesReceived: 1, quotes: [] },
  { rfqNo: 'RFQ-2026-002', title: 'Arabica Coffee Beans — 5 MT', category: 'FMCG', targetPrice: 18000, currency: 'USD', deadline: '2026-04-10', status: 'Closed', suppliersInvited: 4, quotesReceived: 4, quotes: [] },
]);

router.get('/rfq', (req: Request, res: Response) => {
  const { status, page, limit } = req.query;
  const result = rfqStore.list({ status }, Number(page) || 1, Number(limit) || 50);
  res.json({ success: true, ...result });
});

router.get('/rfq/:id', (req: Request, res: Response) => {
  const rfq = rfqStore.get(req.params.id);
  if (!rfq) return res.status(404).json({ success: false, error: 'RFQ not found' });
  res.json({ success: true, data: rfq });
});

router.post('/rfq', (req: Request, res: Response) => {
  const { title, category, targetPrice, currency, deadline, items } = req.body;
  if (!title || !category) return res.status(400).json({ success: false, error: 'title and category required' });
  const count = rfqStore.count();
  const rfq = rfqStore.create({
    rfqNo: `RFQ-2026-${String(count + 1).padStart(3, '0')}`,
    title, category,
    targetPrice: targetPrice || 0,
    currency: currency || 'USD',
    deadline: deadline || new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
    status: 'Open', suppliersInvited: 0, quotesReceived: 0,
    items: items || [], quotes: []
  }, 'procurement.rfq.created');
  res.status(201).json({ success: true, data: rfq });
});

router.put('/rfq/:id', (req: Request, res: Response) => {
  const updated = rfqStore.update(req.params.id, req.body);
  if (!updated) return res.status(404).json({ success: false, error: 'RFQ not found' });
  res.json({ success: true, data: updated });
});

// Submit a supplier quote to an RFQ
router.post('/rfq/:id/quote', (req: Request, res: Response) => {
  const rfq = rfqStore.get(req.params.id);
  if (!rfq) return res.status(404).json({ success: false, error: 'RFQ not found' });
  if (rfq.status !== 'Open') return res.status(400).json({ success: false, error: 'RFQ is not open for quotes' });
  const { supplierId, price, incoterms, deliveryDate } = req.body;
  if (!supplierId || !price) return res.status(400).json({ success: false, error: 'supplierId and price required' });
  const quotes = [...(rfq.quotes || []), { supplierId, price, incoterms, deliveryDate, submittedAt: new Date().toISOString() }];
  const updated = rfqStore.update(req.params.id, { quotes, quotesReceived: quotes.length });
  res.status(201).json({ success: true, data: updated });
});

// ── 3-WAY MATCH (PO → GRN → Invoice) ────────────────────────────────
router.get('/3way-match/:poNumber', async (req: Request, res: Response) => {
  const { poNumber } = req.params;

  // 1. Find PO in DB
  const pos = await purchaseOrdersDb.list({}, 1, 10000);
  const po = pos.data.find((p: any) => p.poNumber === poNumber);
  if (!po) return res.status(404).json({ success: false, error: `PO ${poNumber} not found` });

  // 2. Find GRN for this PO
  const grns = grnStore.list({}, 1, 10000);
  const grn = grns.data.find((g: any) => g.poNumber === poNumber);

  // 3. Build match result (Invoice leg to be wired when Finance invoice module is complete)
  const match = {
    poNumber,
    po: { value: po.total, status: po.status, supplier: po.supplier, currency: po.currency },
    grn: grn
      ? { grnNo: grn.grnNo, status: grn.status, receivedDate: grn.receivedDate }
      : null,
    invoice: null, // wired when AP Invoice module is built
    matchStatus: !grn
      ? 'Pending GRN'
      : grn.status === 'Partial'
        ? 'Partial Match'
        : 'Matched',
    readyForPayment: grn?.status === 'Complete' && po.status === 'Approved',
    discrepancy: grn?.status === 'Partial'
      ? 'GRN partially received — verify quantities before authorising payment'
      : null
  };

  res.json({ success: true, data: match });
});

export default router;
