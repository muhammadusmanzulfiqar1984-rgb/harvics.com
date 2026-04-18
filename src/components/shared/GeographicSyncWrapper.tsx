'use client'

/**
 * GeographicSyncWrapper Component
 * 
 * The SINGLE sync point that interlinks:
 *   Language (locale) → Country (handled by CountryContext) → Currency + Region
 * 
 * CountryContext already auto-selects the default country when locale changes.
 * This wrapper then syncs:
 *   Country → Currency (stored in sessionStorage for formatCurrency())
 *   Country → Region
 * 
 * This component must be rendered inside all providers.
 */

import { useEffect, useRef } from 'react'
import { useCountry } from '@/contexts/CountryContext'
import { useRegion } from '@/contexts/RegionContext'
import { currencyMap } from '@/config/currency-mapping'
import { localeToCountryMap } from '@/config/country-mapping'
import { syncCountryToRegion } from '@/lib/geographic-sync'

/**
 * Convert a country slug (e.g. "france", "saudi-arabia", "united-states")
 * to its 2-letter country code (FR, SA, US) using the authoritative mapping.
 */
function slugToCountryCode(slug: string): string {
  if (!slug) return 'US'
  const lower = slug.toLowerCase().trim()

  // Build a reverse lookup: slug → code from localeToCountryMap
  for (const mapping of Object.values(localeToCountryMap)) {
    if (mapping.defaultCountry === lower) {
      return mapping.countryCode
    }
  }

  // Fallback special cases not in localeToCountryMap (multi-locale countries)
  const extras: Record<string, string> = {
    'egypt': 'EG', 'iraq': 'IQ', 'jordan': 'JO', 'lebanon': 'LB',
    'morocco': 'MA', 'tunisia': 'TN', 'algeria': 'DZ', 'libya': 'LY',
    'yemen': 'YE', 'oman': 'OM', 'kuwait': 'KW', 'qatar': 'QA',
    'bahrain': 'BH', 'mexico': 'MX', 'argentina': 'AR', 'colombia': 'CO',
    'chile': 'CL', 'peru': 'PE', 'belgium': 'BE', 'switzerland': 'CH',
    'austria': 'AT', 'canada': 'CA', 'australia': 'AU', 'new-zealand': 'NZ',
    'hong-kong': 'HK', 'taiwan': 'TW', 'tanzania': 'TZ',
    'united-states': 'US', 'united-kingdom': 'UK', 'saudi-arabia': 'SA',
    'united-arab-emirates': 'AE', 'uae': 'AE', 'south-korea': 'KR',
    'south-africa': 'ZA', 'czech-republic': 'CZ',
  }
  if (extras[lower]) return extras[lower]

  // Last resort: if it's already a 2-letter code
  if (lower.length === 2) return lower.toUpperCase()

  return 'US'
}

export function GeographicSyncWrapper() {
  const { selectedCountry } = useCountry()
  const { selectedRegion, setSelectedRegion } = useRegion()
  const prevCountry = useRef(selectedCountry)

  // ═══ Country → Currency + Region ═══
  // When country changes (either from locale auto-switch or manual selection),
  // update currency in sessionStorage and sync region.
  useEffect(() => {
    if (!selectedCountry) return
    if (selectedCountry === prevCountry.current) return
    prevCountry.current = selectedCountry

    const countryCode = slugToCountryCode(selectedCountry)
    
    // Country → Currency: store in sessionStorage so formatCurrency() picks it up
    const currencyData = currencyMap[countryCode]
    if (currencyData && typeof window !== 'undefined') {
      try {
        sessionStorage.setItem('harvics_currency', currencyData.code)
        sessionStorage.setItem('harvics_currency_symbol', currencyData.symbol)
        sessionStorage.setItem('harvics_country_code', countryCode)
      } catch { /* private browsing */ }
    }
    
    // Country → Region
    const regionId = syncCountryToRegion(countryCode)
    if (regionId && selectedRegion !== regionId) {
      setSelectedRegion(regionId)
    }
  }, [selectedCountry, selectedRegion, setSelectedRegion])

  // ═══ Initialize currency on mount from current country ═══
  useEffect(() => {
    if (!selectedCountry) return
    const countryCode = slugToCountryCode(selectedCountry)
    const currencyData = currencyMap[countryCode]
    if (currencyData && typeof window !== 'undefined') {
      try {
        // Only set if not already set (avoid overwriting explicit user choice)
        if (!sessionStorage.getItem('harvics_currency')) {
          sessionStorage.setItem('harvics_currency', currencyData.code)
          sessionStorage.setItem('harvics_currency_symbol', currencyData.symbol)
          sessionStorage.setItem('harvics_country_code', countryCode)
        }
      } catch { /* private browsing */ }
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return null
}

