import { Router, Request, Response } from 'express';
import { getCountryProfile } from '../localisation/localisation.service';
import { buildCompanyDashboardLive } from './bff.live';
import { ordersDb, customersDb, inventoryDb } from '../../core/db';
import { prisma } from '../../core/prisma';

const bffRouter = Router();

async function personaBase(req: Request, persona: string) {
  const countries = req.userScope?.countries || req.userScope?.geographic?.countries || [];
  const countryCode = countries[0] || 'US';
  const profile = getCountryProfile(countryCode) || getCountryProfile('US');
  return {
    persona,
    country: profile
      ? { code: profile.code, name: profile.name }
      : { code: 'US', name: 'United States' },
    scope: req.userScope,
  };
}

bffRouter.get('/:persona', async (req, res) => {
  if (!req.userScope) {
    return res.status(401).json({ error: 'Missing user scope' });
  }

  const { persona } = req.params;
  const base = await personaBase(req, persona);

  if (persona === 'company-dashboard' || persona === 'company' || persona === 'company_admin' || persona === 'admin' || persona === 'hq') {
    try {
      const live = await buildCompanyDashboardLive();
      return res.json({ ...base, ...live, source: 'live' });
    } catch (err) {
      console.error('[bff] company dashboard live failed:', err);
      return res.json({
        ...base,
        kpis: { totalRevenue: 0, totalOrders: 0, activeDistributors: 0, activeCountries: 0 },
        trendData: [],
        aiInsights: [],
        topMarkets: [],
        topDistributors: [],
        riskAlerts: [],
        source: 'empty',
      });
    }
  }

  switch (persona) {
    case 'distributor':
    case 'retailer':
    case 'sales':
    case 'manager':
    case 'investor': {
      try {
        const [orders, customers, inventory, salesOrders] = await Promise.all([
          ordersDb.list({}, 1, 100),
          customersDb.list({}, 1, 100),
          inventoryDb.list({}, 1, 1),
          prisma.salesOrder.findMany({ orderBy: { createdAt: 'desc' }, take: 50 }).catch(() => []),
        ]);
        const revenue = (orders.data || []).reduce((s: number, o: any) => s + (Number(o.amount) || 0), 0);
        const pendingOrders = (salesOrders as any[]).filter((o) =>
          ['DRAFT', 'CONFIRMED', 'CREDIT_HOLD', 'IN_FULFILLMENT'].includes(String(o.status)),
        ).length;
        const delivered = (salesOrders as any[]).filter((o) =>
          ['DELIVERED', 'INVOICED', 'SHIPPED'].includes(String(o.status)),
        ).length;
        const totalSo = (salesOrders as any[]).length;
        const fillRate = totalSo > 0 ? Math.round((delivered / totalSo) * 1000) / 10 : 0;
        return res.json({
          ...base,
          kpis: {
            totalOrders: totalSo || orders.total || 0,
            pendingOrders,
            fillRate,
            revenue,
            customers: customers.total || 0,
            activeSkus: inventory.total || 0,
            routesToday: (orders.data || []).filter((o: any) => o.status === 'In Transit').length,
          },
          recentActivity: (salesOrders as any[]).slice(0, 5).map((o: any) => ({
            description: `Sales order ${o.orderNumber} — ${o.customerName} (${o.status})`,
            created_at: o.createdAt?.toISOString?.() || new Date().toISOString(),
          })),
          source: 'live',
        });
      } catch {
        return res.json({
          ...base,
          kpis: { totalOrders: 0, pendingOrders: 0, fillRate: 0, revenue: 0, customers: 0, activeSkus: 0, routesToday: 0 },
          recentActivity: [],
          source: 'empty',
        });
      }
    }
    case 'copilot':
      return res.json({
        ...base,
        ai: { welcome: 'Harvics AI Copilot ready.' },
      });
    default:
      return res.status(404).json({ error: `Unknown persona: ${persona}` });
  }
});

export default bffRouter;
