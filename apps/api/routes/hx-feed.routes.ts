/**
 * hx-feed.routes.ts — SSE live feed endpoint
 * Source: HARVYX_REPORTING_WIRE.md § 3
 *
 * GET /api/v1/feed
 *
 * Protocol:
 *   - Response: text/event-stream (SSE)
 *   - Auth: JWT Bearer in Authorization header OR ?token= query param
 *     (EventSource browser API cannot set custom headers, so token in
 *      query string is the standard SSE workaround)
 *   - Client receives named events: 'feed', 'heartbeat', 'connected'
 *   - Server sends :comment heartbeats every 25 s to prevent proxy timeouts
 */

import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import {
  feedEmitter,
  isConnected,
  type HxFeedEvent,
} from '../hx-realtime.service';
import { hxLogger } from '../../../packages/lib/hx-logger';

// ── Config ────────────────────────────────────────────────────────────────────

const JWT_SECRET = process.env.HX_JWT_SECRET ?? '';
const MODULE     = 'hx-feed.routes';

// ── Feed event template map ───────────────────────────────────────────────────
// Source: HARVYX_REPORTING_WIRE.md § 3
//
// dot_color  → CSS token used in the Data Bank UI
// text       → Human-readable activity line (supports {entity_id} interpolation)
// priority   → 'high' events trigger a flash animation in the UI

interface FeedTemplate {
  dot_color: 'green' | 'blue' | 'purple' | 'gold' | 'orange' | 'red' | 'teal' | 'yellow' | 'grey';
  icon:      string;    // emoji used in feed row
  text:      string;    // may contain {entity_id}, {source_module}
  priority:  'high' | 'normal' | 'low';
}

const FEED_TEMPLATE_MAP: Record<string, FeedTemplate> = {
  // ── Contact pipeline ──────────────────────────────────────────────────────
  'contact.ingested': {
    dot_color: 'green',
    icon:      '👤',
    text:      'New contact ingested from {source_module}',
    priority:  'normal',
  },
  'contact.email_verified': {
    dot_color: 'blue',
    icon:      '✉️',
    text:      'Email address verified',
    priority:  'normal',
  },
  'contact.icp_scored': {
    dot_color: 'orange',
    icon:      '📊',
    text:      'ICP scored — action: {action}',
    priority:  'normal',
  },
  'contact.apollo_enriched': {
    dot_color: 'purple',
    icon:      '🔍',
    text:      'Apollo enrichment complete',
    priority:  'normal',
  },
  'contact.lusha_revealed': {
    dot_color: 'gold',
    icon:      '⚡',
    text:      'Lusha reveal — prime lead ready',
    priority:  'high',
  },

  // ── Outreach ──────────────────────────────────────────────────────────────
  'outreach.sent': {
    dot_color: 'blue',
    icon:      '📤',
    text:      'Outreach message sent',
    priority:  'normal',
  },
  'outreach.bounced': {
    dot_color: 'orange',
    icon:      '↩️',
    text:      'Outreach bounced',
    priority:  'normal',
  },

  // ── Replies ───────────────────────────────────────────────────────────────
  'reply.received': {
    dot_color: 'green',
    icon:      '💬',
    text:      'Reply received',
    priority:  'high',
  },
  'reply.classified': {
    dot_color: 'teal',
    icon:      '🏷️',
    text:      'Reply classified as {intent}',
    priority:  'normal',
  },

  // ── Pipeline / Deals ──────────────────────────────────────────────────────
  'deal.stage_changed': {
    dot_color: 'orange',
    icon:      '🔄',
    text:      'Deal moved to {stage}',
    priority:  'normal',
  },
  'deal.closed': {
    dot_color: 'green',
    icon:      '🏆',
    text:      'Deal closed',
    priority:  'high',
  },

  // ── Payments ──────────────────────────────────────────────────────────────
  'payment.initiated': {
    dot_color: 'blue',
    icon:      '💳',
    text:      'Payment initiated',
    priority:  'normal',
  },
  'payment.received': {
    dot_color: 'green',
    icon:      '💰',
    text:      'Payment received',
    priority:  'high',
  },

  // ── Compliance ────────────────────────────────────────────────────────────
  'sanctions.checked': {
    dot_color: 'yellow',
    icon:      '🛡️',
    text:      'Sanctions check complete',
    priority:  'low',
  },
  'aml.checked': {
    dot_color: 'yellow',
    icon:      '🔐',
    text:      'AML check complete',
    priority:  'low',
  },

  // ── System ────────────────────────────────────────────────────────────────
  'scrape.run.completed': {
    dot_color: 'grey',
    icon:      '🔄',
    text:      'Scrape run completed — {source}',
    priority:  'low',
  },
  'notification.sent': {
    dot_color: 'grey',
    icon:      '🔔',
    text:      'Notification sent via {channel}',
    priority:  'low',
  },
  'job.failed.terminal': {
    dot_color: 'red',
    icon:      '🚨',
    text:      'Job failed after all retries — {source_module}',
    priority:  'high',
  },
  'credits.checked': {
    dot_color: 'yellow',
    icon:      '🪙',
    text:      'Credit check — {provider}',
    priority:  'low',
  },
};

const FALLBACK_TEMPLATE: FeedTemplate = {
  dot_color: 'grey',
  icon:      '📋',
  text:      '{event_type}',
  priority:  'low',
};

// ── Template renderer ─────────────────────────────────────────────────────────

function renderText(template: string, event: HxFeedEvent): string {
  return template
    .replace('{event_type}',   event.event_type)
    .replace('{source_module}', event.source_module)
    .replace('{entity_id}',    event.entity_id ?? '')
    .replace('{action}',       String(event.payload?.['action']  ?? ''))
    .replace('{intent}',       String(event.payload?.['intent']  ?? ''))
    .replace('{stage}',        String(event.payload?.['stage']   ?? ''))
    .replace('{source}',       String(event.payload?.['source']  ?? ''))
    .replace('{channel}',      String(event.payload?.['channel'] ?? ''))
    .replace('{provider}',     String(event.payload?.['provider'] ?? ''));
}

export interface FeedMessage {
  id:        string;
  event_type: string;
  dot_color: FeedTemplate['dot_color'];
  icon:      string;
  text:      string;
  priority:  FeedTemplate['priority'];
  entity_id: string | null;
  payload:   Record<string, unknown>;
  ts:        string;
}

function buildFeedMessage(event: HxFeedEvent): FeedMessage {
  const template = FEED_TEMPLATE_MAP[event.event_type] ?? FALLBACK_TEMPLATE;
  return {
    id:         event.event_id,
    event_type: event.event_type,
    dot_color:  template.dot_color,
    icon:       template.icon,
    text:       renderText(template.text, event),
    priority:   template.priority,
    entity_id:  event.entity_id,
    payload:    event.payload,
    ts:         event.created_at,
  };
}

// ── SSE helpers ───────────────────────────────────────────────────────────────

function sseEvent(eventName: string, data: unknown): string {
  return `event: ${eventName}\ndata: ${JSON.stringify(data)}\n\n`;
}

function sseComment(text: string): string {
  return `: ${text}\n\n`;
}

// ── JWT — accepts header OR query string (EventSource workaround) ─────────────

interface JwtPayload {
  sub:   string;
  role?: string;
  iat:   number;
  exp:   number;
}

function extractOperator(req: Request): JwtPayload | null {
  const headerToken = req.headers['authorization']?.replace('Bearer ', '') ?? null;
  const queryToken  = req.query['token'] as string | undefined ?? null;
  const token       = headerToken ?? queryToken;

  if (!token || !JWT_SECRET) return null;

  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch {
    return null;
  }
}

// ── Router ────────────────────────────────────────────────────────────────────

const router = Router();

/**
 * GET /api/v1/feed
 *
 * Upgrade to SSE stream. Sends:
 *   event: connected   — on open, includes backend status
 *   event: feed        — on every bronze event from Postgres NOTIFY
 *   event: heartbeat   — every 25 s (keeps connection alive)
 *   : comment          — every 25 s (also a keep-alive ping)
 */
router.get('/', (req: Request, res: Response): void => {
  // ── Auth ──────────────────────────────────────────────────────────────────
  const operator = extractOperator(req);
  if (!operator) {
    res.status(401).json({ success: false, error: 'Unauthorized', data: null, ts: new Date().toISOString() });
    return;
  }

  // ── SSE headers ───────────────────────────────────────────────────────────
  res.setHeader('Content-Type',  'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection',    'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');    // disable nginx/CF buffering
  res.flushHeaders();

  const clientId = `${operator.sub}_${Date.now()}`;

  hxLogger.info(MODULE, 'SSE client connected', {
    clientId,
    sub:      operator.sub,
    backendConnected: isConnected(),
  });

  // ── Send initial connected event ──────────────────────────────────────────
  res.write(sseEvent('connected', {
    client_id:        clientId,
    backend_connected: isConnected(),
    ts:               new Date().toISOString(),
  }));

  // ── Heartbeat (SSE comment ping every 25 s) ───────────────────────────────
  const heartbeatInterval = setInterval(() => {
    res.write(sseComment(`heartbeat ${new Date().toISOString()}`));
  }, 25_000);

  // ── Subscribe to feed events ──────────────────────────────────────────────
  const onFeed = (event: HxFeedEvent): void => {
    const message = buildFeedMessage(event);
    res.write(sseEvent('feed', message));
  };

  const onHeartbeat = (data: { ts: string }): void => {
    res.write(sseEvent('heartbeat', data));
  };

  feedEmitter.on('feed',      onFeed);
  feedEmitter.on('heartbeat', onHeartbeat);

  // ── Cleanup on client disconnect ──────────────────────────────────────────
  req.on('close', () => {
    clearInterval(heartbeatInterval);
    feedEmitter.off('feed',      onFeed);
    feedEmitter.off('heartbeat', onHeartbeat);

    hxLogger.info(MODULE, 'SSE client disconnected', { clientId });
  });
});

export { router as feedRouter };
