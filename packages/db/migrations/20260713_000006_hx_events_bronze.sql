-- Migration: hx_events_bronze
-- Created: 2026-07-13
-- Source: HARVYX_DATABANK_ARCH.md section 5 + HARVYX_BACKEND_RULES.md section 6
-- APPEND-ONLY. No UPDATE. No DELETE. Ever.

CREATE TABLE hx_events_bronze (
  id             UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type     VARCHAR(100) NOT NULL,
  source_module  VARCHAR(100) NOT NULL,
  entity_id      UUID,
  entity_type    VARCHAR(50),
  payload        JSONB        NOT NULL,
  created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Enforce append-only: block UPDATE and DELETE at DB level
CREATE OR REPLACE RULE hx_bronze_no_update AS
  ON UPDATE TO hx_events_bronze DO INSTEAD NOTHING;

CREATE OR REPLACE RULE hx_bronze_no_delete AS
  ON DELETE TO hx_events_bronze DO INSTEAD NOTHING;

-- ROLLBACK:
-- DROP RULE IF EXISTS hx_bronze_no_update ON hx_events_bronze;
-- DROP RULE IF EXISTS hx_bronze_no_delete ON hx_events_bronze;
-- DROP TABLE IF EXISTS hx_events_bronze;
