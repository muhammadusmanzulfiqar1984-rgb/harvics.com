/**
 * RTL (Right-to-Left) Utilities
 * Provides helper functions for RTL layout support
 */

export const RTL_LOCALES = ['ar', 'he', 'ur', 'fa', 'ps'] as const;
export type RTLLocale = typeof RTL_LOCALES[number];

/**
 * Check if a locale is RTL
 */
export function isRTL(locale: string): boolean {
  return RTL_LOCALES.includes(locale as RTLLocale);
}

/**
 * Get text direction for a locale
 */
export function getTextDirection(locale: string): 'rtl' | 'ltr' {
  return isRTL(locale) ? 'rtl' : 'ltr';
}

/**
 * Get RTL-aware margin/padding class
 * Returns 'ml-' for LTR and 'mr-' for RTL
 */
export function getMarginStart(locale: string, size: string): string {
  return isRTL(locale) ? `mr-${size}` : `ml-${size}`;
}

/**
 * Get RTL-aware margin/padding class
 * Returns 'mr-' for LTR and 'ml-' for RTL
 */
export function getMarginEnd(locale: string, size: string): string {
  return isRTL(locale) ? `ml-${size}` : `mr-${size}`;
}

/**
 * Get RTL-aware padding class
 * Returns 'pl-' for LTR and 'pr-' for RTL
 */
export function getPaddingStart(locale: string, size: string): string {
  return isRTL(locale) ? `pr-${size}` : `pl-${size}`;
}

/**
 * Get RTL-aware padding class
 * Returns 'pr-' for LTR and 'pl-' for RTL
 */
export function getPaddingEnd(locale: string, size: string): string {
  return isRTL(locale) ? `pl-${size}` : `pr-${size}`;
}

/**
 * Get RTL-aware flex direction
 */
export function getFlexDirection(locale: string): string {
  return isRTL(locale) ? 'flex-row-reverse' : 'flex-row';
}

/**
 * Get RTL-aware text alignment
 */
export function getTextAlign(locale: string): 'text-right' | 'text-left' {
  return isRTL(locale) ? 'text-right' : 'text-left';
}

/**
 * Get RTL-aware border radius classes
 * Returns 'rounded-l' for LTR and 'rounded-r' for RTL
 */
export function getBorderRadiusStart(locale: string, size: string): string {
  return isRTL(locale) ? `rounded-r-${size}` : `rounded-l-${size}`;
}

export function getBorderRadiusEnd(locale: string, size: string): string {
  return isRTL(locale) ? `rounded-l-${size}` : `rounded-r-${size}`;
}

