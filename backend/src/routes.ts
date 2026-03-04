import { Router, Request, Response } from 'express';
import localisationRouter, { getLanguagesHandler, getTranslationsHandler } from './modules/localisation/localisation.controller';
import { getCountryProfile, getWorkflowConfig } from './modules/localisation/ruleEngine.controller';
import gpsRouter from './modules/gps/gps.controller';
import satelliteRouter from './modules/satellite/satellite.controller';
import tradeRouter from './modules/trade/trade.controller';
import procurementRouter from './modules/procurement/procurement.controller';
import graphRouter from './modules/fmcgGraph/graph.controller';
import aiRouter from './modules/ai/ai.controller';
import dataOceanRouter from './modules/dataOcean/dataOcean.controller';
import systemRouter from './modules/system/system.controller';
import authRouter from './modules/auth/auth.controller';
import bffRouter from './modules/bff/bff.controller';
import domainsRouter from './modules/domains/domains.controller';
import productsRouter from './modules/products/products.controller';
import navigationRouter from './modules/navigation/navigation.controller';
import territoryRouter from './modules/territory/territory.controller';
import { requireAuthScope } from './middleware/authScope';
import { enforceAIProtocol, requireAIEngine } from './middleware/aiProtocolEnforcement';
import { buildLocalisationPayload, listCountryProfiles } from './modules/localisation/localisation.service';

import { HarvicsAlphaEngine } from './services/harvicsAlphaEngine';

// CRUD Controllers (Domain WRITE + full CRUD)
import ordersCrudRouter from './modules/orders/orders.crud.controller';
import inventoryCrudRouter from './modules/inventory/inventory.crud.controller';
import financeCrudRouter from './modules/finance/finance.crud.controller';
import crmCrudRouter from './modules/crm/crm.crud.controller';
import hrCrudRouter from './modules/hr/hr.crud.controller';
import logisticsCrudRouter from './modules/logistics/logistics.crud.controller';
import procurementCrudRouter from './modules/procurement/procurement.crud.controller';
import intelligenceRouter from './modules/intelligence/intelligence.controller';
import servicesRouter from './modules/services/services.controller';

const router = Router();

// Health check endpoint for /api/health
router.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'harvics-backend-api',
    timestamp: new Date().toISOString()
  });
});

const createPlaceholderRouter = (moduleName: string) => {
  const moduleRouter = Router();
  moduleRouter.all('*', (_req: Request, res: Response) => {
    res.status(501).json({
      module: moduleName,
      status: 'not_implemented',
      message: `${moduleName} module will be available soon`
    });
  });
  return moduleRouter;
};

// Core localisation module
// Languages endpoint is public (no auth required) - add before protected routes
router.get('/localisation/languages', getLanguagesHandler);
router.get('/localization/languages', getLanguagesHandler); // Alias for American spelling
// Translations endpoint is public (no auth required)
router.get('/localisation/translations/:locale', getTranslationsHandler);
router.get('/localization/translations/:locale', getTranslationsHandler); // Alias
// Language preference handler function
const languagePreferenceHandler = async (req: Request, res: Response) => {
  try {
    const { languageCode, countryCode } = req.body;
    
    if (!languageCode) {
      return res.status(400).json({
        success: false,
        error: 'Language code is required'
      });
    }

    // Support all 38 languages from the frontend
    const validLanguages = [
      'en', 'ar', 'fr', 'es', 'de', 'zh', 'ur', 'hi', 'pt', 'ru', 'it', 'tr',
      'he', 'ja', 'ko', 'nl', 'pl', 'vi', 'th', 'id', 'ms', 'sw', 'uk', 'ro',
      'cs', 'sv', 'da', 'fi', 'no', 'el', 'hu', 'bg', 'hr', 'sk', 'sr', 'bn',
      'fa', 'ps'
    ];
    if (!validLanguages.includes(languageCode)) {
      return res.status(400).json({
        success: false,
        error: `Invalid language code: ${languageCode}`
      });
    }

    // In a real implementation, this would store in database
    // For now, we'll just validate and return success
    return res.json({
      success: true,
      message: 'Language preference saved',
      data: {
        languageCode,
        countryCode: countryCode || null,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error saving language preference:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to save language preference'
    });
  }
};

// Language preference endpoint is public (no auth required) - language switching should work for everyone
router.post('/localisation/language-preference', languagePreferenceHandler);

// Country Rule Engine Endpoints
router.get('/localisation/rules/:countryCode', getCountryProfile);
router.get('/localisation/workflow/:countryCode', getWorkflowConfig);

router.post('/localization/language-preference', languagePreferenceHandler); // Alias for American spelling

// --- HARVICS ALPHA INTELLIGENCE ENDPOINT ---
router.get('/intelligence/attack-plan', async (req: Request, res: Response) => {
  try {
    const targets = ['US', 'PK', 'AE', 'GB', 'CN'];
    const plan = await HarvicsAlphaEngine.generateDailyAttackPlan(targets);
    res.json({
      timestamp: new Date().toISOString(),
      status: 'active',
      plan
    });
  } catch (error) {
    console.error('Alpha Engine Error:', error);
    res.status(500).json({ error: 'Alpha Engine Malfunction' });
  }
});


const computeGrade = (score: number): string => {
  if (score >= 85) return 'A';
  if (score >= 70) return 'B';
  if (score >= 55) return 'C';
  return 'D';
};

const toSlug = (name: string): string =>
  name.trim().toLowerCase().replace(/\s+/g, '-');

const countriesSummaryHandler = async (_req: Request, res: Response) => {
  try {
    const profiles = listCountryProfiles();
    const data = await Promise.all(profiles.map(async (profile) => {
      const payload = await buildLocalisationPayload(profile);
      const score = payload.marketScore;
      const grade = computeGrade(score);
      return {
        code: toSlug(profile.name),
        isoCode: profile.code,
        name: profile.name,
        score,
        grade,
        priceBand: payload.priceBand,
        lastAnalyzed: null
      };
    }));
    return res.json({ success: true, count: data.length, data });
  } catch (error) {
    console.error('Error building countries summary:', error);
    return res.status(500).json({ success: false, error: 'Failed to build countries summary' });
  }
};

// Public countries summary endpoints (MUST be before protected routes)
router.get('/localisation/countries/summary', countriesSummaryHandler);
router.get('/localization/countries/summary', countriesSummaryHandler);

// Protected localisation routes (require auth) - but countries/summary is already public
// Countries, Regions, Cities routes (from countries.controller)
import countriesRouter from './modules/localisation/countries.controller';
// Mount countries routes before protected routes (public endpoints)
router.use('/localisation', countriesRouter);
router.use('/localization', countriesRouter); // Alias

// Protected localisation routes (require auth)
router.use('/localisation', requireAuthScope, localisationRouter);
// Alias to support both British and American spelling in frontend API paths
router.use('/localization', requireAuthScope, localisationRouter);
router.use('/gps', requireAuthScope, gpsRouter);
router.use('/satellite', requireAuthScope, satelliteRouter);
router.use('/trade', requireAuthScope, tradeRouter);
router.use('/procurement', requireAuthScope, procurementRouter);
router.use('/graph', requireAuthScope, graphRouter);
router.use('/ai', requireAuthScope, enforceAIProtocol, requireAIEngine, aiRouter);
router.use('/data-ocean', requireAuthScope, dataOceanRouter);
router.use('/system', systemRouter);
router.use('/auth', authRouter);
router.use('/bff', requireAuthScope, bffRouter);
router.use('/domains', requireAuthScope, domainsRouter);
router.use('/products', productsRouter);
// Navigation routes (public - no auth required for menu data)
router.use('/navigation', navigationRouter);
// Territory/Geographic hierarchy routes (public - no auth required for geographic data)
router.use('/territory', territoryRouter);

// ── DOMAIN CRUD ROUTES ──────────────────────────────────────────────
router.use('/orders', ordersCrudRouter);
router.use('/inventory', inventoryCrudRouter);
router.use('/finance', financeCrudRouter);
router.use('/crm', crmCrudRouter);
router.use('/hr', hrCrudRouter);
router.use('/logistics', logisticsCrudRouter);
router.use('/procurement-crud', procurementCrudRouter);

// ── AI INTELLIGENCE ROUTES ──────────────────────────────────────────
router.use('/intelligence', intelligenceRouter);

// ── EXPOSED SERVICES (weather, currency, map, approvals, events) ─────
router.use('/services', servicesRouter);

export default router;
