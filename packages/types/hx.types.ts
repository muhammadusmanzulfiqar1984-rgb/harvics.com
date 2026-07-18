/**
 * HarvyX shared TypeScript types
 * Source: HARVYX_BACKEND_RULES.md § 2 + HARVYX_DATABANK_ARCH.md § 5
 * Rule: Never use `any`. All types explicit.
 */

// ── Primitives ────────────────────────────────────────────────────────────────

export type HxSource =
  | 'companies_house'
  | 'krs'
  | 'ares'
  | 'handelsregister'
  | 'bluezone'
  | 'innatex'
  | 'source_fashion'
  | 'supreme_dus'
  | 'ciff'
  | 'linkedin_public'
  | 'manual';

export type HxChannel = 'email' | 'linkedin' | 'whatsapp' | 'sms' | 'call';

export type HxIcpBand = 'lusha_tier' | 'apollo_tier' | 'nurture' | 'discard';

export type HxEnrichmentJobType = 'apollo_enrich' | 'lusha_reveal' | 'email_verify' | 'icp_score';

export type HxJobStatus = 'pending' | 'running' | 'completed' | 'failed';

export type HxDealStage =
  | 'Prospect'
  | 'Qualified'
  | 'Proposal'
  | 'Negotiation'
  | 'Closing'
  | 'Won'
  | 'Lost';

export type HxReplyIntent =
  | 'positive'
  | 'negative'
  | 'neutral'
  | 'unsubscribe'
  | 'bounce'
  | 'ooo';

// ── Core entity types ─────────────────────────────────────────────────────────

export interface HxCompany {
  id: string;
  source: HxSource;
  source_id: string;
  name: string | null;
  domain: string | null;
  country: string | null;
  registry_number: string | null;
  vertical: string | null;
  employees_est: number | null;
  directors: Record<string, unknown>[];
  raw_json: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export type HxCompanyInsert = Omit<HxCompany, 'id' | 'created_at' | 'updated_at'>;

export interface HxContact {
  id: string;
  company_id: string | null;
  source: HxSource;
  source_id: string;
  first_name: string | null;
  last_name: string | null;
  full_name: string | null;
  title: string | null;
  seniority: string | null;
  company_name: string | null;
  company_domain: string | null;
  country: string | null;
  vertical: string | null;
  email_pattern: string | null;
  email_verified: boolean;
  email_verified_at: string | null;
  phone: string | null;
  phone_source: string | null;
  linkedin_url: string | null;
  icp_score: number;
  icp_scored_at: string | null;
  enriched_apollo: boolean;
  enriched_apollo_at: string | null;
  enriched_lusha: boolean;
  enriched_lusha_at: string | null;
  in_nurture_pool: boolean;
  sequence_enrolled: boolean;
  sequence_enrolled_at: string | null;
  raw_json: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export type HxContactInsert = Omit<HxContact, 'id' | 'created_at' | 'updated_at'>;

export interface HxScrapeRun {
  id: string;
  source: HxSource;
  started_at: string;
  completed_at: string | null;
  records_scraped: number;
  records_ingested: number;
  records_rejected: number;
  error_count: number;
  status: 'running' | 'completed' | 'failed';
  summary: Record<string, unknown> | null;
}

export interface HxEnrichmentJob {
  id: string;
  contact_id: string;
  job_type: HxEnrichmentJobType;
  status: HxJobStatus;
  attempts: number;
  result: Record<string, unknown> | null;
  created_at: string;
  completed_at: string | null;
}

// ── Bronze event type ─────────────────────────────────────────────────────────

export type HxBronzeEventType =
  | 'contact.ingested'
  | 'contact.email_verified'
  | 'contact.icp_scored'
  | 'contact.apollo_enriched'
  | 'contact.lusha_revealed'
  | 'outreach.sent'
  | 'outreach.bounced'
  | 'outreach.enrolled'
  | 'outreach.opened'
  | 'reply.received'
  | 'reply.classified'
  | 'deal.stage_changed'
  | 'deal.closed'
  | 'payment.initiated'
  | 'payment.received'
  | 'sanctions.checked'
  | 'aml.checked'
  | 'notification.sent'
  | 'job.failed.terminal'
  | 'scrape.run.completed'
  | 'credits.checked';

export interface HxBronzeEvent {
  event_type: HxBronzeEventType;
  source_module: string;
  entity_id?: string;
  entity_type?: string;
  payload: Record<string, unknown>;
}

// ── Queue job type ────────────────────────────────────────────────────────────

export interface HxQueueJob<T = Record<string, unknown>> {
  job_id: string;
  job_type: string;
  payload: T;
  attempts: number;
  created_at: string;
  source_module: string;
}

// ── ICP score breakdown ───────────────────────────────────────────────────────

export interface HxIcpScore {
  contact_id: string;
  total: number;
  band: HxIcpBand;
  breakdown: {
    geography: number;
    title_seniority: number;
    vertical_fit: number;
    data_quality: number;
  };
}

// ── Notification types ────────────────────────────────────────────────────────

export interface HxNotificationPayload {
  event_type: string;
  channel: 'whatsapp' | 'in_app' | 'slack' | 'email';
  payload: Record<string, unknown>;
  status: 'pending' | 'sent' | 'failed';
}

export interface HxWhatsAppNotification {
  to: string;
  type: 'alert' | 'info' | 'action_required';
  module: string;
  headline: string;
  body: string;
  entity_name?: string;
  entity_id?: string;
  action_url?: string;
  timestamp: string;
}

// ── API response wrappers ─────────────────────────────────────────────────────

export interface HxApiResponse<T = unknown> {
  success: boolean;
  data: T | null;
  error: string | null;
  ts: string;
}

export interface HxPaginatedResponse<T = unknown> {
  success: boolean;
  data: T[];
  total: number;
  page: number;
  per_page: number;
  ts: string;
}
