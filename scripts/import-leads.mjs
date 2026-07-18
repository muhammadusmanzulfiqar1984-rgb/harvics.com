#!/usr/bin/env node
/**
 * HarvyX lead importer
 * --------------------
 * Reads every .csv / .tsv / .xlsx / .xls in src/data/harvyx/contacts/, maps
 * columns to the HarvyX lead shape, dedupes against the existing queue, and
 * writes src/data/harvyx/leads.json.
 *
 * Usage:
 *   npm run import:leads
 *   npm run import:leads -- --dry     # preview only, don't write
 *
 * Column mapping is flexible — headers are matched case-insensitively against
 * a list of aliases, so most CRM/LinkedIn/Apollo/Lusha exports "just work".
 * Excel workbooks are read sheet-by-sheet (every sheet is imported).
 */

import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, extname, relative } from 'node:path';
import { createHash } from 'node:crypto';
import * as XLSX from 'xlsx';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const CONTACTS_DIR = join(ROOT, 'src', 'data', 'harvyx', 'contacts');
const LEADS_FILE = join(ROOT, 'src', 'data', 'harvyx', 'leads.json');

const DRY = process.argv.includes('--dry');

/* ── Header aliases → canonical field ─────────────────────────── */
const FIELD_ALIASES = {
  company: ['company', 'company name', 'organization', 'organisation', 'account', 'employer', 'business'],
  contactName: ['name', 'full name', 'contact', 'contact name', 'person', 'lead name'],
  firstName: ['first name', 'firstname', 'given name'],
  lastName: ['last name', 'lastname', 'surname', 'family name'],
  title: ['title', 'job title', 'position', 'role', 'designation'],
  email: ['email', 'email address', 'work email', 'e-mail', 'business email'],
  phone: ['phone', 'phone number', 'mobile', 'direct dial', 'telephone', 'tel', 'cell'],
  linkedin: ['linkedin', 'linkedin url', 'linkedin profile', 'profile url', 'li url'],
  website: ['website', 'company website', 'domain', 'url', 'web'],
  country: ['country', 'country/region'],
  city: ['city', 'town', 'location'],
  segment: ['segment', 'industry', 'sector', 'vertical', 'category'],
};

/* ── Minimal RFC-4180-ish delimited parser (handles quotes, newlines) ── */
function parseDelimited(text, delimiter) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;
  // strip BOM
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else field += c;
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === delimiter) {
      row.push(field); field = '';
    } else if (c === '\n') {
      row.push(field); field = '';
      rows.push(row); row = [];
    } else if (c === '\r') {
      // ignore, handled by \n
    } else field += c;
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }
  return rows.filter((r) => r.some((v) => String(v).trim() !== ''));
}

/* ── Read any supported file into an array of { name, rows } sheets ── */
function readSheets(filePath) {
  const ext = extname(filePath).toLowerCase();
  if (ext === '.csv') {
    return [{ name: 'csv', rows: parseDelimited(readFileSync(filePath, 'utf8'), ',') }];
  }
  if (ext === '.tsv' || ext === '.txt') {
    return [{ name: 'tsv', rows: parseDelimited(readFileSync(filePath, 'utf8'), '\t') }];
  }
  if (ext === '.xlsx' || ext === '.xls' || ext === '.xlsm' || ext === '.xlsb' || ext === '.ods') {
    const wb = XLSX.read(readFileSync(filePath), { type: 'buffer' });
    return wb.SheetNames.map((name) => {
      const rows = XLSX.utils.sheet_to_json(wb.Sheets[name], {
        header: 1,
        blankrows: false,
        defval: '',
        raw: false,
      }).map((r) => r.map((v) => String(v ?? '').trim()));
      return { name, rows: rows.filter((r) => r.some((v) => v !== '')) };
    });
  }
  return null; // unsupported
}

const SUPPORTED = ['.csv', '.tsv', '.txt', '.xlsx', '.xls', '.xlsm', '.xlsb', '.ods'];

/* ── Recursively collect supported files (skips hidden + junk dirs) ── */
function walk(dir, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue;
    if (entry.name === '__pycache__' || entry.name === 'node_modules') continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (SUPPORTED.includes(extname(entry.name).toLowerCase())) out.push(full);
  }
  return out;
}

function buildHeaderMap(headers) {
  const map = {};
  headers.forEach((h, idx) => {
    const norm = String(h).trim().toLowerCase().replace(/[_-]+/g, ' ').replace(/\s+/g, ' ');
    for (const [field, aliases] of Object.entries(FIELD_ALIASES)) {
      if (aliases.includes(norm)) { map[field] = idx; break; }
    }
  });
  return map;
}

function cell(row, map, field) {
  const idx = map[field];
  if (idx === undefined) return '';
  return String(row[idx] ?? '').trim();
}

function makeId(rec) {
  const basis = (rec.email || rec.linkedin || `${rec.contactName}|${rec.company}`).toLowerCase();
  const hash = createHash('sha1').update(basis).digest('hex').slice(0, 16);
  return `lead_csv_${hash}`;
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

/* ── Load existing ────────────────────────────────────────────── */
let existing = [];
if (existsSync(LEADS_FILE)) {
  try { existing = JSON.parse(readFileSync(LEADS_FILE, 'utf8')); } catch { existing = []; }
}
if (!Array.isArray(existing)) existing = [];

const byId = new Map(existing.map((l) => [l.id, l]));
const seenKeys = new Set(
  existing.map((l) => (l.email || l.linkedin || `${l.contactName}|${l.company}`).toLowerCase()),
);

/* ── Read CSV files ───────────────────────────────────────────── */
if (!existsSync(CONTACTS_DIR)) {
  console.error(`Contacts folder not found: ${CONTACTS_DIR}`);
  process.exit(1);
}
const files = walk(CONTACTS_DIR).sort();
if (!files.length) {
  console.log(`No CSV/Excel files under ${CONTACTS_DIR}. Drop your exports there and re-run.`);
  console.log(`Supported: ${SUPPORTED.join(', ')}`);
  process.exit(0);
}
console.log(`Found ${files.length} file(s) under contacts/\n`);

let added = 0;
let skipped = 0;
const now = new Date().toISOString();

for (const fullPath of files) {
  const file = relative(CONTACTS_DIR, fullPath);
  const sheets = readSheets(fullPath);
  if (!sheets) { console.warn(`${file}: unsupported format, skipped`); continue; }

  const multiSheet = sheets.length > 1;
  for (const sheet of sheets) {
    const label = multiSheet ? `${file} [${sheet.name}]` : file;
    const rows = sheet.rows;
    if (rows.length < 2) { console.log(`${label}: no data rows`); continue; }

    const headerMap = buildHeaderMap(rows[0]);
    const mappedFields = Object.keys(headerMap);
    if (!mappedFields.length) {
      console.warn(`${label}: no recognizable columns. Headers = ${rows[0].join(', ')}`);
      continue;
    }

    let fileAdded = 0;
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      let contactName = cell(row, headerMap, 'contactName');
      if (!contactName) {
        const fn = cell(row, headerMap, 'firstName');
        const ln = cell(row, headerMap, 'lastName');
        contactName = [fn, ln].filter(Boolean).join(' ').trim();
      }
      const rec = {
        company: cell(row, headerMap, 'company'),
        contactName,
        title: cell(row, headerMap, 'title'),
        email: cell(row, headerMap, 'email'),
        phone: cell(row, headerMap, 'phone'),
        linkedin: cell(row, headerMap, 'linkedin'),
        website: cell(row, headerMap, 'website'),
        country: cell(row, headerMap, 'country'),
        city: cell(row, headerMap, 'city'),
        segment: cell(row, headerMap, 'segment'),
      };
      // skip empty rows
      if (!rec.company && !rec.contactName && !rec.email) { skipped++; continue; }

      const key = (rec.email || rec.linkedin || `${rec.contactName}|${rec.company}`).toLowerCase();
      if (seenKeys.has(key)) { skipped++; continue; }
      seenKeys.add(key);

      const lead = {
        id: makeId(rec),
        source: 'csv',
        sourceFile: label,
        ...rec,
        tags: [],
        status: 'new',
        score: scoreLead(rec),
        createdAt: now,
        updatedAt: now,
      };
      byId.set(lead.id, lead);
      added++;
      fileAdded++;
    }
    console.log(`${label}: +${fileAdded} (${mappedFields.join(', ')})`);
  }
}

const merged = Array.from(byId.values());
console.log(`\n${added} new · ${skipped} skipped/dupes · ${merged.length} total leads`);

if (DRY) {
  console.log('Dry run — leads.json NOT written.');
} else {
  writeFileSync(LEADS_FILE, JSON.stringify(merged, null, 2) + '\n');
  console.log(`Wrote ${LEADS_FILE}`);
}
