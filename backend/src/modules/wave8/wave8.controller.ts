/**
 * HARVICS OS — Wave 8 Controller (Smart CRM with Groq AI)
 *
 * Routes:
 *   GET    /leads                  list + filter
 *   POST   /leads                  create
 *   POST   /leads/:id/score        AI lead scoring (Groq)
 *   POST   /leads/bulk-score       score all unscored leads
 *   POST   /leads/:id/email-draft  AI email draft
 *   POST   /leads/:id/convert      convert lead → deal
 *   POST   /activities             log an activity
 *   GET    /activities             list activities (filter by lead/deal)
 *   GET    /leads/:id/timeline     full timeline + AI summary
 *   GET    /pipeline               pipeline metrics
 *   GET    /ai/health              probe Groq connectivity
 */
import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../core/prisma';
import { aiEnabled, scoreLead, draftEmail, summariseActivities } from '../../services/aiService';

export const wave8Router = Router();

function zerr(err: unknown, res: any) {
  if (err instanceof z.ZodError) return res.status(400).json({ success: false, error: 'validation', issues: err.issues });
  return null;
}

// ─── AI HEALTH ──────────────────────────────────────────────────────────────
wave8Router.get('/ai/health', async (_req, res) => {
  res.json({ success: true, aiEnabled: aiEnabled(), provider: 'Groq', model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile' });
});

// ─── LEADS ──────────────────────────────────────────────────────────────────
wave8Router.get('/leads', async (req, res) => {
  const where: any = {};
  if (req.query.stage) where.stage = String(req.query.stage);
  if (req.query.tier) where.aiTier = String(req.query.tier);
  if (req.query.ownerId) where.ownerId = String(req.query.ownerId);
  const rows = await prisma.lead.findMany({ where, orderBy: [{ aiScore: 'desc' }, { createdAt: 'desc' }], take: 200 });
  res.json({ success: true, data: rows, total: rows.length });
});

wave8Router.post('/leads', async (req, res) => {
  const Body = z.object({
    company: z.string().min(1),
    contact: z.string().optional().nullable(),
    email: z.string().email().optional().nullable().or(z.literal('')),
    stage: z.string().default('Lead'),
    value: z.number().nonnegative().default(0),
    source: z.string().optional().nullable(),
    notes: z.string().optional().nullable(),
    ownerId: z.string().optional().nullable(),
  });
  try {
    const b = Body.parse(req.body);
    const row = await prisma.lead.create({ data: { ...b, email: b.email || null } });
    res.status(201).json({ success: true, data: row });
  } catch (e) { const z = zerr(e, res); if (z) return; res.status(500).json({ success: false, error: 'create failed' }); }
});

wave8Router.post('/leads/:id/score', async (req, res) => {
  const lead = await prisma.lead.findUnique({ where: { id: req.params.id } });
  if (!lead) return res.status(404).json({ success: false, error: 'Lead not found' });
  const result = await scoreLead(lead);
  const updated = await prisma.lead.update({
    where: { id: lead.id },
    data: { aiScore: result.score, aiTier: result.tier, aiScoredAt: new Date() },
  });
  await prisma.crmAiInsight.create({
    data: {
      leadId: lead.id,
      score: result.score,
      tier: result.tier,
      reasoning: result.reasoning,
      nextAction: result.nextAction,
      aiGenerated: result.aiGenerated,
      modelName: result.aiGenerated ? (process.env.GROQ_MODEL || 'groq') : 'heuristic',
    },
  });
  res.json({ success: true, data: updated, insight: result });
});

wave8Router.post('/leads/bulk-score', async (_req, res) => {
  const leads = await prisma.lead.findMany({ where: { OR: [{ aiScoredAt: null }, { aiScoredAt: { lt: new Date(Date.now() - 24 * 3600_000) } }] }, take: 25 });
  const results = [];
  for (const lead of leads) {
    const r = await scoreLead(lead);
    await prisma.lead.update({ where: { id: lead.id }, data: { aiScore: r.score, aiTier: r.tier, aiScoredAt: new Date() } });
    results.push({ id: lead.id, company: lead.company, score: r.score, tier: r.tier });
  }
  res.json({ success: true, scored: results.length, aiEnabled: aiEnabled(), data: results });
});

wave8Router.post('/leads/:id/email-draft', async (req, res) => {
  const Body = z.object({
    purpose: z.enum(['follow_up', 'demo_request', 'objection_handle', 'thank_you']),
    context: z.string().optional(),
  });
  try {
    const b = Body.parse(req.body);
    const lead = await prisma.lead.findUnique({ where: { id: req.params.id } });
    if (!lead) return res.status(404).json({ success: false, error: 'Lead not found' });
    const draft = await draftEmail({ company: lead.company, contact: lead.contact, stage: lead.stage, value: lead.value, purpose: b.purpose, context: b.context });
    const row = await prisma.crmEmailDraft.create({
      data: { leadId: lead.id, purpose: b.purpose, subject: draft.subject, body: draft.body, aiGenerated: draft.aiGenerated },
    });
    res.status(201).json({ success: true, data: row, aiGenerated: draft.aiGenerated });
  } catch (e) { const z = zerr(e, res); if (z) return; res.status(500).json({ success: false, error: 'draft failed' }); }
});

wave8Router.post('/leads/:id/convert', async (req, res) => {
  const lead = await prisma.lead.findUnique({ where: { id: req.params.id } });
  if (!lead) return res.status(404).json({ success: false, error: 'Lead not found' });
  if (lead.stage === 'Converted') return res.status(409).json({ success: false, error: 'Already converted' });
  const deal = await prisma.deal.create({
    data: {
      name: `${lead.company} — Deal`,
      ownerId: lead.ownerId,
      stage: 'Qualified',
      value: lead.value,
      probability: lead.aiScore ?? 30,
      source: lead.source,
      notes: lead.notes,
    },
  });
  await prisma.lead.update({ where: { id: lead.id }, data: { stage: 'Converted' } });
  res.status(201).json({ success: true, deal, message: `Lead → Deal (probability seeded from AI score: ${lead.aiScore ?? 'n/a'})` });
});

// ─── ACTIVITIES ─────────────────────────────────────────────────────────────
wave8Router.post('/activities', async (req, res) => {
  const Body = z.object({
    type: z.enum(['call', 'email', 'meeting', 'note', 'task', 'demo']),
    subject: z.string().min(1),
    body: z.string().optional().nullable(),
    outcome: z.enum(['positive', 'neutral', 'negative', 'no_show']).optional().nullable(),
    leadId: z.string().optional().nullable(),
    dealId: z.string().optional().nullable(),
    customerId: z.string().optional().nullable(),
    contactId: z.string().optional().nullable(),
    ownerId: z.string().optional().nullable(),
  });
  try {
    const b = Body.parse(req.body);
    if (!b.leadId && !b.dealId && !b.customerId) return res.status(400).json({ success: false, error: 'Provide leadId, dealId, or customerId' });
    const row = await prisma.crmActivity.create({ data: { ...b, occurredAt: new Date() } });
    res.status(201).json({ success: true, data: row });
  } catch (e) { const z = zerr(e, res); if (z) return; res.status(500).json({ success: false, error: 'create failed' }); }
});

wave8Router.get('/activities', async (req, res) => {
  const where: any = {};
  for (const k of ['leadId', 'dealId', 'customerId', 'type']) if (req.query[k]) where[k] = String(req.query[k]);
  const rows = await prisma.crmActivity.findMany({ where, orderBy: { occurredAt: 'desc' }, take: 200 });
  res.json({ success: true, data: rows, total: rows.length });
});

wave8Router.get('/leads/:id/timeline', async (req, res) => {
  const lead = await prisma.lead.findUnique({ where: { id: req.params.id } });
  if (!lead) return res.status(404).json({ success: false, error: 'Lead not found' });
  const [activities, insights, drafts] = await Promise.all([
    prisma.crmActivity.findMany({ where: { leadId: lead.id }, orderBy: { occurredAt: 'desc' }, take: 100 }),
    prisma.crmAiInsight.findMany({ where: { leadId: lead.id }, orderBy: { createdAt: 'desc' }, take: 5 }),
    prisma.crmEmailDraft.findMany({ where: { leadId: lead.id }, orderBy: { createdAt: 'desc' }, take: 5 }),
  ]);
  const summary = await summariseActivities(activities.map(a => ({ type: a.type, note: a.subject + (a.body ? ' — ' + a.body : ''), at: a.occurredAt })));
  res.json({ success: true, lead, activities, insights, drafts, aiSummary: summary });
});

// ─── PIPELINE METRICS ───────────────────────────────────────────────────────
wave8Router.get('/pipeline', async (_req, res) => {
  const [leads, deals, tiers] = await Promise.all([
    prisma.lead.groupBy({ by: ['stage'], _count: { _all: true }, _sum: { value: true } }),
    prisma.deal.groupBy({ by: ['stage'], _count: { _all: true }, _sum: { value: true } }),
    prisma.lead.groupBy({ by: ['aiTier'], _count: { _all: true } }),
  ]);
  const totalLeadValue = leads.reduce((s, r) => s + (r._sum.value || 0), 0);
  const totalDealValue = deals.reduce((s, r) => s + (r._sum.value || 0), 0);
  res.json({
    success: true,
    data: {
      leads: leads.map(r => ({ stage: r.stage, count: r._count._all, value: r._sum.value || 0 })),
      deals: deals.map(r => ({ stage: r.stage, count: r._count._all, value: r._sum.value || 0 })),
      aiTiers: tiers.filter(t => t.aiTier).map(r => ({ tier: r.aiTier, count: r._count._all })),
      totals: { totalLeadValue, totalDealValue, totalPipelineValue: totalLeadValue + totalDealValue },
    },
  });
});
