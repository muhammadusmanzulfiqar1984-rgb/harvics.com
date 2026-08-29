/**
 * Fire-and-forget Harvics_OS emit (never throws to callers).
 */

import { publishHarvicsEvent, type HarvicsOsEventInput } from './producer';
import { kafkaConfigured } from './client';
import { hxLogger } from '../hx-logger';

const MODULE = 'kafka.emit';

export async function emitOsEvent<T>(
  input: HarvicsOsEventInput<T>,
  opts?: { key?: string },
): Promise<void> {
  if (!kafkaConfigured()) return;
  try {
    const result = await publishHarvicsEvent(input, {
      key: opts?.key,
      required: false,
    });
    if (!result.ok && !result.skipped) {
      hxLogger.warn(MODULE, 'emit failed', {
        eventType: input.eventType,
        error: result.error,
      });
    }
  } catch (err) {
    hxLogger.warn(MODULE, 'emit exception', err);
  }
}
