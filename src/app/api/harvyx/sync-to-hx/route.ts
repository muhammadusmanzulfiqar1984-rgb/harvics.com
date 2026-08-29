import { NextRequest, NextResponse } from 'next/server';
import { mapLeadToHxContact } from '@/lib/harvyx/leadDedupe';
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

/**
 * POST /api/harvyx/sync-to-hx
 * Push D1/bank leads into Hx Postgres contacts (via AWS Hx API).
 * Body: { ids?: string[], status?: string, limit?: number, dryRun?: boolean }
 */
export async function POST(req: NextRequest) {
  const authError = await authenticate(req);
  if (authError) return authError;

  try {
    const body = await req.json().catch(() => ({}));
    const ids = Array.isArray(body.ids) ? body.ids.map((x: unknown) => String(x)) : [];
    const status = String(body.status || '').trim();
    const dryRun = Boolean(body.dryRun);
    let limit = Number(body.limit ?? 50);
    if (!Number.isFinite(limit) || limit < 1) limit = 50;
    limit = Math.min(HARD_MAX, Math.floor(limit));

    const origin = new URL(req.url).origin;
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (process.env.HARVYX_API_KEY) headers['x-api-key'] = process.env.HARVYX_API_KEY;

    let leads: Record<string, any>[] = [];
    // Prefer client-supplied lead objects (avoids D1 page-scan miss for selected ticks)
    if (Array.isArray(body.leads) && body.leads.length) {
      leads = body.leads.slice(0, limit).map((l: unknown) => l as Record<string, any>);
    } else if (ids.length) {
      // Fetch a page and filter — D1 list API has no multi-get; use search by pulling larger page
      const url = new URL(`${origin}/api/harvyx/leads`);
      url.searchParams.set('limit', '200');
      url.searchParams.set('page', '1');
      const r = await fetch(url, { headers, cache: 'no-store' });
      const j = (await r.json()) as { leads?: Record<string, any>[] };
      const want = new Set(ids);
      leads = (j.leads || []).filter((l) => want.has(String(l.id)));
    } else {
      const url = new URL(`${origin}/api/harvyx/leads`);
      if (status) url.searchParams.set('status', status);
      url.searchParams.set('limit', String(limit));
      url.searchParams.set('page', '1');
      const r = await fetch(url, { headers, cache: 'no-store' });
      const j = (await r.json()) as { leads?: Record<string, any>[]; error?: string };
      if (!r.ok) return NextResponse.json({ error: j.error || `leads ${r.status}` }, { status: r.status });
      leads = (j.leads || []).slice(0, limit);
    }

    const contacts = leads.map((l) => mapLeadToHxContact(l, 'd1')).filter((c) => c.source_id);

    if (dryRun) {
      return NextResponse.json({
        success: true,
        dryRun: true,
        selected: leads.length,
        wouldPush: contacts.length,
        sample: contacts.slice(0, 3),
      });
    }

    if (!contacts.length) {
      return NextResponse.json({ success: true, inserted: 0, skipped: 0, selected: 0 });
    }

    const { base, secret } = await resolveHxEnv();
    if (!secret) {
      return NextResponse.json({ error: 'HX_JWT_SECRET not configured' }, { status: 500 });
    }
    const token = await mintToken(secret);
    const up = await fetch(`${base}/api/v1/databank/contacts/import`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ contacts, dry_run: false }),
    });
    const data = await up.json().catch(() => ({}));
    if (!up.ok) {
      return NextResponse.json(
        { error: (data as any)?.error || `Hx import ${up.status}`, detail: data },
        { status: up.status },
      );
    }
    const flat = ((data as { data?: object }).data as object) || (data as object);
    const { emitOsEventViaHx } = await import('@/lib/harvyx/emitOsEvent');
    void emitOsEventViaHx({
      sourceModule: 'HarvicsX',
      eventType: 'lead.synced',
      payload: {
        direction: 'd1_to_hx',
        selected: leads.length,
        ...(flat as object),
      },
    });
    return NextResponse.json({
      success: true,
      selected: leads.length,
      ...flat,
      hx: data,
    });
  } catch (e: unknown) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
