import { countryProfiles } from './localisation.data';
import { CountryProfile, LocalisationApiResponse } from './localisation.types';
import {
  mockProvidersEnabled,
  getMockFxRates,
  getMockPopulation,
  getMockGDP,
  getMockFoodImports,
  getMockWeather,
  getMockLocalizationIntel
} from '../../external/mockProviders';
import { getExchangeRates, getExchangeRate } from '../../services/currencyService';
import { getCountryByCode, getCountryPopulation } from '../../services/countryService';
import { getCountryWeather } from '../../services/weatherService';
import { generateProductsForCountry } from './productGenerator.service';

export const getCountryProfile = (codeOrName: string): CountryProfile | undefined => {
  if (!codeOrName) {
    return undefined;
  }
  const normalized = codeOrName.trim().toLowerCase();
  const normalizedSlug = normalized.replace(/-/g, ' ');
  return countryProfiles.find(
    (country) =>
      country.code.toLowerCase() === normalized ||
      country.name.toLowerCase() === normalized ||
      country.name.toLowerCase() === normalizedSlug ||
      country.name.toLowerCase().replace(/\s+/g, '-') === normalized.replace(/\s+/g, '-')
  );
};

export const listCountryProfiles = (): CountryProfile[] => {
  return countryProfiles;
};

const currencyMap: Record<string, { code: string; symbol: string }> = {
  US: { code: 'USD', symbol: '$' },
  CA: { code: 'CAD', symbol: '$' },
  MX: { code: 'MXN', symbol: '$' },
  BR: { code: 'BRL', symbol: 'R$' },
  UK: { code: 'GBP', symbol: '£' },
  DE: { code: 'EUR', symbol: '€' },
  FR: { code: 'EUR', symbol: '€' },
  ES: { code: 'EUR', symbol: '€' },
  IT: { code: 'EUR', symbol: '€' },
  AE: { code: 'AED', symbol: 'د.إ' },
  PK: { code: 'PKR', symbol: '₨' },
  SA: { code: 'SAR', symbol: '﷼' },
  OM: { code: 'OMR', symbol: '﷼' },
  IN: { code: 'INR', symbol: '₹' },
  CN: { code: 'CNY', symbol: '¥' },
  JP: { code: 'JPY', symbol: '¥' },
  KR: { code: 'KRW', symbol: '₩' },
  AU: { code: 'AUD', symbol: '$' },
  ZA: { code: 'ZAR', symbol: 'R' },
  NG: { code: 'NGN', symbol: '₦' },
  KE: { code: 'KES', symbol: 'Sh' },
  EG: { code: 'EGP', symbol: '£' },
  ID: { code: 'IDR', symbol: 'Rp' },
  VN: { code: 'VND', symbol: '₫' },
  PH: { code: 'PHP', symbol: '₱' },
  TR: { code: 'TRY', symbol: '₺' }
};

const computePriceBand = (gdpPerCapita: number) => {
  if (gdpPerCapita >= 32000) return 'premium';
  if (gdpPerCapita >= 10000) return 'mid-tier';
  return 'value';
};

const computeMarketScore = (profile: CountryProfile) => {
  const incomeScore = Math.min(profile.gdpPerCapitaUSD / 1000, 40);
  const logisticsScore = (10 - profile.logisticsComplexityScore) * 4;
  const populationScore = Math.min(profile.population / 10_000_000, 20);
  const importScore = Math.min(profile.foodBeverageImportsUSD / 5_000_000_000, 20);
  return Math.max(35, Math.min(98, Math.round(incomeScore + logisticsScore + populationScore + importScore)));
};

const normalizeSkuStrategy = (strategy: string[] | string): string[] => {
  if (Array.isArray(strategy)) return strategy;
  if (typeof strategy === 'string') {
    return strategy.split(/,|\band\b/gi).map((part) => part.trim()).filter(Boolean);
  }
  return [];
};

const useMockProviders = mockProvidersEnabled();

export const buildLocalisationPayload = async (profile: CountryProfile): Promise<LocalisationApiResponse> => {
  const skuStrategy = normalizeSkuStrategy(profile.skuStrategy);
  const currencyMeta = currencyMap[profile.code] || { code: 'USD', symbol: '$' };
  
  // Try real APIs first, fallback to mock or profile data
  let fxData = null;
  let populationData = null;
  let gdpData = null;
  let importData = null;
  let weatherData = null;
  const localisationIntel = useMockProviders ? getMockLocalizationIntel(profile.code) : null;

  if (useMockProviders) {
    // Use mock providers
    fxData = getMockFxRates();
    populationData = getMockPopulation(profile.code);
    gdpData = getMockGDP(profile.code);
    importData = getMockFoodImports(profile.code);
    weatherData = getMockWeather(profile.code);
  } else {
    // Try real APIs with safe fallback
    // If any API fails, we'll use profile data (safe fallback)
    
    try {
      // Get exchange rates (with timeout protection)
      const ratesPromise = getExchangeRates();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Exchange rate API timeout')), 5000)
      );
      
      const rates = await Promise.race([ratesPromise, timeoutPromise]) as Record<string, number> | null;
      if (rates && typeof rates === 'object') {
        fxData = { rates };
      }
    } catch (error) {
      console.warn('Exchange rates API unavailable, using profile data:', error instanceof Error ? error.message : 'Unknown error');
      // Fallback: use profile FX rate (already set below)
    }

    try {
      // Get country data (population) - with timeout
      const countryPromise = getCountryByCode(profile.code);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Country API timeout')), 5000)
      );
      
      const countryData = await Promise.race([countryPromise, timeoutPromise]) as any;
      if (countryData && typeof countryData === 'object' && countryData.population) {
        populationData = {
          value: countryData.population,
          urbanPercent: undefined, // REST Countries doesn't provide this
        };
      }
    } catch (error) {
      console.warn('Country data API unavailable, using profile data:', error instanceof Error ? error.message : 'Unknown error');
      // Fallback: use profile population (already set below)
    }

    try {
      // Get weather data - only if API key is configured
      if (process.env.OPENWEATHER_API_KEY) {
        const weatherPromise = getCountryWeather(profile.code);
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Weather API timeout')), 5000)
        );
        
        const weather = await Promise.race([weatherPromise, timeoutPromise]) as any;
        if (weather && typeof weather === 'object' && weather.temp !== undefined) {
          weatherData = {
            temp: weather.temp,
            condition: weather.main,
            description: weather.description,
          };
        }
      }
    } catch (error) {
      console.warn('Weather API unavailable (this is optional):', error instanceof Error ? error.message : 'Unknown error');
      // Weather is optional - no fallback needed
    }
  }

  // Get currency code for the country
  const currencyCode = currencyMeta.code;
  
  // Get exchange rate
  let fxRate = profile.fxRateToUSD;
  if (fxData?.rates) {
    if (currencyCode === 'USD') {
      fxRate = 1;
    } else if (fxData.rates[currencyCode]) {
      // If base is USD and we have the currency rate
      fxRate = fxData.rates[currencyCode];
    } else {
      // Try to get rate from USD to target currency
      try {
        const rate = await getExchangeRate('USD', currencyCode);
        if (rate) fxRate = rate;
      } catch (error) {
        // Fallback to profile rate
      }
    }
  }

  const population = populationData?.value ?? profile.population;
  const urbanPercent = populationData?.urbanPercent ?? undefined;
  const gdpPerCapita = gdpData?.value ?? profile.gdpPerCapitaUSD;
  const importFoodUSD = importData?.usd ?? profile.foodBeverageImportsUSD;
  const channelMix = localisationIntel?.channelMix || [
    { channel: 'Modern Trade', share: 35 },
    { channel: 'General Trade', share: 40 },
    { channel: 'E-commerce', share: 15 },
    { channel: 'HORECA', share: 10 }
  ];
  const competitorSet = localisationIntel?.competitors || [
    { name: 'Regional Private Labels', share: 15, focus: 'Value channel' }
  ];
  const skuStructureDetail = localisationIntel?.skuStructure || [
    { tier: 'Premium', share: 30, heroSkus: ['Signature SKU'] },
    { tier: 'Mid', share: 45, heroSkus: ['Core SKU'] },
    { tier: 'Value', share: 25, heroSkus: ['Value Pack'] }
  ];
  const procurement = localisationIntel?.procurement || {
    hotspots: [],
    suppliers: [],
    riskLevel: 'Medium'
  };
  const tradeFlowsDetailed = localisationIntel?.tradeFlows || [];
  const gpsCoverage = localisationIntel?.gpsCoverage || null;
  const satelliteInsights = localisationIntel?.satellite || null;
  const aiInsights = localisationIntel?.aiStrategy || null;
  const demandPockets = localisationIntel?.demandPockets || [];
  const paymentConnectors =
    localisationIntel?.payments ||
    profile.paymentMethods.map((name, index) => ({
      name,
      status: 'active',
      priority: index + 1
    }));

  return {
    countryCode: profile.code,
    name: profile.name,
    currencyCode: currencyMeta.code,
    currencySymbol: currencyMeta.symbol,
    marketScore: computeMarketScore(profile),
    priceBand: computePriceBand(gdpPerCapita),
    population,
    populationBreakdown: urbanPercent ? { value: population, urbanPercent } : { value: population },
    gdpPerCapita,
    importFoodBevUSD: importFoodUSD,
    taxModel: {
      vat: profile.taxModel.vat,
      gst: profile.taxModel.gst,
      importDuty: profile.taxModel.customsDuty
    },
    marketType: profile.marketType,
    skuStrategy,
    payments: profile.paymentMethods,
    distributorStructure: profile.distributorStructure,
    logisticsComplexity: profile.logisticsComplexityScore,
    fxRateUSD: fxRate,
    weather: weatherData || undefined,
    macroIndicators: {
      inflation: gdpData?.inflation,
      unemployment: gdpData?.unemployment
    },
    channelMix,
    competitorSet,
    skuStructureDetail,
    procurement,
    tradeFlowsDetailed,
    gpsCoverage: gpsCoverage || undefined,
    satelliteInsights: satelliteInsights || undefined,
    aiInsights: aiInsights || undefined,
    demandPockets,
    paymentConnectors,
    generatedProducts: generateProductsForCountry(profile)
  };
};

