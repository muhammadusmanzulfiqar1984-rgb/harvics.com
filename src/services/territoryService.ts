// Territory Service - Frontend Service for 7-Tier Hierarchy
// Globe → Continent → Region → Country → City → District → Location

import { apiClient } from '@/lib/api'

export interface Territory {
  id: string
  name: string
  code?: string
  localizedName?: Record<string, string> // { en: 'United Kingdom', ar: 'المملكة المتحدة', fr: 'Royaume-Uni' }
  currency?: string
  locale?: string
  metadata?: Record<string, unknown>
  children?: Territory[]
}

export interface TerritoryHierarchy {
  globe: Territory
  continent: Territory
  region: Territory
  country: Territory
  city: Territory
  district: Territory
  location: Territory
  fullPath: string
}

export interface TerritoryPath {
  globe?: Territory
  continent?: Territory
  region?: Territory
  country?: Territory
  city?: Territory
  district?: Territory
  location?: Territory
  fullPath?: string
}

class TerritoryService {
  private locale: string = 'en'
  private cache: Map<string, Territory[]> = new Map()

  setLocale(locale: string) {
    this.locale = locale
  }

  // Get localized name
  getLocalizedName(territory: Territory, locale?: string): string {
    const targetLocale = locale || this.locale
    if (territory.localizedName?.[targetLocale]) {
      return territory.localizedName[targetLocale]
    }
    return territory.name
  }

  // Get full hierarchy path
  async getFullPath(locationId: string, locale?: string): Promise<TerritoryPath | null> {
    try {
      const response = await apiClient.getTerritoryPath(locationId)
      if (response.data) {
        const path = response.data as {
          global?: { id: string; name: string }
          continent?: { id: string; name: string }
          regional?: { id: string; name: string }
          country?: { id: string; name: string; code?: string }
          city?: { id: string; name: string }
          district?: { id: string; name: string }
          point?: { id: string; name: string; code?: string }
          fullPath?: string
        }
        return {
          globe: path.global ? { id: path.global.id, name: path.global.name } : undefined,
          continent: path.continent ? { id: path.continent.id, name: path.continent.name } : undefined,
          region: path.regional ? { id: path.regional.id, name: path.regional.name } : undefined,
          country: path.country ? { id: path.country.id, name: path.country.name, code: path.country.code } : undefined,
          city: path.city ? { id: path.city.id, name: path.city.name } : undefined,
          district: path.district ? { id: path.district.id, name: path.district.name } : undefined,
          location: path.point ? { id: path.point.id, name: path.point.name, code: path.point.code } : undefined,
          fullPath: path.fullPath
        }
      }
      return null
    } catch (error) {
      console.error('Failed to get full path:', error)
      // Fallback to mock data for development
      return this.getMockFullPath(locationId, locale)
    }
  }

  // Get children of a territory
  async getChildren(
    parentId: string,
    tier: 'globe' | 'continent' | 'region' | 'country' | 'city' | 'district' | 'location',
    locale?: string
  ): Promise<Territory[]> {
    const cacheKey = `${tier}-${parentId}-${locale || this.locale}`
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!
    }

    try {
      let response
      switch (tier) {
        case 'globe':
          response = await apiClient.getContinents()
          break
        case 'continent':
          response = await apiClient.getRegionals(parentId)
          break
        case 'region':
          response = await apiClient.getCountries(parentId)
          break
        case 'country':
          response = await apiClient.getCities(parentId)
          break
        case 'city':
          response = await apiClient.getDistricts(parentId)
          break
        case 'district':
          response = await apiClient.getStreets(parentId)
          break
        case 'location':
          response = await apiClient.getPoints(parentId)
          break
      }

      if (response.data) {
        const territories = (Array.isArray(response.data) ? response.data : []).map((item: {
          id: string
          name: string
          code?: string
          localizedName?: Record<string, string>
          currency_code?: string
          currency?: string
          locale?: string
          metadata?: Record<string, unknown>
        }) => ({
          id: item.id,
          name: item.name,
          code: item.code,
          localizedName: item.localizedName,
          currency: item.currency_code || item.currency,
          locale: item.locale,
          metadata: item.metadata || {}
        }))
        
        this.cache.set(cacheKey, territories)
        return territories
      }
      return []
    } catch (error) {
      console.error(`Failed to get ${tier} children:`, error)
      // Fallback to mock data
      return this.getMockChildren(parentId, tier, locale)
    }
  }

  // Search territories
  async search(
    query: string,
    tier?: 'globe' | 'continent' | 'region' | 'country' | 'city' | 'district' | 'location'
  ): Promise<Territory[]> {
    return this.getMockSearchResults(query, tier)
  }

  // Build full path string
  buildPathString(hierarchy: TerritoryPath, locale?: string): string {
    const parts: string[] = []
    const targetLocale = locale || this.locale

    if (hierarchy.globe) parts.push(this.getLocalizedName(hierarchy.globe, targetLocale))
    if (hierarchy.continent) parts.push(this.getLocalizedName(hierarchy.continent, targetLocale))
    if (hierarchy.region) parts.push(this.getLocalizedName(hierarchy.region, targetLocale))
    if (hierarchy.country) parts.push(this.getLocalizedName(hierarchy.country, targetLocale))
    if (hierarchy.city) parts.push(this.getLocalizedName(hierarchy.city, targetLocale))
    if (hierarchy.district) parts.push(this.getLocalizedName(hierarchy.district, targetLocale))
    if (hierarchy.location) parts.push(this.getLocalizedName(hierarchy.location, targetLocale))

    return parts.join(' / ') || hierarchy.fullPath || ''
  }

  // ============================================
  // MOCK DATA FOR DEVELOPMENT
  // ============================================

  private getMockFullPath(locationId: string, locale?: string): TerritoryPath {
    void locationId
    void locale
    // Example: Victoria Casino Distribution
    return {
      globe: { id: 'globe-1', name: 'Globe', localizedName: { en: 'Globe', ar: 'العالم', fr: 'Globe' } },
      continent: { id: 'continent-eu', name: 'Europe', localizedName: { en: 'Europe', ar: 'أوروبا', fr: 'Europe' } },
      region: { id: 'region-weu', name: 'Western Europe', localizedName: { en: 'Western Europe', ar: 'أوروبا الغربية', fr: 'Europe de l\'Ouest' } },
      country: { 
        id: 'country-gbr', 
        name: 'United Kingdom', 
        code: 'GBR',
        localizedName: { en: 'United Kingdom', ar: 'المملكة المتحدة', fr: 'Royaume-Uni' },
        currency: 'GBP',
        locale: 'en-GB'
      },
      city: { id: 'city-london', name: 'London', localizedName: { en: 'London', ar: 'لندن', fr: 'Londres' } },
      district: { id: 'district-edgware', name: 'Edgware', localizedName: { en: 'Edgware', ar: 'إدجوير', fr: 'Edgware' } },
      location: { 
        id: 'location-victoria-casino', 
        name: 'Victoria Casino Distribution',
        code: 'VCD-001',
        localizedName: { en: 'Victoria Casino Distribution', ar: 'توزيع كازينو فيكتوريا', fr: 'Distribution Casino Victoria' }
      },
      fullPath: 'Globe / Europe / Western Europe / United Kingdom / London / Edgware / Victoria Casino Distribution'
    }
  }

  private getMockChildren(
    parentId: string,
    tier: string,
    locale?: string
  ): Territory[] {
    void locale
    // Mock continents
    if (tier === 'globe') {
      return [
        { id: 'continent-eu', name: 'Europe', localizedName: { en: 'Europe', ar: 'أوروبا', fr: 'Europe' } },
        { id: 'continent-as', name: 'Asia', localizedName: { en: 'Asia', ar: 'آسيا', fr: 'Asie' } },
        { id: 'continent-na', name: 'North America', localizedName: { en: 'North America', ar: 'أمريكا الشمالية', fr: 'Amérique du Nord' } },
        { id: 'continent-af', name: 'Africa', localizedName: { en: 'Africa', ar: 'أفريقيا', fr: 'Afrique' } }
      ]
    }

    // Mock regions for Europe
    if (tier === 'continent' && parentId === 'continent-eu') {
      return [
        { id: 'region-weu', name: 'Western Europe', localizedName: { en: 'Western Europe', ar: 'أوروبا الغربية', fr: 'Europe de l\'Ouest' } },
        { id: 'region-eeu', name: 'Eastern Europe', localizedName: { en: 'Eastern Europe', ar: 'أوروبا الشرقية', fr: 'Europe de l\'Est' } }
      ]
    }

    // Mock countries for Western Europe
    if (tier === 'region' && parentId === 'region-weu') {
      return [
        { id: 'country-gbr', name: 'United Kingdom', code: 'GBR', currency: 'GBP', locale: 'en-GB', localizedName: { en: 'United Kingdom', ar: 'المملكة المتحدة', fr: 'Royaume-Uni' } },
        { id: 'country-fra', name: 'France', code: 'FRA', currency: 'EUR', locale: 'fr-FR', localizedName: { en: 'France', ar: 'فرنسا', fr: 'France' } },
        { id: 'country-deu', name: 'Germany', code: 'DEU', currency: 'EUR', locale: 'de-DE', localizedName: { en: 'Germany', ar: 'ألمانيا', fr: 'Allemagne' } }
      ]
    }

    // Mock cities for UK
    if (tier === 'country' && parentId === 'country-gbr') {
      return [
        { id: 'city-london', name: 'London', localizedName: { en: 'London', ar: 'لندن', fr: 'Londres' } },
        { id: 'city-manchester', name: 'Manchester', localizedName: { en: 'Manchester', ar: 'مانشستر', fr: 'Manchester' } },
        { id: 'city-birmingham', name: 'Birmingham', localizedName: { en: 'Birmingham', ar: 'برمنغهام', fr: 'Birmingham' } }
      ]
    }

    // Mock districts for London
    if (tier === 'city' && parentId === 'city-london') {
      return [
        { id: 'district-edgware', name: 'Edgware', localizedName: { en: 'Edgware', ar: 'إدجوير', fr: 'Edgware' } },
        { id: 'district-westminster', name: 'Westminster', localizedName: { en: 'Westminster', ar: 'وستمنستر', fr: 'Westminster' } },
        { id: 'district-camden', name: 'Camden', localizedName: { en: 'Camden', ar: 'كامدن', fr: 'Camden' } }
      ]
    }

    // Mock locations for Edgware
    if (tier === 'district' && parentId === 'district-edgware') {
      return [
        { id: 'location-victoria-casino', name: 'Victoria Casino Distribution', code: 'VCD-001', localizedName: { en: 'Victoria Casino Distribution', ar: 'توزيع كازينو فيكتوريا', fr: 'Distribution Casino Victoria' } },
        { id: 'location-harrods', name: 'Harrods Distribution', code: 'HAR-001', localizedName: { en: 'Harrods Distribution', ar: 'توزيع هارودز', fr: 'Distribution Harrods' } }
      ]
    }

    return []
  }

  private getMockSearchResults(query: string, tier?: string): Territory[] {
    const lowerQuery = query.toLowerCase()
    const results: Territory[] = []

    // Search in mock data
    const allTerritories = [
      { id: 'city-london', name: 'London', tier: 'city' },
      { id: 'location-victoria-casino', name: 'Victoria Casino Distribution', tier: 'location' },
      { id: 'country-gbr', name: 'United Kingdom', tier: 'country' }
    ]

    allTerritories.forEach(territory => {
      if (territory.name.toLowerCase().includes(lowerQuery)) {
        if (!tier || territory.tier === tier) {
          results.push({
            id: territory.id,
            name: territory.name
          })
        }
      }
    })

    return results
  }
}

export const territoryService = new TerritoryService()
