-- Migration: hx_pipeline_deals + hx_sequences + hx_sequence_steps
-- Created: 2026-07-13
-- Source: HARVYX_BACKEND_RULES.md section 2 (table naming conventions)

CREATE TABLE hx_pipeline_deals (
  id             UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id     UUID         REFERENCES hx_contacts(id) ON DELETE SET NULL,
  company_id     UUID         REFERENCES hx_companies(id) ON DELETE SET NULL,
  title          VARCHAR(300) NOT NULL,
  stage          VARCHAR(100) NOT NULL DEFAULT 'Prospect'
                 CHECK (stage IN ('Prospect','Qualified','Proposal','Negotiation','Closing','Won','Lost')),
  value          NUMERIC(14,2),
  currency       CHAR(3)      NOT NULL DEFAULT 'USD',
  vertical       VARCHAR(100),
  probability    INTEGER      CHECK (probability BETWEEN 0 AND 100),
  expected_close DATE,
  notes          TEXT,
  raw_json       JSONB,
  created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_hx_pipeline_deals_updated_at
  BEFORE UPDATE ON hx_pipeline_deals
  FOR EACH ROW EXECUTE FUNCTION hx_set_updated_at();

-- ─────────────────────────────────────────────────────────────

CREATE TABLE hx_sequences (
  id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  name         VARCHAR(200) NOT NULL,
  vertical     VARCHAR(100),
  description  TEXT,
  status       VARCHAR(20)  NOT NULL DEFAULT 'draft'
               CHECK (status IN ('draft','active','paused','archived')),
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_hx_sequences_updated_at
  BEFORE UPDATE ON hx_sequences
  FOR EACH ROW EXECUTE FUNCTION hx_set_updated_at();

-- ─────────────────────────────────────────────────────────────

CREATE TABLE hx_sequence_steps (
  id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  sequence_id   UUID         NOT NULL REFERENCES hx_sequences(id) ON DELETE CASCADE,
  step_number   INTEGER      NOT NULL,
  channel       VARCHAR(50)  NOT NULL
                CHECK (channel IN ('email','linkedin','whatsapp','sms','call')),
  delay_days    INTEGER      NOT NULL DEFAULT 0,
  subject       VARCHAR(300),
  body_template TEXT         NOT NULL,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_hx_sequence_step UNIQUE (sequence_id, step_number)
);

-- ROLLBACK:
-- DROP TRIGGER IF EXISTS trg_hx_sequences_updated_at ON hx_sequences;
-- DROP TRIGGER IF EXISTS trg_hx_pipeline_deals_updated_at ON hx_pipeline_deals;
-- DROP TABLE IF EXISTS hx_sequence_steps;
-- DROP TABLE IF EXISTS hx_sequences;
-- DROP TABLE IF EXISTS hx_pipeline_deals;
