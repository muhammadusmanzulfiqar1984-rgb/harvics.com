-- Migration: hx_outreach_log + hx_replies + hx_notifications + hx_audit_log
-- Created: 2026-07-13
-- Source: HARVYX_BACKEND_RULES.md section 2

CREATE TABLE hx_outreach_log (
  id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id    UUID         REFERENCES hx_contacts(id) ON DELETE SET NULL,
  sequence_id   UUID         REFERENCES hx_sequences(id) ON DELETE SET NULL,
  step_id       UUID         REFERENCES hx_sequence_steps(id) ON DELETE SET NULL,
  channel       VARCHAR(50)  NOT NULL
                CHECK (channel IN ('email','linkedin','whatsapp','sms','call')),
  status        VARCHAR(50)  NOT NULL DEFAULT 'sent'
                CHECK (status IN ('sent','delivered','opened','clicked','bounced','failed')),
  subject       VARCHAR(300),
  body_preview  VARCHAR(500),
  sent_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  raw_json      JSONB
);

-- ─────────────────────────────────────────────────────────────

CREATE TABLE hx_replies (
  id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id      UUID         REFERENCES hx_contacts(id) ON DELETE SET NULL,
  outreach_log_id UUID         REFERENCES hx_outreach_log(id) ON DELETE SET NULL,
  channel         VARCHAR(50)  NOT NULL
                  CHECK (channel IN ('email','linkedin','whatsapp','sms')),
  body            TEXT,
  intent          VARCHAR(50)
                  CHECK (intent IN ('positive','negative','neutral','unsubscribe','bounce','ooo')),
  intent_score    NUMERIC(4,3),
  draft_ready     BOOLEAN      NOT NULL DEFAULT FALSE,
  draft_body      TEXT,
  processed       BOOLEAN      NOT NULL DEFAULT FALSE,
  received_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  raw_json        JSONB
);

-- ─────────────────────────────────────────────────────────────

CREATE TABLE hx_notifications (
  id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type   VARCHAR(100) NOT NULL,
  channel      VARCHAR(50)  NOT NULL
               CHECK (channel IN ('whatsapp','in_app','slack','email')),
  payload      JSONB        NOT NULL,
  status       VARCHAR(20)  NOT NULL DEFAULT 'pending'
               CHECK (status IN ('pending','sent','failed')),
  sent_at      TIMESTAMPTZ,
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- hx_audit_log — APPEND-ONLY. No UPDATE. No DELETE. Ever.

CREATE TABLE hx_audit_log (
  id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  operator_id   VARCHAR(100) NOT NULL DEFAULT 'mian',
  action        VARCHAR(100) NOT NULL,
  entity_type   VARCHAR(50),
  entity_id     UUID,
  before_state  JSONB,
  after_state   JSONB,
  ip_address    INET,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE RULE hx_audit_no_update AS
  ON UPDATE TO hx_audit_log DO INSTEAD NOTHING;

CREATE OR REPLACE RULE hx_audit_no_delete AS
  ON DELETE TO hx_audit_log DO INSTEAD NOTHING;

-- ROLLBACK:
-- DROP RULE IF EXISTS hx_audit_no_update ON hx_audit_log;
-- DROP RULE IF EXISTS hx_audit_no_delete ON hx_audit_log;
-- DROP TABLE IF EXISTS hx_notifications;
-- DROP TABLE IF EXISTS hx_replies;
-- DROP TABLE IF EXISTS hx_outreach_log;
-- DROP TABLE IF EXISTS hx_audit_log;
