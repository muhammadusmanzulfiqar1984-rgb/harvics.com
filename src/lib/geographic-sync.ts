/**
 * Geographic Context Synchronization
 * 
 * Syncs state between CountryProvider, RegionProvider, and TerritoryProvider
 * to ensure consistency across all geographic contexts.
 */

import { getLocaleMapping } from '@/config/country-mapping'

// Map country code to region ID (from region data structure)
export function getRegionIdForCountry(countryCode: string): string | null {
  const countryToRegionMap: Record<string, string> = {
    // North America
    'US': 'north-america',
    'CA': 'north-america',
    'MX': 'north-america',
    
    // Europe
    'UK': 'europe',
    'GB': 'europe',
    'FR': 'europe',
    'DE': 'europe',
    'ES': 'europe',
    'IT': 'europe',
    'NL': 'europe',
    'PL': 'europe',
    'RO': 'europe',
    'CZ': 'europe',
    'SE': 'europe',
    'DK': 'europe',
    'FI': 'europe',
    'NO': 'europe',
    'GR': 'europe',
    'HU': 'europe',
    'BG': 'europe',
    'HR': 'europe',
    'SK': 'europe',
    'RS': 'europe',
    'UA': 'europe',
    
    // Middle East
    'AE': 'eurasia-middle-east',
    'SA': 'eurasia-middle-east',
    'IL': 'eurasia-middle-east',
    'TR': 'europe', // Turkey is in both
    'IR': 'eurasia-middle-east',
    
    // Asia
    'CN': 'greater-china-mongolia',
    'JP': 'greater-china-mongolia',
    'KR': 'greater-china-mongolia',
    'IN': 'greater-china-mongolia',
    'PK': 'greater-china-mongolia',
    'BD': 'greater-china-mongolia',
    'TH': 'greater-china-mongolia',
    'VN': 'greater-china-mongolia',
    'ID': 'greater-china-mongolia',
    'MY': 'greater-china-mongolia',
    'PH': 'greater-china-mongolia',
    'AF': 'greater-china-mongolia',
    
    // Africa
    'ZA': 'africa',
    'NG': 'africa',
    'KE': 'africa',
    'EG': 'africa',
    
    // South America
    'BR': 'latin-america',
    
    // Oceania
    'AU': 'oceania',
  }
  
  return countryToRegionMap[countryCode.toUpperCase()] || null
}

// Get region ID from locale
export function getRegionIdForLocale(locale: string): string | null {
  const mapping = getLocaleMapping(locale)
  if (mapping) {
    return getRegionIdForCountry(mapping.countryCode)
  }
  return null
}

// Sync country to region
export function syncCountryToRegion(countryCode: string): string | null {
  return getRegionIdForCountry(countryCode)
}

// Get region name from region ID
export function getRegionNameFromId(regionId: string): string {
  const regionNameMap: Record<string, string> = {
    'north-america': 'North America',
    'latin-america': 'Latin America',
    'europe': 'Europe',
    'greater-china-mongolia': 'Greater China & Mongolia',
    'eurasia-middle-east': 'Eurasia & Middle East',
    'africa': 'Africa',
    'oceania': 'Oceania'
  }
  return regionNameMap[regionId] || 'North America'
}
