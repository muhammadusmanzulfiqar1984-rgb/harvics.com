/**
 * Comprehensive Localization Utilities
 * Provides formatting for currency, dates, numbers, and geo data
 * Works vertically (all page levels) and horizontally (all components)
 */

import { useCountry } from '@/contexts/CountryContext'
import { useLocale } from 'next-intl'
import { getCountryData } from '@/data/countryData'

export interface LocalizationConfig {
  locale: string
  country: string
  currency: {
    code: string
    symbol: string
    fxRateUSD?: number
  }
  timezone?: string
  dateFormat?: string
  numberFormat?: string
  isRTL?: boolean
}

/**
 * Hook to get complete localization context
 * Use this in any component to get localized formatting functions
 */
export function useLocalization() {
  const locale = useLocale()
  const { selectedCountry, countryData } = useCountry()

  // Get fallback country data from local database if API data is not available
  // Normalize country code (handle both 'france' and 'FR' formats)
  let fallbackCountryData = null
  try {
    if (typeof window !== 'undefined') {
      const countryKey = (selectedCountry || 'united-states').toLowerCase()
      fallbackCountryData = getCountryData(countryKey)
    }
  } catch {
    // Silently fail - will use defaults
    fallbackCountryData = null
  }
  
  interface CountryDataWithGPS {
    countryName?: string
    currency?: {
      code: string
      symbol: string
      fxRateUSD?: number
    }
    gps?: {
      latitude: number
      longitude: number
      timezone?: string
    }
  }

  const effectiveCountryData: CountryDataWithGPS = countryData || {
    countryName: fallbackCountryData?.name,
    currency: fallbackCountryData?.currency ? {
      code: fallbackCountryData.currency.code,
      symbol: fallbackCountryData.currency.symbol,
      fxRateUSD: fallbackCountryData.currency.exchangeRate
    } : { code: 'USD', symbol: '$' },
    gps: fallbackCountryData?.gps || { latitude: 0, longitude: 0, timezone: 'UTC' }
  }

  const config: LocalizationConfig = {
    locale,
    country: selectedCountry || 'united-states',
    currency: effectiveCountryData?.currency || { code: 'USD', symbol: '$' },
    timezone: effectiveCountryData?.gps?.timezone || 'UTC',
    isRTL: locale === 'ar' || locale === 'he' || locale === 'ur' || locale === 'fa' || locale === 'ps'
  }

  /**
   * Format currency based on selected country
   */
  const formatCurrency = (amount: number, options?: {
    showSymbol?: boolean
    decimals?: number
    currencyCode?: string
  }): string => {
    const currencyCode = options?.currencyCode || config.currency.code
    const symbol = config.currency.symbol
    const decimals = options?.decimals ?? 2

    // Convert to local currency if needed
    let localAmount = amount
    if (config.currency.fxRateUSD && currencyCode !== 'USD') {
      localAmount = amount * (config.currency.fxRateUSD || 1)
    }

    try {
      const formatted = new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currencyCode,
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      }).format(localAmount)

      return formatted
    } catch {
      // Fallback formatting
      const formatted = localAmount.toLocaleString(locale, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      })
      return options?.showSymbol !== false ? `${symbol}${formatted}` : formatted
    }
  }

  /**
   * Format number based on locale
   */
  const formatNumber = (value: number, options?: {
    decimals?: number
    compact?: boolean
  }): string => {
    try {
      if (options?.compact && value >= 1000) {
        return new Intl.NumberFormat(locale, {
          notation: 'compact',
          maximumFractionDigits: 1
        }).format(value)
      }

      return new Intl.NumberFormat(locale, {
        minimumFractionDigits: options?.decimals ?? 0,
        maximumFractionDigits: options?.decimals ?? 2
      }).format(value)
    } catch {
      return value.toLocaleString()
    }
  }

  /**
   * Format date based on locale and country
   */
  const formatDate = (date: Date | string, options?: {
    format?: 'short' | 'medium' | 'long' | 'full'
    includeTime?: boolean
  }): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date

    try {
      const formatOptions: Intl.DateTimeFormatOptions = {
        dateStyle: options?.format || 'medium',
        ...(options?.includeTime && { timeStyle: 'short' })
      }

      return new Intl.DateTimeFormat(locale, formatOptions).format(dateObj)
    } catch {
      return dateObj.toLocaleDateString()
    }
  }

  /**
   * Format percentage
   */
  const formatPercent = (value: number, decimals: number = 1): string => {
    try {
      return new Intl.NumberFormat(locale, {
        style: 'percent',
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      }).format(value / 100)
    } catch {
      return `${value.toFixed(decimals)}%`
    }
  }

  /**
   * Get country name in current locale
   */
  const getCountryName = (countryCode?: string): string => {
    const code = countryCode || selectedCountry
    if (countryData?.countryName) {
      return countryData.countryName
    }
    // Fallback to formatted code
    return code.replace(/-/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())
  }

  /**
   * Get currency symbol
   */
  const getCurrencySymbol = (): string => {
    return config.currency.symbol || '$'
  }

  /**
   * Get currency code
   */
  const getCurrencyCode = (): string => {
    return config.currency.code || 'USD'
  }

  /**
   * Check if current locale is RTL
   */
  const isRTL = (): boolean => {
    return config.isRTL || false
  }

  /**
   * Get timezone
   */
  const getTimezone = (): string => {
    return config.timezone || 'UTC'
  }

  return {
    config,
    formatCurrency,
    formatNumber,
    formatDate,
    formatPercent,
    getCountryName,
    getCurrencySymbol,
    getCurrencyCode,
    isRTL,
    getTimezone,
    locale,
    country: selectedCountry,
    currency: config.currency
  }
}

/**
 * Format large currency amounts (billions, millions, thousands)
 */
export function formatLargeCurrency(amount: number, currencySymbol: string = '$'): string {
  if (amount >= 1000000000) {
    return `${currencySymbol}${(amount / 1000000000).toFixed(1)}B`
  }
  if (amount >= 1000000) {
    return `${currencySymbol}${(amount / 1000000).toFixed(1)}M`
  }
  if (amount >= 1000) {
    return `${currencySymbol}${(amount / 1000).toFixed(1)}K`
  }
  return `${currencySymbol}${amount.toFixed(0)}`
}

/**
 * Get locale-specific date format pattern
 */
export function getDateFormatPattern(locale: string): string {
  const patterns: Record<string, string> = {
    'en': 'MM/DD/YYYY',
    'ar': 'DD/MM/YYYY',
    'fr': 'DD/MM/YYYY',
    'es': 'DD/MM/YYYY',
    'de': 'DD.MM.YYYY',
    'zh': 'YYYY/MM/DD',
    'ja': 'YYYY/MM/DD',
    'ko': 'YYYY/MM/DD',
    'ur': 'DD/MM/YYYY',
    'hi': 'DD/MM/YYYY'
  }
  return patterns[locale] || 'MM/DD/YYYY'
}
