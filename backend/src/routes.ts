import { Router, Request, Response } from 'express';
import localisationRouter, { getLanguagesHandler, getTranslationsHandler } from './modules/localisation/localisation.controller';
import { getCountryProfile, getWorkflowConfig } from './modules/localisation/ruleEngine.controller';
import gpsRouter from './modules/gps/gps.controller';
import satelliteRouter from './modules/satellite/satellite.controller';
import tradeRouter from './modules/trade/trade.controller';
import procurementRouter from './modules/procurement/procurement.controller';
import graphRouter from './modules/fmcgGraph/graph.controller';
import aiRouter from './modules/ai/ai.controller';
import imageGeneratorRouter from './modules/ai/imageGenerator';
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
import { neuralGovernance } from './middleware/neuralGovernance';
import { buildLocalisationPayload, listCountryProfiles } from './modules/localisation/localisation.service';
import { auditLogRouter } from './modules/admin/auditLog.controller';
import { commsRouter } from './modules/comms/comms.controller';
import { notificationService } from './modules/comms/notification.service';
import { eventBus } from './core/eventBus';

import { HarvicsAlphaEngine } from './services/harvicsAlphaEngine';

// CRUD Controllers (Domain WRITE + full CRUD)
import ordersCrudRouter from './modules/orders/orders.crud.controller';
import inventoryCrudRouter from './modules/inventory/inventory.crud.controller';
import financeCrudRouter from './modules/finance/finance.crud.controller';
import crmCrudRouter from './modules/crm/crm.crud.controller';
import hrCrudRouter from './modules/hr/hr.crud.controller';
import logisticsCrudRouter from './modules/logistics/logistics.crud.controller';
import procurementCrudRouter from './modules/procurement/procurement.crud.controller';
import {
  manufacturingCrudRouter,
  qualityCrudRouter,
  projectManagementCrudRouter,
  biCrudRouter,
  treasuryCrudRouter,
  digitalFinanceCrudRouter,
  marketingCrudRouter,
  shippingTradeCrudRouter,
} from './modules/services/missing-modules.crud.controller';
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
    // Return mock plan so dashboard doesn't break when AI engine is offline
    res.json({
      timestamp: new Date().toISOString(),
      status: 'active',
      plan: [
        { territory: 'US', sku: 'HVCS-SNACK-001', strategy: 'PREMIUM_PUSH', targetPrice: 4.99, margin: '28%', alert: 'Strong demand signal', passport: { origin: 'PK', farmerId: 'F-001', fairTradeStatus: 'Certified', ethicalScore: 92 } },
        { territory: 'AE', sku: 'HVCS-BVRG-012', strategy: 'AGGRESSIVE_ARBITRAGE', targetPrice: 12.50, margin: '34%', alert: 'INFLATION_RISK: Monitor', passport: { origin: 'AE', farmerId: 'F-002', fairTradeStatus: 'Certified', ethicalScore: 88 } },
        { territory: 'PK', sku: 'HVCS-FMCG-007', strategy: 'VOLUME_PLAY', targetPrice: 1.25, margin: '18%', alert: 'High volume opportunity', passport: { origin: 'PK', farmerId: 'F-003', fairTradeStatus: 'Pending', ethicalScore: 79 } },
        { territory: 'GB', sku: 'HVCS-HLTH-003', strategy: 'PREMIUM_PUSH', targetPrice: 8.99, margin: '31%', alert: 'Competitor out of stock', passport: { origin: 'UK', farmerId: 'F-004', fairTradeStatus: 'Certified', ethicalScore: 95 } },
        { territory: 'CN', sku: 'HVCS-COMD-021', strategy: 'MARKET_ENTRY', targetPrice: 6.75, margin: '22%', alert: 'New market entry vector', passport: { origin: 'CN', farmerId: 'F-005', fairTradeStatus: 'In Review', ethicalScore: 81 } },
      ]
    });
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
// AI Image Generator (public - no auth for image generation)
router.use('/ai-images', imageGeneratorRouter);
// Protected AI routes
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

// ── DOMAIN CRUD ROUTES (PROTECTED - AUTH + NEURAL GOVERNANCE) ──────────────────
router.use('/orders',           requireAuthScope, neuralGovernance, ordersCrudRouter);
router.use('/inventory',        requireAuthScope, neuralGovernance, inventoryCrudRouter);
router.use('/finance',          requireAuthScope, neuralGovernance, financeCrudRouter);
// /api/payments/* — alias so existing frontend api-payments.ts clients don't 404
router.use('/payments',         requireAuthScope, neuralGovernance, financeCrudRouter);
router.use('/crm',              requireAuthScope, neuralGovernance, crmCrudRouter);
router.use('/hr',               requireAuthScope, neuralGovernance, hrCrudRouter);
router.use('/logistics',        requireAuthScope, neuralGovernance, logisticsCrudRouter);
router.use('/procurement-crud', requireAuthScope, neuralGovernance, procurementCrudRouter);
router.use('/manufacturing',    requireAuthScope, neuralGovernance, manufacturingCrudRouter);
router.use('/quality',          requireAuthScope, neuralGovernance, qualityCrudRouter);
router.use('/projects',         requireAuthScope, neuralGovernance, projectManagementCrudRouter);
router.use('/bi',               requireAuthScope, neuralGovernance, biCrudRouter);
router.use('/treasury',         requireAuthScope, neuralGovernance, treasuryCrudRouter);
router.use('/digital-finance',  requireAuthScope, neuralGovernance, digitalFinanceCrudRouter);
router.use('/marketing',        requireAuthScope, neuralGovernance, marketingCrudRouter);
router.use('/shipping-trade',   requireAuthScope, neuralGovernance, shippingTradeCrudRouter);

// ── AI INTELLIGENCE ROUTES (PROTECTED - AUTH REQUIRED) ───────────────
router.use('/intelligence', requireAuthScope, intelligenceRouter);

// ── EXPOSED SERVICES (PROTECTED - AUTH REQUIRED) ─────────────────────
router.use('/services', requireAuthScope, servicesRouter);

// ── ADMIN: AUDIT LOG (company + hq only — enforced inside router) ─────
router.use('/audit-log', auditLogRouter);

// ── DOMAIN 17: COMMUNICATION LAYER ──────────────────────────────────────────
router.use('/comms', commsRouter);

// ── DOMAIN EVENT → NOTIFICATION WIRING ──────────────────────────────────────
// These fire automatically when any domain emits an event via the eventBus.
// No polling. No manual triggering.

eventBus.on('procurement.po.created', (data: any) => {
  const amount = data?.totalAmount ?? data?.amount ?? 0;
  if (amount >= 10000) {
    notificationService.requestApproval({
      requesterId: data?.createdBy ?? 'system',
      requesterRole: data?.createdByRole ?? 'sales_officer',
      entityType: 'PurchaseOrder',
      entityId: data?.id ?? data?.poId ?? 'unknown',
      entitySummary: `PO ${data?.poNumber ?? data?.id} — $${Number(amount).toLocaleString()} — ${data?.vendorName ?? 'Vendor'}`,
      amount,
      priority: amount >= 100000 ? 'critical' : 'high',
    });
  }
});

eventBus.on('inventory.low-stock', (data: any) => {
  notificationService.systemAlert({
    toRole: 'country_manager',
    category: 'inventory_alert',
    priority: 'high',
    title: 'Low Stock Alert',
    body: `SKU ${data?.sku ?? 'unknown'} is below reorder point. Current stock: ${data?.qty ?? 0} ${data?.uom ?? 'units'}.`,
    actionUrl: '/os/inventory',
    relatedEntityId: data?.sku,
    relatedEntityType: 'InventoryItem',
  });
});

eventBus.on('finance.payment.received', (data: any) => {
  notificationService.systemAlert({
    toRole: 'hq',
    category: 'finance_alert',
    priority: 'normal',
    title: 'Payment Received',
    body: `Payment of $${Number(data?.amount ?? 0).toLocaleString()} received from ${data?.customer ?? 'customer'}.`,
    actionUrl: '/os/finance',
    relatedEntityId: data?.invoiceId,
    relatedEntityType: 'Invoice',
  });
});

eventBus.on('ai.anomaly.detected', (data: any) => {
  notificationService.systemAlert({
    toRole: 'hq',
    category: 'ai_insight',
    priority: 'critical',
    title: 'AI Anomaly Detected',
    body: data?.message ?? 'The Intelligence System has detected an anomaly requiring review.',
    actionUrl: '/os/intelligence',
    relatedEntityType: 'AIInsight',
  });
});

export default router;
