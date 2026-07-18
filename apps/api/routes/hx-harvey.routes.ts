/**
 * hx-harvey.routes.ts — Harvey AI command API
 * Module 2
 *
 * Base path: /api/v1/harvey
 * Auth:      JWT Bearer (same secret as databank)
 */

import { Router, Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

import { handleHarveyChat } from '../services/hx-harvey.service';
import type { HxApiResponse } from '../../../packages/types/hx.types';
import type { HxHarveyResponse } from '../../../packages/types/hx-harvey.types';
import { hxLogger } from '../../../packages/lib/hx-logger';

const JWT_SECRET = process.env.HX_JWT_SECRET ?? '';
const MODULE = 'hx-harvey.routes';

interface JwtPayload {
  sub: string;
  email?: string;
  role?: string;
  iat: number;
  exp: number;
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

/**
 * POST /api/v1/harvey/chat
 * Body: { message: string, session_id: string, confirmation_token?: string }
 */
router.post('/chat', async (req: Request, res: Response): Promise<void> => {
  try {
    const body = req.body as {
      message?: string;
      session_id?: string;
      confirmation_token?: string;
    };

    if (!body.message || typeof body.message !== 'string') {
      res.status(400).json(fail('message is required'));
      return;
    }
    if (!body.session_id || typeof body.session_id !== 'string') {
      res.status(400).json(fail('session_id is required'));
      return;
    }

    const result: HxHarveyResponse = await handleHarveyChat({
      message: body.message,
      session_id: body.session_id,
      confirmation_token: body.confirmation_token ?? null,
      operator_id: req.operator?.sub ?? null,
    });

    res.json(ok(result));
  } catch (err) {
    hxLogger.error(MODULE, '/chat error', {
      err: err instanceof Error ? err.message : String(err),
    });
    res.status(500).json(fail('Harvey chat failed'));
  }
});

export { router as harveyRouter };
