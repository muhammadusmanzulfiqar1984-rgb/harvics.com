'use client'

/**
 * Global LocaleProvider - Foundation Layer
 * 
 * Handles session-based locale binding with fallback chain:
 * 1. User profile preference
 * 2. Session storage
 * 3. Browser language
 * 
 * Integrates with:
 * - Currency (auto-switch by country)
 * - Number formatting (locale-specific)
 * - Date/time formats (locale-specific)
 * - UI strings (via next-intl)
 */

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'

import { SUPPORTED_LOCALES as CONFIG_LOCALES, type SupportedLocale as ConfigSupportedLocale } from '@/config/locales';

// Re-export from shared config to maintain compatibility
export const SUPPORTED_LOCALES = CONFIG_LOCALES;
export type SupportedLocale = ConfigSupportedLocale;

// Currency mapping by locale
const LOCALE_TO_CURRENCY: Record<string, string> = {
  'en': 'USD', 'ar': 'AED', 'fr': 'EUR', 'es': 'EUR', 'de': 'EUR',
  'zh': 'CNY', 'he': 'ILS', 'hi': 'INR', 'pt': 'BRL', 'ru': 'RUB',
  'ja': 'JPY', 'ko': 'KRW', 'it': 'EUR', 'nl': 'EUR', 'pl': 'PLN',
  'tr': 'TRY', 'vi': 'VND', 'th': 'THB', 'id': 'IDR', 'ms': 'MYR',
  'sw': 'KES', 'uk': 'UAH', 'ro': 'RON', 'cs': 'CZK', 'sv': 'SEK',
  'da': 'DKK', 'fi': 'EUR', 'no': 'NOK', 'el': 'EUR', 'hu': 'HUF',
  'bg': 'BGN', 'hr': 'HRK', 'sk': 'EUR', 'sr': 'RSD', 'bn': 'BDT',
  'ur': 'PKR', 'fa': 'IRR', 'ps': 'AFN'
}

// Number formatting by locale
const LOCALE_TO_NUMBER_FORMAT: Record<string, Intl.Locale> = {
  'en': new Intl.Locale('en-US'),
  'ar': new Intl.Locale('ar-SA'),
  'fr': new Intl.Locale('fr-FR'),
  'es': new Intl.Locale('es-ES'),
  'de': new Intl.Locale('de-DE'),
  'zh': new Intl.Locale('zh-CN'),
  'he': new Intl.Locale('he-IL'),
  'hi': new Intl.Locale('hi-IN'),
  'pt': new Intl.Locale('pt-BR'),
  'ru': new Intl.Locale('ru-RU'),
  'ja': new Intl.Locale('ja-JP'),
  'ko': new Intl.Locale('ko-KR'),
  'it': new Intl.Locale('it-IT'),
  'nl': new Intl.Locale('nl-NL'),
  'pl': new Intl.Locale('pl-PL'),
  'tr': new Intl.Locale('tr-TR'),
  'vi': new Intl.Locale('vi-VN'),
  'th': new Intl.Locale('th-TH'),
  'id': new Intl.Locale('id-ID'),
  'ms': new Intl.Locale('ms-MY'),
  'sw': new Intl.Locale('sw-KE'),
  'uk': new Intl.Locale('uk-UA'),
  'ro': new Intl.Locale('ro-RO'),
  'cs': new Intl.Locale('cs-CZ'),
  'sv': new Intl.Locale('sv-SE'),
  'da': new Intl.Locale('da-DK'),
  'fi': new Intl.Locale('fi-FI'),
  'no': new Intl.Locale('no-NO'),
  'el': new Intl.Locale('el-GR'),
  'hu': new Intl.Locale('hu-HU'),
  'bg': new Intl.Locale('bg-BG'),
  'hr': new Intl.Locale('hr-HR'),
  'sk': new Intl.Locale('sk-SK'),
  'sr': new Intl.Locale('sr-RS'),
  'bn': new Intl.Locale('bn-BD'),
  'ur': new Intl.Locale('ur-PK'),
  'fa': new Intl.Locale('fa-IR'),
  'ps': new Intl.Locale('ps-AF')
}

interface LocaleContextType {
  // Current locale
  locale: SupportedLocale
  currency: string
  numberFormat: Intl.Locale
  dateFormat: Intl.DateTimeFormatOptions
  
  // Locale detection source
  source: 'profile' | 'session' | 'browser' | 'default'
  
  // Actions
  setLocale: (locale: SupportedLocale, source?: 'profile' | 'session' | 'browser') => void
  formatCurrency: (amount: number) => string
  formatNumber: (value: number) => string
  formatDate: (date: Date | string) => string
  formatDateTime: (date: Date | string) => string
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined)

const SESSION_STORAGE_KEY = 'harvics_locale'
const SESSION_STORAGE_CURRENCY_KEY = 'harvics_currency'

export function LocaleProvider({ 
  children,
  userProfileLocale,
  userId,
  initialLocale
}: { 
  children: ReactNode
  userProfileLocale?: SupportedLocale
  userId?: string
  initialLocale?: string
}) {
  const router = useRouter()
  const pathname = usePathname()
  
  // Detect locale with fallback chain
  const detectLocale = (): { locale: SupportedLocale; source: LocaleContextType['source'] } => {
    // 1. User profile preference (highest priority - explicit user setting)
    if (userProfileLocale && SUPPORTED_LOCALES.includes(userProfileLocale)) {
      return { locale: userProfileLocale, source: 'profile' }
    }

    // 2. Initial locale from URL/parent (The URL is the truth for the current page)
    if (initialLocale && SUPPORTED_LOCALES.includes(initialLocale as SupportedLocale)) {
      return { locale: initialLocale as SupportedLocale, source: 'default' }
    }
    
    // 3. Session storage (fallback if no URL locale - e.g. root /)
    if (typeof window !== 'undefined') {
      try {
        const sessionLocale = sessionStorage.getItem(SESSION_STORAGE_KEY)
        // Validate locale from storage (prevent XSS)
        if (sessionLocale && SUPPORTED_LOCALES.includes(sessionLocale as SupportedLocale)) {
          return { locale: sessionLocale as SupportedLocale, source: 'session' }
        }
      } catch (error) {
        // Silently fail if sessionStorage unavailable
        if (process.env.NODE_ENV === 'development') {
          console.warn('Failed to read from sessionStorage:', error)
        }
      }
    }
    
    // 4. Browser language
    if (typeof window !== 'undefined') {
      const browserLang = navigator.language.split('-')[0]
      if (SUPPORTED_LOCALES.includes(browserLang as SupportedLocale)) {
        return { locale: browserLang as SupportedLocale, source: 'browser' }
      }
    }
    
    // 5. Default fallback
    return { locale: 'en', source: 'default' }
  }
  
  const [localeState, setLocaleState] = useState<{ locale: SupportedLocale; source: LocaleContextType['source'] }>(() => detectLocale())
  
  // Sync with locale changes - properly handle all dependencies
  useEffect(() => {
    const detected = detectLocale()
    if (detected.locale !== localeState.locale || detected.source !== localeState.source) {
      setLocaleState(detected)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialLocale, userProfileLocale, userId, pathname, localeState.locale, localeState.source])
  
  const locale = localeState.locale
  const currency = LOCALE_TO_CURRENCY[locale] || 'USD'
  const numberFormat = LOCALE_TO_NUMBER_FORMAT[locale] || LOCALE_TO_NUMBER_FORMAT['en']
  
  // Date format options by locale
  const dateFormat: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }
  
  const setLocale = (newLocale: SupportedLocale, source: LocaleContextType['source'] = 'session') => {
    if (!SUPPORTED_LOCALES.includes(newLocale)) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`Unsupported locale: ${newLocale}, falling back to 'en'`)
      }
      newLocale = 'en'
    }
    
    setLocaleState({ locale: newLocale, source })
    
    // Save to session storage with validation
    if (typeof window !== 'undefined') {
      // Validate locale before storing (security: prevent XSS)
      const validatedLocale = SUPPORTED_LOCALES.includes(newLocale) ? newLocale : 'en'
      try {
        sessionStorage.setItem(SESSION_STORAGE_KEY, validatedLocale)
        sessionStorage.setItem(SESSION_STORAGE_CURRENCY_KEY, LOCALE_TO_CURRENCY[validatedLocale] || 'USD')
      } catch (error) {
        // Silently fail if sessionStorage is unavailable (private browsing, etc.)
        if (process.env.NODE_ENV === 'development') {
          console.warn('Failed to save locale to sessionStorage:', error)
        }
      }
    }
    
    // Update URL if needed
    if (pathname) {
      const currentLocale = pathname.split('/')[1]
      if (currentLocale !== newLocale && SUPPORTED_LOCALES.includes(currentLocale as SupportedLocale)) {
        const newPath = pathname.replace(`/${currentLocale}`, `/${newLocale}`)
        router.push(newPath)
      }
    }
  }
  
  const formatCurrency = useCallback((amount: number): string => {
    try {
      return new Intl.NumberFormat(numberFormat.toString(), {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(amount)
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('Currency formatting error, using fallback:', error)
      }
      return `${currency} ${amount.toFixed(2)}`
    }
  }, [numberFormat, currency])
  
  const formatNumber = useCallback((value: number): string => {
    try {
      return new Intl.NumberFormat(numberFormat.toString()).format(value)
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('Number formatting error, using fallback:', error)
      }
      return value.toString()
    }
  }, [numberFormat])
  
  const formatDate = useCallback((date: Date | string): string => {
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date
      if (isNaN(dateObj.getTime())) {
        throw new Error('Invalid date')
      }
      return new Intl.DateTimeFormat(numberFormat.toString(), dateFormat).format(dateObj)
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('Date formatting error, using fallback:', error)
      }
      return typeof date === 'string' ? date : date.toISOString().split('T')[0]
    }
  }, [numberFormat, dateFormat])
  
  const formatDateTime = useCallback((date: Date | string): string => {
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date
      if (isNaN(dateObj.getTime())) {
        throw new Error('Invalid date')
      }
      return new Intl.DateTimeFormat(numberFormat.toString(), {
        ...dateFormat,
        hour: '2-digit',
        minute: '2-digit'
      }).format(dateObj)
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('DateTime formatting error, using fallback:', error)
      }
      return typeof date === 'string' ? date : date.toISOString()
    }
  }, [numberFormat, dateFormat])
  
  return (
    <LocaleContext.Provider
      value={{
        locale,
        currency,
        numberFormat,
        dateFormat,
        source: localeState.source,
        setLocale,
        formatCurrency,
        formatNumber,
        formatDate,
        formatDateTime
      }}
    >
      {children}
    </LocaleContext.Provider>
  )
}

export function useLocaleContext() {
  const context = useContext(LocaleContext)
  if (context === undefined) {
    throw new Error('useLocaleContext must be used within a LocaleProvider')
  }
  return context
}

