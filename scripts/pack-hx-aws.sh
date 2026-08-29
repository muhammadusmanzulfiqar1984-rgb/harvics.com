#!/usr/bin/env bash
# Pack a lean HarvyX API tree for AWS EC2 (low RAM).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="${ROOT}/scripts/.gen/hx-aws-pack"
rm -rf "${OUT}"
mkdir -p "${OUT}/apps" "${OUT}/packages" "${OUT}/scripts"

# Minimal package.json for Hx only
cat > "${OUT}/package.json" <<'EOF'
{
  "name": "harvyx-api-aws",
  "private": true,
  "type": "module",
  "engines": { "node": ">=20" },
  "dependencies": {
    "@aws-sdk/client-s3": "^3.700.0",
    "bullmq": "^5.80.2",
    "cors": "^2.8.5",
    "express": "^4.19.2",
    "ioredis": "^5.6.1",
    "jsonwebtoken": "^9.0.3",
    "kafkajs": "^2.2.4",
    "pg": "^8.16.3",
    "tsx": "^4.7.1"
  }
}
EOF

cat > "${OUT}/tsconfig.json" <<'EOF'
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "esModuleInterop": true,
    "strict": false,
    "skipLibCheck": true,
    "noEmit": true,
    "resolveJsonModule": true,
    "allowJs": true
  },
  "include": ["apps/**/*", "packages/**/*"]
}
EOF

rsync -a --delete \
  --exclude node_modules \
  "${ROOT}/apps/api/" "${OUT}/apps/api/"
rsync -a \
  --include 'hx-sequence.worker.ts' \
  --include 'hx-reply-classifier.worker.ts' \
  --exclude '*' \
  "${ROOT}/apps/workers/" "${OUT}/apps/workers/"
# workers folder may need full copy of those two files
mkdir -p "${OUT}/apps/workers"
cp "${ROOT}/apps/workers/hx-sequence.worker.ts" "${OUT}/apps/workers/"
cp "${ROOT}/apps/workers/hx-reply-classifier.worker.ts" "${OUT}/apps/workers/"
cp "${ROOT}/apps/workers/hx-kafka.consumer.ts" "${OUT}/apps/workers/"
# optional enrich workers (emit + writeback) — include if present
cp "${ROOT}/apps/workers/hx-apollo-enrich.worker.ts" "${OUT}/apps/workers/" 2>/dev/null || true
cp "${ROOT}/apps/workers/hx-lusha-reveal.worker.ts" "${OUT}/apps/workers/" 2>/dev/null || true
cp "${ROOT}/apps/workers/hx-email-verify.worker.ts" "${OUT}/apps/workers/" 2>/dev/null || true

mkdir -p "${OUT}/apps/cron/scrapers"
cp "${ROOT}/apps/cron/scrapers/"hx-*.scraper.ts "${OUT}/apps/cron/scrapers/" 2>/dev/null || true

rsync -a --exclude node_modules "${ROOT}/packages/db/" "${OUT}/packages/db/"
rsync -a --exclude node_modules "${ROOT}/packages/lib/" "${OUT}/packages/lib/"
rsync -a --exclude node_modules "${ROOT}/packages/types/" "${OUT}/packages/types/"

cp "${ROOT}/scripts/start-hx-production.sh" "${OUT}/scripts/"
chmod +x "${OUT}/scripts/start-hx-production.sh"

# Copy env without printing
cp "${ROOT}/.env.hx" "${OUT}/.env.hx"

# systemd unit
cat > "${OUT}/harvyx-api.service" <<'EOF'
[Unit]
Description=HarvyX Data Bank API + lean workers
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/home/ubuntu/harvyx-api
EnvironmentFile=/home/ubuntu/harvyx-api/.env.hx
Environment=NODE_ENV=production
Environment=HX_API_PORT=3001
ExecStart=/usr/bin/bash /home/ubuntu/harvyx-api/scripts/start-hx-production.sh
Restart=always
RestartSec=5
MemoryMax=650M


[Install]
WantedBy=multi-user.target
EOF

# nginx snippet
cat > "${OUT}/nginx-harvyx-api.conf" <<'EOF'
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;

    location /health {
        proxy_pass http://127.0.0.1:3001/health;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    location /api/v1/ {
        proxy_pass http://127.0.0.1:3001/api/v1/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_read_timeout 120s;
        client_max_body_size 2m;
    }

    location / {
        return 200 'harvyx-api ok — use /health or /api/v1/*\n';
        add_header Content-Type text/plain;
    }
}
EOF

echo "Packed -> ${OUT}"
du -sh "${OUT}"
