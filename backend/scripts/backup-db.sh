#!/bin/bash

# Database Backup Script
# Creates a timestamped backup of the SQLite database

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
DB_PATH="$PROJECT_ROOT/prisma/dev.db"
BACKUP_DIR="$PROJECT_ROOT/backend/backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/dev_$TIMESTAMP.db"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Check if database exists
if [ ! -f "$DB_PATH" ]; then
    echo "❌ Error: Database not found at $DB_PATH"
    exit 1
fi

# Create backup
echo "📦 Backing up database..."
cp "$DB_PATH" "$BACKUP_FILE"

if [ $? -eq 0 ]; then
    SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    echo "✅ Backup created successfully!"
    echo "   File: $BACKUP_FILE"
    echo "   Size: $SIZE"
    
    # Keep only last 10 backups
    cd "$BACKUP_DIR"
    ls -t dev_*.db | tail -n +11 | xargs -r rm
    echo "🧹 Cleaned up old backups (keeping last 10)"
else
    echo "❌ Backup failed!"
    exit 1
fi
