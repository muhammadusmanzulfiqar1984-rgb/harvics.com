#!/usr/bin/env bash
# Production entry: Hx API + lean workers + optional enrich + Kafka consumer
set -euo pipefail
cd "$(dirname "$0")/.."

export KAFKAJS_NO_PARTITIONER_WARNING="${KAFKAJS_NO_PARTITIONER_WARNING:-1}"

echo "[hx] starting API on :${HX_API_PORT:-3001}"
node --import tsx apps/api/server.ts &
API_PID=$!

echo "[hx] starting lean workers (sequence + reply-classifier)"
node --import tsx -e "
import './apps/workers/hx-sequence.worker.ts';
import './apps/workers/hx-reply-classifier.worker.ts';
console.log('[hx] lean workers ready');
" &
WORKER_PID=$!

ENRICH_PID=""
if [ -n "${APOLLO_API_KEY:-}" ] || [ -n "${HX_APOLLO_API_KEY:-}" ]; then
  export APOLLO_API_KEY="${APOLLO_API_KEY:-${HX_APOLLO_API_KEY:-}}"
  echo "[hx] starting enrich workers (apollo + email-verify)"
  node --import tsx -e "
import './apps/workers/hx-apollo-enrich.worker.ts';
import './apps/workers/hx-email-verify.worker.ts';
console.log('[hx] enrich workers ready');
" &
  ENRICH_PID=$!
else
  echo "[hx] APOLLO_API_KEY missing — enrich workers skipped"
fi

LUSHA_PID=""
if [ -n "${LUSHA_API_KEY:-}" ] || [ -n "${HX_LUSHA_API_KEY:-}" ]; then
  export LUSHA_API_KEY="${LUSHA_API_KEY:-${HX_LUSHA_API_KEY:-}}"
  echo "[hx] starting lusha reveal worker"
  node --import tsx apps/workers/hx-lusha-reveal.worker.ts &
  LUSHA_PID=$!
fi

KAFKA_PID=""
if [ -n "${KAFKA_BOOTSTRAP_SERVER:-}" ] && [ -n "${KAFKA_API_KEY:-}" ] && [ -n "${KAFKA_API_SECRET:-}" ]; then
  echo "[hx] starting Kafka consumer (Harvics_OS)"
  node --import tsx apps/workers/hx-kafka.consumer.ts &
  KAFKA_PID=$!
else
  echo "[hx] Kafka env missing — consumer skipped"
fi

PIDS=("$API_PID" "$WORKER_PID")
[ -n "$ENRICH_PID" ] && PIDS+=("$ENRICH_PID")
[ -n "$LUSHA_PID" ] && PIDS+=("$LUSHA_PID")
[ -n "$KAFKA_PID" ] && PIDS+=("$KAFKA_PID")

term() {
  echo "[hx] shutting down…"
  kill "${PIDS[@]}" 2>/dev/null || true
  wait "${PIDS[@]}" 2>/dev/null || true
}
trap term SIGTERM SIGINT

wait "$API_PID"
EXIT=$?
kill "${PIDS[@]}" 2>/dev/null || true
exit "$EXIT"
