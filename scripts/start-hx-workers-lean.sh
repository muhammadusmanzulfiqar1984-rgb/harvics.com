#!/usr/bin/env bash
# Lean HarvyX workers — outreach + replies only (avoids Redis connection limits on free tier)
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

set -a
source .env.hx
set +a

echo "Starting lean workers (sequence + reply-classifier)..."
exec node --import tsx -e "
import './apps/workers/hx-sequence.worker.ts';
import './apps/workers/hx-reply-classifier.worker.ts';
console.log('lean workers: hx-sequence, hx-reply-classifier');
"
