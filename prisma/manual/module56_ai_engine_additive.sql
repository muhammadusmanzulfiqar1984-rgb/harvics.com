-- Module #56 AI Engine — model registry
-- CREATE TABLE IF NOT EXISTS for Prisma AiModel. Safe to re-run.

CREATE TABLE IF NOT EXISTS "AiModel" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'Active',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AiModel_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "AiModel_provider_idx" ON "AiModel"("provider");
CREATE INDEX IF NOT EXISTS "AiModel_status_idx" ON "AiModel"("status");
CREATE INDEX IF NOT EXISTS "AiModel_name_idx" ON "AiModel"("name");
