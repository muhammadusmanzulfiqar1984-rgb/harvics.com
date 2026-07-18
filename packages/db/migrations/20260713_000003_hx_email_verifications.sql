-- Migration: hx_email_verifications
-- Created: 2026-07-13
-- Source: HARVYX_DATABANK_ARCH.md section 5

CREATE TABLE hx_email_verifications (
  id                   UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id           UUID         NOT NULL REFERENCES hx_contacts(id) ON DELETE CASCADE,
  email_candidate      VARCHAR(200) NOT NULL,
  mx_host              VARCHAR(200),
  smtp_response_code   INTEGER,
  verified             BOOLEAN      NOT NULL,
  verified_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ROLLBACK:
-- DROP TABLE IF EXISTS hx_email_verifications;
