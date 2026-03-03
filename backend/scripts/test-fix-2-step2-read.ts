
import { ProcurementService } from '../src/modules/procurement/procurement.service';
import { IntelligenceNode } from '../src/services/intelligenceNode';
import * as fs from 'fs';
import * as path from 'path';

async function runStep2() {
  console.log('--- STEP 2: VERIFYING PERSISTENCE (RESTART) ---');

  // 1. Verify Supplier Profile
  const procurement = new ProcurementService();
  // We need to access the private map or find a way to list.
  // Helper `getProcurementMap` filters by country.
  const map = procurement.getProcurementMap('JP');
  const supplier = map.suppliers.find(s => s.name === 'Persistence Test Corp');
  
  if (supplier) {
    console.log(`✅ Supplier Persisted: ${supplier.id}`);
  } else {
    console.error('❌ Supplier LOST!');
    process.exit(1);
  }

  // 2. Verify Decision
  const decision = await IntelligenceNode.getDecision('TRX-PERSIST-001');
  if (decision) {
    console.log(`✅ Decision Persisted: ${decision.primaryGate.meta.output_id}`);
  } else {
    console.error('❌ Decision LOST!');
    process.exit(1);
  }

  // 3. Verify Feedback State (via File Check)
  const learningFile = path.join(__dirname, '../data/intelligence_learning_state.json');
  if (fs.existsSync(learningFile)) {
    const content = JSON.parse(fs.readFileSync(learningFile, 'utf-8'));
    // We expect SupplierProfile updates from the feedback
    if (content.SupplierProfile && Object.keys(content.SupplierProfile).length > 0) {
      console.log('✅ Learning State Persisted (Found SupplierProfile updates)');
    } else {
      console.error('❌ Learning State File Empty/Invalid');
      console.error(content);
      process.exit(1);
    }
  } else {
    console.error('❌ Learning State File Missing');
    process.exit(1);
  }

  console.log('--- FIX-2 VERIFICATION SUCCESSFUL ---');
}

runStep2().catch(console.error);
