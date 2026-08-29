import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'node:crypto';
import { invalidateLeadsCache as clearSharedLeadsCache } from '@/lib/harvyx/leadSearch';
import { buildSearchText } from '@/lib/harvyx/leadImport';
import { extractDomain, leadDedupKey } from '@/lib/harvyx/leadDedupe';
import { authenticate } from '../auth';
import { resolveOrgId } from '@/lib/harvyx/org';

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
  const contactName = r.contact_name || '';
  const segment = r.segment || '';
  return {
    id: r.id,
    source: r.source,
    sourceFile: r.source_file,
    company: r.company,
    contactName,
    // Aliases for outreach / MCP clients
    name: contactName,
    title: r.title,
    email: r.email,
    phone: r.phone,
    linkedin: r.linkedin,
    website: r.website,
    country: r.country,
    city: r.city,
    segment,
    vertical: segment,
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
  const authError = await authenticate(req);
  if (authError) return authError;

  const { searchParams } = new URL(req.url);
  const q = (searchParams.get('q') || '').trim().toLowerCase();
  const status = (searchParams.get('status') || '').trim().toLowerCase();
  const vertical = (searchParams.get('vertical') || '').trim().toLowerCase();
  const idsParam = (searchParams.get('ids') || '').trim();
  const idList = idsParam
    ? idsParam.split(',').map((s) => s.trim()).filter(Boolean).slice(0, 500)
    : [];
  const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '50', 10) || 50, 1), 500);
  const offset = Math.max(parseInt(searchParams.get('offset') || '0', 10) || 0, 0);
  const orgId = resolveOrgId(req);

  const db = await getDb();

  /* ── Cloudflare D1 path ── */
  if (db) {
    try {
      const tokens = q ? searchTokens(q) : [];

      // WHERE: match if ANY token appears in the search_text blob.
      const whereClauses: string[] = [`(org_id = ? OR org_id IS NULL OR org_id = '')`];
      const whereBinds: any[] = [orgId];
      if (tokens.length) {
        whereClauses.push(`(${tokens.map(() => `search_text LIKE ?`).join(' OR ')})`);
        tokens.forEach((t) => whereBinds.push(`%${t}%`));
      }
      if (status) {
        whereClauses.push(`status = ?`);
        whereBinds.push(status);
      }
      if (vertical) {
        whereClauses.push(`(lower(COALESCE(segment,'')) LIKE ? OR search_text LIKE ?)`);
        whereBinds.push(`%${vertical}%`, `%${vertical}%`);
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
  if (vertical) {
    pool = pool.filter((l) => {
      const seg = String(l.segment || l.vertical || l.industry || '').toLowerCase();
      return seg.includes(vertical) || leadHaystack(l).includes(vertical);
    });
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
  const leads = filtered.slice(offset, offset + limit).map((l) => ({
    ...l,
    name: l.name || l.contactName || '',
    vertical: l.vertical || l.segment || '',
  }));
  const counts = cachedCounts || computeCounts(all);

  return NextResponse.json({
    leads,
    total: filtered.length,
    offset,
    limit,
    source: 'json',
    filter: { status: status || null, vertical: vertical || null, listIds: idList.length || null },
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

const ALLOWED_STATUSES = [
  'new',
  'enriched',
  'contacted',
  'replied',
  'qualified',
  'won',
  'lost',
] as const;

function normalizeIncomingLead(raw: Record<string, any>) {
  const now = new Date().toISOString();
  const contactName = String(raw.contactName || raw.name || '').trim();
  const company = String(raw.company || '').trim();
  const email = String(raw.email || raw.workEmail || '').trim().toLowerCase();
  const linkedin = String(raw.linkedin || raw.linkedinUrl || '').trim();
  const website = String(raw.website || raw.domain || '').trim();
  const basis = (email || linkedin || `${contactName}|${company}` || extractDomain(website)).toLowerCase();
  if (!basis) return null;
  const id =
    String(raw.id || '').trim() ||
    `lead_save_${createHash('sha1').update(basis).digest('hex').slice(0, 16)}`;
  return {
    id,
    source: String(raw.source || 'discover').trim() || 'discover',
    sourceFile: String(raw.sourceFile || 'live').trim() || 'live',
    company,
    contactName,
    title: String(raw.title || '').trim(),
    email,
    phone: String(raw.phone || '').trim(),
    linkedin,
    website,
    country: String(raw.country || '').trim(),
    city: String(raw.city || '').trim(),
    segment: String(raw.segment || raw.vertical || '').trim(),
    tags: Array.isArray(raw.tags) ? raw.tags : [],
    status: String(raw.status || 'new').trim() || 'new',
    score: Number.isFinite(Number(raw.score)) ? Math.round(Number(raw.score)) : 40,
    orgId: String(raw.orgId || raw.org_id || process.env.HARVYX_ORG_ID || 'harvics').trim() || 'harvics',
    createdAt: String(raw.createdAt || now),
    updatedAt: now,
  };
}

/**
 * POST /api/harvyx/leads — upsert one or many leads into D1 (Discover → Save).
 * Body: { lead } | { leads: [...] }
 * Dedupes on email → linkedin → name|company → domain.
 */
export async function POST(req: NextRequest) {
  const authError = await authenticate(req);
  if (authError) return authError;

  try {
    const body = await req.json();
    const incoming = Array.isArray(body?.leads)
      ? body.leads
      : body?.lead
        ? [body.lead]
        : Array.isArray(body)
          ? body
          : [];
    if (!incoming.length) {
      return NextResponse.json({ error: 'Provide lead or leads[]' }, { status: 400 });
    }
    if (incoming.length > 50) {
      return NextResponse.json({ error: 'Max 50 leads per request' }, { status: 400 });
    }

    const normalized = incoming
      .map((l: Record<string, any>) => normalizeIncomingLead(l))
      .filter(Boolean) as Lead[];

    if (!normalized.length) {
      return NextResponse.json({ error: 'No usable lead fields (need email, linkedin, name/company, or domain)' }, { status: 400 });
    }

    const db = await getDb();
    let inserted = 0;
    let updated = 0;
    let skipped = 0;
    const results: Array<{ id: string; action: string; dedupeKey: string | null }> = [];

    if (db) {
      for (const lead of normalized) {
        const key = leadDedupKey(lead);
        let existingId: string | null = null;
        if (key?.startsWith('e:')) {
          const row = await db
            .prepare('SELECT id FROM leads WHERE lower(email) = ? LIMIT 1')
            .bind(key.slice(2))
            .first();
          existingId = row?.id || null;
        } else if (key?.startsWith('l:')) {
          const row = await db
            .prepare('SELECT id FROM leads WHERE lower(linkedin) = ? LIMIT 1')
            .bind(key.slice(2))
            .first();
          existingId = row?.id || null;
        }

        const id = existingId || lead.id;
        const existed = Boolean(existingId);
        try {
          await db
            .prepare(
              `INSERT OR REPLACE INTO leads
               (id, source, source_file, company, contact_name, title, email, phone, linkedin, website,
                country, city, segment, tags, status, score, created_at, updated_at, search_text, org_id)
               VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10,?11,?12,?13,?14,?15,?16,?17,?18,?19,?20)`,
            )
            .bind(
              id,
              lead.source,
              lead.sourceFile,
              lead.company,
              lead.contactName,
              lead.title,
              lead.email,
              lead.phone,
              lead.linkedin,
              lead.website,
              lead.country,
              lead.city,
              lead.segment,
              JSON.stringify(lead.tags || []),
              lead.status || 'new',
              lead.score || 0,
              lead.createdAt,
              lead.updatedAt,
              buildSearchText(lead),
              lead.orgId || 'harvics',
            )
            .run();
        } catch {
          // Pre-migration D1 without org_id column
          await db
            .prepare(
              `INSERT OR REPLACE INTO leads
               (id, source, source_file, company, contact_name, title, email, phone, linkedin, website,
                country, city, segment, tags, status, score, created_at, updated_at, search_text)
               VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10,?11,?12,?13,?14,?15,?16,?17,?18,?19)`,
            )
            .bind(
              id,
              lead.source,
              lead.sourceFile,
              lead.company,
              lead.contactName,
              lead.title,
              lead.email,
              lead.phone,
              lead.linkedin,
              lead.website,
              lead.country,
              lead.city,
              lead.segment,
              JSON.stringify(lead.tags || []),
              lead.status || 'new',
              lead.score || 0,
              lead.createdAt,
              lead.updatedAt,
              buildSearchText(lead),
            )
            .run();
        }
        if (existed) updated++;
        else inserted++;
        results.push({ id, action: existed ? 'updated' : 'inserted', dedupeKey: key });
      }
      invalidateLeadsCache();
      const { emitOsEventViaHx } = await import('@/lib/harvyx/emitOsEvent');
      void emitOsEventViaHx({
        sourceModule: 'HarvicsX',
        eventType: 'lead.saved',
        payload: { source: 'd1', inserted, updated, skipped, count: results.length },
      });
      return NextResponse.json({
        success: true,
        source: 'd1',
        inserted,
        updated,
        skipped,
        results,
      });
    }

    // JSON fallback
    const all = await loadJsonFallback();
    const byKey = new Map<string, Lead>();
    for (const l of all) {
      const k = leadDedupKey(l);
      if (k) byKey.set(k, l);
    }
    for (const lead of normalized) {
      const key = leadDedupKey(lead);
      if (key && byKey.has(key)) {
        const prev = byKey.get(key)!;
        Object.assign(prev, lead, { id: prev.id, createdAt: prev.createdAt });
        updated++;
        results.push({ id: prev.id, action: 'updated', dedupeKey: key });
      } else {
        all.push(lead);
        if (key) byKey.set(key, lead);
        inserted++;
        results.push({ id: lead.id, action: 'inserted', dedupeKey: key });
      }
    }
    cachedJson = all;
    cachedCounts = computeCounts(all);
    return NextResponse.json({
      success: true,
      source: 'json',
      inserted,
      updated,
      skipped,
      results,
    });
  } catch (err: any) {
    console.error('[harvyx/leads] POST failed:', err);
    return NextResponse.json({ error: err?.message || 'Save failed' }, { status: 500 });
  }
}

/**
 * PATCH /api/harvyx/leads — update lead status and/or enrich fields.
 * Body: { id, status? } and optional email, phone, linkedin, title, score, contactName, company, website
 */
export async function PATCH(req: NextRequest) {
  const authError = await authenticate(req);
  if (authError) return authError;

  try {
    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const id = String(body?.id || '').trim();
    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    const statusRaw = body?.status != null ? String(body.status).trim().toLowerCase() : '';
    if (statusRaw && !ALLOWED_STATUSES.includes(statusRaw as (typeof ALLOWED_STATUSES)[number])) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${ALLOWED_STATUSES.join(', ')}` },
        { status: 400 },
      );
    }

    const patch: import('@/lib/harvyx/leadDedupe').LeadEnrichPatch = { id };
    if (statusRaw) patch.status = statusRaw as any;
    if (body.email != null) patch.email = String(body.email).trim().toLowerCase();
    if (body.phone != null) patch.phone = String(body.phone).trim();
    if (body.linkedin != null) patch.linkedin = String(body.linkedin).trim();
    if (body.title != null) patch.title = String(body.title).trim();
    if (body.contactName != null || body.name != null) {
      patch.contactName = String(body.contactName || body.name).trim();
    }
    if (body.company != null) patch.company = String(body.company).trim();
    if (body.website != null) patch.website = String(body.website).trim();
    if (body.score != null && Number.isFinite(Number(body.score))) {
      patch.score = Math.round(Number(body.score));
    }

    const hasEnrich =
      patch.email ||
      patch.phone ||
      patch.linkedin ||
      patch.title ||
      patch.contactName ||
      patch.company ||
      patch.website ||
      patch.score != null;
    if (!statusRaw && !hasEnrich) {
      return NextResponse.json({ error: 'Provide status and/or enrich fields' }, { status: 400 });
    }

    // Status-only fast path (outreach pipeline)
    if (statusRaw && !hasEnrich) {
      const now = new Date().toISOString();
      const db = await getDb();
      if (db) {
        const result = await db
          .prepare('UPDATE leads SET status = ?, updated_at = ? WHERE id = ?')
          .bind(statusRaw, now, id)
          .run();
        if (Number(result?.meta?.changes ?? 0) === 0) {
          return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
        }
        invalidateLeadsCache();
        return NextResponse.json({ success: true, id, status: statusRaw, updatedAt: now, source: 'd1' });
      }
      const all = await loadJsonFallback();
      const lead = all.find((l) => l.id === id);
      if (!lead) return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
      lead.status = statusRaw;
      lead.updatedAt = now;
      return NextResponse.json({ success: true, id, status: statusRaw, updatedAt: now, source: 'json' });
    }

    const { applyLeadPatches } = await import('@/lib/harvyx/leadWriteback');
    const db = await getDb();
    const result = await applyLeadPatches([patch], {
      db,
      loadJson: loadJsonFallback,
      invalidate: invalidateLeadsCache,
    });
    if (result.missing) return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    return NextResponse.json({
      success: true,
      id,
      source: db ? 'd1' : 'json',
      ...result.results[0],
      updated: result.updated,
    });
  } catch (err: any) {
    console.error('[harvyx/leads] PATCH failed:', err);
    return NextResponse.json({ error: err?.message || 'Update failed' }, { status: 500 });
  }
}
