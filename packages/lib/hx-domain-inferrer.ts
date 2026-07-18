/**
 * hx-domain-inferrer — pattern-based company domain inference
 * Source: HARVYX_BACKEND_RULES.md § 9
 * Rules:
 *   - No external API calls in phase 1. Pattern matching only.
 *   - Strips all common legal suffixes across EU/GCC markets.
 *   - Returns best-guess domain string (e.g. "acmecorp.com").
 */

// ── Legal suffix patterns ─────────────────────────────────────────────────────
// Ordered longest-first to prevent partial matches (e.g. "sp. z o.o." before "sp.")

const LEGAL_SUFFIX_PATTERNS: RegExp[] = [
  // Polish
  /\bsp(?:\.|ółka)?\s+z\s+o\.?\s*o\.?\b/gi,         // Sp. z o.o. / Sp. z oo
  /\bspółka\s+z\s+ograniczoną\s+odpowiedzialnością\b/gi,
  /\bsp(?:\.?\s*)k\.?\b/gi,                           // Sp. k. (partnership)
  /\bs\.a\.\b/gi,                                     // S.A. (Poland)

  // Czech / Slovak
  /\bs\.?\s*r\.?\s*o\.?\b/gi,                         // s.r.o.
  /\ba\.?\s*s\.?\b/gi,                                // a.s.

  // German / Austrian / Swiss
  /\bgmbh\s*&\s*co\.?\s*kg\b/gi,                     // GmbH & Co. KG
  /\bgmbh\b/gi,                                       // GmbH
  /\bag\b/gi,                                         // AG
  /\ke\s*g\b/gi,                                     // eG (cooperative)
  /\bgbr\b/gi,                                        // GbR
  /\bkg\b/gi,                                         // KG

  // French
  /\bs\.?\s*a\.?\s*s\.?\b/gi,                        // SAS / S.A.S.
  /\bs\.?\s*a\.\b/gi,                                 // S.A.
  /\beurl\b/gi,                                       // EURL
  /\bsarl\b/gi,                                       // SARL
  /\bsci\b/gi,                                        // SCI

  // Dutch / Belgian
  /\bb\.?\s*v\.?\b/gi,                               // BV / B.V.
  /\bn\.?\s*v\.?\b/gi,                               // NV / N.V.

  // Spanish / Portuguese
  /\bs\.?\s*l\.?\b/gi,                               // S.L. / SL
  /\bltda\b/gi,                                       // Ltda.
  /\bs\.?\s*a\.?\s*u\.?\b/gi,                        // SAU

  // Hungarian
  /\bkft\.?\b/gi,                                     // Kft.
  /\bzrt\.?\b/gi,                                     // Zrt.
  /\bbt\.?\b/gi,                                      // Bt.
  /\bnyrt\.?\b/gi,                                    // Nyrt.

  // Romanian
  /\bs\.?\s*r\.?\s*l\.?\b/gi,                        // SRL / S.R.L.

  // Swedish
  /\bab\b/gi,                                         // AB

  // Danish / Norwegian
  /\ba\/s\b/gi,                                       // A/S
  /\baps\b/gi,                                        // ApS

  // Finnish
  /\boy\b/gi,                                         // Oy

  // Italian
  /\bs\.?\s*p\.?\s*a\.?\b/gi,                        // SpA / S.p.A.
  /\bs\.?\s*r\.?\s*l\.?\b/gi,                        // Srl / S.r.l.

  // Turkish
  /\ba\.?\s*ş\.?\b/gi,                               // A.Ş. (Anonim Şirketi)
  /\blimited\s+şirketi\b/gi,

  // UAE / GCC
  /\bllc\b/gi,                                        // LLC
  /\bfze\b/gi,                                        // FZE
  /\bfzco\b/gi,                                       // FZCO
  /\bpjsc\b/gi,                                       // PJSC

  // UK
  /\blimited\b/gi,                                    // Limited (before Ltd)
  /\bltd\.?\b/gi,                                     // Ltd / Ltd.
  /\bllp\b/gi,                                        // LLP
  /\bplc\b/gi,                                        // PLC

  // US / International
  /\bincorporated\b/gi,
  /\binc\.?\b/gi,                                     // Inc.
  /\bcorporation\b/gi,
  /\bcorp\.?\b/gi,                                    // Corp.
  /\bcompany\b/gi,
  /\bco\.?\b/gi,                                      // Co.
  /\bgroup\b/gi,
  /\bholding(?:s)?\b/gi,
  /\binternational\b/gi,
  /\bglobal\b/gi,
  /\bindustries\b/gi,
  /\benterprises\b/gi,
  /\bsolutions\b/gi,
  /\bservices\b/gi,
  /\btrading\b/gi,
];

// Characters that are meaningless in a domain slug
const NOISE_CHARS = /[^a-z0-9]/g;

// Common generic words that reduce domain quality if they're the whole slug
const GENERIC_SLUGS = new Set(['the', 'and', 'for', 'of', 'in', 'at', 'by']);

// ── Core function ─────────────────────────────────────────────────────────────

/**
 * inferDomain
 * Strips legal suffixes from a company name and returns a best-guess domain.
 *
 * Examples:
 *   "Acme Textiles GmbH"          → "acmetextiles.com"
 *   "Warszawa Trading Sp. z o.o." → "warszawa-trading.com"  (preserved hyphen)
 *   "Müller & Söhne AG"           → "mullersohne.com"
 *   "ABC S.R.L."                  → "abc.com"
 */
export function inferDomain(companyName: string): string {
  let name = companyName.trim();

  // Strip legal suffixes
  for (const pattern of LEGAL_SUFFIX_PATTERNS) {
    name = name.replace(pattern, ' ');
  }

  // Normalize unicode (ü → u, ö → o, ä → a, ß → ss, ę → e, etc.)
  name = name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')   // strip combining diacritics
    .replace(/ß/g, 'ss')
    .replace(/ø/gi, 'o')
    .replace(/ł/gi, 'l')
    .replace(/æ/gi, 'ae')
    .replace(/þ/gi, 'th')
    .replace(/đ/gi, 'd');

  // Remove remaining non-alphanumeric, collapse whitespace
  const slug = name
    .toLowerCase()
    .replace(/&/g, '')                  // drop ampersands
    .replace(NOISE_CHARS, '')           // drop all non-alnum
    .replace(/\s+/g, '')               // collapse spaces
    .trim();

  if (!slug || GENERIC_SLUGS.has(slug)) {
    // Fallback: use first two words of original slugified
    const fallback = companyName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(NOISE_CHARS, ' ')
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .join('');
    return fallback ? `${fallback}.com` : 'unknown.com';
  }

  return `${slug}.com`;
}

/**
 * inferDomainCandidates
 * Returns up to 3 plausible variants for fuzzy matching.
 *
 * Examples:
 *   "Acme Textiles GmbH" → ["acmetextiles.com", "acme.com", "acmetextiles.de"]
 */
export function inferDomainCandidates(
  companyName: string,
  countryCode?: string,
): string[] {
  const primary = inferDomain(companyName);

  // Extract first word as a short candidate
  const firstWord = companyName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(NOISE_CHARS, ' ')
    .trim()
    .split(/\s+/)[0]
    .replace(NOISE_CHARS, '');

  const short = firstWord && firstWord !== primary.replace('.com', '')
    ? `${firstWord}.com`
    : null;

  // Country-specific TLD variant
  const TLD_BY_COUNTRY: Record<string, string> = {
    de: '.de', pl: '.pl', cz: '.cz', at: '.at', hu: '.hu', sk: '.sk',
    ro: '.ro', fr: '.fr', it: '.it', nl: '.nl', be: '.be', es: '.es',
    gb: '.co.uk', uk: '.co.uk', se: '.se', dk: '.dk', no: '.no',
    fi: '.fi', ch: '.ch', tr: '.com.tr', ae: '.ae',
  };

  const cc = countryCode?.toLowerCase();
  const tld = cc ? TLD_BY_COUNTRY[cc] : null;
  const localVariant = tld
    ? `${primary.replace('.com', '')}${tld}`
    : null;

  return [primary, short, localVariant]
    .filter((d): d is string => Boolean(d) && d !== primary || d === primary)
    .filter((d, i, arr) => arr.indexOf(d) === i)
    .slice(0, 3);
}
