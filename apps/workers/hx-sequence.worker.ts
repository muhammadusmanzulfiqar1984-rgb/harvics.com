/**
 * hx-sequence.worker.ts — outreach sequence dispatch
 * Module 3 Session 2 — enrollment-driven
 *
 * Queue: hx-outreach-dispatch (concurrency: 3)
 *
 * For each job:
 *   1. Load due enrollment (active + next_step_at <= NOW)
 *   2. Load sequence step for current_step
 *   3. Route by step_type → sendEmail / LinkedIn log / WhatsApp / SMS
 *   4. Advance enrollment or complete / pause on bounce
 *   5. bronzeWrite({ event_type: 'outreach.sent' })
 */

import { Worker } from 'bullmq';

import { bronzeWrite } from '../../packages/lib/hx-bronze';
import { hxLogger } from '../../packages/lib/hx-logger';
import type { HxQueueJob } from '../../packages/types/hx.types';
import { pool } from '../../packages/db';
import {
  logOutreach,
  updateEnrollment,
} from '../../packages/db/repositories/hx-outreach.repository';
import {
  queueEnrollmentDispatch,
  renderTemplate,
  sendEmail,
  sendSMS,
  sendWhatsApp,
  type OutreachContact,
} from '../api/services/hx-outreach.service';
import type { HxSequenceStep } from '../../packages/types/hx-outreach.types';

const REDIS_URL = process.env.HX_REDIS_URL ?? 'redis://localhost:6379';
const MODULE = 'hx-sequence.worker';

type DispatchPayload = {
  enrollment_id?: string;
};

interface EnrollmentRow {
  id: string;
  contact_id: string;
  sequence_id: string;
  current_step: number;
  status: string;
  next_step_at: string | null;
}

interface StepRow extends HxSequenceStep {}

async function getStep(
  sequenceId: string,
  stepNumber: number,
): Promise<StepRow | null> {
  const { rows } = await pool.query<StepRow>(
    `SELECT id, sequence_id, step_number, channel, step_type, delay_days,
            subject, body_template, created_at
     FROM hx_sequence_steps
     WHERE sequence_id = $1 AND step_number = $2`,
    [sequenceId, stepNumber],
  );
  return rows[0] ?? null;
}

async function getContact(contactId: string): Promise<OutreachContact | null> {
  const { rows } = await pool.query<OutreachContact>(
    `SELECT id, first_name, last_name, full_name, company_name,
            email_pattern, phone, linkedin_url
     FROM hx_contacts WHERE id = $1`,
    [contactId],
  );
  return rows[0] ?? null;
}

async function getNextStep(
  sequenceId: string,
  afterStep: number,
): Promise<StepRow | null> {
  const { rows } = await pool.query<StepRow>(
    `SELECT id, sequence_id, step_number, channel, step_type, delay_days,
            subject, body_template, created_at
     FROM hx_sequence_steps
     WHERE sequence_id = $1 AND step_number > $2
     ORDER BY step_number ASC
     LIMIT 1`,
    [sequenceId, afterStep],
  );
  return rows[0] ?? null;
}

async function advanceEnrollment(
  enrollment: EnrollmentRow,
  currentStep: StepRow,
): Promise<void> {
  const next = await getNextStep(enrollment.sequence_id, currentStep.step_number);

  if (!next) {
    await updateEnrollment(enrollment.id, {
      status: 'completed',
      completed_at: new Date().toISOString(),
      next_step_at: null,
    });
    hxLogger.info(MODULE, 'enrollment completed', { enrollment_id: enrollment.id });
    return;
  }

  const delayMs = Math.max(0, next.delay_days) * 24 * 60 * 60 * 1000;
  const nextStepAt = new Date(Date.now() + delayMs).toISOString();

  await updateEnrollment(enrollment.id, {
    current_step: next.step_number,
    next_step_at: nextStepAt,
    status: 'active',
  });

  await queueEnrollmentDispatch(enrollment.id, delayMs);
}

const worker = new Worker<HxQueueJob<DispatchPayload>>(
  'hx-outreach-dispatch',
  async (job) => {
    const enrollmentId = job.data?.payload?.enrollment_id;

    // Run claim inside a transaction so SKIP LOCKED holds until commit
    const client = await pool.connect();
    let enrollment: EnrollmentRow | null = null;
    try {
      await client.query('BEGIN');
      if (enrollmentId) {
        const { rows } = await client.query<EnrollmentRow>(
          `SELECT e.id, e.contact_id, e.sequence_id, e.current_step, e.status, e.next_step_at
           FROM hx_sequence_enrollments e
           JOIN hx_sequences s ON s.id = e.sequence_id
           WHERE e.id = $1
             AND e.status = 'active'
             AND e.next_step_at <= NOW()
             AND s.status = 'active'
           FOR UPDATE OF e SKIP LOCKED`,
          [enrollmentId],
        );
        enrollment = rows[0] ?? null;
      } else {
        const { rows } = await client.query<EnrollmentRow>(
          `SELECT e.id, e.contact_id, e.sequence_id, e.current_step, e.status, e.next_step_at
           FROM hx_sequence_enrollments e
           JOIN hx_sequences s ON s.id = e.sequence_id
           WHERE e.status = 'active'
             AND e.next_step_at <= NOW()
             AND s.status = 'active'
           ORDER BY e.next_step_at ASC
           LIMIT 1
           FOR UPDATE OF e SKIP LOCKED`,
        );
        enrollment = rows[0] ?? null;
      }

      if (!enrollment) {
        await client.query('COMMIT');
        hxLogger.debug(MODULE, 'no due enrollment', { enrollment_id: enrollmentId });
        return;
      }

      // Lease enrollment so concurrent workers skip it during send
      await client.query(
        `UPDATE hx_sequence_enrollments
         SET next_step_at = NOW() + INTERVAL '1 hour',
             updated_at = NOW()
         WHERE id = $1`,
        [enrollment.id],
      );
      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }

    const [step, contact] = await Promise.all([
      getStep(enrollment.sequence_id, enrollment.current_step),
      getContact(enrollment.contact_id),
    ]);

    if (!step || !contact) {
      hxLogger.warn(MODULE, 'step or contact missing', {
        enrollment_id: enrollment.id,
        step: enrollment.current_step,
      });
      return;
    }

    const stepType = step.step_type || step.channel;
    let sent = false;
    let bounced = false;
    let externalId = '';
    let logStatus: 'sent' | 'bounced' | 'failed' = 'failed';
    const bodyPreview = renderTemplate(step.body_template, contact).slice(0, 500);
    const subject = step.subject ? renderTemplate(step.subject, contact) : null;

    if (stepType === 'wait') {
      sent = true;
      logStatus = 'sent';
    } else if (stepType === 'email') {
      const result = await sendEmail(contact, step);
      sent = result.sent;
      bounced = Boolean(result.bounced);
      externalId = result.message_id;
      logStatus = bounced ? 'bounced' : sent ? 'sent' : 'failed';
    } else if (stepType === 'linkedin') {
      // Manual LinkedIn Clicker Tool — log only, flag for operator
      sent = true;
      logStatus = 'sent';
      hxLogger.info(MODULE, 'LinkedIn step flagged for manual send', {
        enrollment_id: enrollment.id,
        contact_id: contact.id,
        linkedin: contact.linkedin_url,
      });
    } else if (stepType === 'whatsapp') {
      const result = await sendWhatsApp(contact, step);
      sent = result.sent;
      externalId = result.sid;
      logStatus = sent ? 'sent' : 'failed';
    } else if (stepType === 'sms') {
      const result = await sendSMS(contact, step);
      sent = result.sent;
      externalId = result.sid;
      logStatus = sent ? 'sent' : 'failed';
    } else {
      hxLogger.warn(MODULE, 'unknown step_type', { stepType, step_id: step.id });
      return;
    }

    const log = await logOutreach({
      contact_id: contact.id,
      sequence_id: enrollment.sequence_id,
      step_id: step.id,
      enrollment_id: enrollment.id,
      channel: step.channel,
      status: logStatus,
      subject,
      body_preview: bodyPreview,
      external_id: externalId || null,
      raw_json: {
        step_number: step.step_number,
        step_type: stepType,
        manual_linkedin: stepType === 'linkedin',
        enrollment_id: enrollment.id,
      },
    });

    if (bounced) {
      await updateEnrollment(enrollment.id, {
        status: 'paused',
        next_step_at: null,
      });
      await bronzeWrite({
        event_type: 'outreach.bounced',
        source_module: MODULE,
        entity_id: log.id,
        entity_type: 'hx_outreach_log',
        payload: {
          contact_id: contact.id,
          enrollment_id: enrollment.id,
          sequence_id: enrollment.sequence_id,
          channel: 'email',
        },
      });
      hxLogger.warn(MODULE, 'bounce — enrollment paused', {
        enrollment_id: enrollment.id,
        contact_id: contact.id,
      });
      return;
    }

    if (sent) {
      await bronzeWrite({
        event_type: 'outreach.sent',
        source_module: MODULE,
        entity_id: log.id,
        entity_type: 'hx_outreach_log',
        payload: {
          contact_id: contact.id,
          enrollment_id: enrollment.id,
          sequence_id: enrollment.sequence_id,
          channel: step.channel,
          step_type: stepType,
          step_number: step.step_number,
          manual: stepType === 'linkedin',
        },
      });
      await advanceEnrollment(enrollment, step);
    }

    hxLogger.info(MODULE, 'sequence step dispatched', {
      enrollment_id: enrollment.id,
      channel: step.channel,
      step_type: stepType,
      status: logStatus,
    });
  },
  {
    connection: { url: REDIS_URL, maxRetriesPerRequest: null },
    concurrency: 3,
  },
);

worker.on('failed', (job, err) => {
  hxLogger.error(MODULE, 'job failed', {
    jobId: job?.id,
    attempt: job?.attemptsMade,
    err: err.message,
  });
});

worker.on('error', (err) => {
  hxLogger.error(MODULE, 'worker error', { err: err.message });
});

hxLogger.info(MODULE, 'worker started', {
  concurrency: 3,
  queue: 'hx-outreach-dispatch',
});

export { worker };
