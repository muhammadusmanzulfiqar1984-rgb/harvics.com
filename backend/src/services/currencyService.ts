/**
 * Currency Exchange Rate Service
 * Uses ExchangeRate-API (FREE, no API key required)
 * https://www.exchangerate-api.com/
 */

import { request } from 'undici';

const EXCHANGE_RATE_URL = process.env.EXCHANGE_RATE_API_URL || 
  'https://api.exchangerate-api.com/v4/latest/USD';

interface ExchangeRateResponse {
  base: string;
  date: string;
  rates: Record<string, number>;
}

let cachedRates: ExchangeRateResponse | null = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 3600000; // 1 hour in milliseconds

export async function getExchangeRates(): Promise<Record<string, number> | null> {
  try {
    const now = Date.now();
    
    // Return cached data if still valid
    if (cachedRates && (now - cacheTimestamp) < CACHE_DURATION) {
      return cachedRates.rates;
    }

    const response = await request(EXCHANGE_RATE_URL, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (response.statusCode >= 200 && response.statusCode < 300) {
      const data = await response.body.json() as ExchangeRateResponse;
      cachedRates = data;
      cacheTimestamp = now;
      return data.rates;
    } else {
      console.error(`ExchangeRate-API error: ${response.statusCode}`);
      return cachedRates?.rates || null; // Return cached if available
    }
  } catch (error) {
    console.error('Failed to fetch exchange rates:', error);
    return cachedRates?.rates || null; // Return cached if available
  }
}

export async function getExchangeRate(baseCurrency: string, targetCurrency: string): Promise<number | null> {
  try {
    const rates = await getExchangeRates();
    if (!rates) return null;

    // If base is USD, return directly
    if (baseCurrency === 'USD') {
      return rates[targetCurrency] || null;
    }

    // If target is USD, calculate inverse
    if (targetCurrency === 'USD') {
      const baseRate = rates[baseCurrency];
      return baseRate ? 1 / baseRate : null;
    }

    // Convert through USD
    const baseToUSD = rates[baseCurrency];
    const usdToTarget = rates[targetCurrency];
    
    if (!baseToUSD || !usdToTarget) return null;
    
    return usdToTarget / baseToUSD;
  } catch (error) {
    console.error(`Failed to get exchange rate ${baseCurrency} -> ${targetCurrency}:`, error);
    return null;
  }
}

