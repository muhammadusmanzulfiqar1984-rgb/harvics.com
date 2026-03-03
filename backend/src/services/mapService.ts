/**
 * Map & Geocoding Service
 * Uses OpenStreetMap Nominatim API (FREE, no API key required)
 * https://nominatim.openstreetmap.org/
 */

import { request } from 'undici';

const NOMINATIM_URL = process.env.NOMINATIM_API_URL || 
  'https://nominatim.openstreetmap.org';

export interface GeocodeResult {
  lat: number;
  lon: number;
  displayName: string;
  address: {
    country?: string;
    countryCode?: string;
    city?: string;
    state?: string;
    postcode?: string;
  };
}

export interface ReverseGeocodeResult {
  displayName: string;
  address: {
    country?: string;
    countryCode?: string;
    city?: string;
    state?: string;
    postcode?: string;
  };
}

// Rate limiting: Nominatim allows 1 request per second
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 1000; // 1 second

async function rateLimitedRequest(url: string): Promise<any> {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  
  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    await new Promise(resolve => setTimeout(resolve, MIN_REQUEST_INTERVAL - timeSinceLastRequest));
  }
  
  lastRequestTime = Date.now();
  
  const response = await request(url, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'User-Agent': 'Harvics-Localization-System/1.0', // Required by Nominatim
    },
  });

  if (response.statusCode >= 200 && response.statusCode < 300) {
    return await response.body.json();
  } else {
    throw new Error(`Nominatim API error: ${response.statusCode}`);
  }
}

export async function geocode(query: string, countryCode?: string): Promise<GeocodeResult[]> {
  try {
    let url = `${NOMINATIM_URL}/search?format=json&q=${encodeURIComponent(query)}&limit=5`;
    if (countryCode) {
      url += `&countrycodes=${countryCode.toLowerCase()}`;
    }

    const results = await rateLimitedRequest(url);
    
    if (!Array.isArray(results) || results.length === 0) {
      return [];
    }

    return results.map((item: any) => ({
      lat: parseFloat(item.lat),
      lon: parseFloat(item.lon),
      displayName: item.display_name,
      address: {
        country: item.address?.country,
        countryCode: item.address?.country_code?.toUpperCase(),
        city: item.address?.city || item.address?.town || item.address?.village,
        state: item.address?.state,
        postcode: item.address?.postcode,
      },
    }));
  } catch (error) {
    console.error(`Failed to geocode "${query}":`, error);
    return [];
  }
}

export async function reverseGeocode(lat: number, lon: number): Promise<ReverseGeocodeResult | null> {
  try {
    const url = `${NOMINATIM_URL}/reverse?format=json&lat=${lat}&lon=${lon}`;
    
    const result = await rateLimitedRequest(url);
    
    if (!result || !result.address) {
      return null;
    }

    return {
      displayName: result.display_name || '',
      address: {
        country: result.address.country,
        countryCode: result.address.country_code?.toUpperCase(),
        city: result.address.city || result.address.town || result.address.village,
        state: result.address.state,
        postcode: result.address.postcode,
      },
    };
  } catch (error) {
    console.error(`Failed to reverse geocode ${lat}, ${lon}:`, error);
    return null;
  }
}

export async function searchPlaces(query: string, countryCode?: string): Promise<GeocodeResult[]> {
  return geocode(query, countryCode);
}

export async function getRouteDistance(
  fromLat: number,
  fromLon: number,
  toLat: number,
  toLon: number
): Promise<{ distance: number; duration: number } | null> {
  try {
    // Using OSRM (Open Source Routing Machine) for routing
    // This is a free routing service
    const OSRM_URL = process.env.OSRM_URL || 'http://router.project-osrm.org';
    const url = `${OSRM_URL}/route/v1/driving/${fromLon},${fromLat};${toLon},${toLat}?overview=false`;

    const response = await request(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (response.statusCode >= 200 && response.statusCode < 300) {
      const data = await response.body.json() as any;
      
      if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        return {
          distance: route.distance / 1000, // Convert to km
          duration: route.duration / 60, // Convert to minutes
        };
      }
    }
    
    return null;
  } catch (error) {
    console.error(`Failed to get route distance:`, error);
    return null;
  }
}

// Calculate straight-line distance using Haversine formula
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  return R * c; // Distance in km
}

