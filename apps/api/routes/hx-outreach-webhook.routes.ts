/**
 * hx-outreach-webhook.routes.ts — Resend delivery webhooks
 * Module 3 Session 2
 *
 * Base path: /api/v1/outreach/webhook
 * Auth:      Resend/Svix signature (no JWT)
 *
 * Events: email.delivered | email.bounced | email.opened
 */

import { createHmac, timingSafeEqual } from 'crypto';
import { Router, Request, Response } from 'express';

import { pool } from '../../../packages/db';
import { bronzeWrite } from '../../../packages/lib/hx-bronze';
import { hxLogger } from '../../../packages/lib/hx-logger';
import { updateEnrollment } from '../../../packages/db/repositories/hx-outreach.repository';
import type { HxApiResponse } from '../../../packages/types/hx.types';

const MODULE = 'hx-outreach-webhook.routes';
const WEBHOOK_SECRET =
  process.env.HX_RESEND_WEBHOOK_SECRET
  ?? process.env.RESEND_WEBHOOK_SECRET
  ?? '';

function ok<T>(data: T): HxApiResponse<T> {
  return { success: true, data, error: null, ts: new Date().toISOString() };
}

function fail(error: string): HxApiResponse<null> {
  return { success: false, data: null, error, ts: new Date().toISOString() };
}

/**
 * Verify Resend (Svix) webhook signature.
 * Headers: svix-id, svix-timestamp, svix-signature
 */
function verifyResendSignature(
  rawBody: Buffer | string,
  headers: Record<string, string | string[] | undefined>,
): boolean {
  if (!WEBHOOK_SECRET) {
    // Allow in local/dev when secret unset — log loudly
    hxLogger.warn(MODULE, 'HX_RESEND_WEBHOOK_SECRET unset — skipping signature verify');
    return process.env.NODE_ENV !== 'production';
  }

  const msgId = String(headers['svix-id'] ?? '');
  const timestamp = String(headers['svix-timestamp'] ?? '');
  const signatureHeader = String(headers['svix-signature'] ?? '');
  if (!msgId || !timestamp || !signatureHeader) return false;

  // Reject stale timestamps (> 5 minutes)
  const tsNum = parseInt(timestamp, 10);
  if (!Number.isFinite(tsNum) || Math.abs(Date.now() / 1000 - tsNum) > 300) {
    return false;
  }

  const body = typeof rawBody === 'string' ? rawBody : rawBody.toString('utf8');
  const signedContent = `${msgId}.${timestamp}.${body}`;

  const secret = WEBHOOK_SECRET.startsWith('whsec_')
    ? Buffer.from(WEBHOOK_SECRET.slice(6), 'base64')
    : Buffer.from(WEBHOOK_SECRET, 'utf8');

  const expected = createHmac('sha256', secret)
    .update(signedContent)
    .digest('base64');

  const candidates = signatureHeader
    .split(' ')
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => (part.startsWith('v1,') ? part.slice(3) : part));

  return candidates.some((sig) => {
    try {
      const a = Buffer.from(sig);
      const b = Buffer.from(expected);
      return a.length === b.length && timingSafeEqual(a, b);
    } catch {
      return false;
    }
  });
}

interface ResendWebhookEvent {
  type?: string;
  data?: {
    email_id?: string;
    id?: string;
    to?: string[] | string;
    created_at?: string;
  };
}

const router = Router();

/** POST /api/v1/outreach/webhook/resend */
router.post('/resend', async (req: Request, res: Response): Promise<void> => {
  try {
    const rawBody: Buffer | string =
      (req as Request & { rawBody?: Buffer }).rawBody
      ?? Buffer.from(JSON.stringify(req.body ?? {}));

    if (!verifyResendSignature(rawBody, req.headers as Record<string, string | string[] | undefined>)) {
      res.status(401).json(fail('Invalid webhook signature'));
      return;
    }

    const event = (typeof rawBody === 'string'
      ? JSON.parse(rawBody)
      : (req.body ?? JSON.parse(rawBody.toString('utf8')))) as ResendWebhookEvent;

    const type = event.type ?? '';
    const emailId = event.data?.email_id ?? event.data?.id ?? null;

    hxLogger.info(MODULE, 'Resend webhook received', { type, emailId });

    if (!emailId) {
      res.json(ok({ handled: false, reason: 'missing_email_id' }));
      return;
    }

    const { rows: logs } = await pool.query<{
      id: string;
      enrollment_id: string | null;
      contact_id: string | null;
      status: string;
    }>(
      `SELECT id, enrollment_id, contact_id, status
       FROM hx_outreach_log
       WHERE external_id = $1
       ORDER BY sent_at DESC
       LIMIT 1`,
      [emailId],
    );

    const log = logs[0] ?? null;

    if (type === 'email.delivered' && log) {
      await pool.query(
        `UPDATE hx_outreach_log
         SET status = 'delivered',
             raw_json = COALESCE(raw_json, '{}'::jsonb) || $2::jsonb
         WHERE id = $1`,
        [log.id, JSON.stringify({ resend_event: type, at: new Date().toISOString() })],
      );
    }

    if (type === 'email.opened' && log) {
      await pool.query(
        `UPDATE hx_outreach_log
         SET status = 'opened',
             raw_json = COALESCE(raw_json, '{}'::jsonb) || $2::jsonb
         WHERE id = $1`,
        [log.id, JSON.stringify({ resend_event: type, at: new Date().toISOString() })],
      );
      await bronzeWrite({
        event_type: 'outreach.opened',
        source_module: MODULE,
        entity_id: log.id,
        entity_type: 'hx_outreach_log',
        payload: {
          contact_id: log.contact_id,
          enrollment_id: log.enrollment_id,
          external_id: emailId,
        },
      });
    }

    if (type === 'email.bounced') {
      if (log) {
        await pool.query(
          `UPDATE hx_outreach_log
           SET status = 'bounced',
               raw_json = COALESCE(raw_json, '{}'::jsonb) || $2::jsonb
           WHERE id = $1`,
          [log.id, JSON.stringify({ resend_event: type, at: new Date().toISOString() })],
        );

        if (log.enrollment_id) {
          await updateEnrollment(log.enrollment_id, {
            status: 'paused',
            next_step_at: null,
          });
        }

        await bronzeWrite({
          event_type: 'outreach.bounced',
          source_module: MODULE,
          entity_id: log.id,
          entity_type: 'hx_outreach_log',
          payload: {
            contact_id: log.contact_id,
            enrollment_id: log.enrollment_id,
            external_id: emailId,
            source: 'resend_webhook',
          },
        });
      }
    }

    res.json(ok({ handled: true, type, email_id: emailId }));
  } catch (err) {
    hxLogger.error(MODULE, 'webhook handler error', {
      err: err instanceof Error ? err.message : String(err),
    });
    res.status(500).json(fail('Webhook processing failed'));
  }
});

export { router as outreachWebhookRouter };
