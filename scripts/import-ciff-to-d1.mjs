#!/usr/bin/env node
/**
 * Import CIFF enriched contacts into remote D1 (harvics-leads).
 *
 *   node scripts/import-ciff-to-d1.mjs
 *   → writes scripts/.gen/ciff-leads-d1.sql
 *
 * Then:
 *   wrangler d1 execute harvics-leads --remote --file=scripts/.gen/ciff-leads-d1.sql
 */

import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const CSV = join(ROOT, 'ciff_enriched_contacts - ciff_enriched_contacts.csv');
const OUT_DIR = join(__dirname, '.gen');
const OUT_FILE = join(OUT_DIR, 'ciff-leads-d1.sql');
const BATCH = 50;
const SEGMENT = 'Textile / Fashion / Retail';
const SOURCE = 'ciff';
const SOURCE_FILE = 'ciff_enriched_contacts - ciff_enriched_contacts.csv';

function sqlQuote(v) {
  if (v === null || v === undefined) return 'NULL';
  if (typeof v === 'number') return Number.isFinite(v) ? String(v) : '0';
  return `'${String(v).replace(/'/g, "''")}'`;
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else inQuotes = false;
      } else field += c;
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ',') {
      row.push(field);
      field = '';
    } else if (c === '\n') {
      row.push(field);
      field = '';
      rows.push(row);
      row = [];
    } else if (c !== '\r') {
      field += c;
    }
  }
  if (field.length || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.some((v) => String(v).trim() !== ''));
}

function scoreLead(rec) {
  let s = 40;
  if (rec.email) s += 20;
  if (rec.phone) s += 15;
  if (rec.linkedin) s += 10;
  if (rec.title) s += 10;
  if (rec.company) s += 5;
  return Math.min(s, 99);
}

function makeId(rec) {
  const basis = (rec.email || rec.linkedin || `${rec.contactName}|${rec.company}`).toLowerCase();
  return `lead_ciff_${createHash('sha1').update(basis).digest('hex').slice(0, 16)}`;
}

function rowValues(l, now) {
  const searchText = [
    l.company,
    l.contactName,
    l.title,
    l.email,
    l.country,
    l.segment,
    'CIFF',
    l.sourceFile,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  return [
    sqlQuote(l.id),
    sqlQuote(l.source),
    sqlQuote(l.sourceFile),
    sqlQuote(l.company || ''),
    sqlQuote(l.contactName || ''),
    sqlQuote(l.title || ''),
    sqlQuote(l.email || ''),
    sqlQuote(''),
    sqlQuote(l.linkedin || ''),
    sqlQuote(''),
    sqlQuote(l.country || ''),
    sqlQuote(''),
    sqlQuote(l.segment || ''),
    sqlQuote(JSON.stringify(l.tags || [])),
    sqlQuote(l.status || 'new'),
    sqlQuote(l.score || 0),
    sqlQuote(l.createdAt || now),
    sqlQuote(l.updatedAt || now),
    sqlQuote(searchText),
  ].join(',');
}

if (!existsSync(CSV)) {
  console.error(`CIFF CSV not found: ${CSV}`);
  process.exit(1);
}

const rows = parseCsv(readFileSync(CSV, 'utf8'));
if (rows.length < 2) {
  console.error('CIFF CSV has no data rows');
  process.exit(1);
}

const headers = rows[0].map((h) => String(h).trim());
const idx = Object.fromEntries(headers.map((h, i) => [h, i]));
const cell = (row, name) => String(row[idx[name]] ?? '').trim();

const now = new Date().toISOString();
const seen = new Set();
const leads = [];

for (let i = 1; i < rows.length; i++) {
  const row = rows[i];
  const brand = cell(row, 'Brand Name');
  const company = cell(row, 'Company') || brand;
  const contactName = cell(row, 'Contact Name');
  const title = cell(row, 'Title');
  const email = cell(row, 'Email');
  const linkedin = cell(row, 'LinkedIn URL');
  const country = cell(row, 'Country');
  const emailStatus = cell(row, 'Email Status');

  if (!company && !contactName && !email) continue;

  const key = (email || linkedin || `${contactName}|${company}`).toLowerCase();
  if (seen.has(key)) continue;
  seen.add(key);

  const rec = {
    company,
    contactName,
    title,
    email,
    linkedin,
    country,
    segment: SEGMENT,
  };
  leads.push({
    id: makeId(rec),
    source: SOURCE,
    sourceFile: SOURCE_FILE,
    ...rec,
    tags: ['CIFF', emailStatus].filter(Boolean),
    status: 'new',
    score: scoreLead(rec),
    createdAt: now,
    updatedAt: now,
  });
}

mkdirSync(OUT_DIR, { recursive: true });

const COLS = [
  'id',
  'source',
  'source_file',
  'company',
  'contact_name',
  'title',
  'email',
  'phone',
  'linkedin',
  'website',
  'country',
  'city',
  'segment',
  'tags',
  'status',
  'score',
  'created_at',
  'updated_at',
  'search_text',
];

const parts = ['PRAGMA foreign_keys=OFF;'];
const insertHead = `INSERT OR REPLACE INTO leads (${COLS.join(',')}) VALUES`;

for (let i = 0; i < leads.length; i += BATCH) {
  const chunk = leads.slice(i, i + BATCH);
  const values = chunk.map((l) => `(${rowValues(l, now)})`).join(',\n');
  parts.push(`${insertHead}\n${values};`);
}

writeFileSync(OUT_FILE, parts.join('\n') + '\n');
console.log(`Wrote ${OUT_FILE}`);
console.log(`${leads.length} CIFF leads · ${Math.ceil(leads.length / BATCH)} batches`);
console.log(`with_email=${leads.filter((l) => l.email).length}`);
