-- Module #72 Executive Intelligence — ExecutiveSnapshot
CREATE TABLE IF NOT EXISTS "ExecutiveSnapshot" (
  "id" TEXT NOT NULL,
  "period" TEXT NOT NULL,
  "periodType" TEXT NOT NULL DEFAULT 'weekly',
  "kpis" JSONB NOT NULL,
  "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "generatedBy" TEXT,
  CONSTRAINT "ExecutiveSnapshot_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "ExecutiveSnapshot_period_idx" ON "ExecutiveSnapshot"("period");
CREATE INDEX IF NOT EXISTS "ExecutiveSnapshot_generatedAt_idx" ON "ExecutiveSnapshot"("generatedAt");
