-- Migration: hx_harvey (Module 2 — Harvey AI)
-- Created: 2026-07-14
-- Session 1: database only

CREATE TABLE hx_harvey_sessions (
  id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id    VARCHAR(100) UNIQUE NOT NULL,
  operator_id   VARCHAR(100),
  created_at    TIMESTAMPTZ  DEFAULT NOW(),
  updated_at    TIMESTAMPTZ  DEFAULT NOW(),
  expires_at    TIMESTAMPTZ,
  last_intent   VARCHAR(50),
  turn_count    INTEGER      DEFAULT 0
);

CREATE TABLE hx_harvey_messages (
  id                    UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id            VARCHAR(100) REFERENCES hx_harvey_sessions(session_id),
  role                  VARCHAR(20)  NOT NULL,
  content               TEXT         NOT NULL,
  intent                VARCHAR(50),
  confidence            DECIMAL(4,3),
  entities              JSONB,
  actions_taken         JSONB        DEFAULT '[]',
  requires_confirmation BOOLEAN      DEFAULT false,
  confirmed             BOOLEAN,
  model_used            VARCHAR(100),
  latency_ms            INTEGER,
  created_at            TIMESTAMPTZ  DEFAULT NOW()
);

CREATE TABLE hx_harvey_actions (
  id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id   UUID         REFERENCES hx_harvey_messages(id),
  session_id   VARCHAR(100),
  action_type  VARCHAR(100) NOT NULL,
  payload      JSONB,
  result       JSONB,
  status       VARCHAR(20)  DEFAULT 'pending',
  created_at   TIMESTAMPTZ  DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX idx_hx_harvey_sessions_session_id ON hx_harvey_sessions (session_id);
CREATE INDEX idx_hx_harvey_messages_session_id ON hx_harvey_messages (session_id);
CREATE INDEX idx_hx_harvey_messages_created_at ON hx_harvey_messages (created_at);
CREATE INDEX idx_hx_harvey_actions_session_id  ON hx_harvey_actions (session_id);
CREATE INDEX idx_hx_harvey_actions_status      ON hx_harvey_actions (status);
