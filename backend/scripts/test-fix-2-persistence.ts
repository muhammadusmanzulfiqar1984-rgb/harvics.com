
import { execSync } from 'child_process';
import * as path from 'path';

console.log('>>> STARTING FIX-2 PERSISTENCE TEST');

try {
  // Step 1: Write
  console.log('\n>>> RUNNING STEP 1: WRITE STATE');
  execSync('npx ts-node scripts/test-fix-2-step1-write.ts', { 
    stdio: 'inherit',
    cwd: path.join(__dirname, '..') 
  });

  // Step 2: Read (Restart)
  console.log('\n>>> RUNNING STEP 2: READ STATE (RESTART SIMULATION)');
  execSync('npx ts-node scripts/test-fix-2-step2-read.ts', { 
    stdio: 'inherit',
    cwd: path.join(__dirname, '..')
  });

  console.log('\n>>> FIX-2 ALL TESTS PASSED');
} catch (error) {
  console.error('\n>>> TEST FAILED');
  process.exit(1);
}
