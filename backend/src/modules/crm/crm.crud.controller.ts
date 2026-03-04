/**
 * CRM CRUD Controller
 * 
 * Customers:  POST/GET/PUT/DELETE /api/crm/customers
 * Leads:      POST/GET/PUT/DELETE /api/crm/leads
 * Campaigns:  POST/GET/PUT/DELETE /api/crm/campaigns
 * Summary:    GET /api/crm/summary
 */

import { Router, Request, Response } from 'express';
import { customersStore, leadsStore, campaignsStore } from '../../core/dataStore';

const router = Router();

// ── SUMMARY ─────────────────────────────────────────────────────────
router.get('/summary', (_req: Request, res: Response) => {
  const customers = customersStore.list({}, 1, 10000);
  const leads = leadsStore.list({}, 1, 10000);
  const campaigns = campaignsStore.list({}, 1, 10000);

  res.json({
    success: true,
    data: {
      totalCustomers: customers.total,
      totalLeads: leads.total,
      activeCampaigns: campaigns.data.filter(c => c.status === 'Active').length,
      totalLifetimeValue: customers.data.reduce((s, c) => s + (c.lifetimeValue || 0), 0),
      leadsByStage: {
        Lead: leads.data.filter(l => l.stage === 'Lead').length,
        Qualified: leads.data.filter(l => l.stage === 'Qualified').length,
        Proposal: leads.data.filter(l => l.stage === 'Proposal').length,
        Negotiation: leads.data.filter(l => l.stage === 'Negotiation').length,
      },
      conversionRate: campaigns.data.length > 0
        ? Math.round(campaigns.data.reduce((s, c) => s + (c.conversions || 0), 0) / Math.max(campaigns.data.reduce((s, c) => s + (c.leads || 0), 0), 1) * 100)
        : 0
    }
  });
});

// ── CUSTOMERS ────────────────────────────────────────────────────────
router.get('/customers', (req: Request, res: Response) => {
  const { segment, country, city, page, limit } = req.query;
  const result = customersStore.list({ segment, country, city }, Number(page) || 1, Number(limit) || 50);
  res.json({ success: true, ...result });
});

router.get('/customers/:id', (req: Request, res: Response) => {
  const customer = customersStore.get(req.params.id);
  if (!customer) return res.status(404).json({ success: false, error: 'Customer not found' });
  res.json({ success: true, data: customer });
});

router.post('/customers', (req: Request, res: Response) => {
  const { name, segment, country, city, contactEmail } = req.body;
  if (!name) return res.status(400).json({ success: false, error: 'name is required' });
  const customer = customersStore.create({
    name, segment: segment || 'Retail', country, city,
    creditRating: 'B', lifetimeValue: 0,
    contactEmail: contactEmail || ''
  }, 'crm.customer.created');
  res.status(201).json({ success: true, data: customer });
});

router.put('/customers/:id', (req: Request, res: Response) => {
  const updated = customersStore.update(req.params.id, req.body);
  if (!updated) return res.status(404).json({ success: false, error: 'Customer not found' });
  res.json({ success: true, data: updated });
});

router.delete('/customers/:id', (req: Request, res: Response) => {
  if (!customersStore.get(req.params.id)) return res.status(404).json({ success: false, error: 'Customer not found' });
  customersStore.delete(req.params.id);
  res.json({ success: true, message: 'Customer deleted' });
});

// ── LEADS ────────────────────────────────────────────────────────────
router.get('/leads', (req: Request, res: Response) => {
  const { stage, source, page, limit } = req.query;
  const result = leadsStore.list({ stage, source }, Number(page) || 1, Number(limit) || 50);
  res.json({ success: true, ...result });
});

router.get('/leads/:id', (req: Request, res: Response) => {
  const lead = leadsStore.get(req.params.id);
  if (!lead) return res.status(404).json({ success: false, error: 'Lead not found' });
  res.json({ success: true, data: lead });
});

router.post('/leads', (req: Request, res: Response) => {
  const { company, contact, email, stage, value, source } = req.body;
  if (!company) return res.status(400).json({ success: false, error: 'company is required' });
  const lead = leadsStore.create({
    company, contact, email, stage: stage || 'Lead',
    value: value || 0, source: source || 'Manual'
  }, 'crm.lead.created');
  res.status(201).json({ success: true, data: lead });
});

router.put('/leads/:id', (req: Request, res: Response) => {
  const updated = leadsStore.update(req.params.id, req.body);
  if (!updated) return res.status(404).json({ success: false, error: 'Lead not found' });
  res.json({ success: true, data: updated });
});

router.delete('/leads/:id', (req: Request, res: Response) => {
  if (!leadsStore.get(req.params.id)) return res.status(404).json({ success: false, error: 'Lead not found' });
  leadsStore.delete(req.params.id);
  res.json({ success: true, message: 'Lead deleted' });
});

// ── CAMPAIGNS ────────────────────────────────────────────────────────
router.get('/campaigns', (req: Request, res: Response) => {
  const { status, type, page, limit } = req.query;
  const result = campaignsStore.list({ status, type }, Number(page) || 1, Number(limit) || 50);
  res.json({ success: true, ...result });
});

router.post('/campaigns', (req: Request, res: Response) => {
  const { name, type, budget, startDate, endDate } = req.body;
  if (!name) return res.status(400).json({ success: false, error: 'name is required' });
  const campaign = campaignsStore.create({
    name, type: type || 'General', status: 'Active',
    budget: budget || 0, spent: 0, leads: 0, conversions: 0,
    startDate: startDate || new Date().toISOString().slice(0, 10),
    endDate: endDate || ''
  }, 'crm.campaign.launched');
  res.status(201).json({ success: true, data: campaign });
});

router.put('/campaigns/:id', (req: Request, res: Response) => {
  const updated = campaignsStore.update(req.params.id, req.body);
  if (!updated) return res.status(404).json({ success: false, error: 'Campaign not found' });
  res.json({ success: true, data: updated });
});

router.delete('/campaigns/:id', (req: Request, res: Response) => {
  if (!campaignsStore.get(req.params.id)) return res.status(404).json({ success: false, error: 'Campaign not found' });
  campaignsStore.delete(req.params.id);
  res.json({ success: true, message: 'Campaign deleted' });
});

export default router;
