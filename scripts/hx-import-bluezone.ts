/**
 * hx-import-bluezone.ts — one-time Munich Fabric Start / Bluezone contact import
 *
 * Inserts textile-agent contacts into hx_contacts with source='bluezone', country='DE'.
 * ON CONFLICT (source, source_id) DO NOTHING — safe to re-run.
 *
 * Usage:
 *   npx tsx scripts/hx-import-bluezone.ts --dry
 *   npx tsx scripts/hx-import-bluezone.ts
 */

import { createHash } from 'node:crypto';
import { join } from 'node:path';
import { config } from 'dotenv';
import pg from 'pg';

const { Pool } = pg;

const ROOT = join(__dirname, '..');
config({ path: join(ROOT, '.env.hx') });

const DRY = process.argv.includes('--dry');
const MODULE = 'hx-import-bluezone';

const DB_URL = process.env.HX_DATABASE_URL;
if (!DB_URL) {
  console.error('HX_DATABASE_URL missing — set it in .env.hx');
  process.exit(1);
}

type BluezoneContact = {
  full_name: string;
  company_name: string;
  email?: string | null;
  phone?: string | null;
  country?: string;
};

/**
 * Munich Fabric Start / Bluezone textile-agent contacts.
 * Paste was truncated after Elisabeth Voehringer — re-run after appending the rest.
 */
const CONTACTS: BluezoneContact[] = [
  {
    full_name: 'Christof Hornung',
    company_name: 'Agentur Hornung GmbH',
    email: 'ch@agenturhornung.de',
    phone: '+498947087177',
  },
  {
    full_name: 'Dirk Köhler',
    company_name: 'Escher Textil',
    email: 'dirk.koehler@escher-textil.de',
    phone: '+49202268612',
  },
  {
    full_name: 'Michael Berner',
    company_name: 'Berner & Sohn GmbH',
    email: 'm.berner@bernerundsohn.com',
    phone: '+4915116771616',
  },
  {
    full_name: 'Lucie Landes',
    company_name: 'Berner & Sohn GmbH',
    email: 'l.landes@bernerundsohn.com',
  },
  {
    full_name: 'Alfred Püttmann',
    company_name: 'Püttmann Textilagentur',
    email: 'aw.puettmann@puettmann-tex.com',
  },
  {
    full_name: 'Alexandra Uelner',
    company_name: 'C. Pauli GmbH',
    email: 'alexandra.uelner@c-pauli.de',
  },
  {
    full_name: 'Claudia Pauli',
    company_name: 'C. Pauli GmbH',
    email: 'info@c-pauli.de',
  },
  {
    full_name: 'Bernd Roth',
    company_name: 'GR Textilagentur',
    email: 'bernd.roth@gr-textilagentur.de',
    phone: '+4974339976581',
  },
  {
    full_name: 'Bernhard Freund',
    company_name: 'Bitzer Single',
    email: 'bfreund@bitzer-single.de',
    phone: '+49743195800',
  },
  {
    full_name: 'Ralph Fuhrmann',
    company_name: 'Textilagentur Fuhrmann',
    email: 'ralph.fuhrmann@ta-fuhrmann.de',
    phone: '+492672913100',
  },
  {
    full_name: 'Claudia Fuhrmann',
    company_name: 'Textilagentur Fuhrmann',
    email: 'claudia.fuhrmann@ta-fuhrmann.de',
  },
  {
    full_name: 'Thomas Nick Müller',
    company_name: 'Max Müller Textil',
    email: 'info@maxmueller-textil.de',
  },
  {
    full_name: 'Michael Feller',
    company_name: 'Texagentur Feller',
    email: 'feller@texagentur.de',
    phone: '+499162928695',
  },
  {
    full_name: 'Helmut Niessen',
    company_name: 'Niessen Textilhandelsagentur',
    email: 'tex@niessenweb.de',
    phone: '+492471990943',
  },
  {
    full_name: 'Stefanie Fehren',
    company_name: 'Hemmersitex',
    email: 's.fehren@hemmersitex.de',
  },
  // Truncated in source message — needs email before import:
  // { full_name: 'Elisabeth Voehringer', company_name: 'Voehringer-Groha', email: '…' },
];

function splitName(full: string): { first_name: string | null; last_name: string | null } {
  const parts = full.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { first_name: null, last_name: null };
  if (parts.length === 1) return { first_name: parts[0], last_name: null };
  return { first_name: parts[0], last_name: parts.slice(1).join(' ') };
}

function domainFromEmail(email: string | null | undefined): string | null {
  if (!email) return null;
  const at = email.indexOf('@');
  if (at < 0) return null;
  const host = email.slice(at + 1).trim().toLowerCase().replace(/^www\./, '');
  return host || null;
}

function sourceId(c: BluezoneContact): string {
  const key = (c.email?.trim().toLowerCase() || `${c.full_name}|${c.company_name}`)
    .trim()
    .toLowerCase();
  return createHash('sha256').update(`bluezone:${key}`).digest('hex').slice(0, 32);
}

async function main() {
  const pool = new Pool({
    connectionString: DB_URL,
    ssl: { rejectUnauthorized: false },
    max: 2,
  });

  console.log(`Bluezone import: ${CONTACTS.length} contacts${DRY ? ' (DRY RUN)' : ''}`);

  let inserted = 0;
  let skipped = 0;
  let errors = 0;

  for (const c of CONTACTS) {
    const email = c.email?.trim().toLowerCase() || null;
    if (!email) {
      console.warn(`skip (no email): ${c.full_name} @ ${c.company_name}`);
      skipped++;
      continue;
    }

    const { first_name, last_name } = splitName(c.full_name);
    const sid = sourceId(c);
    const domain = domainFromEmail(email);
    const phone = c.phone?.trim() || null;
    const country = (c.country || 'DE').toUpperCase();

    if (DRY) {
      console.log(`DRY would insert: ${c.full_name} <${email}> · ${c.company_name}`);
      inserted++;
      continue;
    }

    try {
      const { rows } = await pool.query(
        `INSERT INTO hx_contacts (
           source, source_id, first_name, last_name, full_name,
           company_name, company_domain, country, vertical,
           email_pattern, phone, phone_source, raw_json
         ) VALUES (
           'bluezone', $1, $2, $3, $4,
           $5, $6, $7, 'textile',
           $8, $9, 'bluezone', $10::jsonb
         )
         ON CONFLICT (source, source_id) DO NOTHING
         RETURNING id`,
        [
          sid,
          first_name,
          last_name,
          c.full_name.trim(),
          c.company_name.trim(),
          domain,
          country,
          email,
          phone,
          JSON.stringify({
            import_module: MODULE,
            show: 'Munich Fabric Start / Bluezone',
            country,
          }),
        ],
      );

      if (rows.length) {
        inserted++;
        console.log(`inserted ${c.full_name} → ${rows[0].id}`);
      } else {
        skipped++;
        console.log(`exists  ${c.full_name} <${email}>`);
      }
    } catch (err) {
      errors++;
      console.error(`error  ${c.full_name}:`, err instanceof Error ? err.message : err);
    }
  }

  if (!DRY) {
    const { rows } = await pool.query(
      `SELECT source, COUNT(*)::int AS n
       FROM hx_contacts
       WHERE source NOT IN ('csv', 'companies_house')
       GROUP BY source
       ORDER BY n DESC`,
    );
    console.log('\nNon-csv/CH sources:', rows);
  }

  console.log(`\nDone — inserted=${inserted} skipped=${skipped} errors=${errors}`);
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
