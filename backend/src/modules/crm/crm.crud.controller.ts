/**
 * CRM CRUD Controller (Prisma-backed)
 * 
 * Customers:  POST/GET/PUT/DELETE /api/crm/customers
 * Leads:      POST/GET/PUT/DELETE /api/crm/leads
 * Campaigns:  POST/GET/PUT/DELETE /api/crm/campaigns
 * Summary:    GET /api/crm/summary
 * 
 * LOCALIZATION: All responses are locale-aware based on req.locale
 */

import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { customersDb, leadsDb, campaignsDb } from '../../core/db';
import { translateCustomerSegment, translateError, translateMessage, t } from '../../core/translate';
import '../../middleware/locale';

const router = Router();

// ── Zod schemas ─────────────────────────────────────────────────────
const CustomerCreateSchema = z.object({
  name: z.string().min(1).max(200),
  segment: z.string().max(50).optional(),
  country: z.string().max(80).optional(),
  city: z.string().max(120).optional(),
  contactEmail: z.string().email().optional().or(z.literal('')),
});

const LeadCreateSchema = z.object({
  company: z.string().min(1).max(200),
  contact: z.string().max(120).optional(),
  email: z.string().email().optional().or(z.literal('')),
  stage: z.enum(['Lead', 'Qualified', 'Proposal', 'Negotiation', 'Won', 'Lost']).optional(),
  value: z.number().nonnegative().max(1_000_000_000).optional(),
  source: z.string().max(80).optional(),
});

const CampaignCreateSchema = z.object({
  name: z.string().min(1).max(200),
  type: z.string().max(80).optional(),
  budget: z.number().nonnegative().max(1_000_000_000).optional(),
  startDate: z.string().max(30).optional(),
  endDate: z.string().max(30).optional(),
});

function validationError(res: Response, error: z.ZodError, locale: string) {
  return res.status(400).json({
    success: false,
    error: translateError('missingFields', locale),
    issues: error.issues.map(i => ({ path: i.path.join('.'), message: i.message }))
  });
}

// Helper to get locale
const getLocale = (req: Request): string => (req as any).locale || 'en';

// Helper to localize customer
const localizeCustomer = (customer: any, locale: string) => {
  if (!customer) return customer;
  return {
    ...customer,
    segmentText: translateCustomerSegment(customer.segment, locale),
  };
};

// ── SUMMARY ─────────────────────────────────────────────────────────
router.get('/summary', async (req: Request, res: Response) => {
  const locale = getLocale(req);
  const [customers, leads, campaigns] = await Promise.all([
    customersDb.list({}, 1, 10000),
    leadsDb.list({}, 1, 10000),
    campaignsDb.list({}, 1, 10000),
  ]);

  res.json({
    success: true,
    message: translateMessage('fetched', locale),
    data: {
      totalCustomers: customers.total,
      totalLeads: leads.total,
      activeCampaigns: campaigns.data.filter((c: any) => c.status === 'Active').length,
      totalLifetimeValue: customers.data.reduce((s: number, c: any) => s + (c.lifetimeValue || 0), 0),
      leadsByStage: {
        Lead: leads.data.filter((l: any) => l.stage === 'Lead').length,
        Qualified: leads.data.filter((l: any) => l.stage === 'Qualified').length,
        Proposal: leads.data.filter((l: any) => l.stage === 'Proposal').length,
        Negotiation: leads.data.filter((l: any) => l.stage === 'Negotiation').length,
      },
      conversionRate: campaigns.data.length > 0
        ? Math.round(campaigns.data.reduce((s: number, c: any) => s + (c.conversions || 0), 0) / Math.max(campaigns.data.reduce((s: number, c: any) => s + (c.leads || 0), 0), 1) * 100)
        : 0
    }
  });
});

// ── CUSTOMERS ────────────────────────────────────────────────────────
router.get('/customers', async (req: Request, res: Response) => {
  const locale = getLocale(req);
  const { segment, country, city, page, limit } = req.query;
  const result = await customersDb.list({ segment, country, city }, Number(page) || 1, Number(limit) || 50);
  const localizedData = result.data.map((c: any) => localizeCustomer(c, locale));
  res.json({ success: true, ...result, data: localizedData });
});

router.get('/customers/:id', async (req: Request, res: Response) => {
  const locale = getLocale(req);
  const customer = await customersDb.get(req.params.id);
  if (!customer) return res.status(404).json({ success: false, error: t('crm.messages.customerNotFound', locale) });
  res.json({ success: true, data: localizeCustomer(customer, locale) });
});

router.post('/customers', async (req: Request, res: Response) => {
  const locale = getLocale(req);
  const parsed = CustomerCreateSchema.safeParse(req.body || {});
  if (!parsed.success) return validationError(res, parsed.error, locale);
  const { name, segment, country, city, contactEmail } = parsed.data;
  const customer = await customersDb.create({
    name, segment: segment || 'Retail', country, city,
    creditRating: 'B', lifetimeValue: 0,
    contactEmail: contactEmail || ''
  }, 'crm.customer.created');
  res.status(201).json({ success: true, data: localizeCustomer(customer, locale), message: t('crm.messages.customerCreated', locale) });
});

router.put('/customers/:id', async (req: Request, res: Response) => {
  const locale = getLocale(req);
  const updated = await customersDb.update(req.params.id, req.body);
  if (!updated) return res.status(404).json({ success: false, error: t('crm.messages.customerNotFound', locale) });
  res.json({ success: true, data: localizeCustomer(updated, locale), message: t('crm.messages.customerUpdated', locale) });
});

router.delete('/customers/:id', async (req: Request, res: Response) => {
  const locale = getLocale(req);
  const exists = await customersDb.get(req.params.id);
  if (!exists) return res.status(404).json({ success: false, error: t('crm.messages.customerNotFound', locale) });
  await customersDb.delete(req.params.id);
  res.json({ success: true, message: t('crm.messages.customerDeleted', locale) });
});

// ── LEADS ────────────────────────────────────────────────────────────
router.get('/leads', async (req: Request, res: Response) => {
  const locale = getLocale(req);
  const { stage, source, page, limit } = req.query;
  const result = await leadsDb.list({ stage, source }, Number(page) || 1, Number(limit) || 50);
  res.json({ success: true, ...result });
});

router.get('/leads/:id', async (req: Request, res: Response) => {
  const locale = getLocale(req);
  const lead = await leadsDb.get(req.params.id);
  if (!lead) return res.status(404).json({ success: false, error: t('crm.messages.leadNotFound', locale) });
  res.json({ success: true, data: lead });
});

router.post('/leads', async (req: Request, res: Response) => {
  const locale = getLocale(req);
  const parsed = LeadCreateSchema.safeParse(req.body || {});
  if (!parsed.success) return validationError(res, parsed.error, locale);
  const { company, contact, email, stage, value, source } = parsed.data;
  const lead = await leadsDb.create({
    company, contact, email, stage: stage || 'Lead',
    value: value || 0, source: source || 'Manual'
  }, 'crm.lead.created');
  res.status(201).json({ success: true, data: lead, message: t('crm.messages.leadCreated', locale) });
});

router.put('/leads/:id', async (req: Request, res: Response) => {
  const locale = getLocale(req);
  const updated = await leadsDb.update(req.params.id, req.body);
  if (!updated) return res.status(404).json({ success: false, error: t('crm.messages.leadNotFound', locale) });
  res.json({ success: true, data: updated, message: t('crm.messages.leadUpdated', locale) });
});

router.delete('/leads/:id', async (req: Request, res: Response) => {
  const locale = getLocale(req);
  const exists = await leadsDb.get(req.params.id);
  if (!exists) return res.status(404).json({ success: false, error: t('crm.messages.leadNotFound', locale) });
  await leadsDb.delete(req.params.id);
  res.json({ success: true, message: t('crm.messages.leadDeleted', locale) });
});

// ── CAMPAIGNS ────────────────────────────────────────────────────────
router.get('/campaigns', async (req: Request, res: Response) => {
  const { status, type, page, limit } = req.query;
  const result = await campaignsDb.list({ status, type }, Number(page) || 1, Number(limit) || 50);
  res.json({ success: true, ...result });
});

router.post('/campaigns', async (req: Request, res: Response) => {
  const locale = getLocale(req);
  const parsed = CampaignCreateSchema.safeParse(req.body || {});
  if (!parsed.success) return validationError(res, parsed.error, locale);
  const { name, type, budget, startDate, endDate } = parsed.data;
  const campaign = await campaignsDb.create({
    name, type: type || 'General', status: 'Active',
    budget: budget || 0, spent: 0, leads: 0, conversions: 0,
    startDate: startDate || new Date().toISOString().slice(0, 10),
    endDate: endDate || ''
  }, 'crm.campaign.launched');
  res.status(201).json({ success: true, data: campaign, message: t('crm.messages.campaignCreated', locale) });
});

router.put('/campaigns/:id', async (req: Request, res: Response) => {
  const locale = getLocale(req);
  const updated = await campaignsDb.update(req.params.id, req.body);
  if (!updated) return res.status(404).json({ success: false, error: t('crm.messages.campaignNotFound', locale) });
  res.json({ success: true, data: updated, message: t('crm.messages.campaignUpdated', locale) });
});

router.delete('/campaigns/:id', async (req: Request, res: Response) => {
  const locale = getLocale(req);
  const exists = await campaignsDb.list({ id: req.params.id }, 1, 1);
  if (exists.total === 0) return res.status(404).json({ success: false, error: t('crm.messages.campaignNotFound', locale) });
  await campaignsDb.delete(req.params.id);
  res.json({ success: true, message: translateMessage('deleted', locale) });
});

// Root route — returns summary
router.get('/', async (req: Request, res: Response) => {
  const locale = getLocale(req);
  const [customers, leads, campaigns] = await Promise.all([
    customersDb.list({}, 1, 5),
    leadsDb.list({}, 1, 5),
    campaignsDb.list({}, 1, 5),
  ]);
  res.json({ success: true, message: translateMessage('fetched', locale), data: { customers: customers.data, leads: leads.data, campaigns: campaigns.data } });
});

export default router;
