-- Module #72 Executive Intelligence — ExecutiveGoal
CREATE TABLE IF NOT EXISTS "ExecutiveGoal" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "metric" TEXT NOT NULL,
  "targetValue" DOUBLE PRECISION NOT NULL,
  "currentValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "unit" TEXT NOT NULL DEFAULT 'USD',
  "period" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'active',
  "ownerId" TEXT,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ExecutiveGoal_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "ExecutiveGoal_period_idx" ON "ExecutiveGoal"("period");
CREATE INDEX IF NOT EXISTS "ExecutiveGoal_status_idx" ON "ExecutiveGoal"("status");
