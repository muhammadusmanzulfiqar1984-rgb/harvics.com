// Geographic Hierarchy Types

export interface GeographicScope {
  // Level 1: Global (always present)
  global?: boolean
  
  // Level 2: Continents
  continents?: string[]  // ['EU', 'AS', 'NA']
  
  // Level 3: Regions
  regions?: string[]  // ['WEU', 'EEU', 'SEA']
  
  // Level 4: Countries
  countries?: string[]  // ['GBR', 'FRA', 'DEU']
  
  // Level 5: Cities
  cities?: string[]  // ['LON', 'PAR', 'BER']
  
  // Level 6: Districts
  districts?: string[]  // ['WEST', 'CAM', 'KIN']
  
  // Level 7: Areas/Streets
  areas?: string[]  // ['EDG', 'OXF']
  
  // Level 8: Specific Locations
  locations?: string[]  // ['VIC-CAS-001']
  
  // Territories (abstracted coverage areas)
  territories?: string[]  // ['TERR-LON-001']
}

export interface GeographicHierarchy {
  level1: { code: 'GLOBAL', name: 'Global' }
  level2?: { code: string, name: string }  // Continent
  level3?: { code: string, name: string }  // Region
  level4?: { code: string, name: string }  // Country
  level5?: { code: string, name: string }  // City
  level6?: { code: string, name: string }  // District
  level7?: { code: string, name: string }  // Area
  level8?: { code: string, name: string }  // Location
}

export interface GeographicLocation {
  id: string
  code: string
  name: string
  displayName: string
  
  // Full hierarchy path
  hierarchy: GeographicHierarchy
  
  // Full path string
  fullPath: string  // 'Global/Europe/Western Europe/United Kingdom/London/Westminster/Edgeware Road/Victoria Casino'
  pathCodes: string  // 'GLOBAL/EU/WEU/GBR/LON/WEST/EDG/VIC-CAS-001'
  
  // Coordinates
  coordinates?: {
    lat: number
    lng: number
  }
  
  // Address
  address?: string
  
  // Location type
  locationType?: 'retailer' | 'warehouse' | 'distribution_point' | 'customer' | 'supplier' | 'distributor'
}

export interface Territory {
  id: string
  code: string  // 'TERR-LON-WEST-EDG-001'
  name: string
  
  // Geographic scope (can be at any level)
  scope: {
    global?: boolean
    continentId?: string
    regionId?: string
    countryId?: string
    cityId?: string
    districtId?: string
    areaId?: string
    locationId?: string
  }
  
  // Full path
  fullPath: string
  
  // Coverage type
  coverageType: 'full' | 'partial' | 'exclusive'
  
  // Boundaries (GeoJSON)
  boundaries?: Record<string, unknown>
  
  // Assigned distributor
  distributorId?: string
}
