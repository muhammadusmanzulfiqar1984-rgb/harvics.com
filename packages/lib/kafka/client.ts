/**
 * Shared Confluent Cloud KafkaJS client (SASL_SSL / PLAIN).
 * Runs on Node only (AWS Hx API / workers) — not Cloudflare Workers.
 */

import { Kafka, logLevel, type KafkaConfig, type SASLOptions } from 'kafkajs';
import { hxLogger } from '../hx-logger';

const MODULE = 'kafka.client';

export const DEFAULT_TOPIC = process.env.KAFKA_TOPIC || 'Harvics_OS';

export type KafkaEnv = {
  brokers: string[];
  apiKey: string;
  apiSecret: string;
  clientId: string;
  topic: string;
};

export function readKafkaEnv(): KafkaEnv {
  const bootstrap =
    process.env.KAFKA_BOOTSTRAP_SERVER ||
    process.env.KAFKA_BOOTSTRAP_SERVERS ||
    '';
  const apiKey = (process.env.KAFKA_API_KEY || '').trim();
  const apiSecret = (process.env.KAFKA_API_SECRET || '').trim();
  const topic = (process.env.KAFKA_TOPIC || DEFAULT_TOPIC).trim() || 'Harvics_OS';
  const clientId = (process.env.KAFKA_CLIENT_ID || 'harvics-os').trim();

  if (!bootstrap) {
    throw new Error('KAFKA_BOOTSTRAP_SERVER is required');
  }
  if (!apiKey || !apiSecret) {
    throw new Error('KAFKA_API_KEY and KAFKA_API_SECRET are required');
  }

  const brokers = bootstrap
    .split(',')
    .map((b) => b.trim())
    .filter(Boolean);

  return { brokers, apiKey, apiSecret, clientId, topic };
}

export function kafkaConfigured(): boolean {
  try {
    readKafkaEnv();
    return true;
  } catch {
    return false;
  }
}

let singleton: Kafka | null = null;

export function getKafka(): Kafka {
  if (singleton) return singleton;

  const env = readKafkaEnv();
  const sasl: SASLOptions = {
    mechanism: 'plain',
    username: env.apiKey,
    password: env.apiSecret,
  };

  const config: KafkaConfig = {
    clientId: env.clientId,
    brokers: env.brokers,
    ssl: true,
    sasl,
    connectionTimeout: 15_000,
    requestTimeout: 30_000,
    retry: {
      initialRetryTime: 300,
      retries: 8,
      maxRetryTime: 30_000,
      factor: 2,
      multiplier: 1.5,
    },
    logLevel: process.env.NODE_ENV === 'production' ? logLevel.ERROR : logLevel.WARN,
  };

  singleton = new Kafka(config);
  hxLogger.info(MODULE, 'Kafka client ready', {
    brokers: env.brokers,
    clientId: env.clientId,
    topic: env.topic,
  });
  return singleton;
}

export function resetKafkaSingleton(): void {
  singleton = null;
}
