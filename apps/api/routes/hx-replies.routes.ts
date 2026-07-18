/**
 * hx-replies.routes.ts — Reply Detection API
 * Module 3 Session 3
 *
 * Base path: /api/v1/replies
 * Auth:      JWT Bearer on all routes
 */

import { Router, Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Queue } from 'bullmq';
import { randomUUID } from 'crypto';

import { pool } from '../../../packages/db';
import { bronzeWrite } from '../../../packages/lib/hx-bronze';
import { hxLogger } from '../../../packages/lib/hx-logger';
import type { HxApiResponse, HxQueueJob } from '../../../packages/types/hx.types';
import {
  sendEmail,
  sendSMS,
  sendWhatsApp,
  type OutreachContact,
} from '../services/hx-outreach.service';

const JWT_SECRET = process.env.HX_JWT_SECRET ?? '';
const REDIS_URL = process.env.HX_REDIS_URL ?? 'redis://localhost:6379';
const MODULE = 'hx-replies.routes';

const classifyQueue = new Queue('hx-reply-classify', {
  connection: { url: REDIS_URL, maxRetriesPerRequest: null },
});

interface JwtPayload {
  sub: string;
  email?: string;
  role?: string;
  iat: number;
  exp: number;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      operator?: JwtPayload;
    }
  }
}

export interface HxReply {
  id: string;
  contact_id: string | null;
  outreach_log_id: string | null;
  channel: string;
  body: string | null;
  intent: string | null;
  confidence: number | null;
  summary: string | null;
  suggested_response: string | null;
  responded: boolean;
  responded_at: string | null;
  responded_by: string | null;
  raw: Record<string, unknown> | null;
  created_at: string;
  received_at: string;
}

function ok<T>(data: T): HxApiResponse<T> {
  return { success: true, data, error: null, ts: new Date().toISOString() };
}

function fail(error: string): HxApiResponse<null> {
  return { success: false, data: null, error, ts: new Date().toISOString() };
}

function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers['authorization'];
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) {
    res.status(401).json(fail('Missing Bearer token'));
    return;
  }
  if (!JWT_SECRET) {
    res.status(500).json(fail('Server misconfiguration'));
    return;
  }
  try {
    req.operator = jwt.verify(token, JWT_SECRET) as JwtPayload;
    next();
  } catch (err) {
    res.status(401).json(fail(
      err instanceof jwt.TokenExpiredError ? 'Token expired' : 'Invalid token',
    ));
  }
}

async function loadContact(contactId: string): Promise<OutreachContact | null> {
  const { rows } = await pool.query<OutreachContact>(
    `SELECT id, first_name, last_name, full_name, company_name,
            email_pattern, phone, linkedin_url
     FROM hx_contacts WHERE id = $1`,
    [contactId],
  );
  return rows[0] ?? null;
}

async function sendViaChannel(
  contact: OutreachContact,
  channel: string,
  message: string,
  subject?: string,
): Promise<{ sent: boolean; external_id: string }> {
  const step = { subject: subject ?? 'Re: Harvics', body_template: message };

  if (channel === 'email') {
    const r = await sendEmail(contact, step);
    return { sent: r.sent, external_id: r.message_id };
  }
  if (channel === 'whatsapp') {
    const r = await sendWhatsApp(contact, step);
    return { sent: r.sent, external_id: r.sid };
  }
  if (channel === 'sms') {
    const r = await sendSMS(contact, step);
    return { sent: r.sent, external_id: r.sid };
  }
  if (channel === 'linkedin') {
    hxLogger.info(MODULE, 'LinkedIn response flagged for manual send', {
      contact_id: contact.id,
      preview: message.slice(0, 120),
    });
    return { sent: true, external_id: '' };
  }
  return { sent: false, external_id: '' };
}

const router = Router();
router.use(requireAuth);

/** POST /api/v1/replies/inbound */
router.post('/inbound', async (req: Request, res: Response): Promise<void> => {
  try {
    const body = req.body as {
      contact_id?: string;
      channel?: string;
      message?: string;
      raw?: Record<string, unknown>;
      outreach_log_id?: string;
    };

    if (!body.contact_id || !body.channel || !body.message) {
      res.status(400).json(fail('contact_id, channel, and message are required'));
      return;
    }

    const channel = body.channel.toLowerCase();
    if (!['email', 'linkedin', 'whatsapp', 'sms'].includes(channel)) {
      res.status(400).json(fail('channel must be email|linkedin|whatsapp|sms'));
      return;
    }

    const contact = await loadContact(body.contact_id);
    if (!contact) {
      res.status(404).json(fail('Contact not found'));
      return;
    }

    const rawPayload = body.raw ?? {};
    const { rows } = await pool.query<HxReply>(
      `INSERT INTO hx_replies
         (contact_id, outreach_log_id, channel, body, raw, raw_json, processed)
       VALUES ($1, $2, $3, $4, $5::jsonb, $5::jsonb, FALSE)
       RETURNING *`,
      [
        body.contact_id,
        body.outreach_log_id ?? null,
        channel,
        body.message,
        JSON.stringify(rawPayload),
      ],
    );
    const reply = rows[0];

    await bronzeWrite({
      event_type: 'reply.received',
      source_module: MODULE,
      entity_id: reply.id,
      entity_type: 'hx_reply',
      payload: {
        contact_id: body.contact_id,
        channel,
      },
    });

    const job: HxQueueJob<{
      reply_id: string;
      contact_id: string;
      channel: string;
      reply_text: string;
      outreach_log_id?: string | null;
    }> = {
      job_id: randomUUID(),
      job_type: 'reply_classify',
      source_module: MODULE,
      attempts: 0,
      created_at: new Date().toISOString(),
      payload: {
        reply_id: reply.id,
        contact_id: body.contact_id,
        channel,
        reply_text: body.message,
        outreach_log_id: body.outreach_log_id ?? null,
      },
    };

    await classifyQueue.add('classify', job, {
      jobId: job.job_id,
      attempts: 3,
      removeOnComplete: 100,
      removeOnFail: 50,
    });

    res.status(202).json(ok({
      id: reply.id,
      status: 'accepted',
      queued: 'hx-reply-classify',
    }));
  } catch (err) {
    hxLogger.error(MODULE, 'POST /inbound failed', {
      err: err instanceof Error ? err.message : String(err),
    });
    res.status(500).json(fail('Failed to accept inbound reply'));
  }
});

/** GET /api/v1/replies */
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const page = Math.max(1, parseInt(String(req.query.page ?? '1'), 10) || 1);
    const limit = Math.min(
      100,
      Math.max(1, parseInt(String(req.query.limit ?? req.query.per_page ?? '25'), 10) || 25),
    );
    const offset = (page - 1) * limit;

    const filters: string[] = [];
    const params: unknown[] = [];

    const add = (sql: string, value: unknown) => {
      params.push(value);
      filters.push(sql.replace('?', `$${params.length}`));
    };

    if (typeof req.query.intent === 'string' && req.query.intent) {
      add('intent = ?', req.query.intent);
    }
    if (typeof req.query.channel === 'string' && req.query.channel) {
      add('channel = ?', req.query.channel);
    }
    if (typeof req.query.contact_id === 'string' && req.query.contact_id) {
      add('contact_id = ?', req.query.contact_id);
    }
    if (typeof req.query.responded === 'string') {
      add('responded = ?', req.query.responded === 'true' || req.query.responded === '1');
    }
    if (typeof req.query.date_from === 'string' && req.query.date_from) {
      add('created_at >= ?::timestamptz', req.query.date_from);
    }
    if (typeof req.query.date_to === 'string' && req.query.date_to) {
      add('created_at <= ?::timestamptz', req.query.date_to);
    }

    const where = filters.length ? `WHERE ${filters.join(' AND ')}` : '';

    const countRes = await pool.query<{ n: number }>(
      `SELECT COUNT(*)::int AS n FROM hx_replies ${where}`,
      params,
    );
    const total = countRes.rows[0]?.n ?? 0;

    const listParams = [...params, limit, offset];
    const { rows } = await pool.query(
      `SELECT * FROM hx_replies
       ${where}
       ORDER BY created_at DESC
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      listParams,
    );

    res.json({
      data: rows,
      total,
      page,
      limit,
      ts: new Date().toISOString(),
    });
  } catch (err) {
    hxLogger.error(MODULE, 'GET / failed', {
      err: err instanceof Error ? err.message : String(err),
    });
    res.status(500).json(fail('Failed to list replies'));
  }
});

/** GET /api/v1/replies/:id */
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { rows } = await pool.query(`SELECT * FROM hx_replies WHERE id = $1`, [req.params.id]);
    if (!rows[0]) {
      res.status(404).json(fail('Reply not found'));
      return;
    }
    res.json(ok(rows[0]));
  } catch (err) {
    hxLogger.error(MODULE, 'GET /:id failed', {
      err: err instanceof Error ? err.message : String(err),
    });
    res.status(500).json(fail('Failed to fetch reply'));
  }
});

/** POST /api/v1/replies/:id/respond */
router.post('/:id/respond', async (req: Request, res: Response): Promise<void> => {
  try {
    const body = req.body as { message?: string; channel?: string };
    if (!body.message || !body.channel) {
      res.status(400).json(fail('message and channel are required'));
      return;
    }

    const { rows } = await pool.query(`SELECT * FROM hx_replies WHERE id = $1`, [req.params.id]);
    const reply = rows[0];
    if (!reply) {
      res.status(404).json(fail('Reply not found'));
      return;
    }
    if (!reply.contact_id) {
      res.status(400).json(fail('Reply has no contact_id'));
      return;
    }

    const contact = await loadContact(reply.contact_id);
    if (!contact) {
      res.status(404).json(fail('Contact not found'));
      return;
    }

    const channel = body.channel.toLowerCase();
    const send = await sendViaChannel(contact, channel, body.message);
    if (!send.sent) {
      res.status(502).json(fail('Send failed'));
      return;
    }

    const operatorId = req.operator?.sub ?? 'mian';
    const { rows: updated } = await pool.query(
      `UPDATE hx_replies SET
         responded = TRUE,
         responded_at = NOW(),
         responded_by = $2,
         raw = COALESCE(raw, '{}'::jsonb) || $3::jsonb
       WHERE id = $1
       RETURNING *`,
      [
        reply.id,
        operatorId,
        JSON.stringify({
          response_channel: channel,
          response_external_id: send.external_id,
          responded_message: body.message.slice(0, 500),
        }),
      ],
    );

    await bronzeWrite({
      event_type: 'outreach.sent',
      source_module: MODULE,
      entity_id: reply.id,
      entity_type: 'hx_reply',
      payload: {
        contact_id: reply.contact_id,
        channel,
        reply_id: reply.id,
        external_id: send.external_id,
        via: 'respond',
      },
    });

    res.json(ok(updated[0]));
  } catch (err) {
    hxLogger.error(MODULE, 'POST /:id/respond failed', {
      err: err instanceof Error ? err.message : String(err),
    });
    res.status(500).json(fail('Failed to send response'));
  }
});

/** POST /api/v1/replies/:id/approve-draft */
router.post('/:id/approve-draft', async (req: Request, res: Response): Promise<void> => {
  try {
    const { rows } = await pool.query(`SELECT * FROM hx_replies WHERE id = $1`, [req.params.id]);
    const reply = rows[0];
    if (!reply) {
      res.status(404).json(fail('Reply not found'));
      return;
    }

    const draft = reply.suggested_response || reply.draft_body;
    if (!draft) {
      res.status(400).json(fail('No suggested_response draft to approve'));
      return;
    }
    if (!reply.contact_id) {
      res.status(400).json(fail('Reply has no contact_id'));
      return;
    }

    const contact = await loadContact(reply.contact_id);
    if (!contact) {
      res.status(404).json(fail('Contact not found'));
      return;
    }

    const channel = String(reply.channel || 'email').toLowerCase();
    const send = await sendViaChannel(contact, channel, draft);
    if (!send.sent) {
      res.status(502).json(fail('Draft send failed'));
      return;
    }

    const operatorId = req.operator?.sub ?? 'mian';
    const { rows: updated } = await pool.query(
      `UPDATE hx_replies SET
         responded = TRUE,
         responded_at = NOW(),
         responded_by = $2,
         draft_ready = FALSE,
         raw = COALESCE(raw, '{}'::jsonb) || $3::jsonb
       WHERE id = $1
       RETURNING *`,
      [
        reply.id,
        operatorId,
        JSON.stringify({
          approved_draft: true,
          response_channel: channel,
          response_external_id: send.external_id,
        }),
      ],
    );

    await bronzeWrite({
      event_type: 'outreach.sent',
      source_module: MODULE,
      entity_id: reply.id,
      entity_type: 'hx_reply',
      payload: {
        contact_id: reply.contact_id,
        channel,
        reply_id: reply.id,
        external_id: send.external_id,
        via: 'approve-draft',
      },
    });

    res.json(ok(updated[0]));
  } catch (err) {
    hxLogger.error(MODULE, 'POST /:id/approve-draft failed', {
      err: err instanceof Error ? err.message : String(err),
    });
    res.status(500).json(fail('Failed to approve draft'));
  }
});

export { router as repliesRouter };
