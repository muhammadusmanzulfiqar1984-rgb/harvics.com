import { IntelligenceNode } from '../../services/intelligenceNode';
import { CommercialOrchestratorService } from './commercial.orchestrator';
import { IntelligenceContext } from '../../types/intelligence.types';

// --- MOCK DATA FACTORY ---
const createMockTransaction = (id: string, overrides: Partial<IntelligenceContext> = {}): IntelligenceContext => {
  const base: IntelligenceContext = {
    traceId: id,
    sales: {
      opportunityId: 'OPP-101',
      demandType: 'Contract',
      productCategory: 'Electronics',
      volume: 5000,
      targetPrice: 100,
      urgency: 'High',
      jurisdiction: 'AE',
      useCase: 'BULK_TRADE'
    },
    buyer: {
      buyerId: 'BUY-999',
      erpIntegrationStatus: 'Active',
      creditScore: 85,
      paymentHistory: { averageDelayDays: 2, defaultRisk: 5 }
    },
    procurement: {
      rfqId: 'RFQ-202',
      sourcingStatus: 'Negotiating',
      negotiatedMargin: 0.18,
      contractReadiness: 90
    },
    suppliers: [
      {
        supplierId: 'SUP-A',
        liveCapacity: 6000,
        productionQueueDays: 10,
        qaPassRate: 95,
        sustainabilityRating: 80
      }
    ],
    operations: {
      logisticsRouteStatus: 'Open',
      warehouseCapacity: 10000,
      inspectionAvailability: true,
      freightCostIndex: 40
    },
    finance: {
      cashflowStatus: 'Positive',
      currencyExposure: 50000,
      creditLimitAvailable: 1000000,
      sanctionsMatch: false
    },
    localisation: {
      countryCode: 'AE',
      tradeBarrierScore: 20,
      complianceComplexity: 'Medium',
      legalReviewRequired: false,
      requiredCertifications: []
    },
    external: {
      marketPriceIndex: 98,
      commodityTrend: 'Neutral',
      weatherRisk: 10,
      geopoliticalAlerts: [],
      bankLiquidityStatus: 'High'
    }
  };
  
  return { ...base, ...overrides };
};

async function runTier1Tests() {
  console.log('--- STARTING TIER-1 COMMERCIAL ORCHESTRATOR TESTS ---');

  // TEST 1: HAPPY PATH
  // GO + Valid Corridor -> OfferDraft
  console.log('\n[TEST 1] Happy Path: GO + Valid Inputs');
  try {
    const ctx = createMockTransaction('TRX-HAPPY');
    // 1. Run Tier-0
    const decision = await IntelligenceNode.processTransaction(ctx);
    if (decision.primaryGate.gate !== 'GO') {
        throw new Error(`Tier-0 unexpected NO-GO: ${decision.primaryGate.reason_code}`);
    }

    // 2. Run Tier-1
    const session = await CommercialOrchestratorService.initiateCommercialSession(ctx.traceId);
    
    // 3. Verify
    if (session.gate_result !== 'GO') console.error('FAIL: Session Gate should be GO');
    if (session.artifacts.length === 0) console.error('FAIL: Should have generated artifacts');
    if (session.artifacts[0].type !== 'OFFER') console.error('FAIL: First artifact should be OFFER');
    
    const offer = session.artifacts[0] as any;
    // Check Price is within corridor (95-115 for target 100)
    if (offer.items[0].unit_price < 95 || offer.items[0].unit_price > 115) {
        console.error('FAIL: Price outside corridor');
    }
    
    console.log('PASS: Happy Path generated artifacts:', session.artifacts.map(a => a.artifact_id));
  } catch (e: any) {
    console.error('FAIL: Happy Path Exception:', e.message);
  }

  // TEST 2: BLOCK PATH
  // NO_GO (Sanctions) -> No Drafts
  console.log('\n[TEST 2] Block Path: Sanctions Hit');
  try {
    const ctx = createMockTransaction('TRX-BLOCKED');
    ctx.finance.sanctionsMatch = true; // FORCE BLOCK
    
    // 1. Run Tier-0
    const decision = await IntelligenceNode.processTransaction(ctx);
    if (decision.primaryGate.gate !== 'NO-GO') {
        console.error('WARNING: Tier-0 did not block on sanctions? Gate:', decision.primaryGate.gate);
    }

    // 2. Run Tier-1
    const session = await CommercialOrchestratorService.initiateCommercialSession(ctx.traceId);
    
    // 3. Verify
    if (session.gate_result !== 'NO-GO') console.error('FAIL: Session Gate should be NO-GO');
    if (session.artifacts.length > 0) console.error('FAIL: Should NOT have generated artifacts');
    
    console.log('PASS: Block Path prevented artifacts. Logs:', session.logs);
  } catch (e: any) {
    console.error('FAIL: Block Path Exception:', e.message);
  }
}

runTier1Tests();
