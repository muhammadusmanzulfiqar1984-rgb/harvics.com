-- hx-notify-trigger.sql
-- Postgres trigger: fires pg_notify('hx_feed', ...) on relevant bronze inserts
-- Source: HARVYX_REPORTING_WIRE.md § 2
--
-- Apply: psql $HX_DATABASE_URL -f packages/db/hx-notify-trigger.sql
-- ROLLBACK: see bottom of file

-- Notify function
-- Serialises the newly inserted bronze row to JSON and fires pg_notify.
-- Payload is capped at Postgres's 8 000-byte NOTIFY limit; the inner payload
-- JSONB is truncated to 4 000 chars to ensure the envelope always fits.

CREATE OR REPLACE FUNCTION hx_notify_feed()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_payload      TEXT;
  v_inner_payload TEXT;
BEGIN
  v_inner_payload := LEFT(NEW.payload::TEXT, 4000);

  v_payload := json_build_object(
    'event_id',      NEW.id::TEXT,
    'event_type',    NEW.event_type,
    'source_module', NEW.source_module,
    'entity_id',     NEW.entity_id::TEXT,
    'entity_type',   NEW.entity_type,
    'payload',       v_inner_payload::JSON,
    'created_at',    TO_CHAR(NEW.created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')
  )::TEXT;

  PERFORM pg_notify('hx_feed', v_payload);

  RETURN NEW;
END;
$$;

-- Trigger
-- Fires AFTER INSERT on hx_events_bronze FOR EACH ROW.
-- WHEN clause: only the event types listed in HARVYX_REPORTING_WIRE.md § 2.

DROP TRIGGER IF EXISTS trg_hx_events_bronze_notify ON hx_events_bronze;

CREATE TRIGGER trg_hx_events_bronze_notify
  AFTER INSERT ON hx_events_bronze
  FOR EACH ROW
  WHEN (NEW.event_type IN (
    'contact.ingested',
    'contact.email_verified',
    'contact.icp_scored',
    'contact.apollo_enriched',
    'contact.lusha_revealed',
    'outreach.sent',
    'outreach.bounced',
    'reply.received',
    'reply.classified',
    'deal.stage_changed',
    'deal.closed',
    'payment.initiated',
    'payment.received',
    'sanctions.checked',
    'aml.checked',
    'scrape.run.completed',
    'notification.sent',
    'job.failed.terminal',
    'credits.checked'
  ))
  EXECUTE FUNCTION hx_notify_feed();

-- Verify installation

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'trg_hx_events_bronze_notify'
      AND tgrelid = 'hx_events_bronze'::regclass
  ) THEN
    RAISE EXCEPTION 'trg_hx_events_bronze_notify was not created';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_proc WHERE proname = 'hx_notify_feed'
  ) THEN
    RAISE EXCEPTION 'hx_notify_feed function was not created';
  END IF;

  RAISE NOTICE 'hx_notify_feed trigger verified OK';
END;
$$;

-- ROLLBACK:
-- DROP TRIGGER  IF EXISTS trg_hx_events_bronze_notify ON hx_events_bronze;
-- DROP FUNCTION IF EXISTS hx_notify_feed();
