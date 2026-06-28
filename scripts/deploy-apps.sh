#!/bin/bash
# Deploy 4 Harvics apps to Cloudflare Pages
# Requires CLOUDFLARE_API_TOKEN with Pages:Edit permission
# Run: bash scripts/deploy-apps.sh

set -e
source .env.local 2>/dev/null || true

echo "=== Deploying Harvics Apps to Cloudflare Pages ==="
echo ""

# 1. Vatify OS (static frontend only — backend needs Workers separately)
echo "▶ Deploying Vatify OS..."
cd vatify-os
npm run build 2>/dev/null
npx wrangler pages deploy dist --project-name=vatify-os --branch=main
cd ..
echo "✓ Vatify OS deployed"
echo ""

# 2. Harvics Event OS
echo "▶ Deploying Harvics Event OS..."
cd harvics-event-os
npm run build 2>/dev/null
npx wrangler pages deploy dist --project-name=harvics-event-os --branch=main
cd ..
echo "✓ Harvics Event OS deployed"
echo ""

# 3. Harvics OS
echo "▶ Deploying Harvics OS..."
cd harvics-os
npm run build 2>/dev/null
npx wrangler pages deploy dist --project-name=harvics-os --branch=main
cd ..
echo "✓ Harvics OS deployed"
echo ""

# 4. Harvoice (static public/ folder — Express backend needs Workers)
echo "▶ Deploying Harvoice..."
npx wrangler pages deploy Harvioce/public --project-name=harvoice --branch=main
echo "✓ Harvoice deployed"
echo ""

echo "=== All apps deployed ==="
echo ""
echo "Next steps:"
echo "  1. Add custom domains in Cloudflare Dashboard:"
echo "     - vatify-os.pages.dev → vatify.harvicsglobal.com"
echo "     - harvics-event-os.pages.dev → events.harvicsglobal.com"
echo "     - harvics-os.pages.dev → os-app.harvicsglobal.com"
echo "     - harvoice.pages.dev → voice.harvicsglobal.com"
echo ""
echo "  2. For apps with backends (Vatify, Harvoice):"
echo "     Deploy server-side as Cloudflare Workers with secrets:"
echo "     wrangler secret put GROQ_API_KEY --name vatify-os-api"
echo ""
