-- Migration: all indexes
-- Created: 2026-07-13
-- Source: HARVYX_DATABANK_ARCH.md section 5 (indexes block)

-- hx_contacts
CREATE INDEX idx_hx_contacts_icp             ON hx_contacts(icp_score DESC);
CREATE INDEX idx_hx_contacts_country         ON hx_contacts(country);
CREATE INDEX idx_hx_contacts_vertical        ON hx_contacts(vertical);
CREATE INDEX idx_hx_contacts_email_verified  ON hx_contacts(email_verified);
CREATE INDEX idx_hx_contacts_enriched_apollo ON hx_contacts(enriched_apollo);
CREATE INDEX idx_hx_contacts_enriched_lusha  ON hx_contacts(enriched_lusha);
CREATE INDEX idx_hx_contacts_sequence        ON hx_contacts(sequence_enrolled);
CREATE INDEX idx_hx_contacts_company_id      ON hx_contacts(company_id);
CREATE INDEX idx_hx_contacts_nurture         ON hx_contacts(in_nurture_pool);

-- hx_companies
CREATE INDEX idx_hx_companies_country        ON hx_companies(country);
CREATE INDEX idx_hx_companies_vertical       ON hx_companies(vertical);
CREATE INDEX idx_hx_companies_domain         ON hx_companies(domain);

-- hx_events_bronze
CREATE INDEX idx_hx_bronze_event_type        ON hx_events_bronze(event_type);
CREATE INDEX idx_hx_bronze_created           ON hx_events_bronze(created_at DESC);
CREATE INDEX idx_hx_bronze_entity            ON hx_events_bronze(entity_id);
CREATE INDEX idx_hx_bronze_source_module     ON hx_events_bronze(source_module);

-- hx_enrichment_jobs
CREATE INDEX idx_hx_enrichment_contact       ON hx_enrichment_jobs(contact_id);
CREATE INDEX idx_hx_enrichment_status        ON hx_enrichment_jobs(status);
CREATE INDEX idx_hx_enrichment_job_type      ON hx_enrichment_jobs(job_type);

-- hx_scrape_runs
CREATE INDEX idx_hx_scrape_runs_source       ON hx_scrape_runs(source);
CREATE INDEX idx_hx_scrape_runs_status       ON hx_scrape_runs(status);
CREATE INDEX idx_hx_scrape_runs_started      ON hx_scrape_runs(started_at DESC);

-- hx_outreach_log
CREATE INDEX idx_hx_outreach_contact         ON hx_outreach_log(contact_id);
CREATE INDEX idx_hx_outreach_channel         ON hx_outreach_log(channel);
CREATE INDEX idx_hx_outreach_status          ON hx_outreach_log(status);
CREATE INDEX idx_hx_outreach_sent_at         ON hx_outreach_log(sent_at DESC);

-- hx_replies
CREATE INDEX idx_hx_replies_contact          ON hx_replies(contact_id);
CREATE INDEX idx_hx_replies_intent           ON hx_replies(intent);
CREATE INDEX idx_hx_replies_processed        ON hx_replies(processed);

-- hx_pipeline_deals
CREATE INDEX idx_hx_deals_stage              ON hx_pipeline_deals(stage);
CREATE INDEX idx_hx_deals_contact            ON hx_pipeline_deals(contact_id);

-- hx_audit_log
CREATE INDEX idx_hx_audit_action             ON hx_audit_log(action);
CREATE INDEX idx_hx_audit_created            ON hx_audit_log(created_at DESC);
CREATE INDEX idx_hx_audit_entity             ON hx_audit_log(entity_id);

-- ROLLBACK:
-- DROP INDEX IF EXISTS idx_hx_contacts_icp;
-- DROP INDEX IF EXISTS idx_hx_contacts_country;
-- DROP INDEX IF EXISTS idx_hx_contacts_vertical;
-- DROP INDEX IF EXISTS idx_hx_contacts_email_verified;
-- DROP INDEX IF EXISTS idx_hx_contacts_enriched_apollo;
-- DROP INDEX IF EXISTS idx_hx_contacts_enriched_lusha;
-- DROP INDEX IF EXISTS idx_hx_contacts_sequence;
-- DROP INDEX IF EXISTS idx_hx_contacts_company_id;
-- DROP INDEX IF EXISTS idx_hx_contacts_nurture;
-- DROP INDEX IF EXISTS idx_hx_companies_country;
-- DROP INDEX IF EXISTS idx_hx_companies_vertical;
-- DROP INDEX IF EXISTS idx_hx_companies_domain;
-- DROP INDEX IF EXISTS idx_hx_bronze_event_type;
-- DROP INDEX IF EXISTS idx_hx_bronze_created;
-- DROP INDEX IF EXISTS idx_hx_bronze_entity;
-- DROP INDEX IF EXISTS idx_hx_bronze_source_module;
-- DROP INDEX IF EXISTS idx_hx_enrichment_contact;
-- DROP INDEX IF EXISTS idx_hx_enrichment_status;
-- DROP INDEX IF EXISTS idx_hx_enrichment_job_type;
-- DROP INDEX IF EXISTS idx_hx_scrape_runs_source;
-- DROP INDEX IF EXISTS idx_hx_scrape_runs_status;
-- DROP INDEX IF EXISTS idx_hx_scrape_runs_started;
-- DROP INDEX IF EXISTS idx_hx_outreach_contact;
-- DROP INDEX IF EXISTS idx_hx_outreach_channel;
-- DROP INDEX IF EXISTS idx_hx_outreach_status;
-- DROP INDEX IF EXISTS idx_hx_outreach_sent_at;
-- DROP INDEX IF EXISTS idx_hx_replies_contact;
-- DROP INDEX IF EXISTS idx_hx_replies_intent;
-- DROP INDEX IF EXISTS idx_hx_replies_processed;
-- DROP INDEX IF EXISTS idx_hx_deals_stage;
-- DROP INDEX IF EXISTS idx_hx_deals_contact;
-- DROP INDEX IF EXISTS idx_hx_audit_action;
-- DROP INDEX IF EXISTS idx_hx_audit_created;
-- DROP INDEX IF EXISTS idx_hx_audit_entity;
