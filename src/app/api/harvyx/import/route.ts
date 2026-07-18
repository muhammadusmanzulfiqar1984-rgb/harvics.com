import { NextRequest, NextResponse } from 'next/server';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import {
  SUPPORTED_IMPORT_EXT,
  buildSearchText,
  mergeLeadsFromFile,
  type LeadRecord,
} from '@/lib/harvyx/leadImport';
import { invalidateLeadsCache } from '@/app/api/harvyx/leads/route';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const LEADS_FILE = path.join(process.cwd(), 'src', 'data', 'harvyx', 'leads.json');
const UPLOAD_DIR = path.join(process.cwd(), 'src', 'data', 'harvyx', 'contacts', 'uploads');

async function loadExisting(): Promise<LeadRecord[]> {
  try {
    const raw = await readFile(LEADS_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
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

async function upsertLeadsToD1(db: any, leads: LeadRecord[]) {
  const batchSize = 100;
  for (let i = 0; i < leads.length; i += batchSize) {
    const chunk = leads.slice(i, i + batchSize);
    const stmts = chunk.map((l) =>
      db
        .prepare(
          `INSERT OR REPLACE INTO leads
           (id, source, source_file, company, contact_name, title, email, phone, linkedin, website,
            country, city, segment, tags, status, score, created_at, updated_at, search_text)
           VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10,?11,?12,?13,?14,?15,?16,?17,?18,?19)`,
        )
        .bind(
          l.id,
          l.source || 'upload',
          l.sourceFile || '',
          l.company || '',
          l.contactName || '',
          l.title || '',
          l.email || '',
          l.phone || '',
          l.linkedin || '',
          l.website || '',
          l.country || '',
          l.city || '',
          l.segment || '',
          JSON.stringify(l.tags || []),
          l.status || 'new',
          l.score || 0,
          l.createdAt || new Date().toISOString(),
          l.updatedAt || new Date().toISOString(),
          buildSearchText(l),
        ),
    );
    await db.batch(stmts);
  }
}

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const files = form.getAll('files').filter((f): f is File => f instanceof File);
  if (!files.length) {
    return NextResponse.json({ error: 'No files uploaded. Use field name "files".' }, { status: 400 });
  }

  let existing = await loadExisting();
  const results: Array<{
    file: string;
    added: number;
    skipped: number;
    mappedFields: string[];
    error?: string;
  }> = [];
  const newLeads: LeadRecord[] = [];
  const beforeIds = new Set(existing.map((l) => l.id));

  await mkdir(UPLOAD_DIR, { recursive: true });

  for (const file of files) {
    const ext = path.extname(file.name).toLowerCase();
    if (!SUPPORTED_IMPORT_EXT.includes(ext)) {
      results.push({
        file: file.name,
        added: 0,
        skipped: 0,
        mappedFields: [],
        error: `Unsupported type (${ext}). Use ${SUPPORTED_IMPORT_EXT.join(', ')}`,
      });
      continue;
    }

    try {
      const buffer = Buffer.from(await file.arrayBuffer());
      const stamp = new Date().toISOString().replace(/[:.]/g, '-');
      const safeName = file.name.replace(/[^\w.\- ]+/g, '_');
      await writeFile(path.join(UPLOAD_DIR, `${stamp}_${safeName}`), buffer);

      const prevCount = existing.length;
      const out = mergeLeadsFromFile(existing, file.name, buffer);
      existing = out.merged;
      const addedLeads = existing.filter((l) => !beforeIds.has(l.id));
      newLeads.push(...addedLeads);
      addedLeads.forEach((l) => beforeIds.add(l.id));

      results.push({
        file: file.name,
        added: out.added,
        skipped: out.skipped,
        mappedFields: out.mappedFields,
      });
      if (out.added === 0 && prevCount === existing.length && !out.mappedFields.length) {
        results[results.length - 1].error = 'No rows imported';
      }
    } catch (err: any) {
      results.push({
        file: file.name,
        added: 0,
        skipped: 0,
        mappedFields: [],
        error: err?.message || 'Import failed',
      });
    }
  }

  const totalAdded = results.reduce((n, r) => n + r.added, 0);
  if (totalAdded > 0) {
    await writeFile(LEADS_FILE, JSON.stringify(existing, null, 2) + '\n');
    invalidateLeadsCache();

    const db = await getDb();
    if (db && newLeads.length) {
      try {
        await upsertLeadsToD1(db, newLeads);
      } catch (err) {
        console.error('[harvyx/import] D1 upsert failed:', err);
      }
    }
  }

  return NextResponse.json({
    success: totalAdded > 0 || results.some((r) => r.added > 0),
    total: existing.length,
    added: totalAdded,
    files: results,
    message:
      totalAdded > 0
        ? `Imported ${totalAdded.toLocaleString()} new leads (${existing.length.toLocaleString()} total).`
        : 'No new leads added (duplicates or empty files).',
  });
}
