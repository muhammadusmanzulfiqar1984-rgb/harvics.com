import fs from 'node:fs/promises';
import path from 'node:path';
import type { CampaignStepTemplate } from '@/lib/harvyx/campaignTemplates';

export type CampaignLeadStatus = 'pending' | 'queued' | 'active' | 'completed' | 'skipped' | 'failed';

export interface CampaignLead {
  leadId: string;
  contactName: string;
  company: string;
  linkedin: string;
  stepIndex: number;
  status: CampaignLeadStatus;
  nextStepAt?: string;
  lastActionAt?: string;
  note?: string;
}

export interface CampaignStep {
  type: 'linkedin_connect' | 'linkedin_dm';
  delayDays: number;
  label: string;
  messageTemplate: string;
}

export interface Campaign {
  id: string;
  name: string;
  templateId: string;
  channel: 'linkedin';
  status: 'draft' | 'active' | 'paused' | 'completed';
  createdAt: string;
  startedAt?: string;
  steps: CampaignStep[];
  leads: CampaignLead[];
}

const FILE = path.join(process.cwd(), 'src/data/harvyx/campaigns.json');

let cachedLeads: Record<string, unknown>[] | null = null;

async function getDb(): Promise<any | null> {
  try {
    const mod: any = await import('@opennextjs/cloudflare');
    const ctx = await mod.getCloudflareContext({ async: true });
    return ctx?.env?.LEADS_DB ?? null;
  } catch {
    return null;
  }
}

function fromLeadRow(r: any): Record<string, unknown> {
  return {
    id: r.id,
    company: r.company,
    contactName: r.contact_name,
    title: r.title,
    email: r.email,
    phone: r.phone,
    linkedin: r.linkedin,
    segment: r.segment,
    status: r.status,
  };
}

async function loadAllLeadsJson(): Promise<Record<string, unknown>[]> {
  if (cachedLeads) return cachedLeads;
  const leadsFile = path.join(process.cwd(), 'src/data/harvyx/leads.json');
  const raw = await fs.readFile(leadsFile, 'utf8');
  cachedLeads = JSON.parse(raw);
  return cachedLeads!;
}

export async function resolveLeadsByIds(ids: string[]) {
  const db = await getDb();
  if (db && ids.length) {
    try {
      const placeholders = ids.map(() => '?').join(',');
      const list = await db.prepare(`SELECT * FROM leads WHERE id IN (${placeholders})`).bind(...ids).all();
      return (list?.results || []).map(fromLeadRow);
    } catch (e) {
      console.error('[campaignStore] D1 resolveLeadsByIds failed', e);
    }
  }
  const all = await loadAllLeadsJson();
  const set = new Set(ids);
  return all.filter((l) => set.has(String(l.id)));
}

export async function loadCampaigns(): Promise<Campaign[]> {
  const db = await getDb();
  if (db) {
    try {
      const list = await db.prepare('SELECT data FROM campaigns ORDER BY created_at DESC').all();
      return (list?.results || [])
        .map((r: any) => {
          try { return JSON.parse(r.data); } catch { return null; }
        })
        .filter(Boolean) as Campaign[];
    } catch (e) {
      console.error('[campaignStore] D1 loadCampaigns failed', e);
    }
  }
  try {
    const raw = await fs.readFile(FILE, 'utf8');
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export async function saveCampaigns(campaigns: Campaign[]) {
  const db = await getDb();
  if (db) {
    try {
      for (const c of campaigns) {
        await db
          .prepare('INSERT OR REPLACE INTO campaigns (id, created_at, data) VALUES (?, ?, ?)')
          .bind(c.id, c.createdAt, JSON.stringify(c))
          .run();
      }
      return;
    } catch (e) {
      console.error('[campaignStore] D1 saveCampaigns failed', e);
    }
  }
  await fs.writeFile(FILE, JSON.stringify(campaigns, null, 2));
}

export async function getCampaign(id: string) {
  const db = await getDb();
  if (db) {
    try {
      const row = await db.prepare('SELECT data FROM campaigns WHERE id = ?').bind(id).first();
      if (row?.data) return JSON.parse(String(row.data)) as Campaign;
    } catch (e) {
      console.error('[campaignStore] D1 getCampaign failed', e);
    }
  }
  const campaigns = await loadCampaigns();
  return campaigns.find((c) => c.id === id) ?? null;
}

export function buildCampaignLeads(
  leads: Record<string, unknown>[],
): { entries: CampaignLead[]; withLinkedin: number; skipped: number } {
  let withLinkedin = 0;
  let skipped = 0;
  const entries: CampaignLead[] = leads.map((l) => {
    const linkedin = String(l.linkedin || l.linkedinUrl || '').trim();
    const hasLi = linkedin.length > 0;
    if (hasLi) withLinkedin++;
    else skipped++;
    return {
      leadId: String(l.id),
      contactName: String(l.contactName || l.name || ''),
      company: String(l.company || ''),
      linkedin,
      stepIndex: 0,
      status: hasLi ? 'pending' : 'skipped',
      note: hasLi ? undefined : 'No LinkedIn URL on record',
    };
  });
  return { entries, withLinkedin, skipped };
}

export function stepsFromTemplate(steps: CampaignStepTemplate[]): CampaignStep[] {
  return steps.map((s) => ({
    type: s.type,
    delayDays: s.delayDays,
    label: s.label,
    messageTemplate: s.defaultMessage,
  }));
}

export function addDays(iso: string, days: number) {
  const d = new Date(iso);
  d.setDate(d.getDate() + days);
  return d.toISOString();
}
