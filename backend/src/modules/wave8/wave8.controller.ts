/**
 * HARVICS OS — Wave 8 Controller (Smart CRM with Groq AI)
 *
 * Routes:
 *   GET    /leads                  list + filter
 *   POST   /leads                  create
 *   GET    /leads/:id              lead detail
 *   PATCH  /leads/:id              update (+ stage-change CrmActivity)
 *   POST   /leads/:id/qualify      validate + set Qualified + CrmActivity
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
import { emitAudit } from '../../services/audit.service';
import { eventBus } from '../../core/eventBus';

export const wave8Router = Router();

function zerr(err: unknown, res: any) {
  if (err instanceof z.ZodError) return res.status(400).json({ success: false, error: 'validation', issues: err.issues });
  return null;
}

function getMarketContext(req: any) {
  const locale = String(req.headers['x-locale'] || req.headers['accept-language'] || 'en').split(',')[0].trim() || 'en';
  const country = String(req.headers['x-country'] || 'US').toUpperCase();
  const currency = String(req.headers['x-currency'] || 'USD').toUpperCase();
  const timezone = String(req.headers['x-timezone'] || 'UTC');
  return { locale, country, currency, timezone };
}

// ─── AI HEALTH ──────────────────────────────────────────────────────────────
wave8Router.get('/ai/health', async (req, res) => {
  const market = getMarketContext(req);
  res.json({ success: true, aiEnabled: aiEnabled(), provider: 'Groq', model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile', market });
});

// ─── LEADS ──────────────────────────────────────────────────────────────────
wave8Router.get('/leads', async (req, res) => {
  const where: any = {};
  if (req.query.stage) where.stage = String(req.query.stage);
  if (req.query.tier) where.aiTier = String(req.query.tier);
  if (req.query.ownerId) where.ownerId = String(req.query.ownerId);
  // Row scope: sales officers only see their own leads
  const role = (req as any).user?.role;
  const userId = (req as any).user?.id;
  if (role === 'sales_officer' && userId) where.ownerId = userId;
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
    const ownerId = b.ownerId || (req as any).user?.id || null;
    const row = await prisma.lead.create({ data: { ...b, email: b.email || null, ownerId } });
    void emitAudit(req, 'lead.created', 'Lead', row.id, { module: 'crm' });
    eventBus.emitDomain('crm.lead.created', row, 'crm');
    res.status(201).json({ success: true, data: row });
  } catch (e) { const z = zerr(e, res); if (z) return; res.status(500).json({ success: false, error: 'create failed' }); }
});

wave8Router.get('/leads/:id', async (req, res) => {
  const lead = await prisma.lead.findUnique({ where: { id: req.params.id } });
  if (!lead) return res.status(404).json({ success: false, error: 'Lead not found' });
  res.json({ success: true, data: lead });
});

wave8Router.patch('/leads/:id', async (req, res) => {
  const Body = z.object({
    company: z.string().min(1).optional(),
    contact: z.string().optional().nullable(),
    email: z.string().email().optional().nullable().or(z.literal('')),
    stage: z.enum(['Lead', 'Qualified', 'Proposal', 'Negotiation', 'Won', 'Lost', 'Converted']).optional(),
    value: z.number().nonnegative().optional(),
    source: z.string().optional().nullable(),
    notes: z.string().optional().nullable(),
  });
  try {
    const b = Body.parse(req.body);
    const existing = await prisma.lead.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ success: false, error: 'Lead not found' });
    const data: any = { ...b };
    if (b.email === '') data.email = null;
    const row = await prisma.lead.update({ where: { id: req.params.id }, data });
    if (b.stage && b.stage !== existing.stage) {
      await prisma.crmActivity.create({
        data: {
          type: 'note',
          subject: `Stage change: ${existing.stage} → ${b.stage}`,
          body: `Lead stage updated from ${existing.stage} to ${b.stage}`,
          leadId: row.id,
          ownerId: row.ownerId || (req as any).user?.id || null,
          occurredAt: new Date(),
          outcome: 'neutral',
        },
      }).catch(() => null);
    }
    void emitAudit(req, 'lead.updated', 'Lead', row.id, { module: 'crm', payload: { stage: row.stage, from: existing.stage } });
    if (row.stage === 'Won') {
      eventBus.emitDomain('crm.lead.won', row, 'crm');
    }
    res.json({ success: true, data: row });
  } catch (e: any) {
    const z = zerr(e, res); if (z) return;
    if (e?.code === 'P2025') return res.status(404).json({ success: false, error: 'Lead not found' });
    res.status(500).json({ success: false, error: 'update failed' });
  }
});

/** Qualify lead: require contact + email + value > 0, set stage Qualified, log CrmActivity */
wave8Router.post('/leads/:id/qualify', async (req, res) => {
  try {
    const lead = await prisma.lead.findUnique({ where: { id: req.params.id } });
    if (!lead) return res.status(404).json({ success: false, error: 'Lead not found' });
    if (lead.stage === 'Converted') return res.status(409).json({ success: false, error: 'Already converted' });
    if (lead.stage === 'Qualified') {
      return res.json({ success: true, data: lead, message: 'Already qualified' });
    }

    const missing: string[] = [];
    if (!lead.contact?.trim()) missing.push('contact');
    if (!lead.email?.trim()) missing.push('email');
    if (!(Number(lead.value) > 0)) missing.push('value');
    if (missing.length) {
      return res.status(400).json({
        success: false,
        error: `Cannot qualify — missing: ${missing.join(', ')}`,
        missing,
      });
    }

    const from = lead.stage;
    const row = await prisma.lead.update({
      where: { id: lead.id },
      data: { stage: 'Qualified' },
    });

    await prisma.crmActivity.create({
      data: {
        type: 'note',
        subject: `Stage change: ${from} → Qualified`,
        body: `Lead qualified (contact, email, value validated)`,
        leadId: row.id,
        ownerId: row.ownerId || (req as any).user?.id || null,
        occurredAt: new Date(),
        outcome: 'positive',
      },
    }).catch(() => null);

    void emitAudit(req, 'lead.qualified', 'Lead', row.id, { module: 'crm', payload: { from, to: 'Qualified' } });
    eventBus.emitDomain('crm.lead.qualified', row, 'crm');
    res.json({ success: true, data: row, message: `Qualified · ${from} → Qualified` });
  } catch (e: any) {
    res.status(500).json({ success: false, error: 'qualify failed' });
  }
});

wave8Router.post('/leads/:id/score', async (req, res) => {
  const market = getMarketContext(req);
  const lead = await prisma.lead.findUnique({ where: { id: req.params.id } });
  if (!lead) return res.status(404).json({ success: false, error: 'Lead not found' });
  const result = await scoreLead(lead, market);
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
  res.json({ success: true, data: updated, insight: result, market });
});

wave8Router.post('/leads/bulk-score', async (req, res) => {
  const market = getMarketContext(req);
  const leads = await prisma.lead.findMany({ where: { OR: [{ aiScoredAt: null }, { aiScoredAt: { lt: new Date(Date.now() - 24 * 3600_000) } }] }, take: 25 });
  const results = [];
  for (const lead of leads) {
    const r = await scoreLead(lead, market);
    await prisma.lead.update({ where: { id: lead.id }, data: { aiScore: r.score, aiTier: r.tier, aiScoredAt: new Date() } });
    results.push({ id: lead.id, company: lead.company, score: r.score, tier: r.tier });
  }
  res.json({ success: true, scored: results.length, aiEnabled: aiEnabled(), data: results, market });
});

wave8Router.post('/leads/:id/email-draft', async (req, res) => {
  const market = getMarketContext(req);
  const Body = z.object({
    purpose: z.enum(['follow_up', 'demo_request', 'objection_handle', 'thank_you']),
    context: z.string().optional(),
  });
  try {
    const b = Body.parse(req.body);
    const lead = await prisma.lead.findUnique({ where: { id: req.params.id } });
    if (!lead) return res.status(404).json({ success: false, error: 'Lead not found' });
    const draft = await draftEmail({ company: lead.company, contact: lead.contact, stage: lead.stage, value: lead.value, purpose: b.purpose, context: b.context }, market);
    const row = await prisma.crmEmailDraft.create({
      data: { leadId: lead.id, purpose: b.purpose, subject: draft.subject, body: draft.body, aiGenerated: draft.aiGenerated },
    });
    res.status(201).json({ success: true, data: row, aiGenerated: draft.aiGenerated, market });
  } catch (e) { const z = zerr(e, res); if (z) return; res.status(500).json({ success: false, error: 'draft failed' }); }
});

wave8Router.post('/leads/:id/convert', async (req, res) => {
  const lead = await prisma.lead.findUnique({ where: { id: req.params.id } });
  if (!lead) return res.status(404).json({ success: false, error: 'Lead not found' });
  if (lead.stage === 'Converted') return res.status(409).json({ success: false, error: 'Already converted' });

  // One commercial flow: Lead → Customer → Deal (linked)
  let customer = lead.email
    ? await prisma.customer.findFirst({ where: { contactEmail: lead.email } })
    : null;
  if (!customer) {
    customer = await prisma.customer.findFirst({ where: { name: lead.company } });
  }
  if (!customer) {
    customer = await prisma.customer.create({
      data: {
        name: lead.company,
        contactEmail: lead.email || null,
        segment: 'Prospect',
        creditRating: 'B',
        lifetimeValue: lead.value || 0,
      },
    });
  }

  const deal = await prisma.deal.create({
    data: {
      name: `${lead.company} — Deal`,
      customerId: customer.id,
      ownerId: lead.ownerId || (req as any).user?.id || null,
      stage: 'Qualified',
      value: lead.value,
      probability: lead.aiScore ?? 30,
      source: lead.source || 'wave8',
      notes: lead.notes,
    },
  });

  await prisma.lead.update({ where: { id: lead.id }, data: { stage: 'Converted' } });

  await prisma.crmActivity.create({
    data: {
      type: 'note',
      subject: 'Lead converted to customer + deal',
      body: `Created/linked customer ${customer.id} and deal ${deal.id}`,
      leadId: lead.id,
      dealId: deal.id,
      customerId: customer.id,
      ownerId: lead.ownerId || (req as any).user?.id || null,
      occurredAt: new Date(),
      outcome: 'positive',
    },
  }).catch(() => null);

  void emitAudit(req, 'lead.converted', 'Lead', lead.id, { module: 'crm', payload: { customerId: customer.id, dealId: deal.id } });
  eventBus.emitDomain('crm.lead.converted', { leadId: lead.id, company: lead.company, customer, deal }, 'crm');

  res.status(201).json({
    success: true,
    deal,
    customer,
    message: `Lead → Customer → Deal (AI probability ${lead.aiScore ?? 'n/a'})`,
  });
});

/** Bulk import from HarvyX (or any external lead list) into OS CRM */
wave8Router.post('/import/harvyx', async (req, res) => {
  const Body = z.object({
    leads: z.array(z.object({
      company: z.string().min(1),
      contact: z.string().optional().nullable(),
      email: z.string().email().optional().nullable().or(z.literal('')),
      value: z.number().nonnegative().optional(),
      notes: z.string().optional().nullable(),
      vertical: z.string().optional().nullable(),
      country: z.string().optional().nullable(),
      externalId: z.string().optional().nullable(),
    })).min(1).max(200),
  });
  try {
    const b = Body.parse(req.body);
    const ownerId = (req as any).user?.id || null;
    const created: any[] = [];
    const skipped: string[] = [];

    for (const row of b.leads) {
      const email = row.email || null;
      if (email) {
        const exists = await prisma.lead.findFirst({ where: { email, stage: { not: 'Converted' } } });
        if (exists) {
          skipped.push(email);
          continue;
        }
      }
      const lead = await prisma.lead.create({
        data: {
          company: row.company,
          contact: row.contact || null,
          email,
          stage: 'Lead',
          value: row.value || 0,
          source: 'harvyx',
          notes: [row.notes, row.vertical ? `Vertical: ${row.vertical}` : null, row.country ? `Country: ${row.country}` : null, row.externalId ? `HX:${row.externalId}` : null]
            .filter(Boolean)
            .join(' · ') || null,
          ownerId,
        },
      });
      created.push(lead);
    }

    res.status(201).json({
      success: true,
      imported: created.length,
      skipped: skipped.length,
      data: created,
      message: `Imported ${created.length} HarvyX leads (${skipped.length} skipped as duplicates)`,
    });
  } catch (e) {
    const z = zerr(e, res);
    if (z) return;
    res.status(500).json({ success: false, error: 'import failed' });
  }
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
  const market = getMarketContext(req);
  const lead = await prisma.lead.findUnique({ where: { id: req.params.id } });
  if (!lead) return res.status(404).json({ success: false, error: 'Lead not found' });
  const [activities, insights, drafts] = await Promise.all([
    prisma.crmActivity.findMany({ where: { leadId: lead.id }, orderBy: { occurredAt: 'desc' }, take: 100 }),
    prisma.crmAiInsight.findMany({ where: { leadId: lead.id }, orderBy: { createdAt: 'desc' }, take: 5 }),
    prisma.crmEmailDraft.findMany({ where: { leadId: lead.id }, orderBy: { createdAt: 'desc' }, take: 5 }),
  ]);
  const summary = await summariseActivities(activities.map(a => ({ type: a.type, note: a.subject + (a.body ? ' — ' + a.body : ''), at: a.occurredAt })), market);
  res.json({ success: true, lead, activities, insights, drafts, aiSummary: summary, market });
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
