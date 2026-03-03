export interface TaxModel {
  vat: number;
  gst: number;
  customsDuty: number;
}

export interface FlavorProfile {
  preferredProfiles: ('spicy' | 'sweet' | 'savory' | 'sour' | 'bitter' | 'umami' | 'masala' | 'herbal' | 'aromatic' | 'spicy (regional)')[];
  spiceTolerance: 'low' | 'medium' | 'high';
  sweetnessLevel: 'low' | 'medium' | 'high';
  popularIngredients: string[];
  forbiddenIngredients?: string[]; // e.g. Pork in Muslim countries, Beef in Hindu areas
}

export interface CulturalProfile {
  dietaryRestrictions: ('halal' | 'kosher' | 'vegetarian' | 'vegan' | 'gluten-free')[];
  diningHabits: string; // e.g., "Family style", "On-the-go", "Late dinners"
  seasonalEvents: { name: string; month: string; productFocus: string }[];
  shoppingHabits: string; // e.g., "Daily fresh markets", "Weekly bulk buying"
}

export type MarketType = 'developed' | 'emerging' | 'frontier' | 'developed-emerging';

export interface CountryProfile {
  code: string;
  name: string;
  region: string;
  population: number;
  gdpPerCapitaUSD: number;
  fxRateToUSD: number;
  foodBeverageImportsUSD: number;
  taxModel: TaxModel;
  marketType: MarketType;
  skuStrategy: string[] | string;
  paymentMethods: string[];
  distributorStructure: string;
  logisticsComplexityScore: number; // 1 (simple) - 10 (complex)
  notes?: string;
  // Deep Intelligence Layer
  cultural?: CulturalProfile;
  flavors?: FlavorProfile;
  climate?: {
    type: 'tropical' | 'arid' | 'temperate' | 'continental';
    averageTempHigh: number;
    averageTempLow: number;
  };
}

export interface ChannelMixEntry {
  channel: string;
  share: number;
  growth?: number;
}

export interface CompetitorEntry {
  name: string;
  share: number;
  focus: string;
}

export interface SkuStructureEntry {
  tier: string;
  share: number;
  heroSkus: string[];
}

export interface ProcurementHotspot {
  region: string;
  materials: string[];
}

export interface ProcurementSupplier {
  name: string;
  category: string;
  reliability: string;
}

export interface ProcurementIntel {
  hotspots: ProcurementHotspot[];
  suppliers: ProcurementSupplier[];
  riskLevel: string;
}

export interface TradeFlowIntel {
  hsCode: string;
  description: string;
  importUSD: number;
  exportUSD: number;
}

export interface GPSCoverageIntel {
  retailers: number;
  coveragePercent: number;
  activeRoutes: number;
  priorityCities: string[];
}

export interface SatelliteIntel {
  whitespaces: number;
  densityIndex: number;
  priorityZones: string[];
}

export interface AIStrategyIntel {
  thesis: string;
  focusPillars: string[];
  nextBestActions: string[];
  demandPulse: {
    region: string;
    score: number;
  }[];
}

export interface DemandPocket {
  region: string;
  velocity: string;
  focusSKU: string;
}

export interface PaymentConnector {
  name: string;
  status: 'active' | 'testing' | 'inactive';
  priority: number;
}

export interface LocalisationApiResponse {
  countryCode: string;
  name: string;
  currencyCode: string;
  currencySymbol: string;
  marketScore: number;
  priceBand: 'value' | 'mid-tier' | 'premium';
  population: number;
  populationBreakdown?: {
    value: number;
    urbanPercent?: number;
  };
  gdpPerCapita: number;
  importFoodBevUSD: number;
  taxModel: {
    vat: number;
    gst: number;
    importDuty: number;
  };
  marketType: string;
  skuStrategy: string[];
  payments: string[];
  distributorStructure: string;
  logisticsComplexity: number;
  fxRateUSD?: number;
  weather?: {
    city: string;
    temperature: number;
    description: string;
    humidity: number;
    windSpeed: number;
  };
  macroIndicators?: {
    inflation?: number;
    unemployment?: number;
  };
  channelMix: ChannelMixEntry[];
  competitorSet: CompetitorEntry[];
  skuStructureDetail: SkuStructureEntry[];
  procurement: ProcurementIntel;
  tradeFlowsDetailed: TradeFlowIntel[];
  gpsCoverage?: GPSCoverageIntel;
  satelliteInsights?: SatelliteIntel;
  aiInsights?: AIStrategyIntel;
  demandPockets?: DemandPocket[];
  paymentConnectors?: PaymentConnector[];
  generatedProducts?: GeneratedProduct[];
}

export interface GeneratedProduct {
  name: string;
  category: string;
  flavorProfile: string;
  packSize: string;
  targetDemographic: string;
  pricePoint: 'Value' | 'Mid-Tier' | 'Premium';
  reasoning: string[];
}

