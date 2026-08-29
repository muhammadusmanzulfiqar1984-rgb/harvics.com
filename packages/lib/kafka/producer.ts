/**
 * Harvics OS Kafka producer — publish typed events to Harvics_OS.
 */

import { randomUUID } from 'node:crypto';
import type { Producer, RecordMetadata } from 'kafkajs';
import { getKafka, readKafkaEnv, kafkaConfigured } from './client';
import type { HarvicsOsEvent, HarvicsOsEventInput } from './types';
import { hxLogger } from '../hx-logger';

const MODULE = 'kafka.producer';

let producer: Producer | null = null;
let connecting: Promise<Producer> | null = null;

async function getProducer(): Promise<Producer> {
  if (producer) return producer;
  if (connecting) return connecting;

  connecting = (async () => {
    const kafka = getKafka();
    const p = kafka.producer({
      allowAutoTopicCreation: false,
      idempotent: true,
      maxInFlightRequests: 5,
      retry: { retries: 8, initialRetryTime: 300, maxRetryTime: 30_000 },
    });
    await p.connect();
    producer = p;
    hxLogger.info(MODULE, 'producer connected');
    return p;
  })();

  try {
    return await connecting;
  } finally {
    connecting = null;
  }
}

export function buildHarvicsOsEvent<T>(
  input: HarvicsOsEventInput<T>,
): HarvicsOsEvent<T> {
  return {
    eventId: input.eventId || randomUUID(),
    timestamp: input.timestamp || new Date().toISOString(),
    sourceModule: input.sourceModule,
    eventType: input.eventType,
    payload: input.payload,
    meta: input.meta,
  };
}

export type PublishResult = {
  ok: boolean;
  event: HarvicsOsEvent;
  metadata?: RecordMetadata[];
  error?: string;
  skipped?: boolean;
};

/**
 * Publish one event. Soft-skip when Kafka env is missing (local/CF without secrets).
 * Retries are handled by KafkaJS; this wraps a final attempt surface for callers.
 */
export async function publishHarvicsEvent<T>(
  input: HarvicsOsEventInput<T>,
  opts?: { topic?: string; key?: string; required?: boolean },
): Promise<PublishResult> {
  const event = buildHarvicsOsEvent(input);

  if (!kafkaConfigured()) {
    if (opts?.required) {
      return { ok: false, event, error: 'Kafka not configured' };
    }
    hxLogger.warn(MODULE, 'skip publish — Kafka env missing', {
      eventType: event.eventType,
      sourceModule: event.sourceModule,
    });
    return { ok: true, event, skipped: true };
  }

  const topic = opts?.topic || readKafkaEnv().topic;
  const key = opts?.key || event.sourceModule;

  try {
    const p = await getProducer();
    const metadata = await p.send({
      topic,
      messages: [
        {
          key,
          value: JSON.stringify(event),
          headers: {
            eventType: event.eventType,
            sourceModule: event.sourceModule,
            eventId: event.eventId,
          },
        },
      ],
    });
    hxLogger.info(MODULE, 'published', {
      topic,
      eventId: event.eventId,
      eventType: event.eventType,
      partitions: metadata.map((m) => m.partition),
    });
    return { ok: true, event, metadata };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    hxLogger.error(MODULE, 'publish failed', err);
    return { ok: false, event, error: message };
  }
}

export async function publishHarvicsEvents<T>(
  inputs: HarvicsOsEventInput<T>[],
  opts?: { topic?: string },
): Promise<{ ok: boolean; results: PublishResult[] }> {
  const results: PublishResult[] = [];
  for (const input of inputs) {
    results.push(await publishHarvicsEvent(input, opts));
  }
  return { ok: results.every((r) => r.ok), results };
}

export async function disconnectProducer(): Promise<void> {
  if (!producer) return;
  try {
    await producer.disconnect();
    hxLogger.info(MODULE, 'producer disconnected');
  } finally {
    producer = null;
  }
}
