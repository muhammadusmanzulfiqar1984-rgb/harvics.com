/**
 * Shared Locale Configuration
 * All 38 locales load from static JSON files in src/locales/
 */

export const STATIC_LOCALES = ['en', 'ar', 'es', 'fr', 'de', 'zh', 'he', 'hi', 'pt', 'ru', 'ja', 'ko', 'it', 'nl', 'tr', 'pl', 'sv', 'da', 'fi', 'no', 'cs', 'ro', 'hu', 'el', 'uk', 'id', 'ms', 'th', 'vi', 'fa', 'ur', 'bn', 'sw', 'am', 'af', 'tl', 'sk', 'hr'] as const;

export const SUPPORTED_LOCALES = [
  'en', 'ar', 'fr', 'es', 'de', 'zh', 'he', 'hi', 'pt', 'ru', 
  'ja', 'ko', 'it', 'nl', 'pl', 'tr', 'vi', 'th', 'id', 'ms', 
  'sw', 'uk', 'ro', 'cs', 'sv', 'da', 'fi', 'no', 'el', 'hu', 
  'bg', 'hr', 'sk', 'sr', 'bn', 'ur', 'fa', 'ps'
] as const;

export type SupportedLocale = typeof SUPPORTED_LOCALES[number];

// Default locale
export const DEFAULT_LOCALE: SupportedLocale = 'en';

// Check if a locale is supported
export function isSupportedLocale(locale: string): locale is SupportedLocale {
  return SUPPORTED_LOCALES.includes(locale as SupportedLocale);
}

// Get a valid locale, falling back to default if invalid
export function getValidLocale(locale: string | undefined | null): SupportedLocale {
  if (!locale) return DEFAULT_LOCALE;
  return isSupportedLocale(locale) ? locale : DEFAULT_LOCALE;
}

