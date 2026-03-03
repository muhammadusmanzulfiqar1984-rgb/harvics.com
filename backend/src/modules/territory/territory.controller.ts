import { Router, Request, Response } from 'express';

const router = Router();

// Mock data for continents (in production, fetch from database)
const continents = [
  { id: 'global', code: 'GLOBAL', name: 'Global', displayName: 'Global' },
  { id: 'eu', code: 'EU', name: 'Europe', displayName: 'Europe' },
  { id: 'as', code: 'AS', name: 'Asia', displayName: 'Asia' },
  { id: 'na', code: 'NA', name: 'North America', displayName: 'North America' },
  { id: 'sa', code: 'SA', name: 'South America', displayName: 'South America' },
  { id: 'af', code: 'AF', name: 'Africa', displayName: 'Africa' },
  { id: 'oc', code: 'OC', name: 'Oceania', displayName: 'Oceania' }
];

// Mock data for regions (in production, fetch from database)
const regions: Record<string, any[]> = {
  EU: [
    { id: 'weu', code: 'WEU', name: 'Western Europe', displayName: 'Western Europe', continentId: 'eu' },
    { id: 'eeu', code: 'EEU', name: 'Eastern Europe', displayName: 'Eastern Europe', continentId: 'eu' },
    { id: 'neu', code: 'NEU', name: 'Northern Europe', displayName: 'Northern Europe', continentId: 'eu' },
    { id: 'seu', code: 'SEU', name: 'Southern Europe', displayName: 'Southern Europe', continentId: 'eu' }
  ],
  AS: [
    { id: 'sea', code: 'SEA', name: 'Southeast Asia', displayName: 'Southeast Asia', continentId: 'as' },
    { id: 'ea', code: 'EA', name: 'East Asia', displayName: 'East Asia', continentId: 'as' },
    { id: 'sa', code: 'SA', name: 'South Asia', displayName: 'South Asia', continentId: 'as' },
    { id: 'wa', code: 'WA', name: 'West Asia', displayName: 'West Asia', continentId: 'as' }
  ]
};

// GET /api/territory/continents
router.get('/continents', (_req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      data: continents,
      count: continents.length
    });
  } catch (error: any) {
    console.error('Get continents error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch continents'
    });
  }
});

// GET /api/territory/regions
router.get('/regions', (req: Request, res: Response) => {
  try {
    const { continentCode } = req.query;
    
    if (continentCode) {
      // Return regions for specific continent
      const continentRegions = regions[continentCode as string] || [];
      res.json({
        success: true,
        data: continentRegions,
        count: continentRegions.length,
        continentCode
      });
    } else {
      // Return all regions
      const allRegions = Object.values(regions).flat();
      res.json({
        success: true,
        data: allRegions,
        count: allRegions.length
      });
    }
  } catch (error: any) {
    console.error('Get regions error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch regions'
    });
  }
});

// GET /api/territory/countries
router.get('/countries', (req: Request, res: Response) => {
  try {
    const { regionCode, continentCode } = req.query;
    
    // Mock countries data (in production, fetch from database)
    const countries = [
      { id: 'gb', code: 'GBR', name: 'United Kingdom', displayName: 'United Kingdom', regionCode: 'WEU', continentCode: 'EU' },
      { id: 'fr', code: 'FRA', name: 'France', displayName: 'France', regionCode: 'WEU', continentCode: 'EU' },
      { id: 'de', code: 'DEU', name: 'Germany', displayName: 'Germany', regionCode: 'WEU', continentCode: 'EU' },
      { id: 'ae', code: 'ARE', name: 'United Arab Emirates', displayName: 'United Arab Emirates', regionCode: 'WA', continentCode: 'AS' },
      { id: 'pk', code: 'PAK', name: 'Pakistan', displayName: 'Pakistan', regionCode: 'SA', continentCode: 'AS' },
      { id: 'us', code: 'USA', name: 'United States', displayName: 'United States', regionCode: 'NA', continentCode: 'NA' }
    ];
    
    let filteredCountries = countries;
    
    if (regionCode) {
      filteredCountries = countries.filter(c => c.regionCode === regionCode);
    }
    
    if (continentCode) {
      filteredCountries = countries.filter(c => c.continentCode === continentCode);
    }
    
    res.json({
      success: true,
      data: filteredCountries,
      count: filteredCountries.length,
      filters: { regionCode, continentCode }
    });
  } catch (error: any) {
    console.error('Get countries error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch countries'
    });
  }
});

// GET /api/territory/cities
router.get('/cities', (req: Request, res: Response) => {
  try {
    const { countryCode } = req.query;
    
    // Mock cities data (in production, fetch from database)
    const cities = [
      { id: 'lon', code: 'LON', name: 'London', displayName: 'London', countryCode: 'GBR' },
      { id: 'man', code: 'MAN', name: 'Manchester', displayName: 'Manchester', countryCode: 'GBR' },
      { id: 'dxb', code: 'DXB', name: 'Dubai', displayName: 'Dubai', countryCode: 'ARE' },
      { id: 'auh', code: 'AUH', name: 'Abu Dhabi', displayName: 'Abu Dhabi', countryCode: 'ARE' },
      { id: 'khi', code: 'KHI', name: 'Karachi', displayName: 'Karachi', countryCode: 'PAK' },
      { id: 'lhr', code: 'LHR', name: 'Lahore', displayName: 'Lahore', countryCode: 'PAK' }
    ];
    
    let filteredCities = cities;
    
    if (countryCode) {
      filteredCities = cities.filter(c => c.countryCode === countryCode);
    }
    
    res.json({
      success: true,
      data: filteredCities,
      count: filteredCities.length,
      filters: { countryCode }
    });
  } catch (error: any) {
    console.error('Get cities error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch cities'
    });
  }
});

// GET /api/territory/districts
router.get('/districts', (req: Request, res: Response) => {
  try {
    const { cityCode } = req.query;
    
    // Mock districts data (in production, fetch from database)
    const districts = [
      { id: 'west', code: 'WEST', name: 'Westminster', displayName: 'Westminster', cityCode: 'LON' },
      { id: 'cam', code: 'CAM', name: 'Camden', displayName: 'Camden', cityCode: 'LON' },
      { id: 'kin', code: 'KIN', name: 'Kensington', displayName: 'Kensington', cityCode: 'LON' },
      { id: 'bb', code: 'BB', name: 'Business Bay', displayName: 'Business Bay', cityCode: 'DXB' },
      { id: 'mar', code: 'MAR', name: 'Marina', displayName: 'Marina', cityCode: 'DXB' }
    ];
    
    let filteredDistricts = districts;
    
    if (cityCode) {
      filteredDistricts = districts.filter(d => d.cityCode === cityCode);
    }
    
    res.json({
      success: true,
      data: filteredDistricts,
      count: filteredDistricts.length,
      filters: { cityCode }
    });
  } catch (error: any) {
    console.error('Get districts error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch districts'
    });
  }
});

// GET /api/territory/areas
router.get('/areas', (req: Request, res: Response) => {
  try {
    const { districtCode } = req.query;
    
    // Mock areas data (in production, fetch from database)
    const areas = [
      { id: 'edg', code: 'EDG', name: 'Edgeware Road', displayName: 'Edgeware Road', districtCode: 'WEST' },
      { id: 'oxf', code: 'OXF', name: 'Oxford Street', displayName: 'Oxford Street', districtCode: 'WEST' },
      { id: 'reg', code: 'REG', name: 'Regent Street', displayName: 'Regent Street', districtCode: 'WEST' }
    ];
    
    let filteredAreas = areas;
    
    if (districtCode) {
      filteredAreas = areas.filter(a => a.districtCode === districtCode);
    }
    
    res.json({
      success: true,
      data: filteredAreas,
      count: filteredAreas.length,
      filters: { districtCode }
    });
  } catch (error: any) {
    console.error('Get areas error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch areas'
    });
  }
});

// GET /api/territory/locations
router.get('/locations', (req: Request, res: Response) => {
  try {
    const { areaCode, districtCode } = req.query;
    
    // Mock locations data (in production, fetch from database)
    const locations = [
      { 
        id: 'vic-cas-001', 
        code: 'VIC-CAS-001', 
        name: 'Victoria Casino', 
        displayName: 'Victoria Casino',
        areaCode: 'EDG',
        districtCode: 'WEST',
        address: 'Edgeware Road, Westminster, London',
        coordinates: { lat: 51.5155, lng: -0.1755 },
        locationType: 'retailer'
      },
      { 
        id: 'edg-ret-002', 
        code: 'EDG-RET-002', 
        name: 'Edgeware Retail Store', 
        displayName: 'Edgeware Retail Store',
        areaCode: 'EDG',
        districtCode: 'WEST',
        address: 'Edgeware Road, Westminster, London',
        coordinates: { lat: 51.5160, lng: -0.1760 },
        locationType: 'retailer'
      }
    ];
    
    let filteredLocations = locations;
    
    if (areaCode) {
      filteredLocations = locations.filter(l => l.areaCode === areaCode);
    }
    
    if (districtCode) {
      filteredLocations = locations.filter(l => l.districtCode === districtCode);
    }
    
    res.json({
      success: true,
      data: filteredLocations,
      count: filteredLocations.length,
      filters: { areaCode, districtCode }
    });
  } catch (error: any) {
    console.error('Get locations error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch locations'
    });
  }
});

// GET /api/territory/hierarchy/:locationId
router.get('/hierarchy/:locationId', (req: Request, res: Response) => {
  try {
    const { locationId } = req.params;
    
    // Mock hierarchy path (in production, fetch from database)
    const hierarchyPaths: Record<string, any> = {
      'vic-cas-001': {
        fullPath: 'Global / Europe / Western Europe / United Kingdom / London / Westminster / Edgeware Road / Victoria Casino',
        pathCodes: 'GLOBAL/EU/WEU/GBR/LON/WEST/EDG/VIC-CAS-001',
        levels: {
          level1: { code: 'GLOBAL', name: 'Global' },
          level2: { code: 'EU', name: 'Europe' },
          level3: { code: 'WEU', name: 'Western Europe' },
          level4: { code: 'GBR', name: 'United Kingdom' },
          level5: { code: 'LON', name: 'London' },
          level6: { code: 'WEST', name: 'Westminster' },
          level7: { code: 'EDG', name: 'Edgeware Road' },
          level8: { code: 'VIC-CAS-001', name: 'Victoria Casino' }
        }
      }
    };
    
    const hierarchy = hierarchyPaths[locationId];
    
    if (!hierarchy) {
      return res.status(404).json({
        success: false,
        error: 'Location not found'
      });
    }
    
    res.json({
      success: true,
      data: hierarchy,
      locationId
    });
  } catch (error: any) {
    console.error('Get hierarchy error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch hierarchy'
    });
  }
});

export default router;

