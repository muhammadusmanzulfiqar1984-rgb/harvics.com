-- Migration: Module 3 Session 3 — hx_replies classification / respond columns
-- Created: 2026-07-15
-- Adds only missing columns on existing hx_replies (from 000008).

-- intent + channel already exist. Expand intent CHECK for classifier values.
ALTER TABLE hx_replies DROP CONSTRAINT IF EXISTS hx_replies_intent_check;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_hx_replies_intent'
  ) THEN
    ALTER TABLE hx_replies
      ADD CONSTRAINT chk_hx_replies_intent
      CHECK (
        intent IS NULL OR intent IN (
          'positive', 'question', 'negative', 'no_reply_risk',
          'neutral', 'unsubscribe', 'bounce', 'ooo'
        )
      );
  END IF;
END $$;

ALTER TABLE hx_replies
  ADD COLUMN IF NOT EXISTS confidence DECIMAL(4,3);

ALTER TABLE hx_replies
  ADD COLUMN IF NOT EXISTS summary TEXT;

ALTER TABLE hx_replies
  ADD COLUMN IF NOT EXISTS suggested_response TEXT;

ALTER TABLE hx_replies
  ADD COLUMN IF NOT EXISTS responded BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE hx_replies
  ADD COLUMN IF NOT EXISTS responded_at TIMESTAMPTZ;

ALTER TABLE hx_replies
  ADD COLUMN IF NOT EXISTS responded_by VARCHAR(100);

ALTER TABLE hx_replies
  ADD COLUMN IF NOT EXISTS raw JSONB;

ALTER TABLE hx_replies
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- Backfill from legacy columns where present
UPDATE hx_replies
SET confidence = intent_score
WHERE confidence IS NULL AND intent_score IS NOT NULL;

UPDATE hx_replies
SET suggested_response = draft_body
WHERE suggested_response IS NULL AND draft_body IS NOT NULL;

UPDATE hx_replies
SET raw = raw_json
WHERE raw IS NULL AND raw_json IS NOT NULL;

UPDATE hx_replies
SET created_at = received_at
WHERE received_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_hx_replies_intent
  ON hx_replies (intent);

CREATE INDEX IF NOT EXISTS idx_hx_replies_contact_id
  ON hx_replies (contact_id);

CREATE INDEX IF NOT EXISTS idx_hx_replies_responded
  ON hx_replies (responded);

CREATE INDEX IF NOT EXISTS idx_hx_replies_created_at
  ON hx_replies (created_at DESC);

-- ROLLBACK:
-- DROP INDEX IF EXISTS idx_hx_replies_created_at;
-- DROP INDEX IF EXISTS idx_hx_replies_responded;
-- DROP INDEX IF EXISTS idx_hx_replies_contact_id;
-- DROP INDEX IF EXISTS idx_hx_replies_intent;
-- ALTER TABLE hx_replies DROP COLUMN IF EXISTS created_at;
-- ALTER TABLE hx_replies DROP COLUMN IF EXISTS raw;
-- ALTER TABLE hx_replies DROP COLUMN IF EXISTS responded_by;
-- ALTER TABLE hx_replies DROP COLUMN IF EXISTS responded_at;
-- ALTER TABLE hx_replies DROP COLUMN IF EXISTS responded;
-- ALTER TABLE hx_replies DROP COLUMN IF EXISTS suggested_response;
-- ALTER TABLE hx_replies DROP COLUMN IF EXISTS summary;
-- ALTER TABLE hx_replies DROP COLUMN IF EXISTS confidence;
-- ALTER TABLE hx_replies DROP CONSTRAINT IF EXISTS chk_hx_replies_intent;
