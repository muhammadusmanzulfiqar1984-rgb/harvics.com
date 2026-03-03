/**
 * Country Data Service
 * Uses REST Countries API (FREE, no API key required)
 * https://restcountries.com/
 */

import { request } from 'undici';

const REST_COUNTRIES_URL = process.env.REST_COUNTRIES_API_URL || 
  'https://restcountries.com/v3.1';

export interface CountryData {
  name: {
    common: string;
    official: string;
  };
  cca2: string; // Country code (e.g., "PK", "US")
  cca3: string; // 3-letter code (e.g., "PAK", "USA")
  population: number;
  currencies: Record<string, {
    name: string;
    symbol: string;
  }>;
  capital: string[];
  region: string;
  subregion: string;
  languages: Record<string, string>;
  latlng: [number, number]; // [latitude, longitude]
  area: number;
  borders?: string[];
  gdp?: {
    value: number;
    currency: string;
  };
}

let cachedCountries: CountryData[] | null = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 86400000; // 24 hours in milliseconds

export async function getAllCountries(): Promise<CountryData[]> {
  try {
    const now = Date.now();
    
    // Return cached data if still valid
    if (cachedCountries && (now - cacheTimestamp) < CACHE_DURATION) {
      return cachedCountries;
    }

    const response = await request(`${REST_COUNTRIES_URL}/all`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (response.statusCode >= 200 && response.statusCode < 300) {
      const data = await response.body.json() as CountryData[];
      cachedCountries = data;
      cacheTimestamp = now;
      return data;
    } else {
      console.error(`REST Countries API error: ${response.statusCode}`);
      return cachedCountries || [];
    }
  } catch (error) {
    console.error('Failed to fetch countries:', error);
    return cachedCountries || [];
  }
}

export async function getCountryByCode(countryCode: string): Promise<CountryData | null> {
  try {
    const normalizedCode = countryCode.toUpperCase();
    
    const response = await request(`${REST_COUNTRIES_URL}/alpha/${normalizedCode}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (response.statusCode >= 200 && response.statusCode < 300) {
      const data = await response.body.json() as CountryData | CountryData[];
      // API returns array sometimes, get first element
      const country = Array.isArray(data) ? data[0] : data;
      return country;
    } else {
      console.error(`REST Countries API error for ${countryCode}: ${response.statusCode}`);
      return null;
    }
  } catch (error) {
    console.error(`Failed to fetch country ${countryCode}:`, error);
    return null;
  }
}

export async function getCountryByName(countryName: string): Promise<CountryData | null> {
  try {
    const response = await request(`${REST_COUNTRIES_URL}/name/${encodeURIComponent(countryName)}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (response.statusCode >= 200 && response.statusCode < 300) {
      const data = await response.body.json() as CountryData[];
      return data[0] || null;
    } else {
      console.error(`REST Countries API error for ${countryName}: ${response.statusCode}`);
      return null;
    }
  } catch (error) {
    console.error(`Failed to fetch country ${countryName}:`, error);
    return null;
  }
}

export async function getCountryPopulation(countryCode: string): Promise<number | null> {
  const country = await getCountryByCode(countryCode);
  return country?.population || null;
}

export async function getCountryGDP(countryCode: string): Promise<number | null> {
  // REST Countries API doesn't provide GDP directly
  // This would need World Bank API integration for real GDP data
  // For now, return null and let the service use fallback
  return null;
}

