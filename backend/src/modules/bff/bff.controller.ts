import { Router } from 'express';
import { getCountryProfile } from '../localisation/localisation.service';

const bffRouter = Router();

bffRouter.get('/:persona', (req, res) => {
  if (!req.userScope) {
    return res.status(401).json({ error: 'Missing user scope' });
  }

  const { persona } = req.params;
  const countryCode = req.userScope.countries[0] || 'US';
  const profile = getCountryProfile(countryCode) || getCountryProfile('US');

  const base = {
    persona,
    country: profile
      ? {
          code: profile.code,
          name: profile.name,
        }
      : {
          code: 'US',
          name: 'United States',
        },
    scope: req.userScope,
  };

  switch (persona) {
    case 'distributor':
    case 'retailer':
    case 'sales':
    case 'manager':
    case 'investor':
      return res.json({
        ...base,
        kpis: {
          totalOrders: 156,
          revenue: 4523000,
          customers: 234,
        },
        recentActivity: [
          { description: 'New order placed', created_at: new Date().toISOString() },
          { description: 'Inventory updated', created_at: new Date(Date.now() - 3600000).toISOString() },
        ],
      });
    case 'copilot':
      return res.json({
        ...base,
        ai: {
          welcome: 'Harvics AI Copilot ready.',
        },
      });
    default:
      return res.status(404).json({ error: `Unknown persona: ${persona}` });
  }
});

export default bffRouter;

