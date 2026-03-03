export interface RetailerLocation {
  id: string;
  outletName: string;
  city: string;
  outletType: string;
  lat: number;
  lng: number;
  countryCode: string;
  monthlySales: number;
  distributorId?: number;
}

export interface CreateRetailerPayload {
  countryCode: string;
  city: string;
  outletName: string;
  outletType: string;
  lat: number;
  lng: number;
  monthlySales: number;
  distributorId?: number;
}

export interface GPSHeatmapPoint {
  lat: number;
  lng: number;
  intensity: number;
}

export interface GPSHeatmapResponse {
  countryCode: string;
  totalPoints: number;
  coverageAreas: number;
  points: GPSHeatmapPoint[];
}

export interface DistributorRoute {
  routeId: string;
  distributor: string;
  distanceKm: number;
  durationMinutes: number;
  path: Array<[number, number]>;
}

