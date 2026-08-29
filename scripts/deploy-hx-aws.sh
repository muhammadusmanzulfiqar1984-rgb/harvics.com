#!/usr/bin/env bash
# Deploy lean HarvyX API to AWS EC2 (option B).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
KEY="${HX_AWS_KEY:-$HOME/Downloads/my-mac-key.pem}"
HOST="${HX_AWS_HOST:-ubuntu@3.94.120.15}"
REMOTE_DIR="/home/ubuntu/harvyx-api"

export PATH="${HOME}/.fly/bin:${PATH}"

bash "${ROOT}/scripts/pack-hx-aws.sh"
PACK="${ROOT}/scripts/.gen/hx-aws-pack"

echo "Syncing to ${HOST}:${REMOTE_DIR} ..."
ssh -i "${KEY}" -o StrictHostKeyChecking=accept-new "${HOST}" "mkdir -p ${REMOTE_DIR}"
rsync -az --delete \
  -e "ssh -i ${KEY} -o StrictHostKeyChecking=accept-new" \
  "${PACK}/" "${HOST}:${REMOTE_DIR}/"

echo "Remote setup (swap + npm + systemd + nginx)..."
ssh -i "${KEY}" "${HOST}" bash -s <<'REMOTE'
set -euo pipefail
cd /home/ubuntu/harvyx-api

# Swap if missing (box is ~900MB RAM; MySQL eats half)
if [ ! -f /swapfile ]; then
  sudo fallocate -l 2G /swapfile || sudo dd if=/dev/zero of=/swapfile bs=1M count=2048
  sudo chmod 600 /swapfile
  sudo mkswap /swapfile
  sudo swapon /swapfile
  echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab >/dev/null || true
fi

# Free RAM for install if MySQL is idle test DB
sudo systemctl stop mysql 2>/dev/null || sudo systemctl stop mysqld 2>/dev/null || true

npm install --omit=dev --no-audit --no-fund

sudo cp harvyx-api.service /etc/systemd/system/harvyx-api.service
sudo systemctl daemon-reload
sudo systemctl enable harvyx-api
sudo systemctl restart harvyx-api

sudo cp nginx-harvyx-api.conf /etc/nginx/sites-available/harvyx-api
sudo ln -sfn /etc/nginx/sites-available/harvyx-api /etc/nginx/sites-enabled/harvyx-api
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx

sleep 3
curl -sS http://127.0.0.1:3001/health || (sudo journalctl -u harvyx-api -n 40 --no-pager; exit 1)
curl -sS http://127.0.0.1/health
echo
sudo systemctl is-active harvyx-api
REMOTE

echo ""
echo "=== Public Hx API: http://3.94.120.15 ==="
echo "Smoke: curl -sS http://3.94.120.15/health"
