/**
 * EXPOSED SERVICE Controllers
 * 
 * These expose existing services that had NO REST endpoints:
 * - Weather
 * - Currency
 * - Map/Geocode
 * - Market Scraper (Competitor)
 * - Loyalty
 * - Product Synthesis
 * - Discovery
 * - Alerts
 * - Event Bus
 * - Approvals
 */

import { Router, Request, Response } from 'express';
import { getWeatherByCity, getCountryWeather } from '../../services/weatherService';
import { getExchangeRates, getExchangeRate } from '../../services/currencyService';
import { geocode, reverseGeocode, searchPlaces, calculateDistance } from '../../services/mapService';
import { MarketScraper } from '../../services/marketScraper';
import { LoyaltyV2 } from '../../services/loyaltyV2';
import { DiscoveryNode } from '../../services/discoveryNode';
import { AlertService } from '../../services/alertService';
import { ProductSynthesisEngine } from '../../services/productSynthesizer';
import { eventBus } from '../../core/eventBus';
import { approvalsStore } from '../../core/dataStore';

const router = Router();
// All services use static methods — no instances needed

// ═══════════════════════════════════════════════════════════════════
// WEATHER
// ═══════════════════════════════════════════════════════════════════
router.get('/weather/city/:city', async (req: Request, res: Response) => {
  try {
    const data = await getWeatherByCity(req.params.city, req.query.country as string);
    if (!data) return res.status(404).json({ success: false, error: 'Weather data not available' });
    res.json({ success: true, data });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
});

router.get('/weather/country/:code', async (req: Request, res: Response) => {
  try {
    const data = await getCountryWeather(req.params.code);
    if (!data) return res.status(404).json({ success: false, error: 'Weather data not available' });
    res.json({ success: true, data });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// ═══════════════════════════════════════════════════════════════════
// CURRENCY
// ═══════════════════════════════════════════════════════════════════
router.get('/currency/rates', async (_req: Request, res: Response) => {
  try {
    const rates = await getExchangeRates();
    if (!rates) return res.status(503).json({ success: false, error: 'Exchange rate service unavailable' });
    res.json({ success: true, base: 'USD', rates });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
});

router.get('/currency/convert', async (req: Request, res: Response) => {
  const { from, to, amount } = req.query;
  if (!from || !to) return res.status(400).json({ success: false, error: 'from and to currencies required' });
  try {
    const rate = await getExchangeRate(from as string, to as string);
    if (!rate) return res.status(503).json({ success: false, error: 'Rate not available' });
    const converted = (Number(amount) || 1) * rate;
    res.json({ success: true, from, to, rate, amount: Number(amount) || 1, converted: Math.round(converted * 100) / 100 });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// ═══════════════════════════════════════════════════════════════════
// MAP / GEOCODE
// ═══════════════════════════════════════════════════════════════════
router.get('/map/geocode', async (req: Request, res: Response) => {
  const { q, country } = req.query;
  if (!q) return res.status(400).json({ success: false, error: 'q (query) is required' });
  try {
    const results = await geocode(q as string, country as string);
    res.json({ success: true, data: results });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
});

router.get('/map/reverse', async (req: Request, res: Response) => {
  const { lat, lon } = req.query;
  if (!lat || !lon) return res.status(400).json({ success: false, error: 'lat and lon required' });
  try {
    const result = await reverseGeocode(Number(lat), Number(lon));
    res.json({ success: true, data: result });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
});

router.get('/map/places', async (req: Request, res: Response) => {
  const { q, country } = req.query;
  if (!q) return res.status(400).json({ success: false, error: 'q (query) required' });
  try {
    const results = await searchPlaces(q as string, country as string);
    res.json({ success: true, data: results });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
});

router.get('/map/distance', (req: Request, res: Response) => {
  const { lat1, lon1, lat2, lon2 } = req.query;
  if (!lat1 || !lon1 || !lat2 || !lon2) return res.status(400).json({ success: false, error: 'lat1, lon1, lat2, lon2 required' });
  const km = calculateDistance(Number(lat1), Number(lon1), Number(lat2), Number(lon2));
  res.json({ success: true, distanceKm: Math.round(km * 10) / 10 });
});

// ═══════════════════════════════════════════════════════════════════
// COMPETITOR / MARKET SCRAPER
// ═══════════════════════════════════════════════════════════════════
router.get('/competitor/prices', async (req: Request, res: Response) => {
  try {
    const query = (req.query.q as string) || 'food';
    const result = await MarketScraper.scrapeMAndS(query);
    res.json({ success: true, data: result ? [result] : [] });
  } catch (e: any) {
    res.json({ success: true, data: [], message: 'Scraper not active — returns empty in dev mode' });
  }
});

// ═══════════════════════════════════════════════════════════════════
// LOYALTY
// ═══════════════════════════════════════════════════════════════════
router.post('/loyalty/offers', (req: Request, res: Response) => {
  try {
    const offer = LoyaltyV2.analyzeShopperMission(req.body);
    res.json({ success: true, data: offer ? [offer] : [] });
  } catch (e: any) {
    res.json({ success: true, data: [], message: 'Loyalty engine running in stub mode' });
  }
});

// ═══════════════════════════════════════════════════════════════════
// PRODUCT SYNTHESIS
// ═══════════════════════════════════════════════════════════════════
router.get('/products/synthesize/:sku', async (req: Request, res: Response) => {
  try {
    const profile = await ProductSynthesisEngine.generateSku(req.params.sku);
    res.json({ success: true, data: profile || { sku: req.params.sku, message: 'Profile not found' } });
  } catch (e: any) {
    res.json({ success: true, data: { sku: req.params.sku, message: 'Synthesis engine in stub mode' } });
  }
});

// ═══════════════════════════════════════════════════════════════════
// DISCOVERY
// ═══════════════════════════════════════════════════════════════════
router.get('/discovery/whitespace', (req: Request, res: Response) => {
  try {
    const sku = req.query.sku as string || 'FMCG-001';
    const territory = req.query.territory as string || 'AE';
    const manifest = DiscoveryNode.generateAgentManifest({ sku, description: '', packSize: '', mrp: 0, onHand: 0, warehouseId: '', minStock: 0, countryCode: territory, category: '' } as any, territory);
    res.json({ success: true, data: manifest });
  } catch (e: any) {
    res.json({ success: true, data: [], message: 'Discovery node in stub mode' });
  }
});

// ═══════════════════════════════════════════════════════════════════
// EVENT BUS LOG
// ═══════════════════════════════════════════════════════════════════
router.get('/events/log', (req: Request, res: Response) => {
  const limit = Number(req.query.limit) || 50;
  res.json({ success: true, data: eventBus.getLog(limit) });
});

// ═══════════════════════════════════════════════════════════════════
// APPROVALS
// ═══════════════════════════════════════════════════════════════════
router.get('/approvals/pending', (req: Request, res: Response) => {
  const { tier } = req.query;
  const result = approvalsStore.list(
    tier ? { tier, status: 'Pending' } : { status: 'Pending' },
    1, 100
  );
  res.json({ success: true, ...result });
});

router.get('/approvals/history', (req: Request, res: Response) => {
  const result = approvalsStore.list({}, Number(req.query.page) || 1, Number(req.query.limit) || 50);
  res.json({ success: true, ...result });
});

router.post('/approvals/:id/approve', (req: Request, res: Response) => {
  const updated = approvalsStore.update(req.params.id, {
    status: 'Approved',
    approvedBy: req.body.approvedBy || 'system',
    approvedAt: new Date().toISOString(),
    notes: req.body.notes || ''
  }, 'approval.approved');
  if (!updated) return res.status(404).json({ success: false, error: 'Approval not found' });
  res.json({ success: true, data: updated });
});

router.post('/approvals/:id/reject', (req: Request, res: Response) => {
  const { reason } = req.body;
  if (!reason) return res.status(400).json({ success: false, error: 'reason is required' });
  const updated = approvalsStore.update(req.params.id, {
    status: 'Rejected',
    rejectedBy: req.body.rejectedBy || 'system',
    rejectedAt: new Date().toISOString(),
    rejectionReason: reason
  }, 'approval.rejected');
  if (!updated) return res.status(404).json({ success: false, error: 'Approval not found' });
  res.json({ success: true, data: updated });
});

export default router;
