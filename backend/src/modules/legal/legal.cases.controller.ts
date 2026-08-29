/**
 * Legal & Compliance — Module #39
 * Cases, IPR documents (Trademark/Patent/Counterfeit/Compliance), summary reporting
 */

import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../../core/prisma';
import { emitAudit } from '../../services/audit.service';
import { eventBus } from '../../core/eventBus';

const router = Router();

const CreateSchema = z.object({
  caseTitle: z.string().min(1),
  caseType: z.string().min(1),
  country: z.string().min(2).max(3),
  description: z.string().optional().nullable(),
  assignedTo: z.string().optional().nullable(),
  status: z.enum(['open', 'in-progress', 'closed', 'cancelled']).default('open'),
  hearingDate: z.coerce.date().optional().nullable(),
  documents: z.array(z.string()).optional().default([]),
});

const UpdateSchema = CreateSchema.partial();

const DocCreate = z.object({
  title: z.string().min(1),
  type: z.enum(['Trademark', 'Patent', 'Counterfeit', 'Compliance', 'Contract']),
  category: z.string().optional().nullable(),
  status: z.string().default('Active'),
  effectiveDate: z.string().optional().nullable(),
  expiryDate: z.string().optional().nullable(),
  metadata: z.record(z.any()).optional(),
});

const DocUpdate = DocCreate.partial();

async function listDocuments(type: string, limit = 200) {
  return prisma.document.findMany({
    where: { type },
    orderBy: { updatedAt: 'desc' },
    take: limit,
  });
}

router.get('/summary', async (_req, res) => {
  try {
    const [cases, trademarks, patents, counterfeit, contracts, compliance] = await Promise.all([
      prisma.legalCase.findMany(),
      listDocuments('Trademark'),
      listDocuments('Patent'),
      listDocuments('Counterfeit'),
      prisma.document.findMany({ where: { type: 'Contract' }, take: 500 }),
      listDocuments('Compliance'),
    ]);

    const activeCases = cases.filter((c) => c.status !== 'closed' && c.status !== 'cancelled');
    const closedCases = cases.filter((c) => c.status === 'closed');
    const pendingRenewals = [...trademarks, ...patents].filter((d) => {
      if (!d.expiryDate) return false;
      const exp = new Date(d.expiryDate).getTime();
      const days = (exp - Date.now()) / 86400000;
      return days > 0 && days <= 90;
    }).length;

    const complianceScores = compliance.map((c) => {
      const meta = (c.metadata as any) || {};
      return { country: meta.country || c.category || '—', score: meta.score ?? null };
    });
    const avgCompliance = complianceScores.filter((s) => s.score != null).length
      ? Math.round(complianceScores.reduce((s, x) => s + (x.score || 0), 0) / complianceScores.filter((s) => s.score != null).length)
      : null;

    res.json({
      success: true,
      data: {
        activeLitigations: activeCases.length,
        resolvedLitigations: closedCases.length,
        activeTrademarks: trademarks.filter((t) => t.status === 'Active').length,
        activePatents: patents.filter((p) => p.status === 'Active').length,
        pendingRenewals,
        activeContracts: contracts.filter((c) => c.status === 'Active').length,
        expiringContracts: contracts.filter((c) => {
          if (!c.expiryDate) return false;
          const days = (new Date(c.expiryDate).getTime() - Date.now()) / 86400000;
          return days > 0 && days <= 60;
        }).length,
        counterfeitOpen: counterfeit.filter((c) => c.status !== 'Resolved' && c.status !== 'Closed').length,
        counterfeitResolved: counterfeit.filter((c) => c.status === 'Resolved' || c.status === 'Closed').length,
        complianceScore: avgCompliance,
        iprRisk: pendingRenewals > 5 ? 'High' : pendingRenewals > 0 ? 'Medium' : 'Low',
        counterfeitRisk: counterfeit.filter((c) => c.status !== 'Resolved').length > 3 ? 'High' : 'Medium',
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || 'summary failed' });
  }
});

router.get('/reports/dashboard', async (_req, res) => {
  try {
    const summaryRes = await prisma.legalCase.groupBy({ by: ['status'], _count: true });
    const byCountry = await prisma.legalCase.groupBy({ by: ['country'], _count: true });
    res.json({
      success: true,
      data: {
        casesByStatus: summaryRes,
        casesByCountry: byCountry,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || 'report failed' });
  }
});

// ── Legal Cases ──────────────────────────────────────────────────────
router.get('/cases', async (req, res) => {
  try {
    const where: any = {};
    if (req.query.status) where.status = String(req.query.status);
    if (req.query.country) where.country = String(req.query.country).toUpperCase();
    const rows = await prisma.legalCase.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      take: Math.min(Number(req.query.limit) || 200, 500),
    });
    res.json({ success: true, data: rows, total: rows.length });
  } catch (err: any) {
    if (err?.code === 'P2021') {
      return res.status(503).json({ success: false, error: 'LegalCase table missing — apply prisma/manual/module_legal_cases_additive.sql' });
    }
    res.status(500).json({ success: false, error: err?.message || 'list failed' });
  }
});

router.get('/cases/:id', async (req, res) => {
  try {
    const row = await prisma.legalCase.findUnique({ where: { id: req.params.id } });
    if (!row) return res.status(404).json({ success: false, error: 'Case not found' });
    res.json({ success: true, data: row });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || 'get failed' });
  }
});

router.post('/cases', async (req: Request, res: Response) => {
  try {
    const b = CreateSchema.parse(req.body);
    const row = await prisma.legalCase.create({
      data: {
        caseTitle: b.caseTitle,
        caseType: b.caseType,
        country: b.country.toUpperCase(),
        description: b.description ?? null,
        assignedTo: b.assignedTo ?? null,
        status: b.status,
        hearingDate: b.hearingDate ?? null,
        documents: b.documents ?? [],
      },
    });
    void emitAudit(req, 'legalCase.created', 'LegalCase', row.id, { module: 'legal' });
    eventBus.emitDomain('legal.case.created', row, 'legal');
    res.status(201).json({ success: true, data: row });
  } catch (err: any) {
    if (err?.name === 'ZodError') return res.status(400).json({ success: false, error: 'Validation failed', details: err.errors });
    if (err?.code === 'P2021') return res.status(503).json({ success: false, error: 'LegalCase table missing' });
    res.status(500).json({ success: false, error: err?.message || 'create failed' });
  }
});

router.patch('/cases/:id', async (req: Request, res: Response) => {
  try {
    const b = UpdateSchema.parse(req.body);
    const existing = await prisma.legalCase.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ success: false, error: 'Case not found' });
    const row = await prisma.legalCase.update({
      where: { id: existing.id },
      data: {
        ...(b.caseTitle !== undefined ? { caseTitle: b.caseTitle } : {}),
        ...(b.caseType !== undefined ? { caseType: b.caseType } : {}),
        ...(b.country !== undefined ? { country: b.country.toUpperCase() } : {}),
        ...(b.description !== undefined ? { description: b.description } : {}),
        ...(b.assignedTo !== undefined ? { assignedTo: b.assignedTo } : {}),
        ...(b.status !== undefined ? { status: b.status } : {}),
        ...(b.hearingDate !== undefined ? { hearingDate: b.hearingDate } : {}),
        ...(b.documents !== undefined ? { documents: b.documents } : {}),
      },
    });
    void emitAudit(req, 'legalCase.updated', 'LegalCase', row.id, { module: 'legal' });
    res.json({ success: true, data: row });
  } catch (err: any) {
    if (err?.name === 'ZodError') return res.status(400).json({ success: false, error: 'Validation failed', details: err.errors });
    res.status(500).json({ success: false, error: err?.message || 'update failed' });
  }
});

const CASE_TRANSITIONS: Record<string, string[]> = {
  open: ['in-progress', 'cancelled'],
  'in-progress': ['closed', 'cancelled'],
  closed: [],
  cancelled: [],
};

router.post('/cases/:id/status', async (req: Request, res: Response) => {
  try {
    const body = z.object({ status: z.enum(['open', 'in-progress', 'closed', 'cancelled']) }).parse(req.body);
    const existing = await prisma.legalCase.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ success: false, error: 'Case not found' });
    if (!CASE_TRANSITIONS[existing.status]?.includes(body.status)) {
      return res.status(409).json({ success: false, error: `Cannot move '${existing.status}' → '${body.status}'` });
    }
    const row = await prisma.legalCase.update({ where: { id: existing.id }, data: { status: body.status } });
    void emitAudit(req, 'legalCase.status', 'LegalCase', row.id, {
      module: 'legal',
      payload: { from: existing.status, to: body.status },
    });
    res.json({ success: true, data: row });
  } catch (err: any) {
    if (err?.name === 'ZodError') return res.status(400).json({ success: false, error: 'Validation failed', details: err.errors });
    res.status(500).json({ success: false, error: err?.message || 'status failed' });
  }
});

router.delete('/cases/:id', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.legalCase.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ success: false, error: 'Case not found' });
    await prisma.legalCase.delete({ where: { id: existing.id } });
    void emitAudit(req, 'legalCase.deleted', 'LegalCase', existing.id, { module: 'legal' });
    res.json({ success: true, message: 'Case deleted' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || 'delete failed' });
  }
});

// ── IPR / Compliance documents (Document model) ─────────────────────
router.get('/ipr/:docType', async (req, res) => {
  const typeMap: Record<string, string> = {
    trademarks: 'Trademark',
    patents: 'Patent',
    counterfeit: 'Counterfeit',
    compliance: 'Compliance',
    contracts: 'Contract',
  };
  const docType = typeMap[req.params.docType];
  if (!docType) return res.status(400).json({ success: false, error: 'Invalid docType' });
  try {
    const rows = await listDocuments(docType);
    res.json({ success: true, data: rows, total: rows.length });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || 'list failed' });
  }
});

router.post('/ipr/:docType', async (req: Request, res: Response) => {
  const typeMap: Record<string, string> = {
    trademarks: 'Trademark',
    patents: 'Patent',
    counterfeit: 'Counterfeit',
    compliance: 'Compliance',
    contracts: 'Contract',
  };
  const docType = typeMap[req.params.docType];
  if (!docType) return res.status(400).json({ success: false, error: 'Invalid docType' });
  try {
    const b = DocCreate.parse({ ...req.body, type: docType });
    const row = await prisma.document.create({ data: b as any });
    void emitAudit(req, 'legalDocument.created', 'Document', row.id, { module: 'legal', payload: { type: docType } });
    res.status(201).json({ success: true, data: row });
  } catch (err: any) {
    if (err?.name === 'ZodError') return res.status(400).json({ success: false, error: 'Validation failed', details: err.errors });
    res.status(500).json({ success: false, error: err?.message || 'create failed' });
  }
});

router.patch('/ipr/:docType/:id', async (req: Request, res: Response) => {
  try {
    const b = DocUpdate.parse(req.body);
    const existing = await prisma.document.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ success: false, error: 'Document not found' });
    const row = await prisma.document.update({ where: { id: existing.id }, data: b as any });
    void emitAudit(req, 'legalDocument.updated', 'Document', row.id, { module: 'legal' });
    res.json({ success: true, data: row });
  } catch (err: any) {
    if (err?.name === 'ZodError') return res.status(400).json({ success: false, error: 'Validation failed', details: err.errors });
    res.status(500).json({ success: false, error: err?.message || 'update failed' });
  }
});

router.delete('/ipr/:docType/:id', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.document.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ success: false, error: 'Document not found' });
    await prisma.document.delete({ where: { id: existing.id } });
    void emitAudit(req, 'legalDocument.deleted', 'Document', existing.id, { module: 'legal' });
    res.json({ success: true, message: 'Document deleted' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || 'delete failed' });
  }
});

export default router;
