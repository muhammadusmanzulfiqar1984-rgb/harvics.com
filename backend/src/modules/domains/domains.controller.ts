import { Router, Request, Response } from 'express';
import { getDomainData, UnsupportedCountryError } from './domains.data';

const domainsRouter = Router();

const extractCountryParam = (req: Request) =>
  (req.query.countryCode as string) || (req.query.country as string) || undefined;

const withScopedSlice = (
  handler: (req: Request, res: Response, countrySlice: ReturnType<typeof getDomainData>) => void,
) => {
  return (req: Request, res: Response) => {
    if (!req.userScope) {
      return res.status(401).json({ error: 'Missing user access scope' });
    }

    try {
      const slice = getDomainData(req.userScope, extractCountryParam(req));
      return handler(req, res, slice);
    } catch (error) {
      if (error instanceof UnsupportedCountryError) {
        return res.status(400).json({ error: error.message });
      }
      console.error('Domains controller error:', error);
      return res.status(500).json({ error: 'Failed to load domain data' });
    }
  };
};

domainsRouter.get('/orders/overview', withScopedSlice((_req, res, slice) => res.json(slice.orders)));

domainsRouter.get(
  '/inventory/overview',
  withScopedSlice((_req, res, slice) => res.json(slice.inventory)),
)

domainsRouter.get(
  '/logistics/overview',
  withScopedSlice((_req, res, slice) => res.json(slice.logistics)),
)

domainsRouter.get(
  '/finance/overview',
  withScopedSlice((_req, res, slice) => res.json(slice.finance)),
)

domainsRouter.get('/crm/overview', withScopedSlice((_req, res, slice) => res.json(slice.crm)));

domainsRouter.get('/hr/overview', withScopedSlice((_req, res, slice) => res.json(slice.hr)));

domainsRouter.get(
  '/executive/overview',
  withScopedSlice((_req, res, slice) => res.json(slice.executive)),
);

export default domainsRouter;