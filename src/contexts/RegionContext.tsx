'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useLocale } from 'next-intl'
import { regions, getRegionByLocationCode } from '@/data/regions'
import { getLocaleMapping } from '@/config/country-mapping'

interface RegionContextType {
  selectedRegion: string | null
  selectedLocation: string | null
  setSelectedRegion: (regionId: string | null) => void
  setSelectedLocation: (locationCode: string | null) => void
  getCurrentRegionLocations: () => any[]
}

const RegionContext = createContext<RegionContextType | undefined>(undefined)

export const RegionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const locale = useLocale()
  const [selectedRegion, setSelectedRegionState] = useState<string | null>(null)
  const [selectedLocation, setSelectedLocationState] = useState<string | null>(null)
  
  // Map region names to region IDs (from region data)
  const mapRegionNameToId = (regionName: string): string | null => {
    const regionMap: Record<string, string> = {
      'North America': 'north-america',
      'South America': 'latin-america',
      'Europe': 'europe',
      'Asia': 'greater-china-mongolia',
      'Middle East': 'eurasia-middle-east',
      'Africa': 'africa',
      'Oceania': 'oceania'
    }
    return regionMap[regionName] || null
  }

  // Initialize based on current locale using comprehensive mapping
  useEffect(() => {
    const localeMapping = getLocaleMapping(locale)
    if (localeMapping) {
      const regionId = mapRegionNameToId(localeMapping.region)
      if (regionId && !selectedRegion) {
        setSelectedRegionState(regionId)
      }
    } else {
      // Fallback for unmapped locales
      if (!selectedRegion) {
        setSelectedRegionState('north-america')
      }
    }
  }, [locale, selectedRegion])

  const setSelectedRegion = (regionId: string | null) => {
    setSelectedRegionState(regionId)
    // Clear selected location when region changes
    if (regionId !== selectedRegion) {
      setSelectedLocationState(null)
    }
  }

  const setSelectedLocation = (locationCode: string | null) => {
    setSelectedLocationState(locationCode)
    // Update region based on location
    if (locationCode) {
      const region = getRegionByLocationCode(locationCode)
      if (region) {
        setSelectedRegionState(region.id)
      }
    }
  }

  const getCurrentRegionLocations = () => {
    if (selectedRegion) {
      const region = regions.find(r => r.id === selectedRegion)
      return region ? region.locations : []
    }
    // Return all locations if no region selected
    return regions.flatMap(r => r.locations)
  }

  return (
    <RegionContext.Provider
      value={{
        selectedRegion,
        selectedLocation,
        setSelectedRegion,
        setSelectedLocation,
        getCurrentRegionLocations
      }}
    >
      {children}
    </RegionContext.Provider>
  )
}

export const useRegion = () => {
  const context = useContext(RegionContext)
  if (context === undefined) {
    throw new Error('useRegion must be used within a RegionProvider')
  }
  return context
}

