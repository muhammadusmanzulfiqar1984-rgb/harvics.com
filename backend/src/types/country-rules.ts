import { CurrencyCode, CountryCode, LanguageCode } from './shared';
export { CurrencyCode, CountryCode, LanguageCode };


/**
 * Country Rule Engine Interfaces
 * Maps directly to the Localisation Engine 8 Pillars
 */

// 1. Language & Docs
export interface LanguageRules {
  uiLanguage: LanguageCode;
  contractLanguage: LanguageCode; // Legal binding language
  legalTranslationsRequired: boolean; // Are certified translations needed?
  rtl: boolean;
}

// 2. Jurisdiction & Trade Law
export interface JurisdictionRules {
  governingLaw: string; // e.g., "English Law", "DIFC Law", "Swiss Law"
  disputeResolution: 'Arbitration' | 'Court' | 'Mediation';
  sanctionsList: string[]; // e.g., ["OFAC", "UN", "EU"]
  tradeTreaties: string[]; // e.g., ["GCC", "EU-FTA", "NAFTA"]
  forbiddenProducts: string[]; // e.g., ["Alcohol", "Pork", "Crypto"]
}

// 3. Currency & FX
export interface CurrencyRules {
  localCurrency: CurrencyCode;
  settlementCurrency: CurrencyCode; // e.g., USD for international trade
  allowMultiCurrencyPricing: boolean;
  fxHedgeRequired: boolean; // If volatility > threshold
  cryptoAllowed: boolean;
}

// 4. Tax & Duties
export interface TaxRules {
  vatRate: number; // e.g., 0.05 for UAE
  gstRate: number;
  withholdingTax: number;
  corporateTax: number;
  taxRegistrationFormat: string; // Regex for TRN/VAT ID
  dutyFreeZones: string[]; // e.g., ["Jebel Ali", "DIFC"]
}

// 5. Customs & HS Codes
export interface CustomsRules {
  hsCodeVersion: '2017' | '2022';
  importLicenseRequired: boolean;
  certificateOfOrigin: boolean;
  inspectionRequired: boolean; // Pre-shipment inspection?
  restrictedImports: string[];
}

// 6. Banking & Payments
export interface BankingRules {
  lcAccepted: boolean;
  sblcAccepted: boolean;
  ibanRequired: boolean;
  centralBankReportingLimit: number; // Amount triggering reporting
  paymentTerms: string[]; // e.g., ["T/T", "LC", "Net30"]
}

// 7. Compliance & Labels
export interface ComplianceRules {
  labelingLanguages: LanguageCode[]; // e.g., ["en", "ar"] for UAE
  halalCertification: boolean;
  sasoCertification: boolean; // Saudi specific
  ceMarking: boolean; // EU specific
  fdaRegistration: boolean; // US specific
}

// 8. Culture & Norms
export interface CulturalRules {
  weekendDays: ('Friday' | 'Saturday' | 'Sunday')[];
  negotiationStyle: 'Direct' | 'Relationship-based' | 'Formal';
  giftGivingAllowed: boolean; // Anti-bribery check
  prayerTimesSensitive: boolean;
}

// --- MASTER PROFILE ---
export interface CountryProfile {
  code: CountryCode;
  name: string;
  region: string;
  language: LanguageRules;
  jurisdiction: JurisdictionRules;
  currency: CurrencyRules;
  tax: TaxRules;
  customs: CustomsRules;
  banking: BankingRules;
  compliance: ComplianceRules;
  culture: CulturalRules;
}

// --- ACTIONABLE WORKFLOW CONFIG ---
export interface AutoWorkflowConfig {
  requiresLegalReview: boolean;
  requiresComplianceCheck: boolean;
  requiresExportLicense: boolean;
  paymentMethodsAllowed: string[];
  shippingIncoterms: string[]; // e.g., ["FOB", "CIF", "DDP"]
}
