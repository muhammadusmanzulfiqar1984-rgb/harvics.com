/**
 * HARVICS OS — T14 Controller (Wave 1 · Real CRUD)
 *
 * Full validated CRUD for the 5 T14 modules:
 *   - DealDesk     (CRM slice #8)
 *   - Commission   (CRM slice #8)
 *   - SalesForecast (CRM slice #8)
 *   - Incident     (GRC Core #37)
 *   - OKR          (OKR Tracking #43)
 *
 * Validation: zod schemas. Status workflows: domain-correct transitions.
 * Audit: writes to AuditEvent on every state change.
 */

import { Request, Response, Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../core/prisma';
import { emitAudit } from '../../services/audit.service';
import { eventBus } from '../../core/eventBus';

export const t14Router = Router();

// ── helpers ───────────────────────────────────────────────────────────────

function handleZod(err: unknown, res: Response): Response | undefined {
  if (err instanceof z.ZodError) {
    return res.status(400).json({ success: false, error: 'validation', issues: err.issues });
  }
  return undefined;
}

// ────────────────────────────────────────────────────────────────────────────
// DEAL DESK — submit → approve / reject / negotiate workflow
// ────────────────────────────────────────────────────────────────────────────
const DealCreateSchema = z.object({
  dealName: z.string().min(2).max(120),
  customerId: z.string().min(1).max(60).optional().nullable(),
  opportunityValue: z.number().nonnegative(),
  requestedDiscount: z.number().min(0).max(100),
  requiredMargin: z.number().min(0).max(100),
  currency: z.string().regex(/^[A-Z]{3}$/).default('USD'),
  submittedBy: z.string().min(1).max(60).optional().nullable(),
});

const DealDecisionSchema = z.object({
  approvedDiscount: z.number().min(0).max(100).optional(),
  reason: z.string().max(500).optional(),
});

const DEAL_TRANSITIONS: Record<string, string[]> = {
  Pending: ['Approved', 'Rejected', 'Negotiating'],
  Negotiating: ['Approved', 'Rejected'],
  Approved: [],
  Rejected: [],
};

t14Router.get('/deal-desk', async (req: Request, res: Response) => {
  const where: any = {};
  if (req.query.status) where.status = String(req.query.status);
  if (req.query.customerId) where.customerId = String(req.query.customerId);
  const rows = await prisma.dealDesk.findMany({ where, orderBy: { createdAt: 'desc' } });
  return res.json({ success: true, data: rows, total: rows.length });
});

t14Router.get('/deal-desk/:id', async (req: Request, res: Response) => {
  const row = await prisma.dealDesk.findUnique({ where: { id: req.params.id } });
  if (!row) return res.status(404).json({ success: false, error: 'Deal not found' });
  return res.json({ success: true, data: row });
});

t14Router.post('/deal-desk', async (req: Request, res: Response) => {
  try {
    const body = DealCreateSchema.parse(req.body);
    const row = await prisma.dealDesk.create({ data: { ...body, status: 'Pending' } });
    void emitAudit(req, 'deal.created', 'DealDesk', row.id, { module: 't14', payload: { value: row.opportunityValue } });
    return res.status(201).json({ success: true, data: row });
  } catch (err) {
    const z = handleZod(err, res); if (z) return z;
    return res.status(500).json({ success: false, error: 'create failed' });
  }
});

t14Router.post('/deal-desk/:id/approve', async (req: Request, res: Response) => {
  try {
    const body = DealDecisionSchema.parse(req.body || {});
    const existing = await prisma.dealDesk.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ success: false, error: 'Deal not found' });
    if (!DEAL_TRANSITIONS[existing.status]?.includes('Approved')) {
      return res.status(409).json({ success: false, error: `Cannot approve from status '${existing.status}'` });
    }
    const row = await prisma.dealDesk.update({
      where: { id: existing.id },
      data: {
        status: 'Approved',
        approvedDiscount: body.approvedDiscount ?? existing.requestedDiscount,
        decisionDate: new Date(),
      },
    });
    void emitAudit(req, 'deal.approved', 'DealDesk', row.id, { module: 't14', payload: { discount: row.approvedDiscount } });
    return res.json({ success: true, data: row });
  } catch (err) {
    const z = handleZod(err, res); if (z) return z;
    return res.status(500).json({ success: false, error: 'approve failed' });
  }
});

t14Router.post('/deal-desk/:id/reject', async (req: Request, res: Response) => {
  const existing = await prisma.dealDesk.findUnique({ where: { id: req.params.id } });
  if (!existing) return res.status(404).json({ success: false, error: 'Deal not found' });
  if (!DEAL_TRANSITIONS[existing.status]?.includes('Rejected')) {
    return res.status(409).json({ success: false, error: `Cannot reject from status '${existing.status}'` });
  }
  const row = await prisma.dealDesk.update({
    where: { id: existing.id },
    data: { status: 'Rejected', decisionDate: new Date() },
  });
  void emitAudit(req, 'deal.rejected', 'DealDesk', row.id, { module: 't14' });
  return res.json({ success: true, data: row });
});

t14Router.delete('/deal-desk/:id', async (req: Request, res: Response) => {
  const existing = await prisma.dealDesk.findUnique({ where: { id: req.params.id } });
  if (!existing) return res.status(404).json({ success: false, error: 'Deal not found' });
  await prisma.dealDesk.delete({ where: { id: existing.id } });
  void emitAudit(req, 'deal.deleted', 'DealDesk', existing.id, { module: 't14' });
  return res.json({ success: true, data: { id: existing.id, deleted: true } });
});

// ────────────────────────────────────────────────────────────────────────────
// COMMISSION — calc → approve → pay workflow
// ────────────────────────────────────────────────────────────────────────────
const CommissionCreateSchema = z.object({
  employeeId: z.string().min(1).max(60),
  employeeName: z.string().min(1).max(120).optional().nullable(),
  period: z.string().min(4).max(20),  // e.g. "April 2026" or "2026-Q2"
  baseRevenue: z.number().nonnegative(),
  commissionRate: z.number().min(0).max(100),  // percentage
  currency: z.string().regex(/^[A-Z]{3}$/).default('USD'),
});

const COMM_TRANSITIONS: Record<string, string[]> = {
  Calculated: ['Approved'],
  Approved: ['Paid'],
  Paid: [],
};

t14Router.get('/commissions', async (req: Request, res: Response) => {
  const where: any = {};
  if (req.query.status) where.status = String(req.query.status);
  if (req.query.employeeId) where.employeeId = String(req.query.employeeId);
  if (req.query.period) where.period = String(req.query.period);
  const rows = await prisma.commission.findMany({ where, orderBy: { createdAt: 'desc' } });
  const totalAmount = rows.reduce((s, r) => s + r.commissionAmount, 0);
  return res.json({ success: true, data: rows, total: rows.length, summary: { totalAmount } });
});

t14Router.get('/commissions/:id', async (req: Request, res: Response) => {
  const row = await prisma.commission.findUnique({ where: { id: req.params.id } });
  if (!row) return res.status(404).json({ success: false, error: 'Commission not found' });
  return res.json({ success: true, data: row });
});

t14Router.post('/commissions', async (req: Request, res: Response) => {
  try {
    const body = CommissionCreateSchema.parse(req.body);
    const commissionAmount = +(body.baseRevenue * body.commissionRate / 100).toFixed(2);
    const row = await prisma.commission.create({
      data: { ...body, commissionAmount, status: 'Calculated' },
    });
    void emitAudit(req, 'commission.calculated', 'Commission', row.id, { module: 't14', payload: { amount: commissionAmount } });
    return res.status(201).json({ success: true, data: row });
  } catch (err) {
    const z = handleZod(err, res); if (z) return z;
    return res.status(500).json({ success: false, error: 'create failed' });
  }
});

t14Router.post('/commissions/:id/approve', async (req: Request, res: Response) => {
  const existing = await prisma.commission.findUnique({ where: { id: req.params.id } });
  if (!existing) return res.status(404).json({ success: false, error: 'Commission not found' });
  if (!COMM_TRANSITIONS[existing.status]?.includes('Approved')) {
    return res.status(409).json({ success: false, error: `Cannot approve from '${existing.status}'` });
  }
  const row = await prisma.commission.update({ where: { id: existing.id }, data: { status: 'Approved' } });
  void emitAudit(req, 'commission.approved', 'Commission', row.id, { module: 't14' });
  return res.json({ success: true, data: row });
});

t14Router.post('/commissions/:id/pay', async (req: Request, res: Response) => {
  const existing = await prisma.commission.findUnique({ where: { id: req.params.id } });
  if (!existing) return res.status(404).json({ success: false, error: 'Commission not found' });
  if (!COMM_TRANSITIONS[existing.status]?.includes('Paid')) {
    return res.status(409).json({ success: false, error: `Cannot pay from '${existing.status}'` });
  }
  const row = await prisma.commission.update({
    where: { id: existing.id },
    data: { status: 'Paid', paidDate: new Date() },
  });
  void emitAudit(req, 'commission.paid', 'Commission', row.id, { module: 't14', payload: { amount: row.commissionAmount } });
  return res.json({ success: true, data: row });
});

t14Router.delete('/commissions/:id', async (req: Request, res: Response) => {
  const existing = await prisma.commission.findUnique({ where: { id: req.params.id } });
  if (!existing) return res.status(404).json({ success: false, error: 'Commission not found' });
  if (existing.status === 'Paid') {
    return res.status(409).json({ success: false, error: 'Cannot delete a paid commission' });
  }
  await prisma.commission.delete({ where: { id: existing.id } });
  void emitAudit(req, 'commission.deleted', 'Commission', existing.id, { module: 't14' });
  return res.json({ success: true, data: { id: existing.id, deleted: true } });
});

// ────────────────────────────────────────────────────────────────────────────
// SALES FORECAST — full CRUD + best/base/worst case
// ────────────────────────────────────────────────────────────────────────────
const ForecastCreateSchema = z.object({
  forecastPeriod: z.string().min(4).max(20),
  ownerId: z.string().min(1).max(60),
  ownerTerritory: z.string().max(40).optional().nullable(),
  bestCase: z.number().nonnegative(),
  baseCase: z.number().nonnegative(),
  worstCase: z.number().nonnegative(),
  currency: z.string().regex(/^[A-Z]{3}$/).default('USD'),
  confidence: z.number().int().min(0).max(100).default(50),
  notes: z.string().max(1000).optional().nullable(),
});

const ForecastUpdateSchema = ForecastCreateSchema.partial();

t14Router.get('/forecasts', async (req: Request, res: Response) => {
  const where: any = {};
  if (req.query.period) where.forecastPeriod = String(req.query.period);
  if (req.query.ownerId) where.ownerId = String(req.query.ownerId);
  if (req.query.territory) where.ownerTerritory = String(req.query.territory);
  const rows = await prisma.salesForecast.findMany({ where, orderBy: { createdAt: 'desc' } });
  const summary = rows.reduce((acc, r) => ({
    bestCase: acc.bestCase + r.bestCase,
    baseCase: acc.baseCase + r.baseCase,
    worstCase: acc.worstCase + r.worstCase,
  }), { bestCase: 0, baseCase: 0, worstCase: 0 });
  return res.json({ success: true, data: rows, total: rows.length, summary });
});

t14Router.get('/forecasts/:id', async (req: Request, res: Response) => {
  const row = await prisma.salesForecast.findUnique({ where: { id: req.params.id } });
  if (!row) return res.status(404).json({ success: false, error: 'Forecast not found' });
  return res.json({ success: true, data: row });
});

t14Router.post('/forecasts', async (req: Request, res: Response) => {
  try {
    const body = ForecastCreateSchema.parse(req.body);
    if (body.worstCase > body.baseCase || body.baseCase > body.bestCase) {
      return res.status(400).json({ success: false, error: 'Must have worstCase ≤ baseCase ≤ bestCase' });
    }
    const row = await prisma.salesForecast.create({ data: body });
    void emitAudit(req, 'forecast.created', 'SalesForecast', row.id, { module: 't14', payload: { period: body.forecastPeriod } });
    return res.status(201).json({ success: true, data: row });
  } catch (err) {
    const z = handleZod(err, res); if (z) return z;
    return res.status(500).json({ success: false, error: 'create failed' });
  }
});

t14Router.patch('/forecasts/:id', async (req: Request, res: Response) => {
  try {
    const body = ForecastUpdateSchema.parse(req.body);
    const existing = await prisma.salesForecast.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ success: false, error: 'Forecast not found' });
    const merged = { ...existing, ...body };
    if (merged.worstCase > merged.baseCase || merged.baseCase > merged.bestCase) {
      return res.status(400).json({ success: false, error: 'Must have worstCase ≤ baseCase ≤ bestCase' });
    }
    const row = await prisma.salesForecast.update({ where: { id: existing.id }, data: body });
    void emitAudit(req, 'forecast.updated', 'SalesForecast', row.id, { module: 't14' });
    return res.json({ success: true, data: row });
  } catch (err) {
    const z = handleZod(err, res); if (z) return z;
    return res.status(500).json({ success: false, error: 'update failed' });
  }
});

t14Router.delete('/forecasts/:id', async (req: Request, res: Response) => {
  const existing = await prisma.salesForecast.findUnique({ where: { id: req.params.id } });
  if (!existing) return res.status(404).json({ success: false, error: 'Forecast not found' });
  await prisma.salesForecast.delete({ where: { id: existing.id } });
  void emitAudit(req, 'forecast.deleted', 'SalesForecast', existing.id, { module: 't14' });
  return res.json({ success: true, data: { id: existing.id, deleted: true } });
});

// ────────────────────────────────────────────────────────────────────────────
// INCIDENT — open → in-progress → resolved → closed lifecycle
// ────────────────────────────────────────────────────────────────────────────
const IncidentCreateSchema = z.object({
  title: z.string().min(3).max(200),
  severity: z.enum(['Critical', 'High', 'Medium', 'Low']).default('Medium'),
  reportedDate: z.coerce.date().optional(),
});

const IncidentResolveSchema = z.object({
  resolution: z.string().min(3).max(2000),
});

const INC_TRANSITIONS: Record<string, string[]> = {
  Open: ['In Progress', 'Resolved'],
  'In Progress': ['Resolved'],
  Resolved: ['Closed'],
  Closed: [],
};

t14Router.get('/incidents', async (req: Request, res: Response) => {
  const where: any = {};
  if (req.query.status) where.status = String(req.query.status);
  if (req.query.severity) where.severity = String(req.query.severity);
  const rows = await prisma.incident.findMany({ where, orderBy: [{ severity: 'desc' }, { reportedDate: 'desc' }] });
  const open = rows.filter(r => r.status !== 'Closed').length;
  const critical = rows.filter(r => r.severity === 'Critical' && r.status !== 'Closed').length;
  return res.json({ success: true, data: rows, total: rows.length, summary: { open, critical } });
});

t14Router.get('/incidents/:id', async (req: Request, res: Response) => {
  const row = await prisma.incident.findUnique({ where: { id: req.params.id } });
  if (!row) return res.status(404).json({ success: false, error: 'Incident not found' });
  return res.json({ success: true, data: row });
});

t14Router.post('/incidents', async (req: Request, res: Response) => {
  try {
    const body = IncidentCreateSchema.parse(req.body);
    const row = await prisma.incident.create({
      data: {
        title: body.title,
        severity: body.severity,
        reportedDate: body.reportedDate || new Date(),
        status: 'Open',
      },
    });
    void emitAudit(req, 'incident.reported', 'Incident', row.id, { module: 'grc', payload: { severity: row.severity } });
    eventBus.emitDomain('grc.incident.reported', row, 'grc');
    return res.status(201).json({ success: true, data: row });
  } catch (err) {
    const z = handleZod(err, res); if (z) return z;
    return res.status(500).json({ success: false, error: 'create failed' });
  }
});

t14Router.post('/incidents/:id/start', async (req: Request, res: Response) => {
  const existing = await prisma.incident.findUnique({ where: { id: req.params.id } });
  if (!existing) return res.status(404).json({ success: false, error: 'Incident not found' });
  if (!INC_TRANSITIONS[existing.status]?.includes('In Progress')) {
    return res.status(409).json({ success: false, error: `Cannot start from '${existing.status}'` });
  }
  const row = await prisma.incident.update({ where: { id: existing.id }, data: { status: 'In Progress' } });
  void emitAudit(req, 'incident.started', 'Incident', row.id, { module: 'grc' });
  return res.json({ success: true, data: row });
});

t14Router.post('/incidents/:id/resolve', async (req: Request, res: Response) => {
  try {
    const body = IncidentResolveSchema.parse(req.body);
    const existing = await prisma.incident.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ success: false, error: 'Incident not found' });
    if (!INC_TRANSITIONS[existing.status]?.includes('Resolved')) {
      return res.status(409).json({ success: false, error: `Cannot resolve from '${existing.status}'` });
    }
    const row = await prisma.incident.update({
      where: { id: existing.id },
      data: { status: 'Resolved', resolution: body.resolution, resolvedDate: new Date() },
    });
    void emitAudit(req, 'incident.resolved', 'Incident', row.id, { module: 'grc' });
    return res.json({ success: true, data: row });
  } catch (err) {
    const z = handleZod(err, res); if (z) return z;
    return res.status(500).json({ success: false, error: 'resolve failed' });
  }
});

t14Router.post('/incidents/:id/close', async (req: Request, res: Response) => {
  const existing = await prisma.incident.findUnique({ where: { id: req.params.id } });
  if (!existing) return res.status(404).json({ success: false, error: 'Incident not found' });
  if (!INC_TRANSITIONS[existing.status]?.includes('Closed')) {
    return res.status(409).json({ success: false, error: `Cannot close from '${existing.status}'` });
  }
  const row = await prisma.incident.update({ where: { id: existing.id }, data: { status: 'Closed' } });
  void emitAudit(req, 'incident.closed', 'Incident', row.id, { module: 'grc' });
  return res.json({ success: true, data: row });
});

// ────────────────────────────────────────────────────────────────────────────
// OKR — full CRUD + check-in
// ────────────────────────────────────────────────────────────────────────────
const OkrCreateSchema = z.object({
  objective: z.string().min(3).max(300),
  owner: z.string().min(1).max(120),
  keyResults: z.number().int().min(1).max(20).default(3),
  period: z.string().min(4).max(20),
});

const OkrCheckinSchema = z.object({
  progress: z.number().int().min(0).max(100),
  completed: z.number().int().min(0).max(20).optional(),
});

function okrStatus(progress: number, period: string): 'On Track' | 'At Risk' | 'Behind' | 'Completed' {
  if (progress >= 100) return 'Completed';
  // Naive heuristic: progress vs simple period midpoint expectation (50%)
  if (progress >= 70) return 'On Track';
  if (progress >= 40) return 'At Risk';
  return 'Behind';
}

t14Router.get('/okr', async (req: Request, res: Response) => {
  const where: any = {};
  if (req.query.period) where.period = String(req.query.period);
  if (req.query.owner) where.owner = String(req.query.owner);
  const rows = await prisma.oKR.findMany({ where, orderBy: { createdAt: 'desc' } });
  const avgProgress = rows.length ? Math.round(rows.reduce((s, r) => s + r.progress, 0) / rows.length) : 0;
  return res.json({ success: true, data: rows, total: rows.length, summary: { avgProgress } });
});

t14Router.get('/okr/:id', async (req: Request, res: Response) => {
  const row = await prisma.oKR.findUnique({ where: { id: req.params.id } });
  if (!row) return res.status(404).json({ success: false, error: 'OKR not found' });
  return res.json({ success: true, data: row });
});

t14Router.post('/okr', async (req: Request, res: Response) => {
  try {
    const body = OkrCreateSchema.parse(req.body);
    const row = await prisma.oKR.create({
      data: { ...body, progress: 0, completed: 0, status: 'On Track' },
    });
    void emitAudit(req, 'okr.created', 'OKR', row.id, { module: 'okr', payload: { objective: body.objective } });
    eventBus.emitDomain('okr.created', row, 'okr');
    return res.status(201).json({ success: true, data: row });
  } catch (err) {
    const z = handleZod(err, res); if (z) return z;
    return res.status(500).json({ success: false, error: 'create failed' });
  }
});

t14Router.post('/okr/:id/checkin', async (req: Request, res: Response) => {
  try {
    const body = OkrCheckinSchema.parse(req.body);
    const existing = await prisma.oKR.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ success: false, error: 'OKR not found' });
    const newStatus = okrStatus(body.progress, existing.period);
    const row = await prisma.oKR.update({
      where: { id: existing.id },
      data: {
        progress: body.progress,
        completed: body.completed ?? existing.completed,
        status: newStatus,
      },
    });
    void emitAudit(req, 'okr.checkin', 'OKR', row.id, { module: 'okr', payload: { progress: body.progress, status: newStatus } });
    return res.json({ success: true, data: row });
  } catch (err) {
    const z = handleZod(err, res); if (z) return z;
    return res.status(500).json({ success: false, error: 'checkin failed' });
  }
});

t14Router.post('/okr/:id/status', async (req: Request, res: Response) => {
  const Body = z.object({ status: z.enum(['On Track', 'At Risk', 'Behind', 'Completed']) });
  try {
    const body = Body.parse(req.body);
    const existing = await prisma.oKR.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ success: false, error: 'OKR not found' });
    if (existing.status === 'Completed' && body.status !== 'Completed') {
      return res.status(409).json({ success: false, error: 'Completed OKRs cannot be reopened via status' });
    }
    const data: any = { status: body.status };
    if (body.status === 'Completed') {
      data.progress = 100;
      data.completed = existing.keyResults;
    }
    const row = await prisma.oKR.update({ where: { id: existing.id }, data });
    void emitAudit(req, 'okr.status', 'OKR', row.id, { module: 'okr', payload: { from: existing.status, to: body.status } });
    return res.json({ success: true, data: row });
  } catch (err) {
    const z = handleZod(err, res); if (z) return z;
    return res.status(500).json({ success: false, error: 'status failed' });
  }
});

t14Router.delete('/okr/:id', async (req: Request, res: Response) => {
  const existing = await prisma.oKR.findUnique({ where: { id: req.params.id } });
  if (!existing) return res.status(404).json({ success: false, error: 'OKR not found' });
  await prisma.oKR.delete({ where: { id: existing.id } });
  void emitAudit(req, 'okr.deleted', 'OKR', existing.id, { module: 'okr' });
  return res.json({ success: true, data: { id: existing.id, deleted: true } });
});
