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

// ─── #6 PAYMENT RUNS ────────────────────────────────────────────────────────
wave5Router.get('/payment-runs', async (_req, res) => {
  const rows = await prisma.paymentRun.findMany({ include: { items: true }, orderBy: { createdAt: 'desc' }, take: 100 });
  res.json({ success: true, data: rows, total: rows.length });
});
wave5Router.post('/payment-runs', async (req, res) => {
  const Body = z.object({ runNo: z.string().min(2), description: z.string().optional().nullable(), currency: z.string().default('USD'), items: z.array(z.object({ payeeName: z.string().min(1), amount: z.number().positive(), payeeAccount: z.string().optional().nullable(), invoiceRef: z.string().optional().nullable() })).default([]) });
  try {
    const b = Body.parse(req.body);
    const total = b.items.reduce((s, i) => s + i.amount, 0);
    const run = await uniqueCatch(() => prisma.paymentRun.create({ data: { runNo: b.runNo, description: b.description ?? null, currency: b.currency, totalAmount: total, itemCount: b.items.length, status: 'Draft', items: { create: b.items.map(i => ({ ...i, currency: b.currency })) } }, include: { items: true } }), res);
    if ((run as Response).statusCode) return;
    res.status(201).json({ success: true, data: run });
  } catch (err) { const z = zerr(err, res); if (z) return; res.status(500).json({ success: false, error: 'create failed' }); }
});
wave5Router.post('/payment-runs/:id/release', async (req, res) => {
  const ex = await prisma.paymentRun.findUnique({ where: { id: req.params.id } });
  if (!ex) return res.status(404).json({ success: false, error: 'Not found' });
  if (ex.status !== 'Draft' && ex.status !== 'Approved') return res.status(409).json({ success: false, error: `Cannot release from '${ex.status}'` });
  const [run] = await prisma.$transaction([
    prisma.paymentRun.update({ where: { id: ex.id }, data: { status: 'Released', releasedAt: new Date(), releasedBy: (req as any).user?.userId || null } }),
    prisma.paymentRunItem.updateMany({ where: { runId: ex.id }, data: { status: 'Paid' } }),
  ]);
  res.json({ success: true, data: run });
});

// ─── #9 CPQ — QUOTES ────────────────────────────────────────────────────────
wave5Router.get('/quotes', async (_req, res) => {
  const rows = await prisma.quote.findMany({ include: { lines: true }, orderBy: { createdAt: 'desc' }, take: 100 });
  res.json({ success: true, data: rows, total: rows.length });
});
wave5Router.post('/quotes', async (req, res) => {
  const Body = z.object({
    quoteNo: z.string().min(2),
    customerName: z.string().min(1),
    currency: z.string().default('USD'),
    discount: z.number().min(0).default(0),
    validUntil: z.coerce.date().optional().nullable(),
    notes: z.string().optional().nullable(),
    lines: z.array(z.object({ sku: z.string(), description: z.string().optional().nullable(), qty: z.number().positive(), unitPrice: z.number().nonnegative(), discount: z.number().min(0).default(0) })).default([]),
  });
  try {
    const b = Body.parse(req.body);
    const linesCalc = b.lines.map(l => ({ ...l, lineTotal: +(l.qty * l.unitPrice * (1 - l.discount / 100)).toFixed(2) }));
    const subtotal = +linesCalc.reduce((s, l) => s + l.lineTotal, 0).toFixed(2);
    const total = +(subtotal * (1 - b.discount / 100)).toFixed(2);
    const row = await uniqueCatch(() => prisma.quote.create({ data: { quoteNo: b.quoteNo, customerName: b.customerName, currency: b.currency, discount: b.discount, validUntil: b.validUntil ?? null, notes: b.notes ?? null, subtotal, total, status: 'Draft', lines: { create: linesCalc } }, include: { lines: true } }), res);
    if ((row as Response).statusCode) return;
    res.status(201).json({ success: true, data: row });
  } catch (err) { const z = zerr(err, res); if (z) return; res.status(500).json({ success: false, error: 'create failed' }); }
});
wave5Router.post('/quotes/:id/status', async (req, res) => {
  const Body = z.object({ status: z.enum(['Draft', 'Sent', 'Accepted', 'Rejected', 'Expired']) });
  try {
    const b = Body.parse(req.body);
    const ex = await prisma.quote.findUnique({ where: { id: req.params.id } });
    if (!ex) return res.status(404).json({ success: false, error: 'Not found' });
    const row = await prisma.quote.update({ where: { id: ex.id }, data: { status: b.status } });
    res.json({ success: true, data: row });
  } catch (err) { const z = zerr(err, res); if (z) return; res.status(500).json({ success: false, error: 'update failed' }); }
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
wave5Router.post('/contracts', async (req, res) => {
  try {
    const b = ContractCreate.parse(req.body);
    if (b.endDate <= b.startDate) return res.status(400).json({ success: false, error: 'endDate must be after startDate' });
    const row = await uniqueCatch(() => prisma.contract.create({ data: { ...b, notes: b.notes ?? null } }), res);
    if ((row as Response).statusCode) return;
    res.status(201).json({ success: true, data: row });
  } catch (err) { const z = zerr(err, res); if (z) return; res.status(500).json({ success: false, error: 'create failed' }); }
});
wave5Router.post('/contracts/:id/sign', async (req, res) => {
  const ex = await prisma.contract.findUnique({ where: { id: req.params.id } });
  if (!ex) return res.status(404).json({ success: false, error: 'Not found' });
  const row = await prisma.contract.update({ where: { id: ex.id }, data: { status: 'Signed', signedAt: new Date(), signedBy: (req as any).user?.userId || null } });
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
wave5Router.post('/sourcing-suppliers', async (req, res) => {
  try {
    const b = SrcCreate.parse(req.body);
    const row = await prisma.sourcingSupplier.create({ data: b });
    res.status(201).json({ success: true, data: row });
  } catch (err) { const z = zerr(err, res); if (z) return; res.status(500).json({ success: false, error: 'create failed' }); }
});
wave5Router.post('/sourcing-suppliers/:id/qualify', async (req, res) => {
  const Body = z.object({ qualifiedStatus: z.enum(['Discovered', 'InReview', 'Qualified', 'Rejected']) });
  try {
    const b = Body.parse(req.body);
    const ex = await prisma.sourcingSupplier.findUnique({ where: { id: req.params.id } });
    if (!ex) return res.status(404).json({ success: false, error: 'Not found' });
    const row = await prisma.sourcingSupplier.update({ where: { id: ex.id }, data: { qualifiedStatus: b.qualifiedStatus } });
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
wave5Router.post('/shop-floor-ops', async (req, res) => {
  try {
    const b = SFOPCreate.parse(req.body);
    const row = await prisma.shopFloorOp.create({ data: b });
    res.status(201).json({ success: true, data: row });
  } catch (err) { const z = zerr(err, res); if (z) return; res.status(500).json({ success: false, error: 'create failed' }); }
});
wave5Router.post('/shop-floor-ops/:id/report', async (req, res) => {
  const Body = z.object({ qtyDone: z.number().nonnegative(), qtyScrap: z.number().nonnegative().default(0), status: z.enum(['InProgress', 'Paused', 'Completed', 'Scrapped']).optional() });
  try {
    const b = Body.parse(req.body);
    const ex = await prisma.shopFloorOp.findUnique({ where: { id: req.params.id } });
    if (!ex) return res.status(404).json({ success: false, error: 'Not found' });
    const data: any = { qtyDone: b.qtyDone, qtyScrap: b.qtyScrap };
    if (b.status) {
      data.status = b.status;
      if (b.status === 'InProgress' && !ex.startedAt) data.startedAt = new Date();
      if (b.status === 'Completed') data.completedAt = new Date();
    }
    const row = await prisma.shopFloorOp.update({ where: { id: ex.id }, data });
    res.json({ success: true, data: row });
  } catch (err) { const z = zerr(err, res); if (z) return; res.status(500).json({ success: false, error: 'update failed' }); }
});

// ─── #28 3PL ────────────────────────────────────────────────────────────────
wave5Router.get('/threepl-partners', async (_req, res) => {
  const rows = await prisma.threePLPartner.findMany({ orderBy: { name: 'asc' } });
  res.json({ success: true, data: rows, total: rows.length });
});
wave5Router.post('/threepl-partners', async (req, res) => {
  const Body = z.object({ code: z.string().min(2), name: z.string().min(2), apiBaseUrl: z.string().optional().nullable(), authMode: z.enum(['apikey', 'oauth', 'none']).default('apikey'), webhookUrl: z.string().optional().nullable() });
  try {
    const b = Body.parse(req.body);
    const row = await uniqueCatch(() => prisma.threePLPartner.create({ data: b }), res);
    if ((row as Response).statusCode) return;
    res.status(201).json({ success: true, data: row });
  } catch (err) { const z = zerr(err, res); if (z) return; res.status(500).json({ success: false, error: 'create failed' }); }
});
wave5Router.post('/threepl-events', async (req, res) => {
  const Body = z.object({ partnerCode: z.string(), eventType: z.string(), payload: z.any().default({}) });
  try {
    const b = Body.parse(req.body);
    const row = await prisma.threePLEvent.create({ data: { partnerCode: b.partnerCode, eventType: b.eventType, payload: b.payload ?? {} } });
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

// ─── #30 TALENT ─────────────────────────────────────────────────────────────
const PostingCreate = z.object({ reqNo: z.string().min(2), title: z.string().min(2), department: z.string().optional().nullable(), location: z.string().optional().nullable(), level: z.string().optional().nullable(), description: z.string().optional().nullable() });
wave5Router.get('/postings', async (req, res) => {
  const where: any = {}; if (req.query.status) where.status = String(req.query.status);
  const rows = await prisma.jobPosting.findMany({ where, include: { candidates: true }, orderBy: { postedAt: 'desc' } });
  res.json({ success: true, data: rows, total: rows.length });
});
wave5Router.post('/postings', async (req, res) => {
  try {
    const b = PostingCreate.parse(req.body);
    const row = await uniqueCatch(() => prisma.jobPosting.create({ data: b }), res);
    if ((row as Response).statusCode) return;
    res.status(201).json({ success: true, data: row });
  } catch (err) { const z = zerr(err, res); if (z) return; res.status(500).json({ success: false, error: 'create failed' }); }
});
wave5Router.post('/postings/:id/candidates', async (req, res) => {
  const Body = z.object({ name: z.string().min(2), email: z.string().email().optional().nullable(), phone: z.string().optional().nullable(), rating: z.number().int().min(0).max(5).default(0), notes: z.string().optional().nullable() });
  try {
    const b = Body.parse(req.body);
    const posting = await prisma.jobPosting.findUnique({ where: { id: req.params.id } });
    if (!posting) return res.status(404).json({ success: false, error: 'Posting not found' });
    const row = await prisma.candidate.create({ data: { postingId: posting.id, ...b } });
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
    res.json({ success: true, data: row });
  } catch (err) { const z = zerr(err, res); if (z) return; res.status(500).json({ success: false, error: 'update failed' }); }
});

// ─── #31 LMS ────────────────────────────────────────────────────────────────
const CourseCreate = z.object({ code: z.string().min(2), title: z.string().min(2), category: z.string().optional().nullable(), durationHrs: z.number().positive().default(1), level: z.string().optional().nullable() });
wave5Router.get('/courses', async (_req, res) => {
  const rows = await prisma.course.findMany({ include: { enrollments: true }, orderBy: { code: 'asc' } });
  res.json({ success: true, data: rows, total: rows.length });
});
wave5Router.post('/courses', async (req, res) => {
  try {
    const b = CourseCreate.parse(req.body);
    const row = await uniqueCatch(() => prisma.course.create({ data: b }), res);
    if ((row as Response).statusCode) return;
    res.status(201).json({ success: true, data: row });
  } catch (err) { const z = zerr(err, res); if (z) return; res.status(500).json({ success: false, error: 'create failed' }); }
});
wave5Router.post('/courses/:id/enroll', async (req, res) => {
  const Body = z.object({ employeeId: z.string().min(1) });
  try {
    const b = Body.parse(req.body);
    const course = await prisma.course.findUnique({ where: { id: req.params.id } });
    if (!course) return res.status(404).json({ success: false, error: 'Course not found' });
    const row = await uniqueCatch(() => prisma.enrollment.create({ data: { courseId: course.id, employeeId: b.employeeId } }), res);
    if ((row as Response).statusCode) return;
    res.status(201).json({ success: true, data: row });
  } catch (err) { const z = zerr(err, res); if (z) return; res.status(500).json({ success: false, error: 'enroll failed' }); }
});
wave5Router.post('/enrollments/:id/complete', async (req, res) => {
  const Body = z.object({ score: z.number().min(0).max(100) });
  try {
    const b = Body.parse(req.body);
    const ex = await prisma.enrollment.findUnique({ where: { id: req.params.id } });
    if (!ex) return res.status(404).json({ success: false, error: 'Not found' });
    const row = await prisma.enrollment.update({ where: { id: ex.id }, data: { score: b.score, completedAt: new Date(), status: b.score >= 50 ? 'Completed' : 'Failed' } });
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
wave5Router.get('/perf-reviews', async (req, res) => {
  const where: any = {};
  if (req.query.period) where.period = String(req.query.period);
  if (req.query.employeeId) where.employeeId = String(req.query.employeeId);
  const rows = await prisma.performanceReview.findMany({ where, orderBy: { overallScore: 'desc' }, take: 200 });
  res.json({ success: true, data: rows, total: rows.length });
});
wave5Router.post('/perf-reviews', async (req, res) => {
  try {
    const b = PerfCreate.parse(req.body);
    const overallScore = +((b.selfRating + b.mgrRating * 2) / 3).toFixed(2);
    const row = await prisma.performanceReview.create({ data: { ...b, overallScore } });
    res.status(201).json({ success: true, data: row });
  } catch (err) { const z = zerr(err, res); if (z) return; res.status(500).json({ success: false, error: 'create failed' }); }
});
wave5Router.get('/perf-9box', async (req, res) => {
  const period = String(req.query.period || '');
  const where: any = {}; if (period) where.period = period;
  const rows = await prisma.performanceReview.findMany({ where });
  const box: Record<string, any[]> = {};
  rows.forEach(r => {
    const perf = r.mgrRating >= 4 ? 'High' : r.mgrRating >= 3 ? 'Mid' : 'Low';
    const pot = r.potential === 'Promote' ? 'High' : r.potential === 'Stretch' ? 'Mid' : 'Low';
    const key = `${pot}-${pot}|${perf}`;
    const k = `${pot}/${perf}`;
    (box[k] = box[k] || []).push({ employeeId: r.employeeId, score: r.overallScore, potential: r.potential });
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
wave5Router.get('/pm-orders', async (req, res) => {
  const where: any = {};
  if (req.query.status) where.status = String(req.query.status);
  if (req.query.assetId) where.assetId = String(req.query.assetId);
  const rows = await prisma.pMWorkOrder.findMany({ where, orderBy: [{ priority: 'desc' }, { scheduledAt: 'asc' }], take: 200 });
  res.json({ success: true, data: rows, total: rows.length });
});
wave5Router.post('/pm-orders', async (req, res) => {
  try {
    const b = PMCreate.parse(req.body);
    const asset = await prisma.asset.findUnique({ where: { id: b.assetId } });
    if (!asset) return res.status(404).json({ success: false, error: 'Asset not found' });
    const row = await uniqueCatch(() => prisma.pMWorkOrder.create({ data: b }), res);
    if ((row as Response).statusCode) return;
    res.status(201).json({ success: true, data: row });
  } catch (err) { const z = zerr(err, res); if (z) return; res.status(500).json({ success: false, error: 'create failed' }); }
});
wave5Router.post('/pm-orders/:id/complete', async (req, res) => {
  const Body = z.object({ laborHours: z.number().nonnegative().default(0), partsCost: z.number().nonnegative().default(0) });
  try {
    const b = Body.parse(req.body);
    const ex = await prisma.pMWorkOrder.findUnique({ where: { id: req.params.id } });
    if (!ex) return res.status(404).json({ success: false, error: 'Not found' });
    const totalCost = +(b.partsCost + b.laborHours * 50).toFixed(2);
    const row = await prisma.pMWorkOrder.update({ where: { id: ex.id }, data: { laborHours: b.laborHours, partsCost: b.partsCost, totalCost, status: 'Completed', completedAt: new Date() } });
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
wave5Router.get('/properties', async (req, res) => {
  const where: any = {};
  if (req.query.type) where.type = String(req.query.type);
  if (req.query.status) where.status = String(req.query.status);
  const rows = await prisma.property.findMany({ where, orderBy: { code: 'asc' } });
  res.json({ success: true, data: rows, total: rows.length });
});
wave5Router.post('/properties', async (req, res) => {
  try {
    const b = PropCreate.parse(req.body);
    const row = await uniqueCatch(() => prisma.property.create({ data: b }), res);
    if ((row as Response).statusCode) return;
    res.status(201).json({ success: true, data: row });
  } catch (err) { const z = zerr(err, res); if (z) return; res.status(500).json({ success: false, error: 'create failed' }); }
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
wave5Router.post('/reports', async (req, res) => {
  try {
    const b = ReportCreate.parse(req.body);
    const row = await prisma.savedReport.create({ data: { ...b, filters: b.filters || null } });
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
    await prisma.savedReport.update({ where: { id: rpt.id }, data: { lastRunAt: new Date() } });
    res.json({ success: true, data: result, report: { name: rpt.name, sourceTable: rpt.sourceTable, metric: rpt.metric, metricField: rpt.metricField, groupBy: rpt.groupBy } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'run failed', message: err?.message });
  }
});

// ─── #42 BOARD PACK ─────────────────────────────────────────────────────────
wave5Router.get('/board-packs', async (_req, res) => {
  const rows = await prisma.boardPack.findMany({ orderBy: { period: 'desc' } });
  res.json({ success: true, data: rows, total: rows.length });
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
      update: { sections, title: b.title || `Board Pack — ${b.period}`, generatedAt: new Date() },
    });
    res.status(201).json({ success: true, data: row });
  } catch (err) { const z = zerr(err, res); if (z) return; res.status(500).json({ success: false, error: 'generate failed' }); }
});
wave5Router.post('/board-packs/:id/approve', async (req, res) => {
  const ex = await prisma.boardPack.findUnique({ where: { id: req.params.id } });
  if (!ex) return res.status(404).json({ success: false, error: 'Not found' });
  const row = await prisma.boardPack.update({ where: { id: ex.id }, data: { status: 'Approved', approvedAt: new Date(), approvedBy: (req as any).user?.userId || null } });
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
      const commentary = generateCommentary(r.account, variance, variancePct, klass);
      const row = await prisma.varianceCommentary.create({ data: { period: b.period, account: r.account, costCenter: r.costCenter || null, variance, variancePct, commentary, classification: klass, generatedBy: 'ai' } });
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
wave5Router.get('/service-tickets', async (req, res) => {
  const where: any = {};
  if (req.query.status) where.status = String(req.query.status);
  if (req.query.priority) where.priority = String(req.query.priority);
  const rows = await prisma.serviceTicket.findMany({ where, orderBy: [{ priority: 'desc' }, { openedAt: 'desc' }], take: 200 });
  res.json({ success: true, data: rows, total: rows.length });
});
wave5Router.post('/service-tickets', async (req, res) => {
  try {
    const b = TicketCreate.parse(req.body);
    const row = await uniqueCatch(() => prisma.serviceTicket.create({ data: b }), res);
    if ((row as Response).statusCode) return;
    res.status(201).json({ success: true, data: row });
  } catch (err) { const z = zerr(err, res); if (z) return; res.status(500).json({ success: false, error: 'create failed' }); }
});
wave5Router.post('/service-tickets/:id/resolve', async (req, res) => {
  const Body = z.object({ resolution: z.string().min(2) });
  try {
    const b = Body.parse(req.body);
    const ex = await prisma.serviceTicket.findUnique({ where: { id: req.params.id } });
    if (!ex) return res.status(404).json({ success: false, error: 'Not found' });
    const slaHrs = ex.priority === 'Urgent' ? 4 : ex.priority === 'High' ? 24 : ex.priority === 'Medium' ? 72 : 168;
    const ageHrs = (Date.now() - new Date(ex.openedAt).getTime()) / 3600000;
    const row = await prisma.serviceTicket.update({ where: { id: ex.id }, data: { resolution: b.resolution, status: 'Resolved', resolvedAt: new Date(), slaBreached: ageHrs > slaHrs } });
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
wave5Router.get('/engagements', async (req, res) => {
  const where: any = {}; if (req.query.status) where.status = String(req.query.status);
  const rows = await prisma.engagement.findMany({ where, include: { timeEntries: { take: 5, orderBy: { date: 'desc' } } }, orderBy: { createdAt: 'desc' }, take: 100 });
  res.json({ success: true, data: rows, total: rows.length });
});
wave5Router.post('/engagements', async (req, res) => {
  try {
    const b = EngagementCreate.parse(req.body);
    const row = await uniqueCatch(() => prisma.engagement.create({ data: b }), res);
    if ((row as Response).statusCode) return;
    res.status(201).json({ success: true, data: row });
  } catch (err) { const z = zerr(err, res); if (z) return; res.status(500).json({ success: false, error: 'create failed' }); }
});
wave5Router.post('/engagements/:id/time', async (req, res) => {
  const Body = z.object({ employeeId: z.string().min(1), date: z.coerce.date(), hours: z.number().positive(), rate: z.number().nonnegative().default(0), description: z.string().optional().nullable(), billable: z.boolean().default(true) });
  try {
    const b = Body.parse(req.body);
    const eng = await prisma.engagement.findUnique({ where: { id: req.params.id } });
    if (!eng) return res.status(404).json({ success: false, error: 'Engagement not found' });
    const amount = +(b.hours * b.rate).toFixed(2);
    const [entry] = await prisma.$transaction([
      prisma.timeEntry.create({ data: { engagementId: eng.id, employeeId: b.employeeId, date: b.date, hours: b.hours, rate: b.rate, amount, description: b.description ?? null, billable: b.billable } }),
      prisma.engagement.update({ where: { id: eng.id }, data: { spent: eng.spent + amount } }),
    ]);
    res.status(201).json({ success: true, data: entry, engagementSpent: eng.spent + amount });
  } catch (err) { const z = zerr(err, res); if (z) return; res.status(500).json({ success: false, error: 'create failed' }); }
});
