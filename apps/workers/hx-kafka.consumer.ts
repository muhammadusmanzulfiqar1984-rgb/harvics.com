/**
 * apps/workers/hx-kafka.consumer.ts
 * Long-running Confluent consumer for topic Harvics_OS.
 *
 *   npm run kafka:consume
 */

import {
  startHarvicsConsumer,
  stopHarvicsConsumer,
  type HarvicsOsEvent,
} from '../../packages/lib/kafka';
import { hxLogger } from '../../packages/lib/hx-logger';

const MODULE = 'hx-kafka.consumer';

async function handleEvent(event: HarvicsOsEvent): Promise<void> {
  const base = {
    eventId: event.eventId,
    eventType: event.eventType,
    sourceModule: event.sourceModule,
  };

  switch (event.eventType) {
    case 'lead.saved':
      hxLogger.info(MODULE, 'lead.saved', { ...base, payload: event.payload });
      break;

    case 'lead.synced':
      hxLogger.info(MODULE, 'lead.synced', { ...base, payload: event.payload });
      break;

    case 'lead.enriched': {
      hxLogger.info(MODULE, 'lead.enriched', { ...base, payload: event.payload });
      // When workers finish enrich on d1-sourced contacts, writeback already
      // POSTs to /api/harvyx/writeback. Consumer logs for ops visibility.
      break;
    }

    case 'campaign.sent':
      hxLogger.info(MODULE, 'campaign.sent', { ...base, payload: event.payload });
      break;

    case 'reply.classified':
      hxLogger.info(MODULE, 'reply.classified', { ...base, payload: event.payload });
      break;

    case 'llm.completed':
      hxLogger.info(MODULE, 'llm.completed', { ...base, payload: event.payload });
      break;

    case 'system.health':
      hxLogger.info(MODULE, 'system.health', { ...base, payload: event.payload });
      break;

    case 'voice.session':
      hxLogger.info(MODULE, 'voice.session', { ...base, payload: event.payload });
      break;

    default:
      hxLogger.debug(MODULE, 'passthrough eventType', {
        ...base,
        keys: Object.keys(event.payload || {}),
      });
  }
}

async function main(): Promise<void> {
  hxLogger.info(MODULE, 'starting Harvics_OS consumer');
  await startHarvicsConsumer(handleEvent, {
    groupId: process.env.KAFKA_GROUP_ID || 'harvics-os-workers',
    maxHandlerRetries: 3,
    onHandlerFailure: (event, err) => {
      hxLogger.error(MODULE, 'dead-letter (logged)', {
        eventId: event?.eventId,
        eventType: event?.eventType,
        err: err.message,
      });
    },
  });
}

async function shutdown(signal: string): Promise<void> {
  hxLogger.info(MODULE, `shutdown ${signal}`);
  await stopHarvicsConsumer();
  process.exit(0);
}

process.on('SIGINT', () => void shutdown('SIGINT'));
process.on('SIGTERM', () => void shutdown('SIGTERM'));

main().catch((err) => {
  hxLogger.error(MODULE, 'fatal', err);
  process.exit(1);
});
