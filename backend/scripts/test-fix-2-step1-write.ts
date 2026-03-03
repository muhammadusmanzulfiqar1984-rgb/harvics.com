
import { ProcurementService } from '../src/modules/procurement/procurement.service';
import { IntelligenceNode } from '../src/services/intelligenceNode';
import { FeedbackMapper } from '../src/services/feedbackMapper';
import { FeedbackSignal } from '../src/types/feedback.types';
import * as fs from 'fs';
import * as path from 'path';

// Force clear data for clean test
const DATA_DIR = path.join(__dirname, '../data');
if (fs.existsSync(DATA_DIR)) {
  fs.rmSync(DATA_DIR, { recursive: true, force: true });
}

async function runStep1() {
  console.log('--- STEP 1: GENERATING STATE ---');

  // 1. Supplier Profile
  const procurement = new ProcurementService();
  const supplier = await procurement.onboardSupplier({
    name: 'Persistence Test Corp',
    country: 'JP',
    categories: ['Robotics'],
    complianceStatus: 'Pending'
  });
  console.log(`[Write] Created Supplier: ${supplier.id}`);

  // 2. Intelligence Decision
  const ctx = {
    traceId: 'TRX-PERSIST-001',
    sales: { opportunityId: 'OPP-1', urgency: 'High' },
    localisation: { countryCode: 'JP' }
    // ... minimal other fields needed for validation to pass
  };
  
  // Hack: minimal mock context that passes validation
  const fullCtx: any = {
    ...ctx,
    buyer: { creditScore: 90 },
    procurement: { negotiatedMargin: 0.2 },
    suppliers: [],
    operations: { logisticsRouteStatus: 'Open' },
    finance: { cashflowStatus: 'Positive', sanctionsMatch: false },
    external: { geopoliticalAlerts: [] }
  };

  const decision = await IntelligenceNode.processTransaction(fullCtx);
  console.log(`[Write] Created Decision: ${decision.primaryGate.meta.output_id}`);

  // 3. Feedback (Learning State)
  const feedback: FeedbackSignal = {
    feedbackId: 'FB-001',
    originalTraceId: 'TRX-PERSIST-001',
    decisionId: decision.primaryGate.meta.output_id,
    timestamp: new Date().toISOString(),
    sourceTier: 'Tier-1 (Execution)',
    outcome: {
      success: true,
      supplierPerformance: { responsiveness: 5, complianceAdherence: true }
    }
  };
  
  await IntelligenceNode.ingestFeedback(feedback);
  console.log(`[Write] Ingested Feedback (Should update weights)`);
}

runStep1().catch(console.error);
