-- Migration: hx_contacts
-- Created: 2026-07-13
-- Source: HARVYX_DATABANK_ARCH.md section 5

CREATE TABLE hx_contacts (
  id                    UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id            UUID         REFERENCES hx_companies(id) ON DELETE SET NULL,
  source                VARCHAR(50)  NOT NULL,
  source_id             VARCHAR(255) NOT NULL,
  first_name            VARCHAR(100),
  last_name             VARCHAR(100),
  full_name             VARCHAR(200),
  title                 VARCHAR(200),
  seniority             VARCHAR(50),
  company_name          VARCHAR(300),
  company_domain        VARCHAR(200),
  country               CHAR(2),
  vertical              VARCHAR(100),
  email_pattern         VARCHAR(200),
  email_verified        BOOLEAN      NOT NULL DEFAULT FALSE,
  email_verified_at     TIMESTAMPTZ,
  phone                 VARCHAR(50),
  phone_source          VARCHAR(50),
  linkedin_url          VARCHAR(500),
  icp_score             INTEGER      NOT NULL DEFAULT 0,
  icp_scored_at         TIMESTAMPTZ,
  enriched_apollo       BOOLEAN      NOT NULL DEFAULT FALSE,
  enriched_apollo_at    TIMESTAMPTZ,
  enriched_lusha        BOOLEAN      NOT NULL DEFAULT FALSE,
  enriched_lusha_at     TIMESTAMPTZ,
  in_nurture_pool       BOOLEAN      NOT NULL DEFAULT FALSE,
  sequence_enrolled     BOOLEAN      NOT NULL DEFAULT FALSE,
  sequence_enrolled_at  TIMESTAMPTZ,
  raw_json              JSONB,
  created_at            TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_hx_contacts_source UNIQUE (source, source_id)
);

CREATE TRIGGER trg_hx_contacts_updated_at
  BEFORE UPDATE ON hx_contacts
  FOR EACH ROW EXECUTE FUNCTION hx_set_updated_at();

-- ROLLBACK:
-- DROP TRIGGER IF EXISTS trg_hx_contacts_updated_at ON hx_contacts;
-- DROP TABLE IF EXISTS hx_contacts;
