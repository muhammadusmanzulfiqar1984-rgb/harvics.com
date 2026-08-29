/**
 * Shared lead identity / dedupe helpers for HarvyX Phase 3.
 */

export type LeadLike = Record<string, unknown>;

function str(v: unknown): string {
  return String(v ?? '').trim();
}

export function extractDomain(website: unknown): string {
  const raw = str(website);
  if (!raw) return '';
  try {
    const url = raw.includes('://') ? raw : `https://${raw}`;
    return new URL(url).hostname.replace(/^www\./i, '').toLowerCase();
  } catch {
    return raw
      .replace(/^https?:\/\//i, '')
      .replace(/^www\./i, '')
      .split('/')[0]
      .toLowerCase();
  }
}

/** Primary dedupe key: email → linkedin → name|company → domain */
export function leadDedupKey(lead: LeadLike): string | null {
  const email = str(lead.email || lead.workEmail).toLowerCase();
  const linkedin = str(lead.linkedin || lead.linkedinUrl).toLowerCase();
  const name = str(lead.contactName || lead.name).toLowerCase();
  const company = str(lead.company).toLowerCase();
  const domain = extractDomain(lead.website || lead.domain);
  if (email) return `e:${email}`;
  if (linkedin) return `l:${linkedin}`;
  if (name || company) return `n:${name}|${company}`;
  if (domain) return `d:${domain}`;
  return null;
}

export function splitContactName(name: unknown): {
  first_name: string | null;
  last_name: string | null;
  full_name: string | null;
} {
  const full = str(name);
  if (!full) return { first_name: null, last_name: null, full_name: null };
  const parts = full.split(/\s+/);
  if (parts.length === 1) return { first_name: parts[0], last_name: null, full_name: full };
  return { first_name: parts[0], last_name: parts.slice(1).join(' '), full_name: full };
}

export function mapLeadToHxContact(lead: LeadLike, source = 'd1') {
  const { first_name, last_name, full_name } = splitContactName(lead.contactName || lead.name);
  const email = str(lead.email || lead.workEmail).toLowerCase() || null;
  const linkedin = str(lead.linkedin || lead.linkedinUrl) || null;
  const scoreRaw = Number(lead.score);
  const score = Number.isFinite(scoreRaw) ? Math.max(0, Math.min(100, Math.round(scoreRaw))) : 0;
  const clip = (v: string | null | undefined, max: number) => {
    if (!v) return null;
    const s = String(v).trim();
    if (!s) return null;
    return s.length > max ? s.slice(0, max) : s;
  };
  const countryRaw = str(lead.country);
  const country = /^[a-z]{2}$/i.test(countryRaw) ? countryRaw.toUpperCase() : null;

  return {
    source,
    source_id: clip(str(lead.id) || null, 255),
    first_name: clip(first_name, 100),
    last_name: clip(last_name, 100),
    full_name: clip(full_name, 200),
    title: clip(str(lead.title) || null, 200),
    company_name: clip(str(lead.company) || null, 300),
    company_domain: clip(extractDomain(lead.website || lead.domain) || null, 200),
    country,
    vertical: clip(str(lead.segment || lead.vertical) || null, 100),
    email_pattern: clip(email, 200),
    phone: clip(str(lead.phone) || null, 50),
    linkedin_url: clip(linkedin, 500),
    icp_score: score,
    in_nurture_pool: score >= 50 && score <= 69,
    raw_json: {
      import_module: 'phase3-sync',
      d1_id: lead.id,
      city: lead.city,
      tags: lead.tags,
      status: lead.status,
      sourceFile: lead.sourceFile,
    },
  };
}

/** Hx contact → D1 lead patch (enrich writeback). Join on source_id when source=d1. */
export type LeadEnrichPatch = {
  id: string;
  email?: string;
  phone?: string;
  linkedin?: string;
  title?: string;
  contactName?: string;
  company?: string;
  website?: string;
  score?: number;
  status?: string;
};

export function mapHxContactToLeadPatch(contact: LeadLike): LeadEnrichPatch | null {
  const source = str(contact.source).toLowerCase();
  const raw = (contact.raw_json && typeof contact.raw_json === 'object'
    ? (contact.raw_json as LeadLike)
    : {}) as LeadLike;
  const id =
    (source === 'd1' ? str(contact.source_id) : '') ||
    str(raw.d1_id) ||
    str(contact.source_id);
  if (!id) return null;

  const email = str(contact.email_pattern || contact.email).toLowerCase();
  const phone = str(contact.phone);
  const linkedin = str(contact.linkedin_url || contact.linkedin);
  const title = str(contact.title);
  const fullName =
    str(contact.full_name) ||
    [str(contact.first_name), str(contact.last_name)].filter(Boolean).join(' ');
  const company = str(contact.company_name || contact.company);
  const domain = str(contact.company_domain);
  const website = domain ? (domain.includes('://') ? domain : `https://${domain}`) : '';
  const scoreRaw = Number(contact.icp_score ?? contact.score);
  const score = Number.isFinite(scoreRaw) ? Math.max(0, Math.min(100, Math.round(scoreRaw))) : undefined;

  const enriched =
    Boolean(contact.enriched_apollo) ||
    Boolean(contact.enriched_lusha) ||
    Boolean(contact.email_verified) ||
    Boolean(email || phone || linkedin);

  const patch: LeadEnrichPatch = { id };
  if (email) patch.email = email;
  if (phone) patch.phone = phone;
  if (linkedin) patch.linkedin = linkedin;
  if (title) patch.title = title;
  if (fullName) patch.contactName = fullName;
  if (company) patch.company = company;
  if (website) patch.website = website;
  if (score !== undefined) patch.score = score;
  if (enriched) patch.status = 'enriched';

  // Need at least one enrich field beyond id
  const keys = Object.keys(patch).filter((k) => k !== 'id');
  return keys.length ? patch : null;
}
