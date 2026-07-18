#!/usr/bin/env bash
# Start HarvyX BullMQ workers (parse, verify, ICP, Apollo, Lusha, notify, sequence, reply-classifier)
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [[ ! -f .env.hx ]]; then
  echo "Missing .env.hx — copy from .env.example and fill HX_REDIS_URL + HX_DATABASE_URL"
  exit 1
fi

set -a
source .env.hx
set +a

echo "HarvyX workers — checking Redis + Postgres..."
node scripts/hx-health-check.mjs

echo ""
echo "Starting 8 workers..."
exec node --import tsx apps/workers/index.ts
