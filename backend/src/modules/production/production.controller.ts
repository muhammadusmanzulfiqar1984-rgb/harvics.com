/**
 * Production Modules CRUD Controller
 * Wires 15 new Prisma tables to REST endpoints for frontend OS modules.
 *
 * All POST/PATCH bodies validated via zod (see ./production.schemas.ts).
 * Validation errors are RFC7807 problem+json.
 *
 * Routes (all mounted under /api/v2):
 *   /api/v2/manufacturing/work-orders          GET/POST/PATCH/DELETE
 *   /api/v2/quality/checks                     GET/POST/PATCH/DELETE
 *   /api/v2/quality/ncrs                       GET/POST/PATCH/DELETE
 *   /api/v2/projects                           GET/POST/PATCH/DELETE
 *   /api/v2/projects/:id/tasks                 GET/POST/PATCH/DELETE
 *   /api/v2/treasury/accounts                  GET/POST
 *   /api/v2/treasury/accounts/:id/transactions GET/POST
 *   /api/v2/treasury/fx-rates                  GET/POST
 *   /api/v2/marketing/email-campaigns          GET/POST/PATCH/DELETE
 *   /api/v2/marketing/social-posts             GET/POST/PATCH/DELETE
 *   /api/v2/documents                          GET/POST/PATCH/DELETE
 *   /api/v2/notifications                      GET/POST/PATCH/DELETE
 *   /api/v2/audit-events                       GET/POST
 *   /api/v2/assets                             GET/POST/PATCH/DELETE
 *   /api/v2/assets/:id/maintenance             GET/POST
 */

import { Router, Request, Response } from 'express';
import { prisma } from '../../core/prisma';
import { validateBody } from '../../middleware/validate';
import {
  WorkOrderCreateSchema, WorkOrderUpdateSchema,
  QualityCheckCreateSchema, QualityCheckUpdateSchema,
  NCRCreateSchema, NCRUpdateSchema,
  ProjectCreateSchema, ProjectUpdateSchema,
  TaskCreateSchema, TaskUpdateSchema,
  BankAccountCreateSchema, BankTransactionCreateSchema, FxRateCreateSchema,
  EmailCampaignCreateSchema, EmailCampaignUpdateSchema,
  SocialPostCreateSchema, SocialPostUpdateSchema,
  DocumentCreateSchema, DocumentUpdateSchema,
  NotificationCreateSchema, NotificationUpdateSchema,
  AuditEventCreateSchema,
  AssetCreateSchema, AssetUpdateSchema, MaintenanceLogCreateSchema,
} from './production.schemas';

const router = Router();

// Generic error wrapper
function handle(fn: (req: Request, res: Response) => Promise<any>) {
  return async (req: Request, res: Response) => {
    try { return await fn(req, res); }
    catch (err: any) {
      // Surface Prisma "record not found" as 404 rather than 500.
      if (err?.code === 'P2025') {
        return res.status(404).json({ success: false, error: 'Record not found' });
      }
      return res.status(500).json({ success: false, error: err?.message || 'db error' });
    }
  };
}

// ── MANUFACTURING ───────────────────────────────────────────────────
router.get('/manufacturing/work-orders', handle(async (_req, res) => {
  const data = await prisma.workOrder.findMany({ include: { bomItems: true }, orderBy: { createdAt: 'desc' }, take: 200 });
  res.json({ success: true, data, total: data.length });
}));
router.post('/manufacturing/work-orders', validateBody(WorkOrderCreateSchema), handle(async (req, res) => {
  const wo = await prisma.workOrder.create({ data: req.body });
  res.status(201).json({ success: true, data: wo });
}));
router.patch('/manufacturing/work-orders/:id', validateBody(WorkOrderUpdateSchema), handle(async (req, res) => {
  const updated = await prisma.workOrder.update({ where: { id: req.params.id }, data: req.body });
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
router.post('/quality/checks', validateBody(QualityCheckCreateSchema), handle(async (req, res) => {
  const check = await prisma.qualityCheck.create({ data: req.body });
  res.status(201).json({ success: true, data: check });
}));
router.patch('/quality/checks/:id', validateBody(QualityCheckUpdateSchema), handle(async (req, res) => {
  const updated = await prisma.qualityCheck.update({ where: { id: req.params.id }, data: req.body });
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
router.post('/quality/ncrs', validateBody(NCRCreateSchema), handle(async (req, res) => {
  const ncr = await prisma.nonConformanceReport.create({ data: req.body });
  res.status(201).json({ success: true, data: ncr });
}));
router.patch('/quality/ncrs/:id', validateBody(NCRUpdateSchema), handle(async (req, res) => {
  const updated = await prisma.nonConformanceReport.update({ where: { id: req.params.id }, data: req.body });
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
router.post('/projects', validateBody(ProjectCreateSchema), handle(async (req, res) => {
  const p = await prisma.project.create({ data: req.body });
  res.status(201).json({ success: true, data: p });
}));
router.patch('/projects/:id', validateBody(ProjectUpdateSchema), handle(async (req, res) => {
  const updated = await prisma.project.update({ where: { id: req.params.id }, data: req.body });
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
router.post('/projects/:id/tasks', validateBody(TaskCreateSchema), handle(async (req, res) => {
  const task = await prisma.task.create({ data: { ...req.body, projectId: req.params.id } });
  res.status(201).json({ success: true, data: task });
}));
router.patch('/projects/tasks/:taskId', validateBody(TaskUpdateSchema), handle(async (req, res) => {
  const updated = await prisma.task.update({ where: { id: req.params.taskId }, data: req.body });
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
router.post('/treasury/accounts', validateBody(BankAccountCreateSchema), handle(async (req, res) => {
  const acc = await prisma.bankAccount.create({ data: req.body });
  res.status(201).json({ success: true, data: acc });
}));
router.get('/treasury/accounts/:id/transactions', handle(async (req, res) => {
  const data = await prisma.bankTransaction.findMany({ where: { accountId: req.params.id }, orderBy: { postedAt: 'desc' }, take: 500 });
  res.json({ success: true, data, total: data.length });
}));
router.post('/treasury/accounts/:id/transactions', validateBody(BankTransactionCreateSchema), handle(async (req, res) => {
  const { type, amount } = req.body as { type: 'Credit' | 'Debit'; amount: number };
  const tx = await prisma.bankTransaction.create({ data: { ...req.body, accountId: req.params.id } });
  const delta = type === 'Credit' ? amount : -amount;
  await prisma.bankAccount.update({ where: { id: req.params.id }, data: { balance: { increment: delta } } });
  res.status(201).json({ success: true, data: tx });
}));

router.get('/treasury/fx-rates', handle(async (_req, res) => {
  const data = await prisma.fxRate.findMany({ orderBy: { effectiveDate: 'desc' }, take: 200 });
  res.json({ success: true, data, total: data.length });
}));
router.post('/treasury/fx-rates', validateBody(FxRateCreateSchema), handle(async (req, res) => {
  const fx = await prisma.fxRate.create({ data: req.body });
  res.status(201).json({ success: true, data: fx });
}));

// ── MARKETING ───────────────────────────────────────────────────────
router.get('/marketing/email-campaigns', handle(async (_req, res) => {
  const data = await prisma.emailCampaign.findMany({ orderBy: { createdAt: 'desc' }, take: 200 });
  res.json({ success: true, data, total: data.length });
}));
router.post('/marketing/email-campaigns', validateBody(EmailCampaignCreateSchema), handle(async (req, res) => {
  const c = await prisma.emailCampaign.create({ data: req.body });
  res.status(201).json({ success: true, data: c });
}));
router.patch('/marketing/email-campaigns/:id', validateBody(EmailCampaignUpdateSchema), handle(async (req, res) => {
  const updated = await prisma.emailCampaign.update({ where: { id: req.params.id }, data: req.body });
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
router.post('/marketing/social-posts', validateBody(SocialPostCreateSchema), handle(async (req, res) => {
  const p = await prisma.socialPost.create({ data: req.body });
  res.status(201).json({ success: true, data: p });
}));
router.patch('/marketing/social-posts/:id', validateBody(SocialPostUpdateSchema), handle(async (req, res) => {
  const updated = await prisma.socialPost.update({ where: { id: req.params.id }, data: req.body });
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
router.post('/documents', validateBody(DocumentCreateSchema), handle(async (req, res) => {
  const d = await prisma.document.create({ data: req.body });
  res.status(201).json({ success: true, data: d });
}));
router.patch('/documents/:id', validateBody(DocumentUpdateSchema), handle(async (req, res) => {
  const updated = await prisma.document.update({ where: { id: req.params.id }, data: req.body });
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
router.post('/notifications', validateBody(NotificationCreateSchema), handle(async (req, res) => {
  const n = await prisma.notification.create({ data: req.body });
  res.status(201).json({ success: true, data: n });
}));
router.patch('/notifications/:id', validateBody(NotificationUpdateSchema), handle(async (req, res) => {
  const updated = await prisma.notification.update({ where: { id: req.params.id }, data: { ...req.body, readAt: req.body?.read ? new Date() : undefined } });
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
router.post('/audit-events', validateBody(AuditEventCreateSchema), handle(async (req, res) => {
  const e = await prisma.auditEvent.create({ data: { ...req.body, ipAddress: req.ip, userAgent: req.get('user-agent') } });
  res.status(201).json({ success: true, data: e });
}));

// ── ASSETS ──────────────────────────────────────────────────────────
router.get('/assets', handle(async (_req, res) => {
  const data = await prisma.asset.findMany({ include: { maintenances: { take: 5, orderBy: { performedAt: 'desc' } } }, orderBy: { createdAt: 'desc' }, take: 200 });
  res.json({ success: true, data, total: data.length });
}));
router.post('/assets', validateBody(AssetCreateSchema), handle(async (req, res) => {
  const a = await prisma.asset.create({ data: req.body });
  res.status(201).json({ success: true, data: a });
}));
router.patch('/assets/:id', validateBody(AssetUpdateSchema), handle(async (req, res) => {
  const updated = await prisma.asset.update({ where: { id: req.params.id }, data: req.body });
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
router.post('/assets/:id/maintenance', validateBody(MaintenanceLogCreateSchema), handle(async (req, res) => {
  const log = await prisma.maintenanceLog.create({ data: { ...req.body, assetId: req.params.id } });
  await prisma.asset.update({ where: { id: req.params.id }, data: { status: 'InMaintenance' } });
  res.status(201).json({ success: true, data: log });
}));

export default router;
