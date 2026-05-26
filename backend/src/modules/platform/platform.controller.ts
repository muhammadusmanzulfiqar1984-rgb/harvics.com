/**
 * HARVICS OS — Platform Controller (Wave 2 · Session 39)
 * Real CRUD + workflows for:
 *   #40 Neural Governance — policies + decisions log
 *   #48 Tax Engine        — rates per country + active-rate lookup
 *   #50 Audit Log         — search/filter/export
 *   #53 Admin & Security  — app users, roles
 *   #58 Globalisation     — locale toggles
 */

import { Request, Response, Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../core/prisma';

export const platformRouter = Router();

function zerr(err: unknown, res: Response): Response | undefined {
  if (err instanceof z.ZodError) return res.status(400).json({ success: false, error: 'validation', issues: err.issues });
  return undefined;
}

// ────────────────────────────────────────────────────────────────────────────
// #40 GOVERNANCE — policies (CRUD) + decisions log (read+seed)
// ────────────────────────────────────────────────────────────────────────────
const PolicyCreate = z.object({
  name: z.string().min(2).max(120),
  scope: z.enum(['global', 'module', 'route']),
  targetKey: z.string().max(120).optional().nullable(),
  rule: z.record(z.any()),
  severity: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  enabled: z.boolean().default(true),
  createdBy: z.string().max(60).optional().nullable(),
});

platformRouter.get('/governance/policies', async (req, res) => {
  const where: any = {};
  if (req.query.enabled !== undefined) where.enabled = String(req.query.enabled) === 'true';
  if (req.query.scope) where.scope = String(req.query.scope);
  const rows = await prisma.governancePolicy.findMany({ where, orderBy: { createdAt: 'desc' } });
  return res.json({ success: true, data: rows, total: rows.length });
});

platformRouter.post('/governance/policies', async (req, res) => {
  try {
    const body = PolicyCreate.parse(req.body);
    const row = await prisma.governancePolicy.create({ data: body as any });
    return res.status(201).json({ success: true, data: row });
  } catch (err) { const z = zerr(err, res); if (z) return z; return res.status(500).json({ success: false, error: 'create failed' }); }
});

platformRouter.patch('/governance/policies/:id', async (req, res) => {
  try {
    const body = PolicyCreate.partial().parse(req.body);
    const existing = await prisma.governancePolicy.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ success: false, error: 'Policy not found' });
    const row = await prisma.governancePolicy.update({ where: { id: existing.id }, data: body as any });
    return res.json({ success: true, data: row });
  } catch (err) { const z = zerr(err, res); if (z) return z; return res.status(500).json({ success: false, error: 'update failed' }); }
});

platformRouter.delete('/governance/policies/:id', async (req, res) => {
  const existing = await prisma.governancePolicy.findUnique({ where: { id: req.params.id } });
  if (!existing) return res.status(404).json({ success: false, error: 'Policy not found' });
  await prisma.governancePolicy.delete({ where: { id: existing.id } });
  return res.json({ success: true, data: { id: existing.id, deleted: true } });
});

platformRouter.get('/governance/decisions', async (req, res) => {
  const where: any = {};
  if (req.query.outcome) where.outcome = String(req.query.outcome);
  if (req.query.policyId) where.policyId = String(req.query.policyId);
  const take = Math.min(500, Math.max(1, Number(req.query.limit) || 100));
  const rows = await prisma.governanceDecision.findMany({ where, orderBy: { createdAt: 'desc' }, take });
  const summary = {
    allow: await prisma.governanceDecision.count({ where: { outcome: 'allow' } }),
    deny:  await prisma.governanceDecision.count({ where: { outcome: 'deny' } }),
    warn:  await prisma.governanceDecision.count({ where: { outcome: 'warn' } }),
  };
  return res.json({ success: true, data: rows, total: rows.length, summary });
});

// ────────────────────────────────────────────────────────────────────────────
// #48 TAX ENGINE — rates CRUD + effective-rate lookup
// ────────────────────────────────────────────────────────────────────────────
const TaxRateCreate = z.object({
  country: z.string().length(2).regex(/^[A-Z]{2}$/),
  region: z.string().max(10).optional().nullable(),
  taxType: z.enum(['VAT', 'GST', 'Sales', 'Excise', 'Withholding']),
  ratePercent: z.number().min(0).max(100),
  effectiveFrom: z.coerce.date().optional(),
  effectiveTo: z.coerce.date().optional().nullable(),
  notes: z.string().max(500).optional().nullable(),
});

platformRouter.get('/tax/rates', async (req, res) => {
  const where: any = {};
  if (req.query.country) where.country = String(req.query.country).toUpperCase();
  if (req.query.taxType) where.taxType = String(req.query.taxType);
  const rows = await prisma.taxRate.findMany({ where, orderBy: [{ country: 'asc' }, { effectiveFrom: 'desc' }] });
  return res.json({ success: true, data: rows, total: rows.length });
});

platformRouter.get('/tax/lookup', async (req, res) => {
  const country = String(req.query.country || '').toUpperCase();
  const taxType = String(req.query.taxType || 'VAT');
  const amount = Number(req.query.amount || 0);
  if (!/^[A-Z]{2}$/.test(country)) return res.status(400).json({ success: false, error: 'country (ISO-2) required' });
  const now = new Date();
  const rate = await prisma.taxRate.findFirst({
    where: {
      country, taxType,
      effectiveFrom: { lte: now },
      OR: [{ effectiveTo: null }, { effectiveTo: { gte: now } }],
    },
    orderBy: { effectiveFrom: 'desc' },
  });
  if (!rate) return res.status(404).json({ success: false, error: 'No active rate found' });
  const tax = +(amount * rate.ratePercent / 100).toFixed(2);
  return res.json({ success: true, data: { country, taxType, ratePercent: rate.ratePercent, amount, tax, total: +(amount + tax).toFixed(2) } });
});

platformRouter.post('/tax/rates', async (req, res) => {
  try {
    const body = TaxRateCreate.parse(req.body);
    const row = await prisma.taxRate.create({ data: body as any });
    return res.status(201).json({ success: true, data: row });
  } catch (err) { const z = zerr(err, res); if (z) return z; return res.status(500).json({ success: false, error: 'create failed' }); }
});

platformRouter.patch('/tax/rates/:id', async (req, res) => {
  try {
    const body = TaxRateCreate.partial().parse(req.body);
    const existing = await prisma.taxRate.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ success: false, error: 'Rate not found' });
    const row = await prisma.taxRate.update({ where: { id: existing.id }, data: body as any });
    return res.json({ success: true, data: row });
  } catch (err) { const z = zerr(err, res); if (z) return z; return res.status(500).json({ success: false, error: 'update failed' }); }
});

platformRouter.delete('/tax/rates/:id', async (req, res) => {
  const existing = await prisma.taxRate.findUnique({ where: { id: req.params.id } });
  if (!existing) return res.status(404).json({ success: false, error: 'Rate not found' });
  await prisma.taxRate.delete({ where: { id: existing.id } });
  return res.json({ success: true, data: { id: existing.id, deleted: true } });
});

// ────────────────────────────────────────────────────────────────────────────
// #50 AUDIT LOG — search/filter (reads existing AuditEvent)
// ────────────────────────────────────────────────────────────────────────────
platformRouter.get('/audit/search', async (req, res) => {
  const where: any = {};
  if (req.query.actorId) where.actorId = String(req.query.actorId);
  if (req.query.action) where.action = { contains: String(req.query.action), mode: 'insensitive' };
  if (req.query.module) where.module = String(req.query.module);
  if (req.query.entity) where.entity = String(req.query.entity);
  if (req.query.result) where.result = String(req.query.result);
  if (req.query.from || req.query.to) {
    where.createdAt = {};
    if (req.query.from) where.createdAt.gte = new Date(String(req.query.from));
    if (req.query.to) where.createdAt.lte = new Date(String(req.query.to));
  }
  const take = Math.min(500, Math.max(1, Number(req.query.limit) || 100));
  const [total, rows] = await Promise.all([
    prisma.auditEvent.count({ where }),
    prisma.auditEvent.findMany({ where, orderBy: { createdAt: 'desc' }, take }),
  ]);
  return res.json({ success: true, data: rows, total, returned: rows.length });
});

platformRouter.get('/audit/summary', async (_req, res) => {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const [last24h, byResult] = await Promise.all([
    prisma.auditEvent.count({ where: { createdAt: { gte: since } } }),
    prisma.auditEvent.groupBy({ by: ['result'], _count: true, where: { createdAt: { gte: since } } }),
  ]);
  return res.json({ success: true, data: { last24h, byResult } });
});

// ────────────────────────────────────────────────────────────────────────────
// #53 ADMIN & SECURITY — user CRUD + role grants
// ────────────────────────────────────────────────────────────────────────────
const AppUserCreate = z.object({
  username: z.string().min(3).max(40).regex(/^[a-zA-Z0-9_.-]+$/),
  email: z.string().email().optional().nullable(),
  displayName: z.string().max(120).optional().nullable(),
  role: z.enum(['operator', 'manager', 'admin', 'superadmin']).default('operator'),
  active: z.boolean().default(true),
  mfaEnabled: z.boolean().default(false),
});

platformRouter.get('/admin/users', async (req, res) => {
  const where: any = {};
  if (req.query.role) where.role = String(req.query.role);
  if (req.query.active !== undefined) where.active = String(req.query.active) === 'true';
  if (req.query.q) where.OR = [
    { username: { contains: String(req.query.q), mode: 'insensitive' } },
    { email: { contains: String(req.query.q), mode: 'insensitive' } },
    { displayName: { contains: String(req.query.q), mode: 'insensitive' } },
  ];
  const rows = await prisma.appUser.findMany({ where, orderBy: { createdAt: 'desc' } });
  return res.json({ success: true, data: rows, total: rows.length });
});

platformRouter.post('/admin/users', async (req, res) => {
  try {
    const body = AppUserCreate.parse(req.body);
    const row = await prisma.appUser.create({ data: body });
    return res.status(201).json({ success: true, data: row });
  } catch (err: any) {
    const z = zerr(err, res); if (z) return z;
    if (err?.code === 'P2002') return res.status(409).json({ success: false, error: 'Username or email already exists' });
    return res.status(500).json({ success: false, error: 'create failed' });
  }
});

platformRouter.patch('/admin/users/:id', async (req, res) => {
  try {
    const body = AppUserCreate.partial().parse(req.body);
    const existing = await prisma.appUser.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ success: false, error: 'User not found' });
    const row = await prisma.appUser.update({ where: { id: existing.id }, data: body });
    return res.json({ success: true, data: row });
  } catch (err) { const z = zerr(err, res); if (z) return z; return res.status(500).json({ success: false, error: 'update failed' }); }
});

platformRouter.post('/admin/users/:id/deactivate', async (req, res) => {
  const existing = await prisma.appUser.findUnique({ where: { id: req.params.id } });
  if (!existing) return res.status(404).json({ success: false, error: 'User not found' });
  const row = await prisma.appUser.update({ where: { id: existing.id }, data: { active: false } });
  return res.json({ success: true, data: row });
});

platformRouter.delete('/admin/users/:id', async (req, res) => {
  const existing = await prisma.appUser.findUnique({ where: { id: req.params.id } });
  if (!existing) return res.status(404).json({ success: false, error: 'User not found' });
  await prisma.appUser.delete({ where: { id: existing.id } });
  return res.json({ success: true, data: { id: existing.id, deleted: true } });
});

// ────────────────────────────────────────────────────────────────────────────
// #58 GLOBALISATION — locale toggles
// ────────────────────────────────────────────────────────────────────────────
const LocaleCreate = z.object({
  code: z.string().min(2).max(10),
  name: z.string().min(1).max(100),
  direction: z.enum(['ltr', 'rtl']).default('ltr'),
  enabled: z.boolean().default(true),
  fallback: z.string().max(10).optional().nullable(),
  numberFormat: z.object({ decimal: z.string().max(2), thousand: z.string().max(2) }).optional().nullable(),
  dateFormat: z.string().max(40).optional().nullable(),
  currency: z.string().length(3).optional().nullable(),
});

platformRouter.get('/locales', async (req, res) => {
  const where: any = {};
  if (req.query.enabled !== undefined) where.enabled = String(req.query.enabled) === 'true';
  const rows = await prisma.localeConfig.findMany({ where, orderBy: { code: 'asc' } });
  return res.json({ success: true, data: rows, total: rows.length });
});

platformRouter.post('/locales', async (req, res) => {
  try {
    const body = LocaleCreate.parse(req.body);
    const row = await prisma.localeConfig.create({ data: body as any });
    return res.status(201).json({ success: true, data: row });
  } catch (err: any) {
    const z = zerr(err, res); if (z) return z;
    if (err?.code === 'P2002') return res.status(409).json({ success: false, error: 'Locale code already exists' });
    return res.status(500).json({ success: false, error: 'create failed' });
  }
});

platformRouter.patch('/locales/:id', async (req, res) => {
  try {
    const body = LocaleCreate.partial().parse(req.body);
    const existing = await prisma.localeConfig.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ success: false, error: 'Locale not found' });
    const row = await prisma.localeConfig.update({ where: { id: existing.id }, data: body as any });
    return res.json({ success: true, data: row });
  } catch (err) { const z = zerr(err, res); if (z) return z; return res.status(500).json({ success: false, error: 'update failed' }); }
});

platformRouter.post('/locales/:id/toggle', async (req, res) => {
  const existing = await prisma.localeConfig.findUnique({ where: { id: req.params.id } });
  if (!existing) return res.status(404).json({ success: false, error: 'Locale not found' });
  const row = await prisma.localeConfig.update({ where: { id: existing.id }, data: { enabled: !existing.enabled } });
  return res.json({ success: true, data: row });
});

platformRouter.delete('/locales/:id', async (req, res) => {
  const existing = await prisma.localeConfig.findUnique({ where: { id: req.params.id } });
  if (!existing) return res.status(404).json({ success: false, error: 'Locale not found' });
  await prisma.localeConfig.delete({ where: { id: existing.id } });
  return res.json({ success: true, data: { id: existing.id, deleted: true } });
});
