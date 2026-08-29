import { Router, Request, Response } from 'express';
import { getDomainData, UnsupportedCountryError } from './domains.data';
import {
  liveCRMOverview,
  liveExecutiveOverview,
  liveFinanceOverview,
  liveHROverview,
  liveInventoryOverview,
  liveOrdersOverview,
} from './domains.live';

const domainsRouter = Router();

const extractCountryParam = (req: Request) =>
  (req.query.countryCode as string) || (req.query.country as string) || undefined;

async function withLiveOverview(
  req: Request,
  res: Response,
  liveFn: () => Promise<Record<string, any>>,
  sliceKey: 'orders' | 'inventory' | 'finance' | 'crm' | 'hr' | 'executive',
) {
  if (!req.userScope) {
    return res.status(401).json({ error: 'Missing user access scope' });
  }
  try {
    const live = await liveFn();
    const hasRows =
      (Array.isArray(live.orders) && live.orders.length > 0) ||
      (Array.isArray(live.customers) && live.customers.length > 0) ||
      (Array.isArray(live.invoices) && live.invoices.length > 0) ||
      (Array.isArray(live.skus) && live.skus.length > 0) ||
      (typeof live.total === 'number' && live.total > 0) ||
      (typeof live.totalCustomers === 'number' && live.totalCustomers > 0) ||
      (typeof live.totalRevenue === 'number' && live.totalRevenue > 0) ||
      (typeof live.totalEmployees === 'number' && live.totalEmployees > 0);

    if (hasRows) {
      return res.json(live);
    }

    const slice = getDomainData(req.userScope, extractCountryParam(req));
    return res.json((slice as any)[sliceKey]);
  } catch (error) {
    if (error instanceof UnsupportedCountryError) {
      return res.status(400).json({ error: error.message });
    }
    console.error('Domains controller error:', error);
    return res.status(500).json({ error: 'Failed to load domain data' });
  }
}

domainsRouter.get('/orders/overview', (req, res) =>
  withLiveOverview(req, res, liveOrdersOverview, 'orders'),
);

domainsRouter.get('/inventory/overview', (req, res) =>
  withLiveOverview(req, res, liveInventoryOverview, 'inventory'),
);

domainsRouter.get('/finance/overview', (req, res) =>
  withLiveOverview(req, res, liveFinanceOverview, 'finance'),
);

domainsRouter.get('/crm/overview', (req, res) => withLiveOverview(req, res, liveCRMOverview, 'crm'));

domainsRouter.get('/hr/overview', (req, res) => withLiveOverview(req, res, liveHROverview, 'hr'));

domainsRouter.get('/executive/overview', (req, res) =>
  withLiveOverview(req, res, liveExecutiveOverview, 'executive'),
);

domainsRouter.get('/logistics/overview', (req, res) => {
  if (!req.userScope) return res.status(401).json({ error: 'Missing user access scope' });
  try {
    const slice = getDomainData(req.userScope, extractCountryParam(req));
    return res.json(slice.logistics);
  } catch (error) {
    if (error instanceof UnsupportedCountryError) return res.status(400).json({ error: error.message });
    return res.status(500).json({ error: 'Failed to load domain data' });
  }
});

domainsRouter.get('/', (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Domains API — live Prisma aggregates when data exists',
    endpoints: [
      '/orders/overview',
      '/inventory/overview',
      '/finance/overview',
      '/crm/overview',
      '/hr/overview',
      '/executive/overview',
    ],
  });
});

export default domainsRouter;
