/**
 * Harvics OS Kafka consumer — subscribe to Harvics_OS with retry + handler isolation.
 */

import type { Consumer, EachMessagePayload } from 'kafkajs';
import { getKafka, readKafkaEnv, kafkaConfigured } from './client';
import { isHarvicsOsEvent, type HarvicsOsEvent } from './types';
import { hxLogger } from '../hx-logger';

const MODULE = 'kafka.consumer';

export type EventHandler = (
  event: HarvicsOsEvent,
  raw: EachMessagePayload,
) => Promise<void> | void;

export type ConsumerOptions = {
  groupId?: string;
  topic?: string;
  fromBeginning?: boolean;
  /** Max handler attempts before sending to fallback / dead-letter log */
  maxHandlerRetries?: number;
  onInvalid?: (raw: string, err: Error) => void;
  onHandlerFailure?: (event: HarvicsOsEvent | null, err: Error) => void;
};

let consumer: Consumer | null = null;

async function withRetries(
  fn: () => Promise<void>,
  attempts: number,
  label: string,
): Promise<void> {
  let last: unknown;
  for (let i = 1; i <= attempts; i++) {
    try {
      await fn();
      return;
    } catch (err) {
      last = err;
      hxLogger.warn(MODULE, `handler retry ${i}/${attempts}`, {
        label,
        err: err instanceof Error ? err.message : String(err),
      });
      await new Promise((r) => setTimeout(r, Math.min(1000 * 2 ** (i - 1), 8000)));
    }
  }
  throw last instanceof Error ? last : new Error(String(last));
}

export async function startHarvicsConsumer(
  handler: EventHandler,
  opts: ConsumerOptions = {},
): Promise<Consumer> {
  if (!kafkaConfigured()) {
    throw new Error('Kafka not configured (KAFKA_BOOTSTRAP_SERVER / API key+secret)');
  }

  if (consumer) {
    hxLogger.warn(MODULE, 'consumer already running');
    return consumer;
  }

  const env = readKafkaEnv();
  const groupId = opts.groupId || process.env.KAFKA_GROUP_ID || 'harvics-os-workers';
  const topic = opts.topic || env.topic;
  const maxRetries = opts.maxHandlerRetries ?? 3;

  const kafka = getKafka();
  const c = kafka.consumer({
    groupId,
    sessionTimeout: 45_000,
    heartbeatInterval: 15_000,
    retry: { retries: 8, initialRetryTime: 300, maxRetryTime: 30_000 },
  });

  await c.connect();
  await c.subscribe({ topic, fromBeginning: Boolean(opts.fromBeginning) });

  await c.run({
    autoCommit: true,
    eachMessage: async (payload) => {
      const raw = payload.message.value?.toString('utf8') || '';
      let event: HarvicsOsEvent | null = null;

      try {
        const parsed = JSON.parse(raw) as unknown;
        if (!isHarvicsOsEvent(parsed)) {
          throw new Error('Invalid HarvicsOsEvent shape');
        }
        event = parsed;
      } catch (err) {
        const e = err instanceof Error ? err : new Error(String(err));
        hxLogger.error(MODULE, 'invalid event JSON', e);
        opts.onInvalid?.(raw, e);
        return; // do not retry poison messages forever
      }

      try {
        await withRetries(
          async () => handler(event!, payload),
          maxRetries,
          event.eventType,
        );
      } catch (err) {
        const e = err instanceof Error ? err : new Error(String(err));
        hxLogger.error(MODULE, 'handler failed after retries', {
          eventId: event.eventId,
          eventType: event.eventType,
          err: e.message,
        });
        opts.onHandlerFailure?.(event, e);
        // Fallback: leave committed (autoCommit) to avoid infinite redelivery of poison;
        // caller can implement dead-letter topic in onHandlerFailure.
      }
    },
  });

  consumer = c;
  hxLogger.info(MODULE, 'consumer running', { groupId, topic });
  return c;
}

export async function stopHarvicsConsumer(): Promise<void> {
  if (!consumer) return;
  try {
    await consumer.disconnect();
    hxLogger.info(MODULE, 'consumer disconnected');
  } finally {
    consumer = null;
  }
}
