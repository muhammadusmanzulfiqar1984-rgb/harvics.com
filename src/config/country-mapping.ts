/**
 * Complete Locale-to-Country Mapping
 * 
 * Maps all 38 supported locales to their default countries.
 * Used for auto-selecting appropriate country when language changes.
 */

export interface LocaleCountryMapping {
  locale: string
  defaultCountry: string
  countryCode: string
  region: string
  countryName: string
}

// Complete mapping of all 38 supported locales to default countries
export const localeToCountryMap: Record<string, LocaleCountryMapping> = {
  'en': {
    locale: 'en',
    defaultCountry: 'united-states',
    countryCode: 'US',
    region: 'North America',
    countryName: 'United States'
  },
  'ar': {
    locale: 'ar',
    defaultCountry: 'uae',
    countryCode: 'AE',
    region: 'Middle East',
    countryName: 'United Arab Emirates'
  },
  'fr': {
    locale: 'fr',
    defaultCountry: 'france',
    countryCode: 'FR',
    region: 'Europe',
    countryName: 'France'
  },
  'es': {
    locale: 'es',
    defaultCountry: 'spain',
    countryCode: 'ES',
    region: 'Europe',
    countryName: 'Spain'
  },
  'de': {
    locale: 'de',
    defaultCountry: 'germany',
    countryCode: 'DE',
    region: 'Europe',
    countryName: 'Germany'
  },
  'zh': {
    locale: 'zh',
    defaultCountry: 'china',
    countryCode: 'CN',
    region: 'Asia',
    countryName: 'China'
  },
  'he': {
    locale: 'he',
    defaultCountry: 'israel',
    countryCode: 'IL',
    region: 'Middle East',
    countryName: 'Israel'
  },
  'hi': {
    locale: 'hi',
    defaultCountry: 'india',
    countryCode: 'IN',
    region: 'Asia',
    countryName: 'India'
  },
  'pt': {
    locale: 'pt',
    defaultCountry: 'brazil',
    countryCode: 'BR',
    region: 'South America',
    countryName: 'Brazil'
  },
  'ru': {
    locale: 'ru',
    defaultCountry: 'russia',
    countryCode: 'RU',
    region: 'Europe/Asia',
    countryName: 'Russia'
  },
  'ja': {
    locale: 'ja',
    defaultCountry: 'japan',
    countryCode: 'JP',
    region: 'Asia',
    countryName: 'Japan'
  },
  'ko': {
    locale: 'ko',
    defaultCountry: 'south-korea',
    countryCode: 'KR',
    region: 'Asia',
    countryName: 'South Korea'
  },
  'it': {
    locale: 'it',
    defaultCountry: 'italy',
    countryCode: 'IT',
    region: 'Europe',
    countryName: 'Italy'
  },
  'nl': {
    locale: 'nl',
    defaultCountry: 'netherlands',
    countryCode: 'NL',
    region: 'Europe',
    countryName: 'Netherlands'
  },
  'pl': {
    locale: 'pl',
    defaultCountry: 'poland',
    countryCode: 'PL',
    region: 'Europe',
    countryName: 'Poland'
  },
  'tr': {
    locale: 'tr',
    defaultCountry: 'turkey',
    countryCode: 'TR',
    region: 'Europe/Asia',
    countryName: 'Turkey'
  },
  'vi': {
    locale: 'vi',
    defaultCountry: 'vietnam',
    countryCode: 'VN',
    region: 'Asia',
    countryName: 'Vietnam'
  },
  'th': {
    locale: 'th',
    defaultCountry: 'thailand',
    countryCode: 'TH',
    region: 'Asia',
    countryName: 'Thailand'
  },
  'id': {
    locale: 'id',
    defaultCountry: 'indonesia',
    countryCode: 'ID',
    region: 'Asia',
    countryName: 'Indonesia'
  },
  'ms': {
    locale: 'ms',
    defaultCountry: 'malaysia',
    countryCode: 'MY',
    region: 'Asia',
    countryName: 'Malaysia'
  },
  'sw': {
    locale: 'sw',
    defaultCountry: 'kenya',
    countryCode: 'KE',
    region: 'Africa',
    countryName: 'Kenya'
  },
  'uk': {
    locale: 'uk',
    defaultCountry: 'ukraine',
    countryCode: 'UA',
    region: 'Europe',
    countryName: 'Ukraine'
  },
  'ro': {
    locale: 'ro',
    defaultCountry: 'romania',
    countryCode: 'RO',
    region: 'Europe',
    countryName: 'Romania'
  },
  'cs': {
    locale: 'cs',
    defaultCountry: 'czech-republic',
    countryCode: 'CZ',
    region: 'Europe',
    countryName: 'Czech Republic'
  },
  'sv': {
    locale: 'sv',
    defaultCountry: 'sweden',
    countryCode: 'SE',
    region: 'Europe',
    countryName: 'Sweden'
  },
  'da': {
    locale: 'da',
    defaultCountry: 'denmark',
    countryCode: 'DK',
    region: 'Europe',
    countryName: 'Denmark'
  },
  'fi': {
    locale: 'fi',
    defaultCountry: 'finland',
    countryCode: 'FI',
    region: 'Europe',
    countryName: 'Finland'
  },
  'no': {
    locale: 'no',
    defaultCountry: 'norway',
    countryCode: 'NO',
    region: 'Europe',
    countryName: 'Norway'
  },
  'el': {
    locale: 'el',
    defaultCountry: 'greece',
    countryCode: 'GR',
    region: 'Europe',
    countryName: 'Greece'
  },
  'hu': {
    locale: 'hu',
    defaultCountry: 'hungary',
    countryCode: 'HU',
    region: 'Europe',
    countryName: 'Hungary'
  },
  'bg': {
    locale: 'bg',
    defaultCountry: 'bulgaria',
    countryCode: 'BG',
    region: 'Europe',
    countryName: 'Bulgaria'
  },
  'hr': {
    locale: 'hr',
    defaultCountry: 'croatia',
    countryCode: 'HR',
    region: 'Europe',
    countryName: 'Croatia'
  },
  'sk': {
    locale: 'sk',
    defaultCountry: 'slovakia',
    countryCode: 'SK',
    region: 'Europe',
    countryName: 'Slovakia'
  },
  'sr': {
    locale: 'sr',
    defaultCountry: 'serbia',
    countryCode: 'RS',
    region: 'Europe',
    countryName: 'Serbia'
  },
  'bn': {
    locale: 'bn',
    defaultCountry: 'bangladesh',
    countryCode: 'BD',
    region: 'Asia',
    countryName: 'Bangladesh'
  },
  'ur': {
    locale: 'ur',
    defaultCountry: 'pakistan',
    countryCode: 'PK',
    region: 'Asia',
    countryName: 'Pakistan'
  },
  'fa': {
    locale: 'fa',
    defaultCountry: 'iran',
    countryCode: 'IR',
    region: 'Middle East',
    countryName: 'Iran'
  },
  'ps': {
    locale: 'ps',
    defaultCountry: 'afghanistan',
    countryCode: 'AF',
    region: 'Asia',
    countryName: 'Afghanistan'
  }
}

// Simple mapping for backward compatibility (locale -> country slug)
export const localeToCountry: Record<string, string> = Object.fromEntries(
  Object.entries(localeToCountryMap).map(([locale, mapping]) => [locale, mapping.defaultCountry])
)

// Reverse mapping: country code -> locales that use it
export const countryCodeToLocales: Record<string, string[]> = {}
Object.values(localeToCountryMap).forEach((mapping) => {
  if (!countryCodeToLocales[mapping.countryCode]) {
    countryCodeToLocales[mapping.countryCode] = []
  }
  countryCodeToLocales[mapping.countryCode].push(mapping.locale)
})

// Get default country for a locale
export function getDefaultCountryForLocale(locale: string): string {
  return localeToCountryMap[locale]?.defaultCountry || 'united-states'
}

// Get country code for a locale
export function getCountryCodeForLocale(locale: string): string {
  return localeToCountryMap[locale]?.countryCode || 'US'
}

// Get full mapping for a locale
export function getLocaleMapping(locale: string): LocaleCountryMapping | null {
  return localeToCountryMap[locale] || null
}

// Get all locales for a region
export function getLocalesByRegion(region: string): string[] {
  return Object.entries(localeToCountryMap)
    .filter(([, mapping]) => mapping.region === region)
    .map(([locale]) => locale)
}

// Check if locale has a default country mapping
export function hasDefaultCountry(locale: string): boolean {
  return locale in localeToCountryMap
}

// REVERSE MAPPING: Country Code/Slug → Primary Locale
// This is the KEY mapping for auto-switching language when country is selected
// Saudi Arabia → Arabic, Spain → Spanish, etc.
export const countryToLocaleMap: Record<string, string> = {
  // Country codes to primary locale
  'SA': 'ar', // Saudi Arabia → Arabic
  'AE': 'ar', // UAE → Arabic (with English as secondary)
  'ES': 'es', // Spain → Spanish
  'MX': 'es', // Mexico → Spanish
  'AR': 'es', // Argentina → Spanish
  'CO': 'es', // Colombia → Spanish
  'CL': 'es', // Chile → Spanish
  'PE': 'es', // Peru → Spanish
  'FR': 'fr', // France → French
  'BE': 'fr', // Belgium → French
  'CH': 'fr', // Switzerland → French (with German/Italian)
  'CA': 'en', // Canada → English (with French)
  'DE': 'de', // Germany → German
  'AT': 'de', // Austria → German
  'IT': 'it', // Italy → Italian
  'PT': 'pt', // Portugal → Portuguese
  'BR': 'pt', // Brazil → Portuguese
  'CN': 'zh', // China → Chinese
  'TW': 'zh', // Taiwan → Chinese
  'HK': 'zh', // Hong Kong → Chinese
  'JP': 'ja', // Japan → Japanese
  'KR': 'ko', // South Korea → Korean
  'IN': 'hi', // India → Hindi (with English)
  'PK': 'ur', // Pakistan → Urdu
  'BD': 'bn', // Bangladesh → Bengali
  'ID': 'id', // Indonesia → Indonesian
  'MY': 'ms', // Malaysia → Malay
  'TH': 'th', // Thailand → Thai
  'VN': 'vi', // Vietnam → Vietnamese
  'TR': 'tr', // Turkey → Turkish
  'RU': 'ru', // Russia → Russian
  'UA': 'uk', // Ukraine → Ukrainian
  'PL': 'pl', // Poland → Polish
  'NL': 'nl', // Netherlands → Dutch
  'SE': 'sv', // Sweden → Swedish
  'NO': 'no', // Norway → Norwegian
  'DK': 'da', // Denmark → Danish
  'FI': 'fi', // Finland → Finnish
  'GR': 'el', // Greece → Greek
  'RO': 'ro', // Romania → Romanian
  'CZ': 'cs', // Czech Republic → Czech
  'SK': 'sk', // Slovakia → Slovak
  'HU': 'hu', // Hungary → Hungarian
  'BG': 'bg', // Bulgaria → Bulgarian
  'HR': 'hr', // Croatia → Croatian
  'RS': 'sr', // Serbia → Serbian
  'IL': 'he', // Israel → Hebrew
  'IR': 'fa', // Iran → Persian
  'AF': 'ps', // Afghanistan → Pashto
  'KE': 'sw', // Kenya → Swahili
  'TZ': 'sw', // Tanzania → Swahili
  'US': 'en', // United States → English
  'UK': 'en', // United Kingdom → English
  'GB': 'en', // Great Britain → English
  'AU': 'en', // Australia → English
  'NZ': 'en', // New Zealand → English
  'ZA': 'en', // South Africa → English
  'EG': 'ar', // Egypt → Arabic
  'IQ': 'ar', // Iraq → Arabic
  'JO': 'ar', // Jordan → Arabic
  'LB': 'ar', // Lebanon → Arabic
  'MA': 'ar', // Morocco → Arabic
  'TN': 'ar', // Tunisia → Arabic
  'DZ': 'ar', // Algeria → Arabic
  'LY': 'ar', // Libya → Arabic
  'YE': 'ar', // Yemen → Arabic
  'OM': 'ar', // Oman → Arabic
  'KW': 'ar', // Kuwait → Arabic
  'QA': 'ar', // Qatar → Arabic
  'BH': 'ar', // Bahrain → Arabic
}

// Country slug to locale mapping (for country names like "saudi-arabia")
export const countrySlugToLocaleMap: Record<string, string> = {
  'saudi-arabia': 'ar',
  'united-arab-emirates': 'ar',
  'uae': 'ar',
  'spain': 'es',
  'mexico': 'es',
  'argentina': 'es',
  'colombia': 'es',
  'chile': 'es',
  'peru': 'es',
  'france': 'fr',
  'belgium': 'fr',
  'switzerland': 'fr',
  'canada': 'en',
  'germany': 'de',
  'austria': 'de',
  'italy': 'it',
  'portugal': 'pt',
  'brazil': 'pt',
  'china': 'zh',
  'taiwan': 'zh',
  'hong-kong': 'zh',
  'japan': 'ja',
  'south-korea': 'ko',
  'india': 'hi',
  'pakistan': 'ur',
  'bangladesh': 'bn',
  'indonesia': 'id',
  'malaysia': 'ms',
  'thailand': 'th',
  'vietnam': 'vi',
  'turkey': 'tr',
  'russia': 'ru',
  'ukraine': 'uk',
  'poland': 'pl',
  'netherlands': 'nl',
  'sweden': 'sv',
  'norway': 'no',
  'denmark': 'da',
  'finland': 'fi',
  'greece': 'el',
  'romania': 'ro',
  'czech-republic': 'cs',
  'slovakia': 'sk',
  'hungary': 'hu',
  'bulgaria': 'bg',
  'croatia': 'hr',
  'serbia': 'sr',
  'israel': 'he',
  'iran': 'fa',
  'afghanistan': 'ps',
  'kenya': 'sw',
  'tanzania': 'sw',
  'united-states': 'en',
  'united-states-of-america': 'en',
  'usa': 'en',
  'united-kingdom': 'en',
  'uk': 'en',
  'england': 'en',
  'australia': 'en',
  'new-zealand': 'en',
  'south-africa': 'en',
  'egypt': 'ar',
  'iraq': 'ar',
  'jordan': 'ar',
  'lebanon': 'ar',
  'morocco': 'ar',
  'tunisia': 'ar',
  'algeria': 'ar',
  'libya': 'ar',
  'yemen': 'ar',
  'oman': 'ar',
  'kuwait': 'ar',
  'qatar': 'ar',
  'bahrain': 'ar',
}

/**
 * Get primary locale for a country
 * This is the MAIN function: When user selects a country, this returns the language to use
 * 
 * @param country - Country code (e.g., 'SA') or country slug (e.g., 'saudi-arabia')
 * @returns Primary locale code (e.g., 'ar' for Saudi Arabia)
 */
export function getLocaleForCountry(country: string): string {
  if (!country) return 'en'
  
  const normalized = country.toLowerCase().trim()
  
  // First try country code (2-letter uppercase)
  const upperCode = normalized.toUpperCase()
  if (countryToLocaleMap[upperCode]) {
    return countryToLocaleMap[upperCode]
  }
  
  // Then try country slug
  if (countrySlugToLocaleMap[normalized]) {
    return countrySlugToLocaleMap[normalized]
  }
  
  // Try to extract country code from slug (e.g., "saudi-arabia" -> "SA")
  const slugParts = normalized.split('-')
  if (slugParts.length > 0) {
    const firstPart = slugParts[0].toUpperCase()
    if (countryToLocaleMap[firstPart]) {
      return countryToLocaleMap[firstPart]
    }
  }
  
  // Fallback: try to find in localeToCountryMap (reverse lookup)
  for (const [locale, mapping] of Object.entries(localeToCountryMap)) {
    if (mapping.countryCode === upperCode || 
        mapping.defaultCountry === normalized ||
        mapping.countryName.toLowerCase() === normalized) {
      return locale
    }
  }
  
  // Final fallback to English
  return 'en'
}
