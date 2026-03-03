import { randomUUID } from 'crypto';
import { CreateRetailerPayload, DistributorRoute, GPSHeatmapResponse, RetailerLocation } from './gps.types';
import { getMockMapData, mockProvidersEnabled } from '../../external/mockProviders';

const gpsRetailerDb: RetailerLocation[] = [
  {
    id: randomUUID(),
    outletName: 'FreshCart Hypermarket',
    city: 'Dubai',
    outletType: 'modern_trade',
    lat: 25.2048,
    lng: 55.2708,
    countryCode: 'AE',
    monthlySales: 950_000
  },
  {
    id: randomUUID(),
    outletName: 'Reliance Smart',
    city: 'Mumbai',
    outletType: 'modern_trade',
    lat: 19.076,
    lng: 72.8777,
    countryCode: 'IN',
    monthlySales: 410_000
  },
  {
    id: randomUUID(),
    outletName: 'BigBasket Dark Store',
    city: 'Bengaluru',
    outletType: 'q-commerce',
    lat: 12.9716,
    lng: 77.5946,
    countryCode: 'IN',
    monthlySales: 285_000
  },
  {
    id: randomUUID(),
    outletName: 'Shoprite Checkers',
    city: 'Cape Town',
    outletType: 'hypermarket',
    lat: -33.9249,
    lng: 18.4241,
    countryCode: 'ZA',
    monthlySales: 320_000
  },
  {
    id: randomUUID(),
    outletName: 'Carrefour Market',
    city: 'Riyadh',
    outletType: 'modern_trade',
    lat: 24.7136,
    lng: 46.6753,
    countryCode: 'SA',
    monthlySales: 600_000
  },
  {
    id: randomUUID(),
    outletName: 'MercadoLibre Hub',
    city: 'São Paulo',
    outletType: 'e-commerce',
    lat: -23.5505,
    lng: -46.6333,
    countryCode: 'BR',
    monthlySales: 430_000
  },
  {
    id: randomUUID(),
    outletName: 'Lulu Express',
    city: 'Abu Dhabi',
    outletType: 'modern_trade',
    lat: 24.4539,
    lng: 54.3773,
    countryCode: 'AE',
    monthlySales: 510_000
  },
  {
    id: randomUUID(),
    outletName: 'Sedano Wholesale',
    city: 'Miami',
    outletType: 'cash_and_carry',
    lat: 25.7617,
    lng: -80.1918,
    countryCode: 'US',
    monthlySales: 380_000
  },
  {
    id: randomUUID(),
    outletName: 'Nakumatt Revival Store',
    city: 'Nairobi',
    outletType: 'supermarket',
    lat: -1.2921,
    lng: 36.8219,
    countryCode: 'KE',
    monthlySales: 210_000
  },
  {
    id: randomUUID(),
    outletName: 'SM Hypermarket',
    city: 'Manila',
    outletType: 'modern_trade',
    lat: 14.5995,
    lng: 120.9842,
    countryCode: 'PH',
    monthlySales: 275_000
  },
  {
    id: randomUUID(),
    outletName: 'Imtiaz Super Karachi',
    city: 'Karachi',
    outletType: 'cash_and_carry',
    lat: 24.8934,
    lng: 67.0281,
    countryCode: 'PK',
    monthlySales: 240_000
  },
  {
    id: randomUUID(),
    outletName: 'Metro Lahore GT',
    city: 'Lahore',
    outletType: 'modern_trade',
    lat: 31.5204,
    lng: 74.3587,
    countryCode: 'PK',
    monthlySales: 210_000
  },
  {
    id: randomUUID(),
    outletName: 'El Corte Inglés Castellana',
    city: 'Madrid',
    outletType: 'modern_trade',
    lat: 40.4476,
    lng: -3.6909,
    countryCode: 'ES',
    monthlySales: 360_000
  },
  {
    id: randomUUID(),
    outletName: 'BonÀrea Barcelona',
    city: 'Barcelona',
    outletType: 'convenience',
    lat: 41.3902,
    lng: 2.154,
    countryCode: 'ES',
    monthlySales: 185_000
  },
  {
    id: randomUUID(),
    outletName: 'Loblaws Maple Leaf',
    city: 'Toronto',
    outletType: 'modern_trade',
    lat: 43.6629,
    lng: -79.3957,
    countryCode: 'CA',
    monthlySales: 320_000
  },
  {
    id: randomUUID(),
    outletName: 'Costco Burnaby',
    city: 'Vancouver',
    outletType: 'club',
    lat: 49.2488,
    lng: -123.0016,
    countryCode: 'CA',
    monthlySales: 410_000
  },
  {
    id: randomUUID(),
    outletName: 'Lulu Hypermarket Muscat',
    city: 'Muscat',
    outletType: 'modern_trade',
    lat: 23.5859,
    lng: 58.4059,
    countryCode: 'OM',
    monthlySales: 265_000
  },
  {
    id: randomUUID(),
    outletName: 'Carrefour Qurum',
    city: 'Muscat',
    outletType: 'modern_trade',
    lat: 23.6086,
    lng: 58.515,
    countryCode: 'OM',
    monthlySales: 215_000
  }
];

const useMockProviders = mockProvidersEnabled();

export const addRetailer = (payload: CreateRetailerPayload): RetailerLocation => {
  const retailer: RetailerLocation = {
    id: randomUUID(),
    outletName: payload.outletName,
    city: payload.city,
    outletType: payload.outletType,
    lat: payload.lat,
    lng: payload.lng,
    countryCode: payload.countryCode.trim().toUpperCase(),
    monthlySales: payload.monthlySales,
    distributorId: payload.distributorId
  };
  gpsRetailerDb.push(retailer);
  return retailer;
};

export const getRetailersByCountry = (countryCode: string) => {
  const normalized = countryCode.trim().toUpperCase();
  const retailers = gpsRetailerDb.filter((retailer) => retailer.countryCode === normalized);
  const totalMonthlySales = retailers.reduce((sum, retailer) => sum + retailer.monthlySales, 0);

  return {
    countryCode: normalized,
    totalRetailers: retailers.length,
    totalMonthlySales,
    retailers
  };
};

export const getHeatmapByCountry = (countryCode: string): GPSHeatmapResponse => {
  const normalized = countryCode.trim().toUpperCase();
  if (useMockProviders) {
    const mapData = getMockMapData(normalized);
    if (mapData?.heatmap) {
      return {
        countryCode: normalized,
        totalPoints: mapData.heatmap.totalPoints,
        coverageAreas: mapData.heatmap.coverageAreas,
        points: mapData.heatmap.points
      };
    }
  }

  const summary = getRetailersByCountry(normalized);
  const points = summary.retailers.slice(0, 10).map((retailer) => ({
    lat: retailer.lat,
    lng: retailer.lng,
    intensity: Math.min(1, Math.max(0.2, retailer.monthlySales / (summary.totalMonthlySales || 1)))
  }));

  return {
    countryCode: normalized,
    totalPoints: summary.totalRetailers,
    coverageAreas: Math.max(1, Math.round(summary.totalRetailers / 5)),
    points
  };
};

export const getDistributorRoutes = (countryCode: string): DistributorRoute[] => {
  const normalized = countryCode.trim().toUpperCase();
  if (useMockProviders) {
    const mapData = getMockMapData(normalized);
    return mapData?.routes || [];
  }
  return [];
};

