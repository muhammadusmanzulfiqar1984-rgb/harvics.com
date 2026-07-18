/**
 * hx-run-scraper.mjs — run a scraper directly (operator helper)
 * Loads .env.hx then invokes the scraper's exported entry function.
 * Usage: node scripts/hx-run-scraper.mjs   (companies_house only for now)
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

for (const line of readFileSync(join(ROOT, '.env.hx'), 'utf8').split('\n')) {
  const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
}

const { runCompaniesHouseScraper } = await import(
  join(ROOT, 'apps/cron/scrapers/hx-companies-house.scraper.ts')
);

await runCompaniesHouseScraper();
console.log('SCRAPER_DONE');
process.exit(0);
