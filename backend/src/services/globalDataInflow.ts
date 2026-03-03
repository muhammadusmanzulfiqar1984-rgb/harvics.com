import axios from 'axios';
import puppeteer from 'puppeteer';

// --- Sovereign Architect: Global Data Inflow ---
// Real-time Intelligence Stream: Economic, Environmental, Competitive

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
    try {
      console.log(`[GlobalDataInflow] Fetching economic data for ${countryCode}...`);
      // In production, move API key to env variable
      const response = await axios.get(`https://api.exchangerate-api.com/v4/latest/${baseCurrency}`);
      
      const rates = response.data.rates;
      const rate = rates[countryCode] || 1.0;

      // Logic: Inflation estimation (Placeholder - would connect to World Bank API)
      const inflationEstimate = 0.05; 
      
      return {
        currencyRate: rate,
        inflation: inflationEstimate,
        taxRate: 0.15 // Default fallback, should override with local Tax Rules
      };
    } catch (error) {
      console.error('[GlobalDataInflow] Economic API Error:', error);
      return { currencyRate: 1, inflation: 0.03, taxRate: 0.15 }; // Fallback
    }
  }

  // 2. ENVIRONMENTAL: Weather
  // Uses OpenWeatherMap
  public static async getWeather(city: string): Promise<RealTimeWeatherData> {
    try {
      console.log(`[GlobalDataInflow] Fetching weather for ${city}...`);
      const API_KEY = process.env.OPENWEATHER_API_KEY || 'YOUR_FREE_KEY'; 
      
      // If no key provided in env, return simulation to prevent crash
      if (API_KEY === 'YOUR_FREE_KEY') {
         console.warn('[GlobalDataInflow] No Weather API Key. Returning simulation.');
         return { tempCelsius: 35, condition: 'Sunny (Simulated)', shelfLifeRisk: 'High' };
      }

      const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}`);
      
      const tempK = response.data.main.temp;
      const tempC = tempK - 273.15;
      const condition = response.data.weather[0].main;

      let risk: 'High' | 'Medium' | 'Low' = 'Low';
      if (tempC > 30) risk = 'High';
      else if (tempC > 20) risk = 'Medium';

      return {
        tempCelsius: parseFloat(tempC.toFixed(1)),
        condition,
        shelfLifeRisk: risk
      };

    } catch (error) {
      console.error('[GlobalDataInflow] Weather API Error:', error);
      return { tempCelsius: 25, condition: 'Unknown', shelfLifeRisk: 'Low' }; // Fallback
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
}
