/**
 * hx-harvey.repository.ts — Harvey AI persistence
 * Module 2 Session 1 — data access only
 */

import { pool } from '../index';
import type {
  HxHarveyAction,
  HxHarveyMessage,
  HxHarveySession,
} from '../../types/hx-harvey.types';

export async function createSession(data: {
  session_id: string;
  operator_id?: string | null;
  expires_at?: string | null;
  last_intent?: string | null;
  turn_count?: number;
}): Promise<HxHarveySession> {
  const { rows } = await pool.query(
    `INSERT INTO hx_harvey_sessions
       (session_id, operator_id, expires_at, last_intent, turn_count)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [
      data.session_id,
      data.operator_id ?? null,
      data.expires_at ?? null,
      data.last_intent ?? null,
      data.turn_count ?? 0,
    ],
  );
  return rows[0] as HxHarveySession;
}

export async function getSession(
  session_id: string,
): Promise<HxHarveySession | null> {
  const { rows } = await pool.query(
    `SELECT * FROM hx_harvey_sessions WHERE session_id = $1`,
    [session_id],
  );
  return (rows[0] as HxHarveySession) ?? null;
}

export async function updateSession(
  session_id: string,
  data: {
    operator_id?: string | null;
    expires_at?: string | null;
    last_intent?: string | null;
    turn_count?: number;
  },
): Promise<HxHarveySession | null> {
  const { rows } = await pool.query(
    `UPDATE hx_harvey_sessions SET
       operator_id = COALESCE($2, operator_id),
       expires_at  = COALESCE($3, expires_at),
       last_intent = COALESCE($4, last_intent),
       turn_count  = COALESCE($5, turn_count),
       updated_at  = NOW()
     WHERE session_id = $1
     RETURNING *`,
    [
      session_id,
      data.operator_id ?? null,
      data.expires_at ?? null,
      data.last_intent ?? null,
      data.turn_count ?? null,
    ],
  );
  return (rows[0] as HxHarveySession) ?? null;
}

export async function addMessage(message: {
  session_id: string;
  role: 'user' | 'assistant';
  content: string;
  intent?: string | null;
  confidence?: number | null;
  entities?: unknown;
  actions_taken?: unknown[];
  requires_confirmation?: boolean;
  confirmed?: boolean | null;
  model_used?: string | null;
  latency_ms?: number | null;
}): Promise<HxHarveyMessage> {
  const { rows } = await pool.query(
    `INSERT INTO hx_harvey_messages
       (session_id, role, content, intent, confidence, entities,
        actions_taken, requires_confirmation, confirmed, model_used, latency_ms)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
     RETURNING *`,
    [
      message.session_id,
      message.role,
      message.content,
      message.intent ?? null,
      message.confidence ?? null,
      message.entities ? JSON.stringify(message.entities) : null,
      JSON.stringify(message.actions_taken ?? []),
      message.requires_confirmation ?? false,
      message.confirmed ?? null,
      message.model_used ?? null,
      message.latency_ms ?? null,
    ],
  );
  return rows[0] as HxHarveyMessage;
}

export async function getSessionMessages(
  session_id: string,
  limit = 10,
): Promise<HxHarveyMessage[]> {
  const { rows } = await pool.query(
    `SELECT * FROM hx_harvey_messages
     WHERE session_id = $1
     ORDER BY created_at DESC
     LIMIT $2`,
    [session_id, limit],
  );
  return (rows as HxHarveyMessage[]).reverse();
}

export async function addAction(action: {
  message_id?: string | null;
  session_id?: string | null;
  action_type: string;
  payload?: Record<string, unknown> | null;
  result?: Record<string, unknown> | null;
  status?: string;
}): Promise<HxHarveyAction> {
  const { rows } = await pool.query(
    `INSERT INTO hx_harvey_actions
       (message_id, session_id, action_type, payload, result, status)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [
      action.message_id ?? null,
      action.session_id ?? null,
      action.action_type,
      action.payload ? JSON.stringify(action.payload) : null,
      action.result ? JSON.stringify(action.result) : null,
      action.status ?? 'pending',
    ],
  );
  return rows[0] as HxHarveyAction;
}

export async function updateAction(
  id: string,
  result: Record<string, unknown> | null,
  status: string,
): Promise<HxHarveyAction | null> {
  const { rows } = await pool.query(
    `UPDATE hx_harvey_actions SET
       result       = $2,
       status       = $3,
       completed_at = CASE
         WHEN $3 IN ('completed', 'failed', 'cancelled') THEN NOW()
         ELSE completed_at
       END
     WHERE id = $1
     RETURNING *`,
    [id, result ? JSON.stringify(result) : null, status],
  );
  return (rows[0] as HxHarveyAction) ?? null;
}
