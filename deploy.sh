#!/bin/bash
set -euo pipefail

ENVIRONMENT="${1:-production}"
NEXT_DIST_DIR="${NEXT_DIST_DIR:-.next-prod}"

echo "🚀 Deploying Harvics (${ENVIRONMENT})..."

if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Run this from the repository root"
    exit 1
fi

echo "📦 Installing dependencies..."
npm ci

echo "🔨 Building backend + frontend..."
npm run backend:build
rm -rf "$NEXT_DIST_DIR"
NODE_ENV=production NEXT_DIST_DIR="$NEXT_DIST_DIR" npm run build

mkdir -p logs

if ! command -v pm2 >/dev/null 2>&1; then
    echo "📦 PM2 not found. Installing globally..."
    npm install -g pm2
fi

echo "♻️ Starting/reloading PM2 processes..."
pm2 startOrReload ecosystem.config.js --update-env
pm2 save

echo "✅ Deployment complete."
echo "Frontend: http://127.0.0.1:3000"
echo "Backend:  http://127.0.0.1:4000/api/health"

