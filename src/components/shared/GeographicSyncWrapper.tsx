'use client'

/**
 * GeographicSyncWrapper Component
 * 
 * Syncs state between CountryProvider, RegionProvider, and TerritoryProvider.
 * This component must be rendered inside all three providers.
 */

import { useEffect } from 'react'
import { useCountry } from '@/contexts/CountryContext'
import { useRegion } from '@/contexts/RegionContext'
import { syncCountryToRegion } from '@/lib/geographic-sync'

function normalizeCountrySlugToCode(countrySlug: string): string {
  // Convert "united-states" -> "US", "saudi-arabia" -> "SA", etc.
  const parts = countrySlug.split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1))
  
  // Handle special cases
  const specialCases: Record<string, string> = {
    'United States': 'US',
    'United States Of America': 'US',
    'Saudi Arabia': 'SA',
    'United Arab Emirates': 'AE',
    'United Kingdom': 'UK',
    'South Korea': 'KR',
    'South Africa': 'ZA'
  }
  
  const fullName = parts.join(' ')
  if (specialCases[fullName]) {
    return specialCases[fullName]
  }
  
  // For simple cases, use first two letters
  return parts.map(p => p.charAt(0)).join('').slice(0, 2).toUpperCase()
}

export function GeographicSyncWrapper() {
  const { selectedCountry } = useCountry()
  const { selectedRegion, setSelectedRegion } = useRegion()

  // Sync region when country changes
  useEffect(() => {
    if (selectedCountry) {
      const countryCode = normalizeCountrySlugToCode(selectedCountry)
      const regionId = syncCountryToRegion(countryCode)
      
      if (regionId && selectedRegion !== regionId) {
        // Update region to match country
        setSelectedRegion(regionId)
      }
    }
  }, [selectedCountry, selectedRegion, setSelectedRegion])

  return null
}

