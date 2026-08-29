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
 *   /api/v2/treasury/accounts/:id              GET
 *   /api/v2/treasury/accounts/:id/transactions GET/POST
 *   /api/v2/treasury/accounts/:id/freeze|unfreeze POST
 *   /api/v2/treasury/transfer                  POST
 *   /api/v2/treasury/positions                 GET
 *   /api/v2/treasury/risk                      GET
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
import { eventBus } from '../../core/eventBus';
import { emitAudit } from '../../services/audit.service';
import {
  WorkOrderCreateSchema, WorkOrderUpdateSchema,
  QualityCheckCreateSchema, QualityCheckUpdateSchema,
  NCRCreateSchema, NCRUpdateSchema,
  ProjectCreateSchema, ProjectUpdateSchema,
  TaskCreateSchema, TaskUpdateSchema,
  BankAccountCreateSchema, BankTransactionCreateSchema, BankTransferSchema,
  BankAccountStatusSchema, FxRateCreateSchema,
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
const WO_TRANSITIONS: Record<string, string[]> = {
  Planned: ['Released', 'Cancelled'],
  Released: ['InProgress', 'Cancelled'],
  InProgress: ['Completed', 'Cancelled'],
  Completed: [],
  Cancelled: [],
};

router.get('/manufacturing/work-orders', handle(async (_req, res) => {
  const data = await prisma.workOrder.findMany({ include: { bomItems: true }, orderBy: { createdAt: 'desc' }, take: 200 });
  res.json({ success: true, data, total: data.length });
}));
router.get('/manufacturing/work-orders/:id', handle(async (req, res) => {
  const data = await prisma.workOrder.findUnique({ where: { id: req.params.id }, include: { bomItems: true } });
  if (!data) return res.status(404).json({ success: false, error: 'Work order not found' });
  res.json({ success: true, data });
}));
router.post('/manufacturing/work-orders', validateBody(WorkOrderCreateSchema), handle(async (req, res) => {
  const wo = await prisma.workOrder.create({ data: req.body });
  void emitAudit(req, 'workOrder.created', 'WorkOrder', wo.id, { module: 'manufacturing', payload: req.body });
  eventBus.emitDomain('mfg.workorder.created', wo, 'manufacturing');
  res.status(201).json({ success: true, data: wo });
}));
router.patch('/manufacturing/work-orders/:id', validateBody(WorkOrderUpdateSchema), handle(async (req, res) => {
  const existing = await prisma.workOrder.findUnique({ where: { id: req.params.id } });
  if (!existing) return res.status(404).json({ success: false, error: 'Work order not found' });
  if (req.body.status && req.body.status !== existing.status) {
    const allowed = WO_TRANSITIONS[existing.status] || [];
    if (!allowed.includes(req.body.status)) {
      return res.status(409).json({
        success: false,
        error: `Cannot move from '${existing.status}' to '${req.body.status}'`,
      });
    }
  }
  const data: any = { ...req.body };
  if (req.body.status === 'Completed' && !req.body.completionDate) {
    data.completionDate = new Date().toISOString().slice(0, 10);
  }
  const updated = await prisma.workOrder.update({ where: { id: req.params.id }, data });
  void emitAudit(req, 'workOrder.updated', 'WorkOrder', updated.id, {
    module: 'manufacturing',
    payload: { from: existing.status, to: updated.status, ...req.body },
  });
  if (String(updated.status || '').toLowerCase() === 'completed') {
    eventBus.emitDomain('mfg.workorder.completed', updated, 'manufacturing');
  }
  res.json({ success: true, data: updated });
}));
router.delete('/manufacturing/work-orders/:id', handle(async (req, res) => {
  await prisma.workOrder.delete({ where: { id: req.params.id } });
  void emitAudit(req, 'workOrder.deleted', 'WorkOrder', req.params.id, { module: 'manufacturing' });
  res.json({ success: true });
}));

// ── QUALITY ─────────────────────────────────────────────────────────
const QC_TRANSITIONS: Record<string, string[]> = {
  Pending: ['Passed', 'Failed'],
  Passed: [],
  Failed: [],
};
const NCR_TRANSITIONS: Record<string, string[]> = {
  Open: ['Investigating', 'Closed'],
  Investigating: ['Closed'],
  Closed: [],
};

router.get('/quality/checks', handle(async (_req, res) => {
  const data = await prisma.qualityCheck.findMany({ orderBy: { createdAt: 'desc' }, take: 200 });
  res.json({ success: true, data, total: data.length });
}));
router.get('/quality/checks/:id', handle(async (req, res) => {
  const data = await prisma.qualityCheck.findUnique({ where: { id: req.params.id } });
  if (!data) return res.status(404).json({ success: false, error: 'Quality check not found' });
  res.json({ success: true, data });
}));
router.post('/quality/checks', validateBody(QualityCheckCreateSchema), handle(async (req, res) => {
  const check = await prisma.qualityCheck.create({ data: req.body });
  void emitAudit(req, 'qualityCheck.created', 'QualityCheck', check.id, { module: 'quality', payload: req.body });
  eventBus.emitDomain('mfg.quality.created', check, 'quality');
  res.status(201).json({ success: true, data: check });
}));
router.patch('/quality/checks/:id', validateBody(QualityCheckUpdateSchema), handle(async (req, res) => {
  const existing = await prisma.qualityCheck.findUnique({ where: { id: req.params.id } });
  if (!existing) return res.status(404).json({ success: false, error: 'Quality check not found' });
  if (req.body.status && req.body.status !== existing.status) {
    const allowed = QC_TRANSITIONS[existing.status] || [];
    if (!allowed.includes(req.body.status)) {
      return res.status(409).json({
        success: false,
        error: `Cannot move from '${existing.status}' to '${req.body.status}'`,
      });
    }
  }
  const data: any = { ...req.body };
  if (req.body.status === 'Passed' || req.body.status === 'Failed') {
    data.inspectedAt = new Date();
  }
  const updated = await prisma.qualityCheck.update({ where: { id: req.params.id }, data });
  void emitAudit(req, 'qualityCheck.updated', 'QualityCheck', updated.id, {
    module: 'quality',
    payload: { from: existing.status, to: updated.status, ...req.body },
  });
  res.json({ success: true, data: updated });
}));
router.delete('/quality/checks/:id', handle(async (req, res) => {
  await prisma.qualityCheck.delete({ where: { id: req.params.id } });
  void emitAudit(req, 'qualityCheck.deleted', 'QualityCheck', req.params.id, { module: 'quality' });
  res.json({ success: true });
}));

router.get('/quality/ncrs', handle(async (_req, res) => {
  const data = await prisma.nonConformanceReport.findMany({ orderBy: { createdAt: 'desc' }, take: 200 });
  res.json({ success: true, data, total: data.length });
}));
router.get('/quality/ncrs/:id', handle(async (req, res) => {
  const data = await prisma.nonConformanceReport.findUnique({ where: { id: req.params.id } });
  if (!data) return res.status(404).json({ success: false, error: 'NCR not found' });
  res.json({ success: true, data });
}));
router.post('/quality/ncrs', validateBody(NCRCreateSchema), handle(async (req, res) => {
  const ncr = await prisma.nonConformanceReport.create({ data: req.body });
  void emitAudit(req, 'ncr.created', 'NonConformanceReport', ncr.id, { module: 'quality', payload: req.body });
  res.status(201).json({ success: true, data: ncr });
}));
router.patch('/quality/ncrs/:id', validateBody(NCRUpdateSchema), handle(async (req, res) => {
  const existing = await prisma.nonConformanceReport.findUnique({ where: { id: req.params.id } });
  if (!existing) return res.status(404).json({ success: false, error: 'NCR not found' });
  if (req.body.status && req.body.status !== existing.status) {
    const allowed = NCR_TRANSITIONS[existing.status] || [];
    if (!allowed.includes(req.body.status)) {
      return res.status(409).json({
        success: false,
        error: `Cannot move from '${existing.status}' to '${req.body.status}'`,
      });
    }
  }
  const data: any = { ...req.body };
  if (req.body.status === 'Closed') data.closedAt = new Date();
  const updated = await prisma.nonConformanceReport.update({ where: { id: req.params.id }, data });
  void emitAudit(req, 'ncr.updated', 'NonConformanceReport', updated.id, {
    module: 'quality',
    payload: { from: existing.status, to: updated.status, ...req.body },
  });
  res.json({ success: true, data: updated });
}));
router.delete('/quality/ncrs/:id', handle(async (req, res) => {
  await prisma.nonConformanceReport.delete({ where: { id: req.params.id } });
  void emitAudit(req, 'ncr.deleted', 'NonConformanceReport', req.params.id, { module: 'quality' });
  res.json({ success: true });
}));

// ── PROJECTS ────────────────────────────────────────────────────────
const PROJECT_NEXT: Record<string, string[]> = {
  Active: ['OnHold', 'Completed', 'Cancelled'],
  OnHold: ['Active', 'Cancelled'],
  Completed: [],
  Cancelled: [],
};
router.get('/projects', handle(async (_req, res) => {
  const data = await prisma.project.findMany({ include: { tasks: true, milestones: true }, orderBy: { createdAt: 'desc' }, take: 200 });
  res.json({ success: true, data, total: data.length });
}));
router.post('/projects', validateBody(ProjectCreateSchema), handle(async (req, res) => {
  const p = await prisma.project.create({ data: req.body });
  void emitAudit(req, 'project.created', 'Project', p.id, { module: 'projects', payload: req.body });
  eventBus.emitDomain('project.created', p, 'projects');
  res.status(201).json({ success: true, data: p });
}));
router.get('/projects/:id', handle(async (req, res) => {
  const p = await prisma.project.findUnique({
    where: { id: req.params.id },
    include: { tasks: { orderBy: { createdAt: 'desc' } }, milestones: true },
  });
  if (!p) return res.status(404).json({ success: false, error: 'Project not found' });
  res.json({ success: true, data: p });
}));
router.patch('/projects/:id', validateBody(ProjectUpdateSchema), handle(async (req, res) => {
  const existing = await prisma.project.findUnique({ where: { id: req.params.id } });
  if (!existing) return res.status(404).json({ success: false, error: 'Project not found' });
  const updated = await prisma.project.update({ where: { id: req.params.id }, data: req.body });
  void emitAudit(req, 'project.updated', 'Project', updated.id, { module: 'projects', payload: req.body });
  res.json({ success: true, data: updated });
}));
router.post('/projects/:id/status', handle(async (req, res) => {
  const to = String(req.body?.status || '');
  if (!['Active', 'OnHold', 'Completed', 'Cancelled'].includes(to)) {
    return res.status(400).json({ success: false, error: 'Invalid status' });
  }
  const existing = await prisma.project.findUnique({ where: { id: req.params.id } });
  if (!existing) return res.status(404).json({ success: false, error: 'Project not found' });
  const allowed = PROJECT_NEXT[existing.status] || [];
  if (existing.status !== to && !allowed.includes(to)) {
    return res.status(409).json({ success: false, error: `Cannot transition from '${existing.status}' to '${to}'`, allowed });
  }
  const updated = await prisma.project.update({ where: { id: existing.id }, data: { status: to } });
  void emitAudit(req, 'project.status', 'Project', updated.id, { module: 'projects', payload: { from: existing.status, to } });
  res.json({ success: true, data: updated });
}));
router.delete('/projects/:id', handle(async (req, res) => {
  await prisma.project.delete({ where: { id: req.params.id } });
  void emitAudit(req, 'project.deleted', 'Project', req.params.id, { module: 'projects' });
  res.json({ success: true });
}));

router.get('/projects/:id/tasks', handle(async (req, res) => {
  const data = await prisma.task.findMany({ where: { projectId: req.params.id }, orderBy: { createdAt: 'desc' } });
  res.json({ success: true, data, total: data.length });
}));
router.post('/projects/:id/tasks', validateBody(TaskCreateSchema), handle(async (req, res) => {
  const task = await prisma.task.create({ data: { ...req.body, projectId: req.params.id } });
  void emitAudit(req, 'task.created', 'Task', task.id, { module: 'projects', payload: { ...req.body, projectId: req.params.id } });
  res.status(201).json({ success: true, data: task });
}));
router.patch('/projects/tasks/:taskId', validateBody(TaskUpdateSchema), handle(async (req, res) => {
  const updated = await prisma.task.update({ where: { id: req.params.taskId }, data: req.body });
  void emitAudit(req, 'task.updated', 'Task', updated.id, { module: 'projects', payload: req.body });
  res.json({ success: true, data: updated });
}));
router.delete('/projects/tasks/:taskId', handle(async (req, res) => {
  await prisma.task.delete({ where: { id: req.params.taskId } });
  void emitAudit(req, 'task.deleted', 'Task', req.params.taskId, { module: 'projects' });
  res.json({ success: true });
}));

// ── TREASURY ────────────────────────────────────────────────────────
router.get('/treasury/accounts', handle(async (_req, res) => {
  const data = await prisma.bankAccount.findMany({ include: { transactions: { take: 10, orderBy: { postedAt: 'desc' } } }, orderBy: { createdAt: 'desc' } });
  res.json({ success: true, data, total: data.length });
}));
router.post('/treasury/accounts', validateBody(BankAccountCreateSchema), handle(async (req, res) => {
  const acc = await prisma.bankAccount.create({ data: req.body });
  void emitAudit(req, 'bankAccount.created', 'BankAccount', acc.id, { module: 'treasury', payload: req.body });
  eventBus.emitDomain('finance.treasury.account.created', acc, 'treasury');
  res.status(201).json({ success: true, data: acc });
}));
router.get('/treasury/accounts/:id', handle(async (req, res) => {
  const acc = await prisma.bankAccount.findUnique({
    where: { id: req.params.id },
    include: { transactions: { orderBy: { postedAt: 'desc' }, take: 200 } },
  });
  if (!acc) return res.status(404).json({ success: false, error: 'Bank account not found' });
  res.json({ success: true, data: acc });
}));
router.get('/treasury/accounts/:id/transactions', handle(async (req, res) => {
  const data = await prisma.bankTransaction.findMany({ where: { accountId: req.params.id }, orderBy: { postedAt: 'desc' }, take: 500 });
  res.json({ success: true, data, total: data.length });
}));
router.post('/treasury/accounts/:id/transactions', validateBody(BankTransactionCreateSchema), handle(async (req, res) => {
  const acc = await prisma.bankAccount.findUnique({ where: { id: req.params.id } });
  if (!acc) return res.status(404).json({ success: false, error: 'Bank account not found' });
  if (acc.status === 'Frozen') {
    return res.status(409).json({ success: false, error: 'Account is frozen — unfreeze before posting cash moves' });
  }
  const { type, amount } = req.body as { type: 'Credit' | 'Debit'; amount: number };
  const tx = await prisma.bankTransaction.create({ data: { ...req.body, accountId: req.params.id } });
  const delta = type === 'Credit' ? amount : -amount;
  await prisma.bankAccount.update({ where: { id: req.params.id }, data: { balance: { increment: delta } } });
  void emitAudit(req, 'bankTransaction.created', 'BankTransaction', tx.id, { module: 'treasury', payload: { ...req.body, accountId: req.params.id, balanceDelta: delta } });
  eventBus.emitDomain('finance.treasury.tx.created', { ...tx, balanceDelta: delta }, 'treasury');
  res.status(201).json({ success: true, data: tx });
}));
router.post('/treasury/accounts/:id/freeze', validateBody(BankAccountStatusSchema), handle(async (req, res) => {
  const ex = await prisma.bankAccount.findUnique({ where: { id: req.params.id } });
  if (!ex) return res.status(404).json({ success: false, error: 'Bank account not found' });
  if (ex.status === 'Frozen') return res.status(409).json({ success: false, error: 'Already frozen' });
  const acc = await prisma.bankAccount.update({ where: { id: ex.id }, data: { status: 'Frozen' } });
  void emitAudit(req, 'bankAccount.frozen', 'BankAccount', acc.id, {
    module: 'treasury',
    payload: { reason: req.body?.reason || null, accountNo: acc.accountNo },
  });
  eventBus.emitDomain('finance.treasury.account.frozen', acc, 'treasury');
  res.json({ success: true, data: acc, message: 'Account frozen' });
}));
router.post('/treasury/accounts/:id/unfreeze', validateBody(BankAccountStatusSchema), handle(async (req, res) => {
  const ex = await prisma.bankAccount.findUnique({ where: { id: req.params.id } });
  if (!ex) return res.status(404).json({ success: false, error: 'Bank account not found' });
  if (ex.status !== 'Frozen') return res.status(409).json({ success: false, error: `Cannot unfreeze from '${ex.status}'` });
  const acc = await prisma.bankAccount.update({ where: { id: ex.id }, data: { status: 'Active' } });
  void emitAudit(req, 'bankAccount.unfrozen', 'BankAccount', acc.id, {
    module: 'treasury',
    payload: { reason: req.body?.reason || null, accountNo: acc.accountNo },
  });
  eventBus.emitDomain('finance.treasury.account.unfrozen', acc, 'treasury');
  res.json({ success: true, data: acc, message: 'Account unfrozen' });
}));
router.post('/treasury/transfer', validateBody(BankTransferSchema), handle(async (req, res) => {
  const { fromAccountId, toAccountId, amount, reference, description } = req.body as {
    fromAccountId: string; toAccountId: string; amount: number; reference?: string | null; description?: string | null;
  };
  if (fromAccountId === toAccountId) {
    return res.status(400).json({ success: false, error: 'Cannot transfer to the same account' });
  }
  const [from, to] = await Promise.all([
    prisma.bankAccount.findUnique({ where: { id: fromAccountId } }),
    prisma.bankAccount.findUnique({ where: { id: toAccountId } }),
  ]);
  if (!from || !to) return res.status(404).json({ success: false, error: 'Source or destination account not found' });
  if (from.status === 'Frozen' || to.status === 'Frozen') {
    return res.status(409).json({ success: false, error: 'Cannot transfer — one or both accounts are frozen' });
  }
  if (from.currency !== to.currency) {
    return res.status(400).json({ success: false, error: `Currency mismatch (${from.currency} → ${to.currency}) — use FX convert first` });
  }
  if (from.balance < amount) {
    return res.status(400).json({ success: false, error: `Insufficient balance (${from.balance} ${from.currency})` });
  }
  const ref = reference || `XFER-${Date.now().toString().slice(-8)}`;
  const desc = description || `Transfer ${from.accountNo} → ${to.accountNo}`;
  const result = await prisma.$transaction(async (tx) => {
    const debit = await tx.bankTransaction.create({
      data: { accountId: from.id, type: 'Debit', amount, currency: from.currency, reference: ref, description: desc },
    });
    const credit = await tx.bankTransaction.create({
      data: { accountId: to.id, type: 'Credit', amount, currency: to.currency, reference: ref, description: desc },
    });
    const fromUpdated = await tx.bankAccount.update({ where: { id: from.id }, data: { balance: { decrement: amount } } });
    const toUpdated = await tx.bankAccount.update({ where: { id: to.id }, data: { balance: { increment: amount } } });
    return { debit, credit, from: fromUpdated, to: toUpdated };
  });
  void emitAudit(req, 'bankTransfer.posted', 'BankAccount', from.id, {
    module: 'treasury',
    payload: { fromAccountId, toAccountId, amount, reference: ref },
  });
  eventBus.emitDomain('finance.treasury.transfer', { ...result, amount, reference: ref }, 'treasury');
  res.status(201).json({ success: true, data: result, message: 'Transfer posted' });
}));
router.get('/treasury/positions', handle(async (_req, res) => {
  const accounts = await prisma.bankAccount.findMany({ orderBy: { currency: 'asc' } });
  const byCurrency: Record<string, { currency: string; balance: number; accounts: number; frozen: number }> = {};
  const byType: Record<string, { accountType: string; balance: number; accounts: number }> = {};
  for (const a of accounts) {
    const c = a.currency || 'USD';
    if (!byCurrency[c]) byCurrency[c] = { currency: c, balance: 0, accounts: 0, frozen: 0 };
    byCurrency[c].balance += a.balance;
    byCurrency[c].accounts += 1;
    if (a.status === 'Frozen') byCurrency[c].frozen += 1;
    const t = a.accountType || 'Operating';
    if (!byType[t]) byType[t] = { accountType: t, balance: 0, accounts: 0 };
    byType[t].balance += a.balance;
    byType[t].accounts += 1;
  }
  const totalCash = accounts.reduce((s, a) => s + a.balance, 0);
  res.json({
    success: true,
    data: {
      totalCash: +totalCash.toFixed(2),
      accountCount: accounts.length,
      byCurrency: Object.values(byCurrency).map((r) => ({ ...r, balance: +r.balance.toFixed(2) })),
      byType: Object.values(byType).map((r) => ({ ...r, balance: +r.balance.toFixed(2) })),
      accounts: accounts.map((a) => ({
        id: a.id,
        accountNo: a.accountNo,
        bankName: a.bankName,
        currency: a.currency,
        balance: a.balance,
        accountType: a.accountType,
        status: a.status,
        sharePct: totalCash ? +((a.balance / totalCash) * 100).toFixed(1) : 0,
      })),
    },
  });
}));
router.get('/treasury/risk', handle(async (_req, res) => {
  const [accounts, fx] = await Promise.all([
    prisma.bankAccount.findMany(),
    prisma.fxRate.findMany({ orderBy: { effectiveDate: 'desc' }, take: 50 }),
  ]);
  const totalCash = accounts.reduce((s, a) => s + a.balance, 0);
  const flags: { severity: 'high' | 'medium' | 'low'; code: string; message: string; accountId?: string }[] = [];
  for (const a of accounts) {
    if (a.status === 'Frozen') {
      flags.push({ severity: 'high', code: 'FROZEN', message: `${a.accountNo} (${a.bankName}) is frozen`, accountId: a.id });
    }
    if (a.balance < 0) {
      flags.push({ severity: 'high', code: 'NEGATIVE', message: `${a.accountNo} has negative balance ${a.balance}`, accountId: a.id });
    } else if (a.balance > 0 && a.balance < 1000 && a.status === 'Active') {
      flags.push({ severity: 'medium', code: 'LOW_CASH', message: `${a.accountNo} low cash (${a.balance} ${a.currency})`, accountId: a.id });
    }
    if (totalCash > 0 && a.balance / totalCash >= 0.8) {
      flags.push({
        severity: 'medium',
        code: 'CONCENTRATION',
        message: `${a.accountNo} holds ${((a.balance / totalCash) * 100).toFixed(0)}% of group cash`,
        accountId: a.id,
      });
    }
  }
  const today = new Date().toISOString().slice(0, 10);
  const staleFx = fx.filter((r) => {
    const d = String(r.effectiveDate).slice(0, 10);
    const age = (Date.parse(today) - Date.parse(d)) / 86400000;
    return Number.isFinite(age) && age > 7;
  });
  if (fx.length === 0) {
    flags.push({ severity: 'low', code: 'NO_FX', message: 'No FX rates on file' });
  } else if (staleFx.length) {
    flags.push({ severity: 'low', code: 'STALE_FX', message: `${staleFx.length} FX rate(s) older than 7 days` });
  }
  const severityRank = { high: 0, medium: 1, low: 2 };
  flags.sort((a, b) => severityRank[a.severity] - severityRank[b.severity]);
  res.json({
    success: true,
    data: flags,
    summary: {
      totalCash: +totalCash.toFixed(2),
      accountCount: accounts.length,
      frozenCount: accounts.filter((a) => a.status === 'Frozen').length,
      high: flags.filter((f) => f.severity === 'high').length,
      medium: flags.filter((f) => f.severity === 'medium').length,
      low: flags.filter((f) => f.severity === 'low').length,
    },
  });
}));

router.get('/treasury/fx-rates', handle(async (_req, res) => {
  const data = await prisma.fxRate.findMany({ orderBy: { effectiveDate: 'desc' }, take: 200 });
  res.json({ success: true, data, total: data.length });
}));
router.get('/treasury/fx-rates/:id', handle(async (req, res) => {
  const fx = await prisma.fxRate.findUnique({ where: { id: req.params.id } });
  if (!fx) return res.status(404).json({ success: false, error: 'FX rate not found' });
  res.json({ success: true, data: fx });
}));
router.get('/treasury/fx-convert', handle(async (req, res) => {
  const fromCcy = String(req.query.from || '').toUpperCase();
  const toCcy = String(req.query.to || '').toUpperCase();
  const amount = Number(req.query.amount || 0);
  if (!fromCcy || !toCcy) return res.status(400).json({ success: false, error: 'from and to required' });
  if (fromCcy === toCcy) {
    return res.json({ success: true, data: { fromCcy, toCcy, amount, rate: 1, converted: amount } });
  }
  const rate = await prisma.fxRate.findFirst({
    where: { fromCcy, toCcy },
    orderBy: { effectiveDate: 'desc' },
  });
  if (!rate) return res.status(404).json({ success: false, error: `No rate for ${fromCcy}/${toCcy}` });
  const converted = +(amount * rate.rate).toFixed(4);
  res.json({ success: true, data: { fromCcy, toCcy, amount, rate: rate.rate, converted, effectiveDate: rate.effectiveDate, rateId: rate.id } });
}));
router.post('/treasury/fx-rates', validateBody(FxRateCreateSchema), handle(async (req, res) => {
  const body = { ...req.body };
  if (body.effectiveDate instanceof Date) {
    body.effectiveDate = body.effectiveDate.toISOString().slice(0, 10);
  } else if (body.effectiveDate) {
    body.effectiveDate = String(body.effectiveDate).slice(0, 10);
  }
  const fx = await prisma.fxRate.create({ data: body });
  void emitAudit(req, 'fxRate.created', 'FxRate', fx.id, { module: 'fx', payload: body });
  eventBus.emitDomain('finance.fx.rate.created', fx, 'treasury');
  res.status(201).json({ success: true, data: fx });
}));

// ── MARKETING ───────────────────────────────────────────────────────
router.get('/marketing/email-campaigns', handle(async (_req, res) => {
  const data = await prisma.emailCampaign.findMany({ orderBy: { createdAt: 'desc' }, take: 200 });
  res.json({ success: true, data, total: data.length });
}));
router.get('/marketing/email-campaigns/:id', handle(async (req, res) => {
  const c = await prisma.emailCampaign.findUnique({ where: { id: req.params.id } });
  if (!c) return res.status(404).json({ success: false, error: 'Campaign not found' });
  res.json({ success: true, data: c });
}));
router.post('/marketing/email-campaigns', validateBody(EmailCampaignCreateSchema), handle(async (req, res) => {
  const c = await prisma.emailCampaign.create({ data: req.body });
  void emitAudit(req, 'emailCampaign.created', 'EmailCampaign', c.id, { module: 'marketing', payload: req.body });
  eventBus.emitDomain('marketing.campaign.created', c, 'marketing');
  res.status(201).json({ success: true, data: c });
}));
router.patch('/marketing/email-campaigns/:id', validateBody(EmailCampaignUpdateSchema), handle(async (req, res) => {
  const existing = await prisma.emailCampaign.findUnique({ where: { id: req.params.id } });
  if (!existing) return res.status(404).json({ success: false, error: 'Campaign not found' });
  if (existing.status === 'Sent' || existing.status === 'Cancelled') {
    return res.status(409).json({ success: false, error: `Cannot edit campaign in status '${existing.status}'` });
  }
  const updated = await prisma.emailCampaign.update({ where: { id: req.params.id }, data: req.body });
  void emitAudit(req, 'emailCampaign.updated', 'EmailCampaign', updated.id, { module: 'marketing', payload: req.body });
  res.json({ success: true, data: updated });
}));
router.delete('/marketing/email-campaigns/:id', handle(async (req, res) => {
  await prisma.emailCampaign.delete({ where: { id: req.params.id } });
  void emitAudit(req, 'emailCampaign.deleted', 'EmailCampaign', req.params.id, { module: 'marketing' });
  res.json({ success: true });
}));

const CAMPAIGN_TRANSITIONS: Record<string, string[]> = {
  Draft: ['Scheduled', 'Sent', 'Cancelled'],
  Scheduled: ['Sent', 'Cancelled'],
  Sent: [],
  Cancelled: [],
};

router.post('/marketing/email-campaigns/:id/status', handle(async (req, res) => {
  const to = String(req.body?.status || '');
  if (!['Draft', 'Scheduled', 'Sent', 'Cancelled'].includes(to)) {
    return res.status(400).json({ success: false, error: 'Invalid status' });
  }
  const existing = await prisma.emailCampaign.findUnique({ where: { id: req.params.id } });
  if (!existing) return res.status(404).json({ success: false, error: 'Campaign not found' });
  if (existing.status === to) {
    return res.json({ success: true, data: existing, message: 'Status unchanged' });
  }
  const allowed = CAMPAIGN_TRANSITIONS[existing.status] || [];
  if (!allowed.includes(to)) {
    return res.status(409).json({
      success: false,
      error: `Cannot transition campaign from '${existing.status}' to '${to}'`,
      allowed,
    });
  }
  if (to === 'Sent') {
    // Reuse send handler body via redirect semantics — call send path
    return res.status(400).json({ success: false, error: 'Use POST .../send to move campaign to Sent' });
  }
  const data: any = { status: to };
  if (to === 'Scheduled' && req.body?.scheduledAt) data.scheduledAt = new Date(req.body.scheduledAt);
  const updated = await prisma.emailCampaign.update({ where: { id: existing.id }, data });
  void emitAudit(req, 'emailCampaign.status', 'EmailCampaign', updated.id, {
    module: 'marketing',
    payload: { from: existing.status, to },
  });
  res.json({ success: true, data: updated });
}));

/** Mark campaign sent and mint CRM leads for matching customer segment (best-effort). */
router.post('/marketing/email-campaigns/:id/send', handle(async (req, res) => {
  const existing = await prisma.emailCampaign.findUnique({ where: { id: req.params.id } });
  if (!existing) return res.status(404).json({ success: false, error: 'Campaign not found' });
  if (existing.status === 'Sent') return res.status(409).json({ success: false, error: 'Already sent' });
  if (existing.status === 'Cancelled') {
    return res.status(409).json({ success: false, error: `Cannot send from '${existing.status}'` });
  }
  const allowed = CAMPAIGN_TRANSITIONS[existing.status] || [];
  if (!allowed.includes('Sent')) {
    return res.status(409).json({ success: false, error: `Cannot send from '${existing.status}'`, allowed });
  }

  const segment = existing.segment || undefined;
  const customers = await prisma.customer.findMany({
    where: segment ? { segment } : {},
    take: 50,
  });
  const sentCount = Math.max(customers.length, 1);
  let leadsCreated = 0;
  for (const c of customers) {
    const exists = c.contactEmail
      ? await prisma.lead.findFirst({ where: { email: c.contactEmail, stage: { not: 'Converted' } } })
      : await prisma.lead.findFirst({ where: { company: c.name, stage: { not: 'Converted' } } });
    if (exists) continue;
    await prisma.lead.create({
      data: {
        company: c.name,
        contact: null,
        email: c.contactEmail || null,
        stage: 'Lead',
        value: 0,
        source: `campaign:${existing.name}`,
        notes: `From email campaign ${existing.name}`,
      },
    });
    leadsCreated += 1;
  }

  const updated = await prisma.emailCampaign.update({
    where: { id: existing.id },
    data: {
      status: 'Sent',
      sentAt: new Date(),
      sentCount,
      openCount: existing.openCount,
      clickCount: existing.clickCount,
    },
  });
  void emitAudit(req, 'emailCampaign.sent', 'EmailCampaign', updated.id, {
    module: 'marketing',
    payload: { from: existing.status, to: 'Sent', sentCount, leadsCreated },
  });
  eventBus.emitDomain('marketing.campaign.sent', { ...updated, sentCount, leadsCreated }, 'marketing');
  res.json({ success: true, data: updated, sentCount, leadsCreated });
}));

router.get('/marketing/social-posts', handle(async (_req, res) => {
  const data = await prisma.socialPost.findMany({ orderBy: { createdAt: 'desc' }, take: 200 });
  res.json({ success: true, data, total: data.length });
}));
router.get('/marketing/social-posts/:id', handle(async (req, res) => {
  const p = await prisma.socialPost.findUnique({ where: { id: req.params.id } });
  if (!p) return res.status(404).json({ success: false, error: 'Post not found' });
  res.json({ success: true, data: p });
}));
router.post('/marketing/social-posts', validateBody(SocialPostCreateSchema), handle(async (req, res) => {
  const p = await prisma.socialPost.create({ data: req.body });
  void emitAudit(req, 'socialPost.created', 'SocialPost', p.id, { module: 'marketing', payload: req.body });
  res.status(201).json({ success: true, data: p });
}));

const SOCIAL_TRANSITIONS: Record<string, string[]> = {
  Draft: ['Scheduled', 'Published', 'Cancelled'],
  Scheduled: ['Published', 'Cancelled'],
  Published: [],
  Cancelled: [],
};

router.patch('/marketing/social-posts/:id', validateBody(SocialPostUpdateSchema), handle(async (req, res) => {
  const existing = await prisma.socialPost.findUnique({ where: { id: req.params.id } });
  if (!existing) return res.status(404).json({ success: false, error: 'Post not found' });
  if (req.body?.status && req.body.status !== existing.status) {
    const allowed = SOCIAL_TRANSITIONS[existing.status] || [];
    if (!allowed.includes(req.body.status)) {
      return res.status(409).json({
        success: false,
        error: `Cannot transition post from '${existing.status}' to '${req.body.status}'`,
        allowed,
      });
    }
  }
  const updated = await prisma.socialPost.update({ where: { id: req.params.id }, data: req.body });
  void emitAudit(req, 'socialPost.updated', 'SocialPost', updated.id, {
    module: 'marketing',
    payload: { from: existing.status, to: updated.status, ...req.body },
  });
  res.json({ success: true, data: updated });
}));
router.delete('/marketing/social-posts/:id', handle(async (req, res) => {
  await prisma.socialPost.delete({ where: { id: req.params.id } });
  void emitAudit(req, 'socialPost.deleted', 'SocialPost', req.params.id, { module: 'marketing' });
  res.json({ success: true });
}));

// ── DOCUMENTS ───────────────────────────────────────────────────────
const DOC_NEXT: Record<string, string[]> = {
  Draft: ['Active', 'Archived'],
  Active: ['Signed', 'Expired', 'Archived'],
  Signed: ['Expired', 'Archived'],
  Expired: ['Archived'],
  Archived: [],
};
router.get('/documents', handle(async (req, res) => {
  const where: any = {};
  if (req.query.type) where.type = String(req.query.type);
  if (req.query.status) where.status = String(req.query.status);
  const data = await prisma.document.findMany({ where, orderBy: { createdAt: 'desc' }, take: 200 });
  res.json({ success: true, data, total: data.length });
}));
router.get('/documents/:id', handle(async (req, res) => {
  const d = await prisma.document.findUnique({ where: { id: req.params.id } });
  if (!d) return res.status(404).json({ success: false, error: 'Document not found' });
  res.json({ success: true, data: d });
}));
router.post('/documents', validateBody(DocumentCreateSchema), handle(async (req, res) => {
  const d = await prisma.document.create({ data: req.body });
  void emitAudit(req, 'document.created', 'Document', d.id, { module: 'documents', payload: req.body });
  eventBus.emitDomain('doc.created', d, 'documents');
  res.status(201).json({ success: true, data: d });
}));
router.patch('/documents/:id', validateBody(DocumentUpdateSchema), handle(async (req, res) => {
  const updated = await prisma.document.update({ where: { id: req.params.id }, data: req.body });
  void emitAudit(req, 'document.updated', 'Document', updated.id, { module: 'documents', payload: req.body });
  res.json({ success: true, data: updated });
}));
router.post('/documents/:id/status', handle(async (req, res) => {
  const to = String(req.body?.status || '');
  if (!['Draft', 'Active', 'Signed', 'Expired', 'Archived'].includes(to)) {
    return res.status(400).json({ success: false, error: 'Invalid status' });
  }
  const existing = await prisma.document.findUnique({ where: { id: req.params.id } });
  if (!existing) return res.status(404).json({ success: false, error: 'Document not found' });
  const allowed = DOC_NEXT[existing.status] || [];
  if (existing.status !== to && !allowed.includes(to)) {
    return res.status(409).json({ success: false, error: `Cannot transition from '${existing.status}' to '${to}'`, allowed });
  }
  const data: any = { status: to };
  if (to === 'Signed') data.signedAt = new Date();
  const updated = await prisma.document.update({ where: { id: existing.id }, data });
  void emitAudit(req, 'document.status', 'Document', updated.id, { module: 'documents', payload: { from: existing.status, to } });
  res.json({ success: true, data: updated });
}));
router.delete('/documents/:id', handle(async (req, res) => {
  await prisma.document.delete({ where: { id: req.params.id } });
  void emitAudit(req, 'document.deleted', 'Document', req.params.id, { module: 'documents' });
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
router.get('/notifications/:id', handle(async (req, res) => {
  const n = await prisma.notification.findUnique({ where: { id: req.params.id } });
  if (!n) return res.status(404).json({ success: false, error: 'Notification not found' });
  res.json({ success: true, data: n });
}));
router.post('/notifications', validateBody(NotificationCreateSchema), handle(async (req, res) => {
  const n = await prisma.notification.create({ data: req.body });
  void emitAudit(req, 'notification.created', 'Notification', n.id, { module: 'notifications', payload: req.body });
  eventBus.emitDomain('notify.created', n, 'notifications');
  res.status(201).json({ success: true, data: n });
}));
router.patch('/notifications/:id', validateBody(NotificationUpdateSchema), handle(async (req, res) => {
  const updated = await prisma.notification.update({ where: { id: req.params.id }, data: { ...req.body, readAt: req.body?.read ? new Date() : undefined } });
  void emitAudit(req, 'notification.updated', 'Notification', updated.id, { module: 'notifications', payload: req.body });
  res.json({ success: true, data: updated });
}));
router.post('/notifications/:id/read', handle(async (req, res) => {
  const existing = await prisma.notification.findUnique({ where: { id: req.params.id } });
  if (!existing) return res.status(404).json({ success: false, error: 'Notification not found' });
  const updated = await prisma.notification.update({
    where: { id: existing.id },
    data: { read: true, readAt: new Date() },
  });
  void emitAudit(req, 'notification.read', 'Notification', updated.id, { module: 'notifications' });
  res.json({ success: true, data: updated });
}));
router.delete('/notifications/:id', handle(async (req, res) => {
  await prisma.notification.delete({ where: { id: req.params.id } });
  void emitAudit(req, 'notification.deleted', 'Notification', req.params.id, { module: 'notifications' });
  res.json({ success: true });
}));

// ── AUDIT EVENTS ────────────────────────────────────────────────────
router.get('/audit-events', handle(async (req, res) => {
  const where: any = {};
  if (req.query.actorId) where.actorId = String(req.query.actorId);
  if (req.query.action) where.action = String(req.query.action);
  if (req.query.entity) where.entity = String(req.query.entity);
  if (req.query.module) where.module = String(req.query.module);
  const data = await prisma.auditEvent.findMany({ where, orderBy: { createdAt: 'desc' }, take: 500 });
  res.json({ success: true, data, total: data.length });
}));
router.get('/audit-events/:id', handle(async (req, res) => {
  const e = await prisma.auditEvent.findUnique({ where: { id: req.params.id } });
  if (!e) return res.status(404).json({ success: false, error: 'Audit event not found' });
  res.json({ success: true, data: e });
}));
router.post('/audit-events', validateBody(AuditEventCreateSchema), handle(async (req, res) => {
  const e = await prisma.auditEvent.create({ data: { ...req.body, ipAddress: req.ip, userAgent: req.get('user-agent') } });
  eventBus.emitDomain('audit.event.recorded', e, 'audit');
  res.status(201).json({ success: true, data: e });
}));

// ── ASSETS ──────────────────────────────────────────────────────────
router.get('/assets', handle(async (_req, res) => {
  const data = await prisma.asset.findMany({ include: { maintenances: { take: 5, orderBy: { performedAt: 'desc' } } }, orderBy: { createdAt: 'desc' }, take: 200 });
  res.json({ success: true, data, total: data.length });
}));
router.get('/assets/:id', handle(async (req, res) => {
  const a = await prisma.asset.findUnique({
    where: { id: req.params.id },
    include: { maintenances: { orderBy: { performedAt: 'desc' } } },
  });
  if (!a) return res.status(404).json({ success: false, error: 'Asset not found' });
  res.json({ success: true, data: a });
}));
router.post('/assets', validateBody(AssetCreateSchema), handle(async (req, res) => {
  const a = await prisma.asset.create({ data: req.body });
  void emitAudit(req, 'asset.created', 'Asset', a.id, { module: 'assets', payload: req.body });
  eventBus.emitDomain('asset.created', a, 'assets');
  res.status(201).json({ success: true, data: a });
}));
router.patch('/assets/:id', validateBody(AssetUpdateSchema), handle(async (req, res) => {
  const existing = await prisma.asset.findUnique({ where: { id: req.params.id } });
  if (!existing) return res.status(404).json({ success: false, error: 'Asset not found' });
  const updated = await prisma.asset.update({ where: { id: req.params.id }, data: req.body });
  void emitAudit(req, 'asset.updated', 'Asset', updated.id, {
    module: 'assets',
    payload: { from: existing.status, to: updated.status, ...req.body },
  });
  res.json({ success: true, data: updated });
}));
router.delete('/assets/:id', handle(async (req, res) => {
  await prisma.asset.delete({ where: { id: req.params.id } });
  void emitAudit(req, 'asset.deleted', 'Asset', req.params.id, { module: 'assets' });
  res.json({ success: true });
}));

router.get('/assets/:id/maintenance', handle(async (req, res) => {
  const data = await prisma.maintenanceLog.findMany({ where: { assetId: req.params.id }, orderBy: { performedAt: 'desc' } });
  res.json({ success: true, data, total: data.length });
}));
router.post('/assets/:id/maintenance', validateBody(MaintenanceLogCreateSchema), handle(async (req, res) => {
  const log = await prisma.maintenanceLog.create({ data: { ...req.body, assetId: req.params.id } });
  await prisma.asset.update({ where: { id: req.params.id }, data: { status: 'InMaintenance' } });
  void emitAudit(req, 'maintenanceLog.created', 'MaintenanceLog', log.id, { module: 'assets', payload: { ...req.body, assetId: req.params.id } });
  res.status(201).json({ success: true, data: log });
}));

export default router;
