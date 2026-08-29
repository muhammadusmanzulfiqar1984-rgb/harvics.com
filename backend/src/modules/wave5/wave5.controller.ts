/**
 * HARVICS OS — Wave 5 Controller (Bucket B, 16 modules)
 *   #6 PaymentRun, #9 CPQ, #15 Contracts, #16 SourcingNet, #18 ShopFloor,
 *   #28 3PL, #30 Talent, #31 LMS, #32 Performance, #33 Workforce,
 *   #35 PM, #36 Properties, #41 BI Reports, #42 Board Pack,
 *   #44 Variance AI, #46 Service, #47 Pro Services
 */
import { Request, Response, Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../core/prisma';
import { emitAudit } from '../../services/audit.service';
import { eventBus } from '../../core/eventBus';
import { varianceLineCommentary } from '../../services/aiService';

export const wave5Router = Router();

function zerr(err: unknown, res: Response): Response | undefined {
  if (err instanceof z.ZodError) return res.status(400).json({ success: false, error: 'validation', issues: err.issues });
  return undefined;
}
async function uniqueCatch<T>(fn: () => Promise<T>, res: Response): Promise<T | Response> {
  try { return await fn(); } catch (err: any) {
    if (err?.code === 'P2002') return res.status(409).json({ success: false, error: 'Unique constraint violated', target: err?.meta?.target });
    throw err;
  }
}

// ─── #6 PAYMENT RUNS (Draft → Approved → Released → Paid) ───────────────────
wave5Router.get('/payment-runs', async (_req, res) => {
  try {
    const rows = await prisma.paymentRun.findMany({ include: { items: true }, orderBy: { createdAt: 'desc' }, take: 100 });
    res.json({ success: true, data: rows, total: rows.length });
  } catch (err: any) {
    if (err?.code === 'P2021') {
      return res.status(503).json({
        success: false,
        error: 'PaymentRun table missing — apply prisma/manual/module5_6_treasury_hpay_additive.sql',
      });
    }
    res.status(500).json({ success: false, error: err?.message || 'list failed' });
  }
});
wave5Router.get('/payment-runs/:id', async (req, res) => {
  try {
    const row = await prisma.paymentRun.findUnique({ where: { id: req.params.id }, include: { items: true } });
    if (!row) return res.status(404).json({ success: false, error: 'Payment run not found' });
    res.json({ success: true, data: row });
  } catch (err: any) {
    if (err?.code === 'P2021') {
      return res.status(503).json({
        success: false,
        error: 'PaymentRun table missing — apply prisma/manual/module5_6_treasury_hpay_additive.sql',
      });
    }
    res.status(500).json({ success: false, error: err?.message || 'get failed' });
  }
});
wave5Router.post('/payment-runs', async (req, res) => {
  const Body = z.object({ runNo: z.string().min(2), description: z.string().optional().nullable(), currency: z.string().default('USD'), items: z.array(z.object({ payeeName: z.string().min(1), amount: z.number().positive(), payeeAccount: z.string().optional().nullable(), invoiceRef: z.string().optional().nullable() })).default([]) });
  try {
    const b = Body.parse(req.body);
    const total = b.items.reduce((s, i) => s + i.amount, 0);
    const run = await uniqueCatch(() => prisma.paymentRun.create({ data: { runNo: b.runNo, description: b.description ?? null, currency: b.currency, totalAmount: total, itemCount: b.items.length, status: 'Draft', items: { create: b.items.map(i => ({ ...i, currency: b.currency })) } }, include: { items: true } }), res);
    if ((run as Response).statusCode) return;
    void emitAudit(req, 'paymentRun.created', 'PaymentRun', (run as any).id, { module: 'hpay' });
    eventBus.emitDomain('finance.paymentrun.created', run, 'hpay');
    res.status(201).json({ success: true, data: run });
  } catch (err: any) {
    const z = zerr(err, res); if (z) return;
    if (err?.code === 'P2021') {
      return res.status(503).json({
        success: false,
        error: 'PaymentRun table missing — apply prisma/manual/module5_6_treasury_hpay_additive.sql',
      });
    }
    res.status(500).json({ success: false, error: 'create failed' });
  }
});
/** Batch open AP bills into a Draft payment run (links invoiceRef). */
wave5Router.post('/payment-runs/from-ap', async (req, res) => {
  const Body = z.object({
    runNo: z.string().min(2).optional(),
    description: z.string().optional().nullable(),
    currency: z.string().default('USD'),
    invoiceIds: z.array(z.string().min(1)).optional(),
    maxItems: z.number().int().positive().max(200).optional(),
  });
  try {
    const b = Body.parse(req.body || {});
    const invoices = await prisma.invoice.findMany({
      where: b.invoiceIds?.length
        ? { id: { in: b.invoiceIds } }
        : {
            OR: [{ type: 'AP' }, { type: 'VENDOR' }, { type: 'ap' }, { type: 'vendor' }],
            status: { in: ['Unpaid', 'Overdue', 'Partial'] },
          },
      include: { payments: true },
      take: b.maxItems || 100,
      orderBy: { dueDate: 'asc' },
    });
    const items = invoices
      .map((inv) => {
        const paid = (inv.payments || []).reduce((s, p) => s + (Number(p.amount) || 0), 0);
        const outstanding = Math.max(0, +(Number(inv.amount) - paid).toFixed(2));
        if (outstanding <= 0) return null;
        return {
          payeeName: inv.customerName || 'Vendor',
          amount: outstanding,
          invoiceRef: inv.invoiceNo,
          currency: b.currency || inv.currency || 'USD',
        };
      })
      .filter(Boolean) as { payeeName: string; amount: number; invoiceRef: string; currency: string }[];
    if (!items.length) {
      return res.status(400).json({ success: false, error: 'No open AP bills with outstanding balance' });
    }
    const runNo = b.runNo || `PR-AP-${Date.now().toString().slice(-6)}`;
    const total = items.reduce((s, i) => s + i.amount, 0);
    const run = await uniqueCatch(
      () =>
        prisma.paymentRun.create({
          data: {
            runNo,
            description: b.description ?? `Batch AP pay · ${items.length} bills`,
            currency: b.currency,
            totalAmount: total,
            itemCount: items.length,
            status: 'Draft',
            items: { create: items },
          },
          include: { items: true },
        }),
      res,
    );
    if ((run as Response).statusCode) return;
    void emitAudit(req, 'paymentRun.created_from_ap', 'PaymentRun', (run as any).id, {
      module: 'hpay',
      payload: { itemCount: items.length, totalAmount: total },
    });
    eventBus.emitDomain('finance.paymentrun.created', run, 'hpay');
    res.status(201).json({ success: true, data: run, message: `Draft ${runNo} from ${items.length} AP bills` });
  } catch (err: any) {
    const z = zerr(err, res); if (z) return;
    if (err?.code === 'P2021') {
      return res.status(503).json({
        success: false,
        error: 'PaymentRun/Invoice table missing — apply additive SQL',
      });
    }
    res.status(500).json({ success: false, error: err?.message || 'from-ap failed' });
  }
});
wave5Router.post('/payment-runs/:id/approve', async (req, res) => {
  try {
    const ex = await prisma.paymentRun.findUnique({ where: { id: req.params.id }, include: { items: true } });
    if (!ex) return res.status(404).json({ success: false, error: 'Not found' });
    if (ex.status !== 'Draft') return res.status(409).json({ success: false, error: `Cannot approve from '${ex.status}'` });
    if (!ex.items?.length) return res.status(400).json({ success: false, error: 'Cannot approve empty payment run' });
    const run = await prisma.paymentRun.update({ where: { id: ex.id }, data: { status: 'Approved' }, include: { items: true } });
    void emitAudit(req, 'paymentRun.approved', 'PaymentRun', run.id, { module: 'hpay' });
    eventBus.emitDomain('finance.paymentrun.approved', run, 'hpay');
    res.json({ success: true, data: run, message: 'Payment run approved' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || 'approve failed' });
  }
});
wave5Router.post('/payment-runs/:id/release', async (req, res) => {
  try {
    const ex = await prisma.paymentRun.findUnique({ where: { id: req.params.id } });
    if (!ex) return res.status(404).json({ success: false, error: 'Not found' });
    if (ex.status !== 'Draft' && ex.status !== 'Approved') {
      return res.status(409).json({ success: false, error: `Cannot release from '${ex.status}'` });
    }
    const [run] = await prisma.$transaction([
      prisma.paymentRun.update({
        where: { id: ex.id },
        data: { status: 'Released', releasedAt: new Date(), releasedBy: (req as any).user?.userId || null },
        include: { items: true },
      }),
      prisma.paymentRunItem.updateMany({ where: { runId: ex.id }, data: { status: 'Paid' } }),
    ]);
    void emitAudit(req, 'paymentRun.released', 'PaymentRun', run.id, { module: 'hpay' });
    eventBus.emitDomain('finance.paymentrun.released', run, 'hpay');
    res.json({ success: true, data: run, message: 'Payment run released' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || 'release failed' });
  }
});
wave5Router.post('/payment-runs/:id/mark-paid', async (req, res) => {
  try {
    const ex = await prisma.paymentRun.findUnique({ where: { id: req.params.id } });
    if (!ex) return res.status(404).json({ success: false, error: 'Not found' });
    if (ex.status !== 'Released') {
      return res.status(409).json({ success: false, error: `Cannot mark paid from '${ex.status}' — release first` });
    }
    const [run] = await prisma.$transaction([
      prisma.paymentRun.update({ where: { id: ex.id }, data: { status: 'Paid' }, include: { items: true } }),
      prisma.paymentRunItem.updateMany({ where: { runId: ex.id }, data: { status: 'Paid' } }),
    ]);
    void emitAudit(req, 'paymentRun.paid', 'PaymentRun', run.id, { module: 'hpay' });
    eventBus.emitDomain('finance.paymentrun.paid', run, 'hpay');
    res.json({ success: true, data: run, message: 'Payment run settled (Paid)' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || 'mark-paid failed' });
  }
});
wave5Router.post('/payment-runs/:id/cancel', async (req, res) => {
  try {
    const ex = await prisma.paymentRun.findUnique({ where: { id: req.params.id } });
    if (!ex) return res.status(404).json({ success: false, error: 'Not found' });
    if (!['Draft', 'Approved'].includes(ex.status)) {
      return res.status(409).json({ success: false, error: `Cannot cancel from '${ex.status}'` });
    }
    const run = await prisma.paymentRun.update({
      where: { id: ex.id },
      data: { status: 'Cancelled' },
      include: { items: true },
    });
    void emitAudit(req, 'paymentRun.cancelled', 'PaymentRun', run.id, { module: 'hpay' });
    eventBus.emitDomain('finance.paymentrun.cancelled', run, 'hpay');
    res.json({ success: true, data: run, message: 'Payment run cancelled' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || 'cancel failed' });
  }
});

// ─── #9 CPQ — QUOTES ────────────────────────────────────────────────────────
wave5Router.get('/quotes', async (req, res) => {
  try {
    const where: any = {};
    if (req.query.status) where.status = String(req.query.status);
    const rows = await prisma.quote.findMany({
      where,
      include: { lines: true },
      orderBy: { createdAt: 'desc' },
      take: Math.min(Number(req.query.limit) || 100, 200),
    });
    res.json({ success: true, source: 'prisma', data: rows, total: rows.length });
  } catch (err: any) {
    if (err?.code === 'P2021') {
      return res.status(503).json({
        success: false,
        error: 'Quote table missing — apply prisma/manual/module9_cpq_additive.sql',
      });
    }
    res.status(500).json({ success: false, error: err?.message || 'list failed' });
  }
});

wave5Router.get('/quotes/:id', async (req, res) => {
  try {
    const row = await prisma.quote.findUnique({ where: { id: req.params.id }, include: { lines: true } });
    if (!row) return res.status(404).json({ success: false, error: 'Quote not found' });
    res.json({ success: true, source: 'prisma', data: row });
  } catch (err: any) {
    if (err?.code === 'P2021') {
      return res.status(503).json({
        success: false,
        error: 'Quote table missing — apply prisma/manual/module9_cpq_additive.sql',
      });
    }
    res.status(500).json({ success: false, error: err?.message || 'get failed' });
  }
});

wave5Router.post('/quotes', async (req, res) => {
  const Body = z.object({
    quoteNo: z.string().min(2).optional(),
    customerName: z.string().min(1),
    currency: z.string().default('USD'),
    discount: z.number().min(0).default(0),
    validUntil: z.coerce.date().optional().nullable(),
    notes: z.string().optional().nullable(),
    taxCountry: z.string().length(2).regex(/^[A-Z]{2}$/),
    taxType: z.enum(['VAT', 'GST', 'Sales', 'Excise', 'Withholding']).default('VAT'),
    lines: z.array(z.object({
      sku: z.string().min(1),
      description: z.string().optional().nullable(),
      qty: z.number().positive(),
      unitPrice: z.number().nonnegative(),
      discount: z.number().min(0).default(0),
    })).min(1),
  });
  try {
    const b = Body.parse(req.body);
    const count = await prisma.quote.count();
    const quoteNo = b.quoteNo || `Q-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;
    const linesCalc = b.lines.map((l) => ({
      sku: l.sku,
      description: l.description ?? null,
      qty: l.qty,
      unitPrice: l.unitPrice,
      discount: l.discount,
      lineTotal: +(l.qty * l.unitPrice * (1 - l.discount / 100)).toFixed(2),
    }));
    const subtotal = +linesCalc.reduce((s, l) => s + l.lineTotal, 0).toFixed(2);
    const afterDiscount = +(subtotal * (1 - b.discount / 100)).toFixed(2);

    // Tax Engine: missing rate → BLOCK quote (no estimates)
    const now = new Date();
    const taxRate = await prisma.taxRate.findFirst({
      where: {
        country: b.taxCountry,
        taxType: b.taxType,
        effectiveFrom: { lte: now },
        OR: [{ effectiveTo: null }, { effectiveTo: { gte: now } }],
      },
      orderBy: { effectiveFrom: 'desc' },
    });
    if (!taxRate) {
      return res.status(422).json({
        success: false,
        error: `Tax Engine: no active ${b.taxType} rate for ${b.taxCountry}. Configure /api/platform/tax/rates before creating quotes.`,
        code: 'TAX_RATE_MISSING',
      });
    }
    const taxAmount = +(afterDiscount * taxRate.ratePercent / 100).toFixed(2);
    const total = +(afterDiscount + taxAmount).toFixed(2);

    const row = await prisma.quote.create({
      data: {
        quoteNo,
        customerName: b.customerName,
        currency: b.currency,
        discount: b.discount,
        validUntil: b.validUntil ?? null,
        notes: b.notes ?? null,
        subtotal,
        taxCountry: b.taxCountry,
        taxType: b.taxType,
        taxRatePercent: taxRate.ratePercent,
        taxAmount,
        total,
        status: 'Draft',
        createdBy: (req as any).user?.id || null,
        lines: { create: linesCalc },
      },
      include: { lines: true },
    });
    void emitAudit(req, 'quote.created', 'Quote', row.id, { module: 'cpq' });
    eventBus.emitDomain('sales.quote.created', row, 'cpq');
    res.status(201).json({ success: true, source: 'prisma', data: row });
  } catch (err: any) {
    const z = zerr(err, res); if (z) return;
    if (err?.code === 'P2002') return res.status(409).json({ success: false, error: 'Quote number already exists' });
    if (err?.code === 'P2021') {
      return res.status(503).json({
        success: false,
        error: 'Quote table missing — apply prisma/manual/module9_cpq_additive.sql',
      });
    }
    res.status(500).json({ success: false, error: err?.message || 'create failed' });
  }
});

/** SAP-style quote lifecycle: Draft → Sent → Accepted|Rejected|Expired */
const QUOTE_TRANSITIONS: Record<string, string[]> = {
  Draft: ['Sent', 'Expired', 'Rejected'],
  Sent: ['Accepted', 'Rejected', 'Expired'],
  Accepted: [],
  Rejected: [],
  Expired: [],
};

wave5Router.post('/quotes/:id/status', async (req, res) => {
  const Body = z.object({
    status: z.enum(['Draft', 'Sent', 'Accepted', 'Rejected', 'Expired']),
    createArInvoice: z.boolean().optional().default(true),
    createSalesOrder: z.boolean().optional().default(true),
  });
  try {
    const b = Body.parse(req.body);
    const ex = await prisma.quote.findUnique({ where: { id: req.params.id }, include: { lines: true } });
    if (!ex) return res.status(404).json({ success: false, error: 'Not found' });
    if (ex.status === b.status) {
      return res.json({ success: true, source: 'prisma', data: ex, message: 'Status unchanged' });
    }
    const allowed = QUOTE_TRANSITIONS[ex.status] || [];
    if (!allowed.includes(b.status)) {
      return res.status(409).json({
        success: false,
        error: `Cannot transition quote from '${ex.status}' to '${b.status}'`,
        allowed,
      });
    }
    const row = await prisma.quote.update({ where: { id: ex.id }, data: { status: b.status } });
    void emitAudit(req, 'quote.status', 'Quote', row.id, {
      module: 'cpq',
      payload: { from: ex.status, to: b.status },
    });
    eventBus.emitDomain('sales.quote.status', { ...row, from: ex.status }, 'cpq');

    let salesOrder = null;
    let invoice = null;

    // Accepted quote → SalesOrder (commercial commitment), then optional AR invoice
    if (b.status === 'Accepted' && b.createSalesOrder !== false) {
      const idempotencyKey = `quote:${ex.id}`;
      const existingOrder = await prisma.salesOrder.findUnique({ where: { idempotencyKey } });
      if (existingOrder) {
        salesOrder = await prisma.salesOrder.findUnique({
          where: { id: existingOrder.id },
          include: { lines: true },
        });
      } else {
        const count = await prisma.salesOrder.count();
        const orderNumber = `SO-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;
        const customer = await prisma.customer.findFirst({
          where: { name: { equals: ex.customerName, mode: 'insensitive' } },
        });
        let creditHold = false;
        if (customer) {
          const credit = await prisma.creditLimit.findUnique({ where: { customerId: customer.id } });
          if (credit && ex.total > credit.availableAmount) creditHold = true;
        }
        salesOrder = await prisma.salesOrder.create({
          data: {
            orderNumber,
            quoteId: ex.id,
            customerId: customer?.id ?? null,
            customerName: ex.customerName,
            status: creditHold ? 'CREDIT_HOLD' : 'CONFIRMED',
            currency: ex.currency || 'USD',
            subtotal: ex.subtotal,
            discountAmount: +(ex.subtotal * (ex.discount / 100)).toFixed(2),
            taxAmount: (ex as any).taxAmount ?? 0,
            totalAmount: ex.total,
            idempotencyKey,
            notes: ex.notes,
            createdBy: (req as any).user?.userId || null,
            lines: {
              create: (ex.lines || []).map((l, i) => ({
                lineNumber: i + 1,
                sku: l.sku,
                description: l.description,
                quantity: l.qty,
                unitPrice: l.unitPrice,
                discount: l.discount,
                taxAmount: 0,
                lineTotal: l.lineTotal,
              })),
            },
          },
          include: { lines: true },
        });
        void emitAudit(req, 'salesOrder.created', 'SalesOrder', salesOrder.id, {
          module: 'cpq',
          payload: { quoteId: ex.id, status: salesOrder.status },
        });
      }
    }

    if (b.status === 'Accepted' && b.createArInvoice !== false && ex.total > 0) {
      try {
        const { invoicesDb } = await import('../../core/db');
        invoice = await invoicesDb.create({
          invoiceNo: `INV-Q-${ex.quoteNo.replace(/[^A-Za-z0-9-]/g, '').slice(0, 24)}`,
          customerName: ex.customerName,
          amount: ex.total,
          currency: ex.currency || 'USD',
          dueDate: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
          type: 'AR',
          status: 'Unpaid',
        }, 'finance.invoice.created');
        if (salesOrder && invoice?.id) {
          await prisma.salesOrder.update({
            where: { id: salesOrder.id },
            data: { invoiceId: invoice.id, status: salesOrder.status === 'CREDIT_HOLD' ? 'CREDIT_HOLD' : 'INVOICED' },
          });
          salesOrder = await prisma.salesOrder.findUnique({
            where: { id: salesOrder.id },
            include: { lines: true },
          });
        }
        if (invoice?.id) {
          void emitAudit(req, 'quote.arInvoice', 'Invoice', invoice.id, {
            module: 'cpq',
            payload: { quoteId: ex.id, invoiceNo: invoice.invoiceNo },
          });
        }
      } catch {
        try {
          const { invoicesDb } = await import('../../core/db');
          const invCount = await invoicesDb.count();
          invoice = await invoicesDb.create({
            invoiceNo: `INV-2026-${String(invCount + 1).padStart(3, '0')}`,
            customerName: ex.customerName,
            amount: ex.total,
            currency: ex.currency || 'USD',
            dueDate: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
            type: 'AR',
            status: 'Unpaid',
          }, 'finance.invoice.created');
        } catch {
          invoice = null;
        }
      }
    }

    res.json({ success: true, source: 'prisma', data: row, salesOrder, invoice });
  } catch (err: any) {
    const z = zerr(err, res); if (z) return;
    res.status(500).json({ success: false, error: err?.message || 'update failed' });
  }
});

// Explicit convert endpoint (same spine as Accept)
wave5Router.post('/quotes/:id/convert-to-order', async (req, res) => {
  req.body = { ...(req.body || {}), status: 'Accepted', createSalesOrder: true };
  // Reuse status handler by forwarding — call internally
  const Body = z.object({
    createArInvoice: z.boolean().optional().default(true),
  });
  try {
    const b = Body.parse(req.body || {});
    const ex = await prisma.quote.findUnique({ where: { id: req.params.id }, include: { lines: true } });
    if (!ex) return res.status(404).json({ success: false, error: 'Quote not found' });
    if (ex.status === 'Rejected' || ex.status === 'Expired') {
      return res.status(409).json({ success: false, error: `Cannot convert quote in status ${ex.status}` });
    }
    if (ex.status !== 'Accepted') {
      await prisma.quote.update({ where: { id: ex.id }, data: { status: 'Accepted' } });
    }
    const idempotencyKey = `quote:${ex.id}`;
    let salesOrder = await prisma.salesOrder.findUnique({
      where: { idempotencyKey },
      include: { lines: true },
    });
    if (!salesOrder) {
      const count = await prisma.salesOrder.count();
      const orderNumber = `SO-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;
      const customer = await prisma.customer.findFirst({
        where: { name: { equals: ex.customerName, mode: 'insensitive' } },
      });
      let creditHold = false;
      if (customer) {
        const credit = await prisma.creditLimit.findUnique({ where: { customerId: customer.id } });
        if (credit && ex.total > credit.availableAmount) creditHold = true;
      }
      salesOrder = await prisma.salesOrder.create({
        data: {
          orderNumber,
          quoteId: ex.id,
          customerId: customer?.id ?? null,
          customerName: ex.customerName,
          status: creditHold ? 'CREDIT_HOLD' : 'CONFIRMED',
          currency: ex.currency || 'USD',
          subtotal: ex.subtotal,
          discountAmount: +(ex.subtotal * (ex.discount / 100)).toFixed(2),
          taxAmount: (ex as any).taxAmount ?? 0,
          totalAmount: ex.total,
          idempotencyKey,
          notes: ex.notes,
          createdBy: (req as any).user?.userId || null,
          lines: {
            create: (ex.lines || []).map((l, i) => ({
              lineNumber: i + 1,
              sku: l.sku,
              description: l.description,
              quantity: l.qty,
              unitPrice: l.unitPrice,
              discount: l.discount,
              taxAmount: 0,
              lineTotal: l.lineTotal,
            })),
          },
        },
        include: { lines: true },
      });
    }
    res.status(201).json({ success: true, data: salesOrder, createArInvoice: b.createArInvoice });
  } catch (err: any) {
    const z = zerr(err, res); if (z) return;
    if (err?.code === 'P2021') {
      return res.status(503).json({
        success: false,
        error: 'SalesOrder table missing — apply prisma/manual/module_crm_q2c_additive.sql',
      });
    }
    res.status(500).json({ success: false, error: err?.message || 'convert failed' });
  }
});

// ─── #15 CONTRACTS ──────────────────────────────────────────────────────────
const ContractCreate = z.object({
  contractNo: z.string().min(2),
  title: z.string().min(2),
  counterparty: z.string().min(2),
  type: z.enum(['MSA', 'SOW', 'NDA', 'Lease', 'Purchase', 'Service']).default('MSA'),
  value: z.number().nonnegative().default(0),
  currency: z.string().default('USD'),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  notes: z.string().optional().nullable(),
});
wave5Router.get('/contracts', async (req, res) => {
  const where: any = {};
  if (req.query.status) where.status = String(req.query.status);
  const rows = await prisma.contract.findMany({ where, orderBy: { endDate: 'asc' }, take: 200 });
  res.json({ success: true, data: rows, total: rows.length });
});
wave5Router.get('/contracts/expiring', async (req, res) => {
  const days = Number(req.query.days || 90);
  const cutoff = new Date(Date.now() + days * 86400000);
  const rows = await prisma.contract.findMany({ where: { status: { in: ['Active', 'Signed'] }, endDate: { lte: cutoff } }, orderBy: { endDate: 'asc' } });
  res.json({ success: true, data: rows, total: rows.length, withinDays: days });
});
wave5Router.get('/contracts/:id', async (req, res) => {
  const row = await prisma.contract.findUnique({ where: { id: req.params.id } });
  if (!row) return res.status(404).json({ success: false, error: 'Not found' });
  res.json({ success: true, data: row });
});
wave5Router.post('/contracts', async (req, res) => {
  try {
    const b = ContractCreate.parse(req.body);
    if (b.endDate <= b.startDate) return res.status(400).json({ success: false, error: 'endDate must be after startDate' });
    const row = await uniqueCatch(() => prisma.contract.create({ data: { ...b, notes: b.notes ?? null } }), res);
    if ((row as Response).statusCode) return;
    void emitAudit(req, 'contract.created', 'Contract', (row as any).id, { module: 'procurement' });
    eventBus.emitDomain('procurement.contract.created', row, 'procurement');
    res.status(201).json({ success: true, data: row });
  } catch (err) { const z = zerr(err, res); if (z) return; res.status(500).json({ success: false, error: 'create failed' }); }
});
wave5Router.post('/contracts/:id/negotiate', async (req, res) => {
  const ex = await prisma.contract.findUnique({ where: { id: req.params.id } });
  if (!ex) return res.status(404).json({ success: false, error: 'Not found' });
  if (ex.status !== 'Draft') return res.status(409).json({ success: false, error: `Cannot negotiate from '${ex.status}'` });
  const row = await prisma.contract.update({ where: { id: ex.id }, data: { status: 'Negotiating' } });
  void emitAudit(req, 'contract.negotiating', 'Contract', row.id, { module: 'procurement', payload: { from: ex.status, to: 'Negotiating' } });
  res.json({ success: true, data: row });
});
wave5Router.post('/contracts/:id/sign', async (req, res) => {
  const ex = await prisma.contract.findUnique({ where: { id: req.params.id } });
  if (!ex) return res.status(404).json({ success: false, error: 'Not found' });
  if (!['Draft', 'Negotiating'].includes(ex.status)) {
    return res.status(409).json({ success: false, error: `Cannot sign from '${ex.status}'` });
  }
  const row = await prisma.contract.update({
    where: { id: ex.id },
    data: { status: 'Signed', signedAt: new Date(), signedBy: (req as any).user?.userId || (req as any).user?.id || null },
  });
  void emitAudit(req, 'contract.signed', 'Contract', row.id, { module: 'procurement', payload: { from: ex.status, to: 'Signed' } });
  res.json({ success: true, data: row });
});
wave5Router.post('/contracts/:id/activate', async (req, res) => {
  const ex = await prisma.contract.findUnique({ where: { id: req.params.id } });
  if (!ex) return res.status(404).json({ success: false, error: 'Not found' });
  if (ex.status !== 'Signed') return res.status(409).json({ success: false, error: `Cannot activate from '${ex.status}'` });
  const row = await prisma.contract.update({ where: { id: ex.id }, data: { status: 'Active' } });
  void emitAudit(req, 'contract.activated', 'Contract', row.id, { module: 'procurement', payload: { from: ex.status, to: 'Active' } });
  res.json({ success: true, data: row });
});
wave5Router.post('/contracts/:id/terminate', async (req, res) => {
  const ex = await prisma.contract.findUnique({ where: { id: req.params.id } });
  if (!ex) return res.status(404).json({ success: false, error: 'Not found' });
  if (['Expired', 'Terminated'].includes(ex.status)) {
    return res.status(409).json({ success: false, error: `Already ${ex.status}` });
  }
  const row = await prisma.contract.update({ where: { id: ex.id }, data: { status: 'Terminated' } });
  void emitAudit(req, 'contract.terminated', 'Contract', row.id, { module: 'procurement', payload: { from: ex.status, to: 'Terminated' } });
  res.json({ success: true, data: row });
});

// ─── #16 SOURCING NETWORK ───────────────────────────────────────────────────
const SrcCreate = z.object({
  name: z.string().min(2),
  country: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  certifications: z.string().optional().nullable(),
  capabilities: z.string().optional().nullable(),
  rating: z.number().min(0).max(5).default(0),
  contactEmail: z.string().email().optional().nullable(),
  contactPhone: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});
wave5Router.get('/sourcing-suppliers', async (req, res) => {
  const where: any = {};
  if (req.query.category) where.category = String(req.query.category);
  if (req.query.country) where.country = String(req.query.country);
  if (req.query.status) where.qualifiedStatus = String(req.query.status);
  const rows = await prisma.sourcingSupplier.findMany({ where, orderBy: { rating: 'desc' }, take: 200 });
  res.json({ success: true, data: rows, total: rows.length });
});
wave5Router.get('/sourcing-suppliers/:id', async (req, res) => {
  const row = await prisma.sourcingSupplier.findUnique({ where: { id: req.params.id } });
  if (!row) return res.status(404).json({ success: false, error: 'Not found' });
  res.json({ success: true, data: row });
});
wave5Router.post('/sourcing-suppliers', async (req, res) => {
  try {
    const b = SrcCreate.parse(req.body);
    const row = await prisma.sourcingSupplier.create({ data: b });
    void emitAudit(req, 'sourcing.created', 'SourcingSupplier', row.id, { module: 'procurement' });
    eventBus.emitDomain('procurement.sourcing.created', row, 'procurement');
    res.status(201).json({ success: true, data: row });
  } catch (err) { const z = zerr(err, res); if (z) return; res.status(500).json({ success: false, error: 'create failed' }); }
});
wave5Router.post('/sourcing-suppliers/:id/qualify', async (req, res) => {
  const Body = z.object({ qualifiedStatus: z.enum(['Discovered', 'InReview', 'Qualified', 'Rejected']) });
  try {
    const b = Body.parse(req.body);
    const ex = await prisma.sourcingSupplier.findUnique({ where: { id: req.params.id } });
    if (!ex) return res.status(404).json({ success: false, error: 'Not found' });
    const allowed: Record<string, string[]> = {
      Discovered: ['InReview', 'Rejected'],
      InReview: ['Qualified', 'Rejected'],
      Qualified: [],
      Rejected: ['InReview'],
    };
    if (!(allowed[ex.qualifiedStatus] || []).includes(b.qualifiedStatus)) {
      return res.status(409).json({
        success: false,
        error: `Cannot move from '${ex.qualifiedStatus}' to '${b.qualifiedStatus}'`,
      });
    }
    const row = await prisma.sourcingSupplier.update({ where: { id: ex.id }, data: { qualifiedStatus: b.qualifiedStatus } });
    void emitAudit(req, 'sourcing.qualify', 'SourcingSupplier', row.id, {
      module: 'procurement',
      payload: { from: ex.qualifiedStatus, to: b.qualifiedStatus },
    });
    res.json({ success: true, data: row });
  } catch (err) { const z = zerr(err, res); if (z) return; res.status(500).json({ success: false, error: 'update failed' }); }
});

// ─── #18 SHOP FLOOR ─────────────────────────────────────────────────────────
const SFOPCreate = z.object({
  workOrderId: z.string().optional().nullable(),
  operationNo: z.number().int().min(1),
  workCenter: z.string().min(1),
  description: z.string().optional().nullable(),
  setupMins: z.number().int().nonnegative().default(0),
  runMins: z.number().int().nonnegative().default(0),
  qtyPlanned: z.number().nonnegative().default(0),
  operator: z.string().optional().nullable(),
});
wave5Router.get('/shop-floor-ops', async (req, res) => {
  const where: any = {};
  if (req.query.workOrderId) where.workOrderId = String(req.query.workOrderId);
  if (req.query.status) where.status = String(req.query.status);
  const rows = await prisma.shopFloorOp.findMany({ where, orderBy: { operationNo: 'asc' }, take: 200 });
  res.json({ success: true, data: rows, total: rows.length });
});
wave5Router.get('/shop-floor-ops/:id', async (req, res) => {
  const row = await prisma.shopFloorOp.findUnique({ where: { id: req.params.id } });
  if (!row) return res.status(404).json({ success: false, error: 'Not found' });
  res.json({ success: true, data: row });
});
wave5Router.post('/shop-floor-ops', async (req, res) => {
  try {
    const b = SFOPCreate.parse(req.body);
    const row = await prisma.shopFloorOp.create({ data: b });
    void emitAudit(req, 'shopFloor.created', 'ShopFloorOp', row.id, { module: 'manufacturing' });
    eventBus.emitDomain('mfg.shopfloor.created', row, 'manufacturing');
    res.status(201).json({ success: true, data: row });
  } catch (err) { const z = zerr(err, res); if (z) return; res.status(500).json({ success: false, error: 'create failed' }); }
});
wave5Router.post('/shop-floor-ops/:id/report', async (req, res) => {
  const Body = z.object({
    qtyDone: z.number().nonnegative(),
    qtyScrap: z.number().nonnegative().default(0),
    status: z.enum(['InProgress', 'Paused', 'Completed', 'Scrapped']).optional(),
  });
  try {
    const b = Body.parse(req.body);
    const ex = await prisma.shopFloorOp.findUnique({ where: { id: req.params.id } });
    if (!ex) return res.status(404).json({ success: false, error: 'Not found' });
    const data: any = { qtyDone: b.qtyDone, qtyScrap: b.qtyScrap };
    if (b.status) {
      const allowed: Record<string, string[]> = {
        Queued: ['InProgress'],
        InProgress: ['Paused', 'Completed', 'Scrapped'],
        Paused: ['InProgress', 'Completed', 'Scrapped'],
        Completed: [],
        Scrapped: [],
      };
      if (!(allowed[ex.status] || []).includes(b.status)) {
        return res.status(409).json({ success: false, error: `Cannot move from '${ex.status}' to '${b.status}'` });
      }
      data.status = b.status;
      if (b.status === 'InProgress' && !ex.startedAt) data.startedAt = new Date();
      if (b.status === 'Completed' || b.status === 'Scrapped') data.completedAt = new Date();
    }
    const row = await prisma.shopFloorOp.update({ where: { id: ex.id }, data });
    void emitAudit(req, 'shopFloor.reported', 'ShopFloorOp', row.id, {
      module: 'manufacturing',
      payload: { from: ex.status, to: row.status, qtyDone: b.qtyDone, qtyScrap: b.qtyScrap },
    });
    res.json({ success: true, data: row });
  } catch (err) { const z = zerr(err, res); if (z) return; res.status(500).json({ success: false, error: 'update failed' }); }
});

// ─── #28 3PL ────────────────────────────────────────────────────────────────
wave5Router.get('/threepl-partners', async (_req, res) => {
  const rows = await prisma.threePLPartner.findMany({ orderBy: { name: 'asc' } });
  res.json({ success: true, data: rows, total: rows.length });
});
wave5Router.get('/threepl-partners/:id', async (req, res) => {
  const row = await prisma.threePLPartner.findUnique({ where: { id: req.params.id } });
  if (!row) return res.status(404).json({ success: false, error: 'Partner not found' });
  const events = await prisma.threePLEvent.findMany({
    where: { partnerCode: row.code },
    orderBy: { receivedAt: 'desc' },
    take: 50,
  });
  res.json({ success: true, data: { ...row, events } });
});
wave5Router.post('/threepl-partners', async (req, res) => {
  const Body = z.object({ code: z.string().min(2), name: z.string().min(2), apiBaseUrl: z.string().optional().nullable(), authMode: z.enum(['apikey', 'oauth', 'none']).default('apikey'), webhookUrl: z.string().optional().nullable() });
  try {
    const b = Body.parse(req.body);
    const row = await uniqueCatch(() => prisma.threePLPartner.create({ data: b }), res);
    if ((row as Response).statusCode) return;
    void emitAudit(req, 'threepl.created', 'ThreePLPartner', (row as any).id, { module: 'threepl' });
    eventBus.emitDomain('threepl.partner.created', row, 'threepl');
    res.status(201).json({ success: true, data: row });
  } catch (err) { const z = zerr(err, res); if (z) return; res.status(500).json({ success: false, error: 'create failed' }); }
});
wave5Router.post('/threepl-partners/:id/status', async (req, res) => {
  const Body = z.object({ active: z.boolean() });
  try {
    const b = Body.parse(req.body);
    const existing = await prisma.threePLPartner.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ success: false, error: 'Partner not found' });
    const row = await prisma.threePLPartner.update({ where: { id: existing.id }, data: { active: b.active } });
    void emitAudit(req, 'threepl.status', 'ThreePLPartner', row.id, {
      module: 'threepl',
      payload: { active: b.active, from: existing.active },
    });
    res.json({ success: true, data: row });
  } catch (err) { const z = zerr(err, res); if (z) return; res.status(500).json({ success: false, error: 'status failed' }); }
});
wave5Router.post('/threepl-events', async (req, res) => {
  const Body = z.object({ partnerCode: z.string(), eventType: z.string(), payload: z.any().default({}) });
  try {
    const b = Body.parse(req.body);
    const row = await prisma.threePLEvent.create({ data: { partnerCode: b.partnerCode, eventType: b.eventType, payload: b.payload ?? {} } });
    void emitAudit(req, 'threepl.event', 'ThreePLEvent', row.id, {
      module: 'threepl',
      payload: { partnerCode: b.partnerCode, eventType: b.eventType },
    });
    eventBus.emitDomain('threepl.event.ingested', row, 'threepl');
    res.status(201).json({ success: true, data: row });
  } catch (err) { const z = zerr(err, res); if (z) return; res.status(500).json({ success: false, error: 'create failed' }); }
});
wave5Router.get('/threepl-events', async (req, res) => {
  const where: any = {};
  if (req.query.partnerCode) where.partnerCode = String(req.query.partnerCode);
  if (req.query.processed !== undefined) where.processed = String(req.query.processed) === 'true';
  const rows = await prisma.threePLEvent.findMany({ where, orderBy: { receivedAt: 'desc' }, take: 100 });
  res.json({ success: true, data: rows, total: rows.length });
});
wave5Router.get('/threepl-events/:id', async (req, res) => {
  const row = await prisma.threePLEvent.findUnique({ where: { id: req.params.id } });
  if (!row) return res.status(404).json({ success: false, error: 'Event not found' });
  res.json({ success: true, data: row });
});
wave5Router.post('/threepl-events/:id/process', async (req, res) => {
  const existing = await prisma.threePLEvent.findUnique({ where: { id: req.params.id } });
  if (!existing) return res.status(404).json({ success: false, error: 'Event not found' });
  if (existing.processed) return res.status(409).json({ success: false, error: 'Already processed' });
  const row = await prisma.threePLEvent.update({ where: { id: existing.id }, data: { processed: true } });
  void emitAudit(req, 'threepl.event.processed', 'ThreePLEvent', row.id, {
    module: 'threepl',
    payload: { partnerCode: row.partnerCode, eventType: row.eventType },
  });
  res.json({ success: true, data: row });
});

// ─── #30 TALENT ─────────────────────────────────────────────────────────────
const PostingCreate = z.object({ reqNo: z.string().min(2), title: z.string().min(2), department: z.string().optional().nullable(), location: z.string().optional().nullable(), level: z.string().optional().nullable(), description: z.string().optional().nullable() });
const POSTING_TRANSITIONS: Record<string, string[]> = {
  Open: ['Paused', 'Filled', 'Cancelled'],
  Paused: ['Open', 'Cancelled'],
  Filled: [],
  Cancelled: [],
};
wave5Router.get('/postings', async (req, res) => {
  const where: any = {}; if (req.query.status) where.status = String(req.query.status);
  const rows = await prisma.jobPosting.findMany({ where, include: { candidates: true }, orderBy: { postedAt: 'desc' } });
  res.json({ success: true, data: rows, total: rows.length });
});
wave5Router.get('/postings/:id', async (req, res) => {
  const row = await prisma.jobPosting.findUnique({ where: { id: req.params.id }, include: { candidates: true } });
  if (!row) return res.status(404).json({ success: false, error: 'Posting not found' });
  res.json({ success: true, data: row });
});
wave5Router.post('/postings', async (req, res) => {
  try {
    const b = PostingCreate.parse(req.body);
    const row = await uniqueCatch(() => prisma.jobPosting.create({ data: b }), res);
    if ((row as Response).statusCode) return;
    void emitAudit(req, 'posting.created', 'JobPosting', (row as any).id, { module: 'talent' });
    eventBus.emitDomain('talent.posting.created', row, 'talent');
    res.status(201).json({ success: true, data: row });
  } catch (err) { const z = zerr(err, res); if (z) return; res.status(500).json({ success: false, error: 'create failed' }); }
});
wave5Router.post('/postings/:id/status', async (req, res) => {
  const Body = z.object({ status: z.enum(['Open', 'Paused', 'Filled', 'Cancelled']) });
  try {
    const b = Body.parse(req.body);
    const ex = await prisma.jobPosting.findUnique({ where: { id: req.params.id } });
    if (!ex) return res.status(404).json({ success: false, error: 'Posting not found' });
    if (!POSTING_TRANSITIONS[ex.status]?.includes(b.status)) {
      return res.status(409).json({ success: false, error: `Cannot move '${ex.status}' → '${b.status}'` });
    }
    const row = await prisma.jobPosting.update({
      where: { id: ex.id },
      data: { status: b.status, ...(b.status === 'Filled' ? { filledAt: new Date() } : {}) },
      include: { candidates: true },
    });
    void emitAudit(req, 'posting.status', 'JobPosting', row.id, {
      module: 'talent',
      payload: { from: ex.status, to: b.status },
    });
    res.json({ success: true, data: row });
  } catch (err) { const z = zerr(err, res); if (z) return; res.status(500).json({ success: false, error: 'update failed' }); }
});
wave5Router.post('/postings/:id/candidates', async (req, res) => {
  const Body = z.object({ name: z.string().min(2), email: z.string().email().optional().nullable(), phone: z.string().optional().nullable(), rating: z.number().int().min(0).max(5).default(0), notes: z.string().optional().nullable() });
  try {
    const b = Body.parse(req.body);
    const posting = await prisma.jobPosting.findUnique({ where: { id: req.params.id } });
    if (!posting) return res.status(404).json({ success: false, error: 'Posting not found' });
    const row = await prisma.candidate.create({ data: { postingId: posting.id, ...b } });
    void emitAudit(req, 'candidate.created', 'Candidate', row.id, { module: 'talent', payload: { postingId: posting.id } });
    res.status(201).json({ success: true, data: row });
  } catch (err) { const z = zerr(err, res); if (z) return; res.status(500).json({ success: false, error: 'create failed' }); }
});
wave5Router.post('/candidates/:id/stage', async (req, res) => {
  const Body = z.object({ stage: z.enum(['Applied', 'Screened', 'Interview', 'Offer', 'Hired', 'Rejected']) });
  try {
    const b = Body.parse(req.body);
    const ex = await prisma.candidate.findUnique({ where: { id: req.params.id } });
    if (!ex) return res.status(404).json({ success: false, error: 'Not found' });
    const row = await prisma.candidate.update({ where: { id: ex.id }, data: { stage: b.stage } });
    if (b.stage === 'Hired') {
      await prisma.jobPosting.update({ where: { id: ex.postingId }, data: { status: 'Filled', filledAt: new Date() } });
    }
    void emitAudit(req, 'candidate.stage', 'Candidate', row.id, {
      module: 'talent',
      payload: { from: ex.stage, to: b.stage, postingId: ex.postingId },
    });
    res.json({ success: true, data: row });
  } catch (err) { const z = zerr(err, res); if (z) return; res.status(500).json({ success: false, error: 'update failed' }); }
});

// ─── #31 LMS ────────────────────────────────────────────────────────────────
const CourseCreate = z.object({ code: z.string().min(2), title: z.string().min(2), category: z.string().optional().nullable(), durationHrs: z.number().positive().default(1), level: z.string().optional().nullable() });
wave5Router.get('/courses', async (_req, res) => {
  const rows = await prisma.course.findMany({ include: { enrollments: true }, orderBy: { code: 'asc' } });
  res.json({ success: true, data: rows, total: rows.length });
});
wave5Router.get('/courses/:id', async (req, res) => {
  const row = await prisma.course.findUnique({ where: { id: req.params.id }, include: { enrollments: true } });
  if (!row) return res.status(404).json({ success: false, error: 'Course not found' });
  res.json({ success: true, data: row });
});
wave5Router.post('/courses', async (req, res) => {
  try {
    const b = CourseCreate.parse(req.body);
    const row = await uniqueCatch(() => prisma.course.create({ data: b }), res);
    if ((row as Response).statusCode) return;
    void emitAudit(req, 'course.created', 'Course', (row as any).id, { module: 'lms' });
    eventBus.emitDomain('lms.course.created', row, 'lms');
    res.status(201).json({ success: true, data: row });
  } catch (err) { const z = zerr(err, res); if (z) return; res.status(500).json({ success: false, error: 'create failed' }); }
});
wave5Router.patch('/courses/:id', async (req, res) => {
  const Body = z.object({
    title: z.string().min(2).optional(),
    category: z.string().optional().nullable(),
    durationHrs: z.number().positive().optional(),
    level: z.string().optional().nullable(),
    active: z.boolean().optional(),
  });
  try {
    const b = Body.parse(req.body);
    const ex = await prisma.course.findUnique({ where: { id: req.params.id } });
    if (!ex) return res.status(404).json({ success: false, error: 'Course not found' });
    const row = await prisma.course.update({ where: { id: ex.id }, data: b, include: { enrollments: true } });
    void emitAudit(req, 'course.updated', 'Course', row.id, { module: 'lms', payload: b });
    res.json({ success: true, data: row });
  } catch (err) { const z = zerr(err, res); if (z) return; res.status(500).json({ success: false, error: 'update failed' }); }
});
wave5Router.post('/courses/:id/enroll', async (req, res) => {
  const Body = z.object({ employeeId: z.string().min(1) });
  try {
    const b = Body.parse(req.body);
    const course = await prisma.course.findUnique({ where: { id: req.params.id } });
    if (!course) return res.status(404).json({ success: false, error: 'Course not found' });
    const row = await uniqueCatch(() => prisma.enrollment.create({ data: { courseId: course.id, employeeId: b.employeeId } }), res);
    if ((row as Response).statusCode) return;
    void emitAudit(req, 'enrollment.created', 'Enrollment', (row as any).id, { module: 'lms', payload: { courseId: course.id } });
    res.status(201).json({ success: true, data: row });
  } catch (err) { const z = zerr(err, res); if (z) return; res.status(500).json({ success: false, error: 'enroll failed' }); }
});
wave5Router.post('/enrollments/:id/complete', async (req, res) => {
  const Body = z.object({ score: z.number().min(0).max(100) });
  try {
    const b = Body.parse(req.body);
    const ex = await prisma.enrollment.findUnique({ where: { id: req.params.id } });
    if (!ex) return res.status(404).json({ success: false, error: 'Not found' });
    const status = b.score >= 50 ? 'Completed' : 'Failed';
    const row = await prisma.enrollment.update({ where: { id: ex.id }, data: { score: b.score, completedAt: new Date(), status } });
    void emitAudit(req, 'enrollment.completed', 'Enrollment', row.id, {
      module: 'lms',
      payload: { from: ex.status, to: status, score: b.score },
    });
    res.json({ success: true, data: row });
  } catch (err) { const z = zerr(err, res); if (z) return; res.status(500).json({ success: false, error: 'update failed' }); }
});

// ─── #32 PERFORMANCE ────────────────────────────────────────────────────────
const PerfCreate = z.object({
  employeeId: z.string().min(1),
  period: z.string().min(4),
  reviewer: z.string().optional().nullable(),
  selfRating: z.number().int().min(0).max(5).default(0),
  mgrRating: z.number().int().min(0).max(5).default(0),
  strengths: z.string().optional().nullable(),
  improvements: z.string().optional().nullable(),
  potential: z.enum(['Promote', 'Stretch', 'Hold', 'PIP']).default('Hold'),
});
const PERF_TRANSITIONS: Record<string, string[]> = {
  Draft: ['Submitted'],
  Submitted: ['Acknowledged', 'Draft'],
  Acknowledged: ['Closed'],
  Closed: [],
};
wave5Router.get('/perf-reviews', async (req, res) => {
  const where: any = {};
  if (req.query.period) where.period = String(req.query.period);
  if (req.query.employeeId) where.employeeId = String(req.query.employeeId);
  const rows = await prisma.performanceReview.findMany({ where, orderBy: { overallScore: 'desc' }, take: 200 });
  res.json({ success: true, data: rows, total: rows.length });
});
wave5Router.get('/perf-reviews/:id', async (req, res) => {
  const row = await prisma.performanceReview.findUnique({ where: { id: req.params.id } });
  if (!row) return res.status(404).json({ success: false, error: 'Review not found' });
  res.json({ success: true, data: row });
});
wave5Router.post('/perf-reviews', async (req, res) => {
  try {
    const b = PerfCreate.parse(req.body);
    const overallScore = +((b.selfRating + b.mgrRating * 2) / 3).toFixed(2);
    const row = await prisma.performanceReview.create({ data: { ...b, overallScore } });
    void emitAudit(req, 'perfReview.created', 'PerformanceReview', row.id, { module: 'performance' });
    eventBus.emitDomain('perf.review.created', row, 'performance');
    res.status(201).json({ success: true, data: row });
  } catch (err) { const z = zerr(err, res); if (z) return; res.status(500).json({ success: false, error: 'create failed' }); }
});
wave5Router.post('/perf-reviews/:id/status', async (req, res) => {
  const Body = z.object({ status: z.enum(['Draft', 'Submitted', 'Acknowledged', 'Closed']) });
  try {
    const b = Body.parse(req.body);
    const ex = await prisma.performanceReview.findUnique({ where: { id: req.params.id } });
    if (!ex) return res.status(404).json({ success: false, error: 'Review not found' });
    if (!PERF_TRANSITIONS[ex.status]?.includes(b.status)) {
      return res.status(409).json({ success: false, error: `Cannot move '${ex.status}' → '${b.status}'` });
    }
    const row = await prisma.performanceReview.update({ where: { id: ex.id }, data: { status: b.status } });
    void emitAudit(req, 'perfReview.status', 'PerformanceReview', row.id, {
      module: 'performance',
      payload: { from: ex.status, to: b.status },
    });
    res.json({ success: true, data: row });
  } catch (err) { const z = zerr(err, res); if (z) return; res.status(500).json({ success: false, error: 'update failed' }); }
});
wave5Router.get('/perf-9box', async (req, res) => {
  const period = String(req.query.period || '');
  const where: any = {}; if (period) where.period = period;
  const rows = await prisma.performanceReview.findMany({ where });
  const box: Record<string, any[]> = {};
  rows.forEach(r => {
    const perf = r.mgrRating >= 4 ? 'High' : r.mgrRating >= 3 ? 'Mid' : 'Low';
    const pot = r.potential === 'Promote' ? 'High' : r.potential === 'Stretch' ? 'Mid' : 'Low';
    const k = `${pot}/${perf}`;
    (box[k] = box[k] || []).push({ employeeId: r.employeeId, score: r.overallScore, potential: r.potential, id: r.id });
  });
  res.json({ success: true, data: box, total: rows.length, period });
});

// ─── #33 WORKFORCE PLANNING ─────────────────────────────────────────────────
const HCCreate = z.object({ period: z.string().min(4), department: z.string().min(1), currentFte: z.number().nonnegative(), plannedFte: z.number().nonnegative(), attritionPct: z.number().min(0).max(100).default(0), notes: z.string().optional().nullable() });
wave5Router.get('/headcount-plans', async (req, res) => {
  const where: any = {}; if (req.query.period) where.period = String(req.query.period);
  const rows = await prisma.headcountPlan.findMany({ where, orderBy: { department: 'asc' } });
  res.json({ success: true, data: rows, total: rows.length });
});
wave5Router.get('/headcount-plans/:id', async (req, res) => {
  const row = await prisma.headcountPlan.findUnique({ where: { id: req.params.id } });
  if (!row) return res.status(404).json({ success: false, error: 'Plan not found' });
  res.json({ success: true, data: row });
});
wave5Router.post('/headcount-plans', async (req, res) => {
  try {
    const b = HCCreate.parse(req.body);
    const expectedLoss = +(b.currentFte * b.attritionPct / 100).toFixed(2);
    const hiringNeed = Math.max(0, +(b.plannedFte - b.currentFte + expectedLoss).toFixed(2));
    const row = await prisma.headcountPlan.upsert({
      where: { period_department: { period: b.period, department: b.department } },
      create: { ...b, hiringNeed },
      update: { ...b, hiringNeed },
    });
    void emitAudit(req, 'headcountPlan.created', 'HeadcountPlan', row.id, { module: 'workforce' });
    eventBus.emitDomain('workforce.headcount.planned', row, 'workforce');
    res.status(201).json({ success: true, data: row });
  } catch (err) { const z = zerr(err, res); if (z) return; res.status(500).json({ success: false, error: 'create failed' }); }
});

// ─── #35 PLANT MAINTENANCE ──────────────────────────────────────────────────
const PMCreate = z.object({
  woNo: z.string().min(2),
  assetId: z.string().min(1),
  type: z.enum(['Preventive', 'Corrective', 'Predictive', 'Emergency']).default('Corrective'),
  priority: z.enum(['Low', 'Medium', 'High', 'Critical']).default('Medium'),
  description: z.string().min(2),
  assignedTo: z.string().optional().nullable(),
  scheduledAt: z.coerce.date().optional().nullable(),
});
const PM_TRANSITIONS: Record<string, string[]> = {
  Open: ['Assigned', 'InProgress', 'Cancelled'],
  Assigned: ['InProgress', 'Cancelled'],
  InProgress: ['Completed', 'Cancelled'],
  Completed: [],
  Cancelled: [],
};
wave5Router.get('/pm-orders', async (req, res) => {
  const where: any = {};
  if (req.query.status) where.status = String(req.query.status);
  if (req.query.assetId) where.assetId = String(req.query.assetId);
  const rows = await prisma.pMWorkOrder.findMany({ where, orderBy: [{ priority: 'desc' }, { scheduledAt: 'asc' }], take: 200 });
  res.json({ success: true, data: rows, total: rows.length });
});
wave5Router.get('/pm-orders/:id', async (req, res) => {
  const row = await prisma.pMWorkOrder.findUnique({ where: { id: req.params.id } });
  if (!row) return res.status(404).json({ success: false, error: 'Work order not found' });
  res.json({ success: true, data: row });
});
wave5Router.post('/pm-orders', async (req, res) => {
  try {
    const b = PMCreate.parse(req.body);
    const asset = await prisma.asset.findUnique({ where: { id: b.assetId } });
    if (!asset) return res.status(404).json({ success: false, error: 'Asset not found' });
    const row = await uniqueCatch(() => prisma.pMWorkOrder.create({ data: b }), res);
    if ((row as Response).statusCode) return;
    void emitAudit(req, 'pmOrder.created', 'PMWorkOrder', (row as any).id, { module: 'plant-maintenance' });
    eventBus.emitDomain('pm.order.created', row, 'plant-maintenance');
    res.status(201).json({ success: true, data: row });
  } catch (err) { const z = zerr(err, res); if (z) return; res.status(500).json({ success: false, error: 'create failed' }); }
});
wave5Router.post('/pm-orders/:id/status', async (req, res) => {
  const Body = z.object({ status: z.enum(['Open', 'Assigned', 'InProgress', 'Completed', 'Cancelled']), assignedTo: z.string().optional().nullable() });
  try {
    const b = Body.parse(req.body);
    const ex = await prisma.pMWorkOrder.findUnique({ where: { id: req.params.id } });
    if (!ex) return res.status(404).json({ success: false, error: 'Not found' });
    if (!PM_TRANSITIONS[ex.status]?.includes(b.status)) {
      return res.status(409).json({ success: false, error: `Cannot move '${ex.status}' → '${b.status}'` });
    }
    const row = await prisma.pMWorkOrder.update({
      where: { id: ex.id },
      data: {
        status: b.status,
        ...(b.assignedTo !== undefined ? { assignedTo: b.assignedTo } : {}),
        ...(b.status === 'Completed' ? { completedAt: new Date() } : {}),
      },
    });
    void emitAudit(req, 'pmOrder.status', 'PMWorkOrder', row.id, {
      module: 'plant-maintenance',
      payload: { from: ex.status, to: b.status },
    });
    res.json({ success: true, data: row });
  } catch (err) { const z = zerr(err, res); if (z) return; res.status(500).json({ success: false, error: 'update failed' }); }
});
wave5Router.post('/pm-orders/:id/complete', async (req, res) => {
  const Body = z.object({ laborHours: z.number().nonnegative().default(0), partsCost: z.number().nonnegative().default(0) });
  try {
    const b = Body.parse(req.body);
    const ex = await prisma.pMWorkOrder.findUnique({ where: { id: req.params.id } });
    if (!ex) return res.status(404).json({ success: false, error: 'Not found' });
    if (ex.status === 'Cancelled' || ex.status === 'Completed') {
      return res.status(409).json({ success: false, error: `Cannot complete '${ex.status}'` });
    }
    const totalCost = +(b.partsCost + b.laborHours * 50).toFixed(2);
    const row = await prisma.pMWorkOrder.update({ where: { id: ex.id }, data: { laborHours: b.laborHours, partsCost: b.partsCost, totalCost, status: 'Completed', completedAt: new Date() } });
    void emitAudit(req, 'pmOrder.completed', 'PMWorkOrder', row.id, {
      module: 'plant-maintenance',
      payload: { from: ex.status, to: 'Completed', totalCost },
    });
    res.json({ success: true, data: row });
  } catch (err) { const z = zerr(err, res); if (z) return; res.status(500).json({ success: false, error: 'update failed' }); }
});

// ─── #36 PROPERTIES ─────────────────────────────────────────────────────────
const PropCreate = z.object({
  code: z.string().min(2),
  name: z.string().min(2),
  type: z.enum(['Office', 'Warehouse', 'Retail', 'Plant', 'Land']),
  address: z.string().optional().nullable(),
  sqft: z.number().nonnegative().default(0),
  occupancyPct: z.number().min(0).max(100).default(0),
  monthlyRent: z.number().nonnegative().default(0),
  currency: z.string().default('USD'),
  leaseEnd: z.coerce.date().optional().nullable(),
});
const PROP_TRANSITIONS: Record<string, string[]> = {
  Active: ['Vacant', 'UnderRenovation', 'Sold'],
  Vacant: ['Active', 'UnderRenovation', 'Sold'],
  UnderRenovation: ['Active', 'Vacant'],
  Sold: [],
};
wave5Router.get('/properties', async (req, res) => {
  const where: any = {};
  if (req.query.type) where.type = String(req.query.type);
  if (req.query.status) where.status = String(req.query.status);
  const rows = await prisma.property.findMany({ where, orderBy: { code: 'asc' } });
  res.json({ success: true, data: rows, total: rows.length });
});
wave5Router.get('/properties/:id', async (req, res) => {
  const row = await prisma.property.findUnique({ where: { id: req.params.id } });
  if (!row) return res.status(404).json({ success: false, error: 'Property not found' });
  res.json({ success: true, data: row });
});
wave5Router.post('/properties', async (req, res) => {
  try {
    const b = PropCreate.parse(req.body);
    const row = await uniqueCatch(() => prisma.property.create({ data: b }), res);
    if ((row as Response).statusCode) return;
    void emitAudit(req, 'property.created', 'Property', (row as any).id, { module: 'properties' });
    eventBus.emitDomain('property.created', row, 'properties');
    res.status(201).json({ success: true, data: row });
  } catch (err) { const z = zerr(err, res); if (z) return; res.status(500).json({ success: false, error: 'create failed' }); }
});
wave5Router.post('/properties/:id/status', async (req, res) => {
  const Body = z.object({ status: z.enum(['Active', 'Vacant', 'UnderRenovation', 'Sold']), occupancyPct: z.number().min(0).max(100).optional() });
  try {
    const b = Body.parse(req.body);
    const ex = await prisma.property.findUnique({ where: { id: req.params.id } });
    if (!ex) return res.status(404).json({ success: false, error: 'Property not found' });
    if (!PROP_TRANSITIONS[ex.status]?.includes(b.status)) {
      return res.status(409).json({ success: false, error: `Cannot move '${ex.status}' → '${b.status}'` });
    }
    const row = await prisma.property.update({
      where: { id: ex.id },
      data: {
        status: b.status,
        ...(b.occupancyPct !== undefined ? { occupancyPct: b.occupancyPct } : {}),
        ...(b.status === 'Vacant' ? { occupancyPct: 0 } : {}),
        ...(b.status === 'Sold' ? { occupancyPct: 0 } : {}),
      },
    });
    void emitAudit(req, 'property.status', 'Property', row.id, {
      module: 'properties',
      payload: { from: ex.status, to: b.status },
    });
    res.json({ success: true, data: row });
  } catch (err) { const z = zerr(err, res); if (z) return; res.status(500).json({ success: false, error: 'update failed' }); }
});

// ─── #41 BI REPORTS ─────────────────────────────────────────────────────────
const ReportCreate = z.object({
  name: z.string().min(2),
  category: z.string().optional().nullable(),
  sourceTable: z.enum(['Order', 'Invoice', 'Customer', 'InventoryItem', 'PurchaseOrder', 'Employee', 'Lead', 'Deal']),
  metric: z.enum(['count', 'sum', 'avg', 'min', 'max']),
  metricField: z.string().optional().nullable(),
  groupBy: z.string().optional().nullable(),
  filters: z.any().optional(),
  description: z.string().optional().nullable(),
});
wave5Router.get('/reports', async (_req, res) => {
  const rows = await prisma.savedReport.findMany({ orderBy: { createdAt: 'desc' } });
  res.json({ success: true, data: rows, total: rows.length });
});
wave5Router.get('/reports/:id', async (req, res) => {
  const row = await prisma.savedReport.findUnique({ where: { id: req.params.id } });
  if (!row) return res.status(404).json({ success: false, error: 'Report not found' });
  res.json({ success: true, data: row });
});
wave5Router.post('/reports', async (req, res) => {
  try {
    const b = ReportCreate.parse(req.body);
    const row = await prisma.savedReport.create({ data: { ...b, filters: b.filters || null } });
    void emitAudit(req, 'report.created', 'SavedReport', row.id, { module: 'bi' });
    eventBus.emitDomain('bi.report.created', row, 'bi');
    res.status(201).json({ success: true, data: row });
  } catch (err) { const z = zerr(err, res); if (z) return; res.status(500).json({ success: false, error: 'create failed' }); }
});
wave5Router.post('/reports/:id/run', async (req, res) => {
  const rpt = await prisma.savedReport.findUnique({ where: { id: req.params.id } });
  if (!rpt) return res.status(404).json({ success: false, error: 'Report not found' });
  const table = rpt.sourceTable as string;
  const model = (prisma as any)[table.charAt(0).toLowerCase() + table.slice(1)];
  if (!model) return res.status(400).json({ success: false, error: 'Unsupported source table' });
  try {
    let result: any;
    if (rpt.metric === 'count') {
      if (rpt.groupBy) {
        try {
          const grouped = await model.groupBy({ by: [rpt.groupBy], _count: { _all: true } });
          result = grouped.map((g: any) => ({ key: g[rpt.groupBy!] ?? '(null)', value: g._count._all }));
        } catch (gerr: any) {
          return res.status(400).json({ success: false, error: `Invalid groupBy field '${rpt.groupBy}' for ${rpt.sourceTable}`, hint: 'Check the column exists on the model.' });
        }
      } else {
        result = { count: await model.count() };
      }
    } else {
      const field = rpt.metricField || 'amount';
      const agg: any = {};
      agg[`_${rpt.metric}`] = { [field]: true };
      try {
        if (rpt.groupBy) {
          const grouped = await model.groupBy({ by: [rpt.groupBy], ...agg });
          result = grouped.map((g: any) => ({ key: g[rpt.groupBy!] ?? '(null)', value: g[`_${rpt.metric}`]?.[field] || 0 }));
        } else {
          const single = await model.aggregate(agg);
          result = single[`_${rpt.metric}`];
        }
      } catch (aerr: any) {
        return res.status(400).json({ success: false, error: `Aggregation failed`, hint: `Verify field '${field}' is numeric and groupBy '${rpt.groupBy || 'none'}' is a valid column.` });
      }
    }
    const updated = await prisma.savedReport.update({ where: { id: rpt.id }, data: { lastRunAt: new Date() } });
    void emitAudit(req, 'report.run', 'SavedReport', rpt.id, { module: 'bi', payload: { name: rpt.name } });
    res.json({ success: true, data: result, report: { id: updated.id, name: updated.name, sourceTable: updated.sourceTable, metric: updated.metric, metricField: updated.metricField, groupBy: updated.groupBy, lastRunAt: updated.lastRunAt } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'run failed', message: err?.message });
  }
});
wave5Router.delete('/reports/:id', async (req, res) => {
  const ex = await prisma.savedReport.findUnique({ where: { id: req.params.id } });
  if (!ex) return res.status(404).json({ success: false, error: 'Report not found' });
  await prisma.savedReport.delete({ where: { id: ex.id } });
  void emitAudit(req, 'report.deleted', 'SavedReport', ex.id, { module: 'bi' });
  res.json({ success: true, data: { id: ex.id, deleted: true } });
});

// ─── #42 BOARD PACK ─────────────────────────────────────────────────────────
const BOARD_NEXT: Record<string, string[]> = {
  Draft: ['Review', 'Approved'],
  Review: ['Approved', 'Draft'],
  Approved: ['Distributed'],
  Distributed: [],
};
wave5Router.get('/board-packs', async (_req, res) => {
  const rows = await prisma.boardPack.findMany({ orderBy: { period: 'desc' } });
  res.json({ success: true, data: rows, total: rows.length });
});
wave5Router.get('/board-packs/:id', async (req, res) => {
  const row = await prisma.boardPack.findUnique({ where: { id: req.params.id } });
  if (!row) return res.status(404).json({ success: false, error: 'Not found' });
  res.json({ success: true, data: row });
});
wave5Router.post('/board-packs/generate', async (req, res) => {
  const Body = z.object({ period: z.string().min(4), title: z.string().optional() });
  try {
    const b = Body.parse(req.body);
    // Pull real numbers from existing data
    const [orderAgg, invAgg, custCount, leadCount, woCount] = await Promise.all([
      prisma.order.aggregate({ _sum: { amount: true }, _count: true }),
      prisma.invoice.aggregate({ _sum: { amount: true }, _count: true }),
      prisma.customer.count(),
      prisma.lead.count(),
      prisma.workOrder.count(),
    ]);
    const sections = [
      { name: 'Executive Summary', content: `Period ${b.period} board pack. Generated ${new Date().toISOString()}.`, kpis: { customers: custCount, leads: leadCount } },
      { name: 'Sales', content: 'Total order volume + value across all channels.', kpis: { orderCount: orderAgg._count, orderValue: orderAgg._sum?.amount || 0 } },
      { name: 'Finance', content: 'Invoiced revenue and AR snapshot.', kpis: { invoiceCount: invAgg._count, invoicedAmount: invAgg._sum.amount || 0 } },
      { name: 'Operations', content: 'Work order throughput.', kpis: { workOrders: woCount } },
    ];
    const row = await prisma.boardPack.upsert({
      where: { period: b.period },
      create: { period: b.period, title: b.title || `Board Pack — ${b.period}`, sections, status: 'Draft' },
      update: { sections, title: b.title || `Board Pack — ${b.period}`, generatedAt: new Date(), status: 'Draft', approvedAt: null, approvedBy: null },
    });
    void emitAudit(req, 'boardPack.generated', 'BoardPack', row.id, { module: 'board-pack' });
    eventBus.emitDomain('board.pack.generated', row, 'board-pack');
    res.status(201).json({ success: true, data: row });
  } catch (err) { const z = zerr(err, res); if (z) return; res.status(500).json({ success: false, error: 'generate failed' }); }
});
wave5Router.post('/board-packs/:id/status', async (req, res) => {
  const Body = z.object({ status: z.enum(['Draft', 'Review', 'Approved', 'Distributed']) });
  try {
    const b = Body.parse(req.body);
    const ex = await prisma.boardPack.findUnique({ where: { id: req.params.id } });
    if (!ex) return res.status(404).json({ success: false, error: 'Not found' });
    const allowed = BOARD_NEXT[ex.status] || [];
    if (!allowed.includes(b.status)) {
      return res.status(409).json({ success: false, error: `Cannot transition from '${ex.status}' to '${b.status}'`, allowed });
    }
    const data: any = { status: b.status };
    if (b.status === 'Approved') {
      data.approvedAt = new Date();
      data.approvedBy = (req as any).user?.userId || null;
    }
    const row = await prisma.boardPack.update({ where: { id: ex.id }, data });
    void emitAudit(req, 'boardPack.status', 'BoardPack', row.id, { module: 'board-pack', payload: { from: ex.status, to: b.status } });
    res.json({ success: true, data: row });
  } catch (err) { const z = zerr(err, res); if (z) return; res.status(500).json({ success: false, error: 'status failed' }); }
});
wave5Router.post('/board-packs/:id/approve', async (req, res) => {
  const ex = await prisma.boardPack.findUnique({ where: { id: req.params.id } });
  if (!ex) return res.status(404).json({ success: false, error: 'Not found' });
  const allowed = BOARD_NEXT[ex.status] || [];
  if (!allowed.includes('Approved')) {
    return res.status(409).json({ success: false, error: `Cannot approve from '${ex.status}'`, allowed });
  }
  const row = await prisma.boardPack.update({ where: { id: ex.id }, data: { status: 'Approved', approvedAt: new Date(), approvedBy: (req as any).user?.userId || null } });
  void emitAudit(req, 'boardPack.approved', 'BoardPack', row.id, { module: 'board-pack', payload: { from: ex.status } });
  res.json({ success: true, data: row });
});

// ─── #44 VARIANCE AI COMMENTARY ────────────────────────────────────────────
function classifyVariance(variance: number, variancePct: number | null): string {
  const absPct = Math.abs(variancePct || 0);
  if (absPct < 2) return 'Timing';
  if (absPct > 20) return 'Volume';
  if (variance < 0) return 'Price';
  return 'Mix';
}
function generateCommentary(account: string, variance: number, pct: number | null, klass: string): string {
  const dir = variance > 0 ? 'over budget' : 'under budget';
  const mag = Math.abs(pct || 0).toFixed(1);
  const reasonMap: Record<string, string> = {
    'Timing': 'minor period-end accrual timing differences — expected to normalise next period',
    'Volume': 'driven by volume changes versus plan — recommend reviewing volume drivers',
    'Price': 'driven primarily by price effects — recommend revisiting pricing assumptions',
    'Mix': 'driven by product/customer mix shifts',
    'FX': 'foreign-exchange revaluation impact',
    'Other': 'other operational adjustments',
  };
  return `Account ${account} is ${dir} by ${mag}%. Classification: ${klass}. Likely cause: ${reasonMap[klass] || 'unclassified'}.`;
}
wave5Router.post('/variance-commentary/generate', async (req, res) => {
  const Body = z.object({ period: z.string().min(4) });
  try {
    const b = Body.parse(req.body);
    const [budgets, allocs] = await Promise.all([
      prisma.budgetLine.findMany({ where: { period: b.period, scenario: 'Base' } }),
      prisma.costAllocation.findMany({ where: { period: b.period } }),
    ]);
    const byKey = new Map<string, { account: string; costCenter: string; budgeted: number; actual: number }>();
    budgets.forEach(x => { const k = `${x.account}|${x.costCenter || ''}`; byKey.set(k, { account: x.account, costCenter: x.costCenter || '', budgeted: x.budgeted, actual: 0 }); });
    allocs.forEach(a => {
      const k = `${a.fromAccount}|${a.toCostCenter}`;
      const r = byKey.get(k) || { account: a.fromAccount, costCenter: a.toCostCenter, budgeted: 0, actual: 0 };
      r.actual += a.amount;
      byKey.set(k, r);
    });
    const generated: any[] = [];
    for (const r of byKey.values()) {
      const variance = +(r.actual - r.budgeted).toFixed(2);
      if (Math.abs(variance) < 0.01) continue;
      const variancePct = r.budgeted ? +((variance / r.budgeted) * 100).toFixed(2) : null;
      const klass = classifyVariance(variance, variancePct);
      const aiLine = await varianceLineCommentary({
        account: r.account,
        costCenter: r.costCenter || null,
        variance,
        variancePct,
        classification: klass,
        period: b.period,
      });
      const commentary = aiLine.commentary || generateCommentary(r.account, variance, variancePct, klass);
      const row = await prisma.varianceCommentary.create({
        data: {
          period: b.period,
          account: r.account,
          costCenter: r.costCenter || null,
          variance,
          variancePct,
          commentary,
          classification: klass,
          generatedBy: aiLine.aiGenerated ? 'groq' : 'ai',
        },
      });
      void emitAudit(req, 'varianceCommentary.generated', 'VarianceCommentary', row.id, { module: 'variance-ai' });
      eventBus.emitDomain('variance.commentary.generated', row, 'variance-ai');
      generated.push(row);
    }
    res.json({ success: true, data: generated, total: generated.length, period: b.period });
  } catch (err) { const z = zerr(err, res); if (z) return; res.status(500).json({ success: false, error: 'generate failed' }); }
});
wave5Router.get('/variance-commentary', async (req, res) => {
  const where: any = {};
  if (req.query.period) where.period = String(req.query.period);
  const rows = await prisma.varianceCommentary.findMany({ where, orderBy: { createdAt: 'desc' }, take: 200 });
  res.json({ success: true, data: rows, total: rows.length });
});
wave5Router.get('/variance-commentary/:id', async (req, res) => {
  const row = await prisma.varianceCommentary.findUnique({ where: { id: req.params.id } });
  if (!row) return res.status(404).json({ success: false, error: 'Not found' });
  res.json({ success: true, data: row });
});
wave5Router.post('/variance-commentary/:id/approve', async (req, res) => {
  const ex = await prisma.varianceCommentary.findUnique({ where: { id: req.params.id } });
  if (!ex) return res.status(404).json({ success: false, error: 'Not found' });
  if (ex.approved) return res.json({ success: true, data: ex, message: 'Already approved' });
  const row = await prisma.varianceCommentary.update({ where: { id: ex.id }, data: { approved: true } });
  void emitAudit(req, 'varianceCommentary.approved', 'VarianceCommentary', row.id, { module: 'variance-ai' });
  res.json({ success: true, data: row });
});

// ─── #46 SERVICE TICKETS ───────────────────────────────────────────────────
const TicketCreate = z.object({
  ticketNo: z.string().min(2),
  customerName: z.string().min(2),
  subject: z.string().min(2),
  description: z.string().optional().nullable(),
  priority: z.enum(['Low', 'Medium', 'High', 'Urgent']).default('Medium'),
  category: z.string().optional().nullable(),
  assignedTo: z.string().optional().nullable(),
});
const TICKET_NEXT: Record<string, string[]> = {
  Open: ['InProgress', 'OnHold', 'Resolved'],
  InProgress: ['OnHold', 'Resolved'],
  OnHold: ['InProgress', 'Resolved'],
  Resolved: ['Closed', 'InProgress'],
  Closed: [],
};
wave5Router.get('/service-tickets', async (req, res) => {
  const where: any = {};
  if (req.query.status) where.status = String(req.query.status);
  if (req.query.priority) where.priority = String(req.query.priority);
  const rows = await prisma.serviceTicket.findMany({ where, orderBy: [{ priority: 'desc' }, { openedAt: 'desc' }], take: 200 });
  res.json({ success: true, data: rows, total: rows.length });
});
wave5Router.get('/service-tickets/:id', async (req, res) => {
  const row = await prisma.serviceTicket.findUnique({ where: { id: req.params.id } });
  if (!row) return res.status(404).json({ success: false, error: 'Not found' });
  res.json({ success: true, data: row });
});
wave5Router.post('/service-tickets', async (req, res) => {
  try {
    const b = TicketCreate.parse(req.body);
    const row = await uniqueCatch(() => prisma.serviceTicket.create({ data: b }), res);
    if ((row as Response).statusCode) return;
    void emitAudit(req, 'serviceTicket.created', 'ServiceTicket', (row as any).id, { module: 'service' });
    eventBus.emitDomain('service.ticket.created', row, 'service');
    res.status(201).json({ success: true, data: row });
  } catch (err) { const z = zerr(err, res); if (z) return; res.status(500).json({ success: false, error: 'create failed' }); }
});
wave5Router.post('/service-tickets/:id/status', async (req, res) => {
  const Body = z.object({ status: z.enum(['Open', 'InProgress', 'OnHold', 'Resolved', 'Closed']), resolution: z.string().optional().nullable() });
  try {
    const b = Body.parse(req.body);
    const ex = await prisma.serviceTicket.findUnique({ where: { id: req.params.id } });
    if (!ex) return res.status(404).json({ success: false, error: 'Not found' });
    const allowed = TICKET_NEXT[ex.status] || [];
    if (!allowed.includes(b.status)) {
      return res.status(409).json({ success: false, error: `Cannot transition from '${ex.status}' to '${b.status}'`, allowed });
    }
    const data: any = { status: b.status };
    if (b.status === 'Resolved' || b.status === 'Closed') {
      const slaHrs = ex.priority === 'Urgent' ? 4 : ex.priority === 'High' ? 24 : ex.priority === 'Medium' ? 72 : 168;
      const ageHrs = (Date.now() - new Date(ex.openedAt).getTime()) / 3600000;
      data.slaBreached = ageHrs > slaHrs;
      if (b.resolution) data.resolution = b.resolution;
      if (b.status === 'Resolved') data.resolvedAt = new Date();
      if (b.status === 'Closed') data.closedAt = new Date();
    }
    const row = await prisma.serviceTicket.update({ where: { id: ex.id }, data });
    void emitAudit(req, 'serviceTicket.status', 'ServiceTicket', row.id, { module: 'service', payload: { from: ex.status, to: b.status } });
    res.json({ success: true, data: row });
  } catch (err) { const z = zerr(err, res); if (z) return; res.status(500).json({ success: false, error: 'status failed' }); }
});
wave5Router.post('/service-tickets/:id/resolve', async (req, res) => {
  const Body = z.object({ resolution: z.string().min(2) });
  try {
    const b = Body.parse(req.body);
    const ex = await prisma.serviceTicket.findUnique({ where: { id: req.params.id } });
    if (!ex) return res.status(404).json({ success: false, error: 'Not found' });
    const allowed = TICKET_NEXT[ex.status] || [];
    if (!allowed.includes('Resolved')) {
      return res.status(409).json({ success: false, error: `Cannot resolve from '${ex.status}'`, allowed });
    }
    const slaHrs = ex.priority === 'Urgent' ? 4 : ex.priority === 'High' ? 24 : ex.priority === 'Medium' ? 72 : 168;
    const ageHrs = (Date.now() - new Date(ex.openedAt).getTime()) / 3600000;
    const row = await prisma.serviceTicket.update({ where: { id: ex.id }, data: { resolution: b.resolution, status: 'Resolved', resolvedAt: new Date(), slaBreached: ageHrs > slaHrs } });
    void emitAudit(req, 'serviceTicket.resolved', 'ServiceTicket', row.id, { module: 'service', payload: { from: ex.status } });
    res.json({ success: true, data: row, slaInfo: { slaHrs, actualHrs: +ageHrs.toFixed(2), breached: ageHrs > slaHrs } });
  } catch (err) { const z = zerr(err, res); if (z) return; res.status(500).json({ success: false, error: 'update failed' }); }
});

// ─── #47 PROFESSIONAL SERVICES ─────────────────────────────────────────────
const EngagementCreate = z.object({
  code: z.string().min(2),
  clientName: z.string().min(2),
  title: z.string().min(2),
  type: z.enum(['FixedFee', 'TimeMaterial', 'Retainer']).default('FixedFee'),
  budget: z.number().nonnegative().default(0),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional().nullable(),
  manager: z.string().optional().nullable(),
});
const ENG_NEXT: Record<string, string[]> = {
  Active: ['OnHold', 'Completed', 'Cancelled'],
  OnHold: ['Active', 'Cancelled'],
  Completed: [],
  Cancelled: [],
};
wave5Router.get('/engagements', async (req, res) => {
  const where: any = {}; if (req.query.status) where.status = String(req.query.status);
  const rows = await prisma.engagement.findMany({ where, include: { timeEntries: { take: 5, orderBy: { date: 'desc' } } }, orderBy: { createdAt: 'desc' }, take: 100 });
  res.json({ success: true, data: rows, total: rows.length });
});
wave5Router.get('/engagements/:id', async (req, res) => {
  const row = await prisma.engagement.findUnique({
    where: { id: req.params.id },
    include: { timeEntries: { orderBy: { date: 'desc' }, take: 100 } },
  });
  if (!row) return res.status(404).json({ success: false, error: 'Engagement not found' });
  res.json({ success: true, data: row });
});
wave5Router.post('/engagements', async (req, res) => {
  try {
    const b = EngagementCreate.parse(req.body);
    const row = await uniqueCatch(() => prisma.engagement.create({ data: b }), res);
    if ((row as Response).statusCode) return;
    void emitAudit(req, 'engagement.created', 'Engagement', (row as any).id, { module: 'professional-services' });
    eventBus.emitDomain('service.engagement.created', row, 'professional-services');
    res.status(201).json({ success: true, data: row });
  } catch (err) { const z = zerr(err, res); if (z) return; res.status(500).json({ success: false, error: 'create failed' }); }
});
wave5Router.post('/engagements/:id/status', async (req, res) => {
  const Body = z.object({ status: z.enum(['Active', 'OnHold', 'Completed', 'Cancelled']) });
  try {
    const b = Body.parse(req.body);
    const ex = await prisma.engagement.findUnique({ where: { id: req.params.id } });
    if (!ex) return res.status(404).json({ success: false, error: 'Engagement not found' });
    const allowed = ENG_NEXT[ex.status] || [];
    if (!allowed.includes(b.status)) {
      return res.status(409).json({ success: false, error: `Cannot transition from '${ex.status}' to '${b.status}'`, allowed });
    }
    const row = await prisma.engagement.update({ where: { id: ex.id }, data: { status: b.status } });
    void emitAudit(req, 'engagement.status', 'Engagement', row.id, { module: 'professional-services', payload: { from: ex.status, to: b.status } });
    res.json({ success: true, data: row });
  } catch (err) { const z = zerr(err, res); if (z) return; res.status(500).json({ success: false, error: 'status failed' }); }
});
wave5Router.post('/engagements/:id/time', async (req, res) => {
  const Body = z.object({ employeeId: z.string().min(1), date: z.coerce.date(), hours: z.number().positive(), rate: z.number().nonnegative().default(0), description: z.string().optional().nullable(), billable: z.boolean().default(true) });
  try {
    const b = Body.parse(req.body);
    const eng = await prisma.engagement.findUnique({ where: { id: req.params.id } });
    if (!eng) return res.status(404).json({ success: false, error: 'Engagement not found' });
    if (eng.status === 'Completed' || eng.status === 'Cancelled') {
      return res.status(409).json({ success: false, error: `Cannot log time on ${eng.status} engagement` });
    }
    const amount = +(b.hours * b.rate).toFixed(2);
    const [entry] = await prisma.$transaction([
      prisma.timeEntry.create({ data: { engagementId: eng.id, employeeId: b.employeeId, date: b.date, hours: b.hours, rate: b.rate, amount, description: b.description ?? null, billable: b.billable } }),
      prisma.engagement.update({ where: { id: eng.id }, data: { spent: eng.spent + amount } }),
    ]);
    void emitAudit(req, 'timeEntry.created', 'TimeEntry', entry.id, { module: 'professional-services', payload: { engagementId: eng.id, hours: b.hours } });
    res.status(201).json({ success: true, data: entry, engagementSpent: eng.spent + amount });
  } catch (err) { const z = zerr(err, res); if (z) return; res.status(500).json({ success: false, error: 'create failed' }); }
});

// ─── Price lists (CPQ pricing master) ───────────────────────────────────────
wave5Router.get('/price-lists', async (_req, res) => {
  try {
    const rows = await prisma.priceList.findMany({
      include: { entries: true },
      orderBy: [{ isDefault: 'desc' }, { name: 'asc' }],
    });
    res.json({ success: true, data: rows, total: rows.length });
  } catch (err: any) {
    if (err?.code === 'P2021') {
      return res.status(503).json({ success: false, error: 'PriceList table missing — apply prisma/manual/module_crm_q2c_additive.sql' });
    }
    res.status(500).json({ success: false, error: err?.message || 'list failed' });
  }
});

wave5Router.post('/price-lists', async (req, res) => {
  const Body = z.object({
    name: z.string().min(1),
    currency: z.string().default('USD'),
    type: z.enum(['STANDARD', 'CUSTOMER_SPECIFIC', 'VOLUME', 'PROMOTIONAL']).default('STANDARD'),
    isDefault: z.boolean().optional().default(false),
    validTo: z.coerce.date().optional().nullable(),
    entries: z.array(z.object({
      sku: z.string().min(1),
      minQty: z.number().positive().default(1),
      unitPrice: z.number().nonnegative(),
      discount: z.number().min(0).default(0),
    })).default([]),
  });
  try {
    const b = Body.parse(req.body);
    if (b.isDefault) {
      await prisma.priceList.updateMany({ where: { isDefault: true }, data: { isDefault: false } });
    }
    const row = await prisma.priceList.create({
      data: {
        name: b.name,
        currency: b.currency,
        type: b.type,
        isDefault: b.isDefault,
        validTo: b.validTo ?? null,
        entries: { create: b.entries },
      },
      include: { entries: true },
    });
    res.status(201).json({ success: true, data: row });
  } catch (err: any) {
    const z = zerr(err, res); if (z) return;
    if (err?.code === 'P2021') {
      return res.status(503).json({ success: false, error: 'PriceList table missing — apply prisma/manual/module_crm_q2c_additive.sql' });
    }
    res.status(500).json({ success: false, error: err?.message || 'create failed' });
  }
});

wave5Router.get('/price-lists/lookup', async (req, res) => {
  try {
    const sku = String(req.query.sku || '');
    const qty = Math.max(1, Number(req.query.qty) || 1);
    if (!sku) return res.status(400).json({ success: false, error: 'sku required' });
    const list = await prisma.priceList.findFirst({
      where: { isDefault: true },
      include: { entries: { where: { sku }, orderBy: { minQty: 'desc' } } },
    });
    const entry = (list?.entries || []).find((e) => e.minQty <= qty) || null;
    if (!entry) return res.status(404).json({ success: false, error: 'No price for SKU' });
    res.json({
      success: true,
      data: {
        sku,
        qty,
        unitPrice: entry.unitPrice,
        discount: entry.discount,
        priceListId: list!.id,
        priceListName: list!.name,
        currency: list!.currency,
      },
    });
  } catch (err: any) {
    if (err?.code === 'P2021') {
      return res.status(503).json({ success: false, error: 'PriceList table missing — apply prisma/manual/module_crm_q2c_additive.sql' });
    }
    res.status(500).json({ success: false, error: err?.message || 'lookup failed' });
  }
});

// ─── Sales orders ───────────────────────────────────────────────────────────
wave5Router.get('/sales-orders', async (req, res) => {
  try {
    const where: any = {};
    if (req.query.status) where.status = String(req.query.status);
    const rows = await prisma.salesOrder.findMany({
      where,
      include: { lines: true },
      orderBy: { createdAt: 'desc' },
      take: Math.min(Number(req.query.limit) || 100, 200),
    });
    res.json({ success: true, data: rows, total: rows.length });
  } catch (err: any) {
    if (err?.code === 'P2021') {
      return res.status(503).json({ success: false, error: 'SalesOrder table missing — apply prisma/manual/module_crm_q2c_additive.sql' });
    }
    res.status(500).json({ success: false, error: err?.message || 'list failed' });
  }
});

wave5Router.get('/sales-orders/:id', async (req, res) => {
  try {
    const row = await prisma.salesOrder.findUnique({ where: { id: req.params.id }, include: { lines: true } });
    if (!row) return res.status(404).json({ success: false, error: 'Sales order not found' });
    res.json({ success: true, data: row });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || 'get failed' });
  }
});

const SalesOrderLineCreate = z.object({
  sku: z.string().min(1),
  description: z.string().optional().nullable(),
  quantity: z.number().positive(),
  unitPrice: z.number().nonnegative(),
  uom: z.string().default('EA'),
  discount: z.number().nonnegative().default(0),
});

const SalesOrderCreate = z.object({
  customerName: z.string().min(1),
  customerId: z.string().optional().nullable(),
  paymentTerms: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  currency: z.string().regex(/^[A-Z]{3}$/).default('USD'),
  status: z.enum(['DRAFT', 'CONFIRMED']).default('CONFIRMED'),
  lines: z.array(SalesOrderLineCreate).min(1),
});

wave5Router.post('/sales-orders', async (req, res) => {
  try {
    const b = SalesOrderCreate.parse(req.body);
    let creditHold = false;
    if (b.customerId) {
      const credit = await prisma.creditLimit.findUnique({ where: { customerId: b.customerId } });
      const subtotal = b.lines.reduce((s, l) => s + l.quantity * l.unitPrice * (1 - l.discount / 100), 0);
      if (credit && subtotal > credit.availableAmount) creditHold = true;
    }
    const count = await prisma.salesOrder.count();
    const orderNumber = `SO-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;
    const lines = b.lines.map((l, i) => {
      const lineTotal = +(l.quantity * l.unitPrice * (1 - l.discount / 100)).toFixed(2);
      return {
        lineNumber: i + 1,
        sku: l.sku,
        description: l.description,
        quantity: l.quantity,
        unitPrice: l.unitPrice,
        uom: l.uom,
        discount: l.discount,
        taxAmount: 0,
        lineTotal,
      };
    });
    const subtotal = lines.reduce((s, l) => s + l.lineTotal, 0);
    const row = await prisma.salesOrder.create({
      data: {
        orderNumber,
        customerId: b.customerId ?? null,
        customerName: b.customerName,
        status: creditHold ? 'CREDIT_HOLD' : b.status,
        currency: b.currency,
        subtotal,
        totalAmount: subtotal,
        paymentTerms: b.paymentTerms ?? null,
        notes: b.notes ?? null,
        createdBy: (req as any).user?.id ?? null,
        lines: { create: lines },
      },
      include: { lines: true },
    });
    void emitAudit(req, 'salesOrder.created', 'SalesOrder', row.id, {
      module: 'cpq',
      payload: { status: row.status },
    });
    res.status(201).json({ success: true, data: row });
  } catch (err: any) {
    if (err?.name === 'ZodError') {
      return res.status(400).json({ success: false, error: 'Validation failed', issues: err.issues });
    }
    if (err?.code === 'P2021') {
      return res.status(503).json({ success: false, error: 'SalesOrder table missing — apply prisma/manual/module_crm_q2c_additive.sql' });
    }
    res.status(500).json({ success: false, error: err?.message || 'create failed' });
  }
});

/** Sales order fulfillment spine after quote accept */
const SO_TRANSITIONS: Record<string, string[]> = {
  DRAFT: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['INVOICED', 'SHIPPED', 'CANCELLED'],
  CREDIT_HOLD: ['CONFIRMED', 'CANCELLED'],
  INVOICED: ['SHIPPED', 'COMPLETED'],
  SHIPPED: ['COMPLETED'],
  COMPLETED: [],
  CANCELLED: [],
};

wave5Router.post('/sales-orders/:id/status', async (req, res) => {
  const Body = z.object({
    status: z.enum(['DRAFT', 'CONFIRMED', 'CREDIT_HOLD', 'INVOICED', 'SHIPPED', 'COMPLETED', 'CANCELLED']),
  });
  try {
    const b = Body.parse(req.body);
    const ex = await prisma.salesOrder.findUnique({ where: { id: req.params.id }, include: { lines: true } });
    if (!ex) return res.status(404).json({ success: false, error: 'Sales order not found' });
    if (ex.status === b.status) {
      return res.json({ success: true, data: ex, message: 'Status unchanged' });
    }
    const allowed = SO_TRANSITIONS[ex.status] || [];
    if (!allowed.includes(b.status)) {
      return res.status(409).json({
        success: false,
        error: `Cannot transition sales order from '${ex.status}' to '${b.status}'`,
        allowed,
      });
    }
    const row = await prisma.salesOrder.update({
      where: { id: ex.id },
      data: { status: b.status },
      include: { lines: true },
    });
    void emitAudit(req, 'salesOrder.status', 'SalesOrder', row.id, {
      module: 'cpq',
      payload: { from: ex.status, to: b.status },
    });
    eventBus.emitDomain('sales.order.status', { ...row, from: ex.status }, 'cpq');
    res.json({ success: true, data: row });
  } catch (err: any) {
    const z = zerr(err, res); if (z) return;
    res.status(500).json({ success: false, error: err?.message || 'status failed' });
  }
});
