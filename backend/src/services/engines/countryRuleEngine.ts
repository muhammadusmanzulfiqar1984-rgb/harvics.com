import { 
  CountryProfile, 
  AutoWorkflowConfig, 
  CountryCode 
} from '../../types/country-rules';

/**
 * Country Rule Engine (CRE)
 * The central brain for the Localisation & Jurisdiction Layer.
 * 
 * Flow:
 * Selected Country -> CRE -> [Trade, Customs, Tax, Banking, Compliance, Language] -> Auto-Configured Workflow
 */
export class CountryRuleEngine {
  private profiles: Map<string, CountryProfile> = new Map();

  constructor() {
    this.initializeProfiles();
  }

  /**
   * Initialize with hardcoded rules for key markets (Demo Mode)
   * In production, this would load from a database or external API.
   */
  private initializeProfiles() {
    // 🇦🇪 UAE (Dubai) Profile
    this.profiles.set('AE', {
      code: 'AE',
      name: 'United Arab Emirates',
      region: 'MENA',
      language: {
        uiLanguage: 'ar',
        contractLanguage: 'en', // DIFC uses English
        legalTranslationsRequired: true,
        rtl: true
      },
      jurisdiction: {
        governingLaw: 'English Law (DIFC) / UAE Civil Law',
        disputeResolution: 'Arbitration',
        sanctionsList: ['UN', 'GCC'],
        tradeTreaties: ['GCC', 'GAFTA'],
        forbiddenProducts: ['Alcohol (Licence)', 'Pork (Licence)', 'Gambling']
      },
      currency: {
        localCurrency: 'AED',
        settlementCurrency: 'USD',
        allowMultiCurrencyPricing: true,
        fxHedgeRequired: false,
        cryptoAllowed: true // VARA regulated
      },
      tax: {
        vatRate: 0.05,
        gstRate: 0,
        withholdingTax: 0,
        corporateTax: 0.09,
        taxRegistrationFormat: '^100[0-9]{12}$', // TRN format
        dutyFreeZones: ['JAFZA', 'DIFC', 'DMCC']
      },
      customs: {
        hsCodeVersion: '2022',
        importLicenseRequired: true,
        certificateOfOrigin: true,
        inspectionRequired: false,
        restrictedImports: ['Drones', 'Telecomm Equip']
      },
      banking: {
        lcAccepted: true,
        sblcAccepted: true,
        ibanRequired: true,
        centralBankReportingLimit: 50000, // AED
        paymentTerms: ['T/T', 'LC', 'PDC'] // PDC = Post Dated Cheques
      },
      compliance: {
        labelingLanguages: ['ar', 'en'],
        halalCertification: true,
        sasoCertification: false,
        ceMarking: false,
        fdaRegistration: false
      },
      culture: {
        weekendDays: ['Saturday', 'Sunday'], // Changed recently
        negotiationStyle: 'Relationship-based',
        giftGivingAllowed: false,
        prayerTimesSensitive: true
      }
    });

    // 🇬🇧 UK Profile
    this.profiles.set('GB', {
      code: 'GB',
      name: 'United Kingdom',
      region: 'Europe',
      language: {
        uiLanguage: 'en',
        contractLanguage: 'en',
        legalTranslationsRequired: false,
        rtl: false
      },
      jurisdiction: {
        governingLaw: 'English Law',
        disputeResolution: 'Court',
        sanctionsList: ['UK Sanctions List', 'UN'],
        tradeTreaties: ['UK-EU TCA', 'CPTPP'],
        forbiddenProducts: []
      },
      currency: {
        localCurrency: 'GBP',
        settlementCurrency: 'GBP',
        allowMultiCurrencyPricing: true,
        fxHedgeRequired: true,
        cryptoAllowed: true
      },
      tax: {
        vatRate: 0.20,
        gstRate: 0,
        withholdingTax: 0,
        corporateTax: 0.25,
        taxRegistrationFormat: '^GB[0-9]{9}$',
        dutyFreeZones: ['Freeports']
      },
      customs: {
        hsCodeVersion: '2022',
        importLicenseRequired: false,
        certificateOfOrigin: false,
        inspectionRequired: true, // Post-Brexit checks
        restrictedImports: ['Weapons']
      },
      banking: {
        lcAccepted: true,
        sblcAccepted: true,
        ibanRequired: true,
        centralBankReportingLimit: 0,
        paymentTerms: ['Net30', 'Net60']
      },
      compliance: {
        labelingLanguages: ['en'],
        halalCertification: false,
        sasoCertification: false,
        ceMarking: false, // UKCA now
        fdaRegistration: false
      },
      culture: {
        weekendDays: ['Saturday', 'Sunday'],
        negotiationStyle: 'Direct',
        giftGivingAllowed: false,
        prayerTimesSensitive: false
      }
    });
    
    // 🇺🇸 US Profile
    this.profiles.set('US', {
      code: 'US',
      name: 'United States',
      region: 'North America',
      language: {
        uiLanguage: 'en',
        contractLanguage: 'en',
        legalTranslationsRequired: false,
        rtl: false
      },
      jurisdiction: {
        governingLaw: 'State Law (NY/DE)',
        disputeResolution: 'Court',
        sanctionsList: ['OFAC', 'SDN'],
        tradeTreaties: ['USMCA'],
        forbiddenProducts: ['Cuban Goods']
      },
      currency: {
        localCurrency: 'USD',
        settlementCurrency: 'USD',
        allowMultiCurrencyPricing: false,
        fxHedgeRequired: false,
        cryptoAllowed: true
      },
      tax: {
        vatRate: 0,
        gstRate: 0,
        withholdingTax: 0.30,
        corporateTax: 0.21,
        taxRegistrationFormat: '^[0-9]{2}-[0-9]{7}$', // EIN
        dutyFreeZones: ['FTZ']
      },
      customs: {
        hsCodeVersion: '2022',
        importLicenseRequired: false,
        certificateOfOrigin: false,
        inspectionRequired: true,
        restrictedImports: []
      },
      banking: {
        lcAccepted: true,
        sblcAccepted: true,
        ibanRequired: false, // US uses Routing Numbers
        centralBankReportingLimit: 10000,
        paymentTerms: ['Net30', 'Credit Card']
      },
      compliance: {
        labelingLanguages: ['en'],
        halalCertification: false,
        sasoCertification: false,
        ceMarking: false,
        fdaRegistration: true
      },
      culture: {
        weekendDays: ['Saturday', 'Sunday'],
        negotiationStyle: 'Direct',
        giftGivingAllowed: false,
        prayerTimesSensitive: false
      }
    });
  }

  /**
   * Get the full Country Profile and Rules
   */
  public getProfile(countryCode: string): CountryProfile | null {
    return this.profiles.get(countryCode.toUpperCase()) || null;
  }

  /**
   * Generate Auto-Configured Workflow based on Country Rules
   * @param countryCode Target country
   * @param orderValue Total value of the deal
   * @param productCategory Type of product
   */
  public generateWorkflow(countryCode: string, orderValue: number, productCategory: string): AutoWorkflowConfig {
    const profile = this.getProfile(countryCode);
    
    // Default safe workflow
    const workflow: AutoWorkflowConfig = {
      requiresLegalReview: false,
      requiresComplianceCheck: false,
      requiresExportLicense: false,
      paymentMethodsAllowed: ['T/T'],
      shippingIncoterms: ['CIF']
    };

    if (!profile) return workflow;

    // Rule 1: High Value Orders trigger Legal Review
    if (orderValue > 50000) {
      workflow.requiresLegalReview = true;
    }

    // Rule 2: Compliance Check for Restricted Categories or Certifications
    if (profile.compliance.halalCertification || profile.compliance.fdaRegistration) {
      workflow.requiresComplianceCheck = true;
    }

    // Rule 3: Forbidden Products Check
    if (profile.jurisdiction.forbiddenProducts.some(p => productCategory.includes(p))) {
      throw new Error(`Product category '${productCategory}' is forbidden in ${profile.name}`);
    }

    // Rule 4: Payment Terms
    workflow.paymentMethodsAllowed = profile.banking.paymentTerms;

    // Rule 5: Sanctions Check (Simulated)
    if (profile.jurisdiction.sanctionsList.length > 0) {
        // In a real engine, we would check the counterparty against these lists
        workflow.requiresComplianceCheck = true; 
    }

    return workflow;
  }
}
