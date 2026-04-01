#!/bin/bash

# Database Reset Script
# Drops and recreates database with fresh seed data

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

echo "⚠️  DATABASE RESET"
echo "This will:"
echo "  1. Drop all tables"
echo "  2. Run migrations"
echo "  3. Seed fresh data"
echo ""

read -p "Continue? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Reset cancelled."
    exit 1
fi

# Create backup first
echo "📦 Creating backup before reset..."
"$SCRIPT_DIR/backup-db.sh"

# Navigate to project root
cd "$PROJECT_ROOT"

# Reset database
echo ""
echo "🗑️  Dropping database..."
npx prisma migrate reset --force --skip-seed

if [ $? -ne 0 ]; then
    echo "❌ Migration reset failed!"
    exit 1
fi

# Run seed
echo ""
echo "🌱 Seeding database..."
tsx backend/src/core/seed.ts

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Database reset complete!"
    echo "💡 Tip: Restart your backend server."
else
    echo "❌ Seed failed!"
    exit 1
fi
