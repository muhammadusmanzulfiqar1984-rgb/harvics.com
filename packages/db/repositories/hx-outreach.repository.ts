/**
 * hx-outreach.repository.ts — Outreach Engine persistence
 * Module 3 Session 1 — data access only (no business logic)
 */

import { pool } from '../index';
import type {
  HxEnrollmentStatus,
  HxOutreachChannel,
  HxOutreachLog,
  HxOutreachLogStatus,
  HxSequence,
  HxSequenceEnrollment,
  HxSequenceStatus,
  HxSequenceStep,
  HxStepType,
} from '../../types/hx-outreach.types';

// ── Sequences ─────────────────────────────────────────────────────────────────

export async function createSequence(data: {
  name: string;
  vertical?: string | null;
  description?: string | null;
  status?: HxSequenceStatus;
  created_by?: string;
}): Promise<HxSequence> {
  const { rows } = await pool.query(
    `INSERT INTO hx_sequences
       (name, vertical, description, status, created_by)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [
      data.name,
      data.vertical ?? null,
      data.description ?? null,
      data.status ?? 'draft',
      data.created_by ?? 'mian',
    ],
  );
  return rows[0] as HxSequence;
}

export async function getSequence(id: string): Promise<HxSequence | null> {
  const { rows } = await pool.query(
    `SELECT * FROM hx_sequences WHERE id = $1`,
    [id],
  );
  return (rows[0] as HxSequence) ?? null;
}

// ── Steps ─────────────────────────────────────────────────────────────────────

export async function createStep(data: {
  sequence_id: string;
  step_number: number;
  channel: HxOutreachChannel;
  step_type?: HxStepType;
  delay_days?: number;
  subject?: string | null;
  body_template: string;
}): Promise<HxSequenceStep> {
  const stepType = data.step_type ?? (data.channel as HxStepType);
  const { rows } = await pool.query(
    `INSERT INTO hx_sequence_steps
       (sequence_id, step_number, channel, step_type, delay_days, subject, body_template)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [
      data.sequence_id,
      data.step_number,
      data.channel,
      stepType,
      data.delay_days ?? 0,
      data.subject ?? null,
      data.body_template,
    ],
  );
  return rows[0] as HxSequenceStep;
}

export async function getSteps(sequence_id: string): Promise<HxSequenceStep[]> {
  const { rows } = await pool.query(
    `SELECT * FROM hx_sequence_steps
     WHERE sequence_id = $1
     ORDER BY step_number ASC`,
    [sequence_id],
  );
  return rows as HxSequenceStep[];
}

// ── Enrollments ───────────────────────────────────────────────────────────────

export async function enrollContact(data: {
  contact_id: string;
  sequence_id: string;
  current_step?: number;
  status?: HxEnrollmentStatus;
  next_step_at?: string | null;
}): Promise<HxSequenceEnrollment> {
  const { rows } = await pool.query(
    `INSERT INTO hx_sequence_enrollments
       (contact_id, sequence_id, current_step, status, next_step_at)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [
      data.contact_id,
      data.sequence_id,
      data.current_step ?? 1,
      data.status ?? 'active',
      data.next_step_at ?? null,
    ],
  );
  return rows[0] as HxSequenceEnrollment;
}

export async function getEnrollment(
  id: string,
): Promise<HxSequenceEnrollment | null> {
  const { rows } = await pool.query(
    `SELECT * FROM hx_sequence_enrollments WHERE id = $1`,
    [id],
  );
  return (rows[0] as HxSequenceEnrollment) ?? null;
}

export async function updateEnrollment(
  id: string,
  data: {
    current_step?: number;
    status?: HxEnrollmentStatus;
    next_step_at?: string | null;
    completed_at?: string | null;
  },
): Promise<HxSequenceEnrollment | null> {
  const { rows } = await pool.query(
    `UPDATE hx_sequence_enrollments SET
       current_step = COALESCE($2, current_step),
       status       = COALESCE($3, status),
       next_step_at = CASE
         WHEN $4::boolean THEN $5::timestamptz
         ELSE next_step_at
       END,
       completed_at = CASE
         WHEN $6::boolean THEN $7::timestamptz
         ELSE completed_at
       END,
       updated_at   = NOW()
     WHERE id = $1
     RETURNING *`,
    [
      id,
      data.current_step ?? null,
      data.status ?? null,
      data.next_step_at !== undefined,
      data.next_step_at ?? null,
      data.completed_at !== undefined,
      data.completed_at ?? null,
    ],
  );
  return (rows[0] as HxSequenceEnrollment) ?? null;
}

// ── Outreach log ──────────────────────────────────────────────────────────────

export async function logOutreach(data: {
  contact_id?: string | null;
  sequence_id?: string | null;
  step_id?: string | null;
  enrollment_id?: string | null;
  channel: HxOutreachChannel;
  status?: HxOutreachLogStatus;
  subject?: string | null;
  body_preview?: string | null;
  external_id?: string | null;
  raw_json?: Record<string, unknown> | null;
}): Promise<HxOutreachLog> {
  const { rows } = await pool.query(
    `INSERT INTO hx_outreach_log
       (contact_id, sequence_id, step_id, enrollment_id, channel, status,
        subject, body_preview, external_id, raw_json)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     RETURNING *`,
    [
      data.contact_id ?? null,
      data.sequence_id ?? null,
      data.step_id ?? null,
      data.enrollment_id ?? null,
      data.channel,
      data.status ?? 'sent',
      data.subject ?? null,
      data.body_preview ?? null,
      data.external_id ?? null,
      data.raw_json ? JSON.stringify(data.raw_json) : null,
    ],
  );
  return rows[0] as HxOutreachLog;
}

export async function getOutreachLog(
  contact_id: string,
): Promise<HxOutreachLog[]> {
  const { rows } = await pool.query(
    `SELECT * FROM hx_outreach_log
     WHERE contact_id = $1
     ORDER BY sent_at DESC`,
    [contact_id],
  );
  return rows as HxOutreachLog[];
}
