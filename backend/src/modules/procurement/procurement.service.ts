import { IntelligenceNode } from '../../services/intelligenceNode';

// --- Interfaces ---

export interface SupplierProfile {
  id: string;
  name: string;
  country: string;
  categories: string[]; // e.g., ["Raw Materials", "Packaging"]
  complianceStatus: 'Pending' | 'Verified' | 'Rejected';
  riskScore: number; // 0-100 (High is bad)
  performanceRating: number; // 0-5
}

export interface RFQ {
  id: string;
  title: string;
  items: Array<{ sku: string; quantity: number }>;
  targetPrice?: number;
  status: 'Draft' | 'Open' | 'Closed' | 'Awarded';
  suppliersInvited: string[]; // Supplier IDs
  quotesReceived: Quote[];
}

export interface Quote {
  supplierId: string;
  price: number;
  incoterms: string;
  deliveryDate: string;
  status: 'Pending' | 'Shortlisted' | 'Rejected' | 'Accepted';
}

// --- Service ---

export class ProcurementService {
  // private suppliers: Map<string, SupplierProfile> = PersistenceService.loadSuppliers(); // DEPRECATED: Use Tier-0
  private rfqs: Map<string, RFQ> = new Map();

  constructor() {
    // Only seed if empty (First Run check against Tier-0)
    const storedSuppliers = IntelligenceNode.getAllSuppliers();
    if (storedSuppliers.length === 0) {
      this.seedMockData();
    }
  }

  // --- 1. Supplier Onboarding ---
  
  public async onboardSupplier(profile: Omit<SupplierProfile, 'id' | 'riskScore' | 'performanceRating'>): Promise<SupplierProfile> {
    const id = `SUP-${Math.floor(Math.random() * 10000)}`;
    
    // CRM must not decide risk. Risk is assessed solely by Tier-0 Intelligence.
    const riskScore = 0;
    // const riskStatus = 'PENDING_INTELLIGENCE'; // (If needed in future schema)

    const newSupplier: SupplierProfile = {
      ...profile,
      id,
      riskScore,
      performanceRating: 3.0, // Neutral start
      complianceStatus: 'Pending'
    };

    // FIX-2: CRM is Write-Only. Ingest to Tier-0.
    await IntelligenceNode.ingestRawData('SUPPLIER_PROFILE', newSupplier, 'ProcurementCRM');

    return newSupplier;
  }

  // --- 2. RFQ Management ---

  public async createRFQ(rfqData: Omit<RFQ, 'id' | 'status' | 'quotesReceived'>): Promise<RFQ> {
    const id = `RFQ-${Math.floor(Math.random() * 10000)}`;
    
    const newRFQ: RFQ = {
      ...rfqData,
      id,
      status: 'Open',
      quotesReceived: []
    };

    this.rfqs.set(id, newRFQ);

    // [STRICT] RFQs are Ephemeral Operational Objects.
    // MUST NOT be persisted to disk.
    // MUST NOT trigger Tier-0 Intelligence.
    // Dies with session.

    return newRFQ;
  }

  public async submitQuote(rfqId: string, quote: Quote): Promise<RFQ> {
    const rfq = this.rfqs.get(rfqId);
    if (!rfq) throw new Error('RFQ not found');

    rfq.quotesReceived.push(quote);
    
    // [STRICT] Quotes are Ephemeral.
    // No persistence, no intelligence triggers.

    return rfq;
  }

  // --- 3. Intelligence & Scoring ---

  // FIX-1: REMOVED calculateInitialRisk() to enforce Tier-0 Sovereignty.
  // CRMs are data collectors only. They do not evaluate risk.

  // --- Helper: Get Procurement Map (Legacy Support) ---
  public getProcurementMap(countryCode: string) {
    const upper = countryCode.trim().toUpperCase();
    const allSuppliers = IntelligenceNode.getAllSuppliers() as SupplierProfile[];
    
    return {
      countryCode: upper,
      suppliers: allSuppliers.filter(s => s.country === upper),
      activeRFQs: Array.from(this.rfqs.values()).length
    };
  }

  private seedMockData() {
    this.onboardSupplier({
      name: 'Global Sugar Corp',
      country: 'BR',
      categories: ['Raw Materials'],
      complianceStatus: 'Verified'
    });
    this.onboardSupplier({
      name: 'Sime Darby',
      country: 'MY',
      categories: ['Palm Oil'],
      complianceStatus: 'Verified'
    });
  }
}

export const procurementService = new ProcurementService();
