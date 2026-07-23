import { NextRequest, NextResponse } from 'next/server';
import { invalidateLeadsCache as clearSharedLeadsCache } from '@/lib/harvyx/leadSearch';
import { authenticate } from '../auth';

export const dynamic = 'force-dynamic';

type Lead = Record<string, any>;

/* ── Map a D1 row (snake_case) back to the HarvyX lead shape ── */
function leadHaystack(l: Lead): string {
  return `${l.company || ''} ${l.contactName || l.name || ''} ${l.title || ''} ${l.email || ''} ${l.phone || ''} ${l.country || ''} ${l.city || ''} ${l.segment || ''} ${l.sourceFile || ''}`.toLowerCase();
}

/** Split search into words — match if ANY word hits (easy search). */
function searchTokens(q: string): string[] {
  return q.split(/\s+/).map((t) => t.trim().toLowerCase()).filter(Boolean);
}

function leadMatchesQuery(l: Lead, tokens: string[]): boolean {
  if (!tokens.length) return true;
  const hay = leadHaystack(l);
  return tokens.some((t) => hay.includes(t));
}

/** Relevance: title/company hits weigh far more than a generic blob hit. */
function leadMatchScore(l: Lead, tokens: string[]): number {
  if (!tokens.length) return 0;
  const company = String(l.company || '').toLowerCase();
  const title = String(l.title || l.jobTitle || l.role || '').toLowerCase();
  const segment = String(l.segment || l.industry || '').toLowerCase();
  const hay = leadHaystack(l);
  let score = 0;
  for (const t of tokens) {
    if (company.includes(t)) score += 6;
    if (title.includes(t)) score += 5;
    if (segment.includes(t)) score += 2;
    if (hay.includes(t)) score += 1;
  }
  return score;
}

function hasVal(v: any): number {
  return v && String(v).trim() ? 1 : 0;
}

function fromRow(r: any): Lead {
  let tags: any = [];
  try { tags = r.tags ? JSON.parse(r.tags) : []; } catch { tags = []; }
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

/* ── Try to get the D1 binding (present on Cloudflare Workers). ── */
async function getDb(): Promise<any | null> {
  try {
    const mod: any = await import('@opennextjs/cloudflare');
    const ctx = await mod.getCloudflareContext({ async: true });
    return ctx?.env?.LEADS_DB ?? null;
  } catch {
    return null;
  }
}

/* ── Dev fallback: read leads.json from disk at runtime (Node only).
     Kept out of the static import graph so the 29MB file is NOT bundled. ── */
let cachedJson: Lead[] | null = null;
let cachedCounts: Record<string, number> | null = null;

function computeCounts(all: Lead[]) {
  const withEmail = all.filter((l) => !!(l.email || l.workEmail)).length;
  return {
    total: all.length,
    qualified: all.filter((l) => (l.status || '') === 'qualified').length,
    withEmail,
    withPhone: all.filter((l) => !!(l.phone || l.mobile || l.directDial)).length,
    withLinkedin: all.filter((l) => !!(l.linkedin || l.linkedinUrl)).length,
    followUp: all.length - withEmail,
  };
}

async function loadJsonFallback(): Promise<Lead[]> {
  if (cachedJson) return cachedJson;
  const fs = await import('node:fs/promises');
  const path = await import('node:path');
  const file = path.join(process.cwd(), 'src', 'data', 'harvyx', 'leads.json');
  const raw = await fs.readFile(file, 'utf8');
  cachedJson = JSON.parse(raw);
  cachedCounts = computeCounts(cachedJson!);
  return cachedJson!;
}

/** Clear in-memory cache after uploads / imports. */
export function invalidateLeadsCache() {
  cachedJson = null;
  cachedCounts = null;
  clearSharedLeadsCache();
}

export async function GET(req: NextRequest) {
  const authError = authenticate(req);
  if (authError) return authError;

  const { searchParams } = new URL(req.url);
  const q = (searchParams.get('q') || '').trim().toLowerCase();
  const status = (searchParams.get('status') || '').trim().toLowerCase();
  const idsParam = (searchParams.get('ids') || '').trim();
  const idList = idsParam
    ? idsParam.split(',').map((s) => s.trim()).filter(Boolean).slice(0, 500)
    : [];
  const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '50', 10) || 50, 1), 500);
  const offset = Math.max(parseInt(searchParams.get('offset') || '0', 10) || 0, 0);

  const db = await getDb();

  /* ── Cloudflare D1 path ── */
  if (db) {
    try {
      const tokens = q ? searchTokens(q) : [];

      // WHERE: match if ANY token appears in the search_text blob.
      const whereClauses: string[] = [];
      const whereBinds: any[] = [];
      if (tokens.length) {
        whereClauses.push(`(${tokens.map(() => `search_text LIKE ?`).join(' OR ')})`);
        tokens.forEach((t) => whereBinds.push(`%${t}%`));
      }
      if (status) {
        whereClauses.push(`status = ?`);
        whereBinds.push(status);
      }
      if (idList.length) {
        whereClauses.push(`id IN (${idList.map(() => `?`).join(',')})`);
        whereBinds.push(...idList);
      }
      const where = whereClauses.length ? `WHERE ${whereClauses.join(' AND ')}` : '';

      const countRow = await db
        .prepare(`SELECT COUNT(*) AS c FROM leads ${where}`)
        .bind(...whereBinds)
        .first();
      const total = Number(countRow?.c ?? 0);

      // Relevance ranking: title/company matches weigh far more than a blob
      // match, then prefer records that actually have email/phone on file.
      const relBinds: any[] = [];
      let relevanceExpr = '0';
      if (tokens.length) {
        const parts: string[] = [];
        for (const t of tokens) {
          parts.push(`(CASE WHEN lower(COALESCE(company,'')) LIKE ? THEN 6 ELSE 0 END)`);
          relBinds.push(`%${t}%`);
          parts.push(`(CASE WHEN lower(COALESCE(title,'')) LIKE ? THEN 5 ELSE 0 END)`);
          relBinds.push(`%${t}%`);
          parts.push(`(CASE WHEN lower(COALESCE(segment,'')) LIKE ? THEN 2 ELSE 0 END)`);
          relBinds.push(`%${t}%`);
          parts.push(`(CASE WHEN search_text LIKE ? THEN 1 ELSE 0 END)`);
          relBinds.push(`%${t}%`);
        }
        relevanceExpr = parts.join(' + ');
      }

      const orderBy = tokens.length
        ? `ORDER BY relevance DESC, has_email DESC, has_phone DESC, score DESC`
        : `ORDER BY score DESC`;

      const listSql =
        `SELECT *, (${relevanceExpr}) AS relevance,` +
        ` (CASE WHEN COALESCE(email,'') <> '' THEN 1 ELSE 0 END) AS has_email,` +
        ` (CASE WHEN COALESCE(phone,'') <> '' THEN 1 ELSE 0 END) AS has_phone` +
        ` FROM leads ${where} ${orderBy} LIMIT ${limit} OFFSET ${offset}`;
      const list = await db
        .prepare(listSql)
        .bind(...relBinds, ...whereBinds)
        .all();
      const leads = (list?.results || []).map(fromRow);

      const stats = await db
        .prepare(
          `SELECT COUNT(*) AS total,
                  SUM(CASE WHEN status='qualified' THEN 1 ELSE 0 END) AS qualified,
                  SUM(CASE WHEN email <> '' THEN 1 ELSE 0 END) AS with_email,
                  SUM(CASE WHEN phone <> '' THEN 1 ELSE 0 END) AS with_phone,
                  SUM(CASE WHEN linkedin <> '' THEN 1 ELSE 0 END) AS with_linkedin
           FROM leads`,
        )
        .first();

      return NextResponse.json({
        leads,
        total,
        offset,
        limit,
        source: 'd1',
        counts: {
          total: Number(stats?.total ?? 0),
          qualified: Number(stats?.qualified ?? 0),
          withEmail: Number(stats?.with_email ?? 0),
          withPhone: Number(stats?.with_phone ?? 0),
          withLinkedin: Number(stats?.with_linkedin ?? 0),
          followUp: Number(stats?.total ?? 0) - Number(stats?.with_email ?? 0),
        },
      });
    } catch (err) {
      // D1 not provisioned / query failed — fall through to JSON fallback below.
      console.error('[harvyx/leads] D1 query failed, using JSON fallback:', err);
    }
  }

  /* ── Dev / non-Cloudflare fallback (reads JSON from disk) ── */
  const all = await loadJsonFallback();
  let pool = all;
  if (idList.length) {
    const idSet = new Set(idList);
    pool = all.filter((l) => idSet.has(l.id));
  }
  if (status) {
    pool = pool.filter((l) => (l.status || '').toLowerCase() === status);
  }
  const tokens = searchTokens(q);
  const filtered = tokens.length
    ? pool
        .filter((l) => leadMatchesQuery(l, tokens))
        .sort((a, b) => {
          const rel = leadMatchScore(b, tokens) - leadMatchScore(a, tokens);
          if (rel !== 0) return rel;
          const email = hasVal(b.email || b.workEmail) - hasVal(a.email || a.workEmail);
          if (email !== 0) return email;
          const phone = hasVal(b.phone || b.mobile) - hasVal(a.phone || a.mobile);
          if (phone !== 0) return phone;
          return (b.score || 0) - (a.score || 0);
        })
    : pool;
  const leads = filtered.slice(offset, offset + limit);
  const counts = cachedCounts || computeCounts(all);

  return NextResponse.json({
    leads,
    total: filtered.length,
    offset,
    limit,
    source: 'json',
    filter: { status: status || null, listIds: idList.length || null },
    counts: {
      total: counts.total,
      qualified: counts.qualified,
      withEmail: counts.withEmail,
      withPhone: counts.withPhone,
      withLinkedin: counts.withLinkedin,
      followUp: counts.followUp,
    },
  });
}
