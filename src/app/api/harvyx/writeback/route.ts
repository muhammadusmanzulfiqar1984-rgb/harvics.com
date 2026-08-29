import { NextRequest, NextResponse } from 'next/server';
import { mapHxContactToLeadPatch } from '@/lib/harvyx/leadDedupe';
import { applyLeadPatches } from '@/lib/harvyx/leadWriteback';
import { authenticate } from '../auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const HARD_MAX = 100;

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

/**
 * POST /api/harvyx/writeback
 * Push Hx enrich fields onto D1 by source_id (d1 lead id).
 * Body: { contacts: HxContactLike[] } | { patches: LeadEnrichPatch[] }
 */
export async function POST(req: NextRequest) {
  const authError = await authenticate(req);
  if (authError) return authError;

  try {
    const body = await req.json().catch(() => ({}));
    const dryRun = Boolean(body.dryRun);
    let patches = Array.isArray(body.patches) ? body.patches : [];

    if (!patches.length && Array.isArray(body.contacts)) {
      patches = body.contacts
        .map((c: Record<string, unknown>) => mapHxContactToLeadPatch(c))
        .filter(Boolean);
    }

    if (!patches.length) {
      return NextResponse.json({ error: 'Provide contacts[] or patches[]' }, { status: 400 });
    }
    if (patches.length > HARD_MAX) {
      return NextResponse.json({ error: `Max ${HARD_MAX} per request` }, { status: 400 });
    }

    if (dryRun) {
      return NextResponse.json({
        success: true,
        dryRun: true,
        wouldUpdate: patches.length,
        sample: patches.slice(0, 5),
      });
    }

    const db = await getDb();
    const result = await applyLeadPatches(patches, {
      db,
      loadJson: loadJsonFallback,
      invalidate,
    });

    const { emitOsEventViaHx } = await import('@/lib/harvyx/emitOsEvent');
    void emitOsEventViaHx({
      sourceModule: 'HarvicsX',
      eventType: 'lead.enriched',
      payload: {
        direction: 'hx_to_d1_writeback',
        updated: result.updated,
        missing: result.missing,
        skipped: result.skipped,
      },
    });

    return NextResponse.json({
      success: true,
      source: db ? 'd1' : 'json',
      ...result,
      results: result.results.slice(0, 50),
    });
  } catch (e: unknown) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
