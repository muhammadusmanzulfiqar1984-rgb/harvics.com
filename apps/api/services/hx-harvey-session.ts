/**
 * hx-harvey-session.ts — Redis-backed Harvey session state
 * Module 2 — short-lived turn context (Postgres is source of truth for messages)
 * Falls back to in-memory Map if Redis is OOM / unavailable.
 */

import Redis from 'ioredis';
import { randomUUID } from 'crypto';

import type { HxHarveyIntent, HxHarveyEntity } from '../../../packages/types/hx-harvey.types';
import { hxLogger } from '../../../packages/lib/hx-logger';

const REDIS_URL = process.env.HX_REDIS_URL ?? 'redis://localhost:6379';
const TTL_SEC   = 60 * 60 * 8; // 8 hours
const MODULE    = 'hx-harvey-session';

export interface HarveySessionState {
  session_id: string;
  operator_id: string | null;
  turn_count: number;
  last_intent: HxHarveyIntent | null;
  pending_confirmation: {
    token: string;
    intent: HxHarveyIntent;
    payload: Record<string, unknown>;
  } | null;
  last_entities: HxHarveyEntity[];
  updated_at: string;
}

const memory = new Map<string, HarveySessionState>();

const redis = new Redis(REDIS_URL, {
  maxRetriesPerRequest: null,
  lazyConnect: true,
  enableOfflineQueue: false,
});

let redisDisabled = false;

function key(sessionId: string): string {
  return `hx:harvey:session:${sessionId}`;
}

async function ensureConnected(): Promise<boolean> {
  if (redisDisabled) return false;
  if (redis.status === 'ready') return true;
  try {
    await redis.connect();
    return true;
  } catch (err) {
    hxLogger.warn(MODULE, 'redis unavailable — using memory sessions', {
      err: err instanceof Error ? err.message : String(err),
    });
    redisDisabled = true;
    return false;
  }
}

export async function loadSessionState(
  sessionId: string,
): Promise<HarveySessionState | null> {
  if (await ensureConnected()) {
    try {
      const raw = await redis.get(key(sessionId));
      if (raw) return JSON.parse(raw) as HarveySessionState;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (/OOM|maxmemory/i.test(msg)) redisDisabled = true;
      hxLogger.warn(MODULE, 'redis get failed — memory fallback', { err: msg });
    }
  }
  return memory.get(sessionId) ?? null;
}

export async function saveSessionState(
  state: HarveySessionState,
): Promise<void> {
  state.updated_at = new Date().toISOString();
  memory.set(state.session_id, structuredClone(state));

  if (!(await ensureConnected())) return;

  try {
    await redis.set(key(state.session_id), JSON.stringify(state), 'EX', TTL_SEC);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (/OOM|maxmemory/i.test(msg)) redisDisabled = true;
    hxLogger.warn(MODULE, 'redis set failed — memory session kept', { err: msg });
  }
}

export async function getOrCreateSessionState(params: {
  session_id: string;
  operator_id?: string | null;
}): Promise<HarveySessionState> {
  const existing = await loadSessionState(params.session_id);
  if (existing) return existing;

  const state: HarveySessionState = {
    session_id: params.session_id,
    operator_id: params.operator_id ?? null,
    turn_count: 0,
    last_intent: null,
    pending_confirmation: null,
    last_entities: [],
    updated_at: new Date().toISOString(),
  };
  await saveSessionState(state);
  return state;
}

export function mintConfirmationToken(): string {
  return randomUUID();
}

export async function clearPendingConfirmation(
  sessionId: string,
): Promise<void> {
  const state = await loadSessionState(sessionId);
  if (!state) return;
  state.pending_confirmation = null;
  await saveSessionState(state);
}
