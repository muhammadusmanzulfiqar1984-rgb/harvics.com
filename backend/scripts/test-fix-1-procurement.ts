
import { procurementService } from '../src/modules/procurement/procurement.service';

async function verifyFix1() {
  console.log('--- FIX-1 VERIFICATION: PROCUREMENT CRM SOVEREIGNTY ---');

  // Test Case 1: Onboard High Risk Country (KP - North Korea)
  // Previously this would result in riskScore: 90
  const highRiskSupplier = {
    name: 'Pyongyang Heavy Industries',
    country: 'KP',
    categories: ['Nuclear Parts'],
    complianceStatus: 'Pending' as const
  };

  console.log(`\n1. Onboarding Supplier from High Risk Country (${highRiskSupplier.country})...`);
  const result1 = await procurementService.onboardSupplier(highRiskSupplier);

  console.log('   Result Risk Score:', result1.riskScore);
  console.log('   Result Compliance:', result1.complianceStatus);

  if (result1.riskScore === 0) {
    console.log('   ✅ PASS: Risk Score is 0 (Neutral). Intelligence Sovereignty Respected.');
  } else {
    console.error(`   ❌ FAIL: Risk Score is ${result1.riskScore}. Decision logic still exists!`);
    process.exit(1);
  }

  // Test Case 2: Onboard Medium Risk Country (CN - China)
  // Previously this would result in riskScore: 50
  const mediumRiskSupplier = {
    name: 'Shenzhen Electronics',
    country: 'CN',
    categories: ['Chips'],
    complianceStatus: 'Pending' as const
  };

  console.log(`\n2. Onboarding Supplier from Medium Risk Country (${mediumRiskSupplier.country})...`);
  const result2 = await procurementService.onboardSupplier(mediumRiskSupplier);

  console.log('   Result Risk Score:', result2.riskScore);

  if (result2.riskScore === 0) {
    console.log('   ✅ PASS: Risk Score is 0 (Neutral).');
  } else {
    console.error(`   ❌ FAIL: Risk Score is ${result2.riskScore}. Decision logic still exists!`);
    process.exit(1);
  }

  console.log('\n--- VERIFICATION COMPLETE: NO CRM DECISION LOGIC FOUND ---');
}

verifyFix1().catch(err => {
  console.error('Test Failed:', err);
  process.exit(1);
});
