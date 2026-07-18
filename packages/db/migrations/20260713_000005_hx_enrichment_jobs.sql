-- Migration: hx_enrichment_jobs
-- Created: 2026-07-13
-- Source: HARVYX_DATABANK_ARCH.md section 5

CREATE TABLE hx_enrichment_jobs (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id   UUID        NOT NULL REFERENCES hx_contacts(id) ON DELETE CASCADE,
  job_type     VARCHAR(50) NOT NULL
               CHECK (job_type IN ('apollo_enrich','lusha_reveal','email_verify','icp_score')),
  status       VARCHAR(20) NOT NULL DEFAULT 'pending'
               CHECK (status IN ('pending','running','completed','failed')),
  attempts     INTEGER     NOT NULL DEFAULT 0,
  result       JSONB,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- ROLLBACK:
-- DROP TABLE IF EXISTS hx_enrichment_jobs;
