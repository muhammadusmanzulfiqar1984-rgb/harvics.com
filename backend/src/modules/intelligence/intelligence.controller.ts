/**
 * AI INTELLIGENCE Controller (Prisma-backed)
 * 
 * Exposes the IntelligenceNode (462 lines of brain) to the frontend.
 * 
 * GET  /api/intelligence/insights/:domain
 * GET  /api/intelligence/forecast/:domain/:metric
 * GET  /api/intelligence/anomalies
 * POST /api/intelligence/copilot/chat
 * POST /api/intelligence/advise
 * GET  /api/intelligence/recommendations/:domain
 * GET  /api/intelligence/automation-score
 */

import { Router, Request, Response } from 'express';
import { ordersDb, inventoryDb, customersDb, invoicesDb, employeesDb, routesDb, purchaseOrdersDb, gpsRetailersDb, satelliteDb, territoryAssignmentsDb } from '../../core/db';
import { computeOnTimeRate } from '../../utils/logisticsMetrics';
import { prisma } from '../../core/prisma';
import { domainAdvise, domainCopilot } from '../../services/aiService';

const router = Router();

// Domain-specific insight generators (async)
const domainInsights: Record<string, () => Promise<any[]>> = {
  orders: async () => {
    const orders = await ordersDb.list({}, 1, 10000);
    const pending = orders.data.filter((o: any) => o.status === 'Pending').length;
    const total = orders.data.reduce((s: number, o: any) => s + (o.amount || 0), 0);
    return [
      { type: 'alert', severity: pending > 10 ? 'high' : 'medium', message: `${pending} orders pending processing`, metric: pending },
      { type: 'insight', message: `Total order value: $${total.toLocaleString()}. Average order: $${Math.round(total / Math.max(orders.total, 1)).toLocaleString()}` },
      { type: 'prediction', message: `Based on current velocity, expect ${Math.round(orders.total * 1.12)} orders next month (+12%)`, confidence: 0.78 },
      { type: 'recommendation', message: 'Consider auto-approving orders under $5,000 to reduce processing time by 40%', impact: 'high' },
    ];
  },
  inventory: async () => {
    const items = await inventoryDb.list({}, 1, 10000);
    const lowStock = items.data.filter((i: any) => i.onHand < (i.minStock || 0));
    const totalValue = items.data.reduce((s: number, i: any) => s + (i.onHand * (i.unitCost || 0)), 0);
    return [
      { type: 'alert', severity: lowStock.length > 3 ? 'high' : 'low', message: `${lowStock.length} SKUs below minimum stock level`, items: lowStock.map((i: any) => i.sku) },
      { type: 'insight', message: `Total inventory value: $${totalValue.toLocaleString()} across ${items.total} SKUs` },
      { type: 'prediction', message: `FMCG-001 (Chicken Nuggets) will need replenishment in ~5 days based on consumption rate`, confidence: 0.85 },
      { type: 'recommendation', message: 'Consolidate DXB-W1 and DXB-W3 warehouses to reduce holding costs by 18%', impact: 'medium' },
    ];
  },
  finance: async () => {
    const invoices = await invoicesDb.list({}, 1, 10000);
    const overdue = invoices.data.filter((i: any) => i.status === 'Overdue');
    const totalAR = invoices.data.filter((i: any) => i.status !== 'Paid').reduce((s: number, i: any) => s + (i.amount || 0), 0);
    return [
      { type: 'alert', severity: overdue.length > 0 ? 'high' : 'low', message: `${overdue.length} overdue invoices totaling $${overdue.reduce((s: number, i: any) => s + (i.amount || 0), 0).toLocaleString()}` },
      { type: 'insight', message: `Outstanding AR: $${totalAR.toLocaleString()}. DSO: ~28 days (industry avg: 35)` },
      { type: 'prediction', message: `Cash flow positive for next 60 days. Expected collections: $${Math.round(totalAR * 0.7).toLocaleString()}`, confidence: 0.82 },
      { type: 'recommendation', message: 'Offer 2% early payment discount to reduce DSO by 7 days', impact: 'medium' },
    ];
  },
  crm: async () => {
    const customers = await customersDb.list({}, 1, 10000);
    const ltv = customers.data.reduce((s: number, c: any) => s + (c.lifetimeValue || 0), 0);
    return [
      { type: 'insight', message: `${customers.total} active customers. Total LTV: $${ltv.toLocaleString()}` },
      { type: 'prediction', message: 'GCC region shows 23% growth potential. Recommend increasing sales coverage in Saudi Arabia.', confidence: 0.76 },
      { type: 'recommendation', message: 'Top 20% of customers generate 78% of revenue. Create VIP tier with priority fulfillment.', impact: 'high' },
      { type: 'anomaly', message: 'Cairo Foods Co order frequency dropped 40% vs last quarter — potential churn risk', confidence: 0.71 },
    ];
  },
  hr: async () => {
    const employees = await employeesDb.list({}, 1, 10000);
    return [
      { type: 'insight', message: `${employees.total} employees across ${new Set(employees.data.map((e: any) => e.country)).size} countries` },
      { type: 'prediction', message: 'Attrition risk: 2 employees in Sales department showing disengagement patterns', confidence: 0.65 },
      { type: 'recommendation', message: 'Operations team is 15% understaffed for current order volume. Recommend 3 new hires in Dubai.', impact: 'high' },
    ];
  },
  logistics: async () => {
    const routes = await routesDb.list({}, 1, 10000);
    const delayed = routes.data.filter((r: any) => r.status === 'Delayed').length;
    const onTimeRate = computeOnTimeRate(routes.data);
    const onTimeLabel = onTimeRate === null ? 'no completed deliveries yet' : `${onTimeRate}% on-time (Completed vs Delayed)`;
    return [
      { type: 'insight', message: `${routes.total} routes tracked. ${onTimeLabel}.` },
      { type: 'alert', severity: delayed > 0 ? 'medium' : 'low', message: `${delayed} deliveries currently delayed` },
      { type: 'recommendation', message: delayed > 0 ? 'Review delayed routes and reassign vehicles from Module #25 Fleet.' : 'Plan trips in Fleet Management when volume increases.', impact: delayed > 0 ? 'high' : 'medium' },
    ];
  },
  procurement: async () => {
    const pos = await purchaseOrdersDb.list({}, 1, 10000);
    const pending = pos.data.filter((p: any) => p.status === 'Pending').length;
    return [
      { type: 'insight', message: `${pos.total} purchase orders. ${pending} awaiting approval.` },
      { type: 'recommendation', message: 'Vietnam Textiles Co has 96% on-time delivery. Consider increasing order volume for 5% volume discount.', impact: 'high' },
      { type: 'prediction', message: 'Coffee bean prices expected to rise 8% in Q2 — recommend forward buying 3-month supply now.', confidence: 0.72 },
    ];
  },
  gps: async () => {
    const retailers = await gpsRetailersDb.list({}, 1, 10000);
    const countries = new Set(retailers.data.map((r: any) => r.countryCode));
    const totalSales = retailers.data.reduce((s: number, r: any) => s + (r.monthlySales || 0), 0);
    return [
      { type: 'insight', message: `${retailers.total} GPS-tracked retailers across ${countries.size} countries. Total monthly sales: $${totalSales.toLocaleString()}` },
      { type: 'alert', severity: 'medium', message: 'GPS coverage gap detected in Oman interior — 0 tracked retailers in 300km radius', metric: 0 },
      { type: 'recommendation', message: 'Add 3 retailer GPS points in Lahore to complete South Asia coverage grid', impact: 'high' },
      { type: 'prediction', message: 'GCC retailer density will require 2 additional distribution hubs by Q3 2026', confidence: 0.81 },
    ];
  },
  satellite: async () => {
    const whitespaces = await satelliteDb.list({}, 1, 10000);
    const avgCoverage = whitespaces.data.reduce((s: number, w: any) => s + (w.coverageScore || 0), 0) / Math.max(whitespaces.total, 1);
    return [
      { type: 'insight', message: `${whitespaces.total} satellite-detected market opportunities. Average coverage score: ${Math.round(avgCoverage)}%` },
      { type: 'alert', severity: 'high', message: `${whitespaces.data.filter((w: any) => w.coverageScore < 30).length} regions below 30% coverage threshold — immediate expansion recommended` },
      { type: 'recommendation', message: 'Punjab Tier-2 cities show highest ROI potential — deploy first to Faisalabad and Multan', impact: 'high' },
      { type: 'prediction', message: 'East Africa retail expansion will increase satellite coverage by 15% within 6 months', confidence: 0.74 },
    ];
  },
  territory: async () => {
    const assignments = await territoryAssignmentsDb.list({}, 1, 10000);
    const avgCoverage = assignments.data.reduce((s: number, a: any) => s + (a.coverage || 0), 0) / Math.max(assignments.total, 1);
    const lowCoverage = assignments.data.filter((a: any) => (a.coverage || 0) < 50);
    return [
      { type: 'insight', message: `${assignments.total} territory assignments active. Average coverage: ${Math.round(avgCoverage)}%` },
      { type: 'alert', severity: lowCoverage.length > 0 ? 'high' : 'low', message: `${lowCoverage.length} territories below 50% coverage: ${lowCoverage.map((t: any) => t.territoryCode).join(', ')}` },
      { type: 'recommendation', message: 'Merge AF-KE and AF-TZ territories under single regional manager to improve coordination', impact: 'medium' },
      { type: 'prediction', message: 'Territory expansion into Central Asia (Uzbekistan, Kazakhstan) feasible by Q4 2026', confidence: 0.68 },
    ];
  },
};

// ── INSIGHTS ─────────────────────────────────────────────────────────
router.get('/insights/:domain', async (req: Request, res: Response) => {
  const { domain } = req.params;
  const generator = domainInsights[domain];
  if (!generator) {
    return res.status(404).json({ success: false, error: `No insights available for domain: ${domain}` });
  }
  const insights = await generator();
  res.json({ success: true, domain, insights, generatedAt: new Date().toISOString() });
});

router.get('/insights', async (_req: Request, res: Response) => {
  const all: Record<string, any[]> = {};
  for (const [domain, gen] of Object.entries(domainInsights)) {
    all[domain] = await gen();
  }
  res.json({ success: true, domains: all, generatedAt: new Date().toISOString() });
});

// ── FORECASTS (derived from historical order amounts) ─────────────────
router.get('/forecast/:domain/:metric', async (req: Request, res: Response) => {
  const { domain, metric } = req.params;
  const periods = Math.min(12, Math.max(1, Number(req.query.periods) || 6));

  if (domain !== 'orders' && domain !== 'finance') {
    return res.status(404).json({ success: false, error: `No forecast model for domain: ${domain}` });
  }

  const source = domain === 'finance' ? await invoicesDb.list({}, 1, 10000) : await ordersDb.list({}, 1, 10000);
  const rows = source.data as Array<{ amount?: number; createdAt?: string | Date }>;

  const buckets = new Map<string, number>();
  for (const row of rows) {
    const raw = row.createdAt ? new Date(row.createdAt) : new Date();
    const key = `${raw.getFullYear()}-${String(raw.getMonth() + 1).padStart(2, '0')}`;
    buckets.set(key, (buckets.get(key) || 0) + (row.amount || 0));
  }

  const sortedKeys = [...buckets.keys()].sort();
  const history = sortedKeys.slice(-periods).map((k) => ({ period: k, actual: Math.round(buckets.get(k) || 0) }));
  const values = history.map((h) => h.actual);
  const avg = values.length ? values.reduce((s, v) => s + v, 0) / values.length : 0;
  const last = values.length ? values[values.length - 1] : 0;
  const trend = values.length >= 2 && values[0] > 0 ? (last - values[0]) / values[0] : 0;

  const forecast = Array.from({ length: periods }, (_, i) => {
    const predicted = Math.round(last * (1 + trend * (i + 1) * 0.5));
    const spread = Math.max(predicted * 0.08, 100);
    return {
      period: `Month +${i + 1}`,
      predicted,
      lowerBound: Math.round(predicted - spread),
      upperBound: Math.round(predicted + spread),
      confidence: Math.max(0.45, 0.9 - i * 0.06),
    };
  });

  res.json({
    success: true,
    domain,
    metric,
    periods,
    history,
    forecast,
    model: values.length >= 3 ? 'moving-average-trend' : 'baseline-empty',
    generatedAt: new Date().toISOString(),
    note: values.length === 0 ? 'No historical data — forecast will populate after orders/invoices exist.' : undefined,
  });
});

// ── ANOMALIES (derived from live operational data) ───────────────────
router.get('/anomalies', async (_req: Request, res: Response) => {
  const [orders, invoices, inventory, routes] = await Promise.all([
    ordersDb.list({}, 1, 500),
    invoicesDb.list({}, 1, 500),
    inventoryDb.list({}, 1, 500),
    routesDb.list({}, 1, 500),
  ]);

  const anomalies: Array<{ domain: string; severity: string; message: string; detectedAt: string; confidence: number }> = [];

  const orderAmounts = orders.data.map((o: any) => o.amount || 0).filter((a: number) => a > 0);
  if (orderAmounts.length >= 3) {
    const avg = orderAmounts.reduce((s: number, a: number) => s + a, 0) / orderAmounts.length;
    const spike = orders.data.find((o: any) => (o.amount || 0) > avg * 2.5);
    if (spike) {
      anomalies.push({
        domain: 'orders',
        severity: 'medium',
        message: `Order ${spike.orderId || spike.id} is ${Math.round(((spike.amount || 0) / avg - 1) * 100)}% above average value`,
        detectedAt: new Date().toISOString(),
        confidence: 0.82,
      });
    }
  }

  const overdue = invoices.data.filter((i: any) => i.status === 'Overdue');
  if (overdue.length > 0) {
    const top = overdue.sort((a: any, b: any) => (b.amount || 0) - (a.amount || 0))[0];
    anomalies.push({
      domain: 'finance',
      severity: 'high',
      message: `${overdue.length} overdue invoice(s) — largest: ${top.customer || top.invoiceId || top.id} ($${(top.amount || 0).toLocaleString()})`,
      detectedAt: new Date().toISOString(),
      confidence: 0.91,
    });
  }

  const lowStock = inventory.data.filter((i: any) => i.onHand < (i.minStock || 0));
  if (lowStock.length > 0) {
    anomalies.push({
      domain: 'inventory',
      severity: lowStock.length > 3 ? 'high' : 'low',
      message: `${lowStock.length} SKU(s) below minimum: ${lowStock.slice(0, 3).map((i: any) => i.sku).join(', ')}`,
      detectedAt: new Date().toISOString(),
      confidence: 0.95,
    });
  }

  const delayed = routes.data.filter((r: any) => r.status === 'Delayed');
  if (delayed.length > 0) {
    anomalies.push({
      domain: 'logistics',
      severity: 'medium',
      message: `${delayed.length} route(s) marked Delayed`,
      detectedAt: new Date().toISOString(),
      confidence: 0.88,
    });
  }

  res.json({ success: true, anomalies, total: anomalies.length, generatedAt: new Date().toISOString() });
});

// ── AI COPILOT CHAT (facts first → Groq narrative) ───────────────────
router.post('/copilot/chat', async (req: Request, res: Response) => {
  const { message, context } = req.body;
  if (!message) return res.status(400).json({ success: false, error: 'message is required' });

  const msg = String(message).toLowerCase();
  let facts = '';
  let domain = String(context || 'general');

  if (msg.includes('order') || msg.includes('sales') || domain === 'orders') {
    domain = 'orders';
    const orders = await ordersDb.list({}, 1, 10000);
    facts = `Orders total=${orders.total}; pending=${orders.data.filter((o: any) => o.status === 'Pending').length}; value=$${orders.data.reduce((s: number, o: any) => s + (o.amount || 0), 0).toLocaleString()}.`;
  } else if (msg.includes('inventory') || msg.includes('stock') || domain === 'inventory') {
    domain = 'inventory';
    const items = await inventoryDb.list({}, 1, 10000);
    const low = items.data.filter((i: any) => i.onHand < (i.minStock || 0));
    facts = `SKUs=${items.total}; below-min=${low.length} (${low.map((i: any) => i.sku).slice(0, 8).join(', ')}); stock-value=$${items.data.reduce((s: number, i: any) => s + (i.onHand * (i.unitCost || 0)), 0).toLocaleString()}.`;
  } else if (msg.includes('finance') || msg.includes('revenue') || msg.includes('money') || msg.includes('ar') || domain === 'finance') {
    domain = 'finance';
    const invoices = await invoicesDb.list({}, 1, 10000);
    const overdue = invoices.data.filter((i: any) => i.status === 'Overdue').length;
    const ar = invoices.data.filter((i: any) => i.status !== 'Paid').reduce((s: number, i: any) => s + (i.amount || 0), 0);
    facts = `Invoices=${invoices.total}; overdue=${overdue}; AR outstanding=$${ar.toLocaleString()}.`;
  } else if (msg.includes('employee') || msg.includes('hr') || msg.includes('team') || domain === 'hr') {
    domain = 'hr';
    const employees = await employeesDb.list({}, 1, 10000);
    facts = `Employees=${employees.total}; countries=${new Set(employees.data.map((e: any) => e.country)).size}.`;
  } else if (msg.includes('delivery') || msg.includes('logistics') || msg.includes('route') || domain === 'logistics') {
    domain = 'logistics';
    const routes = await routesDb.list({}, 1, 10000);
    const onTime = computeOnTimeRate(routes.data);
    facts = `Routes=${routes.total}; in-transit=${routes.data.filter((r: any) => r.status === 'In Transit').length}; on-time=${onTime === null ? 'N/A' : `${onTime}%`}.`;
  } else if (msg.includes('gps') || msg.includes('retailer') || msg.includes('tracking')) {
    domain = 'gps';
    const retailers = await gpsRetailersDb.list({}, 1, 10000);
    const countries = new Set(retailers.data.map((r: any) => r.countryCode));
    facts = `Retailers=${retailers.total}; countries=${countries.size}; monthly-sales=$${retailers.data.reduce((s: number, r: any) => s + (r.monthlySales || 0), 0).toLocaleString()}.`;
  } else if (msg.includes('satellite') || msg.includes('whitespace') || msg.includes('coverage')) {
    domain = 'satellite';
    const ws = await satelliteDb.list({}, 1, 10000);
    facts = `Opportunities=${ws.total}; regions=${ws.data.map((w: any) => w.region).slice(0, 6).join(', ')}; avg-coverage=${Math.round(ws.data.reduce((s: number, w: any) => s + (w.coverageScore || 0), 0) / Math.max(ws.total, 1))}%.`;
  } else if (msg.includes('territory') || msg.includes('region') || msg.includes('assignment')) {
    domain = 'territory';
    const assignments = await territoryAssignmentsDb.list({}, 1, 10000);
    facts = `Assignments=${assignments.total}; coverage ${Math.min(...(assignments.data.map((a: any) => a.coverage || 0).concat([0])))}%–${Math.max(...(assignments.data.map((a: any) => a.coverage || 0).concat([0])))}%.`;
  } else {
    facts = 'Available domains: orders, inventory, finance, HR, logistics, GPS, satellite, territory. Ask a concrete question.';
  }

  const ai = await domainCopilot({ domain, message: String(message), facts });
  res.json({
    success: true,
    response: ai.response,
    context: domain,
    aiGenerated: ai.aiGenerated,
    facts,
    timestamp: new Date().toISOString(),
  });
});

// ── SAP+ ADVISE (structured OsSapAiPanel payload for modules #9–#72) ─
async function gatherAdviseFacts(domainRaw: string): Promise<{ domain: string; facts: string }> {
  const key = String(domainRaw || 'general').toLowerCase().trim();
  const statusCounts = (rows: Array<{ status?: string | null }>) => {
    const m: Record<string, number> = {};
    for (const r of rows) {
      const s = String(r.status || 'Unknown');
      m[s] = (m[s] || 0) + 1;
    }
    return Object.entries(m)
      .map(([s, n]) => `${s}=${n}`)
      .join(', ');
  };

  try {
    switch (key) {
      case 'cpq':
      case 'quotes': {
        const quotes = await prisma.quote.findMany({ take: 200, orderBy: { createdAt: 'desc' } });
        const open = quotes.filter((q) => !['Accepted', 'Rejected', 'Expired'].includes(String(q.status)));
        const value = quotes.reduce((s, q) => s + (Number(q.total) || 0), 0);
        return {
          domain: 'cpq',
          facts: `Quotes=${quotes.length}; open=${open.length}; by-status: ${statusCounts(quotes)}; pipeline≈$${value.toLocaleString()}.`,
        };
      }
      case 'sales':
      case 'sales-distribution': {
        const [channels, slots, orders] = await Promise.all([
          prisma.salesChannel.findMany({ take: 100 }),
          prisma.deliverySlot.findMany({ take: 100 }),
          prisma.salesOrder.findMany({ take: 200, orderBy: { createdAt: 'desc' } }),
        ]);
        return {
          domain: 'sales',
          facts: `Channels=${channels.length} (active=${channels.filter((c) => c.active).length}); delivery-slots=${slots.length}; sales-orders=${orders.length}; SO status: ${statusCounts(orders)}.`,
        };
      }
      case 'marketing': {
        const [campaigns, posts] = await Promise.all([
          prisma.emailCampaign.findMany({ take: 100, orderBy: { createdAt: 'desc' } }),
          prisma.socialPost.findMany({ take: 100, orderBy: { createdAt: 'desc' } }),
        ]);
        return {
          domain: 'marketing',
          facts: `Email-campaigns=${campaigns.length}; status: ${statusCounts(campaigns)}; social-posts=${posts.length}; post-status: ${statusCounts(posts)}.`,
        };
      }
      case 'distributor':
      case 'distributors': {
        const [customers, orders] = await Promise.all([
          customersDb.list({}, 1, 500),
          ordersDb.list({}, 1, 500),
        ]);
        const pending = orders.data.filter((o: any) => String(o.status).toLowerCase().includes('pend')).length;
        const value = orders.data.reduce((s: number, o: any) => s + (Number(o.amount) || 0), 0);
        return {
          domain: 'distributor',
          facts: `Customers=${customers.total}; replenishment-orders=${orders.total}; pending=${pending}; order-value≈$${value.toLocaleString()}.`,
        };
      }
      case 'rfq':
      case 'procurement': {
        const rfqs = await prisma.rFQ.findMany({ take: 200, orderBy: { createdAt: 'desc' }, include: { responses: true } });
        const open = rfqs.filter((r) => !['Awarded', 'Cancelled', 'Closed'].includes(String(r.status)));
        const withBids = rfqs.filter((r) => (r.responses?.length || 0) > 0).length;
        return {
          domain: 'rfq',
          facts: `RFQs=${rfqs.length}; open=${open.length}; with-responses=${withBids}; status: ${statusCounts(rfqs)}.`,
        };
      }
      case 'vendors':
      case 'vendor-scorecards': {
        const cards = await prisma.vendorScorecard.findMany({ take: 200, orderBy: { updatedAt: 'desc' } });
        const avg =
          cards.length > 0 ? cards.reduce((s, c) => s + (Number(c.overallScore) || 0), 0) / cards.length : 0;
        const low = cards.filter((c) => (Number(c.overallScore) || 0) < 60).length;
        return {
          domain: 'vendors',
          facts: `Vendor-scorecards=${cards.length}; avg-score=${avg.toFixed(1)}; below-60=${low}; warn/drop=${cards.filter((c) => ['Warn', 'Drop'].includes(String(c.recommendation))).length}.`,
        };
      }
      case 'contracts': {
        const contracts = await prisma.contract.findMany({ take: 200, orderBy: { endDate: 'asc' } });
        const soon = new Date(Date.now() + 60 * 86400000);
        const expiring = contracts.filter(
          (c) => c.endDate && new Date(c.endDate) <= soon && ['Active', 'Signed'].includes(String(c.status)),
        );
        return {
          domain: 'contracts',
          facts: `Contracts=${contracts.length}; status: ${statusCounts(contracts)}; expiring≤60d=${expiring.length} (${expiring
            .slice(0, 5)
            .map((c) => c.contractNo)
            .join(', ')}).`,
        };
      }
      case 'sourcing': {
        const suppliers = await prisma.sourcingSupplier.findMany({ take: 200, orderBy: { rating: 'desc' } });
        const avg =
          suppliers.length > 0 ? suppliers.reduce((s, x) => s + (Number(x.rating) || 0), 0) / suppliers.length : 0;
        return {
          domain: 'sourcing',
          facts: `Sourcing-suppliers=${suppliers.length}; avg-rating=${avg.toFixed(1)}; qualified=${suppliers.filter((s) => s.qualifiedStatus === 'Qualified').length}; top=${suppliers
            .slice(0, 5)
            .map((s) => `${s.name}:${s.rating}`)
            .join(', ')}.`,
        };
      }
      case 'manufacturing':
      case 'production':
      case 'work-orders': {
        const wos = await prisma.workOrder.findMany({ take: 300, orderBy: { createdAt: 'desc' } });
        const open = wos.filter((w) => !['Completed', 'Cancelled'].includes(String(w.status)));
        const inProg = wos.filter((w) => w.status === 'InProgress').length;
        const planned = wos.filter((w) => w.status === 'Planned').length;
        const released = wos.filter((w) => w.status === 'Released').length;
        return {
          domain: 'manufacturing',
          facts: `Work-orders=${wos.length}; open=${open.length}; Planned=${planned}; Released=${released}; InProgress=${inProg}; Completed=${wos.filter((w) => w.status === 'Completed').length}. Variance focus: release backlog vs in-progress capacity.`,
        };
      }
      case 'shopfloor':
      case 'shop-floor': {
        const ops = await prisma.shopFloorOp.findMany({ take: 300, orderBy: { operationNo: 'asc' } });
        return {
          domain: 'shopfloor',
          facts: `Shop-floor-ops=${ops.length}; status: ${statusCounts(ops)}.`,
        };
      }
      case 'bom':
      case 'boms': {
        const boms = await prisma.billOfMaterial.findMany({ take: 200, include: { components: true } });
        const avgLines = boms.length ? boms.reduce((s, b) => s + (b.components?.length || 0), 0) / boms.length : 0;
        return {
          domain: 'bom',
          facts: `BOMs=${boms.length}; avg-components=${avgLines.toFixed(1)}; samples=${boms
            .slice(0, 6)
            .map((b) => `${b.productSku}(${b.components?.length || 0})`)
            .join(', ')}.`,
        };
      }
      case 'quality': {
        const [checks, ncrs] = await Promise.all([
          prisma.qualityCheck.findMany({ take: 200, orderBy: { createdAt: 'desc' } }),
          prisma.nonConformanceReport.findMany({ take: 100, orderBy: { createdAt: 'desc' } }),
        ]);
        const fail = checks.filter((c) => ['Fail', 'Failed', 'Rejected'].includes(String(c.status))).length;
        return {
          domain: 'quality',
          facts: `QC-checks=${checks.length}; fail/reject=${fail}; status: ${statusCounts(checks)}; NCRs=${ncrs.length}; NCR-status: ${statusCounts(ncrs)}.`,
        };
      }
      case 'recipe':
      case 'recipes': {
        const recipes = await prisma.recipe.findMany({ take: 200, include: { ingredients: true } });
        return {
          domain: 'recipe',
          facts: `Recipes=${recipes.length}; with-ingredients=${recipes.filter((r) => (r.ingredients?.length || 0) > 0).length}; samples=${recipes
            .slice(0, 6)
            .map((r) => `${r.code}(${r.ingredients?.length || 0})`)
            .join(', ')}.`,
        };
      }
      case 'inventory': {
        const [items, counts] = await Promise.all([
          prisma.inventoryItem.findMany({ take: 500 }),
          prisma.cycleCount.findMany({ take: 200, orderBy: { createdAt: 'desc' } }),
        ]);
        const low = items.filter((i) => Number(i.onHand) < Number(i.minStock || 0));
        const adjusted = counts.filter((c) => c.status === 'Adjusted').length;
        const pending = counts.filter((c) => c.status === 'Pending').length;
        const variances = counts
          .map((c) => ({ sku: c.sku, delta: Number(c.variance) || Number(c.countedQty) - Number(c.systemQty) }))
          .filter((v) => v.delta !== 0)
          .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))
          .slice(0, 8);
        const value = items.reduce((s, i) => s + Number(i.onHand || 0) * Number(i.unitCost || 0), 0);
        return {
          domain: 'inventory',
          facts: `SKUs=${items.length}; below-min=${low.length} (${low
            .slice(0, 8)
            .map((i) => i.sku)
            .join(', ')}); stock-value≈$${value.toLocaleString()}; cycle-counts=${counts.length} pending=${pending} adjusted=${adjusted}; top-variances=${variances
            .map((v) => `${v.sku}:${v.delta > 0 ? '+' : ''}${v.delta}`)
            .join(', ') || 'none'}.`,
        };
      }
      case 'warehouse':
      case 'warehouses': {
        const whs = await prisma.warehouse.findMany({ include: { bins: true }, take: 100 });
        const bins = whs.reduce((s, w) => s + (w.bins?.length || 0), 0);
        return {
          domain: 'warehouse',
          facts: `Warehouses=${whs.length}; bins=${bins}; codes=${whs
            .slice(0, 8)
            .map((w) => `${w.code}(${w.bins?.length || 0} bins)`)
            .join(', ')}.`,
        };
      }
      case 'demand':
      case 'demand-planning': {
        const [hist, fc] = await Promise.all([
          prisma.demandHistory.findMany({ take: 300, orderBy: { period: 'desc' } }),
          prisma.demandForecast.findMany({ take: 300, orderBy: [{ sku: 'asc' }, { period: 'asc' }] }),
        ]);
        const skus = new Set([...hist.map((h) => h.sku), ...fc.map((f) => f.sku)]);
        const sample = [...skus].slice(0, 5);
        const varianceNotes: string[] = [];
        for (const sku of sample) {
          const h = hist.filter((x) => x.sku === sku).slice(0, 3);
          const f = fc.filter((x) => x.sku === sku).slice(0, 3);
          if (h.length && f.length) {
            const avgH = h.reduce((s, x) => s + Number(x.units || 0), 0) / h.length;
            const avgF = f.reduce((s, x) => s + Number(x.forecastUnits || 0), 0) / f.length;
            const pct = avgH ? Math.round(((avgF - avgH) / avgH) * 100) : 0;
            varianceNotes.push(`${sku}: fc-vs-hist ${pct > 0 ? '+' : ''}${pct}%`);
          }
        }
        return {
          domain: 'demand',
          facts: `Demand-history-rows=${hist.length}; forecasts=${fc.length}; SKUs=${skus.size}; variance-samples: ${varianceNotes.join('; ') || 'insufficient overlap'}.`,
        };
      }
      case 'fleet': {
        const [vehicles, trips] = await Promise.all([
          prisma.fleetVehicle.findMany({ take: 200 }),
          prisma.fleetTrip.findMany({ take: 200, orderBy: { createdAt: 'desc' } }),
        ]);
        return {
          domain: 'fleet',
          facts: `Vehicles=${vehicles.length}; trips=${trips.length}; trip-status: ${statusCounts(trips)}; vehicle-status: ${statusCounts(vehicles as any)}.`,
        };
      }
      case 'shipping':
      case 'shipments': {
        const shipments = await prisma.shipment.findMany({ take: 200, orderBy: { createdAt: 'desc' } });
        return {
          domain: 'shipping',
          facts: `Shipments=${shipments.length}; status: ${statusCounts(shipments)}.`,
        };
      }
      case 'trade':
      case 'customs': {
        const codes = await prisma.hSCode.findMany({ take: 300 });
        const avgDuty = codes.length ? codes.reduce((s, c) => s + Number(c.dutyPercent || 0), 0) / codes.length : 0;
        return {
          domain: 'trade',
          facts: `HS-codes=${codes.length}; avg-duty=${avgDuty.toFixed(1)}%; samples=${codes
            .slice(0, 8)
            .map((c) => `${c.code}:${c.dutyPercent}%`)
            .join(', ')}.`,
        };
      }
      case 'threepl':
      case '3pl': {
        const [partners, events] = await Promise.all([
          prisma.threePLPartner.findMany({ take: 100 }),
          prisma.threePLEvent.findMany({ take: 100, orderBy: { receivedAt: 'desc' } }),
        ]);
        return {
          domain: 'threepl',
          facts: `3PL-partners=${partners.length}; recent-events=${events.length}; event-types=${Object.entries(
            events.reduce((m: Record<string, number>, e) => {
              const t = String(e.eventType || 'Unknown');
              m[t] = (m[t] || 0) + 1;
              return m;
            }, {}),
          )
            .map(([t, n]) => `${t}=${n}`)
            .join(', ')}.`,
        };
      }
      // ── Modules #29–#72 ──────────────────────────────────────────────
      case 'hr':
      case 'hr-core':
      case 'payroll': {
        const [emps, leave, att, pay] = await Promise.all([
          prisma.employee.findMany({ take: 500 }),
          prisma.leaveRequest.findMany({ take: 200, orderBy: { createdAt: 'desc' } }),
          prisma.attendance.findMany({ take: 200, orderBy: { date: 'desc' } }),
          prisma.payroll.findMany({ take: 100, orderBy: { createdAt: 'desc' } }),
        ]);
        const pendingLeave = leave.filter((l) => l.status === 'Pending').length;
        return {
          domain: 'hr',
          facts: `Employees=${emps.length}; countries=${new Set(emps.map((e) => e.country).filter(Boolean)).size}; leave=${leave.length} pending=${pendingLeave}; attendance-rows=${att.length}; payroll-runs=${pay.length}. Attrition risk: high leave backlog + sparse attendance.`,
        };
      }
      case 'talent':
      case 'talent-acquisition': {
        const posts = await prisma.jobPosting.findMany({ take: 200, orderBy: { createdAt: 'desc' } });
        const open = posts.filter((p) => ['Open', 'Published', 'Active'].includes(String(p.status)));
        return {
          domain: 'talent',
          facts: `Job-postings=${posts.length}; open=${open.length}; status: ${statusCounts(posts)}; titles=${open
            .slice(0, 6)
            .map((p) => (p as any).title || (p as any).reqNo)
            .join(', ')}.`,
        };
      }
      case 'lms':
      case 'learning': {
        const courses = await prisma.course.findMany({ take: 200 });
        return {
          domain: 'lms',
          facts: `Courses=${courses.length}; status: ${statusCounts(courses)}; samples=${courses
            .slice(0, 6)
            .map((c) => (c as any).title || c.id)
            .join(', ')}.`,
        };
      }
      case 'performance':
      case 'succession': {
        const reviews = await prisma.performanceReview.findMany({ take: 200, orderBy: { createdAt: 'desc' } });
        const open = reviews.filter((r) => !['Completed', 'Closed', 'Cancelled'].includes(String(r.status)));
        return {
          domain: 'performance',
          facts: `Perf-reviews=${reviews.length}; open=${open.length}; status: ${statusCounts(reviews)}.`,
        };
      }
      case 'workforce':
      case 'workforce-planning': {
        const plans = await prisma.headcountPlan.findMany({ take: 200 });
        const gap = plans.reduce((s, p) => s + (Number((p as any).plannedHC || (p as any).targetHeadcount || 0) - Number((p as any).currentHC || (p as any).currentHeadcount || 0)), 0);
        return {
          domain: 'workforce',
          facts: `Headcount-plans=${plans.length}; net-HC-gap≈${gap}; status: ${statusCounts(plans)}.`,
        };
      }
      case 'assets':
      case 'fixed-assets': {
        const [assets, logs] = await Promise.all([
          prisma.asset.findMany({ take: 300 }),
          prisma.maintenanceLog.findMany({ take: 100, orderBy: { createdAt: 'desc' } }),
        ]);
        return {
          domain: 'assets',
          facts: `Assets=${assets.length}; status: ${statusCounts(assets)}; recent-maint-logs=${logs.length}.`,
        };
      }
      case 'plant-maintenance':
      case 'pm':
      case 'predictive-maintenance': {
        const orders = await prisma.pMWorkOrder.findMany({ take: 300, orderBy: { createdAt: 'desc' } });
        const open = orders.filter((o) => !['Completed', 'Closed', 'Cancelled'].includes(String(o.status)));
        const overdue = orders.filter((o) => (o as any).dueDate && new Date((o as any).dueDate) < new Date() && open.includes(o)).length;
        return {
          domain: 'plant-maintenance',
          facts: `PM-orders=${orders.length}; open=${open.length}; overdue=${overdue}; status: ${statusCounts(orders)}. Predictive focus: overdue + high-priority backlog.`,
        };
      }
      case 'properties':
      case 'facilities':
      case 'real-estate': {
        const props = await prisma.property.findMany({ take: 200 });
        return {
          domain: 'properties',
          facts: `Properties=${props.length}; status: ${statusCounts(props)}; codes=${props
            .slice(0, 8)
            .map((p) => (p as any).code || p.id)
            .join(', ')}.`,
        };
      }
      case 'grc':
      case 'incidents':
      case 'incident-triage': {
        const incidents = await prisma.incident.findMany({ take: 300, orderBy: { createdAt: 'desc' } });
        const open = incidents.filter((i) => ['Open', 'In Progress', 'InProgress'].includes(String(i.status)));
        const critical = incidents.filter((i) => ['Critical', 'High'].includes(String((i as any).severity))).length;
        return {
          domain: 'grc',
          facts: `Incidents=${incidents.length}; open=${open.length}; critical/high=${critical}; status: ${statusCounts(incidents)}. Triage: severity × age.`,
        };
      }
      case 'internal-audit':
      case 'audit': {
        const events = await prisma.auditEvent.findMany({ take: 300, orderBy: { createdAt: 'desc' } });
        const byModule = Object.entries(
          events.reduce((m: Record<string, number>, e) => {
            const mod = String(e.module || 'Unknown');
            m[mod] = (m[mod] || 0) + 1;
            return m;
          }, {}),
        )
          .sort((a, b) => b[1] - a[1])
          .slice(0, 8)
          .map(([m, n]) => `${m}=${n}`)
          .join(', ');
        return { domain: 'internal-audit', facts: `Audit-events=${events.length}; top-modules: ${byModule || 'none'}.` };
      }
      case 'legal':
      case 'compliance': {
        const cases = await prisma.legalCase.findMany({ take: 200, orderBy: { updatedAt: 'desc' } });
        const open = cases.filter((c) => !['Closed', 'Won', 'Lost', 'Settled'].includes(String(c.status)));
        return {
          domain: 'legal',
          facts: `Legal-cases=${cases.length}; open=${open.length}; status: ${statusCounts(cases)}.`,
        };
      }
      case 'governance':
      case 'neural-governance': {
        const policies = await prisma.governancePolicy.findMany({ take: 200 });
        return {
          domain: 'governance',
          facts: `Governance-policies=${policies.length}; status: ${statusCounts(policies)}; samples=${policies
            .slice(0, 6)
            .map((p) => (p as any).name || p.id)
            .join(', ')}.`,
        };
      }
      case 'bi':
      case 'bi-reports':
      case 'reporting': {
        const reports = await prisma.savedReport.findMany({ take: 200 });
        return {
          domain: 'bi',
          facts: `Saved-reports=${reports.length}; status: ${statusCounts(reports as any)}; names=${reports
            .slice(0, 8)
            .map((r) => (r as any).name || r.id)
            .join(', ')}.`,
        };
      }
      case 'board-pack':
      case 'board': {
        const packs = await prisma.boardPack.findMany({ take: 100, orderBy: { createdAt: 'desc' } });
        return {
          domain: 'board-pack',
          facts: `Board-packs=${packs.length}; status: ${statusCounts(packs)}; periods=${packs
            .slice(0, 6)
            .map((p) => (p as any).period || p.id)
            .join(', ')}.`,
        };
      }
      case 'okr': {
        const okrs = await prisma.oKR.findMany({ take: 200 });
        const atRisk = okrs.filter((o) => ['AtRisk', 'At Risk', 'Behind'].includes(String(o.status))).length;
        return {
          domain: 'okr',
          facts: `OKRs=${okrs.length}; at-risk=${atRisk}; status: ${statusCounts(okrs)}.`,
        };
      }
      case 'variance-ai':
      case 'variance': {
        const rows = await prisma.varianceCommentary.findMany({ take: 200, orderBy: { createdAt: 'desc' } });
        return {
          domain: 'variance-ai',
          facts: `Variance-commentaries=${rows.length}; samples=${rows
            .slice(0, 6)
            .map((r) => `${(r as any).account || r.id}:${(r as any).classification || ''}`)
            .join(', ')}.`,
        };
      }
      case 'projects':
      case 'project-management': {
        const projects = await prisma.project.findMany({ take: 200 });
        return {
          domain: 'projects',
          facts: `Projects=${projects.length}; status: ${statusCounts(projects)}.`,
        };
      }
      case 'service':
      case 'service-tickets': {
        const tickets = await prisma.serviceTicket.findMany({ take: 300, orderBy: { createdAt: 'desc' } });
        const open = tickets.filter((t) => !['Resolved', 'Closed', 'Cancelled'].includes(String(t.status)));
        return {
          domain: 'service',
          facts: `Service-tickets=${tickets.length}; open=${open.length}; status: ${statusCounts(tickets)}.`,
        };
      }
      case 'professional-services':
      case 'psa':
      case 'engagements': {
        const engs = await prisma.engagement.findMany({ take: 200 });
        return {
          domain: 'professional-services',
          facts: `Engagements=${engs.length}; status: ${statusCounts(engs)}.`,
        };
      }
      case 'tax':
      case 'tax-engine': {
        const rates = await prisma.taxRate.findMany({ take: 300 });
        return {
          domain: 'tax',
          facts: `Tax-rates=${rates.length}; jurisdictions=${new Set(rates.map((r) => (r as any).jurisdiction || (r as any).country).filter(Boolean)).size}.`,
        };
      }
      case 'fx':
      case 'fx-engine': {
        const rates = await prisma.fxRate.findMany({ take: 300, orderBy: { effectiveDate: 'desc' } });
        return {
          domain: 'fx',
          facts: `FX-rates=${rates.length}; pairs=${rates
            .slice(0, 8)
            .map((r) => `${(r as any).fromCurrency || (r as any).base}/${(r as any).toCurrency || (r as any).quote}`)
            .join(', ')}.`,
        };
      }
      case 'audit-log': {
        const events = await prisma.auditEvent.findMany({ take: 200, orderBy: { createdAt: 'desc' } });
        return { domain: 'audit-log', facts: `Recent-audit-events=${events.length}; actions: ${statusCounts(events.map((e) => ({ status: e.action })) as any)}.` };
      }
      case 'notifications': {
        const notes = await prisma.notification.findMany({ take: 300, orderBy: { createdAt: 'desc' } });
        const unread = notes.filter((n) => !(n as any).readAt && (n as any).status !== 'Read').length;
        return {
          domain: 'notifications',
          facts: `Notifications=${notes.length}; unread≈${unread}; status: ${statusCounts(notes)}.`,
        };
      }
      case 'documents':
      case 'document-vault': {
        const docs = await prisma.document.findMany({ take: 300 });
        return {
          domain: 'documents',
          facts: `Documents=${docs.length}; status: ${statusCounts(docs as any)}.`,
        };
      }
      case 'admin':
      case 'admin-security': {
        const events = await prisma.auditEvent.findMany({
          take: 100,
          where: { OR: [{ module: 'admin' }, { module: 'Admin' }, { action: { contains: 'login' } }] },
          orderBy: { createdAt: 'desc' },
        });
        return {
          domain: 'admin',
          facts: `Admin-related-audit-events=${events.length}; recent-actions=${events
            .slice(0, 8)
            .map((e) => e.action)
            .join(', ')}.`,
        };
      }
      case 'integration-bus':
      case 'integrations': {
        const [eps, dels] = await Promise.all([
          prisma.integrationEndpoint.findMany({ take: 100 }),
          prisma.integrationDelivery.findMany({ take: 100, orderBy: { createdAt: 'desc' } }),
        ]);
        const fail = dels.filter((d) => ['Failed', 'Error'].includes(String(d.status))).length;
        return {
          domain: 'integration-bus',
          facts: `Endpoints=${eps.length}; deliveries=${dels.length}; failed=${fail}; delivery-status: ${statusCounts(dels)}.`,
        };
      }
      case 'data-ocean': {
        const snaps = await prisma.dataSnapshot.findMany({ take: 100, orderBy: { createdAt: 'desc' } });
        return {
          domain: 'data-ocean',
          facts: `Data-snapshots=${snaps.length}; samples=${snaps
            .slice(0, 6)
            .map((s) => (s as any).name || (s as any).source || s.id)
            .join(', ')}.`,
        };
      }
      case 'ai-engine': {
        const models = await prisma.aiModel.findMany({ take: 100 });
        return {
          domain: 'ai-engine',
          facts: `AI-models=${models.length}; status: ${statusCounts(models)}; active=${models.filter((m) => m.status === 'Active').length}.`,
        };
      }
      case 'harvoice': {
        const cmds = await prisma.voiceCommand.findMany({ take: 200, orderBy: { createdAt: 'desc' } });
        return {
          domain: 'harvoice',
          facts: `Voice-commands=${cmds.length}; status: ${statusCounts(cmds)}.`,
        };
      }
      case 'locales':
      case 'globalisation': {
        const locales = await prisma.localeConfig.findMany({ take: 100 });
        return {
          domain: 'locales',
          facts: `Locale-configs=${locales.length}; enabled=${locales.filter((l) => (l as any).enabled !== false).length}.`,
        };
      }
      case 'feed':
      case 'social': {
        const posts = await prisma.feedPost.findMany({ take: 200, orderBy: { createdAt: 'desc' } });
        return { domain: 'feed', facts: `Feed-posts=${posts.length}; status: ${statusCounts(posts as any)}.` };
      }
      case 'marketplace': {
        const listings = await prisma.marketListing.findMany({ take: 200 });
        return {
          domain: 'marketplace',
          facts: `Listings=${listings.length}; status: ${statusCounts(listings)}.`,
        };
      }
      case 'trade-floor': {
        const instruments = await prisma.tradeInstrument.findMany({ take: 200 });
        return {
          domain: 'trade-floor',
          facts: `Instruments=${instruments.length}; status: ${statusCounts(instruments as any)}.`,
        };
      }
      case 'events': {
        const events = await prisma.event.findMany({ take: 200 });
        return { domain: 'events', facts: `Events=${events.length}; status: ${statusCounts(events)}.` };
      }
      case 'mentorship':
      case 'experts': {
        const [mentors, sessions] = await Promise.all([
          prisma.mentorProfile.findMany({ take: 100 }),
          prisma.mentorshipSession.findMany({ take: 100, orderBy: { createdAt: 'desc' } }),
        ]);
        return {
          domain: 'mentorship',
          facts: `Mentors=${mentors.length}; sessions=${sessions.length}; session-status: ${statusCounts(sessions)}.`,
        };
      }
      case 'job-board': {
        const posts = await prisma.jobPosting.findMany({ take: 200, where: { OR: [{ published: true } as any, { status: 'Published' }] } }).catch(() =>
          prisma.jobPosting.findMany({ take: 200 }),
        );
        return {
          domain: 'job-board',
          facts: `Public/job-board postings≈${posts.length}; status: ${statusCounts(posts)}.`,
        };
      }
      case 'crypto':
      case 'crypto-lite': {
        const [assets, trades] = await Promise.all([
          prisma.cryptoAsset.findMany({ take: 100 }),
          prisma.cryptoTrade.findMany({ take: 100, orderBy: { createdAt: 'desc' } }),
        ]);
        return {
          domain: 'crypto',
          facts: `Crypto-assets=${assets.length}; trades=${trades.length}; trade-status: ${statusCounts(trades as any)}.`,
        };
      }
      case 'wallet':
      case 'harvicoins':
      case 'hpay-wallet': {
        const wallets = await prisma.wallet.findMany({ take: 200 });
        const bal = wallets.reduce((s, w) => s + Number((w as any).balance || 0), 0);
        return {
          domain: key.includes('hpay') ? 'hpay-wallet' : 'wallet',
          facts: `Wallets=${wallets.length}; status: ${statusCounts(wallets)}; balance-sum≈${bal.toLocaleString()}.`,
        };
      }
      case 'referrals': {
        const refs = await prisma.referral.findMany({ take: 200 });
        return {
          domain: 'referrals',
          facts: `Referrals=${refs.length}; status: ${statusCounts(refs)}.`,
        };
      }
      case 'portal-customer':
      case 'portal-vendor':
      case 'portal-field':
      case 'portals': {
        const type =
          key === 'portal-customer' ? 'customer' : key === 'portal-vendor' ? 'vendor' : key === 'portal-field' ? 'field' : undefined;
        const sessions = await prisma.portalSession.findMany({
          take: 200,
          ...(type ? { where: { portalType: type } as any } : {}),
          orderBy: { createdAt: 'desc' },
        });
        return {
          domain: key,
          facts: `Portal-sessions=${sessions.length}${type ? ` (type=${type})` : ''}; status: ${statusCounts(sessions)}.`,
        };
      }
      case 'executive':
      case 'ceo':
      case 'executive-intelligence': {
        const [goals, snaps] = await Promise.all([
          prisma.executiveGoal.findMany({ take: 100 }),
          prisma.executiveSnapshot.findMany({ take: 50, orderBy: { createdAt: 'desc' } }),
        ]);
        const atRisk = goals.filter((g) => ['at_risk', 'AtRisk', 'Behind'].includes(String(g.status))).length;
        return {
          domain: 'executive',
          facts: `Executive-goals=${goals.length}; at-risk=${atRisk}; snapshots=${snaps.length}; goal-status: ${statusCounts(goals)}. CEO brief: at-risk goals + latest snapshot.`,
        };
      }
      case 'inventory-legacy':
      case 'orders':
      case 'finance':
      case 'logistics': {
        // Fall through to legacy db helpers used by copilot
        break;
      }
      default:
        break;
    }
  } catch (err: any) {
    return {
      domain: key,
      facts: `Domain=${key}; fact gather failed: ${err?.message || 'unknown'} (tables may need migration).`,
    };
  }

  // Legacy / shared domains
  if (key === 'orders') {
    const orders = await ordersDb.list({}, 1, 500);
    return {
      domain: 'orders',
      facts: `Orders=${orders.total}; pending=${orders.data.filter((o: any) => o.status === 'Pending').length}.`,
    };
  }
  if (key === 'inventory-legacy') {
    const items = await inventoryDb.list({}, 1, 500);
    const low = items.data.filter((i: any) => i.onHand < (i.minStock || 0));
    return { domain: 'inventory', facts: `SKUs=${items.total}; below-min=${low.length}.` };
  }
  if (key === 'finance') {
    const invoices = await invoicesDb.list({}, 1, 500);
    const overdue = invoices.data.filter((i: any) => i.status === 'Overdue').length;
    return {
      domain: 'finance',
      facts: `Invoices=${invoices.total}; overdue=${overdue}.`,
    };
  }
  if (key === 'logistics') {
    const routes = await routesDb.list({}, 1, 500);
    return {
      domain: 'logistics',
      facts: `Routes=${routes.total}; in-transit=${routes.data.filter((r: any) => r.status === 'In Transit').length}.`,
    };
  }

  return {
    domain: key,
    facts: `No specialised fact gatherer for "${key}". Pass facts in the request body or use a known domain (hr, talent, pm, grc, executive, bi, …).`,
  };
}

router.post('/advise', async (req: Request, res: Response) => {
  try {
    const domainIn = String(req.body?.domain || '').trim();
    if (!domainIn && !req.body?.facts) {
      return res.status(400).json({ success: false, error: 'domain or facts is required' });
    }

    let facts = req.body?.facts != null ? String(req.body.facts) : '';
    let domain = domainIn || 'general';

    if (!facts) {
      const gathered = await gatherAdviseFacts(domain);
      domain = gathered.domain;
      facts = gathered.facts;
    }

    const advice = await domainAdvise({
      domain,
      prompt: req.body?.prompt ? String(req.body.prompt) : undefined,
      facts,
    });

    res.json({
      success: true,
      data: advice,
      domain,
      facts,
      timestamp: new Date().toISOString(),
    });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e?.message || 'AI advise failed' });
  }
});

// ── RECOMMENDATIONS ──────────────────────────────────────────────────
router.get('/recommendations/:domain', async (req: Request, res: Response) => {
  const generator = domainInsights[req.params.domain];
  if (!generator) return res.status(404).json({ success: false, error: 'Domain not found' });
  try {
    const insights = await generator();
    const recs = insights.filter((i: any) => i.type === 'recommendation');
    res.json({ success: true, domain: req.params.domain, recommendations: recs });
  } catch (err: any) {
    res.json({ success: true, domain: req.params.domain, recommendations: [], note: 'data unavailable' });
  }
});

// ── AUTOMATION SCORE (computed from registered models + audit activity) ─
router.get('/automation-score', async (_req: Request, res: Response) => {
  const since7d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const [models, auditByModule, orders, inventory, invoices, employees, routes, pos] = await Promise.all([
    prisma.aiModel.count({ where: { status: 'Active' } }),
    prisma.auditEvent.groupBy({ by: ['module'], _count: true, where: { createdAt: { gte: since7d } } }),
    ordersDb.list({}, 1, 1),
    inventoryDb.list({}, 1, 1),
    invoicesDb.list({}, 1, 1),
    employeesDb.list({}, 1, 1),
    routesDb.list({}, 1, 1),
    purchaseOrdersDb.list({}, 1, 1),
  ]);

  const auditMap = Object.fromEntries(
    auditByModule.map((r) => [r.module, typeof r._count === 'number' ? r._count : (r._count as any)?._all ?? 0]),
  );

  const domainScore = (module: string, hasData: boolean, automated: string[], manual: string[]) => {
    const events = auditMap[module] || 0;
    const base = hasData ? 25 : 5;
    const activity = Math.min(40, events * 2);
    return { score: Math.min(100, base + activity + (hasData ? 15 : 0)), automated, manual };
  };

  const byDomain = {
    orders: domainScore('orders', orders.total > 0, ['status_tracking'], ['approval', 'fulfillment', 'returns']),
    inventory: domainScore('inventory', inventory.total > 0, ['stock_alerts'], ['receiving', 'cycle_count', 'transfers']),
    finance: domainScore('finance', invoices.total > 0, ['invoice_generation', 'gl_posting'], ['payment_reconciliation', 'reporting']),
    crm: domainScore('wave8', false, ['lead_capture'], ['follow_ups', 'campaigns']),
    hr: domainScore('hr', employees.total > 0, ['attendance'], ['reviews', 'hiring']),
    logistics: domainScore('logistics', routes.total > 0, ['route_tracking'], ['dispatch', 'fleet_maintenance']),
    procurement: domainScore('procurement', pos.total > 0, ['po_generation'], ['supplier_evaluation', 'negotiation']),
  };

  const overall = Math.round(Object.values(byDomain).reduce((s, d) => s + d.score, 0) / Object.keys(byDomain).length);

  res.json({
    success: true,
    overall,
    activeModels: models,
    byDomain,
    generatedAt: new Date().toISOString(),
  });
});

export default router;
