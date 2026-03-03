import { HarvicsAlphaEngine } from '../src/services/harvicsAlphaEngine';

const targets = ['US', 'PK', 'AE', 'GB', 'CN'];

// Simulate the Daily Cron Job
(async () => {
  await HarvicsAlphaEngine.generateDailyAttackPlan(targets);
})();
