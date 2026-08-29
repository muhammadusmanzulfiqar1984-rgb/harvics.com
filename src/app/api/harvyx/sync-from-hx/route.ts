import { NextRequest, NextResponse } from 'next/server';
import { mapHxContactToLeadPatch } from '@/lib/harvyx/leadDedupe';
import { applyLeadPatches } from '@/lib/harvyx/leadWriteback';
import { authenticate } from '../auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const HARD_MAX = 100;

async function resolveHxEnv() {
  let base = process.env.HX_API_BASE_URL || 'http://localhost:3001';
  let secret = process.env.HX_JWT_SECRET || '';
  try {
    const mod: any = await import('@opennextjs/cloudflare');
    const ctx = await mod.getCloudflareContext({ async: true });
    base = ctx?.env?.HX_API_BASE_URL || base;
    secret = ctx?.env?.HX_JWT_SECRET || secret;
  } catch {
    /* local */
  }
  return { base: base.replace(/\/$/, ''), secret };
}

async function mintToken(secret: string) {
  const jwt = await import('jsonwebtoken');
  return jwt.default.sign({ sub: 'operator', role: 'admin' }, secret, { expiresIn: '1h' });
}

async function getDb(): Promise<any | null> {
  try {
    const mod: any = await import('@opennextjs/cloudflare');
    const ctx = await mod.getCloudflareContext({ async: true });
    return ctx?.env?.LEADS_DB || null;
  } catch {
    return null;
  }
}

async function loadJsonFallback(): Promise<Record<string, any>[]> {
  try {
    const { readFile } = await import('node:fs/promises');
    const { join } = await import('node:path');
    const raw = await readFile(join(process.cwd(), 'src/data/harvyx/leads.json'), 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : parsed?.leads || [];
  } catch {
    return [];
  }
}

function invalidate() {
  try {
    const { invalidateLeadsCache } = require('@/lib/harvyx/leadSearch');
    invalidateLeadsCache();
  } catch {
    /* ignore */
  }
}

async function fetchHxContacts(
  base: string,
  token: string,
  query: Record<string, string>,
): Promise<Record<string, any>[]> {
  const url = new URL(`${base}/api/v1/databank/contacts`);
  for (const [k, v] of Object.entries(query)) url.searchParams.set(k, v);
  const r = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  const j = (await r.json().catch(() => ({}))) as {
    data?: Record<string, any>[] | { data?: Record<string, any>[] };
    error?: string;
  };
  if (!r.ok) throw new Error(j.error || `Hx contacts ${r.status}`);
  // paged() returns { success, data: T[], total, ... } or nested
  if (Array.isArray(j.data)) return j.data;
  const nested = j.data as { data?: Record<string, any>[] } | undefined;
  if (nested && Array.isArray(nested.data)) return nested.data;
  return [];
}

/**
 * POST /api/harvyx/sync-from-hx
 * Pull enriched Hx contacts (source=d1) and write email/phone/li/score back to D1.
 * Body: { limit?: number, dryRun?: boolean, sourceIds?: string[] }
 */
export async function POST(req: NextRequest) {
  const authError = await authenticate(req);
  if (authError) return authError;

  try {
    const body = await req.json().catch(() => ({}));
    const dryRun = Boolean(body.dryRun);
    let limit = Number(body.limit ?? 50);
    if (!Number.isFinite(limit) || limit < 1) limit = 50;
    limit = Math.min(HARD_MAX, Math.floor(limit));
    const sourceIds = Array.isArray(body.sourceIds)
      ? body.sourceIds.map((x: unknown) => String(x))
      : [];

    const { base, secret } = await resolveHxEnv();
    if (!secret) {
      return NextResponse.json({ error: 'HX_JWT_SECRET not configured' }, { status: 500 });
    }
    const token = await mintToken(secret);

    // Pull apollo + lusha enriched d1 contacts (two queries → merge)
    const per = Math.min(100, limit);
    const [apollo, lusha, verified] = await Promise.all([
      fetchHxContacts(base, token, {
        source: 'd1',
        enriched_apollo: 'true',
        limit: String(per),
        page: '1',
      }).catch(() => [] as Record<string, any>[]),
      fetchHxContacts(base, token, {
        source: 'd1',
        enriched_lusha: 'true',
        limit: String(per),
        page: '1',
      }).catch(() => [] as Record<string, any>[]),
      fetchHxContacts(base, token, {
        source: 'd1',
        email_verified: 'true',
        limit: String(per),
        page: '1',
      }).catch(() => [] as Record<string, any>[]),
    ]);

    const byId = new Map<string, Record<string, any>>();
    for (const c of [...apollo, ...lusha, ...verified]) {
      const key = String(c.id || c.source_id || '');
      if (key) byId.set(key, c);
    }
    let contacts = [...byId.values()];
    if (sourceIds.length) {
      const want = new Set(sourceIds);
      contacts = contacts.filter((c) => want.has(String(c.source_id)));
    }
    contacts = contacts.slice(0, limit);

    const patches = contacts
      .map((c) => mapHxContactToLeadPatch(c))
      .filter(Boolean) as ReturnType<typeof mapHxContactToLeadPatch>[];

    if (dryRun) {
      return NextResponse.json({
        success: true,
        dryRun: true,
        hxContacts: contacts.length,
        wouldUpdate: patches.length,
        sample: patches.slice(0, 5),
      });
    }

    if (!patches.length) {
      return NextResponse.json({
        success: true,
        updated: 0,
        missing: 0,
        skipped: 0,
        hxContacts: contacts.length,
        message: 'No enriched d1-sourced contacts to write back',
      });
    }

    const db = await getDb();
    const result = await applyLeadPatches(patches as any, {
      db,
      loadJson: loadJsonFallback,
      invalidate,
    });

    const { emitOsEventViaHx } = await import('@/lib/harvyx/emitOsEvent');
    void emitOsEventViaHx({
      sourceModule: 'HarvicsX',
      eventType: 'lead.synced',
      payload: {
        direction: 'hx_to_d1_pull',
        hxContacts: contacts.length,
        updated: result.updated,
        missing: result.missing,
        skipped: result.skipped,
      },
    });

    return NextResponse.json({
      success: true,
      hxContacts: contacts.length,
      source: db ? 'd1' : 'json',
      ...result,
      results: result.results.slice(0, 50),
    });
  } catch (e: unknown) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
