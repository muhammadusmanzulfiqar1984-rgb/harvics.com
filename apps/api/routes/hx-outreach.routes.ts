/**
 * hx-outreach.routes.ts — Outreach Engine API
 * Module 3 Session 2
 *
 * Base path: /api/v1/outreach
 * Auth:      JWT Bearer on all routes
 */

import { Router, Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

import { pool } from '../../../packages/db';
import {
  createSequence,
  createStep,
  getSequence,
  getSteps,
} from '../../../packages/db/repositories/hx-outreach.repository';
import { enrollContact } from '../services/hx-outreach.service';
import type { HxApiResponse, HxPaginatedResponse } from '../../../packages/types/hx.types';
import type {
  HxOutreachChannel,
  HxSequenceStatus,
  HxStepType,
} from '../../../packages/types/hx-outreach.types';
import { hxLogger } from '../../../packages/lib/hx-logger';

const JWT_SECRET = process.env.HX_JWT_SECRET ?? '';
const MODULE = 'hx-outreach.routes';

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
    hxLogger.error(MODULE, 'HX_JWT_SECRET is not set');
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

const router = Router();
router.use(requireAuth);

/** POST /api/v1/outreach/sequences */
router.post('/sequences', async (req: Request, res: Response): Promise<void> => {
  try {
    const body = req.body as {
      name?: string;
      vertical?: string;
      description?: string;
      status?: HxSequenceStatus;
    };

    if (!body.name || typeof body.name !== 'string') {
      res.status(400).json(fail('name is required'));
      return;
    }

    const sequence = await createSequence({
      name: body.name.trim(),
      vertical: body.vertical ?? null,
      description: body.description ?? null,
      status: body.status ?? 'draft',
      created_by: req.operator?.sub ?? 'mian',
    });

    res.status(201).json(ok(sequence));
  } catch (err) {
    hxLogger.error(MODULE, 'POST /sequences failed', {
      err: err instanceof Error ? err.message : String(err),
    });
    res.status(500).json(fail('Failed to create sequence'));
  }
});

/** GET /api/v1/outreach/sequences */
router.get('/sequences', async (_req: Request, res: Response): Promise<void> => {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM hx_sequences ORDER BY created_at DESC`,
    );
    res.json(ok(rows));
  } catch (err) {
    hxLogger.error(MODULE, 'GET /sequences failed', {
      err: err instanceof Error ? err.message : String(err),
    });
    res.status(500).json(fail('Failed to list sequences'));
  }
});

/** POST /api/v1/outreach/sequences/:id/steps */
router.post('/sequences/:id/steps', async (req: Request, res: Response): Promise<void> => {
  try {
    const sequenceId = req.params.id;
    const sequence = await getSequence(sequenceId);
    if (!sequence) {
      res.status(404).json(fail('Sequence not found'));
      return;
    }

    const body = req.body as {
      step_number?: number;
      channel?: HxOutreachChannel;
      step_type?: HxStepType;
      delay_days?: number;
      subject?: string;
      body_template?: string;
    };

    if (!body.channel) {
      res.status(400).json(fail('channel is required'));
      return;
    }
    if (!body.body_template || typeof body.body_template !== 'string') {
      res.status(400).json(fail('body_template is required'));
      return;
    }

    let stepNumber = body.step_number;
    if (stepNumber == null) {
      const existing = await getSteps(sequenceId);
      stepNumber = existing.length + 1;
    }

    const step = await createStep({
      sequence_id: sequenceId,
      step_number: stepNumber,
      channel: body.channel,
      step_type: body.step_type,
      delay_days: body.delay_days ?? 0,
      subject: body.subject ?? null,
      body_template: body.body_template,
    });

    res.status(201).json(ok(step));
  } catch (err) {
    hxLogger.error(MODULE, 'POST /sequences/:id/steps failed', {
      err: err instanceof Error ? err.message : String(err),
    });
    res.status(500).json(fail('Failed to add step'));
  }
});

/** POST /api/v1/outreach/enroll */
router.post('/enroll', async (req: Request, res: Response): Promise<void> => {
  try {
    const body = req.body as { contact_id?: string; sequence_id?: string };
    if (!body.contact_id || !body.sequence_id) {
      res.status(400).json(fail('contact_id and sequence_id are required'));
      return;
    }

    const enrollment = await enrollContact(body.contact_id, body.sequence_id);
    res.status(201).json(ok(enrollment));
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const map: Record<string, number> = {
      contact_not_found: 404,
      sequence_not_found: 404,
      sequence_archived: 400,
      sequence_has_no_steps: 400,
    };
    const status = map[message] ?? (message.includes('uq_hx_enrollment_active') ? 409 : 500);
    hxLogger.error(MODULE, 'POST /enroll failed', { err: message });
    res.status(status).json(fail(
      status === 409 ? 'Contact already actively enrolled in this sequence' : message,
    ));
  }
});

/** GET /api/v1/outreach/log — paginated */
router.get('/log', async (req: Request, res: Response): Promise<void> => {
  try {
    const page = Math.max(1, parseInt(String(req.query.page ?? '1'), 10) || 1);
    const perPage = Math.min(100, Math.max(1, parseInt(String(req.query.per_page ?? '25'), 10) || 25));
    const offset = (page - 1) * perPage;
    const contactId = typeof req.query.contact_id === 'string' ? req.query.contact_id : null;

    const where = contactId ? 'WHERE contact_id = $3' : '';
    const params: unknown[] = [perPage, offset];
    if (contactId) params.push(contactId);

    const countSql = `SELECT COUNT(*)::int AS n FROM hx_outreach_log ${where.replace('$3', '$1')}`;
    const countParams = contactId ? [contactId] : [];
    const { rows: countRows } = await pool.query(countSql, countParams);
    const total = countRows[0]?.n ?? 0;

    const { rows } = await pool.query(
      `SELECT * FROM hx_outreach_log
       ${where}
       ORDER BY sent_at DESC
       LIMIT $1 OFFSET $2`,
      params,
    );

    const payload: HxPaginatedResponse<typeof rows[number]> = {
      success: true,
      data: rows,
      total,
      page,
      per_page: perPage,
      ts: new Date().toISOString(),
    };
    res.json(payload);
  } catch (err) {
    hxLogger.error(MODULE, 'GET /log failed', {
      err: err instanceof Error ? err.message : String(err),
    });
    res.status(500).json(fail('Failed to fetch outreach log'));
  }
});

/** POST /api/v1/outreach/sequences/:id/pause */
router.post('/sequences/:id/pause', async (req: Request, res: Response): Promise<void> => {
  try {
    const { rows } = await pool.query(
      `UPDATE hx_sequences
       SET status = 'paused', updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [req.params.id],
    );
    if (!rows[0]) {
      res.status(404).json(fail('Sequence not found'));
      return;
    }
    res.json(ok(rows[0]));
  } catch (err) {
    hxLogger.error(MODULE, 'POST /sequences/:id/pause failed', {
      err: err instanceof Error ? err.message : String(err),
    });
    res.status(500).json(fail('Failed to pause sequence'));
  }
});

/** POST /api/v1/outreach/sequences/:id/resume */
router.post('/sequences/:id/resume', async (req: Request, res: Response): Promise<void> => {
  try {
    const { rows } = await pool.query(
      `UPDATE hx_sequences
       SET status = 'active', updated_at = NOW()
       WHERE id = $1 AND status IN ('paused', 'draft')
       RETURNING *`,
      [req.params.id],
    );
    if (!rows[0]) {
      res.status(404).json(fail('Sequence not found or not resumable'));
      return;
    }
    res.json(ok(rows[0]));
  } catch (err) {
    hxLogger.error(MODULE, 'POST /sequences/:id/resume failed', {
      err: err instanceof Error ? err.message : String(err),
    });
    res.status(500).json(fail('Failed to resume sequence'));
  }
});

export { router as outreachRouter };
