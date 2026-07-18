/**
 * hx-realtime.service.ts — Postgres LISTEN/NOTIFY → SSE broadcast
 * Source: HARVYX_REPORTING_WIRE.md § 2
 *
 * Architecture:
 *  - One persistent pg.Client (not pooled) holds the LISTEN connection.
 *  - All Postgres notifications on channel 'hx_feed' are emitted via
 *    a module-level EventEmitter so any number of SSE connections can
 *    subscribe without touching the DB client directly.
 *  - On disconnect: exponential backoff (1 s → 2 s → 4 s … capped at 60 s)
 *    + jitter, then reconnect. Attempt counter resets on successful listen.
 */

import { Client }        from 'pg';
import { EventEmitter }  from 'events';
import { hxLogger }      from '../../packages/lib/hx-logger';

// ── Feed event type ───────────────────────────────────────────────────────────

export interface HxFeedEvent {
  event_id:     string;
  event_type:   string;
  source_module: string;
  entity_id:    string | null;
  entity_type:  string | null;
  payload:      Record<string, unknown>;
  created_at:   string;
}

// ── Module-level emitter — SSE handlers subscribe here ───────────────────────
// Event name: 'feed'
// Payload:     HxFeedEvent

export const feedEmitter = new EventEmitter();
feedEmitter.setMaxListeners(500);  // allow many concurrent SSE connections

// ── State ─────────────────────────────────────────────────────────────────────

let pgClient:       Client | null           = null;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
let attempt         = 0;
let stopping        = false;

const MODULE = 'hx-realtime.service';
const CHANNEL = 'hx_feed';
const BACKOFF_BASE_MS  = 1_000;
const BACKOFF_MAX_MS   = 60_000;
const HEARTBEAT_MS     = 25_000;   // keep alive within Cloudflare's 30 s idle limit

// ── Backoff ───────────────────────────────────────────────────────────────────

function nextDelay(): number {
  const base  = Math.min(BACKOFF_BASE_MS * Math.pow(2, attempt), BACKOFF_MAX_MS);
  const jitter = Math.random() * 1_000;
  attempt++;
  return base + jitter;
}

// ── Connect + LISTEN ──────────────────────────────────────────────────────────

async function connect(): Promise<void> {
  if (stopping) return;

  const client = new Client({
    connectionString: process.env.HX_DATABASE_URL,
    // Dedicated connection — never returned to a pool
    keepAlive: true,
    keepAliveInitialDelayMillis: 10_000,
  });

  client.on('error', (err: Error) => {
    hxLogger.error(MODULE, 'pg client error', { err: err.message });
    // scheduleReconnect will be called by 'end' event
  });

  client.on('end', () => {
    if (!stopping) {
      hxLogger.warn(MODULE, 'pg connection closed, scheduling reconnect', { attempt });
      scheduleReconnect();
    }
  });

  try {
    await client.connect();
    pgClient = client;
    attempt  = 0;   // reset on success

    await client.query(`LISTEN ${CHANNEL}`);

    hxLogger.info(MODULE, `LISTEN ${CHANNEL} active`);

    client.on('notification', (msg) => {
      if (msg.channel !== CHANNEL || !msg.payload) return;

      try {
        const event = JSON.parse(msg.payload) as HxFeedEvent;
        feedEmitter.emit('feed', event);
        hxLogger.debug(MODULE, 'feed event emitted', {
          event_type: event.event_type,
          entity_id:  event.entity_id,
        });
      } catch (parseErr) {
        hxLogger.warn(MODULE, 'failed to parse notification payload', {
          payload: msg.payload,
          err:     parseErr instanceof Error ? parseErr.message : String(parseErr),
        });
      }
    });
  } catch (connectErr) {
    hxLogger.error(MODULE, 'pg connect failed', {
      err:     connectErr instanceof Error ? connectErr.message : String(connectErr),
      attempt,
    });
    await client.end().catch(() => {/* ignore */});
    scheduleReconnect();
  }
}

function scheduleReconnect(): void {
  if (stopping || reconnectTimer) return;

  const delay = nextDelay();
  hxLogger.info(MODULE, `reconnect in ${Math.round(delay)}ms`, { attempt });

  reconnectTimer = setTimeout(async () => {
    reconnectTimer = null;
    await connect();
  }, delay);
}

// ── Heartbeat — keeps the SSE connection warm and the pg idle timeout reset ──

let heartbeatTimer: ReturnType<typeof setInterval> | null = null;

function startHeartbeat(): void {
  if (heartbeatTimer) return;
  heartbeatTimer = setInterval(() => {
    feedEmitter.emit('heartbeat', { ts: new Date().toISOString() });
  }, HEARTBEAT_MS);
}

function stopHeartbeat(): void {
  if (heartbeatTimer) {
    clearInterval(heartbeatTimer);
    heartbeatTimer = null;
  }
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function startRealtimeService(): Promise<void> {
  if (pgClient) {
    hxLogger.warn(MODULE, 'startRealtimeService called but already running');
    return;
  }

  stopping = false;
  attempt  = 0;

  hxLogger.info(MODULE, 'starting realtime service');
  await connect();
  startHeartbeat();
}

export async function stopRealtimeService(): Promise<void> {
  stopping = true;

  stopHeartbeat();

  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }

  if (pgClient) {
    try {
      await pgClient.query(`UNLISTEN ${CHANNEL}`);
      await pgClient.end();
    } catch {
      // ignore — process may be shutting down
    }
    pgClient = null;
  }

  hxLogger.info(MODULE, 'realtime service stopped');
}

/** Returns true if the LISTEN connection is currently active. */
export function isConnected(): boolean {
  return pgClient !== null;
}

// ── Graceful shutdown ─────────────────────────────────────────────────────────

process.on('SIGTERM', () => { stopRealtimeService().catch(() => {/* ignore */}); });
process.on('SIGINT',  () => { stopRealtimeService().catch(() => {/* ignore */}); });
