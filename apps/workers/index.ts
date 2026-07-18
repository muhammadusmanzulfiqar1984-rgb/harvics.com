/**
 * apps/workers/index.ts — HarvyX worker process entry point
 *
 * Imports all BullMQ workers. Importing a worker module is sufficient
 * to start it — each file instantiates its Worker at module level.
 *
 * Worker pipeline:
 *   hx:scrape  →  parse  →  email-verify  →  icp-score
 *   icp-score  →  apollo-enrich  →  lusha-reveal  →  notify
 *
 * Run:   node -r ts-node/register apps/workers/index.ts
 *        (or compiled: node dist/apps/workers/index.js)
 */

import { Worker as BullWorker } from 'bullmq';
import { hxLogger }             from '../../packages/lib/hx-logger';

const MODULE = 'hx-workers.index';

// ── Import all workers (side-effect: each starts on import) ──────────────────

import { worker as parseWorker }       from './hx-parse.worker';
import { worker as emailVerifyWorker } from './hx-email-verify.worker';
import { worker as icpScoreWorker }    from './hx-icp-score.worker';
import { worker as apolloWorker }      from './hx-apollo-enrich.worker';
import { worker as lushaWorker }       from './hx-lusha-reveal.worker';
import { worker as notifyWorker }      from './hx-notify.worker';
import { worker as sequenceWorker }    from './hx-sequence.worker';
import { worker as replyClassifierWorker } from './hx-reply-classifier.worker';

// ── Registry for graceful shutdown ────────────────────────────────────────────

const ALL_WORKERS: Array<{ name: string; worker: BullWorker }> = [
  { name: 'hx-parse',          worker: parseWorker       },
  { name: 'hx-email-verify',   worker: emailVerifyWorker },
  { name: 'hx-icp-score',      worker: icpScoreWorker    },
  { name: 'hx-apollo-enrich',  worker: apolloWorker      },
  { name: 'hx-lusha-reveal',   worker: lushaWorker       },
  { name: 'hx-notify',         worker: notifyWorker      },
  { name: 'hx-sequence',       worker: sequenceWorker    },
  { name: 'hx-reply-classifier', worker: replyClassifierWorker },
];

// ── Startup log ───────────────────────────────────────────────────────────────

hxLogger.info(MODULE, `${ALL_WORKERS.length} workers running`, {
  workers: ALL_WORKERS.map(w => w.name),
  env:     process.env.NODE_ENV ?? 'development',
  redis:   process.env.HX_REDIS_URL ?? 'redis://localhost:6379',
});

// ── Graceful shutdown ─────────────────────────────────────────────────────────

async function shutdown(signal: string): Promise<void> {
  hxLogger.info(MODULE, `${signal} received — closing workers`);

  const results = await Promise.allSettled(
    ALL_WORKERS.map(({ name, worker }) =>
      worker.close().then(() => {
        hxLogger.info(MODULE, `${name} closed`);
      }),
    ),
  );

  const failed = results.filter(r => r.status === 'rejected');
  if (failed.length) {
    hxLogger.error(MODULE, `${failed.length} workers failed to close cleanly`);
  }

  hxLogger.info(MODULE, 'all workers stopped — exiting');
  process.exit(failed.length ? 1 : 0);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT',  () => shutdown('SIGINT'));

// ── Unhandled rejection guard ─────────────────────────────────────────────────

process.on('unhandledRejection', (reason) => {
  hxLogger.error(MODULE, 'unhandledRejection', {
    reason: reason instanceof Error ? reason.message : String(reason),
  });
});

process.on('uncaughtException', (err) => {
  hxLogger.error(MODULE, 'uncaughtException — forcing exit', { err: err.message });
  process.exit(1);
});
