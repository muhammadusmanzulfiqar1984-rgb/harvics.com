export interface User {
  id: string;
  email: string;
  country: 'UK' | 'DE' | 'Nordics';
}

export interface Expense {
  id: string;
  userId: string;
  date: string;
  merchant: string;
  category: string;
  amount: number;
  currency: string;
  vatAmount: number;
  vatRate: number;
  country: string;
  receiptUrl?: string;
  status: 'pending' | 'verified' | 'flagged';
  auditTrail: AuditLog[];
}

export interface AuditLog {
  timestamp: string;
  action: string;
  user: string;
  details: string;
}

export type Language = 'EN' | 'DE' | 'PL' | 'SE' | 'FR';

export interface VatRateMapping {
  country: string;
  currency: string;
  language: Language;
  rates: {
    label: string;
    value: number;
  }[];
}

export const VAT_RATES: Record<string, VatRateMapping> = {
  UK: {
    country: 'United Kingdom',
    currency: 'GBP',
    language: 'EN',
    rates: [
      { label: 'Standard (20%)', value: 20 },
      { label: 'Reduced (5%)', value: 5 },
      { label: 'Zero (0%)', value: 0 },
    ],
  },
  DE: {
    country: 'Germany',
    currency: 'EUR',
    language: 'DE',
    rates: [
      { label: 'Standard (19%)', value: 19 },
      { label: 'Reduced (7%)', value: 7 },
      { label: 'Zero (0%)', value: 0 },
    ],
  },
  SE: {
    country: 'Sweden',
    currency: 'SEK',
    language: 'SE',
    rates: [
      { label: 'Standard (25%)', value: 25 },
      { label: 'Reduced (12%)', value: 12 },
      { label: 'Reduced (6%)', value: 6 },
    ],
  },
  PL: {
    country: 'Poland',
    currency: 'PLN',
    language: 'PL',
    rates: [
      { label: 'Standard (23%)', value: 23 },
      { label: 'Reduced (8%)', value: 8 },
      { label: 'Reduced (5%)', value: 5 },
    ],
  },
  FR: {
    country: 'France',
    currency: 'EUR',
    language: 'FR',
    rates: [
      { label: 'Standard (20%)', value: 20 },
      { label: 'Reduced (10%)', value: 10 },
      { label: 'Reduced (5.5%)', value: 5.5 },
    ],
  },
};

export const TRANSLATIONS: Record<Language, any> = {
  EN: {
    dashboard: 'Dashboard',
    expenses: 'Expenses',
    concierge: 'Concierge',
    reports: 'Reports',
    settings: 'Settings',
    scanReceipt: 'Scan Receipt',
    evaluateTax: 'Evaluate Tax',
    vatReclaimable: 'VAT Reclaimable',
    activeJurisdiction: 'Active Jurisdiction',
    upcomingDeadlines: 'Upcoming Deadlines',
    backToSettings: 'Back to Settings',
    securityPrivacy: 'Security & Privacy',
    subscriptionDetails: 'Subscription Details',
    taxJurisdiction: 'Tax Jurisdiction',
    language: 'Language',
    changeRegion: 'Change Region',
    changeCountry: 'Change Country',
    preArrivalEval: 'Pre-Arrival Evaluation',
    calculateImpact: 'Calculate Impact',
    reclaimableVat: 'Reclaimable VAT',
    totalGross: 'Total Gross',
    confirmSave: 'Confirm & Save',
    saveExpense: 'Save Expense',
    merchant: 'Merchant',
    amount: 'Amount',
    date: 'Date',
    country: 'Country',
    currency: 'Currency',
    processing: 'Processing with AI...',
    aiExtractionSuccess: 'AI Extraction Successful. Please verify below.',
    originalText: 'Original Text',
    translatedText: 'Translated Text',
  },
  DE: {
    dashboard: 'Dashboard',
    expenses: 'Ausgaben',
    concierge: 'Concierge',
    reports: 'Berichte',
    settings: 'Einstellungen',
    scanReceipt: 'Beleg scannen',
    evaluateTax: 'Steuer prüfen',
    vatReclaimable: 'MwSt. erstattungsfähig',
    activeJurisdiction: 'Aktive Gerichtsbarkeit',
    upcomingDeadlines: 'Anstehende Fristen',
    backToSettings: 'Zurück zu Einstellungen',
    securityPrivacy: 'Sicherheit & Datenschutz',
    subscriptionDetails: 'Abonnement-Details',
    taxJurisdiction: 'Steuergerichtsbarkeit',
    language: 'Sprache',
    changeRegion: 'Region ändern',
    changeCountry: 'Land ändern',
    preArrivalEval: 'Vorab-Bewertung',
    calculateImpact: 'Auswirkung berechnen',
    reclaimableVat: 'Erstattungsfähige MwSt.',
    totalGross: 'Gesamt Brutto',
    confirmSave: 'Bestätigen & Speichern',
    saveExpense: 'Ausgabe speichern',
    merchant: 'Händler',
    amount: 'Betrag',
    date: 'Datum',
    country: 'Land',
    currency: 'Währung',
    processing: 'KI-Verarbeitung...',
    aiExtractionSuccess: 'KI-Extraktion erfolgreich. Bitte unten prüfen.',
    originalText: 'Originaltext',
    translatedText: 'Übersetzter Text',
  },
  PL: {
    dashboard: 'Panel',
    expenses: 'Wydatki',
    concierge: 'Konsjerż',
    reports: 'Raporty',
    settings: 'Ustawienia',
    scanReceipt: 'Skanuj paragon',
    evaluateTax: 'Oceń podatek',
    vatReclaimable: 'VAT do odzyskania',
    activeJurisdiction: 'Aktywna jurysdykcja',
    upcomingDeadlines: 'Nadchodzące terminy',
    backToSettings: 'Powrót do ustawień',
    securityPrivacy: 'Bezpieczeństwo i prywatność',
    subscriptionDetails: 'Szczegóły subskrypcji',
    taxJurisdiction: 'Jurysdykcja podatkowa',
    language: 'Język',
    changeRegion: 'Zmień region',
    changeCountry: 'Zmień kraj',
    preArrivalEval: 'Ocena przed przyjazdem',
    calculateImpact: 'Oblicz wpływ',
    reclaimableVat: 'VAT do odzyskania',
    totalGross: 'Suma brutto',
    confirmSave: 'Potwierdź i zapisz',
    saveExpense: 'Zapisz wydatek',
    merchant: 'Sprzedawca',
    amount: 'Kwota',
    date: 'Data',
    country: 'Kraj',
    currency: 'Waluta',
    processing: 'Przetwarzanie przez AI...',
    aiExtractionSuccess: 'Ekstrakcja AI zakończona sukcesem. Zweryfikuj poniżej.',
    originalText: 'Oryginalny tekst',
    translatedText: 'Przetłumaczony tekst',
  },
  SE: {
    dashboard: 'Översikt',
    expenses: 'Utgifter',
    concierge: 'Concierge',
    reports: 'Rapporter',
    settings: 'Inställningar',
    scanReceipt: 'Skanna kvitto',
    evaluateTax: 'Utvärdera skatt',
    vatReclaimable: 'Återbetalningsbar moms',
    activeJurisdiction: 'Aktiv jurisdiktion',
    upcomingDeadlines: 'Kommande deadlines',
    backToSettings: 'Tillbaka till inställningar',
    securityPrivacy: 'Säkerhet & Integritet',
    subscriptionDetails: 'Prenumerationsdetaljer',
    taxJurisdiction: 'Skattejurisdiktion',
    language: 'Språk',
    changeRegion: 'Ändra region',
    changeCountry: 'Ändra land',
    preArrivalEval: 'Utvärdering före ankomst',
    calculateImpact: 'Beräkna påverkan',
    reclaimableVat: 'Återbetalningsbar moms',
    totalGross: 'Total brutto',
    confirmSave: 'Bekräfta & Spara',
    saveExpense: 'Spara utgift',
    merchant: 'Handlare',
    amount: 'Belopp',
    date: 'Datum',
    country: 'Land',
    currency: 'Valuta',
    processing: 'Bearbetar med AI...',
    aiExtractionSuccess: 'AI-extraktion lyckades. Vänligen verifiera nedan.',
    originalText: 'Originaltext',
    translatedText: 'Översatt text',
  },
  FR: {
    dashboard: 'Tableau de bord',
    expenses: 'Dépenses',
    concierge: 'Concierge',
    reports: 'Rapports',
    settings: 'Paramètres',
    scanReceipt: 'Scanner le reçu',
    evaluateTax: 'Évaluer la taxe',
    vatReclaimable: 'TVA récupérable',
    activeJurisdiction: 'Juridiction active',
    upcomingDeadlines: 'Échéances à venir',
    backToSettings: 'Retour aux paramètres',
    securityPrivacy: 'Sécurité et confidentialité',
    subscriptionDetails: 'Détails de l\'abonnement',
    taxJurisdiction: 'Juridiction fiscale',
    language: 'Langue',
    changeRegion: 'Changer de région',
    changeCountry: 'Changer de pays',
    preArrivalEval: 'Évaluation avant l\'arrivée',
    calculateImpact: 'Calculer l\'impact',
    reclaimableVat: 'TVA récupérable',
    totalGross: 'Total brut',
    confirmSave: 'Confirmer et enregistrer',
    saveExpense: 'Enregistrer la dépense',
    merchant: 'Marchand',
    amount: 'Montant',
    date: 'Date',
    country: 'Pays',
    currency: 'Devise',
    processing: 'Traitement par l\'IA...',
    aiExtractionSuccess: 'Extraction par l\'IA réussie. Veuillez vérifier ci-dessous.',
    originalText: 'Texte original',
    translatedText: 'Texte traduit',
  },
};

export const REGIONS = [
  { id: 'uk_ireland', label: 'UK & Ireland', countries: ['UK'] },
  { id: 'dach', label: 'DACH (DE, AT, CH)', countries: ['DE'] },
  { id: 'nordics', label: 'Nordics', countries: ['SE'] },
  { id: 'eastern_europe', label: 'Eastern Europe', countries: ['PL'] },
  { id: 'western_europe', label: 'Western Europe', countries: ['FR'] },
];
