'use client'

import React, { createContext, useContext, useState, useEffect, useRef, useMemo } from 'react'
import { useLocale } from 'next-intl'
import apiClient from '@/lib/api'
import { UserScope } from '@/types/userScope'
import { getCurrencyData } from '@/config/currency-mapping'
import { getDefaultCountryForLocale, localeToCountryMap } from '@/config/country-mapping'

interface LocalisedCountryData {
  countryName?: string
  currency?: { code: string; symbol: string; fxRateUSD?: number }
  tax?: { vat: number; gst: number; importDuty: number }
  gdpPerCapita?: number
  populationBreakdown?: { value: number; urbanPercent?: number }
  weather?: { city: string; temperature: number; description: string; humidity: number; windSpeed: number }
  channelMix?: Array<{ channel: string; share: number; growth?: number }>
  competitorSet?: Array<{ name: string; share: number; focus: string }>
  skuStructureDetail?: Array<{ tier: string; share: number; heroSkus: string[] }>
  procurement?: Record<string, unknown>
  tradeFlowsDetailed?: Array<{ hsCode: string; description: string; importUSD: number; exportUSD: number }>
  gpsCoverage?: Record<string, unknown>
  satelliteInsights?: Record<string, unknown>
  aiInsights?: Record<string, unknown>
  demandPockets?: Array<{ region: string; velocity: string; focusSKU: string }>
  paymentConnectors?: Array<{ name: string; status: string; priority: number }>
  macroIndicators?: { inflation?: number; unemployment?: number }
}

interface CountryProfilePayload {
  name?: string
  currencyCode?: string
  currencySymbol?: string
  fxRateUSD?: number
  taxModel?: { vat: number; gst: number; importDuty: number }
  populationBreakdown?: { value: number; urbanPercent?: number }
  gdpPerCapita?: number
  weather?: { city: string; temperature: number; description: string; humidity: number; windSpeed: number }
  channelMix?: Array<{ channel: string; share: number; growth?: number }>
  competitorSet?: Array<{ name: string; share: number; focus: string }>
  skuStructureDetail?: Array<{ tier: string; share: number; heroSkus: string[] }>
  procurement?: Record<string, unknown>
  tradeFlowsDetailed?: Array<{ hsCode: string; description: string; importUSD: number; exportUSD: number }>
  gpsCoverage?: Record<string, unknown>
  satelliteInsights?: Record<string, unknown>
  aiInsights?: Record<string, unknown>
  demandPockets?: Array<{ region: string; velocity: string; focusSKU: string }>
  paymentConnectors?: Array<{ name: string; status: string; priority: number }>
  macroIndicators?: { inflation?: number; unemployment?: number }
}

interface CountryContextType {
  selectedCountry: string
  setSelectedCountry: (country: string) => void
  countryData: LocalisedCountryData | null
  loading: boolean
  accessLoading: boolean
  userScope: UserScope | null
  role: UserScope['role'] | null
  availableCountries: string[]
}

const CountryContext = createContext<CountryContextType | undefined>(undefined)

// Use comprehensive locale-to-country mapping from config
// Imported from country-mapping.ts for all 38 languages

export const CountryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const locale = useLocale()
  const [selectedCountry, setSelectedCountryState] = useState<string>(getDefaultCountryForLocale(locale))
  const [countryData, setCountryData] = useState<LocalisedCountryData | null>(null)
  const [loading, setLoading] = useState(true)
  const [accessLoading, setAccessLoading] = useState(true)
  const [userScope, setUserScope] = useState<UserScope | null>(null)
  
  // Ref to prevent locale-change from overriding explicit country selection
  const isUpdatingFromLocale = useRef(false)

  // Update default country when locale changes — unless user already picked one manually
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const userPickedCountry = sessionStorage.getItem('harvics_user_country')
        if (userPickedCountry) return
      } catch { /* private browsing */ }
    }
    const defaultCountryForLocale = getDefaultCountryForLocale(locale)
    if (defaultCountryForLocale && !userScope) {
      isUpdatingFromLocale.current = true
      setSelectedCountryState(defaultCountryForLocale)
      isUpdatingFromLocale.current = false
    }
  }, [locale, userScope])

  const normalizeCountryCode = (value: string) => {
    if (!value) return 'US'
    const lowered = value.toLowerCase()
    const slug = lowered.replace(/\s+/g, '-')
    const mapping: Record<string, string> = {
      // Core markets
      'united-states': 'US',
      'united-states-of-america': 'US',
      'usa': 'US',
      'pakistan': 'PK',
      'india': 'IN',
      'bharat': 'IN',
      'uae': 'AE',
      'united-arab-emirates': 'AE',
      'saudi-arabia': 'SA',
      'united-kingdom': 'UK',
      'uk': 'UK',
      'england': 'UK',
      'china': 'CN',
      'france': 'FR',
      'germany': 'DE',
      'spain': 'ES',
      'italy': 'IT',
      'canada': 'CA',
      'mexico': 'MX',
      'brazil': 'BR',
      'australia': 'AU',
      'south-africa': 'ZA',
      'nigeria': 'NG',
      'kenya': 'KE',
      'egypt': 'EG',
      'indonesia': 'ID',
      'vietnam': 'VN',
      'philippines': 'PH',
      'turkey': 'TR',
      'japan': 'JP',
      'south-korea': 'KR'
    }
    return mapping[slug] || slug.slice(0, 2).toUpperCase()
  }

  const normalisedSelectedCountry = selectedCountry.toLowerCase()
  const allowedCountries = (userScope?.countries || []).map((code) => code.toLowerCase())
  const role = userScope?.role || null
  
  // Get all available countries from config for public access
  const allCountries = useMemo(() => {
    return Array.from(new Set(Object.values(localeToCountryMap).map(m => m.defaultCountry)))
  }, [])

  useEffect(() => {
    const loadScope = async () => {
      setAccessLoading(true)
      try {
        const response = await apiClient.verifyToken()
        if (response.data?.valid && response.data.user?.scope) {
          setUserScope(response.data.user.scope)
          const firstCountry = response.data.user.scope.countries?.[0]
          if (firstCountry) {
            setSelectedCountryState(firstCountry.toLowerCase())
          }
        } else {
          setUserScope(null)
        }
      } catch (error) {
        console.error('Error loading user scope', error)
        setUserScope(null)
      } finally {
        setAccessLoading(false)
      }
    }

    loadScope()
  }, [])

  useEffect(() => {
    if (userScope?.countries && userScope.countries.length > 0) {
      const firstCountry = userScope.countries[0].toLowerCase()
      if (!allowedCountries.includes(normalisedSelectedCountry)) {
        setSelectedCountryState(firstCountry)
      }
    }
  }, [userScope]) // eslint-disable-line react-hooks/exhaustive-deps

  // Load country data when country changes
  useEffect(() => {
    const loadCountryData = async () => {
      setLoading(true)
      
      // Get fallback currency immediately so it's always available
      const fallbackCurrency = getCurrencyData(selectedCountry)
      const countryCode = normalizeCountryCode(selectedCountry)
      
      // If no auth token, use fallback data only — don't call authenticated endpoints
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
      if (!token) {
        setCountryData({
          currency: fallbackCurrency,
          countryCode,
          countryName: selectedCountry,
        } as any)
        setLoading(false)
        return
      }
      
      try {
        // This will be used by all components to get country-specific data
        // Currency, market data, GPS, Satellite all come from this
        const response = await apiClient.getCountryProfile(countryCode)
        if (response.data) {
          const payload = response.data as CountryProfilePayload
          
          // Use API currency if available, otherwise use fallback
          const currencyFromAPI = payload.currencyCode && payload.currencySymbol
            ? {
                code: payload.currencyCode,
                symbol: payload.currencySymbol,
                fxRateUSD: payload.fxRateUSD || fallbackCurrency.fxRateUSD
              }
            : fallbackCurrency
          
          setCountryData({
            countryName: payload.name || selectedCountry,
            currency: currencyFromAPI,
            tax: payload.taxModel,
            populationBreakdown: payload.populationBreakdown,
            gdpPerCapita: payload.gdpPerCapita,
            weather: payload.weather,
            channelMix: payload.channelMix,
            competitorSet: payload.competitorSet,
            skuStructureDetail: payload.skuStructureDetail,
            procurement: payload.procurement,
            tradeFlowsDetailed: payload.tradeFlowsDetailed,
            gpsCoverage: payload.gpsCoverage,
            satelliteInsights: payload.satelliteInsights,
            aiInsights: payload.aiInsights,
            demandPockets: payload.demandPockets,
            paymentConnectors: payload.paymentConnectors,
            macroIndicators: payload.macroIndicators
          })
        } else {
          // API returned no data - use fallback currency
          setCountryData({
            countryName: selectedCountry,
            currency: fallbackCurrency,
            tax: undefined,
            populationBreakdown: undefined,
            gdpPerCapita: undefined
          })
        }
      } catch (err) {
        console.error('Error loading country data, using fallback currency:', err)
        // On API failure, at least set currency from fallback mapping
        setCountryData({
          countryName: selectedCountry,
          currency: fallbackCurrency,
          tax: undefined,
          populationBreakdown: undefined,
          gdpPerCapita: undefined
        })
      } finally {
        setLoading(false)
      }
    }
    loadCountryData()
  }, [selectedCountry])

  const setSelectedCountry = (country: string) => {
    // Allow country changes for all roles - remove restriction
    // Only validate against allowed countries if restrictions exist
    const normalized = country.toLowerCase()
    if (allowedCountries.length > 0 && !allowedCountries.includes(normalized)) {
      // If user has restricted access, validate
      const roleCanChange = role === 'super_admin' || role === 'company_admin' || role === 'country_manager'
      if (!roleCanChange) {
        console.warn('Selected country is not within your access scope')
        return
      }
    }
    
    // Mark that user has explicitly chosen a country — locale changes should not override this
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.setItem('harvics_user_country', normalized)
      } catch { /* private browsing */ }
    }
    
    // Country selection updates the country only — language is controlled independently
    // via the LanguageSwitcher. This prevents the country dropdown from hijacking locale.
    setSelectedCountryState(normalized)
  }

  return (
    <CountryContext.Provider
      value={{
        selectedCountry,
        setSelectedCountry,
        countryData,
        loading,
        accessLoading,
        userScope,
        role,
        availableCountries: allowedCountries.length ? allowedCountries : allCountries,
      }}
    >
      {children}
    </CountryContext.Provider>
  )
}

export const useCountry = () => {
  const context = useContext(CountryContext)
  if (!context) {
    throw new Error('useCountry must be used within CountryProvider')
  }
  return context
}
