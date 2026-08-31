/**
 * Seed Global House + AR master data from data/*.json into PostgreSQL.
 * Usage: npx tsx backend/scripts/seed-global-house-finance.ts
 */
import { ensureFinanceDbSeeded } from '../src/services/financeDbBootstrap.service';

async function main() {
  await ensureFinanceDbSeeded();
  console.log('Global House finance data seeded into PostgreSQL.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
