/**
 * Countries, Regions, and Cities Service
 * Part of TIER_0_FOUNDATIONS: Localisation_Engine
 * 
 * This service handles CRUD operations for countries, regions, and cities
 * In production, this would connect to a PostgreSQL database
 * For now, we'll use in-memory storage with fallback to existing data
 */

import { 
  Country, 
  Region, 
  City, 
  CountryWithRelations,
  RegionWithRelations,
  CityWithRelations,
  CreateCountryRequest,
  UpdateCountryRequest,
  CreateRegionRequest,
  UpdateRegionRequest,
  CreateCityRequest,
  UpdateCityRequest,
  CountryFilters,
  RegionFilters,
  CityFilters
} from './countries.types';

// In-memory storage (will be replaced with database in production)
let countriesStore: Country[] = [];
let regionsStore: Region[] = [];
let citiesStore: City[] = [];

// Initialize with default data
function initializeDefaultData() {
  // This will be loaded from database in production
  // For now, we'll populate with common countries
  if (countriesStore.length === 0) {
    const defaultCountries: Omit<Country, 'id' | 'created_at' | 'updated_at'>[] = [
      { iso_code: 'PAK', name: 'Pakistan', currency_code: 'PKR' },
      { iso_code: 'OMN', name: 'Oman', currency_code: 'OMR' },
      { iso_code: 'ESP', name: 'Spain', currency_code: 'EUR' },
      { iso_code: 'USA', name: 'United States', currency_code: 'USD' },
      { iso_code: 'ARE', name: 'United Arab Emirates', currency_code: 'AED' },
      { iso_code: 'GBR', name: 'United Kingdom', currency_code: 'GBP' },
      { iso_code: 'ITA', name: 'Italy', currency_code: 'EUR' },
      { iso_code: 'FRA', name: 'France', currency_code: 'EUR' },
      { iso_code: 'DEU', name: 'Germany', currency_code: 'EUR' },
      { iso_code: 'CHN', name: 'China', currency_code: 'CNY' },
      { iso_code: 'IND', name: 'India', currency_code: 'INR' },
      { iso_code: 'SAU', name: 'Saudi Arabia', currency_code: 'SAR' },
    ];

    countriesStore = defaultCountries.map((country, index) => ({
      ...country,
      id: `country-${index + 1}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));
  }
}

initializeDefaultData();

// Countries Service
export class CountriesService {
  // Get all countries with optional filters
  static async getAllCountries(filters?: CountryFilters): Promise<Country[]> {
    initializeDefaultData();
    let countries = [...countriesStore];

    if (filters) {
      if (filters.iso_code) {
        countries = countries.filter(c => c.iso_code.toLowerCase() === filters.iso_code!.toLowerCase());
      }
      if (filters.currency_code) {
        countries = countries.filter(c => c.currency_code === filters.currency_code);
      }
      if (filters.name) {
        const searchTerm = filters.name.toLowerCase();
        countries = countries.filter(c => c.name.toLowerCase().includes(searchTerm));
      }
    }

    return countries;
  }

  // Get country by ID
  static async getCountryById(id: string): Promise<Country | null> {
    initializeDefaultData();
    return countriesStore.find(c => c.id === id) || null;
  }

  // Get country by ISO code
  static async getCountryByIsoCode(isoCode: string): Promise<Country | null> {
    initializeDefaultData();
    return countriesStore.find(c => c.iso_code.toLowerCase() === isoCode.toLowerCase()) || null;
  }

  // Get country with relations (regions and cities)
  static async getCountryWithRelations(id: string): Promise<CountryWithRelations | null> {
    const country = await this.getCountryById(id);
    if (!country) return null;

    const regions = await RegionsService.getRegionsByCountryId(id);
    const cities = await CitiesService.getCitiesByCountryId(id);

    return {
      ...country,
      regions,
      cities,
    };
  }

  // Create country
  static async createCountry(data: CreateCountryRequest): Promise<Country> {
    initializeDefaultData();
    
    // Check if ISO code already exists
    const existing = countriesStore.find(c => c.iso_code.toLowerCase() === data.iso_code.toLowerCase());
    if (existing) {
      throw new Error(`Country with ISO code ${data.iso_code} already exists`);
    }

    const newCountry: Country = {
      id: `country-${Date.now()}`,
      ...data,
      iso_code: data.iso_code.toUpperCase(),
      currency_code: data.currency_code.toUpperCase(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    countriesStore.push(newCountry);
    return newCountry;
  }

  // Update country
  static async updateCountry(id: string, data: UpdateCountryRequest): Promise<Country | null> {
    initializeDefaultData();
    const index = countriesStore.findIndex(c => c.id === id);
    if (index === -1) return null;

    countriesStore[index] = {
      ...countriesStore[index],
      ...data,
      updated_at: new Date().toISOString(),
    };

    return countriesStore[index];
  }

  // Delete country
  static async deleteCountry(id: string): Promise<boolean> {
    initializeDefaultData();
    const index = countriesStore.findIndex(c => c.id === id);
    if (index === -1) return false;

    countriesStore.splice(index, 1);
    // Also delete related regions and cities
    regionsStore = regionsStore.filter(r => r.country_id !== id);
    citiesStore = citiesStore.filter(c => c.country_id !== id);
    
    return true;
  }
}

// Regions Service
export class RegionsService {
  // Get all regions with optional filters
  static async getAllRegions(filters?: RegionFilters): Promise<Region[]> {
    let regions = [...regionsStore];

    if (filters) {
      if (filters.country_id) {
        regions = regions.filter(r => r.country_id === filters.country_id);
      }
      if (filters.code) {
        regions = regions.filter(r => r.code?.toLowerCase() === filters.code!.toLowerCase());
      }
      if (filters.name) {
        const searchTerm = filters.name.toLowerCase();
        regions = regions.filter(r => r.name.toLowerCase().includes(searchTerm));
      }
    }

    return regions;
  }

  // Get regions by country ID
  static async getRegionsByCountryId(countryId: string): Promise<Region[]> {
    return regionsStore.filter(r => r.country_id === countryId);
  }

  // Get region by ID
  static async getRegionById(id: string): Promise<Region | null> {
    return regionsStore.find(r => r.id === id) || null;
  }

  // Get region with relations
  static async getRegionWithRelations(id: string): Promise<RegionWithRelations | null> {
    const region = await this.getRegionById(id);
    if (!region) return null;

    const country = await CountriesService.getCountryById(region.country_id);
    const cities = await CitiesService.getCitiesByRegionId(id);

    return {
      ...region,
      country: country || undefined,
      cities,
    };
  }

  // Create region
  static async createRegion(data: CreateRegionRequest): Promise<Region> {
    // Verify country exists
    const country = await CountriesService.getCountryById(data.country_id);
    if (!country) {
      throw new Error(`Country with ID ${data.country_id} not found`);
    }

    const newRegion: Region = {
      id: `region-${Date.now()}`,
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    regionsStore.push(newRegion);
    return newRegion;
  }

  // Update region
  static async updateRegion(id: string, data: UpdateRegionRequest): Promise<Region | null> {
    const index = regionsStore.findIndex(r => r.id === id);
    if (index === -1) return null;

    regionsStore[index] = {
      ...regionsStore[index],
      ...data,
      updated_at: new Date().toISOString(),
    };

    return regionsStore[index];
  }

  // Delete region
  static async deleteRegion(id: string): Promise<boolean> {
    const index = regionsStore.findIndex(r => r.id === id);
    if (index === -1) return false;

    regionsStore.splice(index, 1);
    // Set region_id to null for cities in this region
    citiesStore = citiesStore.map(c => 
      c.region_id === id ? { ...c, region_id: undefined } : c
    );
    
    return true;
  }
}

// Cities Service
export class CitiesService {
  // Get all cities with optional filters
  static async getAllCities(filters?: CityFilters): Promise<City[]> {
    let cities = [...citiesStore];

    if (filters) {
      if (filters.country_id) {
        cities = cities.filter(c => c.country_id === filters.country_id);
      }
      if (filters.region_id) {
        cities = cities.filter(c => c.region_id === filters.region_id);
      }
      if (filters.name) {
        const searchTerm = filters.name.toLowerCase();
        cities = cities.filter(c => c.name.toLowerCase().includes(searchTerm));
      }
    }

    return cities;
  }

  // Get cities by country ID
  static async getCitiesByCountryId(countryId: string): Promise<City[]> {
    return citiesStore.filter(c => c.country_id === countryId);
  }

  // Get cities by region ID
  static async getCitiesByRegionId(regionId: string): Promise<City[]> {
    return citiesStore.filter(c => c.region_id === regionId);
  }

  // Get city by ID
  static async getCityById(id: string): Promise<City | null> {
    return citiesStore.find(c => c.id === id) || null;
  }

  // Get city with relations
  static async getCityWithRelations(id: string): Promise<CityWithRelations | null> {
    const city = await this.getCityById(id);
    if (!city) return null;

    const country = await CountriesService.getCountryById(city.country_id);
    const region = city.region_id ? await RegionsService.getRegionById(city.region_id) : undefined;

    return {
      ...city,
      country: country || undefined,
      region: region || undefined,
    };
  }

  // Create city
  static async createCity(data: CreateCityRequest): Promise<City> {
    // Verify country exists
    const country = await CountriesService.getCountryById(data.country_id);
    if (!country) {
      throw new Error(`Country with ID ${data.country_id} not found`);
    }

    // Verify region exists if provided
    if (data.region_id) {
      const region = await RegionsService.getRegionById(data.region_id);
      if (!region) {
        throw new Error(`Region with ID ${data.region_id} not found`);
      }
      // Verify region belongs to the country
      if (region.country_id !== data.country_id) {
        throw new Error(`Region does not belong to the specified country`);
      }
    }

    const newCity: City = {
      id: `city-${Date.now()}`,
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    citiesStore.push(newCity);
    return newCity;
  }

  // Update city
  static async updateCity(id: string, data: UpdateCityRequest): Promise<City | null> {
    const index = citiesStore.findIndex(c => c.id === id);
    if (index === -1) return null;

    // Verify region if being updated
    if (data.region_id) {
      const city = citiesStore[index];
      const region = await RegionsService.getRegionById(data.region_id);
      if (!region) {
        throw new Error(`Region with ID ${data.region_id} not found`);
      }
      if (region.country_id !== city.country_id) {
        throw new Error(`Region does not belong to the city's country`);
      }
    }

    citiesStore[index] = {
      ...citiesStore[index],
      ...data,
      updated_at: new Date().toISOString(),
    };

    return citiesStore[index];
  }

  // Delete city
  static async deleteCity(id: string): Promise<boolean> {
    const index = citiesStore.findIndex(c => c.id === id);
    if (index === -1) return false;

    citiesStore.splice(index, 1);
    return true;
  }
}

