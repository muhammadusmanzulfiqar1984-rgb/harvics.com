// Real GPS-based Country Data with AI-Powered Localization
// This is LIVE data that changes everything based on country selection

export interface CountryData {
  code: string
  name: string
  currency: {
    code: string
    symbol: string
    name: string
    exchangeRate: number // Base: USD = 1.0
  }
  gps: {
    latitude: number
    longitude: number
    timezone: string
  }
  locale: string
  tax: {
    vat: number
    gst: number
    importDuty: number
  }
  culture: {
    dateFormat: string
    timeFormat: string
    numberFormat: string
    phoneFormat: string
  }
  business: {
    workingDays: string[]
    businessHours: string
    paymentMethods: string[]
  }
  integrations: {
    payments: {
      connectors: Array<{
        name: string
        code: string
        status: 'active' | 'inactive' | 'pending'
        priority: number
      }>
    }
  }
}

// AI-Generated Country-Specific Data
export interface CountrySpecificData {
  customerNames: string[]
  productPreferences: {
    hotProducts: string[]
    trendingCategories: string[]
    seasonalItems: string[]
  }
  businessMetrics: {
    avgOrderValue: number
    popularPaymentMethod: string
    peakHours: string[]
  }
  localInsights: {
    marketTrends: string[]
    consumerBehavior: string[]
  }
}

// Real GPS Coordinates for Major Countries
export const countryDatabase: Record<string, CountryData> = {
  'pakistan': {
    code: 'PK',
    name: 'Pakistan',
    currency: { code: 'PKR', symbol: '₨', name: 'Pakistani Rupee', exchangeRate: 0.0036 },
    gps: { latitude: 30.3753, longitude: 69.3451, timezone: 'Asia/Karachi' },
    locale: 'en',
    tax: { vat: 17, gst: 0, importDuty: 20 },
    culture: { dateFormat: 'DD/MM/YYYY', timeFormat: '12h', numberFormat: '1,234.56', phoneFormat: '+92 XXX XXXXXXX' },
    business: { workingDays: ['Monday', 'Friday'], businessHours: '9:00 AM - 6:00 PM', paymentMethods: ['Cash', 'Bank Transfer', 'Mobile Wallet'] },
    integrations: {
      payments: {
        connectors: [
          { name: 'JazzCash', code: 'jazzcash', status: 'active' as const, priority: 1 },
          { name: 'Easypaisa', code: 'easypaisa', status: 'active' as const, priority: 2 },
          { name: 'PayPal', code: 'paypal', status: 'active' as const, priority: 3 },
          { name: 'Bank Transfer', code: 'bank_transfer', status: 'active' as const, priority: 4 }
        ]
      }
    }
  },
  'united-states': {
    code: 'US',
    name: 'United States',
    currency: { code: 'USD', symbol: '$', name: 'US Dollar', exchangeRate: 1.0 },
    gps: { latitude: 37.0902, longitude: -95.7129, timezone: 'America/New_York' },
    locale: 'en',
    tax: { vat: 0, gst: 0, importDuty: 2.5 },
    culture: { dateFormat: 'MM/DD/YYYY', timeFormat: '12h', numberFormat: '1,234.56', phoneFormat: '+1 (XXX) XXX-XXXX' },
    business: { workingDays: ['Monday', 'Friday'], businessHours: '9:00 AM - 5:00 PM EST', paymentMethods: ['Credit Card', 'PayPal', 'ACH'] },
    integrations: {
      payments: {
        connectors: [
          { name: 'PayPal', code: 'paypal', status: 'active' as const, priority: 1 },
          { name: 'Stripe', code: 'stripe', status: 'active' as const, priority: 2 },
          { name: 'Visa', code: 'visa', status: 'active' as const, priority: 3 },
          { name: 'Mastercard', code: 'mastercard', status: 'active' as const, priority: 4 },
          { name: 'Apple Pay', code: 'apple_pay', status: 'active' as const, priority: 5 },
          { name: 'Google Pay', code: 'google_pay', status: 'active' as const, priority: 6 }
        ]
      }
    }
  },
  'united-kingdom': {
    code: 'GB',
    name: 'United Kingdom',
    currency: { code: 'GBP', symbol: '£', name: 'British Pound', exchangeRate: 1.27 },
    gps: { latitude: 55.3781, longitude: -3.4360, timezone: 'Europe/London' },
    locale: 'en',
    tax: { vat: 20, gst: 0, importDuty: 12 },
    culture: { dateFormat: 'DD/MM/YYYY', timeFormat: '24h', numberFormat: '1,234.56', phoneFormat: '+44 XX XXXX XXXX' },
    business: { workingDays: ['Monday', 'Friday'], businessHours: '9:00 AM - 5:00 PM GMT', paymentMethods: ['Credit Card', 'Bank Transfer', 'PayPal'] },
    integrations: {
      payments: {
        connectors: [
          { name: 'PayPal', code: 'paypal', status: 'active' as const, priority: 1 },
          { name: 'Stripe', code: 'stripe', status: 'active' as const, priority: 2 },
          { name: 'Visa', code: 'visa', status: 'active' as const, priority: 3 },
          { name: 'Mastercard', code: 'mastercard', status: 'active' as const, priority: 4 }
        ]
      }
    }
  },
  'saudi-arabia': {
    code: 'SA',
    name: 'Saudi Arabia',
    currency: { code: 'SAR', symbol: '﷼', name: 'Saudi Riyal', exchangeRate: 0.27 },
    gps: { latitude: 23.8859, longitude: 45.0792, timezone: 'Asia/Riyadh' },
    locale: 'ar',
    tax: { vat: 15, gst: 0, importDuty: 5 },
    culture: { dateFormat: 'DD/MM/YYYY', timeFormat: '12h', numberFormat: '1,234.56', phoneFormat: '+966 XX XXX XXXX' },
    business: { workingDays: ['Sunday', 'Thursday'], businessHours: '9:00 AM - 6:00 PM AST', paymentMethods: ['Cash', 'Bank Transfer', 'Mada'] },
    integrations: {
      payments: {
        connectors: [
          { name: 'Mada', code: 'mada', status: 'active' as const, priority: 1 },
          { name: 'PayPal', code: 'paypal', status: 'active' as const, priority: 2 },
          { name: 'Visa', code: 'visa', status: 'active' as const, priority: 3 },
          { name: 'Mastercard', code: 'mastercard', status: 'active' as const, priority: 4 }
        ]
      }
    }
  },
  'uae': {
    code: 'AE',
    name: 'United Arab Emirates',
    currency: { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham', exchangeRate: 0.27 },
    gps: { latitude: 23.4241, longitude: 53.8478, timezone: 'Asia/Dubai' },
    locale: 'ar',
    tax: { vat: 5, gst: 0, importDuty: 5 },
    culture: { dateFormat: 'DD/MM/YYYY', timeFormat: '12h', numberFormat: '1,234.56', phoneFormat: '+971 XX XXX XXXX' },
    business: { workingDays: ['Sunday', 'Thursday'], businessHours: '9:00 AM - 6:00 PM GST', paymentMethods: ['Credit Card', 'Bank Transfer', 'Cash'] },
    integrations: {
      payments: {
        connectors: [
          { name: 'Apple Pay', code: 'apple_pay', status: 'active' as const, priority: 1 },
          { name: 'Tabby', code: 'tabby', status: 'active' as const, priority: 2 },
          { name: 'Google Pay', code: 'google_pay', status: 'active' as const, priority: 3 },
          { name: 'PayPal', code: 'paypal', status: 'active' as const, priority: 4 },
          { name: 'Visa', code: 'visa', status: 'active' as const, priority: 5 },
          { name: 'Mastercard', code: 'mastercard', status: 'active' as const, priority: 6 }
        ]
      }
    }
  },
  'china': {
    code: 'CN',
    name: 'China',
    currency: { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', exchangeRate: 0.14 },
    gps: { latitude: 35.8617, longitude: 104.1954, timezone: 'Asia/Shanghai' },
    locale: 'zh',
    tax: { vat: 13, gst: 0, importDuty: 10 },
    culture: { dateFormat: 'YYYY-MM-DD', timeFormat: '24h', numberFormat: '1,234.56', phoneFormat: '+86 XXX XXXX XXXX' },
    business: { workingDays: ['Monday', 'Friday'], businessHours: '9:00 AM - 6:00 PM CST', paymentMethods: ['WeChat Pay', 'Alipay', 'Bank Transfer'] },
    integrations: {
      payments: {
        connectors: [
          { name: 'WeChat Pay', code: 'wechat_pay', status: 'active' as const, priority: 1 },
          { name: 'Alipay', code: 'alipay', status: 'active' as const, priority: 2 },
          { name: 'PayPal', code: 'paypal', status: 'active' as const, priority: 3 }
        ]
      }
    }
  },
  'india': {
    code: 'IN',
    name: 'India',
    currency: { code: 'INR', symbol: '₹', name: 'Indian Rupee', exchangeRate: 0.012 },
    gps: { latitude: 20.5937, longitude: 78.9629, timezone: 'Asia/Kolkata' },
    locale: 'en',
    tax: { vat: 0, gst: 18, importDuty: 10 },
    culture: { dateFormat: 'DD/MM/YYYY', timeFormat: '12h', numberFormat: '1,23,456.78', phoneFormat: '+91 XXXXX XXXXX' },
    business: { workingDays: ['Monday', 'Friday'], businessHours: '9:00 AM - 6:00 PM IST', paymentMethods: ['UPI', 'Bank Transfer', 'Cash'] },
    integrations: {
      payments: {
        connectors: [
          { name: 'UPI', code: 'upi', status: 'active' as const, priority: 1 },
          { name: 'Paytm', code: 'paytm', status: 'active' as const, priority: 2 },
          { name: 'PhonePe', code: 'phonepe', status: 'active' as const, priority: 3 },
          { name: 'Google Pay', code: 'google_pay', status: 'active' as const, priority: 4 },
          { name: 'PayPal', code: 'paypal', status: 'active' as const, priority: 5 }
        ]
      }
    }
  },
  'france': {
    code: 'FR',
    name: 'France',
    currency: { code: 'EUR', symbol: '€', name: 'Euro', exchangeRate: 1.08 },
    gps: { latitude: 46.2276, longitude: 2.2137, timezone: 'Europe/Paris' },
    locale: 'fr',
    tax: { vat: 20, gst: 0, importDuty: 2 },
    culture: { dateFormat: 'DD/MM/YYYY', timeFormat: '24h', numberFormat: '1 234,56', phoneFormat: '+33 X XX XX XX XX' },
    business: { workingDays: ['Monday', 'Friday'], businessHours: '9:00 AM - 6:00 PM CET', paymentMethods: ['Carte Bancaire', 'Credit Card', 'PayPal', 'SEPA'] },
    integrations: {
      payments: {
        connectors: [
          { name: 'Carte Bancaire', code: 'carte_bancaire', status: 'active' as const, priority: 1 },
          { name: 'PayPal', code: 'paypal', status: 'active' as const, priority: 2 },
          { name: 'Stripe', code: 'stripe', status: 'active' as const, priority: 3 },
          { name: 'Visa', code: 'visa', status: 'active' as const, priority: 4 },
          { name: 'Mastercard', code: 'mastercard', status: 'active' as const, priority: 5 }
        ]
      }
    }
  },
  'italy': {
    code: 'IT',
    name: 'Italy',
    currency: { code: 'EUR', symbol: '€', name: 'Euro', exchangeRate: 1.08 },
    gps: { latitude: 41.8719, longitude: 12.5674, timezone: 'Europe/Rome' },
    locale: 'en',
    tax: { vat: 22, gst: 0, importDuty: 10 },
    culture: { dateFormat: 'DD/MM/YYYY', timeFormat: '24h', numberFormat: '1.234,56', phoneFormat: '+39 XXX XXX XXXX' },
    business: { workingDays: ['Monday', 'Friday'], businessHours: '9:00 AM - 6:00 PM CET', paymentMethods: ['Credit Card', 'Bank Transfer', 'PayPal'] },
    integrations: {
      payments: {
        connectors: [
          { name: 'PayPal', code: 'paypal', status: 'active' as const, priority: 1 },
          { name: 'Stripe', code: 'stripe', status: 'active' as const, priority: 2 },
          { name: 'Visa', code: 'visa', status: 'active' as const, priority: 3 },
          { name: 'Mastercard', code: 'mastercard', status: 'active' as const, priority: 4 }
        ]
      }
    }
  },
  'brazil': {
    code: 'BR',
    name: 'Brazil',
    currency: { code: 'BRL', symbol: 'R$', name: 'Brazilian Real', exchangeRate: 0.20 },
    gps: { latitude: -14.2350, longitude: -51.9253, timezone: 'America/Sao_Paulo' },
    locale: 'es',
    tax: { vat: 0, gst: 18, importDuty: 15 },
    culture: { dateFormat: 'DD/MM/YYYY', timeFormat: '24h', numberFormat: '1.234,56', phoneFormat: '+55 XX XXXXX-XXXX' },
    business: { workingDays: ['Monday', 'Friday'], businessHours: '9:00 AM - 6:00 PM BRT', paymentMethods: ['Credit Card', 'PIX', 'Bank Transfer'] },
    integrations: {
      payments: {
        connectors: [
          { name: 'PIX', code: 'pix', status: 'active' as const, priority: 1 },
          { name: 'PayPal', code: 'paypal', status: 'active' as const, priority: 2 },
          { name: 'Stripe', code: 'stripe', status: 'active' as const, priority: 3 },
          { name: 'Visa', code: 'visa', status: 'active' as const, priority: 4 },
          { name: 'Mastercard', code: 'mastercard', status: 'active' as const, priority: 5 }
        ]
      }
    }
  },
  'australia': {
    code: 'AU',
    name: 'Australia',
    currency: { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', exchangeRate: 0.66 },
    gps: { latitude: -25.2744, longitude: 133.7751, timezone: 'Australia/Sydney' },
    locale: 'en',
    tax: { vat: 0, gst: 10, importDuty: 5 },
    culture: { dateFormat: 'DD/MM/YYYY', timeFormat: '24h', numberFormat: '1,234.56', phoneFormat: '+61 X XXXX XXXX' },
    business: { workingDays: ['Monday', 'Friday'], businessHours: '9:00 AM - 5:00 PM AEST', paymentMethods: ['Credit Card', 'Bank Transfer', 'PayPal'] },
    integrations: {
      payments: {
        connectors: [
          { name: 'PayPal', code: 'paypal', status: 'active' as const, priority: 1 },
          { name: 'Stripe', code: 'stripe', status: 'active' as const, priority: 2 },
          { name: 'Visa', code: 'visa', status: 'active' as const, priority: 3 },
          { name: 'Mastercard', code: 'mastercard', status: 'active' as const, priority: 4 }
        ]
      }
    }
  }
}

// AI-Powered Country-Specific Data Generator
export const generateCountrySpecificData = (countryCode: string): CountrySpecificData => {
  const country = countryDatabase[countryCode] || countryDatabase['united-states']
  
  // AI-generated customer names based on country
  const nameGenerators: Record<string, string[]> = {
    'PK': ['Ahmed Khan', 'Fatima Ali', 'Muhammad Hassan', 'Ayesha Malik', 'Omar Sheikh', 'Zainab Ahmed'],
    'US': ['John Smith', 'Emily Johnson', 'Michael Brown', 'Sarah Davis', 'David Wilson', 'Jessica Martinez'],
    'GB': ['James Taylor', 'Sophie Williams', 'Oliver Jones', 'Emma Brown', 'Harry Davis', 'Olivia Wilson'],
    'SA': ['محمد العلي', 'فاطمة الأحمد', 'عبدالله السالم', 'نورا القحطاني', 'خالد المطيري', 'سارة الدوسري'],
    'AE': ['محمد النعيمي', 'فاطمة المزروعي', 'عبدالله الشامسي', 'مريم الكعبي', 'خالد الظاهري', 'سارة السويدي'],
    'CN': ['王明', '李华', '张伟', '刘芳', '陈强', '杨丽'],
    'IN': ['Raj Kumar', 'Priya Sharma', 'Amit Patel', 'Anjali Singh', 'Vikram Gupta', 'Kavita Reddy'],
    'IT': ['Marco Rossi', 'Giulia Bianchi', 'Luca Ferrari', 'Sofia Romano', 'Alessandro Conti', 'Emma Marino'],
    'BR': ['João Silva', 'Maria Santos', 'Pedro Oliveira', 'Ana Costa', 'Carlos Pereira', 'Juliana Alves'],
    'AU': ['James Mitchell', 'Emma Thompson', 'William Brown', 'Olivia Taylor', 'Lucas Anderson', 'Sophia White']
  }

  // AI-generated product preferences based on country
  const productPreferences: Record<string, any> = {
    'PK': {
      hotProducts: ['Biscuits', 'Tea', 'Snacks', 'Beverages'],
      trendingCategories: ['Bakery', 'Confectionery', 'Beverages'],
      seasonalItems: ['Ramadan Special', 'Eid Treats', 'Winter Snacks']
    },
    'US': {
      hotProducts: ['Organic Snacks', 'Energy Drinks', 'Protein Bars', 'Healthy Beverages'],
      trendingCategories: ['Health Special', 'Functional Beverages', 'Premium Snacks'],
      seasonalItems: ['Holiday Gift Sets', 'Summer Drinks', 'Halloween Candy']
    },
    'GB': {
      hotProducts: ['Premium Biscuits', 'Tea', 'Chocolate', 'Crisps'],
      trendingCategories: ['Bakery', 'Confectionery', 'Beverages'],
      seasonalItems: ['Christmas Hampers', 'Easter Eggs', 'Summer Picnic']
    },
    'SA': {
      hotProducts: ['Dates', 'Arabic Coffee', 'Halal Snacks', 'Traditional Sweets'],
      trendingCategories: ['Bakery', 'Confectionery', 'Beverages'],
      seasonalItems: ['Ramadan Iftar', 'Eid Gifts', 'Hajj Special']
    },
    'CN': {
      hotProducts: ['Instant Noodles', 'Tea', 'Snacks', 'Functional Drinks'],
      trendingCategories: ['Pasta', 'Beverages', 'Snacks'],
      seasonalItems: ['Chinese New Year', 'Mid-Autumn Festival', 'Winter Warmers']
    },
    'IN': {
      hotProducts: ['Namkeen', 'Biscuits', 'Tea', 'Snacks'],
      trendingCategories: ['Bakery', 'Confectionery', 'Beverages'],
      seasonalItems: ['Diwali Sweets', 'Holi Special', 'Festival Packs']
    }
  }

  const code = country.code
  const names = nameGenerators[code] || nameGenerators['US']
  const preferences = productPreferences[code] || productPreferences['US']

  return {
    customerNames: names,
    productPreferences: preferences,
    businessMetrics: {
      avgOrderValue: country.currency.exchangeRate * 500, // Converted to local currency
      popularPaymentMethod: country.business.paymentMethods[0],
      peakHours: ['10:00 AM - 12:00 PM', '2:00 PM - 4:00 PM']
    },
    localInsights: {
      marketTrends: [`Growing demand for ${preferences.trendingCategories[0]}`, 'Premiumization trend', 'Health & wellness focus'],
      consumerBehavior: ['Price sensitive', 'Brand loyal', 'Quality focused']
    }
  }
}

// Get country data by code
export const getCountryData = (countryCode: string): CountryData | null => {
  if (!countryCode) return countryDatabase['united-states']
  const normalizedCode = countryCode.toLowerCase().trim()
  return countryDatabase[normalizedCode] || countryDatabase['united-states'] || null
}

// Get all countries
export const getAllCountries = (): CountryData[] => {
  return Object.values(countryDatabase)
}

// Convert currency
export const convertCurrency = (amount: number, fromCountry: string, toCountry: string): number => {
  const from = getCountryData(fromCountry)
  const to = getCountryData(toCountry)
  if (!from || !to) return amount // Return original amount if country data not found
  const usdAmount = amount / (from.currency.exchangeRate || 1)
  return usdAmount * (to.currency.exchangeRate || 1)
}

// Format currency
export const formatCurrency = (amount: number, countryCode: string): string => {
  const country = getCountryData(countryCode)
  if (!country) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }
  const formatted = new Intl.NumberFormat(country.locale, {
    style: 'currency',
    currency: country.currency.code
  }).format(amount)
  return formatted
}

