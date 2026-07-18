-- Migration: hx_companies
-- Created: 2026-07-13
-- Source: HARVYX_DATABANK_ARCH.md section 5

CREATE TABLE hx_companies (
  id               UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  source           VARCHAR(50)  NOT NULL,
  source_id        VARCHAR(255) NOT NULL,
  name             VARCHAR(300),
  domain           VARCHAR(200),
  country          CHAR(2),
  registry_number  VARCHAR(100),
  vertical         VARCHAR(100),
  employees_est    INTEGER,
  directors        JSONB        NOT NULL DEFAULT '[]',
  raw_json         JSONB,
  created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_hx_companies_source UNIQUE (source, source_id)
);

-- Shared updated_at trigger function — created once, reused by all mutable tables
CREATE OR REPLACE FUNCTION hx_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_hx_companies_updated_at
  BEFORE UPDATE ON hx_companies
  FOR EACH ROW EXECUTE FUNCTION hx_set_updated_at();

-- ROLLBACK:
-- DROP TRIGGER IF EXISTS trg_hx_companies_updated_at ON hx_companies;
-- DROP TABLE IF EXISTS hx_companies;
-- DROP FUNCTION IF EXISTS hx_set_updated_at();
