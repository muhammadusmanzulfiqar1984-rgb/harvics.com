/**
 * Timezone Utilities
 * Provides timezone handling per country
 */

export interface CountryTimezone {
  countryCode: string;
  countryName: string;
  timezone: string;
  utcOffset: string;
  dstOffset?: string;
}

// Country to timezone mapping
const COUNTRY_TIMEZONES: Record<string, CountryTimezone> = {
  'US': { countryCode: 'US', countryName: 'United States', timezone: 'America/New_York', utcOffset: '-05:00', dstOffset: '-04:00' },
  'PK': { countryCode: 'PK', countryName: 'Pakistan', timezone: 'Asia/Karachi', utcOffset: '+05:00' },
  'AE': { countryCode: 'AE', countryName: 'United Arab Emirates', timezone: 'Asia/Dubai', utcOffset: '+04:00' },
  'SA': { countryCode: 'SA', countryName: 'Saudi Arabia', timezone: 'Asia/Riyadh', utcOffset: '+03:00' },
  'GB': { countryCode: 'GB', countryName: 'United Kingdom', timezone: 'Europe/London', utcOffset: '+00:00', dstOffset: '+01:00' },
  'UK': { countryCode: 'GB', countryName: 'United Kingdom', timezone: 'Europe/London', utcOffset: '+00:00', dstOffset: '+01:00' },
  'CN': { countryCode: 'CN', countryName: 'China', timezone: 'Asia/Shanghai', utcOffset: '+08:00' },
  'FR': { countryCode: 'FR', countryName: 'France', timezone: 'Europe/Paris', utcOffset: '+01:00', dstOffset: '+02:00' },
  'DE': { countryCode: 'DE', countryName: 'Germany', timezone: 'Europe/Berlin', utcOffset: '+01:00', dstOffset: '+02:00' },
  'ES': { countryCode: 'ES', countryName: 'Spain', timezone: 'Europe/Madrid', utcOffset: '+01:00', dstOffset: '+02:00' },
  'IT': { countryCode: 'IT', countryName: 'Italy', timezone: 'Europe/Rome', utcOffset: '+01:00', dstOffset: '+02:00' },
  'CA': { countryCode: 'CA', countryName: 'Canada', timezone: 'America/Toronto', utcOffset: '-05:00', dstOffset: '-04:00' },
  'MX': { countryCode: 'MX', countryName: 'Mexico', timezone: 'America/Mexico_City', utcOffset: '-06:00', dstOffset: '-05:00' },
  'BR': { countryCode: 'BR', countryName: 'Brazil', timezone: 'America/Sao_Paulo', utcOffset: '-03:00', dstOffset: '-02:00' },
  'AU': { countryCode: 'AU', countryName: 'Australia', timezone: 'Australia/Sydney', utcOffset: '+10:00', dstOffset: '+11:00' },
  'ZA': { countryCode: 'ZA', countryName: 'South Africa', timezone: 'Africa/Johannesburg', utcOffset: '+02:00' },
  'NG': { countryCode: 'NG', countryName: 'Nigeria', timezone: 'Africa/Lagos', utcOffset: '+01:00' },
  'KE': { countryCode: 'KE', countryName: 'Kenya', timezone: 'Africa/Nairobi', utcOffset: '+03:00' },
  'EG': { countryCode: 'EG', countryName: 'Egypt', timezone: 'Africa/Cairo', utcOffset: '+02:00', dstOffset: '+03:00' },
  'ID': { countryCode: 'ID', countryName: 'Indonesia', timezone: 'Asia/Jakarta', utcOffset: '+07:00' },
  'VN': { countryCode: 'VN', countryName: 'Vietnam', timezone: 'Asia/Ho_Chi_Minh', utcOffset: '+07:00' },
  'PH': { countryCode: 'PH', countryName: 'Philippines', timezone: 'Asia/Manila', utcOffset: '+08:00' },
  'TR': { countryCode: 'TR', countryName: 'Turkey', timezone: 'Europe/Istanbul', utcOffset: '+03:00' },
  'JP': { countryCode: 'JP', countryName: 'Japan', timezone: 'Asia/Tokyo', utcOffset: '+09:00' },
  'KR': { countryCode: 'KR', countryName: 'South Korea', timezone: 'Asia/Seoul', utcOffset: '+09:00' },
  'IN': { countryCode: 'IN', countryName: 'India', timezone: 'Asia/Kolkata', utcOffset: '+05:30' },
  'IL': { countryCode: 'IL', countryName: 'Israel', timezone: 'Asia/Jerusalem', utcOffset: '+02:00', dstOffset: '+03:00' },
};

/**
 * Get timezone info for a country
 */
export function getCountryTimezone(countryCode: string): CountryTimezone | null {
  return COUNTRY_TIMEZONES[countryCode.toUpperCase()] || null;
}

/**
 * Get current time in country timezone
 */
export function getCountryTime(countryCode: string): Date {
  const tz = getCountryTimezone(countryCode);
  if (!tz) {
    return new Date(); // Fallback to local time
  }
  
  // Use Intl.DateTimeFormat for timezone conversion
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: tz.timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
  
  const parts = formatter.formatToParts(now);
  const year = parseInt(parts.find(p => p.type === 'year')?.value || '0');
  const month = parseInt(parts.find(p => p.type === 'month')?.value || '0') - 1;
  const day = parseInt(parts.find(p => p.type === 'day')?.value || '0');
  const hour = parseInt(parts.find(p => p.type === 'hour')?.value || '0');
  const minute = parseInt(parts.find(p => p.type === 'minute')?.value || '0');
  const second = parseInt(parts.find(p => p.type === 'second')?.value || '0');
  
  return new Date(year, month, day, hour, minute, second);
}

/**
 * Format date/time for a country
 */
export function formatCountryDateTime(date: Date, countryCode: string, locale: string = 'en'): string {
  const tz = getCountryTimezone(countryCode);
  if (!tz) {
    return date.toLocaleString(locale);
  }
  
  return new Intl.DateTimeFormat(locale, {
    timeZone: tz.timezone,
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  }).format(date);
}

/**
 * Format time only for a country
 */
export function formatCountryTime(date: Date, countryCode: string, locale: string = 'en'): string {
  const tz = getCountryTimezone(countryCode);
  if (!tz) {
    return date.toLocaleTimeString(locale);
  }
  
  return new Intl.DateTimeFormat(locale, {
    timeZone: tz.timezone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  }).format(date);
}

/**
 * Format date only for a country
 */
export function formatCountryDate(date: Date, countryCode: string, locale: string = 'en'): string {
  const tz = getCountryTimezone(countryCode);
  if (!tz) {
    return date.toLocaleDateString(locale);
  }
  
  return new Intl.DateTimeFormat(locale, {
    timeZone: tz.timezone,
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
}

/**
 * Check if a country observes DST (Daylight Saving Time)
 */
export function hasDST(countryCode: string): boolean {
  const tz = getCountryTimezone(countryCode);
  return !!tz?.dstOffset;
}

/**
 * Get UTC offset for a country
 */
export function getUTCOffset(countryCode: string, useDST: boolean = true): string {
  const tz = getCountryTimezone(countryCode);
  if (!tz) return '+00:00';
  
  if (useDST && hasDST(countryCode)) {
    // Check if currently in DST period (simplified - for production, use proper DST detection)
    const now = new Date();
    const month = now.getMonth(); // 0-11
    // Northern hemisphere: DST typically March-November
    // Southern hemisphere: DST typically October-March
    // This is simplified - for production, use a proper timezone library
    if (tz.dstOffset && month >= 2 && month <= 9) {
      return tz.dstOffset;
    }
  }
  
  return tz.utcOffset;
}

