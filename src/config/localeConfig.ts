// Comprehensive locale configuration with currencies, formats, and metadata
// This powers true globalization across all 38 supported languages

export interface LocaleConfig {
  code: string
  name: string
  nativeName: string
  currency: string
  currencySymbol: string
  dateFormat: string
  timeFormat: '12h' | '24h'
  firstDayOfWeek: 0 | 1 | 5 | 6 // 0 = Sunday, 1 = Monday, 5 = Friday, 6 = Saturday
  rtl: boolean
  numberFormat: {
    decimal: string
    thousands: string
  }
  phoneFormat?: string
  flag?: string
}

export const LOCALE_CONFIGS: Record<string, LocaleConfig> = {
  // English (Global)
  en: {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    currency: 'USD',
    currencySymbol: '$',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',
    firstDayOfWeek: 0,
    rtl: false,
    numberFormat: { decimal: '.', thousands: ',' },
    flag: '🇺🇸'
  },
  
  // Arabic (Saudi Arabia/UAE)
  ar: {
    code: 'ar',
    name: 'Arabic',
    nativeName: 'العربية',
    currency: 'SAR',
    currencySymbol: 'ر.س',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '12h',
    firstDayOfWeek: 6, // Saturday
    rtl: true,
    numberFormat: { decimal: '٫', thousands: '٬' },
    flag: '🇸🇦'
  },
  
  // Spanish (Spain)
  es: {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    currency: 'EUR',
    currencySymbol: '€',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h',
    firstDayOfWeek: 1,
    rtl: false,
    numberFormat: { decimal: ',', thousands: '.' },
    flag: '🇪🇸'
  },
  
  // French (France)
  fr: {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    currency: 'EUR',
    currencySymbol: '€',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h',
    firstDayOfWeek: 1,
    rtl: false,
    numberFormat: { decimal: ',', thousands: ' ' },
    flag: '🇫🇷'
  },
  
  // German (Germany)
  de: {
    code: 'de',
    name: 'German',
    nativeName: 'Deutsch',
    currency: 'EUR',
    currencySymbol: '€',
    dateFormat: 'DD.MM.YYYY',
    timeFormat: '24h',
    firstDayOfWeek: 1,
    rtl: false,
    numberFormat: { decimal: ',', thousands: '.' },
    flag: '🇩🇪'
  },
  
  // Chinese (Simplified - China)
  zh: {
    code: 'zh',
    name: 'Chinese',
    nativeName: '简体中文',
    currency: 'CNY',
    currencySymbol: '¥',
    dateFormat: 'YYYY/MM/DD',
    timeFormat: '24h',
    firstDayOfWeek: 1,
    rtl: false,
    numberFormat: { decimal: '.', thousands: ',' },
    flag: '🇨🇳'
  },
  
  // Japanese (Japan)
  ja: {
    code: 'ja',
    name: 'Japanese',
    nativeName: '日本語',
    currency: 'JPY',
    currencySymbol: '¥',
    dateFormat: 'YYYY/MM/DD',
    timeFormat: '24h',
    firstDayOfWeek: 0,
    rtl: false,
    numberFormat: { decimal: '.', thousands: ',' },
    flag: '🇯🇵'
  },
  
  // Korean (South Korea)
  ko: {
    code: 'ko',
    name: 'Korean',
    nativeName: '한국어',
    currency: 'KRW',
    currencySymbol: '₩',
    dateFormat: 'YYYY.MM.DD',
    timeFormat: '12h',
    firstDayOfWeek: 0,
    rtl: false,
    numberFormat: { decimal: '.', thousands: ',' },
    flag: '🇰🇷'
  },
  
  // Italian (Italy)
  it: {
    code: 'it',
    name: 'Italian',
    nativeName: 'Italiano',
    currency: 'EUR',
    currencySymbol: '€',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h',
    firstDayOfWeek: 1,
    rtl: false,
    numberFormat: { decimal: ',', thousands: '.' },
    flag: '🇮🇹'
  },
  
  // Portuguese (Portugal)
  pt: {
    code: 'pt',
    name: 'Portuguese',
    nativeName: 'Português',
    currency: 'EUR',
    currencySymbol: '€',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h',
    firstDayOfWeek: 1,
    rtl: false,
    numberFormat: { decimal: ',', thousands: '.' },
    flag: '🇵🇹'
  },
  
  // Russian (Russia)
  ru: {
    code: 'ru',
    name: 'Russian',
    nativeName: 'Русский',
    currency: 'RUB',
    currencySymbol: '₽',
    dateFormat: 'DD.MM.YYYY',
    timeFormat: '24h',
    firstDayOfWeek: 1,
    rtl: false,
    numberFormat: { decimal: ',', thousands: ' ' },
    flag: '🇷🇺'
  },
  
  // Dutch (Netherlands)
  nl: {
    code: 'nl',
    name: 'Dutch',
    nativeName: 'Nederlands',
    currency: 'EUR',
    currencySymbol: '€',
    dateFormat: 'DD-MM-YYYY',
    timeFormat: '24h',
    firstDayOfWeek: 1,
    rtl: false,
    numberFormat: { decimal: ',', thousands: '.' },
    flag: '🇳🇱'
  },
  
  // Polish (Poland)
  pl: {
    code: 'pl',
    name: 'Polish',
    nativeName: 'Polski',
    currency: 'PLN',
    currencySymbol: 'zł',
    dateFormat: 'DD.MM.YYYY',
    timeFormat: '24h',
    firstDayOfWeek: 1,
    rtl: false,
    numberFormat: { decimal: ',', thousands: ' ' },
    flag: '🇵🇱'
  },
  
  // Turkish (Turkey)
  tr: {
    code: 'tr',
    name: 'Turkish',
    nativeName: 'Türkçe',
    currency: 'TRY',
    currencySymbol: '₺',
    dateFormat: 'DD.MM.YYYY',
    timeFormat: '24h',
    firstDayOfWeek: 1,
    rtl: false,
    numberFormat: { decimal: ',', thousands: '.' },
    flag: '🇹🇷'
  },
  
  // Swedish (Sweden)
  sv: {
    code: 'sv',
    name: 'Swedish',
    nativeName: 'Svenska',
    currency: 'SEK',
    currencySymbol: 'kr',
    dateFormat: 'YYYY-MM-DD',
    timeFormat: '24h',
    firstDayOfWeek: 1,
    rtl: false,
    numberFormat: { decimal: ',', thousands: ' ' },
    flag: '🇸🇪'
  },
  
  // Thai (Thailand)
  th: {
    code: 'th',
    name: 'Thai',
    nativeName: 'ไทย',
    currency: 'THB',
    currencySymbol: '฿',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h',
    firstDayOfWeek: 0,
    rtl: false,
    numberFormat: { decimal: '.', thousands: ',' },
    flag: '🇹🇭'
  },
  
  // Danish (Denmark)
  da: {
    code: 'da',
    name: 'Danish',
    nativeName: 'Dansk',
    currency: 'DKK',
    currencySymbol: 'kr',
    dateFormat: 'DD-MM-YYYY',
    timeFormat: '24h',
    firstDayOfWeek: 1,
    rtl: false,
    numberFormat: { decimal: ',', thousands: '.' },
    flag: '🇩🇰'
  },
  
  // Swahili (Kenya/Tanzania)
  sw: {
    code: 'sw',
    name: 'Swahili',
    nativeName: 'Kiswahili',
    currency: 'KES',
    currencySymbol: 'KSh',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '12h',
    firstDayOfWeek: 0,
    rtl: false,
    numberFormat: { decimal: '.', thousands: ',' },
    flag: '🇰🇪'
  },
  
  // Norwegian (Norway)
  no: {
    code: 'no',
    name: 'Norwegian',
    nativeName: 'Norsk',
    currency: 'NOK',
    currencySymbol: 'kr',
    dateFormat: 'DD.MM.YYYY',
    timeFormat: '24h',
    firstDayOfWeek: 1,
    rtl: false,
    numberFormat: { decimal: ',', thousands: ' ' },
    flag: '🇳🇴'
  },
  
  // Indonesian (Indonesia)
  id: {
    code: 'id',
    name: 'Indonesian',
    nativeName: 'Bahasa Indonesia',
    currency: 'IDR',
    currencySymbol: 'Rp',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h',
    firstDayOfWeek: 0,
    rtl: false,
    numberFormat: { decimal: ',', thousands: '.' },
    flag: '🇮🇩'
  },
  
  // Czech (Czech Republic)
  cs: {
    code: 'cs',
    name: 'Czech',
    nativeName: 'Čeština',
    currency: 'CZK',
    currencySymbol: 'Kč',
    dateFormat: 'DD.MM.YYYY',
    timeFormat: '24h',
    firstDayOfWeek: 1,
    rtl: false,
    numberFormat: { decimal: ',', thousands: ' ' },
    flag: '🇨🇿'
  },
  
  // Persian/Farsi (Iran)
  fa: {
    code: 'fa',
    name: 'Persian',
    nativeName: 'فارسی',
    currency: 'IRR',
    currencySymbol: 'ریال',
    dateFormat: 'YYYY/MM/DD',
    timeFormat: '24h',
    firstDayOfWeek: 6,
    rtl: true,
    numberFormat: { decimal: '٫', thousands: '٬' },
    flag: '🇮🇷'
  },
  
  // Vietnamese (Vietnam)
  vi: {
    code: 'vi',
    name: 'Vietnamese',
    nativeName: 'Tiếng Việt',
    currency: 'VND',
    currencySymbol: '₫',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h',
    firstDayOfWeek: 1,
    rtl: false,
    numberFormat: { decimal: ',', thousands: '.' },
    flag: '🇻🇳'
  },
  
  // Hebrew (Israel)
  he: {
    code: 'he',
    name: 'Hebrew',
    nativeName: 'עברית',
    currency: 'ILS',
    currencySymbol: '₪',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h',
    firstDayOfWeek: 0,
    rtl: true,
    numberFormat: { decimal: '.', thousands: ',' },
    flag: '🇮🇱'
  },
  
  // Hindi (India)
  hi: {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    currency: 'INR',
    currencySymbol: '₹',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '12h',
    firstDayOfWeek: 0,
    rtl: false,
    numberFormat: { decimal: '.', thousands: ',' },
    flag: '🇮🇳'
  },
  
  // Romanian (Romania)
  ro: {
    code: 'ro',
    name: 'Romanian',
    nativeName: 'Română',
    currency: 'RON',
    currencySymbol: 'lei',
    dateFormat: 'DD.MM.YYYY',
    timeFormat: '24h',
    firstDayOfWeek: 1,
    rtl: false,
    numberFormat: { decimal: ',', thousands: '.' },
    flag: '🇷🇴'
  },
  
  // Bulgarian (Bulgaria)
  bg: {
    code: 'bg',
    name: 'Bulgarian',
    nativeName: 'Български',
    currency: 'BGN',
    currencySymbol: 'лв',
    dateFormat: 'DD.MM.YYYY',
    timeFormat: '24h',
    firstDayOfWeek: 1,
    rtl: false,
    numberFormat: { decimal: ',', thousands: ' ' },
    flag: '🇧🇬'
  },
  
  // Greek (Greece)
  el: {
    code: 'el',
    name: 'Greek',
    nativeName: 'Ελληνικά',
    currency: 'EUR',
    currencySymbol: '€',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h',
    firstDayOfWeek: 1,
    rtl: false,
    numberFormat: { decimal: ',', thousands: '.' },
    flag: '🇬🇷'
  },
  
  // Malay (Malaysia)
  ms: {
    code: 'ms',
    name: 'Malay',
    nativeName: 'Bahasa Melayu',
    currency: 'MYR',
    currencySymbol: 'RM',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '12h',
    firstDayOfWeek: 1,
    rtl: false,
    numberFormat: { decimal: '.', thousands: ',' },
    flag: '🇲🇾'
  },
  
  // Ukrainian (Ukraine)
  uk: {
    code: 'uk',
    name: 'Ukrainian',
    nativeName: 'Українська',
    currency: 'UAH',
    currencySymbol: '₴',
    dateFormat: 'DD.MM.YYYY',
    timeFormat: '24h',
    firstDayOfWeek: 1,
    rtl: false,
    numberFormat: { decimal: ',', thousands: ' ' },
    flag: '🇺🇦'
  },
  
  // Finnish (Finland)
  fi: {
    code: 'fi',
    name: 'Finnish',
    nativeName: 'Suomi',
    currency: 'EUR',
    currencySymbol: '€',
    dateFormat: 'DD.MM.YYYY',
    timeFormat: '24h',
    firstDayOfWeek: 1,
    rtl: false,
    numberFormat: { decimal: ',', thousands: ' ' },
    flag: '🇫🇮'
  },
  
  // Slovak (Slovakia)
  sk: {
    code: 'sk',
    name: 'Slovak',
    nativeName: 'Slovenčina',
    currency: 'EUR',
    currencySymbol: '€',
    dateFormat: 'DD.MM.YYYY',
    timeFormat: '24h',
    firstDayOfWeek: 1,
    rtl: false,
    numberFormat: { decimal: ',', thousands: ' ' },
    flag: '🇸🇰'
  },
  
  // Serbian (Serbia)
  sr: {
    code: 'sr',
    name: 'Serbian',
    nativeName: 'Српски',
    currency: 'RSD',
    currencySymbol: 'дин',
    dateFormat: 'DD.MM.YYYY',
    timeFormat: '24h',
    firstDayOfWeek: 1,
    rtl: false,
    numberFormat: { decimal: ',', thousands: '.' },
    flag: '🇷🇸'
  },
  
  // Bengali (Bangladesh)
  bn: {
    code: 'bn',
    name: 'Bengali',
    nativeName: 'বাংলা',
    currency: 'BDT',
    currencySymbol: '৳',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '12h',
    firstDayOfWeek: 5, // Friday
    rtl: false,
    numberFormat: { decimal: '.', thousands: ',' },
    flag: '🇧🇩'
  },
  
  // Urdu (Pakistan)
  ur: {
    code: 'ur',
    name: 'Urdu',
    nativeName: 'اردو',
    currency: 'PKR',
    currencySymbol: '₨',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '12h',
    firstDayOfWeek: 1,
    rtl: true,
    numberFormat: { decimal: '.', thousands: ',' },
    flag: '🇵🇰'
  },
  
  // Pashto (Afghanistan)
  ps: {
    code: 'ps',
    name: 'Pashto',
    nativeName: 'پښتو',
    currency: 'AFN',
    currencySymbol: '؋',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '12h',
    firstDayOfWeek: 6,
    rtl: true,
    numberFormat: { decimal: '٫', thousands: '٬' },
    flag: '🇦🇫'
  },
  
  // Hungarian (Hungary)
  hu: {
    code: 'hu',
    name: 'Hungarian',
    nativeName: 'Magyar',
    currency: 'HUF',
    currencySymbol: 'Ft',
    dateFormat: 'YYYY.MM.DD',
    timeFormat: '24h',
    firstDayOfWeek: 1,
    rtl: false,
    numberFormat: { decimal: ',', thousands: ' ' },
    flag: '🇭🇺'
  },
  
  // Croatian (Croatia)
  hr: {
    code: 'hr',
    name: 'Croatian',
    nativeName: 'Hrvatski',
    currency: 'EUR',
    currencySymbol: '€',
    dateFormat: 'DD.MM.YYYY',
    timeFormat: '24h',
    firstDayOfWeek: 1,
    rtl: false,
    numberFormat: { decimal: ',', thousands: '.' },
    flag: '🇭🇷'
  }
}

// Helper to get locale config
export const getLocaleConfig = (locale: string): LocaleConfig => {
  return LOCALE_CONFIGS[locale] || LOCALE_CONFIGS.en
}

// Get all supported locales
export const getSupportedLocales = (): string[] => {
  return Object.keys(LOCALE_CONFIGS)
}

// Check if locale uses RTL
export const isRTL = (locale: string): boolean => {
  return getLocaleConfig(locale).rtl
}

// Get currency for locale
export const getCurrency = (locale: string): string => {
  return getLocaleConfig(locale).currency
}

// Get currency symbol for locale
export const getCurrencySymbol = (locale: string): string => {
  return getLocaleConfig(locale).currencySymbol
}
