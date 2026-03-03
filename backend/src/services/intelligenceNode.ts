import { 
  IntelligenceContext, 
  DecisionOutput, 
  IntelligenceScore, 
  SalesSignal, 
  ProcurementSignal, 
  FinanceSignal, 
  LocalisationSignal, 
  ExternalSignal,
  BuyerSignal,
  SupplierSignal,
  OperationsSignal,
  IntelligenceOutputEnvelope,
  RailConstraintProfile
} from '../types/intelligence.types';
import { FeedbackSignal } from '../types/feedback.types';
import { FeedbackMapper } from './feedbackMapper';
import { PersistenceService } from './persistence.service'; // Added
// import { GovernanceEvent } from '../governance/governance.types'; // Removed

/**
 * TIER-0 INTELLIGENCE NODE (The Brain)
 * 
 * STRICT ARCHITECT MODE IMPLEMENTATION
 * 
 * ARCHITECTURE:
 * 1. INGESTION PIPELINE (Raw -> Clean)
 * 2. INTELLIGENCE ENGINES (Domain Specific Processing)
 * 3. DECISION COMPILER (Synthesis)
 * 4. OUTPUT GENERATION (Directives)
 */

export class IntelligenceNode {

  // --- 1. DATA INGESTION PIPELINE ---
  
  private static decisionStore: Map<string, DecisionOutput> = new Map();
  private static learningState: any = { MarketEngine: {}, RiskModel: {}, SupplierProfile: {} };
  private static supplierStore: Map<string, any> = new Map(); // For verification

  static {
    this.restoreMemory();
  }

  private static restoreMemory() {
    console.log('[Tier-0] Restoring Memory from Persistence Layer...');
    const snapshotMap = PersistenceService.restoreState();
    
    snapshotMap.forEach(snapshot => {
      if (snapshot.entity_type === 'DECISION_OUTPUT') {
        // Map by Trace ID for retrieval
        const traceId = snapshot.raw_payload.primaryGate?.meta?.source_trace_id;
        if (traceId) this.decisionStore.set(traceId, snapshot.raw_payload);
      }
      else if (snapshot.entity_type === 'LEARNING_STATE') {
        this.learningState = snapshot.raw_payload;
      }
      else if (snapshot.entity_type === 'SUPPLIER_PROFILE') {
        this.supplierStore.set(snapshot.raw_payload.id, snapshot.raw_payload);
      }
    });
    console.log(`[Tier-0] Memory Restored: ${this.decisionStore.size} Decisions, ${this.supplierStore.size} Suppliers.`);
  }

  // Allow CRMs to write raw data (Write-Only Interface)
  public static async ingestRawData(type: string, payload: any, source: string): Promise<void> {
    
    // [STRICT] Ephemeral Object Guard
    // RFQs and Quotes must NEVER be persisted to disk.
    if (type.toUpperCase().includes('RFQ') || type.toUpperCase().includes('QUOTE')) {
       console.warn(`[Tier-0] Blocked persistence attempt for Ephemeral Object: ${type} from ${source}`);
       return; 
    }

    PersistenceService.persist({
      entity_id: payload.id || `GEN-${Date.now()}`,
      entity_type: type as any,
      raw_payload: payload,
      source_system: source,
      created_at: new Date().toISOString(),
      version_id: `VER-${Date.now()}`
    });
    
    // Update Tier-0 Memory (Sovereign View)
    if (type === 'SUPPLIER_PROFILE') {
       this.supplierStore.set(payload.id, payload);
    }
  }

  // Verification Helper
  public static getStoredSupplier(id: string): any {
    return this.supplierStore.get(id);
  }

  public static getAllSuppliers(): any[] {
    return Array.from(this.supplierStore.values());
  }

  public static async getDecision(contextId: string): Promise<DecisionOutput | null> {
    return this.decisionStore.get(contextId) || null;
  }

  public static async processTransaction(rawInputs: any): Promise<DecisionOutput> {
    console.log(`[Tier-0] Ingesting Transaction: ${rawInputs.traceId}`);

    // A. NORMALIZE
    const normalizedData = this.normalizeData(rawInputs);

    // B. VALIDATE
    const isValid = this.validateData(normalizedData);
    if (!isValid) {
      throw new Error('[Tier-0] Data Validation Failed: Incomplete or Invalid Context');
    }

    // C. EXECUTE ENGINES & COMPILE
    const output = await this.compileDecisions(normalizedData as IntelligenceContext);
    
    // PERSIST (Append-Only)
    this.decisionStore.set(normalizedData.traceId!, output);
    
    PersistenceService.persist({
      entity_id: output.primaryGate.meta.output_id,
      entity_type: 'DECISION_OUTPUT',
      raw_payload: output,
      source_system: 'Tier-0',
      created_at: new Date().toISOString(),
      version_id: `VER-${Date.now()}`
    });
    
    return output;
  }

  private static normalizeData(raw: any): Partial<IntelligenceContext> {
    console.log('[Tier-0] Normalizing Data (Units, Currency, Language)...');
    return raw; 
  }

  private static validateData(ctx: Partial<IntelligenceContext>): boolean {
    if (!ctx.traceId || !ctx.sales || !ctx.localisation) {
      console.warn('[Tier-0] Validation Error: Missing critical signals');
      return false;
    }
    console.log('[Tier-0] Data Validation Passed: Certified Data Pool Ready');
    return true;
  }

  // --- 2. INTELLIGENCE ENGINES ---

  private static async compileDecisions(ctx: IntelligenceContext): Promise<DecisionOutput> {
    
    // EXECUTE PARALLEL ENGINES
    const marketScore = this.runMarketDemandEngine(ctx.sales, ctx.buyer, ctx.external);
    const supplierScore = this.runSupplierIntelligenceEngine(ctx.suppliers, ctx.operations);
    const marginScore = this.runCostMarginEngine(ctx.sales, ctx.procurement, ctx.finance);
    const riskScore = this.runRiskComplianceEngine(ctx.finance, ctx.external, ctx.localisation, ctx.suppliers);
    const localisationScore = this.runLocalisationRuleEngine(ctx.localisation);

    const scores: IntelligenceScore = {
      commercialViability: marketScore, // Mapped from Market Engine
      operationalFeasibility: supplierScore, // Mapped from Supplier Engine
      financialHealth: marginScore, // Mapped from Cost/Margin Engine
      riskIndex: riskScore,
      complianceConfidence: localisationScore
    };

    // COMPILE & DECIDE
    return this.generateDirectives(scores, ctx);
  }

  // --- RULE: PAYMENT RAIL EFFECTIVENESS CHECK ---
  private static evaluatePaymentRails(
    gate: 'GO' | 'NO-GO' | 'CONDITIONAL', 
    railName: string, 
    constraints: RailConstraintProfile, 
    ctx: IntelligenceContext
  ): boolean {
    // 1. DecisionGateOutput.gate == GO
    if (gate !== 'GO') return false;

    // 2. RailConstraintProfile.status == ACTIVE (If status field exists, mainly for Digital Assets)
    if (constraints.status && constraints.status !== 'ACTIVE') return false;

    // 3. Jurisdiction permits the rail (allowed_countries)
    // If allowed_countries is defined, current jurisdiction MUST be in it
    if (constraints.allowed_countries && constraints.allowed_countries.length > 0) {
      if (!constraints.allowed_countries.includes(ctx.localisation.countryCode)) return false;
    }
    // Also check prohibited jurisdictions if any
    // (Implied by standard sanctions check, but explicit here if needed)

    // 4. Use-case is explicitly allowed (allowed_use)
    // If allowed_use is defined, current Sales useCase MUST be in it
    if (constraints.allowed_use && constraints.allowed_use.length > 0) {
      if (!constraints.allowed_use.includes(ctx.sales.useCase)) return false;
    }
    
    // Check prohibited uses
    if (constraints.prohibited_for && constraints.prohibited_for.includes(ctx.sales.useCase)) return false;

    return true;
  }

  // ENG1: Market & Demand Engine
  private static runMarketDemandEngine(sales: SalesSignal, buyer: BuyerSignal, external: ExternalSignal): number {
    let score = 50;
    if (sales.urgency === 'High') score += 20;
    if (buyer.creditScore > 80) score += 20;
    if (external.commodityTrend === 'Bullish') score += 10;
    return Math.max(0, Math.min(100, score));
  }

  // ENG2: Supplier Intelligence Engine
  private static runSupplierIntelligenceEngine(suppliers: SupplierSignal[], ops: OperationsSignal): number {
    if (suppliers.length === 0) return 0;
    
    const bestQa = Math.max(...suppliers.map(s => s.qaPassRate));
    let score = bestQa;
    
    if (ops.logisticsRouteStatus === 'Congested') score -= 15;
    if (ops.logisticsRouteStatus === 'Blocked') score -= 50;

    return Math.max(0, Math.min(100, score));
  }

  // ENG3: Cost & Margin Engine
  private static runCostMarginEngine(sales: SalesSignal, procurement: ProcurementSignal, finance: FinanceSignal): number {
    let score = 50;
    // Real margin calc would happen here
    if (procurement.negotiatedMargin > 0.15) score += 30;
    if (finance.cashflowStatus === 'Negative') score -= 40;
    return Math.max(0, Math.min(100, score));
  }

  // ENG4: Risk & Compliance Engine
  private static runRiskComplianceEngine(finance: FinanceSignal, external: ExternalSignal, loc: LocalisationSignal, suppliers: SupplierSignal[]): number {
    let risk = 0;
    risk += loc.tradeBarrierScore * 0.3;
    risk += external.geopoliticalAlerts.length * 15;
    if (finance.sanctionsMatch) risk = 100;
    return Math.max(0, Math.min(100, risk));
  }

  // ENG5: Localisation Rule Engine
  private static runLocalisationRuleEngine(loc: LocalisationSignal): number {
    let confidence = 100;
    if (loc.complianceComplexity === 'High') confidence -= 20;
    if (loc.legalReviewRequired) confidence -= 10;
    return Math.max(0, Math.min(100, confidence));
  }

  // --- 3. DECISION COMPILER (Synthesis) ---

  private static createEnvelope(type: string, ctx: IntelligenceContext): IntelligenceOutputEnvelope {
    return {
      output_id: `OUT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      output_type: type,
      version: '1.0',
      issued_at_utc: new Date().toISOString(),
      expires_at_utc: new Date(Date.now() + 3600 * 1000).toISOString(),
      jurisdiction_code: ctx.localisation.countryCode,
      currency_code: 'USD', 
      language_code: 'en',
      confidence_band: 'HIGH',
      source_trace_id: ctx.traceId,
      decision_context_id: ctx.traceId
    };
  }

  private static generateDirectives(scores: IntelligenceScore, ctx: IntelligenceContext): DecisionOutput {
    let gateAction: 'GO' | 'NO-GO' | 'CONDITIONAL' = 'GO';
    const blockingFactors: string[] = [];

    // D1 Logic
    if (scores.riskIndex > 80) { 
      gateAction = 'NO-GO'; 
      blockingFactors.push('CRITICAL_RISK');
      
      // Emit Flag to Governance (Async)
      import('../governance/governance.service').then(({ GovernanceService }) => {
        GovernanceService.receiveIntelligenceFlag({
          contextId: ctx.traceId!,
          reason: `Critical Risk Score: ${scores.riskIndex}`,
          severity: 'HIGH'
        }).catch(err => console.error('[Tier-0] Failed to emit flag:', err));
      });
    }
    if (scores.financialHealth < 30) { gateAction = 'NO-GO'; blockingFactors.push('FINANCIAL_HEALTH'); }
    if (ctx.finance.sanctionsMatch) { gateAction = 'NO-GO'; blockingFactors.push('SANCTIONS'); }
    
    // D2 Logic
    const validSuppliers = ctx.suppliers
      .filter(s => s.qaPassRate > 80 && s.liveCapacity >= ctx.sales.volume)
      .map(s => s.supplierId);
      
    if (validSuppliers.length === 0 && gateAction !== 'NO-GO') {
        gateAction = 'NO-GO';
        blockingFactors.push('NO_SUPPLIERS');
    }

    // D5 Logic
    const isCompliant = scores.complianceConfidence > 70;
    if (!isCompliant && gateAction === 'GO') {
        gateAction = 'NO-GO'; // Strict Mode
        blockingFactors.push('COMPLIANCE_FAIL');
    }

    // D4: Payment Structure Logic
    const rawRails = ['SWIFT', 'SEPA', 'PAYPAL', 'CARD', 'DIGITAL_ASSET'];
    const rawConstraints: Record<string, RailConstraintProfile> = {
        "PAYPAL": { 
          "allowed_countries": ["UK","EU","US"], 
          "max_transaction_value": 50000, 
          "allowed_use": ["SAMPLES","SMALL_ORDERS","FEES"], 
          "chargeback_risk": "HIGH", 
          "settlement_delay_days": 3, 
          "kyc_required": true 
        }, 
        "CARD": { 
          "allowed_use": ["SAMPLES","FEES"], 
          "prohibited_for": ["BULK_TRADE"], 
          "chargeback_risk": "VERY_HIGH" 
        },
        "DIGITAL_ASSET": { 
          "status": "CONDITIONAL", 
          "allowed_assets": ["USDT","USDC"], 
          "allowed_use": ["INTERNAL_SETTLEMENT","INTERCO_JV"], 
          "prohibited_for": ["PUBLIC_TRADE","SANCTIONED_JURISDICTIONS"], 
          "compliance_requirements": [ 
            "WALLET_KYC", 
            "ONCHAIN_TRACEABILITY", 
            "COUNTRY_LEGAL_CLEARANCE" 
          ], 
          "governance_approval_required": true 
        }
    };

    // Filter Rails based on 4-Rule Check
    const effectiveRails = rawRails.filter(rail => {
      const constraint = rawConstraints[rail];
      // If no constraint defined, assume allowed (e.g. SWIFT/SEPA default)
      if (!constraint) return true; 
      return this.evaluatePaymentRails(gateAction, rail, constraint, ctx);
    });

    return {
      // D1: Primary Gate
      primaryGate: {
        meta: this.createEnvelope('DECISION_GATE', ctx),
        gate: gateAction,
        reason_code: blockingFactors.length > 0 ? blockingFactors[0] as any : 'CLEARED',
        blocking_factors: blockingFactors,
        conditions_required: [],
        next_allowed_actions: gateAction === 'GO' ? ['ISSUE_RFQ', 'REQUEST_SAMPLE'] : []
      },

      // D2: Approved Entities
      supplierEntities: {
        meta: this.createEnvelope('APPROVED_ENTITIES', ctx),
        entity_type: 'SUPPLIER',
        approved_ids: validSuppliers,
        rejected_ids: ctx.suppliers.filter(s => !validSuppliers.includes(s.supplierId)).map(s => s.supplierId),
        rationale_by_id: {}, // Stub
        selection_policy: 'BLENDED'
      },

      // D5: Risk & Compliance
      riskCompliance: {
        meta: this.createEnvelope('RISK_COMPLIANCE', ctx),
        compliance_status: isCompliant ? 'CLEAR' : 'BLOCKED',
        risk_rating: scores.riskIndex > 80 ? 'CRITICAL' : scores.riskIndex > 50 ? 'HIGH' : 'LOW',
        sanctions_flags: ctx.finance.sanctionsMatch ? ['SANCTIONS_HIT'] : [],
        required_certifications: ctx.localisation.requiredCertifications,
        mandatory_controls: ['Visual Inspection'],
        blocked_reasons: blockingFactors
      },

      // D4: Payment Structure
      paymentStructure: {
        meta: this.createEnvelope('PAYMENT_STRUCTURE', ctx),
        allowed_instruments: scores.riskIndex > 60 ? ['LC', 'ESCROW'] : ['TT', 'CREDIT'],
        allowed_payment_rails: effectiveRails,
        rail_constraints: rawConstraints,
        max_credit_days: 30,
        exposure_limit: 50000,
        settlement_currency: 'USD',
        receiving_entity_type: 'CORPORATE_BENEFICIARY',
        compliance_mode: 'STRICT_KYB'
      },

      // D6: Localisation Binding
      localisationBinding: {
        meta: this.createEnvelope('LOCALISATION_BINDING', ctx),
        governing_law: 'UK Common Law', // Stub
        dispute_forum: 'London Arbitration',
        mandatory_documents: ['Commercial Invoice', 'Packing List'],
        labeling_requirements: ['CE Mark'],
        tax_duty_rules_refs: ['HMRC-2024'],
        customs_rules_refs: ['TARIC-99'],
        banking_norms_refs: ['UCP600']
      },

      // D3: Pricing (Legacy)
      pricingCorridor: {
        recommendedMinPrice: ctx.sales.targetPrice * 0.95,
        recommendedMaxPrice: ctx.sales.targetPrice * 1.15,
        targetMarginPercent: 0.15,
        currency: 'USD',
        validityPeriodHours: 24
      }
    };
  }

  // --- 4. GOVERNANCE INTERFACE ---

  // [ROLLBACK] Governance Override Interface Removed. 
  // Intelligence is sovereign.

  // --- 5. FEEDBACK LOOP (Learning) ---
  
  // Tier-4 Governance Flag Handling (Future)
  private static handleGovernanceFlags(signal: FeedbackSignal): void {
    if (signal.outcome.exceptionType === 'OVERRIDE') {
      console.log(`[Tier-0] Tier-4 Governance Flag Received: ${signal.outcome.severity}`);
      // No automatic execution (strict rule)
    }
  }

  public static async ingestFeedback(signal: FeedbackSignal): Promise<void> {
    console.log(`[Tier-0] Ingesting Feedback Signal: ${signal.feedbackId}`);
    console.log(`[Tier-0] Source: ${signal.sourceTier}, Success: ${signal.outcome.success}`);
    
    // 1. Governance Checks
    this.handleGovernanceFlags(signal);

    // 2. Map to Engine Updates
    const updates = FeedbackMapper.mapToEngineUpdates(signal);
    console.log(`[Tier-0] Applying ${updates.length} Engine Updates`);

    // 3. Apply Updates (Persisted State)
    updates.forEach(update => {
      console.log(`   -> Updating ${update.target}: ${update.adjustment.metric} += ${update.adjustment.delta}`);
      
      // Update Learning State
      if (!this.learningState[update.target]) {
        this.learningState[update.target] = {};
      }
      const targetState = this.learningState[update.target];
      const currentVal = targetState[update.adjustment.metric] || 0; // Default to 0 if new
      targetState[update.adjustment.metric] = currentVal + update.adjustment.delta;
    });

    // Persist Learning State (Append-Only)
    PersistenceService.persist({
      entity_id: 'GLOBAL_LEARNING_STATE', // Singleton for now, or per engine
      entity_type: 'LEARNING_STATE',
      raw_payload: this.learningState,
      source_system: 'Tier-0',
      created_at: new Date().toISOString(),
      version_id: `VER-${Date.now()}`
    });
  }
}
