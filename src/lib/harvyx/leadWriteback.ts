/**
 * Apply enrich patches onto D1 leads (or JSON fallback).
 * Used by PATCH /leads (partial), POST /writeback, POST /sync-from-hx.
 */

import { buildSearchText } from '@/lib/harvyx/leadImport';
import type { LeadEnrichPatch } from '@/lib/harvyx/leadDedupe';

export type WritebackResult = {
  id: string;
  action: 'updated' | 'missing' | 'skipped';
  fields?: string[];
};

type LeadRow = Record<string, any>;

/** Prefer fill-empty for identity fields; always refresh score/status/title. */
function shouldApply(col: string, prev: unknown, next: unknown): boolean {
  if (next === undefined || next === null || next === '') return false;
  if (col === 'score' || col === 'status' || col === 'title') return true;
  const empty = prev == null || String(prev).trim() === '';
  return empty;
}

export async function applyLeadPatches(
  patches: LeadEnrichPatch[],
  opts: {
    db: any | null;
    loadJson: () => Promise<LeadRow[]>;
    invalidate: () => void;
  },
): Promise<{ updated: number; missing: number; skipped: number; results: WritebackResult[] }> {
  const results: WritebackResult[] = [];
  let updated = 0;
  let missing = 0;
  let skipped = 0;
  const now = new Date().toISOString();

  const fieldMap: Array<{ patchKey: keyof LeadEnrichPatch; col: string; jsonKey: string }> = [
    { patchKey: 'email', col: 'email', jsonKey: 'email' },
    { patchKey: 'phone', col: 'phone', jsonKey: 'phone' },
    { patchKey: 'linkedin', col: 'linkedin', jsonKey: 'linkedin' },
    { patchKey: 'title', col: 'title', jsonKey: 'title' },
    { patchKey: 'contactName', col: 'contact_name', jsonKey: 'contactName' },
    { patchKey: 'company', col: 'company', jsonKey: 'company' },
    { patchKey: 'website', col: 'website', jsonKey: 'website' },
    { patchKey: 'score', col: 'score', jsonKey: 'score' },
    { patchKey: 'status', col: 'status', jsonKey: 'status' },
  ];

  if (opts.db) {
    for (const patch of patches) {
      const existing = await opts.db
        .prepare('SELECT * FROM leads WHERE id = ? LIMIT 1')
        .bind(patch.id)
        .first();
      if (!existing) {
        missing++;
        results.push({ id: patch.id, action: 'missing' });
        continue;
      }

      const appliedCols: string[] = [];
      const appliedVals: unknown[] = [];
      const merged: LeadRow = { ...existing };

      for (const { patchKey, col } of fieldMap) {
        let next: unknown = patch[patchKey];
        if (next === undefined || next === null || next === '') continue;
        if (patchKey === 'score') next = Number(next);
        else next = String(next);
        if (!shouldApply(col, existing[col], next)) continue;
        merged[col] = next;
        appliedCols.push(col);
        appliedVals.push(next);
      }

      if (!appliedCols.length) {
        skipped++;
        results.push({ id: patch.id, action: 'skipped', fields: [] });
        continue;
      }

      const searchText = buildSearchText({
        company: merged.company,
        contactName: merged.contact_name,
        title: merged.title,
        email: merged.email,
        phone: merged.phone,
        linkedin: merged.linkedin,
        website: merged.website,
        country: merged.country,
        city: merged.city,
        segment: merged.segment,
      });

      const sets = [...appliedCols.map((c) => `${c} = ?`), 'updated_at = ?', 'search_text = ?'];
      await opts.db
        .prepare(`UPDATE leads SET ${sets.join(', ')} WHERE id = ?`)
        .bind(...appliedVals, now, searchText, patch.id)
        .run();

      updated++;
      results.push({ id: patch.id, action: 'updated', fields: appliedCols });
    }
    if (updated) opts.invalidate();
    return { updated, missing, skipped, results };
  }

  const all = await opts.loadJson();
  const byId = new Map(all.map((l) => [String(l.id), l]));
  for (const patch of patches) {
    const lead = byId.get(patch.id);
    if (!lead) {
      missing++;
      results.push({ id: patch.id, action: 'missing' });
      continue;
    }
    const applied: string[] = [];
    for (const { patchKey, col, jsonKey } of fieldMap) {
      let next: unknown = patch[patchKey];
      if (next === undefined || next === null || next === '') continue;
      if (patchKey === 'score') next = Number(next);
      else next = String(next);
      const prev = lead[jsonKey] ?? lead[col];
      if (!shouldApply(col, prev, next)) continue;
      lead[jsonKey] = next;
      applied.push(col);
    }
    if (!applied.length) {
      skipped++;
      results.push({ id: patch.id, action: 'skipped' });
      continue;
    }
    lead.updatedAt = now;
    updated++;
    results.push({ id: patch.id, action: 'updated', fields: applied });
  }
  return { updated, missing, skipped, results };
}
