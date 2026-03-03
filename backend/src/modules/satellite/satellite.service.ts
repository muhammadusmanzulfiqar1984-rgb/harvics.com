import { randomUUID } from 'crypto';
import { getMockSatelliteData, mockProvidersEnabled } from '../../external/mockProviders';

export interface SatelliteTile {
  tileId: string;
  countryCode: string;
  territory: string;
  centerLat: number;
  centerLng: number;
  approxPopulation: number;
  urbanDensityScore: number;
  roadAccessScore: number;
  retailerCount: number;
  totalSales: number;
  coverageScore: number;
  whiteSpace: boolean;
}

const countryAnchors: Record<string, { lat: number; lng: number }> = {
  AE: { lat: 24.4539, lng: 54.3773 },
  IN: { lat: 20.5937, lng: 78.9629 },
  SA: { lat: 23.8859, lng: 45.0792 },
  ZA: { lat: -30.5595, lng: 22.9375 },
  BR: { lat: -14.235, lng: -51.9253 },
  US: { lat: 37.0902, lng: -95.7129 },
  UK: { lat: 55.3781, lng: -3.436 },
  NG: { lat: 9.082, lng: 8.6753 },
  KE: { lat: -0.0236, lng: 37.9062 },
  CN: { lat: 35.8617, lng: 104.1954 }
};

const territoryLabels = [
  'North Cluster',
  'East Corridor',
  'South Basin',
  'West Delta',
  'Central Metro',
  'Harbor Ring',
  'Highlands',
  'Lake Region',
  'Desert Ridge'
];

const useMockProviders = mockProvidersEnabled();

export const generateTiles = (countryCode: string, segments = 24): SatelliteTile[] => {
  const upper = countryCode.trim().toUpperCase();
  const anchor = countryAnchors[upper] ?? { lat: 15, lng: 0 };

  return Array.from({ length: segments }).map((_, index) => {
    const variance = (index % 7) + upper.length;
    const lat = anchor.lat + Math.sin(index + variance) * 2.5;
    const lng = anchor.lng + Math.cos(index + variance) * 2.5;
    const rawScore = Math.abs(Math.sin(lat * lng + variance)) * 100;
    const population = Math.abs(Math.cos(lat + variance) * 50000) + 15000;
    const retailerCount = Math.round(rawScore / 10);
    const coverageScore = Number((rawScore / 100).toFixed(2));

    return {
      tileId: `${upper}-${territoryLabels[index % territoryLabels.length].split(' ')[0]}-${index + 1}`,
      countryCode: upper,
      territory: territoryLabels[index % territoryLabels.length],
      centerLat: Number(lat.toFixed(4)),
      centerLng: Number(lng.toFixed(4)),
      approxPopulation: Math.round(population),
      urbanDensityScore: Number((rawScore / 100).toFixed(2)),
      roadAccessScore: Number((Math.abs(Math.cos(variance + lng)) * 0.6 + 0.4).toFixed(2)),
      retailerCount,
      totalSales: Number((retailerCount * 1800).toFixed(2)),
      coverageScore,
      whiteSpace: coverageScore < 0.45
    };
  });
};

export const buildWhiteSpaceReport = (countryCode: string) => {
  const upper = countryCode.trim().toUpperCase();

  if (useMockProviders) {
    const mockData = getMockSatelliteData(upper);
    if (mockData?.tiles) {
      const tiles = mockData.tiles.map((tile: any) => ({
        ...tile,
        countryCode: upper
      }));
      const whitespaceTiles = tiles.filter((tile: any) => tile.whiteSpace);
      const coverageRate = Number(((tiles.length - whitespaceTiles.length) / tiles.length) * 100).toFixed(2);
      const highDensity = tiles.filter((tile: any) => tile.coverageScore >= 0.7).length;
      const mediumDensity = tiles.filter((tile: any) => tile.coverageScore >= 0.45 && tile.coverageScore < 0.7).length;
      const lowDensity = whitespaceTiles.length;

      return {
        countryCode: upper,
        tiles,
        roads: mockData.roads || [],
        summary: {
          totalTiles: tiles.length,
          coverageRate: Number(coverageRate),
          whiteSpaces: whitespaceTiles.length,
          highDensity,
          mediumDensity,
          lowDensity
        }
      };
    }
  }

  const tiles = generateTiles(countryCode);
  const whitespaceTiles = tiles.filter((tile) => tile.whiteSpace);
  const coverageRate = Number(((tiles.length - whitespaceTiles.length) / tiles.length) * 100).toFixed(2);
  const highDensity = tiles.filter((tile) => tile.coverageScore >= 0.7).length;
  const mediumDensity = tiles.filter((tile) => tile.coverageScore >= 0.45 && tile.coverageScore < 0.7).length;
  const lowDensity = whitespaceTiles.length;

  return {
    countryCode: upper,
    city: 'National Grid',
    tiles,
    roads: [],
    summary: {
      totalTiles: tiles.length,
      coverageRate: Number(coverageRate),
      whiteSpaces: whitespaceTiles.length,
      highDensity,
      mediumDensity,
      lowDensity
    }
  };
};

