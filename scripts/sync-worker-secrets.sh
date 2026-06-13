#!/usr/bin/env bash
# Push .env.local secrets/vars to Cloudflare Worker "harvics-com".
# Run once: npx wrangler login
# Then:     bash scripts/sync-worker-secrets.sh

set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [[ ! -f .env.local ]]; then
  echo "Missing .env.local"
  exit 1
fi

# shellcheck disable=SC1091
set -a
source .env.local
set +a

echo "Syncing secrets to Worker harvics-com..."

SECRETS=(
  GROQ_API_KEY
  HF_API_KEY
  INTERNAL_API_KEY
  R2_ACCESS_KEY_ID
  R2_SECRET_ACCESS_KEY
  JWT_SECRET
  CLOUDFLARE_API_TOKEN
  GOOGLE_GEMINI_API_KEY
  DATABASE_URL
)

for key in "${SECRETS[@]}"; do
  val="${!key:-}"
  if [[ -n "$val" && "$val" != *"your-"* && "$val" != *"localhost"* ]]; then
    echo "  secret: $key"
    printf '%s' "$val" | npx wrangler secret put "$key"
  else
    echo "  skip:   $key (empty or placeholder)"
  fi
done

echo ""
echo "Add plain variables in Cloudflare Dashboard → Worker → Settings → Variables:"
echo "  R2_ENDPOINT_URL, NEXT_PUBLIC_CDN_URL, R2_BUCKET_NAME, GROQ_MODEL, CLOUDFLARE_ACCOUNT_ID"
echo ""
echo "Done. Redeploy: npx wrangler deploy"
