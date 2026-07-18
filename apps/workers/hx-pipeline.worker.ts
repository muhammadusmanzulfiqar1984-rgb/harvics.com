/**
 * hx-pipeline.worker.ts — CRM pipeline stage automation
 * Source: HARVYX_BACKEND_RULES.md § 6
 *
 * Queue consumed: hx-pipeline
 * Queue emitted:  hx-notify (Negotiation), hx-sanctions (Closing)
 *
 * Triggered by reply.classified and operator CRM events.
 * Maps intent/trigger to hx_pipeline_deals.stage.
 * bronzeWrite({ event_type: 'deal.stage_changed' }).
 *
 * Concurrency: 10
 */

import { Worker, Queue } from 'bullmq';
import { randomUUID }    from 'crypto';

import { bronzeWrite }  from '../../packages/lib/hx-bronze';
import { hxLogger }     from '../../packages/lib/hx-logger';
import type { HxQueueJob, HxWhatsAppNotification } from '../../packages/types/hx.types';
import { pool } from '../../packages/db';

// ── Config ────────────────────────────────────────────────────────────────────

const REDIS_URL   = process.env.HX_REDIS_URL            ?? 'redis://localhost:6379';
const OPERATOR_WA = process.env.HX_OPERATOR_WHATSAPP      ?? '';
const MODULE      = 'hx-pipeline.worker';

// ── Singletons ────────────────────────────────────────────────────────────────


const notifyQueue    = new Queue('hx-notify',     { connection: { url: REDIS_URL, maxRetriesPerRequest: null } });
const sanctionsQueue = new Queue('hx-sanctions', { connection: { url: REDIS_URL, maxRetriesPerRequest: null } });

// ── Types ─────────────────────────────────────────────────────────────────────

type PipelineTrigger =
  | 'positive'
  | 'meeting_booked'
  | 'proposal_sent'
  | 'deal_won'
  | 'deal_lost';

type DealStage =
  | 'Prospect'
  | 'Qualified'
  | 'Proposal'
  | 'Negotiation'
  | 'Closing'
  | 'Won'
  | 'Lost';

interface PipelinePayload {
  contact_id: string;
  deal_id?:   string;
  reply_id?:  string;
  trigger:    PipelineTrigger;
}

interface DealRow {
  id:           string;
  contact_id:   string | null;
  company_id:   string | null;
  title:        string;
  stage:        DealStage;
}

interface ContactRow {
  id:           string;
  full_name:    string | null;
  company_name: string | null;
  company_id:   string | null;
}

// ── Stage mapping ─────────────────────────────────────────────────────────────
// Discovery → Qualified, Demo → Proposal (schema stage names)

/** Resolve the next CRM stage for a given trigger + current stage. */
function resolveNextStage(current: DealStage, trigger: PipelineTrigger): DealStage | null {
  if (trigger === 'positive' && current === 'Qualified') return 'Proposal';
  if (trigger === 'meeting_booked' && (current === 'Qualified' || current === 'Prospect')) {
    return 'Proposal';
  }
  if (trigger === 'proposal_sent' && current === 'Negotiation') return 'Closing';
  if (trigger === 'proposal_sent' && (current === 'Proposal' || current === 'Qualified')) {
    return 'Negotiation';
  }
  if (trigger === 'deal_won') return 'Won';
  if (trigger === 'deal_lost') return 'Lost';
  return null;
}

async function findDeal(contactId: string, dealId?: string): Promise<DealRow | null> {
  if (dealId) {
    const { rows } = await pool.query<DealRow>(
      `SELECT id, contact_id, company_id, title, stage FROM hx_pipeline_deals WHERE id = $1`,
      [dealId],
    );
    return rows[0] ?? null;
  }

  const { rows } = await pool.query<DealRow>(
    `SELECT id, contact_id, company_id, title, stage
     FROM hx_pipeline_deals
     WHERE contact_id = $1 AND stage NOT IN ('Won', 'Lost')
     ORDER BY updated_at DESC LIMIT 1`,
    [contactId],
  );
  return rows[0] ?? null;
}

async function getContact(contactId: string): Promise<ContactRow | null> {
  const { rows } = await pool.query<ContactRow>(
    `SELECT id, full_name, company_name, company_id FROM hx_contacts WHERE id = $1`,
    [contactId],
  );
  return rows[0] ?? null;
}

async function updateDealStage(dealId: string, stage: DealStage): Promise<void> {
  await pool.query(
    `UPDATE hx_pipeline_deals SET stage = $1, updated_at = NOW() WHERE id = $2`,
    [stage, dealId],
  );
}

async function setNurturePool(contactId: string): Promise<void> {
  await pool.query(
    `UPDATE hx_contacts SET in_nurture_pool = TRUE, updated_at = NOW() WHERE id = $1`,
    [contactId],
  );
}

async function pushNegotiationNotify(deal: DealRow, contact: ContactRow): Promise<void> {
  const notification: HxWhatsAppNotification = {
    to:          OPERATOR_WA,
    type:        'alert',
    module:      'pipeline',
    headline:    `Deal → Negotiation — ${(contact.company_name ?? deal.title).slice(0, 40)}`,
    body:        `${contact.full_name ?? 'Contact'} moved to Negotiation stage.`,
    entity_name: contact.full_name ?? undefined,
    entity_id:   deal.id,
    action_url:  `https://harvyx.com/pipeline/${deal.id}`,
    timestamp:   new Date().toISOString(),
  };

  const job: HxQueueJob<HxWhatsAppNotification> = {
    job_id: randomUUID(), job_type: 'notify', source_module: MODULE,
    attempts: 0, created_at: new Date().toISOString(), payload: notification,
  };
  await notifyQueue.add('notify', job, { priority: 5, attempts: 3 });
}

async function pushSanctionsScreen(
  deal: DealRow,
  contact: ContactRow,
): Promise<void> {
  const job: HxQueueJob<{
    deal_id: string;
    contact_id: string;
    company_id?: string;
    company_name: string;
  }> = {
    job_id:        randomUUID(),
    job_type:      'sanctions',
    source_module: MODULE,
    attempts:      0,
    created_at:    new Date().toISOString(),
    payload: {
      deal_id:      deal.id,
      contact_id:   contact.id,
      company_id:   deal.company_id ?? contact.company_id ?? undefined,
      company_name: contact.company_name ?? deal.title,
    },
  };

  await sanctionsQueue.add('sanctions', job, {
    priority: 1,
    attempts: 3,
    removeOnComplete: { count: 500 },
    removeOnFail:     { count: 200 },
  });
}

// ── Worker ────────────────────────────────────────────────────────────────────

const worker = new Worker<HxQueueJob<PipelinePayload>>(
  'hx-pipeline',
  async (job) => {
    const { contact_id, deal_id, reply_id, trigger } = job.data.payload;

    const [deal, contact] = await Promise.all([
      findDeal(contact_id, deal_id),
      getContact(contact_id),
    ]);

    if (!deal || !contact) {
      hxLogger.warn(MODULE, 'deal or contact not found', { contact_id, deal_id });
      return;
    }

    const nextStage = resolveNextStage(deal.stage, trigger);
    if (!nextStage || nextStage === deal.stage) {
      hxLogger.debug(MODULE, 'no stage change', {
        deal_id: deal.id, current: deal.stage, trigger,
      });
      return;
    }

    await updateDealStage(deal.id, nextStage);

    if (nextStage === 'Lost') {
      await setNurturePool(contact_id);
      await bronzeWrite({
        event_type:    'deal.closed',
        source_module: MODULE,
        entity_id:     deal.id,
        entity_type:   'hx_pipeline_deal',
        payload: { outcome: 'lost', contact_id, trigger },
      });
    }

    await bronzeWrite({
      event_type:    'deal.stage_changed',
      source_module: MODULE,
      entity_id:     deal.id,
      entity_type:   'hx_pipeline_deal',
      payload: {
        contact_id,
        reply_id:  reply_id ?? null,
        trigger,
        from_stage: deal.stage,
        to_stage:   nextStage,
      },
    });

    if (nextStage === 'Negotiation') {
      await pushNegotiationNotify(deal, contact);
    }

    if (nextStage === 'Closing') {
      await pushSanctionsScreen(deal, contact);
    }

    hxLogger.info(MODULE, 'deal stage updated', {
      deal_id: deal.id,
      from:    deal.stage,
      to:      nextStage,
      trigger,
    });
  },
  {
    connection:  { url: REDIS_URL, maxRetriesPerRequest: null },
    concurrency: 10,
  },
);

worker.on('failed', (job, err) => {
  hxLogger.error(MODULE, 'job failed', {
    jobId: job?.id, attempt: job?.attemptsMade, err: err.message,
  });
});

worker.on('error', (err) => {
  hxLogger.error(MODULE, 'worker error', { err: err.message });
});

hxLogger.info(MODULE, 'worker started', { concurrency: 10, queue: 'hx-pipeline' });

export { worker };
