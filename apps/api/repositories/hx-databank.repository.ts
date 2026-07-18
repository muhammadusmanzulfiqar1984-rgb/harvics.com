/**
 * hx-databank.repository.ts — all DB queries for the reporting API
 * Source: HARVYX_REPORTING_WIRE.md § 6
 *
 * Rules:
 *  - No raw SQL in route handlers. All queries live here.
 *  - All public methods return typed objects.
 *  - Paginated queries use the shared paginate() helper.
 *  - No mutation logic — only SELECT and INSERT for audit/jobs.
 */

import { Pool, PoolClient } from 'pg';
import type {
  HxContact,
  HxScrapeRun,
  HxEnrichmentJob,
  HxApiResponse,
  HxPaginatedResponse,
  HxBronzeEventType,
} from '../../../packages/types/hx.types';

// ── Pool singleton ────────────────────────────────────────────────────────────

const pool = new Pool({
  connectionString: process.env.HX_DATABASE_URL,
  max:              10,
  idleTimeoutMillis: 30_000,
});

// ── Pagination helper ─────────────────────────────────────────────────────────

export interface PaginationInput {
  page:     number;   // 1-based
  per_page: number;   // max 100
}

export interface PaginatedResult<T> {
  data:       T[];
  total:      number;
  page:       number;
  per_page:   number;
}

async function paginate<T>(
  client: PoolClient,
  dataQuery:  string,
  countQuery: string,
  params:     unknown[],
  pagination: PaginationInput,
): Promise<PaginatedResult<T>> {
  const safePerPage = Math.min(Math.max(pagination.per_page, 1), 100);
  const safePage    = Math.max(pagination.page, 1);
  const offset      = (safePage - 1) * safePerPage;

  const [dataRes, countRes] = await Promise.all([
    client.query<T>(
      `${dataQuery} LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, safePerPage, offset],
    ),
    client.query<{ total: string }>(countQuery, params),
  ]);

  return {
    data:     dataRes.rows,
    total:    parseInt(countRes.rows[0]?.total ?? '0', 10),
    page:     safePage,
    per_page: safePerPage,
  };
}

// ── Summary ───────────────────────────────────────────────────────────────────

export interface DataBankSummary {
  totals: {
    contacts:           number;
    companies:          number;
    email_verified:     number;
    enriched_apollo:    number;
    enriched_lusha:     number;
    in_nurture_pool:    number;
    sequence_enrolled:  number;
  };
  by_band: {
    lusha_tier:  number;
    apollo_tier: number;
    nurture:     number;
  };
  by_vertical: Array<{ vertical: string; count: number }>;
  by_source:   Array<{ source: string; count: number }>;
  recent_runs: Array<{
    id:        string;
    source:    string;
    status:    string;
    scraped:   number;
    ingested:  number;
    started_at: string;
  }>;
}

export async function getSummary(): Promise<DataBankSummary> {
  const client = await pool.connect();
  try {
    const [totals, byBand, byVertical, bySource, recentRuns] = await Promise.all([
      client.query<{
        contacts: string; companies: string; email_verified: string;
        enriched_apollo: string; enriched_lusha: string;
        in_nurture_pool: string; sequence_enrolled: string;
      }>(`
        SELECT
          (SELECT COUNT(*) FROM hx_contacts)                                  AS contacts,
          (SELECT COUNT(*) FROM hx_companies)                                 AS companies,
          (SELECT COUNT(*) FROM hx_contacts WHERE email_verified = TRUE)      AS email_verified,
          (SELECT COUNT(*) FROM hx_contacts WHERE enriched_apollo = TRUE)     AS enriched_apollo,
          (SELECT COUNT(*) FROM hx_contacts WHERE enriched_lusha = TRUE)      AS enriched_lusha,
          (SELECT COUNT(*) FROM hx_contacts WHERE in_nurture_pool = TRUE)     AS in_nurture_pool,
          (SELECT COUNT(*) FROM hx_contacts WHERE sequence_enrolled = TRUE)   AS sequence_enrolled
      `),

      client.query<{ band: string; count: string }>(`
        SELECT
          CASE
            WHEN icp_score >= 85 THEN 'lusha_tier'
            WHEN icp_score >= 70 THEN 'apollo_tier'
            WHEN icp_score >= 50 THEN 'nurture'
            ELSE 'unscored'
          END AS band,
          COUNT(*) AS count
        FROM hx_contacts
        WHERE icp_score > 0
        GROUP BY 1
        ORDER BY 1
      `),

      client.query<{ vertical: string; count: string }>(`
        SELECT COALESCE(vertical, 'unknown') AS vertical, COUNT(*) AS count
        FROM hx_contacts
        GROUP BY 1
        ORDER BY 2 DESC
        LIMIT 20
      `),

      client.query<{ source: string; count: string }>(`
        SELECT source, COUNT(*) AS count
        FROM hx_contacts
        GROUP BY 1
        ORDER BY 2 DESC
      `),

      client.query<{
        id: string; source: string; status: string;
        records_scraped: string; records_ingested: string; started_at: string;
      }>(`
        SELECT id, source, status, records_scraped, records_ingested, started_at
        FROM hx_scrape_runs
        ORDER BY started_at DESC
        LIMIT 10
      `),
    ]);

    const t = totals.rows[0];

    return {
      totals: {
        contacts:          parseInt(t.contacts,         10),
        companies:         parseInt(t.companies,        10),
        email_verified:    parseInt(t.email_verified,   10),
        enriched_apollo:   parseInt(t.enriched_apollo,  10),
        enriched_lusha:    parseInt(t.enriched_lusha,   10),
        in_nurture_pool:   parseInt(t.in_nurture_pool,  10),
        sequence_enrolled: parseInt(t.sequence_enrolled, 10),
      },
      by_band: byBand.rows.reduce<DataBankSummary['by_band']>((acc, row) => {
        if (row.band === 'lusha_tier' || row.band === 'apollo_tier' || row.band === 'nurture') {
          acc[row.band] = parseInt(row.count, 10);
        }
        return acc;
      }, { lusha_tier: 0, apollo_tier: 0, nurture: 0 }),
      by_vertical: byVertical.rows.map(r => ({ vertical: r.vertical, count: parseInt(r.count, 10) })),
      by_source:   bySource.rows.map(r => ({ source: r.source,   count: parseInt(r.count, 10) })),
      recent_runs: recentRuns.rows.map(r => ({
        id:         r.id,
        source:     r.source,
        status:     r.status,
        scraped:    parseInt(r.records_scraped,  10),
        ingested:   parseInt(r.records_ingested, 10),
        started_at: r.started_at,
      })),
    };
  } finally {
    client.release();
  }
}

// ── Contacts ──────────────────────────────────────────────────────────────────

export interface ContactsFilter {
  country?:        string;
  vertical?:       string;
  source?:         string;
  email_verified?: boolean;
  enriched_apollo?: boolean;
  enriched_lusha?: boolean;
  in_nurture_pool?: boolean;
  icp_min?:        number;
  icp_max?:        number;
  q?:              string;   // name / company FTS
}

export async function getContacts(
  filter: ContactsFilter,
  pagination: PaginationInput,
): Promise<PaginatedResult<HxContact>> {
  const client = await pool.connect();
  try {
    const conditions: string[] = [];
    const params:     unknown[] = [];

    function addParam(val: unknown): string {
      params.push(val);
      return `$${params.length}`;
    }

    if (filter.country)        conditions.push(`country = ${addParam(filter.country)}`);
    if (filter.vertical)       conditions.push(`vertical = ${addParam(filter.vertical)}`);
    if (filter.source)         conditions.push(`source = ${addParam(filter.source)}`);
    if (filter.email_verified  !== undefined) conditions.push(`email_verified = ${addParam(filter.email_verified)}`);
    if (filter.enriched_apollo !== undefined) conditions.push(`enriched_apollo = ${addParam(filter.enriched_apollo)}`);
    if (filter.enriched_lusha  !== undefined) conditions.push(`enriched_lusha = ${addParam(filter.enriched_lusha)}`);
    if (filter.in_nurture_pool !== undefined) conditions.push(`in_nurture_pool = ${addParam(filter.in_nurture_pool)}`);
    if (filter.icp_min !== undefined) conditions.push(`icp_score >= ${addParam(filter.icp_min)}`);
    if (filter.icp_max !== undefined) conditions.push(`icp_score <= ${addParam(filter.icp_max)}`);
    if (filter.q) {
      conditions.push(
        `(full_name ILIKE ${addParam(`%${filter.q}%`)} OR company_name ILIKE $${params.length})`,
      );
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    return paginate<HxContact>(
      client,
      `SELECT * FROM hx_contacts ${where} ORDER BY icp_score DESC, created_at DESC`,
      `SELECT COUNT(*) AS total FROM hx_contacts ${where}`,
      params,
      pagination,
    );
  } finally {
    client.release();
  }
}

export async function getContactById(id: string): Promise<HxContact | null> {
  const { rows } = await pool.query<HxContact>(
    `SELECT * FROM hx_contacts WHERE id = $1`,
    [id],
  );
  return rows[0] ?? null;
}

// ── Scrape runs ───────────────────────────────────────────────────────────────

export async function getScrapeRuns(
  pagination: PaginationInput,
  source?: string,
): Promise<PaginatedResult<HxScrapeRun>> {
  const client = await pool.connect();
  try {
    const where  = source ? `WHERE source = $1` : '';
    const params = source ? [source] : [];

    return paginate<HxScrapeRun>(
      client,
      `SELECT * FROM hx_scrape_runs ${where} ORDER BY started_at DESC`,
      `SELECT COUNT(*) AS total FROM hx_scrape_runs ${where}`,
      params,
      pagination,
    );
  } finally {
    client.release();
  }
}

export async function getScrapeRunById(id: string): Promise<HxScrapeRun | null> {
  const { rows } = await pool.query<HxScrapeRun>(
    `SELECT * FROM hx_scrape_runs WHERE id = $1`,
    [id],
  );
  return rows[0] ?? null;
}

// ── Bronze events ─────────────────────────────────────────────────────────────

export interface BronzeEventRow {
  id:            string;
  event_type:    HxBronzeEventType;
  source_module: string;
  entity_id:     string | null;
  entity_type:   string | null;
  payload:       Record<string, unknown>;
  created_at:    string;
}

export interface BronzeFilter {
  event_type?:    string;
  source_module?: string;
  entity_id?:     string;
}

export async function getBronzeEvents(
  filter: BronzeFilter,
  pagination: PaginationInput,
): Promise<PaginatedResult<BronzeEventRow>> {
  const client = await pool.connect();
  try {
    const conditions: string[] = [];
    const params:     unknown[] = [];

    if (filter.event_type)    { params.push(filter.event_type);    conditions.push(`event_type = $${params.length}`); }
    if (filter.source_module) { params.push(filter.source_module); conditions.push(`source_module = $${params.length}`); }
    if (filter.entity_id)     { params.push(filter.entity_id);     conditions.push(`entity_id = $${params.length}`); }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    return paginate<BronzeEventRow>(
      client,
      `SELECT * FROM hx_events_bronze ${where} ORDER BY created_at DESC`,
      `SELECT COUNT(*) AS total FROM hx_events_bronze ${where}`,
      params,
      pagination,
    );
  } finally {
    client.release();
  }
}

// ── Enrichment queue ──────────────────────────────────────────────────────────

export interface EnrichmentQueueSummary {
  pending:   number;
  running:   number;
  completed: number;
  failed:    number;
  by_type:   Array<{ job_type: string; status: string; count: number }>;
  recent:    HxEnrichmentJob[];
}

export async function getEnrichmentQueueStatus(): Promise<EnrichmentQueueSummary> {
  const client = await pool.connect();
  try {
    const [statusCounts, byType, recent] = await Promise.all([
      client.query<{ status: string; count: string }>(`
        SELECT status, COUNT(*) AS count FROM hx_enrichment_jobs GROUP BY status
      `),
      client.query<{ job_type: string; status: string; count: string }>(`
        SELECT job_type, status, COUNT(*) AS count
        FROM hx_enrichment_jobs
        GROUP BY job_type, status
        ORDER BY job_type, status
      `),
      client.query<HxEnrichmentJob>(`
        SELECT * FROM hx_enrichment_jobs
        ORDER BY created_at DESC
        LIMIT 20
      `),
    ]);

    const counts = statusCounts.rows.reduce<Record<string, number>>((acc, r) => {
      acc[r.status] = parseInt(r.count, 10);
      return acc;
    }, {});

    return {
      pending:   counts['pending']   ?? 0,
      running:   counts['running']   ?? 0,
      completed: counts['completed'] ?? 0,
      failed:    counts['failed']    ?? 0,
      by_type:   byType.rows.map(r => ({
        job_type: r.job_type,
        status:   r.status,
        count:    parseInt(r.count, 10),
      })),
      recent: recent.rows,
    };
  } finally {
    client.release();
  }
}

// ── Credits (usage stats from enrichment jobs) ────────────────────────────────

export interface CreditStats {
  apollo: {
    reveals_total: number;
    reveals_today: number;
  };
  lusha: {
    reveals_total: number;
    reveals_today: number;
  };
  last_checked_at: string;
}

export async function getCreditStats(): Promise<CreditStats> {
  const { rows } = await pool.query<{
    job_type:  string;
    total:     string;
    today:     string;
  }>(`
    SELECT
      job_type,
      COUNT(*)                                                        AS total,
      COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE::TIMESTAMPTZ) AS today
    FROM hx_enrichment_jobs
    WHERE job_type IN ('apollo_enrich', 'lusha_reveal')
      AND status = 'completed'
    GROUP BY job_type
  `);

  const apollo = rows.find(r => r.job_type === 'apollo_enrich');
  const lusha  = rows.find(r => r.job_type === 'lusha_reveal');

  return {
    apollo: {
      reveals_total: parseInt(apollo?.total ?? '0', 10),
      reveals_today: parseInt(apollo?.today ?? '0', 10),
    },
    lusha: {
      reveals_total: parseInt(lusha?.total ?? '0', 10),
      reveals_today: parseInt(lusha?.today ?? '0', 10),
    },
    last_checked_at: new Date().toISOString(),
  };
}

// ── Mutations ─────────────────────────────────────────────────────────────────

export async function createEnrichmentJob(
  contactId: string,
  jobType: 'apollo_enrich' | 'lusha_reveal' | 'email_verify' | 'icp_score',
): Promise<string> {
  const { rows } = await pool.query<{ id: string }>(
    `INSERT INTO hx_enrichment_jobs
       (id, contact_id, job_type, status, attempts)
     VALUES (gen_random_uuid(), $1, $2, 'pending', 0)
     ON CONFLICT (contact_id, job_type) WHERE status = 'pending' DO NOTHING
     RETURNING id`,
    [contactId, jobType],
  );

  if (!rows[0]) {
    // Conflict hit — fetch existing pending job id
    const existing = await pool.query<{ id: string }>(
      `SELECT id FROM hx_enrichment_jobs
       WHERE contact_id = $1 AND job_type = $2 AND status = 'pending'
       LIMIT 1`,
      [contactId, jobType],
    );
    return existing.rows[0]?.id ?? '';
  }

  return rows[0].id;
}

export async function writeAuditLog(params: {
  operatorId:  string;
  action:      string;
  entityType?: string;
  entityId?:   string;
  beforeState?: Record<string, unknown> | null;
  afterState?:  Record<string, unknown> | null;
  ipAddress?:  string;
}): Promise<void> {
  await pool.query(
    `INSERT INTO hx_audit_log
       (id, operator_id, action, entity_type, entity_id,
        before_state, after_state, ip_address)
     VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7::inet)`,
    [
      params.operatorId,
      params.action,
      params.entityType ?? null,
      params.entityId   ?? null,
      params.beforeState ? JSON.stringify(params.beforeState) : null,
      params.afterState  ? JSON.stringify(params.afterState)  : null,
      params.ipAddress  ?? null,
    ],
  );
}
