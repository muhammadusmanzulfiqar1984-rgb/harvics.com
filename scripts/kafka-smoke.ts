/**
 * Smoke-test Confluent publish (requires KAFKA_* in .env.hx).
 *   npm run kafka:smoke
 */
import {
  publishHarvicsEvent,
  disconnectProducer,
  kafkaConfigured,
} from '../packages/lib/kafka';

async function main() {
  if (!kafkaConfigured()) {
    console.error(
      'Kafka not configured. Set KAFKA_BOOTSTRAP_SERVER, KAFKA_API_KEY, KAFKA_API_SECRET in .env.hx',
    );
    process.exit(1);
  }

  const result = await publishHarvicsEvent(
    {
      sourceModule: 'Harvics_API',
      eventType: 'system.health',
      payload: {
        check: 'kafka-smoke',
        host: process.env.KAFKA_BOOTSTRAP_SERVER,
        at: new Date().toISOString(),
      },
    },
    { required: true },
  );

  console.log(JSON.stringify(result, null, 2));
  await disconnectProducer();
  process.exit(result.ok ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
