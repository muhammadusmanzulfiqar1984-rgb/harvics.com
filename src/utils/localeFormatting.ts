/**
 * Locale-Specific Formatting Utilities
 * Provides number, currency, date, and address formatting per locale
 */

/**
 * Format number according to locale
 */
export function formatNumber(value: number, locale: string = 'en', options?: Intl.NumberFormatOptions): string {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
    ...options
  }).format(value);
}

/**
 * Format currency according to locale and country
 */
export function formatCurrency(
  amount: number,
  currencyCode: string,
  locale: string = 'en',
  options?: Intl.NumberFormatOptions
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    ...options
  }).format(amount);
}

/**
 * Format percentage
 */
export function formatPercentage(value: number, locale: string = 'en', decimals: number = 1): string {
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value / 100);
}

/**
 * Format date according to locale
 */
export function formatDate(date: Date, locale: string = 'en', options?: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options
  }).format(date);
}

/**
 * Format date and time according to locale
 */
export function formatDateTime(date: Date, locale: string = 'en', options?: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    ...options
  }).format(date);
}

/**
 * Format time according to locale
 */
export function formatTime(date: Date, locale: string = 'en', options?: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat(locale, {
    hour: '2-digit',
    minute: '2-digit',
    ...options
  }).format(date);
}

/**
 * Format relative time (e.g., "2 hours ago", "in 3 days")
 */
export function formatRelativeTime(date: Date, locale: string = 'en'): string {
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  const diffInSeconds = Math.floor((date.getTime() - Date.now()) / 1000);
  const absDiff = Math.abs(diffInSeconds);

  if (absDiff < 60) {
    return rtf.format(diffInSeconds, 'second');
  } else if (absDiff < 3600) {
    return rtf.format(Math.floor(diffInSeconds / 60), 'minute');
  } else if (absDiff < 86400) {
    return rtf.format(Math.floor(diffInSeconds / 3600), 'hour');
  } else if (absDiff < 2592000) {
    return rtf.format(Math.floor(diffInSeconds / 86400), 'day');
  } else if (absDiff < 31536000) {
    return rtf.format(Math.floor(diffInSeconds / 2592000), 'month');
  } else {
    return rtf.format(Math.floor(diffInSeconds / 31536000), 'year');
  }
}

/**
 * Format phone number according to country format
 */
export function formatPhoneNumber(phone: string, countryCode: string): string {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');
  
  // Country-specific formatting (simplified examples)
  const formats: Record<string, (d: string) => string> = {
    'US': (d) => {
      if (d.length === 10) return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
      if (d.length === 11 && d[0] === '1') return `+1 (${d.slice(1, 4)}) ${d.slice(4, 7)}-${d.slice(7)}`;
      return d;
    },
    'AE': (d) => {
      if (d.length === 9) return `${d.slice(0, 2)} ${d.slice(2, 5)} ${d.slice(5)}`;
      if (d.length === 12 && d.startsWith('971')) return `+971 ${d.slice(3, 5)} ${d.slice(5, 8)} ${d.slice(8)}`;
      return d;
    },
    'PK': (d) => {
      if (d.length === 10) return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}`;
      if (d.length === 12 && d.startsWith('92')) return `+92 ${d.slice(2, 4)} ${d.slice(4, 7)}-${d.slice(7)}`;
      return d;
    },
    'GB': (d) => {
      if (d.length === 10) return `${d.slice(0, 5)} ${d.slice(5)}`;
      if (d.length === 11 && d[0] === '0') return `${d.slice(0, 5)} ${d.slice(5)}`;
      return d;
    }
  };
  
  const formatter = formats[countryCode.toUpperCase()];
  return formatter ? formatter(digits) : phone;
}

/**
 * Format address according to country format
 */
export interface Address {
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

export function formatAddress(address: Address, countryCode: string, locale: string = 'en'): string {
  void locale
  const parts: string[] = [];
  
  if (address.street) parts.push(address.street);
  
  // Country-specific address formats
  switch (countryCode.toUpperCase()) {
    case 'US':
    case 'CA':
      if (address.city && address.state) {
        parts.push(`${address.city}, ${address.state}${address.postalCode ? ` ${address.postalCode}` : ''}`);
      } else if (address.city) {
        parts.push(address.city);
      }
      break;
      
    case 'GB':
    case 'UK':
      if (address.city && address.postalCode) {
        parts.push(`${address.city} ${address.postalCode}`);
      } else if (address.city) {
        parts.push(address.city);
      }
      break;
      
    case 'AE':
    case 'PK':
    case 'SA':
      // City, Postal Code format
      if (address.city) parts.push(address.city);
      if (address.postalCode) parts.push(address.postalCode);
      break;
      
    default:
      // Generic format
      if (address.city) parts.push(address.city);
      if (address.state) parts.push(address.state);
      if (address.postalCode) parts.push(address.postalCode);
  }
  
  if (address.country) parts.push(address.country);
  
  return parts.join(', ');
}

/**
 * Validate phone number for a country
 */
export function validatePhoneNumber(phone: string, countryCode: string): boolean {
  const digits = phone.replace(/\D/g, '');
  
  const validations: Record<string, (d: string) => boolean> = {
    'US': (d) => d.length === 10 || (d.length === 11 && d[0] === '1'),
    'AE': (d) => d.length === 9 || (d.length === 12 && d.startsWith('971')),
    'PK': (d) => d.length === 10 || (d.length === 12 && d.startsWith('92')),
    'GB': (d) => d.length === 10 || (d.length === 11),
  };
  
  const validator = validations[countryCode.toUpperCase()];
  return validator ? validator(digits) : digits.length >= 8 && digits.length <= 15;
}
