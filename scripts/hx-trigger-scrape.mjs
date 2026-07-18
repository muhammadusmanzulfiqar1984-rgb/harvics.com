/**
 * hx-trigger-scrape.mjs — operator helper
 * Loads .env.hx, mints a short-lived operator JWT, and triggers a scrape
 * via the local reporting API.
 * Usage: node scripts/hx-trigger-scrape.mjs [source]   (default: companies_house)
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import jwt from 'jsonwebtoken';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

// Minimal .env parser (no dotenv dependency needed)
for (const line of readFileSync(join(ROOT, '.env.hx'), 'utf8').split('\n')) {
  const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
}

const source = process.argv[2] ?? 'companies_house';
const port   = process.env.HX_API_PORT ?? '3001';

const token = jwt.sign(
  { sub: 'operator', role: 'admin' },
  process.env.HX_JWT_SECRET,
  { expiresIn: '1h' },
);

const res = await fetch(`http://localhost:${port}/api/v1/databank/scrape/${source}`, {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
});

const body = await res.text();
console.log(`HTTP ${res.status}`);
console.log(body);
process.exit(res.ok ? 0 : 1);
