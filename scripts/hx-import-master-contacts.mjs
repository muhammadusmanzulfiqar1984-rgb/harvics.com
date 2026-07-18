#!/usr/bin/env node
/**
 * Import deduped master leads (leads.json) into hx_contacts (Postgres Data Bank).
 *
 * Safety rules:
 *   - INSERT only — ON CONFLICT (source, source_id) DO NOTHING (never overrides rows)
 *   - Cross-source dedup: skip if email / linkedin / name+company already exists
 *   - Does NOT enqueue email-verify or ICP workers (preserves imported scores)
 *   - Bronze audit: one contact.ingested event per inserted row
 *
 * Usage:
 *   npm run hx:import-master -- --dry
 *   npm run hx:import-master
 *   npm run hx:import-master -- --limit=500
 */

import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { config } from 'dotenv';
import pg from 'pg';

const { Pool } = pg;

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const LEADS_FILE = join(ROOT, 'src', 'data', 'harvyx', 'leads.json');
const ENV_FILE = join(ROOT, '.env.hx');

const DRY = process.argv.includes('--dry');
const SKIP_BRONZE = process.argv.includes('--skip-bronze');
const LIMIT_ARG = process.argv.find((a) => a.startsWith('--limit='));
const LIMIT = LIMIT_ARG ? Number(LIMIT_ARG.split('=')[1]) : null;
const BATCH = 250;
const MODULE = 'hx-import-master-contacts';

config({ path: ENV_FILE });

const DB_URL = process.env.HX_DATABASE_URL;
if (!DB_URL) {
  console.error('HX_DATABASE_URL missing — set it in .env.hx');
  process.exit(1);
}

if (!existsSync(LEADS_FILE)) {
  console.error(`leads.json not found — run "npm run import:leads" first.\n  ${LEADS_FILE}`);
  process.exit(1);
}

function splitName(name) {
  const full = String(name ?? '').trim();
  if (!full) return { first_name: null, last_name: null, full_name: null };
  const parts = full.split(/\s+/);
  if (parts.length === 1) return { first_name: parts[0], last_name: null, full_name: full };
  return { first_name: parts[0], last_name: parts.slice(1).join(' '), full_name: full };
}

function extractDomain(website) {
  const raw = String(website ?? '').trim();
  if (!raw) return null;
  try {
    const url = raw.includes('://') ? raw : `https://${raw}`;
    const host = new URL(url).hostname.replace(/^www\./i, '');
    return host ? host.slice(0, 200) : null;
  } catch {
    const host = raw.replace(/^https?:\/\//i, '').replace(/^www\./i, '').split('/')[0];
    return host ? host.slice(0, 200) : null;
  }
}

function clip(value, max) {
  if (value == null || value === '') return null;
  const s = String(value).trim();
  if (!s) return null;
  return s.length > max ? s.slice(0, max) : s;
}

function normCountry(country) {
  const c = String(country ?? '').trim();
  if (!c) return null;
  if (/^[a-z]{2}$/i.test(c)) return c.toUpperCase();
  return null;
}

function dedupKey(rec) {
  const email = String(rec.email ?? '').trim().toLowerCase();
  const linkedin = String(rec.linkedin ?? rec.linkedinUrl ?? '').trim().toLowerCase();
  const name = String(rec.contactName ?? rec.name ?? '').trim().toLowerCase();
  const company = String(rec.company ?? '').trim().toLowerCase();
  if (email) return `e:${email}`;
  if (linkedin) return `l:${linkedin}`;
  if (name || company) return `n:${name}|${company}`;
  return null;
}

function mapLead(lead) {
  const { first_name, last_name, full_name } = splitName(lead.contactName || lead.name);
  const email = String(lead.email ?? '').trim().toLowerCase() || null;
  const linkedin = String(lead.linkedin ?? lead.linkedinUrl ?? '').trim() || null;
  const score = Number.isFinite(lead.score) ? Math.max(0, Math.min(100, Math.round(lead.score))) : 0;
  const inNurture = score >= 50 && score <= 69;

  return {
    source: 'csv',
    source_id: clip(lead.id, 255),
    first_name: clip(first_name, 100),
    last_name: clip(last_name, 100),
    full_name: clip(full_name, 200),
    title: clip(lead.title, 200),
    company_name: clip(lead.company, 300),
    company_domain: clip(extractDomain(lead.website), 200),
    country: normCountry(lead.country),
    vertical: clip(lead.segment, 100),
    email_pattern: clip(email, 200),
    phone: clip(lead.phone, 50),
    linkedin_url: clip(linkedin, 500),
    icp_score: score,
    in_nurture_pool: inNurture,
    raw_json: {
      import_module: MODULE,
      source_file: lead.sourceFile ?? null,
      city: lead.city ?? null,
      tags: lead.tags ?? [],
      status: lead.status ?? 'new',
      original_created_at: lead.createdAt ?? null,
    },
    dedup_key: dedupKey(lead),
  };
}

async function loadExistingKeys(pool) {
  const { rows } = await pool.query(`
    SELECT source, source_id,
           lower(coalesce(email_pattern, '')) AS email_key,
           lower(coalesce(linkedin_url, '')) AS linkedin_key,
           lower(coalesce(full_name, '')) || '|' || lower(coalesce(company_name, '')) AS name_company_key
    FROM hx_contacts
  `);

  const sourceIds = new Set();
  const fingerprints = new Set();

  for (const row of rows) {
    sourceIds.add(`${row.source}::${row.source_id}`);
    if (row.email_key) fingerprints.add(`e:${row.email_key}`);
    if (row.linkedin_key) fingerprints.add(`l:${row.linkedin_key}`);
    if (row.name_company_key && row.name_company_key !== '|') {
      fingerprints.add(`n:${row.name_company_key}`);
    }
  }

  return { sourceIds, fingerprints };
}

async function insertBatch(client, rows) {
  if (!rows.length) return [];

  const params = [];
  const valueGroups = rows.map((row, i) => {
    const base = i * 16;
    params.push(
      row.source,
      row.source_id,
      row.first_name,
      row.last_name,
      row.full_name,
      row.title,
      row.company_name,
      row.company_domain,
      row.country,
      row.vertical,
      row.email_pattern,
      row.phone,
      row.linkedin_url,
      row.icp_score,
      row.in_nurture_pool,
      JSON.stringify(row.raw_json),
    );
    return `($${base + 1},$${base + 2},$${base + 3},$${base + 4},$${base + 5},$${base + 6},$${base + 7},$${base + 8},$${base + 9},$${base + 10},$${base + 11},$${base + 12},$${base + 13},$${base + 14},$${base + 15},NOW(),$${base + 16})`;
  });

  const sql = `
    INSERT INTO hx_contacts (
      source, source_id, first_name, last_name, full_name, title,
      company_name, company_domain, country, vertical,
      email_pattern, phone, linkedin_url, icp_score, in_nurture_pool, icp_scored_at, raw_json
    ) VALUES ${valueGroups.join(',')}
    ON CONFLICT (source, source_id) DO NOTHING
    RETURNING id, company_name, country, vertical, icp_score
  `;

  const { rows: inserted } = await client.query(sql, params);
  return inserted;
}

async function bronzeBatch(client, inserted) {
  if (!inserted.length || SKIP_BRONZE) return;

  const params = [];
  const groups = inserted.map((row, i) => {
    const base = i * 5;
    params.push(
      'contact.ingested',
      MODULE,
      row.id,
      'hx_contact',
      JSON.stringify({
        source: 'csv',
        company_name: row.company_name,
        country: row.country,
        vertical: row.vertical,
        icp_score: row.icp_score,
        import: 'master_leads',
      }),
    );
    return `($${base + 1},$${base + 2},$${base + 3},$${base + 4},$${base + 5})`;
  });

  await client.query(
    `INSERT INTO hx_events_bronze (event_type, source_module, entity_id, entity_type, payload)
     VALUES ${groups.join(',')}`,
    params,
  );
}

async function main() {
  const leads = JSON.parse(readFileSync(LEADS_FILE, 'utf8'));
  if (!Array.isArray(leads)) {
    console.error('leads.json is not an array.');
    process.exit(1);
  }

  const slice = LIMIT && LIMIT > 0 ? leads.slice(0, LIMIT) : leads;
  console.log(`Master file: ${slice.length.toLocaleString()} leads${LIMIT ? ` (limit ${LIMIT})` : ''}`);
  if (DRY) console.log('DRY RUN — no database writes\n');

  const pool = new Pool({ connectionString: DB_URL, max: 3 });
  const { sourceIds, fingerprints } = await loadExistingKeys(pool);
  console.log(`Existing in hx_contacts: ${sourceIds.size.toLocaleString()} rows · ${fingerprints.size.toLocaleString()} fingerprints\n`);

  const toInsert = [];
  let skippedDupFile = 0;
  let skippedDupDb = 0;
  let skippedEmpty = 0;
  const seenImport = new Set();

  for (const lead of slice) {
    if (!lead?.id) { skippedEmpty++; continue; }

    const mapped = mapLead(lead);
    if (!mapped.company_name && !mapped.full_name && !mapped.email_pattern) {
      skippedEmpty++;
      continue;
    }

    const sourceKey = `${mapped.source}::${mapped.source_id}`;
    if (sourceIds.has(sourceKey)) { skippedDupDb++; continue; }

    if (mapped.dedup_key) {
      if (fingerprints.has(mapped.dedup_key)) { skippedDupDb++; continue; }
      if (seenImport.has(mapped.dedup_key)) { skippedDupFile++; continue; }
      seenImport.add(mapped.dedup_key);
      fingerprints.add(mapped.dedup_key);
    }

    sourceIds.add(sourceKey);
    toInsert.push(mapped);
  }

  console.log('Prepared for insert:');
  console.log(`  +${toInsert.length.toLocaleString()} new`);
  console.log(`  ${skippedDupDb.toLocaleString()} skipped (already in DB / fingerprint)`);
  console.log(`  ${skippedDupFile.toLocaleString()} skipped (duplicate within import batch)`);
  console.log(`  ${skippedEmpty.toLocaleString()} skipped (empty rows)`);

  if (DRY || !toInsert.length) {
    await pool.end();
    return;
  }

  const client = await pool.connect();
  let insertedTotal = 0;
  const started = Date.now();

  try {
    for (let i = 0; i < toInsert.length; i += BATCH) {
      const chunk = toInsert.slice(i, i + BATCH);
      await client.query('BEGIN');
      try {
        const inserted = await insertBatch(client, chunk);
        await bronzeBatch(client, inserted);
        await client.query('COMMIT');
        insertedTotal += inserted.length;
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      }

      if ((i / BATCH) % 20 === 0 || i + BATCH >= toInsert.length) {
        const pct = Math.min(100, Math.round(((i + chunk.length) / toInsert.length) * 100));
        process.stdout.write(`\r  Progress: ${insertedTotal.toLocaleString()} inserted (${pct}%)`);
      }
    }
    console.log('');
  } finally {
    client.release();
  }

  const { rows: counts } = await pool.query(`
    SELECT
      (SELECT count(*) FROM hx_contacts) AS total,
      (SELECT count(*) FROM hx_contacts WHERE source = 'csv') AS csv,
      (SELECT count(*) FROM hx_contacts WHERE source = 'companies_house') AS scraped
  `);

  const elapsed = ((Date.now() - started) / 1000).toFixed(1);
  console.log(`\nDone in ${elapsed}s`);
  console.log(`Inserted this run: ${insertedTotal.toLocaleString()}`);
  console.log(`hx_contacts now: ${Number(counts[0].total).toLocaleString()} total (${Number(counts[0].csv).toLocaleString()} csv · ${Number(counts[0].scraped).toLocaleString()} scraped)`);

  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
