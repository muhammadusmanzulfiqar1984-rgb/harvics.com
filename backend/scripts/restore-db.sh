#!/bin/bash

# Database Restore Script
# Restores database from a backup file

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
DB_PATH="$PROJECT_ROOT/prisma/dev.db"
BACKUP_DIR="$PROJECT_ROOT/backend/backups"

# Check if backup directory exists
if [ ! -d "$BACKUP_DIR" ]; then
    echo "❌ Error: Backup directory not found at $BACKUP_DIR"
    exit 1
fi

# List available backups
echo "📋 Available backups:"
ls -lh "$BACKUP_DIR"/dev_*.db 2>/dev/null | awk '{print $9, "("$5")"}'

if [ $? -ne 0 ]; then
    echo "❌ No backups found!"
    exit 1
fi

# Get backup file (use latest if no argument provided)
if [ -z "$1" ]; then
    BACKUP_FILE=$(ls -t "$BACKUP_DIR"/dev_*.db | head -1)
    echo ""
    echo "🔄 Using latest backup: $(basename "$BACKUP_FILE")"
else
    BACKUP_FILE="$BACKUP_DIR/$1"
    if [ ! -f "$BACKUP_FILE" ]; then
        echo "❌ Error: Backup file not found: $BACKUP_FILE"
        exit 1
    fi
fi

# Confirm restoration
echo ""
read -p "⚠️  This will replace the current database. Continue? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Restore cancelled."
    exit 1
fi

# Create backup of current database before restore
if [ -f "$DB_PATH" ]; then
    CURRENT_BACKUP="$BACKUP_DIR/before_restore_$(date +%Y%m%d_%H%M%S).db"
    cp "$DB_PATH" "$CURRENT_BACKUP"
    echo "📦 Current database backed up to: $(basename "$CURRENT_BACKUP")"
fi

# Restore
echo "♻️  Restoring database..."
cp "$BACKUP_FILE" "$DB_PATH"

if [ $? -eq 0 ]; then
    echo "✅ Database restored successfully!"
    echo "   From: $(basename "$BACKUP_FILE")"
    echo ""
    echo "💡 Tip: Restart your backend server to use the restored database."
else
    echo "❌ Restore failed!"
    if [ -f "$CURRENT_BACKUP" ]; then
        echo "🔄 Rolling back..."
        cp "$CURRENT_BACKUP" "$DB_PATH"
    fi
    exit 1
fi
