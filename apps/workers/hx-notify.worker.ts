/**
 * hx-notify.worker.ts — notification dispatcher
 * Source: HARVYX_BACKEND_RULES.md § 8
 *
 * Queue consumed: hx:notify
 * Channels:
 *   whatsapp  — Twilio WhatsApp API (HX_TWILIO_WHATSAPP_FROM → HX_OPERATOR_WHATSAPP)
 *   slack     — Slack Incoming Webhook (terminal failures + compliance blocks only)
 *   in_app    — pg_notify('hx_inapp', payload) → SSE to UI
 *
 * Threshold rules (HARVYX_BACKEND_RULES.md § 8):
 *   action_required → whatsapp + slack (if failure/sanctions) + in_app
 *   alert           → whatsapp + in_app
 *   info            → in_app only
 *
 * Writes to hx_notifications after every dispatch attempt.
 * bronzeWrite({ event_type: 'notification.sent' }) on success.
 *
 * Concurrency: 10
 */

import { Worker }       from 'bullmq';

import { bronzeWrite }  from '../../packages/lib/hx-bronze';
import { hxLogger }     from '../../packages/lib/hx-logger';
import type { HxQueueJob, HxWhatsAppNotification } from '../../packages/types/hx.types';
import { pool } from '../../packages/db';

// ── Config ────────────────────────────────────────────────────────────────────

const REDIS_URL          = process.env.HX_REDIS_URL              ?? 'redis://localhost:6379';
const TWILIO_ACCOUNT_SID = process.env.HX_TWILIO_ACCOUNT_SID     ?? '';
const TWILIO_AUTH_TOKEN  = process.env.HX_TWILIO_AUTH_TOKEN      ?? '';
const TWILIO_FROM        = process.env.HX_TWILIO_WHATSAPP_FROM   ?? '';   // e.g. +14155238886
const OPERATOR_WA        = process.env.HX_OPERATOR_WHATSAPP      ?? '';   // e.g. +48123456789
const SLACK_WEBHOOK      = process.env.HX_SLACK_WEBHOOK_URL      ?? '';

const FETCH_TIMEOUT = 12_000;
const MODULE        = 'hx-notify.worker';

// ── Singleton DB pool (for hx_notifications writes + pg_notify) ───────────────


// ── Notification threshold map ────────────────────────────────────────────────
// Source: HARVYX_BACKEND_RULES.md § 8
// Maps job type labels to their required channels.

type NotifType = 'action_required' | 'alert' | 'info';

interface ChannelPlan {
  whatsapp: boolean;
  slack:    boolean;
  in_app:   boolean;
}

const THRESHOLD_MAP: Record<NotifType, ChannelPlan> = {
  action_required: { whatsapp: true,  slack: true,  in_app: true  },
  alert:           { whatsapp: true,  slack: false, in_app: true  },
  info:            { whatsapp: false, slack: false, in_app: true  },
};

// Specific module/event pairs that always get Slack even if type = 'alert'
const SLACK_FORCE_MODULES = new Set([
  'hx-lusha-reveal.worker',    // LUSHA_CREDITS_LOW
  'hx-apollo-enrich.worker',   // APOLLO_CREDITS_LOW
  'hx-icp-score.worker',       // job.failed.terminal
  'sanctions-check',
  'aml-check',
]);

function resolveChannels(payload: HxWhatsAppNotification): ChannelPlan {
  const plan = { ...THRESHOLD_MAP[payload.type] };
  if (!plan.slack && SLACK_FORCE_MODULES.has(payload.module)) {
    plan.slack = true;
  }
  return plan;
}

// ── Twilio WhatsApp ───────────────────────────────────────────────────────────

function formatWhatsAppBody(n: HxWhatsAppNotification): string {
  const lines: string[] = [
    `*${n.headline}*`,
    n.body,
  ];
  if (n.entity_name) lines.push(`Entity: ${n.entity_name}`);
  if (n.action_url)  lines.push(`→ ${n.action_url}`);
  lines.push(`_${new Date(n.timestamp).toUTCString()}_`);
  return lines.join('\n');
}

async function sendWhatsApp(n: HxWhatsAppNotification): Promise<'sent' | 'failed'> {
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_FROM || !OPERATOR_WA) {
    hxLogger.warn(MODULE, 'Twilio config missing — WhatsApp skipped');
    return 'failed';
  }

  const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

  try {
    const body = new URLSearchParams({
      From: `whatsapp:${TWILIO_FROM}`,
      To:   `whatsapp:${n.to || OPERATOR_WA}`,
      Body: formatWhatsAppBody(n),
    });

    const res = await fetch(url, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        Authorization:  `Basic ${Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      hxLogger.warn(MODULE, `Twilio ${res.status}`, { body: text.slice(0, 200) });
      return 'failed';
    }

    hxLogger.info(MODULE, 'WhatsApp sent', { headline: n.headline, to: OPERATOR_WA });
    return 'sent';
  } catch (err) {
    const isTimeout = err instanceof Error && err.name === 'AbortError';
    hxLogger.warn(MODULE, isTimeout ? 'Twilio timeout' : 'Twilio error', {
      err: err instanceof Error ? err.message : String(err),
    });
    return 'failed';
  } finally {
    clearTimeout(timer);
  }
}

// ── Slack webhook ─────────────────────────────────────────────────────────────

const SLACK_DOT: Record<HxWhatsAppNotification['type'], string> = {
  action_required: '🔴',
  alert:           '🟠',
  info:            '🔵',
};

async function sendSlack(n: HxWhatsAppNotification): Promise<'sent' | 'failed'> {
  if (!SLACK_WEBHOOK) {
    hxLogger.warn(MODULE, 'HX_SLACK_WEBHOOK_URL not set — Slack skipped');
    return 'failed';
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

  try {
    const slackBody = {
      text: `${SLACK_DOT[n.type]} *HarvyX* — ${n.headline}`,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: [
              `${SLACK_DOT[n.type]} *${n.headline}*`,
              `Module: \`${n.module}\``,
              n.body,
              n.entity_name ? `Entity: *${n.entity_name}*` : null,
              n.action_url  ? `<${n.action_url}|Open in HarvyX →>` : null,
            ].filter(Boolean).join('\n'),
          },
        },
        {
          type: 'context',
          elements: [{
            type: 'mrkdwn',
            text: `<!date^${Math.floor(Date.now() / 1000)}^{date_short_pretty} at {time}|${n.timestamp}>`,
          }],
        },
      ],
    };

    const res = await fetch(SLACK_WEBHOOK, {
      method: 'POST',
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(slackBody),
    });

    if (!res.ok) {
      hxLogger.warn(MODULE, `Slack ${res.status}`);
      return 'failed';
    }

    hxLogger.info(MODULE, 'Slack sent', { headline: n.headline });
    return 'sent';
  } catch (err) {
    const isTimeout = err instanceof Error && err.name === 'AbortError';
    hxLogger.warn(MODULE, isTimeout ? 'Slack timeout' : 'Slack error', {
      err: err instanceof Error ? err.message : String(err),
    });
    return 'failed';
  } finally {
    clearTimeout(timer);
  }
}

// ── In-app via pg_notify ──────────────────────────────────────────────────────

async function sendInApp(n: HxWhatsAppNotification): Promise<'sent' | 'failed'> {
  try {
    const inAppPayload = JSON.stringify({
      type:        n.type,
      module:      n.module,
      headline:    n.headline,
      body:        n.body,
      entity_name: n.entity_name ?? null,
      entity_id:   n.entity_id  ?? null,
      action_url:  n.action_url ?? null,
      ts:          n.timestamp,
    });

    await pool.query(`SELECT pg_notify('hx_inapp', $1)`, [inAppPayload]);
    hxLogger.debug(MODULE, 'in-app notify sent', { headline: n.headline });
    return 'sent';
  } catch (err) {
    hxLogger.warn(MODULE, 'in-app notify failed', {
      err: err instanceof Error ? err.message : String(err),
    });
    return 'failed';
  }
}

// ── hx_notifications write ────────────────────────────────────────────────────

async function writeNotificationRecord(
  eventType: string,
  channel:   'whatsapp' | 'slack' | 'in_app',
  payload:   HxWhatsAppNotification,
  status:    'sent' | 'failed',
): Promise<void> {
  await pool.query(
    `INSERT INTO hx_notifications
       (id, event_type, channel, payload, status, sent_at, created_at)
     VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, NOW())`,
    [
      eventType,
      channel,
      JSON.stringify(payload),
      status,
      status === 'sent' ? new Date().toISOString() : null,
    ],
  );
}

// ── Worker ────────────────────────────────────────────────────────────────────

const worker = new Worker<HxQueueJob<HxWhatsAppNotification>>(
  'hx-notify',
  async (job) => {
    const notification = job.data.payload;
    const channels     = resolveChannels(notification);
    const eventType    = `notify_${notification.type}`;

    // Dispatch in parallel; capture per-channel status
    const [waStatus, slackStatus, inAppStatus] = await Promise.all([
      channels.whatsapp ? sendWhatsApp(notification) : Promise.resolve<'sent' | 'failed' | 'skipped'>('skipped'),
      channels.slack    ? sendSlack(notification)    : Promise.resolve<'sent' | 'failed' | 'skipped'>('skipped'),
      channels.in_app   ? sendInApp(notification)    : Promise.resolve<'sent' | 'failed' | 'skipped'>('skipped'),
    ]);

    // Write one record per dispatched channel
    const writeOps: Promise<void>[] = [];
    if (channels.whatsapp) writeOps.push(writeNotificationRecord(eventType, 'whatsapp', notification, waStatus as 'sent' | 'failed'));
    if (channels.slack)    writeOps.push(writeNotificationRecord(eventType, 'slack',    notification, slackStatus as 'sent' | 'failed'));
    if (channels.in_app)   writeOps.push(writeNotificationRecord(eventType, 'in_app',   notification, inAppStatus as 'sent' | 'failed'));
    await Promise.all(writeOps);

    const anySent = [waStatus, slackStatus, inAppStatus].includes('sent');

    await bronzeWrite({
      event_type:    'notification.sent',
      source_module: MODULE,
      entity_id:     notification.entity_id ?? undefined,
      entity_type:   'hx_notification',
      payload: {
        type:          notification.type,
        module:        notification.module,
        headline:      notification.headline,
        channels: {
          whatsapp: waStatus,
          slack:    slackStatus,
          in_app:   inAppStatus,
        },
        any_sent: anySent,
      },
    });

    hxLogger.info(MODULE, 'notification dispatched', {
      type:     notification.type,
      headline: notification.headline,
      whatsapp: waStatus,
      slack:    slackStatus,
      in_app:   inAppStatus,
    });

    // If all channels failed, throw so BullMQ retries
    if (channels.whatsapp && waStatus === 'failed' &&
        channels.slack    && slackStatus === 'failed' &&
        channels.in_app   && inAppStatus === 'failed') {
      throw new Error('All notification channels failed');
    }
  },
  {
    connection:  { url: REDIS_URL, maxRetriesPerRequest: null },
    concurrency: 10,
  },
);

worker.on('failed', (job, err) => {
  hxLogger.error(MODULE, 'job failed', {
    jobId:    job?.id,
    attempt:  job?.attemptsMade,
    err:      err.message,
  });
});

worker.on('error', (err) => {
  hxLogger.error(MODULE, 'worker error', { err: err.message });
});

hxLogger.info(MODULE, 'worker started', { concurrency: 10, queue: 'hx-notify' });

export { worker };
