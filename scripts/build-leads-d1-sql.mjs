#!/usr/bin/env node
/**
 * Build a D1-ready SQL dump of all leads from leads.json.
 *
 *   node scripts/build-leads-d1-sql.mjs
 *   → writes scripts/.gen/leads-d1.sql  (INSERT OR REPLACE, batched)
 *
 * Apply it (or just run `npm run leads:d1:local` / `npm run leads:d1:remote`):
 *   Local:  wrangler d1 execute harvics-leads --local  --file=migrations/0001_leads.sql
 *           wrangler d1 execute harvics-leads --local  --file=scripts/.gen/leads-d1.sql
 *   Remote: wrangler d1 execute harvics-leads --remote --file=migrations/0001_leads.sql
 *           wrangler d1 execute harvics-leads --remote --file=scripts/.gen/leads-d1.sql
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const LEADS_FILE = join(ROOT, 'src', 'data', 'harvyx', 'leads.json');
const OUT_DIR = join(__dirname, '.gen');
const OUT_FILE = join(OUT_DIR, 'leads-d1.sql');

const BATCH = 100; // rows per multi-row INSERT

function q(v) {
  if (v === null || v === undefined) return 'NULL';
  if (typeof v === 'number') return Number.isFinite(v) ? String(v) : '0';
  return `'${String(v).replace(/'/g, "''")}'`;
}

if (!existsSync(LEADS_FILE)) {
  console.error(`leads.json not found at ${LEADS_FILE} — run "npm run import:leads" first.`);
  process.exit(1);
}

const leads = JSON.parse(readFileSync(LEADS_FILE, 'utf8'));
if (!Array.isArray(leads)) {
  console.error('leads.json is not an array.');
  process.exit(1);
}

mkdirSync(OUT_DIR, { recursive: true });

const COLS = [
  'id', 'source', 'source_file', 'company', 'contact_name', 'title', 'email',
  'phone', 'linkedin', 'website', 'country', 'city', 'segment', 'tags',
  'status', 'score', 'created_at', 'updated_at', 'search_text',
];

function rowValues(l) {
  const searchText = [
    l.company, l.contactName || l.name, l.title, l.email,
    l.country, l.city, l.segment, l.sourceFile,
  ].filter(Boolean).join(' ').toLowerCase();

  return [
    q(l.id),
    q(l.source || 'csv'),
    q(l.sourceFile || ''),
    q(l.company || ''),
    q(l.contactName || l.name || ''),
    q(l.title || ''),
    q(l.email || ''),
    q(l.phone || ''),
    q(l.linkedin || l.linkedinUrl || ''),
    q(l.website || ''),
    q(l.country || ''),
    q(l.city || ''),
    q(l.segment || ''),
    q(JSON.stringify(l.tags || [])),
    q(l.status || 'new'),
    q(Number.isFinite(l.score) ? l.score : 0),
    q(l.createdAt || ''),
    q(l.updatedAt || ''),
    q(searchText),
  ].join(',');
}

const parts = ['PRAGMA foreign_keys=OFF;'];
const insertHead = `INSERT OR REPLACE INTO leads (${COLS.join(',')}) VALUES`;

for (let i = 0; i < leads.length; i += BATCH) {
  const chunk = leads.slice(i, i + BATCH);
  const values = chunk.map((l) => `(${rowValues(l)})`).join(',\n');
  parts.push(`${insertHead}\n${values};`);
}

writeFileSync(OUT_FILE, parts.join('\n') + '\n');
const mb = (Buffer.byteLength(parts.join('\n')) / 1e6).toFixed(1);
console.log(`Wrote ${OUT_FILE}`);
console.log(`${leads.length} leads · ${Math.ceil(leads.length / BATCH)} batches · ${mb} MB`);
