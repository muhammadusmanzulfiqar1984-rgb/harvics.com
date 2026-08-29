#!/usr/bin/env bash
# Apply remaining additive SQL for complete 71-module OS (safe IF NOT EXISTS).
set -euo pipefail
cd "$(dirname "$0")/../.."
FILES=(
  prisma/manual/module56_ai_engine_additive.sql
  prisma/manual/module41_47_analytics_additive.sql
  prisma/manual/module41_71_platform_additive.sql
  prisma/manual/module_t14_additive.sql
)
for f in "${FILES[@]}"; do
  echo "=== APPLY $f ==="
  npx prisma db execute --schema prisma/schema.prisma --file "$f"
done
echo "=== ALL REMAINING SQL APPLIED ==="
