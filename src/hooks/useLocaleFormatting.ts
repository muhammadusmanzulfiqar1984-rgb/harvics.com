/**
 * Locale Formatting Hook
 * React hook for locale-specific formatting utilities
 */

import { useLocale } from 'next-intl';
import { useCountry } from '@/contexts/CountryContext';
import {
  formatNumber,
  formatCurrency,
  formatPercentage,
  formatDate,
  formatDateTime,
  formatTime,
  formatRelativeTime,
  formatPhoneNumber,
  formatAddress,
  validatePhoneNumber,
  type Address
} from '@/utils/localeFormatting';

export function useLocaleFormatting() {
  const locale = useLocale();
  const { countryData } = useCountry();

  const currencyCode = countryData?.currency?.code || 'USD';
  const currencySymbol = countryData?.currency?.symbol || '$';

  return {
    formatNumber: (value: number, options?: Intl.NumberFormatOptions) => 
      formatNumber(value, locale, options),
    formatCurrency: (amount: number, options?: Intl.NumberFormatOptions) => 
      formatCurrency(amount, currencyCode, locale, options),
    formatPercentage: (value: number, decimals: number = 1) => 
      formatPercentage(value, locale, decimals),
    formatDate: (date: Date, options?: Intl.DateTimeFormatOptions) => 
      formatDate(date, locale, options),
    formatDateTime: (date: Date, options?: Intl.DateTimeFormatOptions) => 
      formatDateTime(date, locale, options),
    formatTime: (date: Date, options?: Intl.DateTimeFormatOptions) => 
      formatTime(date, locale, options),
    formatRelativeTime: (date: Date) => 
      formatRelativeTime(date, locale),
    formatPhoneNumber: (phone: string, countryCode?: string) => {
      const code = countryCode || countryData?.countryName || 'US';
      return formatPhoneNumber(phone, code);
    },
    formatAddress: (address: Address, countryCode?: string) => {
      const code = countryCode || countryData?.countryName || 'US';
      return formatAddress(address, code, locale);
    },
    validatePhoneNumber: (phone: string, countryCode?: string) => {
      const code = countryCode || countryData?.countryName || 'US';
      return validatePhoneNumber(phone, code);
    },
    currencyCode,
    currencySymbol
  };
}

