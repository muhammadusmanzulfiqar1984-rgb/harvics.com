/**
 * hx-vcf-generator.ts — VCF 3.0 contact card generator
 * Source: HARVYX_DATABANK_ARCH.md § 3 (contact export)
 *
 * Generates valid VCF 3.0 strings from HxContact records.
 * Filename convention:
 *   {PREFIX}-{COUNTRY}-{SEQ} | {company} | EMAIL✓/NO EMAIL | LI✓
 */

import type { HxContact } from '../types/hx.types';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface VcfExportResult {
  vcf:      string;
  filename: string;
}

interface VcfFieldMap {
  fn:    string;
  org:   string;
  telWork: string | null;
  telCell: string | null;
  email: string | null;
  url:   string | null;
  adr:   string | null;
}

// ── Source prefix map ─────────────────────────────────────────────────────────

const SOURCE_PREFIX: Record<string, string> = {
  bluezone:         'BZ',
  innatex:          'IN',
  source_fashion:   'SF',
  supreme_dus:      'SD',
  handelsregister:  'HR',
  linkedin_public:  'LI',
  companies_house:  'CH',
  krs:              'KRS',
  ares:             'ARES',
  csv:              'CSV',
};

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Escape special characters per RFC 6350. */
function escapeVcf(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

/** Build display name from contact fields. */
function displayName(contact: HxContact): string {
  return (
    contact.full_name?.trim() ||
    [contact.first_name, contact.last_name].filter(Boolean).join(' ') ||
    'Unknown Contact'
  );
}

/** Resolve two-letter country code for filename. */
function countryCode(contact: HxContact): string {
  const c = (contact.country ?? 'XX').trim().toUpperCase();
  return c.length === 2 ? c : 'XX';
}

/** Map HxContact to VCF field set. */
function mapContactFields(contact: HxContact): VcfFieldMap {
  const org = contact.company_name?.trim() ?? '';
  const email = contact.email_verified && contact.email_pattern
    ? contact.email_pattern.trim()
    : contact.email_pattern?.trim() ?? null;

  const telWork = contact.phone?.trim() ?? null;
  const telCell = contact.phone_source === 'lusha' ? contact.phone?.trim() ?? null : null;

  const url = contact.linkedin_url?.trim()
    ?? (contact.company_domain ? `https://${contact.company_domain}` : null);

  const adr = contact.country
    ? `;;${org};;;${contact.country.toUpperCase()}`
    : null;

  return {
    fn: displayName(contact),
    org,
    telWork: telWork && !telCell ? telWork : telWork,
    telCell,
    email,
    url,
    adr,
  };
}

/** Build one VCF 3.0 card block for a single contact. */
export function buildVcardBlock(contact: HxContact): string {
  const f = mapContactFields(contact);
  const lines: string[] = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${escapeVcf(f.fn)}`,
  ];

  if (f.org)       lines.push(`ORG:${escapeVcf(f.org)}`);
  if (f.telWork)   lines.push(`TEL;TYPE=WORK:${escapeVcf(f.telWork)}`);
  if (f.telCell)   lines.push(`TEL;TYPE=CELL:${escapeVcf(f.telCell)}`);
  if (f.email)     lines.push(`EMAIL;TYPE=WORK:${escapeVcf(f.email)}`);
  if (f.url)       lines.push(`URL:${escapeVcf(f.url)}`);
  if (f.adr)       lines.push(`ADR;TYPE=WORK:${escapeVcf(f.adr)}`);

  lines.push('END:VCARD');
  return lines.join('\r\n');
}

/**
 * Build export filename for one contact.
 * Format: {PREFIX}-{COUNTRY}-{SEQ} | {company} | EMAIL✓/NO EMAIL | LI✓
 */
export function buildVcfFilename(
  contact: HxContact,
  seq: number,
  batchSource?: string,
): string {
  const prefix  = SOURCE_PREFIX[batchSource ?? contact.source] ?? 'HX';
  const country = countryCode(contact);
  const seqPad  = String(seq).padStart(3, '0');
  const company = (contact.company_name ?? 'Unknown').replace(/[|/\\]/g, '-').slice(0, 40);
  const emailTag = contact.email_verified || contact.email_pattern ? 'EMAIL✓' : 'NO EMAIL';
  const liTag    = contact.linkedin_url ? 'LI✓' : 'LI✗';

  return `${prefix}-${country}-${seqPad} | ${company} | ${emailTag} | ${liTag}.vcf`;
}

/**
 * Generate a combined VCF export for multiple contacts.
 * Returns the full VCF string and a batch download filename.
 */
export function generateVCF(
  contacts: HxContact[],
  opts?: { source?: string; country?: string },
): VcfExportResult {
  if (!contacts.length) {
    return { vcf: '', filename: 'harvyx-empty.vcf' };
  }

  const blocks = contacts.map((c) => buildVcardBlock(c));
  const vcf    = `${blocks.join('\r\n\r\n')}\r\n`;

  const prefix  = SOURCE_PREFIX[opts?.source ?? contacts[0].source] ?? 'HX';
  const country = opts?.country ?? countryCode(contacts[0]);
  const date    = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const filename = `${prefix}-${country}-export-${contacts.length}contacts-${date}.vcf`;

  return { vcf, filename };
}

/**
 * Generate individual VCF files for each contact (utility for batch tooling).
 */
export function generateVCFPerContact(
  contacts: HxContact[],
): Array<{ vcf: string; filename: string }> {
  return contacts.map((contact, idx) => ({
    vcf:      `${buildVcardBlock(contact)}\r\n`,
    filename: buildVcfFilename(contact, idx + 1),
  }));
}
