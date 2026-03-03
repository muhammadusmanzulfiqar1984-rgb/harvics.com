/**
 * Countries, Regions, and Cities Controller
 * Part of TIER_0_FOUNDATIONS: Localisation_Engine
 * 
 * REST API endpoints for managing countries, regions, and cities
 */

import { Router, Request, Response } from 'express';
import { CountriesService, RegionsService, CitiesService } from './countries.service';
import { 
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

const router = Router();

// ==================== COUNTRIES ====================

/**
 * GET /api/localisation/countries
 * Get all countries with optional filters
 */
router.get('/countries', async (req: Request, res: Response) => {
  try {
    const filters: CountryFilters = {
      iso_code: req.query.iso_code as string,
      currency_code: req.query.currency_code as string,
      name: req.query.name as string,
    };

    const countries = await CountriesService.getAllCountries(filters);
    res.json({
      success: true,
      data: countries,
      count: countries.length,
    });
  } catch (error) {
    console.error('Error fetching countries:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch countries',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/localisation/countries/:id
 * Get country by ID with relations
 */
router.get('/countries/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const includeRelations = req.query.include === 'relations';

    if (includeRelations) {
      const country = await CountriesService.getCountryWithRelations(id);
      if (!country) {
        return res.status(404).json({
          success: false,
          error: 'Country not found',
        });
      }
      return res.json({
        success: true,
        data: country,
      });
    }

    const country = await CountriesService.getCountryById(id);
    if (!country) {
      return res.status(404).json({
        success: false,
        error: 'Country not found',
      });
    }

    res.json({
      success: true,
      data: country,
    });
  } catch (error) {
    console.error('Error fetching country:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch country',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/localisation/countries/iso/:isoCode
 * Get country by ISO code
 */
router.get('/countries/iso/:isoCode', async (req: Request, res: Response) => {
  try {
    const { isoCode } = req.params;
    const country = await CountriesService.getCountryByIsoCode(isoCode);
    
    if (!country) {
      return res.status(404).json({
        success: false,
        error: `Country with ISO code ${isoCode} not found`,
      });
    }

    res.json({
      success: true,
      data: country,
    });
  } catch (error) {
    console.error('Error fetching country by ISO code:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch country',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /api/localisation/countries
 * Create new country
 */
router.post('/countries', async (req: Request, res: Response) => {
  try {
    const data: CreateCountryRequest = req.body;

    // Validation
    if (!data.iso_code || !data.name || !data.currency_code) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: iso_code, name, currency_code',
      });
    }

    const country = await CountriesService.createCountry(data);
    res.status(201).json({
      success: true,
      data: country,
    });
  } catch (error) {
    console.error('Error creating country:', error);
    res.status(400).json({
      success: false,
      error: 'Failed to create country',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * PUT /api/localisation/countries/:id
 * Update country
 */
router.put('/countries/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data: UpdateCountryRequest = req.body;

    const country = await CountriesService.updateCountry(id, data);
    if (!country) {
      return res.status(404).json({
        success: false,
        error: 'Country not found',
      });
    }

    res.json({
      success: true,
      data: country,
    });
  } catch (error) {
    console.error('Error updating country:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update country',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * DELETE /api/localisation/countries/:id
 * Delete country
 */
router.delete('/countries/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await CountriesService.deleteCountry(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Country not found',
      });
    }

    res.json({
      success: true,
      message: 'Country deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting country:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete country',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// ==================== REGIONS ====================

/**
 * GET /api/localisation/regions
 * Get all regions with optional filters
 */
router.get('/regions', async (req: Request, res: Response) => {
  try {
    const filters: RegionFilters = {
      country_id: req.query.country_id as string,
      code: req.query.code as string,
      name: req.query.name as string,
    };

    const regions = await RegionsService.getAllRegions(filters);
    res.json({
      success: true,
      data: regions,
      count: regions.length,
    });
  } catch (error) {
    console.error('Error fetching regions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch regions',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/localisation/regions/:id
 * Get region by ID with relations
 */
router.get('/regions/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const includeRelations = req.query.include === 'relations';

    if (includeRelations) {
      const region = await RegionsService.getRegionWithRelations(id);
      if (!region) {
        return res.status(404).json({
          success: false,
          error: 'Region not found',
        });
      }
      return res.json({
        success: true,
        data: region,
      });
    }

    const region = await RegionsService.getRegionById(id);
    if (!region) {
      return res.status(404).json({
        success: false,
        error: 'Region not found',
      });
    }

    res.json({
      success: true,
      data: region,
    });
  } catch (error) {
    console.error('Error fetching region:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch region',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /api/localisation/regions
 * Create new region
 */
router.post('/regions', async (req: Request, res: Response) => {
  try {
    const data: CreateRegionRequest = req.body;

    // Validation
    if (!data.country_id || !data.name) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: country_id, name',
      });
    }

    const region = await RegionsService.createRegion(data);
    res.status(201).json({
      success: true,
      data: region,
    });
  } catch (error) {
    console.error('Error creating region:', error);
    res.status(400).json({
      success: false,
      error: 'Failed to create region',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * PUT /api/localisation/regions/:id
 * Update region
 */
router.put('/regions/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data: UpdateRegionRequest = req.body;

    const region = await RegionsService.updateRegion(id, data);
    if (!region) {
      return res.status(404).json({
        success: false,
        error: 'Region not found',
      });
    }

    res.json({
      success: true,
      data: region,
    });
  } catch (error) {
    console.error('Error updating region:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update region',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * DELETE /api/localisation/regions/:id
 * Delete region
 */
router.delete('/regions/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await RegionsService.deleteRegion(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Region not found',
      });
    }

    res.json({
      success: true,
      message: 'Region deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting region:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete region',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// ==================== CITIES ====================

/**
 * GET /api/localisation/cities
 * Get all cities with optional filters
 */
router.get('/cities', async (req: Request, res: Response) => {
  try {
    const filters: CityFilters = {
      country_id: req.query.country_id as string,
      region_id: req.query.region_id as string,
      name: req.query.name as string,
    };

    const cities = await CitiesService.getAllCities(filters);
    res.json({
      success: true,
      data: cities,
      count: cities.length,
    });
  } catch (error) {
    console.error('Error fetching cities:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch cities',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/localisation/cities/:id
 * Get city by ID with relations
 */
router.get('/cities/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const includeRelations = req.query.include === 'relations';

    if (includeRelations) {
      const city = await CitiesService.getCityWithRelations(id);
      if (!city) {
        return res.status(404).json({
          success: false,
          error: 'City not found',
        });
      }
      return res.json({
        success: true,
        data: city,
      });
    }

    const city = await CitiesService.getCityById(id);
    if (!city) {
      return res.status(404).json({
        success: false,
        error: 'City not found',
      });
    }

    res.json({
      success: true,
      data: city,
    });
  } catch (error) {
    console.error('Error fetching city:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch city',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /api/localisation/cities
 * Create new city
 */
router.post('/cities', async (req: Request, res: Response) => {
  try {
    const data: CreateCityRequest = req.body;

    // Validation
    if (!data.country_id || !data.name) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: country_id, name',
      });
    }

    const city = await CitiesService.createCity(data);
    res.status(201).json({
      success: true,
      data: city,
    });
  } catch (error) {
    console.error('Error creating city:', error);
    res.status(400).json({
      success: false,
      error: 'Failed to create city',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * PUT /api/localisation/cities/:id
 * Update city
 */
router.put('/cities/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data: UpdateCityRequest = req.body;

    const city = await CitiesService.updateCity(id, data);
    if (!city) {
      return res.status(404).json({
        success: false,
        error: 'City not found',
      });
    }

    res.json({
      success: true,
      data: city,
    });
  } catch (error) {
    console.error('Error updating city:', error);
    res.status(400).json({
      success: false,
      error: 'Failed to update city',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * DELETE /api/localisation/cities/:id
 * Delete city
 */
router.delete('/cities/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await CitiesService.deleteCity(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'City not found',
      });
    }

    res.json({
      success: true,
      message: 'City deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting city:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete city',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;

