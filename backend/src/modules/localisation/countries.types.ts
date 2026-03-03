/**
 * Countries, Regions, and Cities Types
 * Part of TIER_0_FOUNDATIONS: Localisation_Engine
 */

export interface Country {
  id: string; // UUID
  iso_code: string; // e.g. PAK, OMN, ESP
  name: string;
  currency_code: string; // PKR, OMR, EUR
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
}

export interface Region {
  id: string; // UUID
  country_id: string; // UUID
  name: string;
  code?: string; // Optional region code
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
}

export interface City {
  id: string; // UUID
  country_id: string; // UUID
  region_id?: string; // UUID, optional
  name: string;
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
}

export interface CountryWithRelations extends Country {
  regions?: Region[];
  cities?: City[];
}

export interface RegionWithRelations extends Region {
  country?: Country;
  cities?: City[];
}

export interface CityWithRelations extends City {
  country?: Country;
  region?: Region;
}

// Request/Response types for API
export interface CreateCountryRequest {
  iso_code: string;
  name: string;
  currency_code: string;
}

export interface UpdateCountryRequest {
  name?: string;
  currency_code?: string;
}

export interface CreateRegionRequest {
  country_id: string;
  name: string;
  code?: string;
}

export interface UpdateRegionRequest {
  name?: string;
  code?: string;
}

export interface CreateCityRequest {
  country_id: string;
  region_id?: string;
  name: string;
}

export interface UpdateCityRequest {
  name?: string;
  region_id?: string;
}

// Query filters
export interface CountryFilters {
  iso_code?: string;
  currency_code?: string;
  name?: string; // Search by name
}

export interface RegionFilters {
  country_id?: string;
  code?: string;
  name?: string; // Search by name
}

export interface CityFilters {
  country_id?: string;
  region_id?: string;
  name?: string; // Search by name
}

