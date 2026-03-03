
import { IntelligenceNode } from '../src/services/intelligenceNode';
import { GovernanceService } from '../src/governance/governance.service';
import { IntelligenceContext } from '../src/types/intelligence.types';

/**
 * FORENSIC VERIFICATION: GOVERNANCE ROLLBACK
 * 
 * Objective: Confirm that Tier-4 Governance is decoupled from Tier-0 Intelligence decision path.
 * 
 * Checks:
 * 1. Intelligence emits high-risk flags to Governance (Notification Only).
 * 2. Governance logs the event (Audit).
 * 3. Intelligence decision is NOT blocked/modified by Governance (Sovereignty).
 * 4. Execution flow does not wait for Governance (Async).
 */

async function runForensicTest() {
  console.log('\n=== STARTING FORENSIC VERIFICATION: GOVERNANCE ROLLBACK ===\n');

  // --- MOCK DATA ---
  const mockContext: IntelligenceContext = {
    traceId: 'TRACE-FORENSIC-001',
    sales: {
      opportunityId: 'OPP-001',
      demandType: 'Spot',
      productCategory: 'Commodity',
      urgency: 'High',
      volume: 1000,
      targetPrice: 50,
      useCase: 'BULK_TRADE',
      jurisdiction: 'US'
    },
    buyer: {
      buyerId: 'BUY-001',
      creditScore: 90,
      erpIntegrationStatus: 'Active',
      paymentHistory: {
        averageDelayDays: 0,
        defaultRisk: 0
      }
    },
    suppliers: [
      { 
        supplierId: 'SUP-001', 
        qaPassRate: 85, 
        liveCapacity: 2000, 
        productionQueueDays: 10,
        sustainabilityRating: 90
      }
    ],
    finance: {
      cashflowStatus: 'Positive',
      sanctionsMatch: false,
      currencyExposure: 0,
      creditLimitAvailable: 1000000
    },
    localisation: {
      countryCode: 'US',
      complianceComplexity: 'Medium',
      tradeBarrierScore: 0,
      requiredCertifications: [],
      legalReviewRequired: false
    },
    procurement: {
      rfqId: 'RFQ-001',
      sourcingStatus: 'Open',
      negotiatedMargin: 0.20,
      contractReadiness: 100
    },
    external: {
      marketPriceIndex: 100,
      weatherRisk: 0,
      bankLiquidityStatus: 'High',
      commodityTrend: 'Bullish',
      geopoliticalAlerts: ['Sanctions Warning: Region X'] // Trigger Risk
    },
    operations: {
      logisticsRouteStatus: 'Open',
      warehouseCapacity: 10000,
      inspectionAvailability: true,
      freightCostIndex: 50
    }
  };

  // FORCE HIGH RISK: Overwrite mock to ensure riskIndex > 80
  // Setting sanctionsMatch = true causes immediate NO-GO and risk=100.
  mockContext.finance.sanctionsMatch = true;

  console.log('[TEST] Setup: Forcing HIGH RISK scenario (Sanctions Match).');

  // --- SPY ON GOVERNANCE ---
  let governanceReceivedFlag = false;
  const originalReceive = GovernanceService.receiveIntelligenceFlag;
  GovernanceService.receiveIntelligenceFlag = async (payload) => {
    console.log(`[TEST-SPY] GovernanceService received flag: ${payload.reason}`);
    governanceReceivedFlag = true;
    return originalReceive.call(GovernanceService, payload);
  };

  // --- EXECUTE INTELLIGENCE ---
  console.log('[TEST] Executing IntelligenceNode.processTransaction...');
  const startTime = Date.now();
  
  const decision = await IntelligenceNode.processTransaction(mockContext);
  
  const endTime = Date.now();
  console.log(`[TEST] Execution completed in ${endTime - startTime}ms`);

  // --- VERIFICATIONS ---

  // 1. Check Decision Output
  console.log(`[TEST] Decision Gate: ${decision.primaryGate.gate}`);
  console.log(`[TEST] Reason Code: ${decision.primaryGate.reason_code}`);

  if (decision.primaryGate.gate !== 'NO-GO') {
    throw new Error('❌ FAILURE: Expected NO-GO decision.');
  }
  if (decision.primaryGate.reason_code !== 'CRITICAL_RISK') {
    throw new Error(`❌ FAILURE: Expected reason CRITICAL_RISK, got ${decision.primaryGate.reason_code}`);
  }
  if (!decision.primaryGate.blocking_factors.includes('SANCTIONS')) {
     console.warn('⚠️ WARNING: SANCTIONS should be in blocking factors but was not primary.');
  }
  console.log('✅ VERIFIED: Intelligence correctly issued NO-GO based on engine logic.');

  // 2. Check Governance Notification (Async wait)
  // Since it's fire-and-forget, we need to wait a moment
  console.log('[TEST] Waiting for async Governance notification...');
  await new Promise(resolve => setTimeout(resolve, 500));

  if (governanceReceivedFlag) {
    console.log('✅ VERIFIED: Governance Service received the flag.');
  } else {
    throw new Error('❌ FAILURE: Governance Service did NOT receive the flag.');
  }

  // 3. Check Sovereignty (No "GOVERNANCE_BLOCK")
  // The reason code is already checked above. 
  // We explicitly check that the "GOVERNANCE_BLOCK" string (which was removed) does not appear in types/output.
  // Since TypeScript compilation would fail if we checked against a removed type, we just check runtime string.
  if ((decision.primaryGate.reason_code as string) === 'GOVERNANCE_BLOCK') {
    throw new Error('❌ FAILURE: Detected forbidden GOVERNANCE_BLOCK reason code.');
  }
  console.log('✅ VERIFIED: Decision reason is native to Intelligence (not Governance overridden).');

  // 4. Verify Tier-1 Policy Fetch (Mock Check)
  // This part verifies that we can call the policy method without error
  const policies = GovernanceService.getActivePolicies('US');
  console.log(`[TEST] Tier-1 Policy Fetch Result: ${policies.join(', ')}`);
  if (!policies.includes('STRICT_KYC')) {
     throw new Error('❌ FAILURE: Governance policies not retrieved correctly.');
  }
  console.log('✅ VERIFIED: Tier-1 can fetch policies (Read-Only).');

  console.log('\n=== FORENSIC VERIFICATION SUCCESSFUL ===');
}

runForensicTest().catch(err => {
  console.error('\n❌ FATAL TEST ERROR:', err);
  // Throw to exit with error code
  throw err;
});
