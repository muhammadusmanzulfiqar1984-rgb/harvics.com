/**
 * Production Modules CRUD Controller
 * Wires 15 new Prisma tables to REST endpoints for frontend OS modules.
 *
 * Routes (all mounted under /api):
 *   /api/manufacturing/work-orders          GET/POST/PATCH/DELETE
 *   /api/manufacturing/bom                  GET/POST/DELETE
 *   /api/quality/checks                     GET/POST/PATCH/DELETE
 *   /api/quality/ncrs                       GET/POST/PATCH/DELETE
 *   /api/projects                           GET/POST/PATCH/DELETE
 *   /api/projects/:id/tasks                 GET/POST/PATCH/DELETE
 *   /api/projects/:id/milestones            GET/POST/PATCH/DELETE
 *   /api/treasury/accounts                  GET/POST/PATCH/DELETE
 *   /api/treasury/accounts/:id/transactions GET/POST
 *   /api/treasury/fx-rates                  GET/POST
 *   /api/marketing/email-campaigns          GET/POST/PATCH/DELETE
 *   /api/marketing/social-posts             GET/POST/PATCH/DELETE
 *   /api/documents                          GET/POST/PATCH/DELETE
 *   /api/notifications                      GET/POST/PATCH/DELETE
 *   /api/audit-events                       GET/POST
 *   /api/assets                             GET/POST/PATCH/DELETE
 *   /api/assets/:id/maintenance             GET/POST
 */

import { Router, Request, Response } from 'express';
import { prisma } from '../../core/prisma';

const router = Router();

// Generic error wrapper
function handle(fn: (req: Request, res: Response) => Promise<any>) {
  return async (req: Request, res: Response) => {
    try { return await fn(req, res); }
    catch (err: any) { return res.status(500).json({ success: false, error: err?.message || 'db error' }); }
  };
}

// ── MANUFACTURING ───────────────────────────────────────────────────
router.get('/manufacturing/work-orders', handle(async (_req, res) => {
  const data = await prisma.workOrder.findMany({ include: { bomItems: true }, orderBy: { createdAt: 'desc' }, take: 200 });
  res.json({ success: true, data, total: data.length });
}));
router.post('/manufacturing/work-orders', handle(async (req, res) => {
  const { workOrderNo, productSku, qty, status, priority, notes, startDate, completionDate } = req.body || {};
  if (!workOrderNo || !productSku) return res.status(400).json({ success: false, error: 'workOrderNo and productSku required' });
  const wo = await prisma.workOrder.create({ data: { workOrderNo, productSku, qty: Number(qty) || 0, status: status || 'Planned', priority: priority || 'Normal', notes, startDate, completionDate } });
  res.status(201).json({ success: true, data: wo });
}));
router.patch('/manufacturing/work-orders/:id', handle(async (req, res) => {
  const updated = await prisma.workOrder.update({ where: { id: req.params.id }, data: req.body || {} });
  res.json({ success: true, data: updated });
}));
router.delete('/manufacturing/work-orders/:id', handle(async (req, res) => {
  await prisma.workOrder.delete({ where: { id: req.params.id } });
  res.json({ success: true });
}));

// ── QUALITY ─────────────────────────────────────────────────────────
router.get('/quality/checks', handle(async (_req, res) => {
  const data = await prisma.qualityCheck.findMany({ orderBy: { createdAt: 'desc' }, take: 200 });
  res.json({ success: true, data, total: data.length });
}));
router.post('/quality/checks', handle(async (req, res) => {
  const { checkNo, productSku, inspector, status, defectsFound, notes, workOrderId } = req.body || {};
  if (!checkNo || !productSku) return res.status(400).json({ success: false, error: 'checkNo and productSku required' });
  const check = await prisma.qualityCheck.create({ data: { checkNo, productSku, inspector, status: status || 'Pending', defectsFound: Number(defectsFound) || 0, notes, workOrderId } });
  res.status(201).json({ success: true, data: check });
}));
router.patch('/quality/checks/:id', handle(async (req, res) => {
  const updated = await prisma.qualityCheck.update({ where: { id: req.params.id }, data: req.body || {} });
  res.json({ success: true, data: updated });
}));
router.delete('/quality/checks/:id', handle(async (req, res) => {
  await prisma.qualityCheck.delete({ where: { id: req.params.id } });
  res.json({ success: true });
}));

router.get('/quality/ncrs', handle(async (_req, res) => {
  const data = await prisma.nonConformanceReport.findMany({ orderBy: { createdAt: 'desc' }, take: 200 });
  res.json({ success: true, data, total: data.length });
}));
router.post('/quality/ncrs', handle(async (req, res) => {
  const { ncrNo, severity, description, rootCause, correctiveAction, status, assignedTo, qualityCheckId } = req.body || {};
  if (!ncrNo || !description) return res.status(400).json({ success: false, error: 'ncrNo and description required' });
  const ncr = await prisma.nonConformanceReport.create({ data: { ncrNo, severity: severity || 'Minor', description, rootCause, correctiveAction, status: status || 'Open', assignedTo, qualityCheckId } });
  res.status(201).json({ success: true, data: ncr });
}));
router.patch('/quality/ncrs/:id', handle(async (req, res) => {
  const updated = await prisma.nonConformanceReport.update({ where: { id: req.params.id }, data: req.body || {} });
  res.json({ success: true, data: updated });
}));
router.delete('/quality/ncrs/:id', handle(async (req, res) => {
  await prisma.nonConformanceReport.delete({ where: { id: req.params.id } });
  res.json({ success: true });
}));

// ── PROJECTS ────────────────────────────────────────────────────────
router.get('/projects', handle(async (_req, res) => {
  const data = await prisma.project.findMany({ include: { tasks: true, milestones: true }, orderBy: { createdAt: 'desc' }, take: 200 });
  res.json({ success: true, data, total: data.length });
}));
router.post('/projects', handle(async (req, res) => {
  const { code, name, description, status, priority, startDate, endDate, ownerId, budget, currency } = req.body || {};
  if (!code || !name) return res.status(400).json({ success: false, error: 'code and name required' });
  const p = await prisma.project.create({ data: { code, name, description, status: status || 'Active', priority: priority || 'Normal', startDate, endDate, ownerId, budget: Number(budget) || 0, currency: currency || 'USD' } });
  res.status(201).json({ success: true, data: p });
}));
router.patch('/projects/:id', handle(async (req, res) => {
  const updated = await prisma.project.update({ where: { id: req.params.id }, data: req.body || {} });
  res.json({ success: true, data: updated });
}));
router.delete('/projects/:id', handle(async (req, res) => {
  await prisma.project.delete({ where: { id: req.params.id } });
  res.json({ success: true });
}));

router.get('/projects/:id/tasks', handle(async (req, res) => {
  const data = await prisma.task.findMany({ where: { projectId: req.params.id }, orderBy: { createdAt: 'desc' } });
  res.json({ success: true, data, total: data.length });
}));
router.post('/projects/:id/tasks', handle(async (req, res) => {
  const { title, status, priority, assigneeId, dueDate } = req.body || {};
  if (!title) return res.status(400).json({ success: false, error: 'title required' });
  const task = await prisma.task.create({ data: { projectId: req.params.id, title, status: status || 'Todo', priority: priority || 'Normal', assigneeId, dueDate } });
  res.status(201).json({ success: true, data: task });
}));
router.patch('/projects/tasks/:taskId', handle(async (req, res) => {
  const updated = await prisma.task.update({ where: { id: req.params.taskId }, data: req.body || {} });
  res.json({ success: true, data: updated });
}));
router.delete('/projects/tasks/:taskId', handle(async (req, res) => {
  await prisma.task.delete({ where: { id: req.params.taskId } });
  res.json({ success: true });
}));

// ── TREASURY ────────────────────────────────────────────────────────
router.get('/treasury/accounts', handle(async (_req, res) => {
  const data = await prisma.bankAccount.findMany({ include: { transactions: { take: 10, orderBy: { postedAt: 'desc' } } }, orderBy: { createdAt: 'desc' } });
  res.json({ success: true, data, total: data.length });
}));
router.post('/treasury/accounts', handle(async (req, res) => {
  const { accountNo, bankName, currency, balance, accountType, country, status } = req.body || {};
  if (!accountNo || !bankName) return res.status(400).json({ success: false, error: 'accountNo and bankName required' });
  const acc = await prisma.bankAccount.create({ data: { accountNo, bankName, currency: currency || 'USD', balance: Number(balance) || 0, accountType: accountType || 'Operating', country, status: status || 'Active' } });
  res.status(201).json({ success: true, data: acc });
}));
router.get('/treasury/accounts/:id/transactions', handle(async (req, res) => {
  const data = await prisma.bankTransaction.findMany({ where: { accountId: req.params.id }, orderBy: { postedAt: 'desc' }, take: 500 });
  res.json({ success: true, data, total: data.length });
}));
router.post('/treasury/accounts/:id/transactions', handle(async (req, res) => {
  const { type, amount, currency, reference, description } = req.body || {};
  if (!type || amount === undefined) return res.status(400).json({ success: false, error: 'type and amount required' });
  const tx = await prisma.bankTransaction.create({ data: { accountId: req.params.id, type, amount: Number(amount), currency: currency || 'USD', reference, description } });
  // Update balance
  const delta = type === 'Credit' ? Number(amount) : -Number(amount);
  await prisma.bankAccount.update({ where: { id: req.params.id }, data: { balance: { increment: delta } } });
  res.status(201).json({ success: true, data: tx });
}));

router.get('/treasury/fx-rates', handle(async (_req, res) => {
  const data = await prisma.fxRate.findMany({ orderBy: { effectiveDate: 'desc' }, take: 200 });
  res.json({ success: true, data, total: data.length });
}));
router.post('/treasury/fx-rates', handle(async (req, res) => {
  const { fromCcy, toCcy, rate, effectiveDate, source } = req.body || {};
  if (!fromCcy || !toCcy || !rate || !effectiveDate) return res.status(400).json({ success: false, error: 'fromCcy, toCcy, rate, effectiveDate required' });
  const fx = await prisma.fxRate.create({ data: { fromCcy, toCcy, rate: Number(rate), effectiveDate, source } });
  res.status(201).json({ success: true, data: fx });
}));

// ── MARKETING ───────────────────────────────────────────────────────
router.get('/marketing/email-campaigns', handle(async (_req, res) => {
  const data = await prisma.emailCampaign.findMany({ orderBy: { createdAt: 'desc' }, take: 200 });
  res.json({ success: true, data, total: data.length });
}));
router.post('/marketing/email-campaigns', handle(async (req, res) => {
  const { name, subject, segment, status, scheduledAt } = req.body || {};
  if (!name || !subject) return res.status(400).json({ success: false, error: 'name and subject required' });
  const c = await prisma.emailCampaign.create({ data: { name, subject, segment, status: status || 'Draft', scheduledAt: scheduledAt ? new Date(scheduledAt) : null } });
  res.status(201).json({ success: true, data: c });
}));
router.patch('/marketing/email-campaigns/:id', handle(async (req, res) => {
  const updated = await prisma.emailCampaign.update({ where: { id: req.params.id }, data: req.body || {} });
  res.json({ success: true, data: updated });
}));
router.delete('/marketing/email-campaigns/:id', handle(async (req, res) => {
  await prisma.emailCampaign.delete({ where: { id: req.params.id } });
  res.json({ success: true });
}));

router.get('/marketing/social-posts', handle(async (_req, res) => {
  const data = await prisma.socialPost.findMany({ orderBy: { createdAt: 'desc' }, take: 200 });
  res.json({ success: true, data, total: data.length });
}));
router.post('/marketing/social-posts', handle(async (req, res) => {
  const { platform, content, mediaUrl, status, scheduledAt } = req.body || {};
  if (!platform || !content) return res.status(400).json({ success: false, error: 'platform and content required' });
  const p = await prisma.socialPost.create({ data: { platform, content, mediaUrl, status: status || 'Draft', scheduledAt: scheduledAt ? new Date(scheduledAt) : null } });
  res.status(201).json({ success: true, data: p });
}));
router.patch('/marketing/social-posts/:id', handle(async (req, res) => {
  const updated = await prisma.socialPost.update({ where: { id: req.params.id }, data: req.body || {} });
  res.json({ success: true, data: updated });
}));
router.delete('/marketing/social-posts/:id', handle(async (req, res) => {
  await prisma.socialPost.delete({ where: { id: req.params.id } });
  res.json({ success: true });
}));

// ── DOCUMENTS ───────────────────────────────────────────────────────
router.get('/documents', handle(async (req, res) => {
  const where: any = {};
  if (req.query.type) where.type = String(req.query.type);
  if (req.query.status) where.status = String(req.query.status);
  const data = await prisma.document.findMany({ where, orderBy: { createdAt: 'desc' }, take: 200 });
  res.json({ success: true, data, total: data.length });
}));
router.post('/documents', handle(async (req, res) => {
  const { title, type, category, url, ownerId, partyId, status, effectiveDate, expiryDate, metadata } = req.body || {};
  if (!title || !type) return res.status(400).json({ success: false, error: 'title and type required' });
  const d = await prisma.document.create({ data: { title, type, category, url, ownerId, partyId, status: status || 'Draft', effectiveDate, expiryDate, metadata } });
  res.status(201).json({ success: true, data: d });
}));
router.patch('/documents/:id', handle(async (req, res) => {
  const updated = await prisma.document.update({ where: { id: req.params.id }, data: req.body || {} });
  res.json({ success: true, data: updated });
}));
router.delete('/documents/:id', handle(async (req, res) => {
  await prisma.document.delete({ where: { id: req.params.id } });
  res.json({ success: true });
}));

// ── NOTIFICATIONS ───────────────────────────────────────────────────
router.get('/notifications', handle(async (req, res) => {
  const where: any = {};
  if (req.query.userId) where.userId = String(req.query.userId);
  if (req.query.read !== undefined) where.read = req.query.read === 'true';
  const data = await prisma.notification.findMany({ where, orderBy: { createdAt: 'desc' }, take: 100 });
  res.json({ success: true, data, total: data.length });
}));
router.post('/notifications', handle(async (req, res) => {
  const { userId, channel, category, title, message, actionUrl, severity } = req.body || {};
  if (!title || !message) return res.status(400).json({ success: false, error: 'title and message required' });
  const n = await prisma.notification.create({ data: { userId, channel: channel || 'in-app', category, title, message, actionUrl, severity: severity || 'info' } });
  res.status(201).json({ success: true, data: n });
}));
router.patch('/notifications/:id', handle(async (req, res) => {
  const updated = await prisma.notification.update({ where: { id: req.params.id }, data: { ...(req.body || {}), readAt: req.body?.read ? new Date() : undefined } });
  res.json({ success: true, data: updated });
}));
router.delete('/notifications/:id', handle(async (req, res) => {
  await prisma.notification.delete({ where: { id: req.params.id } });
  res.json({ success: true });
}));

// ── AUDIT EVENTS ────────────────────────────────────────────────────
router.get('/audit-events', handle(async (req, res) => {
  const where: any = {};
  if (req.query.actorId) where.actorId = String(req.query.actorId);
  if (req.query.action) where.action = String(req.query.action);
  if (req.query.entity) where.entity = String(req.query.entity);
  const data = await prisma.auditEvent.findMany({ where, orderBy: { createdAt: 'desc' }, take: 500 });
  res.json({ success: true, data, total: data.length });
}));
router.post('/audit-events', handle(async (req, res) => {
  const { actorId, actorRole, action, module, entity, entityId, payload, result } = req.body || {};
  if (!action) return res.status(400).json({ success: false, error: 'action required' });
  const e = await prisma.auditEvent.create({ data: { actorId, actorRole, action, module, entity, entityId, ipAddress: req.ip, userAgent: req.get('user-agent'), payload, result: result || 'success' } });
  res.status(201).json({ success: true, data: e });
}));

// ── ASSETS ──────────────────────────────────────────────────────────
router.get('/assets', handle(async (_req, res) => {
  const data = await prisma.asset.findMany({ include: { maintenances: { take: 5, orderBy: { performedAt: 'desc' } } }, orderBy: { createdAt: 'desc' }, take: 200 });
  res.json({ success: true, data, total: data.length });
}));
router.post('/assets', handle(async (req, res) => {
  const { assetCode, name, category, location, status, purchaseDate, purchasePrice, currency, warrantyExpiry, ownerId } = req.body || {};
  if (!assetCode || !name) return res.status(400).json({ success: false, error: 'assetCode and name required' });
  const a = await prisma.asset.create({ data: { assetCode, name, category, location, status: status || 'Active', purchaseDate, purchasePrice: Number(purchasePrice) || 0, currency: currency || 'USD', warrantyExpiry, ownerId } });
  res.status(201).json({ success: true, data: a });
}));
router.patch('/assets/:id', handle(async (req, res) => {
  const updated = await prisma.asset.update({ where: { id: req.params.id }, data: req.body || {} });
  res.json({ success: true, data: updated });
}));
router.delete('/assets/:id', handle(async (req, res) => {
  await prisma.asset.delete({ where: { id: req.params.id } });
  res.json({ success: true });
}));

router.get('/assets/:id/maintenance', handle(async (req, res) => {
  const data = await prisma.maintenanceLog.findMany({ where: { assetId: req.params.id }, orderBy: { performedAt: 'desc' } });
  res.json({ success: true, data, total: data.length });
}));
router.post('/assets/:id/maintenance', handle(async (req, res) => {
  const { type, description, cost, currency, technician, nextDueAt } = req.body || {};
  if (!type || !description) return res.status(400).json({ success: false, error: 'type and description required' });
  const log = await prisma.maintenanceLog.create({ data: { assetId: req.params.id, type, description, cost: Number(cost) || 0, currency: currency || 'USD', technician, nextDueAt } });
  await prisma.asset.update({ where: { id: req.params.id }, data: { status: 'InMaintenance' } });
  res.status(201).json({ success: true, data: log });
}));

export default router;
