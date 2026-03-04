/**
 * FINANCE CRUD Controller
 * 
 * Invoices:  POST/GET/PUT/DELETE /api/finance/invoices
 * Payments:  POST/GET /api/finance/payments
 * Journal:   POST/GET /api/finance/journal
 * Summary:   GET /api/finance/summary
 */

import { Router, Request, Response } from 'express';
import { invoicesStore, paymentsStore, journalStore } from '../../core/dataStore';
import { eventBus } from '../../core/eventBus';

const router = Router();

// ── SUMMARY ─────────────────────────────────────────────────────────
router.get('/summary', (_req: Request, res: Response) => {
  const invoices = invoicesStore.list({}, 1, 10000);
  const payments = paymentsStore.list({}, 1, 10000);
  
  const totalAR = invoices.data.filter(i => i.type === 'AR' && i.status !== 'Paid').reduce((s, i) => s + (i.amount || 0), 0);
  const totalPaid = payments.data.reduce((s, p) => s + (p.amount || 0), 0);
  const overdue = invoices.data.filter(i => i.status === 'Overdue').length;
  
  res.json({
    success: true,
    data: {
      totalReceivable: totalAR,
      totalCollected: totalPaid,
      overdueInvoices: overdue,
      totalInvoices: invoices.total,
      totalPayments: payments.total,
      totalJournalEntries: journalStore.count()
    }
  });
});

// ── INVOICES ─────────────────────────────────────────────────────────
router.get('/invoices', (req: Request, res: Response) => {
  const { status, type, customer, page, limit } = req.query;
  const result = invoicesStore.list({ status, type, customer }, Number(page) || 1, Number(limit) || 50);
  res.json({ success: true, ...result });
});

router.get('/invoices/:id', (req: Request, res: Response) => {
  const inv = invoicesStore.get(req.params.id);
  if (!inv) return res.status(404).json({ success: false, error: 'Invoice not found' });
  res.json({ success: true, data: inv });
});

router.post('/invoices', (req: Request, res: Response) => {
  const { customer, amount, currency, dueDate, type } = req.body;
  if (!customer || !amount) return res.status(400).json({ success: false, error: 'customer and amount required' });
  
  const count = invoicesStore.count();
  const inv = invoicesStore.create({
    invoiceNo: `INV-2026-${String(count + 1).padStart(3, '0')}`,
    customer, amount, currency: currency || 'USD',
    dueDate: dueDate || new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
    type: type || 'AR', status: 'Unpaid'
  }, 'finance.invoice.created');
  
  res.status(201).json({ success: true, data: inv });
});

router.put('/invoices/:id', (req: Request, res: Response) => {
  const updated = invoicesStore.update(req.params.id, req.body);
  if (!updated) return res.status(404).json({ success: false, error: 'Invoice not found' });
  res.json({ success: true, data: updated });
});

router.delete('/invoices/:id', (req: Request, res: Response) => {
  if (!invoicesStore.get(req.params.id)) return res.status(404).json({ success: false, error: 'Invoice not found' });
  invoicesStore.delete(req.params.id);
  res.json({ success: true, message: 'Invoice deleted' });
});

// ── PAYMENTS ─────────────────────────────────────────────────────────
router.get('/payments', (req: Request, res: Response) => {
  const result = paymentsStore.list({}, Number(req.query.page) || 1, Number(req.query.limit) || 50);
  res.json({ success: true, ...result });
});

router.post('/payments', (req: Request, res: Response) => {
  const { invoiceNo, amount, currency, method, reference } = req.body;
  if (!invoiceNo || !amount) return res.status(400).json({ success: false, error: 'invoiceNo and amount required' });
  
  const payment = paymentsStore.create({
    invoiceNo, amount, currency: currency || 'USD',
    method: method || 'Bank Transfer',
    reference: reference || `TXN-${Date.now()}`,
    receivedDate: new Date().toISOString().slice(0, 10)
  }, 'finance.payment.received');

  // Mark invoice as paid if found
  const allInvoices = invoicesStore.list({ invoiceNo }, 1, 1);
  if (allInvoices.data.length > 0) {
    invoicesStore.update(allInvoices.data[0].id, { status: 'Paid' });
  }

  res.status(201).json({ success: true, data: payment });
});

// ── JOURNAL ENTRIES ──────────────────────────────────────────────────
router.get('/journal', (req: Request, res: Response) => {
  const result = journalStore.list({}, Number(req.query.page) || 1, Number(req.query.limit) || 50);
  res.json({ success: true, ...result });
});

router.post('/journal', (req: Request, res: Response) => {
  const { description, debit, credit, amount, currency } = req.body;
  if (!description || !debit || !credit || !amount) {
    return res.status(400).json({ success: false, error: 'description, debit, credit, amount required' });
  }
  const count = journalStore.count();
  const entry = journalStore.create({
    entryNo: `JE-2026-${String(count + 1).padStart(3, '0')}`,
    description, debit, credit, amount, currency: currency || 'USD',
    postedDate: new Date().toISOString().slice(0, 10)
  }, 'finance.journal.posted');
  
  res.status(201).json({ success: true, data: entry });
});

export default router;
