// Geographic Hierarchy Utilities

import { GeographicScope, GeographicLocation, Territory } from '@/types/geographicScope'

/**
 * Check if a location matches a geographic scope
 */
export function isLocationInScope(
  location: GeographicLocation,
  scope: GeographicScope
): boolean {
  // Super admin with global access
  if (scope.global === true) {
    return true
  }

  const hierarchy = location.hierarchy

  // Check continent
  if (scope.continents && scope.continents.length > 0) {
    if (!hierarchy.level2 || !scope.continents.includes(hierarchy.level2.code)) {
      return false
    }
  }

  // Check region
  if (scope.regions && scope.regions.length > 0) {
    if (!hierarchy.level3 || !scope.regions.includes(hierarchy.level3.code)) {
      return false
    }
  }

  // Check country
  if (scope.countries && scope.countries.length > 0) {
    if (!hierarchy.level4 || !scope.countries.includes(hierarchy.level4.code)) {
      return false
    }
  }

  // Check city
  if (scope.cities && scope.cities.length > 0) {
    if (!hierarchy.level5 || !scope.cities.includes(hierarchy.level5.code)) {
      return false
    }
  }

  // Check district
  if (scope.districts && scope.districts.length > 0) {
    if (!hierarchy.level6 || !scope.districts.includes(hierarchy.level6.code)) {
      return false
    }
  }

  // Check area
  if (scope.areas && scope.areas.length > 0) {
    if (!hierarchy.level7 || !scope.areas.includes(hierarchy.level7.code)) {
      return false
    }
  }

  // Check specific location
  if (scope.locations && scope.locations.length > 0) {
    if (!hierarchy.level8 || !scope.locations.includes(hierarchy.level8.code)) {
      return false
    }
  }

  return true
}

/**
 * Filter data by geographic scope
 * Handles both GeographicLocation objects and simple objects with deliveryLocation/country fields
 */
type DeliveryLocation = {
  continent?: string
  country?: string
  city?: string
  fullPath?: string
}

const isGeographicLocation = (value: unknown): value is GeographicLocation => {
  return typeof value === 'object' && value !== null && 'hierarchy' in value
}

export function filterByGeographicScope<T>(
  items: T[],
  scope: GeographicScope
): T[] {
  if (!scope || scope.global === true) {
    return items
  }

  return items.filter(item => {
    const itemRecord = item as Record<string, unknown>
    // Handle full GeographicLocation object
    const location = itemRecord.location ?? itemRecord.deliveryLocation
    
    if (isGeographicLocation(location)) {
      return isLocationInScope(location, scope)
    }
    
    // Handle simple objects with deliveryLocation path string
    if (itemRecord.deliveryLocation && typeof itemRecord.deliveryLocation === 'object') {
      const loc = itemRecord.deliveryLocation as DeliveryLocation
      
      // Check continent
      if (scope.continents && scope.continents.length > 0) {
        if (!loc.continent || !scope.continents.some(c => loc.fullPath?.includes(c) || loc.continent?.includes(c))) {
          return false
        }
      }
      
      // Check country
      if (scope.countries && scope.countries.length > 0) {
        const itemCountry = loc.country || loc.fullPath?.split('/').find((p: string) => 
          scope.countries?.some(c => p.includes(c))
        )
        if (!itemCountry) return false
      }
      
      // Check city
      if (scope.cities && scope.cities.length > 0) {
        const itemCity = loc.city || loc.fullPath?.split('/').find((p: string) => 
          scope.cities?.some(c => p.includes(c))
        )
        if (!itemCity) return false
      }
      
      // Check territory
      if (scope.territories && scope.territories.length > 0) {
        const territory = itemRecord.territory as { code?: string } | undefined
        if (!territory?.code || !scope.territories.includes(territory.code)) {
          return false
        }
      }
      
      return true
    }
    
    // Handle legacy format with country field
    if (typeof itemRecord.country === 'string' && scope.countries && scope.countries.length > 0) {
      return scope.countries.includes(itemRecord.country)
    }
    
    // Check territory if no direct location
    if (itemRecord.territory && scope.territories && scope.territories.length > 0) {
      const territory = itemRecord.territory as { code?: string } | undefined
      return territory?.code ? scope.territories.includes(territory.code) : false
    }
    
    // If no geographic constraints, allow through (for backward compatibility)
    if (!scope.continents && !scope.regions && !scope.countries && !scope.cities && !scope.districts && !scope.areas && !scope.locations && !scope.territories) {
      return true
    }
    
    return false
  })
}

/**
 * Build full geographic path string
 */
export function buildGeographicPath(hierarchy: GeographicLocation['hierarchy']): string {
  const parts: string[] = ['Global']
  
  if (hierarchy.level2) parts.push(hierarchy.level2.name)
  if (hierarchy.level3) parts.push(hierarchy.level3.name)
  if (hierarchy.level4) parts.push(hierarchy.level4.name)
  if (hierarchy.level5) parts.push(hierarchy.level5.name)
  if (hierarchy.level6) parts.push(hierarchy.level6.name)
  if (hierarchy.level7) parts.push(hierarchy.level7.name)
  if (hierarchy.level8) parts.push(hierarchy.level8.name)
  
  return parts.join(' / ')
}

/**
 * Build path codes string
 */
export function buildGeographicPathCodes(hierarchy: GeographicLocation['hierarchy']): string {
  const parts: string[] = ['GLOBAL']
  
  if (hierarchy.level2) parts.push(hierarchy.level2.code)
  if (hierarchy.level3) parts.push(hierarchy.level3.code)
  if (hierarchy.level4) parts.push(hierarchy.level4.code)
  if (hierarchy.level5) parts.push(hierarchy.level5.code)
  if (hierarchy.level6) parts.push(hierarchy.level6.code)
  if (hierarchy.level7) parts.push(hierarchy.level7.code)
  if (hierarchy.level8) parts.push(hierarchy.level8.code)
  
  return parts.join('/')
}

/**
 * Get scope label for display
 */
export function getGeographicScopeLabel(scope: GeographicScope): string {
  if (scope.global) return 'Global'
  
  if (scope.locations && scope.locations.length > 0) {
    return `Location: ${scope.locations.join(', ')}`
  }
  
  if (scope.areas && scope.areas.length > 0) {
    return `Area: ${scope.areas.join(', ')}`
  }
  
  if (scope.districts && scope.districts.length > 0) {
    return `District: ${scope.districts.join(', ')}`
  }
  
  if (scope.cities && scope.cities.length > 0) {
    return `City: ${scope.cities.join(', ')}`
  }
  
  if (scope.countries && scope.countries.length > 0) {
    return `Country: ${scope.countries.join(', ')}`
  }
  
  if (scope.regions && scope.regions.length > 0) {
    return `Region: ${scope.regions.join(', ')}`
  }
  
  if (scope.continents && scope.continents.length > 0) {
    return `Continent: ${scope.continents.join(', ')}`
  }
  
  if (scope.territories && scope.territories.length > 0) {
    return `Territory: ${scope.territories.join(', ')}`
  }
  
  return 'No scope defined'
}

/**
 * Find territory for a location
 */
export function findTerritoryForLocation(
  location: GeographicLocation,
  territories: Territory[]
): Territory | null {
  // Find most specific territory match
  const hierarchy = location.hierarchy
  
  // Try to find by specific location first
  if (hierarchy.level8) {
    const match = territories.find(t => 
      t.scope.locationId && t.scope.locationId === hierarchy.level8?.code
    )
    if (match) return match
  }
  
  // Try by area
  if (hierarchy.level7) {
    const match = territories.find(t => 
      t.scope.areaId && t.scope.areaId === hierarchy.level7?.code
    )
    if (match) return match
  }
  
  // Try by district
  if (hierarchy.level6) {
    const match = territories.find(t => 
      t.scope.districtId && t.scope.districtId === hierarchy.level6?.code
    )
    if (match) return match
  }
  
  // Try by city
  if (hierarchy.level5) {
    const match = territories.find(t => 
      t.scope.cityId && t.scope.cityId === hierarchy.level5?.code
    )
    if (match) return match
  }
  
  // Try by country
  if (hierarchy.level4) {
    const match = territories.find(t => 
      t.scope.countryId && t.scope.countryId === hierarchy.level4?.code
    )
    if (match) return match
  }
  
  return null
}

/**
 * Create geographic scope from user scope (for backward compatibility)
 */
export function createGeographicScopeFromUserScope(userScope: any): GeographicScope {
  return {
    global: userScope.role === 'super_admin' || userScope.role === 'admin',
    countries: userScope.countries || [],
    territories: userScope.territories || [],
    ...userScope.geographic  // Override with explicit geographic scope if provided
  }
}
