-- Migration: hx_scrape_runs
-- Created: 2026-07-13
-- Source: HARVYX_DATABANK_ARCH.md section 5

CREATE TABLE hx_scrape_runs (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  source            VARCHAR(50) NOT NULL,
  started_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at      TIMESTAMPTZ,
  records_scraped   INTEGER     NOT NULL DEFAULT 0,
  records_ingested  INTEGER     NOT NULL DEFAULT 0,
  records_rejected  INTEGER     NOT NULL DEFAULT 0,
  error_count       INTEGER     NOT NULL DEFAULT 0,
  status            VARCHAR(20) NOT NULL DEFAULT 'running'
                    CHECK (status IN ('running','completed','failed')),
  summary           JSONB
);

-- ROLLBACK:
-- DROP TABLE IF EXISTS hx_scrape_runs;
