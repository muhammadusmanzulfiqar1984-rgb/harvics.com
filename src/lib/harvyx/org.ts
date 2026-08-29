/**
 * Phase 4b org resolution — D1 orgs + plan caps + BYO keys.
 */

import { getLeadsDb } from '@/lib/harvyx/d1';
import { limitsForPlan, type HarvyxPlan } from '@/lib/harvyx/plans';

export type HarvyxOrgConfig = {
  orgId: string;
  name: string;
  plan: HarvyxPlan;
  seats: number;
  dailySendCap: number;
  dailyEnrichCap: number;
  batchSendHardMax: number;
  clerkOrgId?: string | null;
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
  resendApiKey?: string;
  groqApiKey?: string;
  openaiApiKey?: string;
};

function envDefault(): HarvyxOrgConfig {
  const plan = (process.env.HARVYX_ORG_PLAN || 'scale') as HarvyxPlan;
  const limits = limitsForPlan(plan === 'free' || plan === 'pro' || plan === 'scale' ? plan : 'scale');
  return {
    orgId: process.env.HARVYX_ORG_ID || 'harvics',
    name: process.env.HARVYX_ORG_NAME || 'Harvics',
    plan: limits.plan,
    seats: Math.max(limits.seats, Number(process.env.HARVYX_SEATS || limits.seats) || limits.seats),
    dailySendCap: Number(process.env.HARVYX_DAILY_SEND_CAP || limits.dailySendCap) || limits.dailySendCap,
    dailyEnrichCap: Number(process.env.HARVYX_DAILY_ENRICH_CAP || limits.dailyEnrichCap) || limits.dailyEnrichCap,
    batchSendHardMax:
      Number(process.env.HARVYX_BATCH_SEND_MAX || limits.batchSendHardMax) || limits.batchSendHardMax,
    resendApiKey: process.env.HARVYX_ORG_RESEND_API_KEY || undefined,
    groqApiKey: process.env.HARVYX_ORG_GROQ_API_KEY || undefined,
    openaiApiKey: process.env.HARVYX_ORG_OPENAI_API_KEY || undefined,
  };
}

function rowToConfig(row: Record<string, any>): HarvyxOrgConfig {
  const plan = (row.plan || 'free') as HarvyxPlan;
  const limits = limitsForPlan(plan);
  return {
    orgId: String(row.id),
    name: String(row.name || row.id),
    plan: limits.plan,
    seats: Number(row.seats ?? limits.seats) || limits.seats,
    dailySendCap: Number(row.daily_send_cap ?? limits.dailySendCap) || limits.dailySendCap,
    dailyEnrichCap: Number(row.daily_enrich_cap ?? limits.dailyEnrichCap) || limits.dailyEnrichCap,
    batchSendHardMax: Number(row.batch_send_hard_max ?? limits.batchSendHardMax) || limits.batchSendHardMax,
    clerkOrgId: row.clerk_org_id || null,
    stripeCustomerId: row.stripe_customer_id || null,
    stripeSubscriptionId: row.stripe_subscription_id || null,
    resendApiKey: row.resend_api_key || undefined,
    groqApiKey: row.groq_api_key || undefined,
    openaiApiKey: row.openai_api_key || undefined,
  };
}

export function getDefaultOrg(): HarvyxOrgConfig {
  return envDefault();
}

export function resolveOrgId(req?: Request | null): string {
  const fromHeader = req?.headers?.get('x-harvyx-org')?.trim();
  if (fromHeader) return fromHeader.slice(0, 64);
  return getDefaultOrg().orgId;
}

export async function getOrgById(orgId: string): Promise<HarvyxOrgConfig> {
  const id = orgId || 'harvics';
  const db = await getLeadsDb();
  if (!db) {
    const d = envDefault();
    return id === d.orgId ? d : { ...d, orgId: id, name: id, plan: 'free', ...limitsForPlan('free') };
  }
  try {
    const row = await db.prepare('SELECT * FROM orgs WHERE id = ? LIMIT 1').bind(id).first();
    if (row) return rowToConfig(row);
  } catch {
    /* table missing */
  }
  const d = envDefault();
  return id === d.orgId ? d : { ...envDefault(), orgId: id, name: id, plan: 'free', ...limitsForPlan('free') };
}

export async function getOrgForClerkUser(clerkUserId: string): Promise<HarvyxOrgConfig | null> {
  if (!clerkUserId) return null;
  const db = await getLeadsDb();
  if (!db) return null;
  try {
    const row = await db
      .prepare(
        `SELECT o.* FROM orgs o
         INNER JOIN org_members m ON m.org_id = o.id
         WHERE m.clerk_user_id = ?
         ORDER BY CASE m.role WHEN 'owner' THEN 0 WHEN 'admin' THEN 1 ELSE 2 END
         LIMIT 1`,
      )
      .bind(clerkUserId)
      .first();
    return row ? rowToConfig(row) : null;
  } catch {
    return null;
  }
}

export async function getOrgConfig(orgId?: string): Promise<HarvyxOrgConfig> {
  return getOrgById(orgId || getDefaultOrg().orgId);
}

/** Sync plan caps onto an org row after Stripe webhook. */
export async function updateOrgPlan(
  orgId: string,
  plan: HarvyxPlan,
  stripe?: { customerId?: string; subscriptionId?: string | null },
): Promise<void> {
  const db = await getLeadsDb();
  if (!db) return;
  const limits = limitsForPlan(plan);
  const now = new Date().toISOString();
  await db
    .prepare(
      `UPDATE orgs SET
         plan = ?, seats = ?, daily_send_cap = ?, daily_enrich_cap = ?, batch_send_hard_max = ?,
         stripe_customer_id = COALESCE(?, stripe_customer_id),
         stripe_subscription_id = ?,
         updated_at = ?
       WHERE id = ?`,
    )
    .bind(
      limits.plan,
      limits.seats,
      limits.dailySendCap,
      limits.dailyEnrichCap,
      limits.batchSendHardMax,
      stripe?.customerId || null,
      stripe?.subscriptionId ?? null,
      now,
      orgId,
    )
    .run();
}

export async function ensureMember(orgId: string, clerkUserId: string, role = 'owner'): Promise<void> {
  const db = await getLeadsDb();
  if (!db || !clerkUserId) return;
  const now = new Date().toISOString();
  await db
    .prepare(
      `INSERT OR IGNORE INTO org_members (org_id, clerk_user_id, role, created_at)
       VALUES (?, ?, ?, ?)`,
    )
    .bind(orgId, clerkUserId, role, now)
    .run();
}

export async function upsertOrgFromClerk(params: {
  orgId: string;
  name: string;
  clerkOrgId?: string | null;
  clerkUserId?: string | null;
}): Promise<HarvyxOrgConfig> {
  const db = await getLeadsDb();
  const now = new Date().toISOString();
  const limits = limitsForPlan('free');
  if (db) {
    await db
      .prepare(
        `INSERT INTO orgs (
           id, name, clerk_org_id, plan, seats, daily_send_cap, daily_enrich_cap,
           batch_send_hard_max, created_at, updated_at
         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET
           name = excluded.name,
           clerk_org_id = COALESCE(excluded.clerk_org_id, orgs.clerk_org_id),
           updated_at = excluded.updated_at`,
      )
      .bind(
        params.orgId,
        params.name,
        params.clerkOrgId || null,
        limits.plan,
        limits.seats,
        limits.dailySendCap,
        limits.dailyEnrichCap,
        limits.batchSendHardMax,
        now,
        now,
      )
      .run();
    if (params.clerkUserId) {
      await ensureMember(params.orgId, params.clerkUserId, 'owner');
    }
  }
  return getOrgById(params.orgId);
}
