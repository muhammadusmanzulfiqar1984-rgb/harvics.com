/**
 * scoreICP — pure ICP scoring function
 * Source: HARVYX_BACKEND_RULES.md § 7
 * Rules:
 *   - No database calls.
 *   - Return 0 if raw total < 50 (caller must discard).
 *   - Max score: 100 (25 × 4 pillars).
 */

import type { HxIcpBand, HxSource } from '../types/hx.types';

export interface IcpScoreResult {
  total: number;
  band: HxIcpBand;
  breakdown: {
    geography: number;
    title_seniority: number;
    vertical_fit: number;
    data_quality: number;
  };
}

export interface IcpInput {
  country: string | null | undefined;
  vertical: string | null | undefined;
  title: string | null | undefined;
  hasEmail: boolean;
  hasPhone: boolean;
  hasLinkedIn: boolean;
  source: HxSource;
}

// ── Geography ─────────────────────────────────────────────────────────────────
// Tier 1 (25): core EU sourcing/buying markets
// Tier 2 (18): secondary EU + GCC
// Tier 3 (12): US, APAC, LATAM
// Tier 4 (6):  everywhere else

const GEO_TIER1 = new Set([
  'de', 'germany',
  'pl', 'poland',
  'cz', 'czech republic', 'czechia',
  'at', 'austria',
  'hu', 'hungary',
  'sk', 'slovakia',
  'ro', 'romania',
  'tr', 'turkey',
  'fr', 'france',
  'it', 'italy',
  'nl', 'netherlands',
  'be', 'belgium',
  'es', 'spain',
  'gb', 'uk', 'united kingdom',
  'ae', 'uae', 'united arab emirates',
]);

const GEO_TIER2 = new Set([
  'sa', 'saudi arabia',
  'qa', 'qatar',
  'kw', 'kuwait',
  'pt', 'portugal',
  'ch', 'switzerland',
  'se', 'sweden',
  'dk', 'denmark',
  'no', 'norway',
  'fi', 'finland',
  'gr', 'greece',
  'hr', 'croatia',
  'rs', 'serbia',
  'bg', 'bulgaria',
]);

const GEO_TIER3 = new Set([
  'us', 'usa', 'united states',
  'ca', 'canada',
  'au', 'australia',
  'cn', 'china',
  'jp', 'japan',
  'in', 'india',
  'sg', 'singapore',
  'br', 'brazil',
  'mx', 'mexico',
  'za', 'south africa',
  'eg', 'egypt',
  'ng', 'nigeria',
  'pk', 'pakistan',
  'bd', 'bangladesh',
]);

function scoreGeography(country: string | null | undefined): number {
  if (!country) return 0;
  const c = country.trim().toLowerCase();
  if (GEO_TIER1.has(c)) return 25;
  if (GEO_TIER2.has(c)) return 18;
  if (GEO_TIER3.has(c)) return 12;
  return 6;
}

// ── Title / Seniority ─────────────────────────────────────────────────────────
// C-suite / Founder / Owner      → 25
// VP / Director / Head           → 20
// Manager / Buyer / Procurement  → 15
// Any other title present        → 8
// No title                       → 0

const TITLE_C_SUITE = /\b(ceo|coo|cfo|cto|chief|founder|co-founder|co founder|president|owner|managing director|md|gm|general manager|partner|proprietor)\b/i;
const TITLE_VP_DIR  = /\b(vp|vice president|director|head of|head,|chief procurement|cpo)\b/i;
const TITLE_MGR     = /\b(manager|buyer|purchasing|procurement|sourcing|supply chain|import|export|trade|commercial|business development|bdm|key account)\b/i;

function scoreTitleSeniority(title: string | null | undefined): number {
  if (!title) return 0;
  if (TITLE_C_SUITE.test(title)) return 25;
  if (TITLE_VP_DIR.test(title)) return 20;
  if (TITLE_MGR.test(title)) return 15;
  return 8;
}

// ── Vertical fit ──────────────────────────────────────────────────────────────
// Exact or close match → 25
// Adjacent / related   → 15
// Unrelated / missing  → 0

const VERTICAL_EXACT = new Set([
  'apparel', 'apparels', 'textiles', 'fashion', 'clothing', 'garments',
  'fmcg', 'consumer goods', 'food', 'beverages', 'grocery',
  'commodities', 'agriculture', 'agri', 'grains', 'softs',
  'industrial', 'manufacturing', 'chemicals', 'machinery',
  'minerals', 'metals', 'mining',
  'oil', 'gas', 'energy', 'petroleum',
  'real estate', 'property',
  'sourcing', 'procurement', 'logistics', 'supply chain', 'freight',
  'finance', 'trade finance', 'fintech',
]);

const VERTICAL_ADJACENT = new Set([
  'retail', 'wholesale', 'distribution', 'import', 'export',
  'trading', 'ecommerce', 'e-commerce',
  'pharma', 'healthcare', 'medical',
  'construction', 'infrastructure',
  'tech', 'technology', 'saas', 'software',
]);

function scoreVerticalFit(vertical: string | null | undefined): number {
  if (!vertical) return 0;
  const v = vertical.trim().toLowerCase();
  if (VERTICAL_EXACT.has(v)) return 25;
  for (const kw of VERTICAL_EXACT) {
    if (v.includes(kw) || kw.includes(v)) return 25;
  }
  if (VERTICAL_ADJACENT.has(v)) return 15;
  for (const kw of VERTICAL_ADJACENT) {
    if (v.includes(kw)) return 15;
  }
  return 0;
}

// ── Data quality ──────────────────────────────────────────────────────────────
// email + phone + linkedin → 25
// email + one of phone/linkedin → 18
// email only → 12
// phone + linkedin (no email) → 8
// linkedin only → 4
// nothing → 0

function scoreDataQuality(hasEmail: boolean, hasPhone: boolean, hasLinkedIn: boolean): number {
  const signals = (hasEmail ? 1 : 0) + (hasPhone ? 1 : 0) + (hasLinkedIn ? 1 : 0);
  if (hasEmail && hasPhone && hasLinkedIn) return 25;
  if (hasEmail && signals === 2) return 18;
  if (hasEmail) return 12;
  if (hasPhone && hasLinkedIn) return 8;
  if (hasLinkedIn) return 4;
  return 0;
}

// ── Band assignment ───────────────────────────────────────────────────────────

function assignBand(total: number): HxIcpBand {
  if (total >= 80) return 'lusha_tier';
  if (total >= 65) return 'apollo_tier';
  if (total >= 50) return 'nurture';
  return 'discard';
}

// ── Public function ───────────────────────────────────────────────────────────

export function scoreICP(input: IcpInput): number {
  const geography      = scoreGeography(input.country);
  const title_seniority = scoreTitleSeniority(input.title);
  const vertical_fit   = scoreVerticalFit(input.vertical);
  const data_quality   = scoreDataQuality(input.hasEmail, input.hasPhone, input.hasLinkedIn);

  const total = geography + title_seniority + vertical_fit + data_quality;

  // Caller must discard when score < 50
  return total < 50 ? 0 : total;
}

export function scoreICPFull(input: IcpInput): IcpScoreResult {
  const geography       = scoreGeography(input.country);
  const title_seniority = scoreTitleSeniority(input.title);
  const vertical_fit    = scoreVerticalFit(input.vertical);
  const data_quality    = scoreDataQuality(input.hasEmail, input.hasPhone, input.hasLinkedIn);

  const raw = geography + title_seniority + vertical_fit + data_quality;
  const total = raw < 50 ? 0 : raw;

  return {
    total,
    band: assignBand(total),
    breakdown: { geography, title_seniority, vertical_fit, data_quality },
  };
}
