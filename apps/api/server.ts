/**
 * apps/api/server.ts — HarvyX Data Bank API server
 *
 * Mounts:
 *   GET  /health               — liveness probe
 *   ALL  /api/v1/databank/*    — reporting endpoints (JWT required)
 *   GET  /api/v1/feed          — SSE live feed     (JWT required)
 *
 * On start: connects the Postgres LISTEN/NOTIFY realtime service.
 * On shutdown: drains connections cleanly.
 */

import express, {
  type Request,
  type Response,
  type NextFunction,
} from 'express';
import cors from 'cors';

import { dataBankRouter }       from './routes/hx-databank.routes';
import { tradeShowsRouter }     from './routes/hx-tradeshows.routes';
import { feedRouter }           from './routes/hx-feed.routes';
import { harveyRouter }         from './routes/hx-harvey.routes';
import { outreachRouter }       from './routes/hx-outreach.routes';
import { outreachWebhookRouter } from './routes/hx-outreach-webhook.routes';
import { repliesRouter }         from './routes/hx-replies.routes';
import { startRealtimeService, stopRealtimeService } from './hx-realtime.service';
import { closePool }            from '../../packages/db/index';
import { hxLogger }             from '../../packages/lib/hx-logger';

// ── Config ────────────────────────────────────────────────────────────────────

const PORT    = parseInt(process.env.HX_API_PORT ?? '3001', 10);
const MODULE  = 'hx-api.server';

// ── App ───────────────────────────────────────────────────────────────────────

const app = express();

// ── Middleware ────────────────────────────────────────────────────────────────

app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:8080', 'http://localhost:9000'],
  credentials: true,
}));

// Parse JSON bodies up to 1 MB
app.use(express.json({
  limit: '1mb',
  verify: (req, _res, buf) => {
    const url = (req as express.Request).originalUrl ?? req.url ?? '';
    if (url.includes('/outreach/webhook')) {
      (req as express.Request & { rawBody?: Buffer }).rawBody = buf;
    }
  },
}));

// Parse URL-encoded bodies (for any form submissions)
app.use(express.urlencoded({ extended: false }));

// Structured request log (stdout only — consumed by CF Logpush / Datadog)
app.use((req: Request, _res: Response, next: NextFunction) => {
  hxLogger.info(MODULE, `${req.method} ${req.path}`, {
    ip:        req.ip,
    ua:        req.headers['user-agent']?.slice(0, 80),
    query:     Object.keys(req.query).length ? req.query : undefined,
  });
  next();
});

// Disable X-Powered-By
app.disable('x-powered-by');

// ── Routes ────────────────────────────────────────────────────────────────────

// Liveness probe — no auth, no DB
app.get('/health', (_req: Request, res: Response) => {
  res.json({ ok: true, ts: new Date().toISOString(), service: 'hx-api' });
});

// Reporting API (JWT-protected)
// Trade-show/scraper routes first so /scrape/tradeshows|handelsregister
// are not swallowed by databank's /scrape/:source
app.use('/api/v1/databank', tradeShowsRouter);
app.use('/api/v1/databank', dataBankRouter);

// SSE live feed (JWT via header or ?token= query param)
app.use('/api/v1/feed', feedRouter);

// Harvey AI command layer (JWT required)
app.use('/api/v1/harvey', harveyRouter);

// Outreach Engine — webhook first (signature auth), then JWT routes
app.use('/api/v1/outreach/webhook', outreachWebhookRouter);
app.use('/api/v1/outreach', outreachRouter);

// Reply Detection AI (JWT required)
app.use('/api/v1/replies', repliesRouter);

// ── 404 handler ───────────────────────────────────────────────────────────────

app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    data:    null,
    error:   'Not found',
    ts:      new Date().toISOString(),
  });
});

// ── Global error handler ──────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  hxLogger.error(MODULE, 'unhandled error', { err: err.message, stack: err.stack });
  res.status(500).json({
    success: false,
    data:    null,
    error:   'Internal server error',
    ts:      new Date().toISOString(),
  });
});

// ── Start ─────────────────────────────────────────────────────────────────────

async function start(): Promise<void> {
  // Connect the persistent Postgres LISTEN/NOTIFY client
  await startRealtimeService();

  const server = app.listen(PORT, () => {
    hxLogger.info(MODULE, `API server listening on :${PORT}`, {
      env:    process.env.NODE_ENV ?? 'development',
      routes: ['/health', '/api/v1/databank/*', '/api/v1/feed', '/api/v1/harvey/*', '/api/v1/outreach/*', '/api/v1/replies/*'],
    });
  });

  // ── Graceful shutdown ────────────────────────────────────────────────────

  async function shutdown(signal: string): Promise<void> {
    hxLogger.info(MODULE, `${signal} received — shutting down`);

    // 1. Stop accepting new HTTP connections
    server.close(async () => {
      hxLogger.info(MODULE, 'HTTP server closed');

      // 2. Stop the realtime PG client
      await stopRealtimeService();

      // 3. Drain the shared pool
      await closePool();

      hxLogger.info(MODULE, 'shutdown complete');
      process.exit(0);
    });

    // Force-exit if graceful shutdown takes > 15 s
    setTimeout(() => {
      hxLogger.error(MODULE, 'forced exit after 15 s timeout');
      process.exit(1);
    }, 15_000).unref();
  }

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT',  () => shutdown('SIGINT'));
}

start().catch((err) => {
  hxLogger.error(MODULE, 'fatal startup error', { err: err instanceof Error ? err.message : String(err) });
  process.exit(1);
});
