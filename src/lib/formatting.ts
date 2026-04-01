// Globalization utilities for currency, date, and number formatting
// Uses native Intl API for proper localization

import { getLocaleConfig } from '@/config/localeConfig'

/**
 * Format currency based on locale
 * @param amount - The numeric amount
 * @param locale - The locale code (e.g., 'en', 'ar', 'zh')
 * @param currency - Optional currency code override
 */
export const formatCurrency = (
  amount: number,
  locale: string,
  currency?: string
): string => {
  const config = getLocaleConfig(locale)
  const currencyCode = currency || config.currency

  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount)
  } catch (error) {
    // Fallback if Intl fails
    return `${config.currencySymbol}${amount.toLocaleString(locale)}`
  }
}

/**
 * Format number based on locale
 * @param num - The number to format
 * @param locale - The locale code
 * @param decimals - Number of decimal places (optional)
 */
export const formatNumber = (
  num: number,
  locale: string,
  decimals?: number
): string => {
  try {
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(num)
  } catch (error) {
    return num.toLocaleString(locale)
  }
}

/**
 * Format date based on locale
 * @param date - Date object or string
 * @param locale - The locale code
 * @param options - Optional Intl.DateTimeFormat options
 */
export const formatDate = (
  date: Date | string,
  locale: string,
  options?: Intl.DateTimeFormatOptions
): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date

  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options
  }

  try {
    return new Intl.DateTimeFormat(locale, defaultOptions).format(dateObj)
  } catch (error) {
    return dateObj.toLocaleDateString(locale)
  }
}

/**
 * Format time based on locale
 * @param date - Date object or string
 * @param locale - The locale code
 */
export const formatTime = (
  date: Date | string,
  locale: string
): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const config = getLocaleConfig(locale)

  try {
    return new Intl.DateTimeFormat(locale, {
      hour: 'numeric',
      minute: 'numeric',
      hour12: config.timeFormat === '12h'
    }).format(dateObj)
  } catch (error) {
    return dateObj.toLocaleTimeString(locale)
  }
}

/**
 * Format percentage based on locale
 * @param value - The numeric value (0.15 = 15%)
 * @param locale - The locale code
 * @param decimals - Number of decimal places
 */
export const formatPercentage = (
  value: number,
  locale: string,
  decimals: number = 0
): string => {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'percent',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(value)
  } catch (error) {
    return `${(value * 100).toFixed(decimals)}%`
  }
}

/**
 * Format large numbers with compact notation (1K, 1M, 1B)
 * @param num - The number to format
 * @param locale - The locale code
 */
export const formatCompactNumber = (
  num: number,
  locale: string
): string => {
  try {
    return new Intl.NumberFormat(locale, {
      notation: 'compact',
      compactDisplay: 'short'
    }).format(num)
  } catch (error) {
    // Fallback for older browsers
    if (num >= 1_000_000_000) {
      return `${(num / 1_000_000_000).toFixed(1)}B`
    } else if (num >= 1_000_000) {
      return `${(num / 1_000_000).toFixed(1)}M`
    } else if (num >= 1_000) {
      return `${(num / 1_000).toFixed(1)}K`
    }
    return num.toString()
  }
}

/**
 * Format relative time (e.g., "3 days ago", "in 2 hours")
 * @param date - Date object or string
 * @param locale - The locale code
 */
export const formatRelativeTime = (
  date: Date | string,
  locale: string
): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffMs = dateObj.getTime() - now.getTime()
  const diffSec = Math.round(diffMs / 1000)
  const diffMin = Math.round(diffSec / 60)
  const diffHour = Math.round(diffMin / 60)
  const diffDay = Math.round(diffHour / 24)

  try {
    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })

    if (Math.abs(diffDay) >= 1) {
      return rtf.format(diffDay, 'day')
    } else if (Math.abs(diffHour) >= 1) {
      return rtf.format(diffHour, 'hour')
    } else if (Math.abs(diffMin) >= 1) {
      return rtf.format(diffMin, 'minute')
    } else {
      return rtf.format(diffSec, 'second')
    }
  } catch (error) {
    // Fallback
    if (Math.abs(diffDay) >= 1) {
      return `${Math.abs(diffDay)} days ${diffDay > 0 ? 'from now' : 'ago'}`
    } else if (Math.abs(diffHour) >= 1) {
      return `${Math.abs(diffHour)} hours ${diffHour > 0 ? 'from now' : 'ago'}`
    } else {
      return 'just now'
    }
  }
}

/**
 * Get locale-specific decimal separator
 */
export const getDecimalSeparator = (locale: string): string => {
  return getLocaleConfig(locale).numberFormat.decimal
}

/**
 * Get locale-specific thousands separator
 */
export const getThousandsSeparator = (locale: string): string => {
  return getLocaleConfig(locale).numberFormat.thousands
}

/**
 * Parse localized number string to number
 * @param str - The localized number string
 * @param locale - The locale code
 */
export const parseLocalizedNumber = (str: string, locale: string): number => {
  const config = getLocaleConfig(locale)
  
  // Remove thousands separator and replace decimal separator with standard dot
  const normalized = str
    .replace(new RegExp(`\\${config.numberFormat.thousands}`, 'g'), '')
    .replace(config.numberFormat.decimal, '.')
  
  return parseFloat(normalized)
}

/**
 * Format file size in locale-appropriate units
 * @param bytes - File size in bytes
 * @param locale - The locale code
 */
export const formatFileSize = (bytes: number, locale: string): string => {
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  let size = bytes
  let unitIndex = 0

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }

  return `${formatNumber(size, locale, 2)} ${units[unitIndex]}`
}

/**
 * Format phone number based on locale
 * @param phone - Phone number string
 * @param locale - The locale code
 */
export const formatPhoneNumber = (phone: string, locale: string): string => {
  // Basic formatting - can be enhanced with libphonenumber-js
  const digits = phone.replace(/\D/g, '')
  
  // Simple US format as example
  if (locale === 'en' && digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
  }
  
  return phone
}
