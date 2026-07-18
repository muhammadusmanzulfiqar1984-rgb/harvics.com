/**
 * Manually queue an outreach dispatch job for an enrollment.
 * Usage: ENROLLMENT_ID=uuid node scripts/hx-dispatch-now.mjs
 */
import { randomUUID } from 'crypto';
import { Queue } from 'bullmq';

const enrollmentId = process.env.ENROLLMENT_ID;
const redisUrl = process.env.HX_REDIS_URL;

if (!enrollmentId) {
  console.error('ENROLLMENT_ID required');
  process.exit(1);
}
if (!redisUrl) {
  console.error('HX_REDIS_URL required');
  process.exit(1);
}

const queue = new Queue('hx-outreach-dispatch', {
  connection: { url: redisUrl, maxRetriesPerRequest: null },
});

const job = {
  job_id: randomUUID(),
  job_type: 'outreach_dispatch',
  payload: { enrollment_id: enrollmentId },
  attempts: 0,
  created_at: new Date().toISOString(),
  source_module: 'hx-dispatch-now',
};

await queue.add('dispatch', job, {
  jobId: job.job_id,
  removeOnComplete: 100,
  removeOnFail: 50,
});

console.log('queued', job.job_id, 'for enrollment', enrollmentId);
await queue.close();
