/**
 * scripts/ingest_csv.js
 *
 * Phase 1 lead ingest: walks HarvyX-ALL-MERGED/raw Leads/ (and any extra
 * roots passed via INGEST_ROOTS env var, comma-separated), normalizes each
 * row into a unified Lead shape, dedupes against existing leads.json by
 * email + linkedin, and writes the merged set back.
 *
 * Usage:
 *   node scripts/ingest_csv.js              # default roots
 *   node scripts/ingest_csv.js --dry-run    # show counts only, no write
 *
 * Output JSON shape per lead:
 *   { id, source, sourceFile, company, contactName, title,
 *     email, phone, linkedin, website, country, city, segment,
 *     tags[], status, score, createdAt, updatedAt }
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const LEADS_FILE = path.join(ROOT, 'data', 'leads.json');
const DEFAULT_ROOTS = [
  path.join(ROOT, 'HarvyX-ALL-MERGED', 'raw Leads'),
];

const EXTRA = (process.env.INGEST_ROOTS || '')
  .split(',').map(s => s.trim()).filter(Boolean)
  .map(p => path.isAbsolute(p) ? p : path.join(ROOT, p));

const ROOTS = [...DEFAULT_ROOTS, ...EXTRA];
const DRY = process.argv.includes('--dry-run');

// ---------- CSV parser (RFC 4180, no deps) ----------
function parseCSV(text) {
  const rows = [];
  let row = [];
  let cell = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i += 1) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { cell += '"'; i += 1; }
        else inQuotes = false;
      } else cell += c;
    } else if (c === '"') inQuotes = true;
    else if (c === ',') { row.push(cell); cell = ''; }
    else if (c === '\n') { row.push(cell); rows.push(row); row = []; cell = ''; }
    else if (c === '\r') { /* skip */ }
    else cell += c;
  }
  if (cell.length || row.length) { row.push(cell); rows.push(row); }
  return rows.filter(r => r.length && r.some(v => String(v).trim() !== ''));
}

// ---------- Header-aware row → object ----------
function rowsToObjects(rows) {
  if (!rows.length) return [];
  const headers = rows[0].map(h => String(h || '').trim());
  return rows.slice(1).map(r => {
    const o = {};
    headers.forEach((h, i) => { o[h] = (r[i] || '').trim(); });
    return o;
  });
}

// ---------- Helpers ----------
const get = (obj, keys) => {
  for (const k of keys) {
    for (const objKey of Object.keys(obj)) {
      if (objKey.toLowerCase() === k.toLowerCase() && obj[objKey]) return obj[objKey];
    }
  }
  return '';
};
const splitCityCountry = (loc) => {
  if (!loc) return { city: '', country: '' };
  const parts = String(loc).split(',').map(s => s.trim()).filter(Boolean);
  if (parts.length >= 2) return { city: parts[0], country: parts[parts.length - 1] };
  return { city: parts[0] || '', country: '' };
};
const cleanLinkedIn = (url) => {
  if (!url) return '';
  return String(url).trim().replace(/\/+$/, '').toLowerCase();
};
const cleanEmail = (e) => String(e || '').trim().toLowerCase();
const cleanPhone = (p) => String(p || '').replace(/[^\d+]/g, '');

// ---------- Normalizer (handles all observed CSV shapes) ----------
function normalize(row, sourceFile) {
  const firstName = get(row, ['First Name']);
  const lastName = get(row, ['Last Name']);
  const fullName = get(row, ['Name', '(Lusha) Full name', 'Key Player']);
  const contactName = (fullName || `${firstName} ${lastName}`).trim();

  const company = get(row, ['Company', 'Company Name', 'Compnay']);
  const title = get(row, ['Job Title', 'Exact Job Title', '(Lusha) Job title', 'Role']);
  const location = get(row, ['Location', '(Lusha) City', '(Lusha) Country']);
  const { city, country } = splitCityCountry(location);

  const email = cleanEmail(get(row, [
    'Work Email', 'Email', 'Direct Email', '(Lusha) Work email', 'Additional Email 1',
  ]));
  const phone = cleanPhone(get(row, [
    'Phone 1', '(Lusha) Phone number 1', 'Phone / WhatsApp', 'Phone 2', '(Lusha) Phone number 2',
  ]));
  const linkedin = cleanLinkedIn(get(row, [
    'LinkedIn URL', 'Linkedin url', '(Lusha) Linkedin URL',
  ]));
  const website = get(row, ['Company Domain', 'Company url', 'Website']);
  const industry = get(row, ['Industries', 'Category', 'Departments', '(Lusha) Departments']);
  const events = get(row, ['Exhibiting in Events', 'Exhibited in Events']);

  if (!contactName && !company && !email && !linkedin) return null;

  return {
    source: 'csv',
    sourceFile: path.basename(sourceFile),
    company,
    contactName,
    title,
    email,
    phone,
    linkedin,
    website,
    country,
    city,
    segment: industry,
    tags: [events].filter(Boolean),
    status: 'new',
    score: scoreLead({ email, phone, linkedin, title, company }),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

function scoreLead(l) {
  let s = 30;
  if (l.email) s += 25;
  if (l.phone) s += 15;
  if (l.linkedin) s += 15;
  if (l.title) s += 10;
  if (l.company) s += 5;
  return Math.min(100, s);
}

// ---------- File walker ----------
function walkCsvs(roots) {
  const out = [];
  for (const root of roots) {
    if (!fs.existsSync(root)) continue;
    const stack = [root];
    while (stack.length) {
      const dir = stack.pop();
      let entries = [];
      try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { continue; }
      for (const e of entries) {
        const full = path.join(dir, e.name);
        if (e.isDirectory()) stack.push(full);
        else if (e.isFile() && e.name.toLowerCase().endsWith('.csv')) out.push(full);
      }
    }
  }
  return out;
}

// ---------- Main ----------
function main() {
  const existing = (() => {
    try { return JSON.parse(fs.readFileSync(LEADS_FILE, 'utf8')); }
    catch { return []; }
  })();
  const byKey = new Map();
  for (const l of existing) {
    const k = l.email || l.linkedin || `${(l.contactName||'').toLowerCase()}|${(l.company||'').toLowerCase()}`;
    if (k) byKey.set(k, l);
  }

  const files = walkCsvs(ROOTS);
  let scanned = 0;
  let added = 0;
  let updated = 0;
  let skipped = 0;
  const perFile = [];

  for (const file of files) {
    let rows;
    try {
      const text = fs.readFileSync(file, 'utf8');
      rows = rowsToObjects(parseCSV(text));
    } catch (e) {
      perFile.push({ file: path.relative(ROOT, file), error: e.message });
      continue;
    }
    let fAdded = 0, fUpd = 0, fSkip = 0;
    for (const row of rows) {
      scanned += 1;
      const norm = normalize(row, file);
      if (!norm) { skipped += 1; fSkip += 1; continue; }
      const key = norm.email || norm.linkedin
        || `${norm.contactName.toLowerCase()}|${norm.company.toLowerCase()}`;
      if (!key) { skipped += 1; fSkip += 1; continue; }
      if (byKey.has(key)) {
        const prev = byKey.get(key);
        const merged = { ...prev };
        for (const k of Object.keys(norm)) {
          if (norm[k] && !merged[k]) merged[k] = norm[k];
        }
        merged.updatedAt = new Date().toISOString();
        merged.tags = Array.from(new Set([...(prev.tags||[]), ...(norm.tags||[])]));
        byKey.set(key, merged);
        updated += 1; fUpd += 1;
      } else {
        const id = `lead_csv_${Buffer.from(key).toString('base64url').slice(0, 18)}`;
        byKey.set(key, { id, ...norm });
        added += 1; fAdded += 1;
      }
    }
    perFile.push({ file: path.relative(ROOT, file), rows: rows.length, added: fAdded, updated: fUpd, skipped: fSkip });
  }

  const merged = Array.from(byKey.values());
  const summary = { roots: ROOTS, files: files.length, scanned, added, updated, skipped, total: merged.length, perFile };

  if (DRY) {
    console.log(JSON.stringify(summary, null, 2));
    return summary;
  }
  fs.mkdirSync(path.dirname(LEADS_FILE), { recursive: true });
  fs.writeFileSync(LEADS_FILE, `${JSON.stringify(merged, null, 2)}\n`, 'utf8');
  console.log(JSON.stringify(summary, null, 2));
  return summary;
}

if (require.main === module) main();
module.exports = { main };
