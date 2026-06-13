#!/usr/bin/env bash
# Backup public assets to a timestamped folder in the backups directory.

set -euo pipefail

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="backups/assets_${TIMESTAMP}"

echo "🔧 Creating backup directory: ${BACKUP_DIR}"
mkdir -p "${BACKUP_DIR}"

echo "📂 Copying assets..."
rsync -av --delete public/assets/ "${BACKUP_DIR}/"

echo "✅ Backup completed successfully."