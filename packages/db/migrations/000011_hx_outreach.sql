-- Migration: Module 3 Session 1 — Outreach Engine (enrollments + schema gaps)
-- Created: 2026-07-15
-- Depends on: 20260713_000007 (hx_sequences, hx_sequence_steps),
--             20260713_000008 (hx_outreach_log)
--
-- hx_sequences / hx_sequence_steps / hx_outreach_log already exist.
-- This migration adds enrollment tracking + columns needed for
-- Resend / LinkedIn log / Twilio dispatch (logic comes later).

-- ── hx_sequences — missing operator attribution ───────────────────────────────

ALTER TABLE hx_sequences
  ADD COLUMN IF NOT EXISTS created_by VARCHAR(100) NOT NULL DEFAULT 'mian';

-- ── hx_sequence_steps — step_type (distinct from channel for wait/manual) ─────

ALTER TABLE hx_sequence_steps
  ADD COLUMN IF NOT EXISTS step_type VARCHAR(50);

UPDATE hx_sequence_steps
SET step_type = channel
WHERE step_type IS NULL;

ALTER TABLE hx_sequence_steps
  ALTER COLUMN step_type SET DEFAULT 'email';

ALTER TABLE hx_sequence_steps
  ALTER COLUMN step_type SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_hx_sequence_steps_step_type'
  ) THEN
    ALTER TABLE hx_sequence_steps
      ADD CONSTRAINT chk_hx_sequence_steps_step_type
      CHECK (step_type IN ('email', 'linkedin', 'whatsapp', 'sms', 'call', 'wait'));
  END IF;
END $$;

-- ── hx_sequence_enrollments ───────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS hx_sequence_enrollments (
  id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id    UUID         NOT NULL REFERENCES hx_contacts(id) ON DELETE CASCADE,
  sequence_id   UUID         NOT NULL REFERENCES hx_sequences(id) ON DELETE CASCADE,
  current_step  INTEGER      NOT NULL DEFAULT 1,
  status        VARCHAR(20)  NOT NULL DEFAULT 'active'
                CHECK (status IN ('active', 'paused', 'completed', 'unsubscribed')),
  enrolled_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  next_step_at  TIMESTAMPTZ,
  completed_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_hx_sequence_enrollments_updated_at ON hx_sequence_enrollments;
CREATE TRIGGER trg_hx_sequence_enrollments_updated_at
  BEFORE UPDATE ON hx_sequence_enrollments
  FOR EACH ROW EXECUTE FUNCTION hx_set_updated_at();

-- One active enrollment per contact + sequence
CREATE UNIQUE INDEX IF NOT EXISTS uq_hx_enrollment_active
  ON hx_sequence_enrollments (contact_id, sequence_id)
  WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_hx_enrollments_contact
  ON hx_sequence_enrollments (contact_id);

CREATE INDEX IF NOT EXISTS idx_hx_enrollments_sequence
  ON hx_sequence_enrollments (sequence_id);

CREATE INDEX IF NOT EXISTS idx_hx_enrollments_status_next
  ON hx_sequence_enrollments (status, next_step_at)
  WHERE status = 'active';

-- ── hx_outreach_log — link to enrollment + provider message id ────────────────

ALTER TABLE hx_outreach_log
  ADD COLUMN IF NOT EXISTS enrollment_id UUID
    REFERENCES hx_sequence_enrollments(id) ON DELETE SET NULL;

ALTER TABLE hx_outreach_log
  ADD COLUMN IF NOT EXISTS external_id VARCHAR(200);

CREATE INDEX IF NOT EXISTS idx_hx_outreach_log_enrollment
  ON hx_outreach_log (enrollment_id);

CREATE INDEX IF NOT EXISTS idx_hx_outreach_log_external
  ON hx_outreach_log (external_id)
  WHERE external_id IS NOT NULL;

-- ROLLBACK:
-- DROP INDEX IF EXISTS idx_hx_outreach_log_external;
-- DROP INDEX IF EXISTS idx_hx_outreach_log_enrollment;
-- ALTER TABLE hx_outreach_log DROP COLUMN IF EXISTS external_id;
-- ALTER TABLE hx_outreach_log DROP COLUMN IF EXISTS enrollment_id;
-- DROP INDEX IF EXISTS idx_hx_enrollments_status_next;
-- DROP INDEX IF EXISTS idx_hx_enrollments_sequence;
-- DROP INDEX IF EXISTS idx_hx_enrollments_contact;
-- DROP INDEX IF EXISTS uq_hx_enrollment_active;
-- DROP TRIGGER IF EXISTS trg_hx_sequence_enrollments_updated_at ON hx_sequence_enrollments;
-- DROP TABLE IF EXISTS hx_sequence_enrollments;
-- ALTER TABLE hx_sequence_steps DROP CONSTRAINT IF EXISTS chk_hx_sequence_steps_step_type;
-- ALTER TABLE hx_sequence_steps DROP COLUMN IF EXISTS step_type;
-- ALTER TABLE hx_sequences DROP COLUMN IF EXISTS created_by;
