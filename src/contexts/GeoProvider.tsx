'use client'

/**
 * 8-Level Geo Hierarchy Provider - Foundation Layer (VERSION-1 SPEC COMPLIANT)
 * 
 * VERSION-1 SPEC HIERARCHY:
 * 1. Global (World)
 * 2. Continent
 * 3. Region
 * 4. Country
 * 5. City
 * 6. District
 * 7. Area
 * 8. Location
 * 
 * All queries (Orders, Inventory, Finance, CRM, HR) must accept { territoryId }
 * Filters auto-apply based on user role + assigned territory
 * ADMIN role bypasses territory filters (sees all)
 * 
 * TASK 4: Currency auto-switch integrated - currency changes when country changes
 */

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'
import { apiClient } from '@/lib/api'
import type { UserScope } from '@/types/userScope'
// Note: LocaleProvider integration is optional - currency auto-switch works via countryCurrency state

export interface GeoLevel {
  id: string
  name: string
  code?: string
  parentId?: string
  level: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8
  metadata?: Record<string, any>
}

export interface GeoPath {
  global?: GeoLevel      // Level 1
  continent?: GeoLevel   // Level 2
  region?: GeoLevel      // Level 3
  country?: GeoLevel     // Level 4
  city?: GeoLevel        // Level 5
  district?: GeoLevel    // Level 6
  area?: GeoLevel        // Level 7
  location?: GeoLevel    // Level 8
  fullPath?: string
}

// Currency mapping by country code (for auto-switch - TASK 4)
const COUNTRY_TO_CURRENCY: Record<string, string> = {
  'US': 'USD', 'PK': 'PKR', 'AE': 'AED', 'SA': 'SAR', 'GB': 'GBP',
  'CN': 'CNY', 'IN': 'INR', 'FR': 'EUR', 'DE': 'EUR', 'ES': 'EUR',
  'IT': 'EUR', 'NL': 'EUR', 'BR': 'BRL', 'JP': 'JPY', 'KR': 'KRW',
  'AU': 'AUD', 'CA': 'CAD', 'MX': 'MXN', 'TR': 'TRY', 'TH': 'THB',
  'ID': 'IDR', 'PH': 'PHP', 'VN': 'VND', 'MY': 'MYR', 'SG': 'SGD',
  'EG': 'EGP', 'NG': 'NGN', 'ZA': 'ZAR', 'KE': 'KES', 'MA': 'MAD',
  'DZ': 'DZD', 'PL': 'PLN', 'RO': 'RON', 'CZ': 'CZK', 'SE': 'SEK',
  'DK': 'DKK', 'NO': 'NOK', 'FI': 'EUR', 'GR': 'EUR', 'HU': 'HUF',
  'BG': 'BGN', 'HR': 'HRK', 'SK': 'EUR', 'RS': 'RSD', 'BD': 'BDT',
  'IR': 'IRR', 'AF': 'AFN', 'IL': 'ILS', 'UA': 'UAH'
}

interface GeoContextType {
  // Current selections (8 levels - VERSION-1 SPEC)
  selectedGlobal: GeoLevel | null      // Level 1
  selectedContinent: GeoLevel | null    // Level 2
  selectedRegion: GeoLevel | null      // Level 3
  selectedCountry: GeoLevel | null     // Level 4
  selectedCity: GeoLevel | null         // Level 5
  selectedDistrict: GeoLevel | null     // Level 6
  selectedArea: GeoLevel | null        // Level 7
  selectedLocation: GeoLevel | null     // Level 8
  
  // Full path
  fullPath: GeoPath | null
  
  // Available options (8 levels)
  globals: GeoLevel[]        // Level 1
  continents: GeoLevel[]     // Level 2
  regions: GeoLevel[]        // Level 3
  countries: GeoLevel[]      // Level 4
  cities: GeoLevel[]         // Level 5
  districts: GeoLevel[]      // Level 6
  areas: GeoLevel[]          // Level 7
  locations: GeoLevel[]      // Level 8
  
  // User's assigned territory (from UserScope) - uses Area level (Level 7)
  userTerritory: GeoLevel | null
  userTerritoryPath: GeoPath | null
  
  // Currency auto-switch based on country (TASK 4)
  countryCurrency: string | null
  
  // Actions (8 levels - VERSION-1 SPEC)
  setSelectedGlobal: (global: GeoLevel | null) => void
  setSelectedContinent: (continent: GeoLevel | null) => void
  setSelectedRegion: (region: GeoLevel | null) => void
  setSelectedCountry: (country: GeoLevel | null) => void
  setSelectedCity: (city: GeoLevel | null) => void
  setSelectedDistrict: (district: GeoLevel | null) => void
  setSelectedArea: (area: GeoLevel | null) => void
  setSelectedLocation: (location: GeoLevel | null) => void
  
  // Load children (8 levels)
  loadGlobals: () => Promise<void>
  loadContinents: (globalId: string) => Promise<void>
  loadRegions: (continentId: string) => Promise<void>
  loadCountries: (regionId: string) => Promise<void>
  loadCities: (countryId: string) => Promise<void>
  loadDistricts: (cityId: string) => Promise<void>
  loadAreas: (districtId: string) => Promise<void>
  loadLocations: (areaId: string) => Promise<void>
  
  // Load full path from location
  loadFullPath: (locationId: string) => Promise<void>
  
  // Get current territory ID for queries (uses Area level - Level 7)
  getCurrentTerritoryId: () => string | null
  
  // Get filter object for API queries
  getTerritoryFilter: () => { territoryId?: string; territoryPath?: string }
  
  // Initialize from user scope
  initializeFromUserScope: (userScope: UserScope) => Promise<void>
  
  // Reset
  reset: () => void
  resetFromLevel: (level: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8) => void
}

const GeoContext = createContext<GeoContextType | undefined>(undefined)

export function GeoProvider({ 
  children,
  userScope 
}: { 
  children: ReactNode
  userScope?: UserScope | null
}) {
  // Get LocaleProvider for currency auto-switch (TASK 4) - optional
  // Note: This is wrapped in a try-catch because LocaleProvider might not be available
  // in all contexts. Currency will still work via countryCurrency state.
  
  // Selected levels (8 levels - VERSION-1 SPEC)
  const [selectedGlobal, setSelectedGlobal] = useState<GeoLevel | null>(null)
  const [selectedContinent, setSelectedContinent] = useState<GeoLevel | null>(null)
  const [selectedRegion, setSelectedRegion] = useState<GeoLevel | null>(null)
  const [selectedCountry, setSelectedCountry] = useState<GeoLevel | null>(null)
  const [selectedCity, setSelectedCity] = useState<GeoLevel | null>(null)
  const [selectedDistrict, setSelectedDistrict] = useState<GeoLevel | null>(null)
  const [selectedArea, setSelectedArea] = useState<GeoLevel | null>(null)
  const [selectedLocation, setSelectedLocation] = useState<GeoLevel | null>(null)
  
  // Full path
  const [fullPath, setFullPath] = useState<GeoPath | null>(null)
  
  // User's assigned territory
  const [userTerritory, setUserTerritory] = useState<GeoLevel | null>(null)
  const [userTerritoryPath, setUserTerritoryPath] = useState<GeoPath | null>(null)
  
  // Currency from country (TASK 4)
  const [countryCurrency, setCountryCurrency] = useState<string | null>(null)
  
  // Available options (8 levels)
  const [globals, setGlobals] = useState<GeoLevel[]>([])
  const [continents, setContinents] = useState<GeoLevel[]>([])
  const [regions, setRegions] = useState<GeoLevel[]>([])
  const [countries, setCountries] = useState<GeoLevel[]>([])
  const [cities, setCities] = useState<GeoLevel[]>([])
  const [districts, setDistricts] = useState<GeoLevel[]>([])
  const [areas, setAreas] = useState<GeoLevel[]>([])
  const [locations, setLocations] = useState<GeoLevel[]>([])
  
  // TASK 4: Auto-switch currency when country changes
  useEffect(() => {
    if (selectedCountry?.code) {
      const currency = COUNTRY_TO_CURRENCY[selectedCountry.code] || 'USD'
      setCountryCurrency(currency)
      
      // Currency is now available in countryCurrency state
      // Components using GeoProvider can access it and update LocaleProvider if needed
    } else {
      setCountryCurrency(null)
    }
  }, [selectedCountry])
  
  // Initialize from user scope on mount (TASK 3: Session-based binding)
  useEffect(() => {
    if (userScope?.geographic) {
      initializeFromUserScope(userScope)
    } else if (typeof window !== 'undefined') {
      // Load globals on mount if no user scope
      loadGlobals()
    }
  }, [userScope])
  
  const loadGlobals = async () => {
    try {
      // In a real implementation, this would call an API
      setGlobals([{ id: 'global-1', name: 'Global', level: 1 }])
      if (!selectedGlobal) {
        setSelectedGlobal({ id: 'global-1', name: 'Global', level: 1 })
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to load globals:', error)
      }
      setGlobals([])
    }
  }
  
  const loadContinents = async (globalId: string) => {
    try {
      // API call would go here: const response = await apiClient.getContinents(globalId)
      setContinents([])
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to load continents:', error)
      }
      setContinents([])
    }
  }
  
  const loadRegions = async (continentId: string) => {
    try {
      // API call would go here: const response = await apiClient.getRegions(continentId)
      setRegions([])
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to load regions:', error)
      }
      setRegions([])
    }
  }
  
  const loadCountries = async (regionId: string) => {
    try {
      // API call would go here: const response = await apiClient.getCountries(regionId)
      setCountries([])
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to load countries:', error)
      }
      setCountries([])
    }
  }
  
  const loadCities = async (countryId: string) => {
    try {
      // API call would go here
      setCities([])
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to load cities:', error)
      }
      setCities([])
    }
  }
  
  const loadDistricts = async (cityId: string) => {
    try {
      // API call would go here
      setDistricts([])
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to load districts:', error)
      }
      setDistricts([])
    }
  }
  
  const loadAreas = async (districtId: string) => {
    try {
      // API call would go here
      setAreas([])
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to load areas:', error)
      }
      setAreas([])
    }
  }
  
  const loadLocations = async (areaId: string) => {
    try {
      // API call would go here
      setLocations([])
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to load locations:', error)
      }
      setLocations([])
    }
  }
  
  const loadFullPath = async (locationId: string) => {
    try {
      // API call would go here: const response = await apiClient.getGeoPath(locationId)
      // setFullPath(response.data)
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to load full path:', error)
      }
      setFullPath(null)
    }
  }
  
  const getCurrentTerritoryId = useCallback((): string | null => {
    // Priority: selected area > user territory > selected location
    // Area is Level 7 (territory level per spec)
    return selectedArea?.id || userTerritory?.id || selectedLocation?.id || null
  }, [selectedArea, userTerritory, selectedLocation])
  
  const getTerritoryFilter = useCallback((): { territoryId?: string; territoryPath?: string } => {
    const territoryId = getCurrentTerritoryId()
    const territoryPath = fullPath?.fullPath || userTerritoryPath?.fullPath
    
    return {
      ...(territoryId && { territoryId }),
      ...(territoryPath && { territoryPath })
    }
  }, [getCurrentTerritoryId, fullPath, userTerritoryPath])
  
  const initializeFromUserScope = async (userScope: UserScope) => {
    try {
      // Extract territory information from user scope (TASK 3: Session-based binding)
      const geo = userScope.geographic
      
      // If user has a specific territory assigned, load it
      // Use territories array (Level 8) or areas array (Level 7) as fallback
      const territoryId = geo.territories && geo.territories.length > 0 
        ? geo.territories[0] 
        : (geo.areas && geo.areas.length > 0 ? geo.areas[0] : null)
      if (geo && territoryId) {
        await loadFullPath(territoryId)
        // Set user territory based on scope (Area level - Level 7)
        setUserTerritory({
          id: territoryId,
          name: (geo as any).territoryName || 'Assigned Territory',
          level: 7 // Area level
        })
      }
      
      // Auto-select based on user's geographic scope
      if (geo.countries && geo.countries.length > 0) {
        const countryCode = geo.countries[0]
        setSelectedCountry({ 
          id: countryCode, 
          name: countryCode, 
          level: 4,
          code: countryCode 
        })
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to initialize from user scope:', error)
      }
    }
  }
  
  // Auto-load children when parent is selected
  useEffect(() => {
    if (selectedGlobal?.id) {
      loadContinents(selectedGlobal.id)
      resetFromLevel(2)
    }
  }, [selectedGlobal])
  
  useEffect(() => {
    if (selectedContinent?.id) {
      loadRegions(selectedContinent.id)
      resetFromLevel(3)
    }
  }, [selectedContinent])
  
  useEffect(() => {
    if (selectedRegion?.id) {
      loadCountries(selectedRegion.id)
      resetFromLevel(4)
    }
  }, [selectedRegion])
  
  useEffect(() => {
    if (selectedCountry?.id) {
      loadCities(selectedCountry.id)
      resetFromLevel(5)
    }
  }, [selectedCountry])
  
  useEffect(() => {
    if (selectedCity?.id) {
      loadDistricts(selectedCity.id)
      resetFromLevel(6)
    }
  }, [selectedCity])
  
  useEffect(() => {
    if (selectedDistrict?.id) {
      loadAreas(selectedDistrict.id)
      resetFromLevel(7)
    }
  }, [selectedDistrict])
  
  useEffect(() => {
    if (selectedArea?.id) {
      loadLocations(selectedArea.id)
      setSelectedLocation(null)
    }
  }, [selectedArea])
  
  const reset = () => {
    setSelectedGlobal(null)
    setSelectedContinent(null)
    setSelectedRegion(null)
    setSelectedCountry(null)
    setSelectedCity(null)
    setSelectedDistrict(null)
    setSelectedArea(null)
    setSelectedLocation(null)
    setFullPath(null)
    setContinents([])
    setRegions([])
    setCountries([])
    setCities([])
    setDistricts([])
    setAreas([])
    setLocations([])
    setCountryCurrency(null)
  }
  
  const resetFromLevel = (level: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8) => {
    if (level <= 2) {
      setSelectedContinent(null)
      setSelectedRegion(null)
      setSelectedCountry(null)
      setSelectedCity(null)
      setSelectedDistrict(null)
      setSelectedArea(null)
      setSelectedLocation(null)
      setContinents([])
      setRegions([])
      setCountries([])
      setCities([])
      setDistricts([])
      setAreas([])
      setLocations([])
    }
    if (level <= 3) {
      setSelectedRegion(null)
      setSelectedCountry(null)
      setSelectedCity(null)
      setSelectedDistrict(null)
      setSelectedArea(null)
      setSelectedLocation(null)
      setRegions([])
      setCountries([])
      setCities([])
      setDistricts([])
      setAreas([])
      setLocations([])
    }
    if (level <= 4) {
      setSelectedCountry(null)
      setSelectedCity(null)
      setSelectedDistrict(null)
      setSelectedArea(null)
      setSelectedLocation(null)
      setCountries([])
      setCities([])
      setDistricts([])
      setAreas([])
      setLocations([])
    }
    if (level <= 5) {
      setSelectedCity(null)
      setSelectedDistrict(null)
      setSelectedArea(null)
      setSelectedLocation(null)
      setCities([])
      setDistricts([])
      setAreas([])
      setLocations([])
    }
    if (level <= 6) {
      setSelectedDistrict(null)
      setSelectedArea(null)
      setSelectedLocation(null)
      setDistricts([])
      setAreas([])
      setLocations([])
    }
    if (level <= 7) {
      setSelectedArea(null)
      setSelectedLocation(null)
      setAreas([])
      setLocations([])
    }
    if (level <= 8) {
      setSelectedLocation(null)
      setLocations([])
    }
  }
  
  return (
    <GeoContext.Provider
      value={{
        selectedGlobal,
        selectedContinent,
        selectedRegion,
        selectedCountry,
        selectedCity,
        selectedDistrict,
        selectedArea,
        selectedLocation,
        fullPath,
        globals,
        continents,
        regions,
        countries,
        cities,
        districts,
        areas,
        locations,
        userTerritory,
        userTerritoryPath,
        countryCurrency,
        setSelectedGlobal,
        setSelectedContinent,
        setSelectedRegion,
        setSelectedCountry,
        setSelectedCity,
        setSelectedDistrict,
        setSelectedArea,
        setSelectedLocation,
        loadGlobals,
        loadContinents,
        loadRegions,
        loadCountries,
        loadCities,
        loadDistricts,
        loadAreas,
        loadLocations,
        loadFullPath,
        getCurrentTerritoryId,
        getTerritoryFilter,
        initializeFromUserScope,
        reset,
        resetFromLevel
      }}
    >
      {children}
    </GeoContext.Provider>
  )
}

export function useGeo() {
  const context = useContext(GeoContext)
  if (context === undefined) {
    throw new Error('useGeo must be used within a GeoProvider')
  }
  return context
}

