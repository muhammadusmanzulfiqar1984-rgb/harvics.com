import { existsSync } from 'fs';
import { config } from 'dotenv';
import { resolve } from 'path';

const envCandidates = [
  resolve(__dirname, `../../.env.${process.env.NODE_ENV || 'development'}`),
  resolve(__dirname, '../../.env.local'),
  resolve(__dirname, '../../.env'),
];

for (const envPath of envCandidates) {
  if (existsSync(envPath)) {
    config({ path: envPath, override: false });
  }
}

// In offline/dev mode, also silence Tier-0 intelligence chatter
if (process.env.HARVICS_OFFLINE_DATA === '1' && !process.env.HARVICS_QUIET_LOGS) {
  process.env.HARVICS_QUIET_LOGS = '1';
}

import express from 'express';
import cors, { CorsOptions } from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import routes from './routes';
import { localeMiddleware } from './middleware/locale';
import { ProfitSentinel } from './services/profitSentinel';
import { HarvicsAlphaEngine } from './services/harvicsAlphaEngine';
import { setNotificationPushFn } from './modules/comms/notification.service';

// Prevent backend crash from unexpected async errors (e.g. stale Prisma client, network hiccups)
process.on('unhandledRejection', (reason: any) => {
  console.error('[unhandledRejection]', reason?.message || reason);
});
process.on('uncaughtException', (err: any) => {
  console.error('[uncaughtException]', err?.message || err);
});

const app = express();
const server = http.createServer(app);
const isProduction = process.env.NODE_ENV === 'production';

// TODO: Connect Postgres persistence layer once credentials are ready.
// TODO: Wire Redis/Vectordb caches for localisation lookups.
// TODO: Enforce auth middleware once identity module is hooked up.
const PORT = Number(process.env.PORT) || 4000;

const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000,http://localhost:3002,http://127.0.0.1:3000,http://127.0.0.1:3002')
  .split(',')
  .map((origin) => origin.trim())
  .filter((origin) => origin.length > 0);

const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    if (!isProduction || !origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error(`Origin not allowed by CORS: ${origin}`));
  },
  credentials: true,
};

// ─── In-process rate limiter ───────────────────────────────────────────────
// Keeps a hit-count per IP in a rolling 1-minute window.
// No external package required. Replace with express-rate-limit in production.
const RATE_WINDOW_MS = 60_000;
const RATE_MAX_REQUESTS = 200; // per IP per window
const rateLimitStore = new Map<string, { count: number; windowStart: number }>();

function rateLimit(req: express.Request, res: express.Response, next: express.NextFunction) {
  const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const entry = rateLimitStore.get(ip);

  if (!entry || now - entry.windowStart > RATE_WINDOW_MS) {
    rateLimitStore.set(ip, { count: 1, windowStart: now });
    return next();
  }

  entry.count++;
  if (entry.count > RATE_MAX_REQUESTS) {
    res.setHeader('Retry-After', String(Math.ceil((entry.windowStart + RATE_WINDOW_MS - now) / 1000)));
    return res.status(429).json({ error: 'Too many requests. Please slow down.' });
  }
  return next();
}

// Stricter limiter for auth endpoints (20 req/min per IP)
const AUTH_RATE_MAX = 20;
const authRateLimitStore = new Map<string, { count: number; windowStart: number }>();

function authRateLimit(req: express.Request, res: express.Response, next: express.NextFunction) {
  const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const entry = authRateLimitStore.get(ip);

  if (!entry || now - entry.windowStart > RATE_WINDOW_MS) {
    authRateLimitStore.set(ip, { count: 1, windowStart: now });
    return next();
  }

  entry.count++;
  if (entry.count > AUTH_RATE_MAX) {
    res.setHeader('Retry-After', String(Math.ceil((entry.windowStart + RATE_WINDOW_MS - now) / 1000)));
    return res.status(429).json({ error: 'Too many login attempts. Please wait before retrying.' });
  }
  return next();
}
// ───────────────────────────────────────────────────────────────────────────

app.use(cors(corsOptions));
app.use(express.json());

// Apply global rate limit to all /api routes
app.use('/api', rateLimit);
// Apply strict rate limit to auth endpoints
app.use('/api/auth', authRateLimit);

// Initialize Socket.io (Harvics Orchestrator Real-Time Layer)
const io = new Server(server, {
  cors: {
    origin: isProduction ? allowedOrigins : true,
    methods: ["GET", "POST"]
  }
});

// Pass socket instance to Alpha Engine for broadcasting proposals
HarvicsAlphaEngine.setSocketServer(io);

// Wire notification push to Socket.IO
// Each user joins their own room (userId) and their role room (role:<role>)
setNotificationPushFn((recipientId, notification) => {
  io.to(recipientId).emit('notification', notification);
});

io.on('connection', (socket) => {
  console.log('Harvics Orchestrator: CEO Dashboard Connected (Socket ID:', socket.id, ')');

  // Client must send { userId, role } on connect to join their rooms
  socket.on('identify', (data: { userId: string; role: string }) => {
    if (data?.userId) socket.join(data.userId);
    if (data?.role)   socket.join(`role:${data.role}`);
    console.log(`Socket identified: userId=${data?.userId} role=${data?.role}`);
  });

  socket.on('disconnect', () => {
    console.log('Harvics Orchestrator: CEO Dashboard Disconnected');
  });
});

// UNIFIED SYSTEM: Add locale middleware BEFORE routes
// This extracts locale from headers (X-Locale or Accept-Language) and makes it available to all controllers
// When frontend selects country/language, backend will automatically return localized responses
app.use(localeMiddleware);

app.use('/api', routes);

app.get('/', (_req, res) => {
  res.send(`
    <h1>Harvics Sovereign Brain Active</h1>
    <p>Status: <strong>OPERATIONAL</strong></p>
    <p>Endpoints:</p>
    <ul>
      <li><a href="/health">/health</a> - System Status</li>
      <li><a href="/api/intelligence/attack-plan">/api/intelligence/attack-plan</a> - Daily Market Attack Plan</li>
    </ul>
  `);
});

app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'harvics-backend',
    timestamp: new Date().toISOString()
  });
});

if (process.env.NODE_ENV !== 'test') {
  server.listen(PORT, () => {
    console.log(`Harvics backend running on port ${PORT}`);

    // Profit Sentinel only runs against live data feeds. In offline/dev mode
    // there is nothing to monitor and the cycle would just spam fallback logs.
    if (process.env.HARVICS_OFFLINE_DATA === '1' || process.env.NODE_ENV !== 'production') {
      console.log('[ProfitSentinel] skipped (offline/dev mode — unset HARVICS_OFFLINE_DATA to enable)');
    } else {
      ProfitSentinel.start();
    }
  });
}

export default app;

