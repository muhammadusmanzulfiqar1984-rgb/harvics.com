import {
  friendlySourceLabel,
  searchLibraryCatalog,
  type LibraryEntry,
} from '@/lib/harvyx/dataBanks';

export type HarvyxLead = Record<string, any>;

function leadHaystack(l: HarvyxLead): string {
  return `${l.company || ''} ${l.contactName || l.name || ''} ${l.title || ''} ${l.email || ''} ${l.phone || ''} ${l.country || ''} ${l.city || ''} ${l.segment || ''} ${l.sourceFile || ''}`.toLowerCase();
}

export function searchTokens(q: string): string[] {
  return q
    .split(/\s+/)
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);
}

function leadMatchesQuery(l: HarvyxLead, tokens: string[]): boolean {
  if (!tokens.length) return true;
  const hay = leadHaystack(l);
  return tokens.some((t) => hay.includes(t));
}

function leadMatchScore(l: HarvyxLead, tokens: string[]): number {
  const hay = leadHaystack(l);
  return tokens.reduce((n, t) => (hay.includes(t) ? n + 1 : n), 0);
}

function fromRow(r: any): HarvyxLead {
  let tags: any = [];
  try {
    tags = r.tags ? JSON.parse(r.tags) : [];
  } catch {
    tags = [];
  }
  return {
    id: r.id,
    source: r.source,
    sourceFile: r.source_file,
    company: r.company,
    contactName: r.contact_name,
    title: r.title,
    email: r.email,
    phone: r.phone,
    linkedin: r.linkedin,
    website: r.website,
    country: r.country,
    city: r.city,
    segment: r.segment,
    tags,
    status: r.status,
    score: r.score,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

async function getDb(): Promise<any | null> {
  try {
    const mod: any = await import('@opennextjs/cloudflare');
    const ctx = await mod.getCloudflareContext({ async: true });
    return ctx?.env?.LEADS_DB ?? null;
  } catch {
    return null;
  }
}

let cachedJson: HarvyxLead[] | null = null;

async function loadJsonFallback(): Promise<HarvyxLead[]> {
  if (cachedJson) return cachedJson;
  const fs = await import('node:fs/promises');
  const path = await import('node:path');
  const file = path.join(process.cwd(), 'src', 'data', 'harvyx', 'leads.json');
  const raw = await fs.readFile(file, 'utf8');
  cachedJson = JSON.parse(raw);
  return cachedJson!;
}

export function invalidateLeadsCache() {
  cachedJson = null;
}

export interface LeadSearchResult {
  leads: HarvyxLead[];
  total: number;
  source: 'd1' | 'json';
}

export interface SourceGroup {
  sourceFile: string;
  label: string;
  count: number;
  leads: HarvyxLead[];
}

export interface GroupedLeadSearchResult {
  total: number;
  groups: SourceGroup[];
  source: 'd1' | 'json';
  distinctSources: number;
}

export interface AllDataBankSearchResult {
  query: string;
  bank: GroupedLeadSearchResult;
  library: LibraryEntry[];
  live: HarvyxLead[];
}

function buildSearchWhere(query: string): { where: string; binds: string[] } {
  const binds: string[] = [];
  if (!query) return { where: '', binds };

  const tokens = searchTokens(query);
  if (!tokens.length) return { where: '', binds };

  if (tokens.length === 1) {
    binds.push(`%${tokens[0]}%`);
    return { where: 'WHERE search_text LIKE ?1', binds };
  }

  const parts = tokens.map((_, i) => `search_text LIKE ?${i + 1}`);
  tokens.forEach((t) => binds.push(`%${t}%`));
  return { where: `WHERE (${parts.join(' OR ')})`, binds };
}

/** Search contacts grouped by import file / data bank source. */
export async function searchLeadsBySource(
  q: string,
  perSource = 4,
  maxSources = 12,
  sampleLimit = 150,
): Promise<GroupedLeadSearchResult> {
  const query = q.trim().toLowerCase();
  const db = await getDb();

  if (db) {
    try {
      const { where, binds } = buildSearchWhere(query);

      const countRow = await db
        .prepare(`SELECT COUNT(*) AS c FROM leads ${where}`)
        .bind(...binds)
        .first();
      const total = Number(countRow?.c ?? 0);

      const breakdown = await db
        .prepare(
          `SELECT COALESCE(NULLIF(source_file, ''), 'Unknown import') AS sf, COUNT(*) AS c
           FROM leads ${where}
           GROUP BY sf
           ORDER BY c DESC
           LIMIT ${maxSources}`,
        )
        .bind(...binds)
        .all();

      const listSql = `SELECT * FROM leads ${where} ORDER BY score DESC LIMIT ${sampleLimit}`;
      const list = await db.prepare(listSql).bind(...binds).all();
      const leads = (list?.results || []).map(fromRow);

      const bucket = new Map<string, HarvyxLead[]>();
      for (const lead of leads) {
        const key = lead.sourceFile || 'Unknown import';
        if (!bucket.has(key)) bucket.set(key, []);
        const arr = bucket.get(key)!;
        if (arr.length < perSource) arr.push(lead);
      }

      const groups: SourceGroup[] = (breakdown?.results || []).map((row: any) => {
        const sourceFile = row.sf as string;
        return {
          sourceFile,
          label: friendlySourceLabel(sourceFile),
          count: Number(row.c ?? 0),
          leads: bucket.get(sourceFile) || [],
        };
      });

      return {
        total,
        groups,
        source: 'd1',
        distinctSources: groups.length,
      };
    } catch (err) {
      console.error('[harvyx/leadSearch] grouped D1 query failed:', err);
    }
  }

  const all = await loadJsonFallback();
  const tokens = searchTokens(query);
  const filtered = tokens.length
    ? all
        .filter((l) => leadMatchesQuery(l, tokens))
        .sort((a, b) => leadMatchScore(b, tokens) - leadMatchScore(a, tokens))
    : all;

  const counts = new Map<string, number>();
  for (const lead of filtered) {
    const key = lead.sourceFile || 'Unknown import';
    counts.set(key, (counts.get(key) || 0) + 1);
  }

  const sortedKeys = [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxSources)
    .map(([k]) => k);

  const groups: SourceGroup[] = sortedKeys.map((sourceFile) => {
    const groupLeads = filtered
      .filter((l) => (l.sourceFile || 'Unknown import') === sourceFile)
      .slice(0, perSource);
    return {
      sourceFile,
      label: friendlySourceLabel(sourceFile),
      count: counts.get(sourceFile) || 0,
      leads: groupLeads,
    };
  });

  return {
    total: filtered.length,
    groups,
    source: 'json',
    distinctSources: counts.size,
  };
}

/** Search every HarvyX data bank: imports, source catalog, live APIs. */
export async function searchAllDataBanks(
  query: string,
  opts: { includeLive?: boolean } = {},
): Promise<AllDataBankSearchResult> {
  const includeLive = opts.includeLive !== false;
  const bank = await searchLeadsBySource(query, 4, 12, 150);
  const library = searchLibraryCatalog(query, 10);
  const live = includeLive
    ? await discoverLiveLeads(`${query} wholesale importer distributor`, 6)
    : [];
  return { query, bank, library, live };
}

/** Search the real HarvyX contact bank (D1 in prod, JSON locally). */
export async function searchLeads(
  q: string,
  limit = 15,
  offset = 0,
): Promise<LeadSearchResult> {
  const query = q.trim().toLowerCase();
  const db = await getDb();

  if (db) {
    try {
      const clauses: string[] = [];
      const binds: any[] = [];
      let n = 1;
      if (query) {
        const tokens = searchTokens(query);
        if (tokens.length === 1) {
          clauses.push(`search_text LIKE ?${n++}`);
          binds.push(`%${tokens[0]}%`);
        } else if (tokens.length > 1) {
          clauses.push(`(${tokens.map(() => `search_text LIKE ?${n++}`).join(' OR ')})`);
          tokens.forEach((t) => binds.push(`%${t}%`));
        }
      }
      const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
      const countRow = await db
        .prepare(`SELECT COUNT(*) AS c FROM leads ${where}`)
        .bind(...binds)
        .first();
      const total = Number(countRow?.c ?? 0);
      const listSql = `SELECT * FROM leads ${where} ORDER BY score DESC LIMIT ${limit} OFFSET ${offset}`;
      const list = await db.prepare(listSql).bind(...binds).all();
      return {
        leads: (list?.results || []).map(fromRow),
        total,
        source: 'd1',
      };
    } catch (err) {
      console.error('[harvyx/leadSearch] D1 query failed, using JSON fallback:', err);
    }
  }

  const all = await loadJsonFallback();
  const tokens = searchTokens(query);
  const filtered = tokens.length
    ? all
        .filter((l) => leadMatchesQuery(l, tokens))
        .sort((a, b) => leadMatchScore(b, tokens) - leadMatchScore(a, tokens))
    : all;
  return {
    leads: filtered.slice(offset, offset + limit),
    total: filtered.length,
    source: 'json',
  };
}

function domainFromUrl(url?: string): string {
  if (!url) return '';
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

/** Google Places live discovery — real businesses only. */
export async function discoverLiveLeads(query: string, max = 8): Promise<HarvyxLead[]> {
  const PLACES_KEY = process.env.GOOGLE_PLACES_API_KEY || '';
  const SERPER_KEY = process.env.SERPER_API_KEY || '';
  if (!PLACES_KEY && !SERPER_KEY) return [];

  if (PLACES_KEY) {
    try {
      const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${PLACES_KEY}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Places ${res.status}`);
      const data = await res.json();
      if (data.status && data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
        throw new Error(`Places: ${data.status}`);
      }
      const results = (data.results || []).slice(0, max);
      const detailed = await Promise.all(
        results.map(async (r: any) => {
          let phone = '';
          let website = '';
          try {
            const dUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${r.place_id}&fields=formatted_phone_number,international_phone_number,website&key=${PLACES_KEY}`;
            const dRes = await fetch(dUrl);
            const dJson = await dRes.json();
            const res2 = dJson.result || {};
            phone = res2.international_phone_number || res2.formatted_phone_number || '';
            website = res2.website || '';
          } catch {
            /* optional */
          }
          return {
            id: `live_places_${r.place_id}`,
            source: 'google_places',
            company: r.name || '',
            contactName: '',
            email: '',
            phone,
            website,
            city: r.formatted_address || '',
            country: '',
            score: Math.round((r.rating || 0) * 18) || 40,
            live: true,
          } as HarvyxLead;
        }),
      );
      if (detailed.length) return detailed;
    } catch (err) {
      console.error('[harvyx/leadSearch] Places failed:', err);
    }
  }

  if (!SERPER_KEY) return [];
  try {
    const res = await fetch('https://google.serper.dev/search', {
      method: 'POST',
      headers: { 'X-API-KEY': SERPER_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ q: query, num: max }),
    });
    if (!res.ok) throw new Error(`Serper ${res.status}`);
    const data = await res.json();
    return (data.organic || []).slice(0, max).map((o: any, i: number) => {
      const domain = domainFromUrl(o.link);
      return {
        id: `live_serper_${i}_${domain}`,
        source: 'serper',
        company: o.title || domain,
        website: o.link || '',
        linkedin: o.link?.includes('linkedin.com') ? o.link : '',
        snippet: o.snippet || '',
        score: 45,
        live: true,
      } as HarvyxLead;
    });
  } catch (err) {
    console.error('[harvyx/leadSearch] Serper failed:', err);
    return [];
  }
}

const STOP_WORDS =
  /\b(harvyx|please|can you|could you|help me|i want|i need|show me|find me|list|search for|look for|discover|get me|give me|buyers?|contacts?|leads?|companies|suppliers?|wholesalers?|importers?|distributors?|in|the|a|an|for|of|and|with|from|about|who are|what are|tell me)\b/gi;

export function isBuyerSearchIntent(text: string): boolean {
  const t = text.toLowerCase();
  return (
    /\b(find|search|list|show|discover|look up|lookup|get)\b/.test(t) &&
    /\b(buyers?|wholesalers?|importers?|distributors?|contacts?|companies|leads?|suppliers?|retailers?)\b/.test(t)
  ) || /\b(denim|textile|apparel|fabric|garment|fmcg)\b.*\b(russia|moscow|turkey|spain|madrid|dubai|gcc|uk|france|germany|italy|poland|pakistan|india|china|usa|europe|asia)\b/i.test(t);
}

export function extractSearchQuery(text: string): string {
  const cleaned = text.replace(STOP_WORDS, ' ').replace(/\s+/g, ' ').trim();
  return cleaned || text.trim();
}

function leadLine(l: HarvyxLead): string {
  const name = l.contactName
    ? `**${l.contactName}**${l.company ? ` @ ${l.company}` : ''}`
    : `**${l.company || 'Unknown company'}**`;
  const loc = [l.city, l.country].filter(Boolean).join(', ');
  const bits = [loc, l.title, l.email, l.phone, l.linkedin ? 'LinkedIn on file' : '']
    .filter(Boolean)
    .join(' · ');
  return `* ${name}${bits ? ` — ${bits}` : ''}`;
}

export function formatRealBuyerReply(
  query: string,
  bank: GroupedLeadSearchResult,
  library: LibraryEntry[],
  live: HarvyxLead[],
): string {
  const lines: string[] = [];
  lines.push(`**Real results for:** ${query}`);
  lines.push('');

  if (bank.total > 0) {
    lines.push(
      `**Contact data banks** — ${bank.total.toLocaleString()} match${bank.total === 1 ? '' : 'es'} across **${bank.distinctSources} import source${bank.distinctSources === 1 ? '' : 's'}**`,
    );
    lines.push('');

    for (const group of bank.groups) {
      if (!group.count) continue;
      lines.push(`**${group.label}** (${group.count.toLocaleString()} in bank)`);
      if (group.leads.length) {
        group.leads.forEach((l) => lines.push(leadLine(l)));
      } else {
        lines.push(`* ${group.count.toLocaleString()} records — open **Data Bank** to browse this file`);
      }
      lines.push('');
    }

    if (bank.total > bank.groups.reduce((n, g) => n + g.leads.length, 0)) {
      lines.push(`_Open **Data Bank** tab for full paginated results (${bank.total.toLocaleString()} total)._`);
      lines.push('');
    }
  } else {
    lines.push('_No matches in imported contact banks (Apollo, exhibitions, LinkedIn exports, etc.)._');
    lines.push('');
  }

  if (library.length) {
    lines.push(`**Source & fair catalog** — ${library.length} relevant entries`);
    lines.push('');
    library.slice(0, 8).forEach((item) => {
      const where = [item.tags?.[0], item.tags?.[1]].filter(Boolean).join(', ');
      lines.push(`* **${item.title}**${where ? ` — ${where}` : ''} _(${item.category})_`);
    });
    lines.push('');
  }

  if (live.length) {
    lines.push(`**Live discover** — ${live.length} listing${live.length === 1 ? '' : 's'} (Google Places / web)`);
    lines.push('');
    live.slice(0, 6).forEach((l) => {
      const bits = [l.city, l.phone, l.website].filter(Boolean).join(' · ');
      lines.push(`* **${l.company || 'Listing'}**${bits ? ` — ${bits}` : ''}`);
    });
    lines.push('');
  }

  if (!bank.total && !library.length && !live.length) {
    lines.push('_Try different keywords, a city name, or an exhibition name (Heimtextil, Gulfood, Apollo, etc.)._');
    lines.push('');
  }

  lines.push('_Results from your real import files + catalog + live APIs only — nothing invented._');
  return lines.join('\n');
}

export function toBuyerSearchAction(
  query: string,
  bank: GroupedLeadSearchResult,
  library: LibraryEntry[],
  live: HarvyxLead[],
) {
  const flatLeads = bank.groups.flatMap((g) =>
    g.leads.map((l) => ({
      company: l.company || l.contactName || '—',
      name: l.contactName || '',
      city: l.city || '',
      country: l.country || '',
      email: l.email || '',
      phone: l.phone || '',
      score: l.score || '',
      source: g.label,
      sourceFile: g.sourceFile,
    })),
  );

  const results = [
    ...flatLeads,
    ...live.map((l) => ({
      company: l.company || '—',
      city: l.city || '',
      phone: l.phone || '',
      score: l.score || '',
      source: l.source || 'live',
      sourceFile: 'live',
    })),
  ];

  return {
    type: 'buyer_search' as const,
    city: query,
    results,
    sourceGroups: bank.groups.map((g) => ({
      label: g.label,
      sourceFile: g.sourceFile,
      count: g.count,
    })),
    libraryMatches: library.map((i) => ({ title: i.title, category: i.category })),
    bankTotal: bank.total,
    distinctSources: bank.distinctSources,
    liveCount: live.length,
    realData: true,
  };
}
