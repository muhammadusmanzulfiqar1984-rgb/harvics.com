/**
 * HarvyX Outreach Engine types — Module 3 Session 1
 * Database and types only. No API / workers / logic.
 */

/** Outbound channel used for a sequence step or outreach log row. */
export type HxOutreachChannel =
  | 'email'
  | 'linkedin'
  | 'whatsapp'
  | 'sms'
  | 'call';

/** Lifecycle status for a sequence definition (hx_sequences.status). */
export type HxSequenceStatus =
  | 'draft'
  | 'active'
  | 'paused'
  | 'archived';

/**
 * Step behaviour type (hx_sequence_steps.step_type).
 * Usually mirrors channel; `wait` is delay-only with no send.
 */
export type HxStepType =
  | 'email'
  | 'linkedin'
  | 'whatsapp'
  | 'sms'
  | 'call'
  | 'wait';

/** Enrollment lifecycle (hx_sequence_enrollments.status). */
export type HxEnrollmentStatus =
  | 'active'
  | 'paused'
  | 'completed'
  | 'unsubscribed';

/** Delivery status for an outreach log row. */
export type HxOutreachLogStatus =
  | 'sent'
  | 'delivered'
  | 'opened'
  | 'clicked'
  | 'bounced'
  | 'failed';

export interface HxSequence {
  id: string;
  name: string;
  vertical: string | null;
  description: string | null;
  status: HxSequenceStatus;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface HxSequenceStep {
  id: string;
  sequence_id: string;
  step_number: number;
  channel: HxOutreachChannel;
  step_type: HxStepType;
  delay_days: number;
  subject: string | null;
  body_template: string;
  created_at: string;
}

export interface HxSequenceEnrollment {
  id: string;
  contact_id: string;
  sequence_id: string;
  current_step: number;
  status: HxEnrollmentStatus;
  enrolled_at: string;
  next_step_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface HxOutreachLog {
  id: string;
  contact_id: string | null;
  sequence_id: string | null;
  step_id: string | null;
  enrollment_id: string | null;
  channel: HxOutreachChannel;
  status: HxOutreachLogStatus;
  subject: string | null;
  body_preview: string | null;
  external_id: string | null;
  sent_at: string;
  raw_json: Record<string, unknown> | null;
}
