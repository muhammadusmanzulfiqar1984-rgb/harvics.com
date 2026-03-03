/**
 * Currency Fallback Mapping
 * 
 * Provides currency data when backend API fails or is unavailable.
 * This ensures currency always displays correctly even without backend connectivity.
 */

export interface CurrencyData {
  code: string
  symbol: string
  name: string
  fxRateUSD?: number // Base: USD = 1.0
}

// Comprehensive currency mapping by country code
export const currencyMap: Record<string, CurrencyData> = {
  // North America
  'US': { code: 'USD', symbol: '$', name: 'US Dollar', fxRateUSD: 1.0 },
  'CA': { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', fxRateUSD: 0.75 },
  'MX': { code: 'MXN', symbol: 'MX$', name: 'Mexican Peso', fxRateUSD: 0.059 },
  
  // Europe
  'UK': { code: 'GBP', symbol: '£', name: 'British Pound', fxRateUSD: 1.27 },
  'GB': { code: 'GBP', symbol: '£', name: 'British Pound', fxRateUSD: 1.27 },
  'FR': { code: 'EUR', symbol: '€', name: 'Euro', fxRateUSD: 1.10 },
  'DE': { code: 'EUR', symbol: '€', name: 'Euro', fxRateUSD: 1.10 },
  'ES': { code: 'EUR', symbol: '€', name: 'Euro', fxRateUSD: 1.10 },
  'IT': { code: 'EUR', symbol: '€', name: 'Euro', fxRateUSD: 1.10 },
  'NL': { code: 'EUR', symbol: '€', name: 'Euro', fxRateUSD: 1.10 },
  'PL': { code: 'PLN', symbol: 'zł', name: 'Polish Zloty', fxRateUSD: 0.25 },
  'RO': { code: 'RON', symbol: 'lei', name: 'Romanian Leu', fxRateUSD: 0.22 },
  'CS': { code: 'CZK', symbol: 'Kč', name: 'Czech Koruna', fxRateUSD: 0.044 },
  'SV': { code: 'SEK', symbol: 'kr', name: 'Swedish Krona', fxRateUSD: 0.096 },
  'DK': { code: 'DKK', symbol: 'kr', name: 'Danish Krone', fxRateUSD: 0.15 },
  'FI': { code: 'EUR', symbol: '€', name: 'Euro', fxRateUSD: 1.10 },
  'NO': { code: 'NOK', symbol: 'kr', name: 'Norwegian Krone', fxRateUSD: 0.095 },
  'EL': { code: 'EUR', symbol: '€', name: 'Euro', fxRateUSD: 1.10 },
  'GR': { code: 'EUR', symbol: '€', name: 'Euro', fxRateUSD: 1.10 },
  'HU': { code: 'HUF', symbol: 'Ft', name: 'Hungarian Forint', fxRateUSD: 0.0028 },
  'BG': { code: 'BGN', symbol: 'лв', name: 'Bulgarian Lev', fxRateUSD: 0.56 },
  'HR': { code: 'EUR', symbol: '€', name: 'Euro', fxRateUSD: 1.10 },
  'SK': { code: 'EUR', symbol: '€', name: 'Euro', fxRateUSD: 1.10 },
  'SR': { code: 'RSD', symbol: 'дин', name: 'Serbian Dinar', fxRateUSD: 0.0093 },
  'UA': { code: 'UAH', symbol: '₴', name: 'Ukrainian Hryvnia', fxRateUSD: 0.027 },
  
  // Middle East
  'AE': { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham', fxRateUSD: 0.27 },
  'SA': { code: 'SAR', symbol: '﷼', name: 'Saudi Riyal', fxRateUSD: 0.27 },
  'IL': { code: 'ILS', symbol: '₪', name: 'Israeli Shekel', fxRateUSD: 0.27 },
  'TR': { code: 'TRY', symbol: '₺', name: 'Turkish Lira', fxRateUSD: 0.033 },
  'IR': { code: 'IRR', symbol: '﷼', name: 'Iranian Rial', fxRateUSD: 0.000024 },
  
  // Asia
  'CN': { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', fxRateUSD: 0.14 },
  'JP': { code: 'JPY', symbol: '¥', name: 'Japanese Yen', fxRateUSD: 0.0067 },
  'KR': { code: 'KRW', symbol: '₩', name: 'South Korean Won', fxRateUSD: 0.00076 },
  'IN': { code: 'INR', symbol: '₹', name: 'Indian Rupee', fxRateUSD: 0.012 },
  'PK': { code: 'PKR', symbol: '₨', name: 'Pakistani Rupee', fxRateUSD: 0.0036 },
  'BD': { code: 'BDT', symbol: '৳', name: 'Bangladeshi Taka', fxRateUSD: 0.0091 },
  'TH': { code: 'THB', symbol: '฿', name: 'Thai Baht', fxRateUSD: 0.028 },
  'VN': { code: 'VND', symbol: '₫', name: 'Vietnamese Dong', fxRateUSD: 0.000041 },
  'ID': { code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah', fxRateUSD: 0.000064 },
  'MY': { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit', fxRateUSD: 0.21 },
  'PH': { code: 'PHP', symbol: '₱', name: 'Philippine Peso', fxRateUSD: 0.018 },
  
  // Africa
  'ZA': { code: 'ZAR', symbol: 'R', name: 'South African Rand', fxRateUSD: 0.054 },
  'NG': { code: 'NGN', symbol: '₦', name: 'Nigerian Naira', fxRateUSD: 0.00064 },
  'KE': { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling', fxRateUSD: 0.0068 },
  'EG': { code: 'EGP', symbol: 'E£', name: 'Egyptian Pound', fxRateUSD: 0.032 },
  
  // South America
  'BR': { code: 'BRL', symbol: 'R$', name: 'Brazilian Real', fxRateUSD: 0.20 },
  
  // Oceania
  'AU': { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', fxRateUSD: 0.66 },
  
  // Central Asia / Afghanistan
  'AF': { code: 'AFN', symbol: '؋', name: 'Afghan Afghani', fxRateUSD: 0.014 },
}

// Currency mapping by country name slug (for compatibility)
export const currencyMapByCountrySlug: Record<string, CurrencyData> = {
  'united-states': currencyMap['US'],
  'united-states-of-america': currencyMap['US'],
  'usa': currencyMap['US'],
  'canada': currencyMap['CA'],
  'mexico': currencyMap['MX'],
  'united-kingdom': currencyMap['UK'],
  'uk': currencyMap['UK'],
  'england': currencyMap['UK'],
  'france': currencyMap['FR'],
  'germany': currencyMap['DE'],
  'spain': currencyMap['ES'],
  'italy': currencyMap['IT'],
  'uae': currencyMap['AE'],
  'united-arab-emirates': currencyMap['AE'],
  'saudi-arabia': currencyMap['SA'],
  'china': currencyMap['CN'],
  'japan': currencyMap['JP'],
  'south-korea': currencyMap['KR'],
  'korea': currencyMap['KR'],
  'india': currencyMap['IN'],
  'bharat': currencyMap['IN'],
  'pakistan': currencyMap['PK'],
  'thailand': currencyMap['TH'],
  'vietnam': currencyMap['VN'],
  'indonesia': currencyMap['ID'],
  'malaysia': currencyMap['MY'],
  'philippines': currencyMap['PH'],
  'brazil': currencyMap['BR'],
  'australia': currencyMap['AU'],
  'south-africa': currencyMap['ZA'],
  'nigeria': currencyMap['NG'],
  'kenya': currencyMap['KE'],
  'egypt': currencyMap['EG'],
  'israel': currencyMap['IL'],
  'turkey': currencyMap['TR'],
  'bangladesh': currencyMap['BD'],
  'afghanistan': currencyMap['AF'],
}

/**
 * Get currency data for a country code or country slug
 * Returns USD as fallback if country not found
 */
export function getCurrencyData(countryCodeOrSlug: string): CurrencyData {
  const normalized = countryCodeOrSlug.toUpperCase()
  const slug = countryCodeOrSlug.toLowerCase().replace(/\s+/g, '-')
  
  // Try country code first (e.g., 'US', 'CA')
  if (currencyMap[normalized]) {
    return currencyMap[normalized]
  }
  
  // Try country slug (e.g., 'united-states', 'saudi-arabia')
  if (currencyMapByCountrySlug[slug]) {
    return currencyMapByCountrySlug[slug]
  }
  
  // Default to USD
  return currencyMap['US']
}

/**
 * Get currency data by country code with fallback
 */
export function getCurrencyByCountryCode(countryCode: string): CurrencyData {
  return getCurrencyData(countryCode)
}

/**
 * Get currency data by country name slug
 */
export function getCurrencyByCountrySlug(countrySlug: string): CurrencyData {
  return getCurrencyData(countrySlug)
}

