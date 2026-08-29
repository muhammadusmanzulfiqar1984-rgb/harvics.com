/**
 * Module #72 — Executive Intelligence
 * GET  /api/executive/dashboard
 * GET  /api/executive/reports/summary
 * GET  /api/executive/snapshots
 * POST /api/executive/snapshots
 * GET/POST/PATCH/DELETE /api/executive/goals
 */

import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../../core/prisma';
import { emitAudit } from '../../services/audit.service';
import { eventBus } from '../../core/eventBus';
import { buildExecutiveDashboard } from './executive.live';

const router = Router();

router.get('/dashboard', async (_req: Request, res: Response) => {
  try {
    const data = await buildExecutiveDashboard();
    return res.json({ success: true, data, source: 'live' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message || 'dashboard failed' });
  }
});

router.get('/reports/summary', async (_req: Request, res: Response) => {
  try {
    const dash = await buildExecutiveDashboard();
    return res.json({
      success: true,
      data: {
        period: new Date().toISOString().slice(0, 7),
        kpis: dash.kpis,
        alertCount: dash.alerts.length,
        goals: dash.goals,
        generatedAt: dash.generatedAt,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message || 'report failed' });
  }
});

router.get('/snapshots', async (req: Request, res: Response) => {
  try {
    const take = Math.min(Number(req.query.limit) || 20, 100);
    const rows = await prisma.executiveSnapshot.findMany({
      orderBy: { generatedAt: 'desc' },
      take,
    });
    return res.json({ success: true, data: rows, total: rows.length });
  } catch (err: any) {
    if (err?.code === 'P2021') {
      return res.json({ success: true, data: [], total: 0, note: 'ExecutiveSnapshot table not migrated yet' });
    }
    return res.status(500).json({ success: false, error: err?.message || 'list failed' });
  }
});

router.get('/snapshots/:id', async (req: Request, res: Response) => {
  try {
    const row = await prisma.executiveSnapshot.findUnique({ where: { id: req.params.id } });
    if (!row) return res.status(404).json({ success: false, error: 'Snapshot not found' });
    return res.json({ success: true, data: row });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message || 'get failed' });
  }
});

const SnapshotCreate = z.object({
  period: z.string().min(4),
  periodType: z.enum(['weekly', 'monthly', 'quarterly']).default('weekly'),
});

router.post('/snapshots', async (req: Request, res: Response) => {
  try {
    const body = SnapshotCreate.parse(req.body);
    const dash = await buildExecutiveDashboard();
    const row = await prisma.executiveSnapshot.create({
      data: {
        period: body.period,
        periodType: body.periodType,
        kpis: dash as any,
        generatedBy: (req as any).user?.id ?? null,
      },
    });
    void emitAudit(req, 'executive.snapshot.created', 'ExecutiveSnapshot', row.id, { module: 'executive' });
    eventBus.emitDomain('executive.snapshot.created', row, 'executive');
    return res.status(201).json({ success: true, data: row });
  } catch (err: any) {
    if (err?.name === 'ZodError') {
      return res.status(400).json({ success: false, error: 'Validation failed', details: err.errors });
    }
    if (err?.code === 'P2021') {
      return res.status(503).json({
        success: false,
        error: 'ExecutiveSnapshot table missing — apply prisma/manual/module_72_executive_additive.sql',
      });
    }
    return res.status(500).json({ success: false, error: err?.message || 'create failed' });
  }
});

const GoalCreate = z.object({
  title: z.string().min(1),
  metric: z.string().min(1),
  targetValue: z.number(),
  currentValue: z.number().optional().default(0),
  unit: z.string().default('USD'),
  period: z.string().min(4),
  status: z.enum(['active', 'achieved', 'at_risk', 'cancelled']).default('active'),
  notes: z.string().optional().nullable(),
});

const GoalUpdate = GoalCreate.partial();

router.get('/goals', async (req: Request, res: Response) => {
  try {
    const where: any = {};
    if (req.query.period) where.period = String(req.query.period);
    if (req.query.status) where.status = String(req.query.status);
    const rows = await prisma.executiveGoal.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      take: Math.min(Number(req.query.limit) || 100, 200),
    });
    return res.json({ success: true, data: rows, total: rows.length });
  } catch (err: any) {
    if (err?.code === 'P2021') {
      return res.json({ success: true, data: [], total: 0, note: 'ExecutiveGoal table not migrated yet' });
    }
    return res.status(500).json({ success: false, error: err?.message || 'list failed' });
  }
});

router.get('/goals/:id', async (req: Request, res: Response) => {
  try {
    const row = await prisma.executiveGoal.findUnique({ where: { id: req.params.id } });
    if (!row) return res.status(404).json({ success: false, error: 'Goal not found' });
    return res.json({ success: true, data: row });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message || 'get failed' });
  }
});

router.post('/goals', async (req: Request, res: Response) => {
  try {
    const body = GoalCreate.parse(req.body);
    const row = await prisma.executiveGoal.create({
      data: {
        ...body,
        ownerId: (req as any).user?.id ?? null,
      },
    });
    void emitAudit(req, 'executiveGoal.created', 'ExecutiveGoal', row.id, { module: 'executive' });
    eventBus.emitDomain('executive.goal.created', row, 'executive');
    return res.status(201).json({ success: true, data: row });
  } catch (err: any) {
    if (err?.name === 'ZodError') {
      return res.status(400).json({ success: false, error: 'Validation failed', details: err.errors });
    }
    if (err?.code === 'P2021') {
      return res.status(503).json({
        success: false,
        error: 'ExecutiveGoal table missing — apply prisma/manual/module_72_executive_goals_additive.sql',
      });
    }
    return res.status(500).json({ success: false, error: err?.message || 'create failed' });
  }
});

router.patch('/goals/:id', async (req: Request, res: Response) => {
  try {
    const body = GoalUpdate.parse(req.body);
    const existing = await prisma.executiveGoal.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ success: false, error: 'Goal not found' });
    const row = await prisma.executiveGoal.update({ where: { id: existing.id }, data: body });
    void emitAudit(req, 'executiveGoal.updated', 'ExecutiveGoal', row.id, { module: 'executive' });
    return res.json({ success: true, data: row });
  } catch (err: any) {
    if (err?.name === 'ZodError') {
      return res.status(400).json({ success: false, error: 'Validation failed', details: err.errors });
    }
    return res.status(500).json({ success: false, error: err?.message || 'update failed' });
  }
});

router.delete('/goals/:id', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.executiveGoal.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ success: false, error: 'Goal not found' });
    await prisma.executiveGoal.delete({ where: { id: existing.id } });
    void emitAudit(req, 'executiveGoal.deleted', 'ExecutiveGoal', existing.id, { module: 'executive' });
    return res.json({ success: true, message: 'Goal deleted' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message || 'delete failed' });
  }
});

export default router;
