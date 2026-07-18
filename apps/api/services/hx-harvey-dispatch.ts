/**
 * hx-harvey-dispatch.ts — route classified intent to tools
 * Module 2 — read tools execute; mutating tools return confirmation payloads
 */

import { pool } from '../../../packages/db';
import type {
  HxHarveyEntity,
  HxHarveyIntent,
} from '../../../packages/types/hx-harvey.types';
import { hxLogger } from '../../../packages/lib/hx-logger';

const MODULE = 'hx-harvey-dispatch';

export interface HarveyDispatchResult {
  reply: string;
  actions_taken: Array<Record<string, unknown>>;
  requires_confirmation: boolean;
  confirmation_payload: Record<string, unknown> | null;
}

function entityValue(
  entities: HxHarveyEntity[],
  type: string,
): string | null {
  return entities.find((e) => e.type === type)?.value ?? null;
}

async function reportQuery(entities: HxHarveyEntity[]): Promise<HarveyDispatchResult> {
  const [bySource, verified, icp70, total] = await Promise.all([
    pool.query<{ source: string; count: string }>(
      `SELECT source, COUNT(*)::text AS count FROM hx_contacts GROUP BY source ORDER BY COUNT(*) DESC`,
    ),
    pool.query<{ c: string }>(
      `SELECT COUNT(*)::text AS c FROM hx_contacts WHERE email_verified = true`,
    ),
    pool.query<{ c: string }>(
      `SELECT COUNT(*)::text AS c FROM hx_contacts WHERE icp_score >= 70`,
    ),
    pool.query<{ c: string }>(`SELECT COUNT(*)::text AS c FROM hx_contacts`),
  ]);

  const sourceLine = bySource.rows
    .map((r) => `${r.source}: ${r.count}`)
    .join(', ');

  const keyword = entityValue(entities, 'keyword')?.toLowerCase();
  let reply =
    `Data Bank — ${total.rows[0].c} contacts. Verified emails: ${verified.rows[0].c}. ` +
    `ICP ≥ 70: ${icp70.rows[0].c}. By source: ${sourceLine}.`;

  if (keyword?.includes('verified')) {
    reply = `Email-verified contacts: ${verified.rows[0].c} of ${total.rows[0].c}.`;
  }

  return {
    reply,
    actions_taken: [{ type: 'report_query', sources: bySource.rows }],
    requires_confirmation: false,
    confirmation_payload: null,
  };
}

async function prospectSearch(entities: HxHarveyEntity[]): Promise<HarveyDispatchResult> {
  const country = entityValue(entities, 'country');
  const vertical = entityValue(entities, 'vertical');
  const icpMin = Number(entityValue(entities, 'icp_min') ?? '70');
  const limit = Math.min(Number(entityValue(entities, 'limit') ?? '10'), 25);

  const clauses: string[] = [];
  const params: unknown[] = [];

  if (country) {
    params.push(country.toUpperCase());
    clauses.push(`country = $${params.length}`);
  }
  if (vertical) {
    params.push(vertical.toLowerCase());
    clauses.push(`LOWER(vertical) = $${params.length}`);
  }
  if (!Number.isNaN(icpMin)) {
    params.push(icpMin);
    clauses.push(`icp_score >= $${params.length}`);
  }

  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  params.push(limit);

  const { rows } = await pool.query<{
    full_name: string | null;
    company_name: string | null;
    country: string | null;
    icp_score: number | null;
  }>(
    `SELECT full_name, company_name, country, icp_score
     FROM hx_contacts
     ${where}
     ORDER BY icp_score DESC NULLS LAST
     LIMIT $${params.length}`,
    params,
  );

  if (!rows.length) {
    return {
      reply: 'No prospects matched those filters. Narrow country/vertical or lower ICP.',
      actions_taken: [{ type: 'prospect_search', count: 0, filters: { country, vertical, icpMin } }],
      requires_confirmation: false,
      confirmation_payload: null,
    };
  }

  const preview = rows
    .slice(0, 5)
    .map((r) => `${r.full_name ?? '—'} @ ${r.company_name ?? '—'} (ICP ${r.icp_score ?? 'n/a'})`)
    .join('; ');

  return {
    reply: `Found ${rows.length} prospect(s). Top: ${preview}.`,
    actions_taken: [{ type: 'prospect_search', count: rows.length, filters: { country, vertical, icpMin } }],
    requires_confirmation: false,
    confirmation_payload: null,
  };
}

async function personLookup(entities: HxHarveyEntity[]): Promise<HarveyDispatchResult> {
  const person = entityValue(entities, 'person') ?? entityValue(entities, 'keyword');
  const email = entityValue(entities, 'email');
  const company = entityValue(entities, 'company');

  const clauses: string[] = [];
  const params: unknown[] = [];

  if (email) {
    params.push(email.toLowerCase());
    clauses.push(`LOWER(email_pattern) = $${params.length}`);
  }
  if (person) {
    params.push(`%${person}%`);
    clauses.push(`full_name ILIKE $${params.length}`);
  }
  if (company) {
    params.push(`%${company}%`);
    clauses.push(`company_name ILIKE $${params.length}`);
  }

  if (!clauses.length) {
    return {
      reply: 'Who should I look up? Give a name, email, or company.',
      actions_taken: [],
      requires_confirmation: false,
      confirmation_payload: null,
    };
  }

  const { rows } = await pool.query(
    `SELECT full_name, company_name, country, email_pattern, email_verified, icp_score, title
     FROM hx_contacts
     WHERE ${clauses.join(' AND ')}
     ORDER BY icp_score DESC NULLS LAST
     LIMIT 5`,
    params,
  );

  if (!rows.length) {
    return {
      reply: 'No matching person found in the Data Bank.',
      actions_taken: [{ type: 'person_lookup', count: 0 }],
      requires_confirmation: false,
      confirmation_payload: null,
    };
  }

  const r = rows[0] as Record<string, unknown>;
  const reply =
    `${r['full_name'] ?? 'Unknown'} — ${r['title'] ?? 'no title'} at ${r['company_name'] ?? '—'} ` +
    `(${r['country'] ?? 'n/a'}). Email: ${r['email_pattern'] ?? 'n/a'} ` +
    `(verified=${Boolean(r['email_verified'])}). ICP ${r['icp_score'] ?? 'n/a'}.` +
    (rows.length > 1 ? ` (+${rows.length - 1} similar)` : '');

  return {
    reply,
    actions_taken: [{ type: 'person_lookup', count: rows.length }],
    requires_confirmation: false,
    confirmation_payload: null,
  };
}

async function pipelineQuery(): Promise<HarveyDispatchResult> {
  try {
    const { rows } = await pool.query<{ stage: string; count: string }>(
      `SELECT stage, COUNT(*)::text AS count
       FROM hx_deals
       GROUP BY stage
       ORDER BY COUNT(*) DESC`,
    );
    if (!rows.length) {
      return {
        reply: 'Pipeline is empty — no deals in hx_deals yet.',
        actions_taken: [{ type: 'pipeline_query', count: 0 }],
        requires_confirmation: false,
        confirmation_payload: null,
      };
    }
    const line = rows.map((r) => `${r.stage}: ${r.count}`).join(', ');
    return {
      reply: `Pipeline by stage — ${line}.`,
      actions_taken: [{ type: 'pipeline_query', stages: rows }],
      requires_confirmation: false,
      confirmation_payload: null,
    };
  } catch (err) {
    hxLogger.warn(MODULE, 'pipeline query failed', {
      err: err instanceof Error ? err.message : String(err),
    });
    return {
      reply: 'Pipeline module tables are not ready yet. Data Bank reporting is available.',
      actions_taken: [{ type: 'pipeline_query', error: true }],
      requires_confirmation: false,
      confirmation_payload: null,
    };
  }
}

function mutatingStub(
  intent: HxHarveyIntent,
  entities: HxHarveyEntity[],
  label: string,
): HarveyDispatchResult {
  return {
    reply: `${label} ready. Confirm to proceed.`,
    actions_taken: [],
    requires_confirmation: true,
    confirmation_payload: { intent, entities },
  };
}

export async function dispatchIntent(params: {
  intent: HxHarveyIntent;
  entities: HxHarveyEntity[];
  message: string;
  confirmed?: boolean;
}): Promise<HarveyDispatchResult> {
  const { intent, entities, confirmed } = params;

  switch (intent) {
    case 'report_query':
      return reportQuery(entities);
    case 'prospect_search':
      return prospectSearch(entities);
    case 'person_lookup':
      return personLookup(entities);
    case 'pipeline_query':
      return pipelineQuery();
    case 'outreach_action':
      if (!confirmed) return mutatingStub(intent, entities, 'Outreach action');
      return {
        reply: 'Outreach execution is queued for Module 4. Confirmation recorded.',
        actions_taken: [{ type: 'outreach_action', status: 'accepted_pending_module' }],
        requires_confirmation: false,
        confirmation_payload: null,
      };
    case 'sequence_enroll':
      if (!confirmed) return mutatingStub(intent, entities, 'Sequence enrollment');
      return {
        reply: 'Sequence enrollment recorded. Execution wires in Module 4.',
        actions_taken: [{ type: 'sequence_enroll', status: 'accepted_pending_module' }],
        requires_confirmation: false,
        confirmation_payload: null,
      };
    case 'data_export':
      if (!confirmed) return mutatingStub(intent, entities, 'Data export');
      return {
        reply: 'Export confirmed. Generation will attach to the operator channel in a later module.',
        actions_taken: [{ type: 'data_export', status: 'accepted_pending_module' }],
        requires_confirmation: false,
        confirmation_payload: null,
      };
    case 'unknown':
    default:
      return {
        reply: 'I did not catch a clear HarvyX command. Try: report summary, find prospects in GB apparel ICP 85+, or look up a person.',
        actions_taken: [],
        requires_confirmation: false,
        confirmation_payload: null,
      };
  }
}
