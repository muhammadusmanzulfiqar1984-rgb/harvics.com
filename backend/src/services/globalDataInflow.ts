import axios from 'axios';
import puppeteer from 'puppeteer';
import { gpsRetailersDb, satelliteDb, territoryAssignmentsDb, routesDb, ordersDb, inventoryDb } from '../core/db';

// --- Sovereign Architect: Global Data Inflow ---
// Real-time Intelligence Stream: Economic, Environmental, Competitive, Internal Tier-2

export interface RealTimeEconomicData {
  currencyRate: number;
  inflation: number;
  taxRate: number;
}

export interface RealTimeWeatherData {
  tempCelsius: number;
  condition: string;
  shelfLifeRisk: 'High' | 'Medium' | 'Low';
}

export interface CompetitorPricing {
  product: string;
  price: number;
  currency: string;
  competitor: string;
  timestamp: Date;
}

export class GlobalDataInflow {

  // 1. ECONOMIC: Inflation & Currency
  // Uses ExchangeRate-API (Free Tier or Key)
  public static async getEconomicData(countryCode: string, baseCurrency: string = 'USD'): Promise<RealTimeEconomicData> {
    // Skip external call entirely when offline-mode is enabled (default for demo)
    if (process.env.HARVICS_OFFLINE_DATA === '1' || process.env.NODE_ENV !== 'production') {
      return { currencyRate: 1, inflation: 0.03, taxRate: 0.15 };
    }
    try {
      const response = await axios.get(`https://api.exchangerate-api.com/v4/latest/${baseCurrency}`, { timeout: 4000 });
      const rates = response.data.rates;
      const rate = rates[countryCode] || 1.0;
      return { currencyRate: rate, inflation: 0.05, taxRate: 0.15 };
    } catch (err) {
      console.warn(`[GlobalDataInflow] economic feed offline (${countryCode}) — using fallback`);
      return { currencyRate: 1, inflation: 0.03, taxRate: 0.15 };
    }
  }

  // 2. ENVIRONMENTAL: Weather
  // Uses OpenWeatherMap
  public static async getWeather(city: string): Promise<RealTimeWeatherData> {
    if (process.env.HARVICS_OFFLINE_DATA === '1' || process.env.NODE_ENV !== 'production') {
      return { tempCelsius: 28, condition: 'Sunny (demo)', shelfLifeRisk: 'Medium' };
    }
    try {
      const API_KEY = process.env.OPENWEATHER_API_KEY;
      if (!API_KEY) {
        return { tempCelsius: 28, condition: 'Sunny (no key)', shelfLifeRisk: 'Medium' };
      }
      const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}`, { timeout: 4000 });
      const tempC = response.data.main.temp - 273.15;
      const condition = response.data.weather[0].main;
      let risk: 'High' | 'Medium' | 'Low' = 'Low';
      if (tempC > 30) risk = 'High'; else if (tempC > 20) risk = 'Medium';
      return { tempCelsius: parseFloat(tempC.toFixed(1)), condition, shelfLifeRisk: risk };
    } catch (err) {
      console.warn(`[GlobalDataInflow] weather feed offline (${city}) — using fallback`);
      return { tempCelsius: 25, condition: 'Unknown', shelfLifeRisk: 'Low' };
    }
  }

  // 3. COMPETITIVE: Scraper Logic
  // Uses Puppeteer (Headless Browser)
  public static async getCompetitorPricing(targetUrl: string, competitorName: string): Promise<CompetitorPricing | null> {
    console.log(`[GlobalDataInflow] Scraping ${competitorName} at ${targetUrl}...`);
    
    let browser;
    try {
      browser = await puppeteer.launch({ headless: true });
      const page = await browser.newPage();
      
      // Set user agent to avoid bot detection
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
      
      await page.goto(targetUrl, { waitUntil: 'networkidle2', timeout: 30000 });

      // Selector logic would be specific to the site (e.g., Amazon, Tesco, Carrefour)
      // Here we simulate a generic price selector extraction
      const priceElement = await page.$('.price, .product-price, .offer-price'); // Generic selectors
      
      if (priceElement) {
        const text = await page.evaluate(el => el.textContent, priceElement);
        const price = parseFloat(text?.replace(/[^0-9.]/g, '') || '0');
        
        return {
          product: 'Unknown SKU', // Would extract title
          price,
          currency: 'Local', // Would extract currency symbol
          competitor: competitorName,
          timestamp: new Date()
        };
      }

      return null;
    } catch (error) {
      console.error('[GlobalDataInflow] Scraper Error:', error);
      return null;
    } finally {
      if (browser) await browser.close();
    }
  }

  // 4. INTERNAL: GPS Retail Coverage
  public static async getGPSCoverage(countryCode?: string) {
    const all = await gpsRetailersDb.list(countryCode ? { countryCode } : {}, 1, 10000);
    const filtered = all.data;
    const countries = new Set(filtered.map((r: any) => r.countryCode));
    return {
      totalRetailers: filtered.length,
      countriesCovered: countries.size,
      totalMonthlySales: filtered.reduce((s: number, r: any) => s + (r.monthlySales || 0), 0),
      byCountry: Array.from(countries).map(c => ({
        country: c,
        retailers: filtered.filter((r: any) => r.countryCode === c).length,
        sales: filtered.filter((r: any) => r.countryCode === c).reduce((s: number, r: any) => s + (r.monthlySales || 0), 0)
      }))
    };
  }

  // 5. INTERNAL: Satellite Market Gaps
  public static async getSatelliteInsights() {
    const whitespaces = await satelliteDb.list({}, 1, 10000);
    return {
      totalOpportunities: whitespaces.total,
      averageCoverage: whitespaces.data.reduce((s: number, w: any) => s + (w.coverageScore || 0), 0) / Math.max(whitespaces.total, 1),
      criticalGaps: whitespaces.data.filter((w: any) => (w.coverageScore || 0) < 35),
      opportunities: whitespaces.data
    };
  }

  // 6. INTERNAL: Territory Performance
  public static async getTerritoryPerformance() {
    const assignments = await territoryAssignmentsDb.list({}, 1, 10000);
    return {
      totalTerritories: assignments.total,
      averageCoverage: assignments.data.reduce((s: number, a: any) => s + (a.coverage || 0), 0) / Math.max(assignments.total, 1),
      underperforming: assignments.data.filter((a: any) => (a.coverage || 0) < 50),
      topPerforming: assignments.data.filter((a: any) => (a.coverage || 0) >= 75)
    };
  }

  // 7. INTERNAL: Supply Chain Metrics
  public static async getSupplyChainMetrics() {
    const [routes, orders, inventory] = await Promise.all([
      routesDb.list({}, 1, 10000),
      ordersDb.list({}, 1, 10000),
      inventoryDb.list({}, 1, 10000),
    ]);
    return {
      activeRoutes: routes.data.filter((r: any) => r.status === 'In Transit').length,
      totalRoutes: routes.total,
      pendingOrders: orders.data.filter((o: any) => o.status === 'Pending').length,
      lowStockItems: inventory.data.filter((i: any) => i.onHand < (i.minStock || 0)).length,
      supplyChainHealth: routes.data.filter((r: any) => r.status !== 'Delayed').length / Math.max(routes.total, 1) * 100
    };
  }
}
