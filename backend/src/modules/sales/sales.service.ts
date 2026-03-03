import { SalesSignal, STUB_SALES_SIGNAL } from '../../types/intelligence.types';

/**
 * SALES CRM MODULE - STRICT INPUT MODE
 * 
 * Role: Data Collection & Opportunity Management
 * Constraint: NO EXECUTION RIGHTS. Feeds Tier-0 Intelligence Only.
 */

// --- DELIVERABLE 2: SALES DATA OBJECTS ---

export interface CustomerProfile {
  customerId: string;
  segment: 'Retail' | 'Wholesale' | 'Distributor';
  creditRating: 'A' | 'B' | 'C'; // Internal rating
  region: string;
}

export interface SalesOpportunity {
  opportunityId: string;
  customerId: string;
  productSku: string;
  requestedVolume: number;
  targetPrice: number;
  deliveryDate: string;
  stage: 'Lead' | 'Qualified' | 'Proposal' | 'Negotiation';
  winProbability: number; // 0-100
  destinationCountry: string; // Mapped to jurisdiction
  intendedUse: 'SAMPLES' | 'BULK_TRADE' | 'INTERNAL_SETTLEMENT' | 'FEES';
}

// --- DELIVERABLE 1: SALES CRM MODULES ---

export class SalesCRMService {
  private opportunities: Map<string, SalesOpportunity> = new Map();
  private customers: Map<string, CustomerProfile> = new Map();

  constructor() {
    this.seedMockData();
  }

  // --- INTERNAL CRM FUNCTIONS (CRUD ONLY) ---

  public createOpportunity(opp: SalesOpportunity): void {
    this.opportunities.set(opp.opportunityId, opp);
    console.log(`[SalesCRM] Opportunity Created: ${opp.opportunityId}`);
  }

  public getOpportunity(id: string): SalesOpportunity | undefined {
    return this.opportunities.get(id);
  }

  // --- DELIVERABLE 3: SALES -> INTELLIGENCE INGESTION CONTRACT ---
  
  /**
   * Transforms internal CRM data into the strict Tier-0 SalesSignal.
   * Does NOT trigger Intelligence. Only returns data when polled.
   */
  public getIntelligenceSignal(opportunityId: string): SalesSignal {
    const opp = this.opportunities.get(opportunityId);
    if (!opp) {
      console.warn(`[SalesCRM] Opportunity ${opportunityId} not found. Returning STUB.`);
      return STUB_SALES_SIGNAL;
    }

    const customer = this.customers.get(opp.customerId);

    return {
      opportunityId: opp.opportunityId,
      demandType: opp.requestedVolume > 10000 ? 'Contract' : 'Spot',
      productCategory: 'Commodity', // Stub derivation
      volume: opp.requestedVolume,
      targetPrice: opp.targetPrice,
      urgency: this.calculateUrgency(opp, customer),
      jurisdiction: opp.destinationCountry,
      useCase: opp.intendedUse
    };
  }

  // Helper to map CRM state to Signal urgency
  private calculateUrgency(opp: SalesOpportunity, cust?: CustomerProfile): 'High' | 'Medium' | 'Low' {
    if (opp.stage === 'Negotiation') return 'High';
    if (cust?.segment === 'Distributor') return 'Medium';
    return 'Low';
  }

  // --- DELIVERABLE 4: EXPLICIT NON-RESPONSIBILITIES ---
  
  /*
   * PROHIBITED METHODS (Do Not Implement):
   * 
   * public approveQuote() { throw new Error("Sales CRM cannot approve quotes. Use Intelligence."); }
   * public signContract() { throw new Error("Sales CRM cannot sign contracts. Use Legal."); }
   * public promiseDelivery() { throw new Error("Sales CRM cannot promise inventory. Use Logistics."); }
   */

  private seedMockData() {
    // Stub
  }
}
