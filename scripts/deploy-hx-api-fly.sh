#!/usr/bin/env bash
# Phase 2 — deploy HarvyX API to Fly.io and print next secret steps.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
export PATH="${HOME}/.fly/bin:${PATH}"

if ! command -v flyctl >/dev/null 2>&1; then
  echo "flyctl missing — install: curl -fsSL https://fly.io/install.sh | sh"
  exit 1
fi

if ! flyctl auth whoami >/dev/null 2>&1; then
  echo "Not logged in. Run: flyctl auth login"
  echo "Then re-run: bash scripts/deploy-hx-api-fly.sh"
  exit 1
fi

APP="${HX_FLY_APP:-harvyx-api}"

if ! flyctl apps list 2>/dev/null | grep -q "${APP}"; then
  echo "Creating app ${APP}..."
  flyctl apps create "${APP}" || true
fi

echo "Setting secrets from .env.hx (values not printed)..."
# shellcheck disable=SC1091
set -a
# shellcheck disable=SC1091
source .env.hx
set +a

: "${HX_DATABASE_URL:?HX_DATABASE_URL missing in .env.hx}"
: "${HX_REDIS_URL:?HX_REDIS_URL missing in .env.hx}"
: "${HX_JWT_SECRET:?HX_JWT_SECRET missing in .env.hx}"

flyctl secrets set -a "${APP}" \
  "HX_DATABASE_URL=${HX_DATABASE_URL}" \
  "HX_REDIS_URL=${HX_REDIS_URL}" \
  "HX_JWT_SECRET=${HX_JWT_SECRET}" \
  "HX_API_PORT=3001" \
  "HX_RESEND_API_KEY=${HX_RESEND_API_KEY:-${RESEND_API_KEY:-}}" \
  "HX_RESEND_FROM=${HX_RESEND_FROM:-${FROM_EMAIL:-}}" \
  "RESEND_API_KEY=${RESEND_API_KEY:-${HX_RESEND_API_KEY:-}}" \
  "GROQ_API_KEY=${GROQ_API_KEY:-${HX_GROQ_API_KEY:-}}" \
  >/dev/null

echo "Deploying..."
flyctl deploy -a "${APP}" -c fly.hx-api.toml --dockerfile Dockerfile.hx-api

URL="https://${APP}.fly.dev"
echo ""
echo "=== Hx API URL: ${URL} ==="
echo "Smoke: curl -sS ${URL}/health"
echo ""
echo "Next — set Cloudflare Worker secrets, then wrangler deploy."
echo "Probe: curl -sS https://www.harvics.com/api/harvyx/hx/databank/summary | head"
