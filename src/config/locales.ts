/**
 * Shared Locale Configuration
 * 
 * This file defines the locales that are actually supported.
 * Static files (en, ar) are loaded from src/locales/
 * Other locales are loaded from the backend API.
 */

// Locales that have static JSON files in src/locales/
// Note: Skeleton files exist for all languages, but only en/ar/es are fully translated
// Other locales will fallback to backend API or English
export const STATIC_LOCALES = ['en', 'ar', 'es', 'fr'] as const;

// All supported locales - includes static files + backend API supported locales
// Static files are preferred, but backend API can serve all of these
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

