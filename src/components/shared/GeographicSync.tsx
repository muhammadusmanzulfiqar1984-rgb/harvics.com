'use client'

/**
 * GeographicSync Component
 * 
 * Syncs state between CountryProvider, RegionProvider, and TerritoryProvider
 * to ensure consistency across all geographic contexts.
 */

import { useEffect } from 'react'
import { useCountry } from '@/contexts/CountryContext'
import { useRegion } from '@/contexts/RegionContext'
import { useTerritory } from '@/contexts/TerritoryContext'
import { getRegionIdForCountry, syncCountryToRegion } from '@/lib/geographic-sync'

export function GeographicSync() {
  const { selectedCountry, setSelectedCountry } = useCountry()
  const { selectedRegion, setSelectedRegion } = useRegion()
  const { selectedCountry: territoryCountry, setSelectedCountry: setTerritoryCountry } = useTerritory()

  // Sync country to region when country changes
  useEffect(() => {
    if (selectedCountry) {
      // Get country code from country slug
      const countryCode = selectedCountry.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ')
      // Try to sync region based on country
      const regionId = syncCountryToRegion(countryCode)
      if (regionId && selectedRegion !== regionId) {
        // Only update if different to avoid infinite loops
        setSelectedRegion(regionId)
      }
    }
  }, [selectedCountry, selectedRegion, setSelectedRegion])

  // Sync country to territory when country changes
  useEffect(() => {
    if (selectedCountry) {
      // Try to find matching territory country
      // This will be implemented when territory API is available
      // For now, just ensure territory country is in sync
    }
  }, [selectedCountry])

  // Sync region to country filter (region changes should filter available countries)
  // This is handled by RegionProvider's getCurrentRegionLocations

  return null // This component doesn't render anything
}

