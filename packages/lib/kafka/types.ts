/**
 * Harvics OS — Confluent Kafka event envelope (topic: Harvics_OS)
 */

export type HarvicsSourceModule =
  | 'HarvicsX'
  | 'Harvics_Vatify'
  | 'Harvics_Outreach'
  | 'Harvics_API'
  | 'Harvics_Worker'
  | 'Harvics_Voice'
  | (string & {});

export type HarvicsOsEventType =
  | 'lead.saved'
  | 'lead.enriched'
  | 'lead.synced'
  | 'campaign.sent'
  | 'reply.classified'
  | 'llm.completed'
  | 'voice.session'
  | 'system.health'
  | (string & {});

export interface HarvicsOsEventMeta {
  correlationId?: string;
  retryCount?: number;
  traceId?: string;
}

/** Strongly typed JSON payload published to Harvics_OS */
export interface HarvicsOsEvent<TPayload = Record<string, unknown>> {
  eventId: string;
  timestamp: string;
  sourceModule: HarvicsSourceModule;
  eventType: HarvicsOsEventType;
  payload: TPayload;
  meta?: HarvicsOsEventMeta;
}

export type HarvicsOsEventInput<TPayload = Record<string, unknown>> = {
  sourceModule: HarvicsSourceModule;
  eventType: HarvicsOsEventType;
  payload: TPayload;
  eventId?: string;
  timestamp?: string;
  meta?: HarvicsOsEventMeta;
};

export function isHarvicsOsEvent(value: unknown): value is HarvicsOsEvent {
  if (!value || typeof value !== 'object') return false;
  const e = value as Record<string, unknown>;
  return (
    typeof e.eventId === 'string' &&
    typeof e.timestamp === 'string' &&
    typeof e.sourceModule === 'string' &&
    typeof e.eventType === 'string' &&
    e.payload !== undefined &&
    typeof e.payload === 'object'
  );
}
