/**
 * hx-events.routes.ts — publish / smoke Harvics_OS Kafka events
 * Base: /api/v1/events
 */

import { Router, type Request, type Response } from 'express';
import jwt from 'jsonwebtoken';
import {
  kafkaConfigured,
  publishHarvicsEvent,
  type HarvicsOsEventInput,
} from '../../../packages/lib/kafka';
import { completeWithFallback } from '../../../packages/lib/llm/fallback';
import { hxLogger } from '../../../packages/lib/hx-logger';

const MODULE = 'hx-events.routes';
const JWT_SECRET = process.env.HX_JWT_SECRET ?? '';

type Authed = Request & { operator?: { sub?: string; role?: string } };

function ok<T>(data: T) {
  return { success: true, data, error: null, ts: new Date().toISOString() };
}
function fail(error: string) {
  return { success: false, data: null, error, ts: new Date().toISOString() };
}

function auth(req: Authed, res: Response, next: () => void): void {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token || !JWT_SECRET) {
    res.status(401).json(fail('Unauthorized'));
    return;
  }
  try {
    req.operator = jwt.verify(token, JWT_SECRET) as Authed['operator'];
    next();
  } catch {
    res.status(401).json(fail('Unauthorized'));
  }
}

const router = Router();
router.use(auth);

/** GET /api/v1/events/health — Kafka config present? */
router.get('/health', (_req: Request, res: Response) => {
  res.json(
    ok({
      kafkaConfigured: kafkaConfigured(),
      topic: process.env.KAFKA_TOPIC || 'Harvics_OS',
      bootstrap: Boolean(process.env.KAFKA_BOOTSTRAP_SERVER),
    }),
  );
});

/**
 * POST /api/v1/events/publish
 * Body: { sourceModule, eventType, payload, eventId?, meta? }
 */
router.post('/publish', async (req: Request, res: Response): Promise<void> => {
  try {
    const body = req.body || {};
    if (!body.sourceModule || !body.eventType || body.payload == null) {
      res.status(400).json(fail('sourceModule, eventType, payload required'));
      return;
    }
    const input: HarvicsOsEventInput = {
      sourceModule: String(body.sourceModule),
      eventType: String(body.eventType),
      payload: body.payload,
      eventId: body.eventId ? String(body.eventId) : undefined,
      meta: body.meta,
    };
    const result = await publishHarvicsEvent(input, { required: true });
    if (!result.ok) {
      res.status(502).json(fail(result.error || 'Publish failed'));
      return;
    }
    res.json(ok({ event: result.event, skipped: result.skipped || false }));
  } catch (err) {
    hxLogger.error(MODULE, '/publish error', err);
    res.status(500).json(fail('Publish failed'));
  }
});

/**
 * POST /api/v1/events/llm
 * Body: { system, user, json? } — Groq → Gemini fallback smoke
 */
router.post('/llm', async (req: Request, res: Response): Promise<void> => {
  try {
    const system = String(req.body?.system || 'You are a concise Harvics OS assistant.');
    const user = String(req.body?.user || '').trim();
    if (!user) {
      res.status(400).json(fail('user required'));
      return;
    }
    const result = await completeWithFallback({
      system,
      user,
      json: Boolean(req.body?.json),
    });
    // Optionally emit llm.completed onto the bus (non-blocking)
    void publishHarvicsEvent({
      sourceModule: 'Harvics_API',
      eventType: 'llm.completed',
      payload: {
        engine: result.engine,
        model: result.model,
        chars: result.text.length,
      },
    });
    res.json(ok(result));
  } catch (err) {
    hxLogger.error(MODULE, '/llm error', err);
    res.status(502).json(fail(err instanceof Error ? err.message : 'LLM failed'));
  }
});

export const eventsRouter = router;
