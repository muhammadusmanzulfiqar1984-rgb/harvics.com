/**
 * HarvyX Harvey AI types — Module 2 Session 1
 * Database and types only. No API / workers / logic.
 */

export type HxHarveyIntent =
  | 'prospect_search'
  | 'person_lookup'
  | 'pipeline_query'
  | 'outreach_action'
  | 'report_query'
  | 'data_export'
  | 'sequence_enroll'
  | 'unknown';

export interface HxHarveyEntity {
  type: string;
  value: string;
  confidence: number;
}

export interface HxHarveySession {
  id: string;
  session_id: string;
  operator_id: string | null;
  created_at: string;
  updated_at: string;
  expires_at: string | null;
  last_intent: string | null;
  turn_count: number;
}

export interface HxHarveyMessage {
  id: string;
  session_id: string;
  role: 'user' | 'assistant';
  content: string;
  intent: string | null;
  confidence: number | null;
  entities: HxHarveyEntity[] | null;
  actions_taken: unknown[];
  requires_confirmation: boolean;
  confirmed: boolean | null;
  model_used: string | null;
  latency_ms: number | null;
  created_at: string;
}

export interface HxHarveyAction {
  id: string;
  message_id: string | null;
  session_id: string | null;
  action_type: string;
  payload: Record<string, unknown> | null;
  result: Record<string, unknown> | null;
  status: string;
  created_at: string;
  completed_at: string | null;
}

export interface HxHarveyRequest {
  message: string;
  session_id: string;
}

export interface HxHarveyResponse {
  reply: string;
  intent: HxHarveyIntent;
  confidence: number;
  entities: HxHarveyEntity[];
  actions_taken: unknown[];
  requires_confirmation: boolean;
  confirmation_token: string | null;
  model_used: string;
  latency_ms: number;
}
