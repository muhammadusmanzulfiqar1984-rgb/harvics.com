-- T14 commercial / GRC tables (DealDesk, Commission, SalesForecast, OKR, Incident)
-- Additive only — safe to re-run.

CREATE TABLE IF NOT EXISTS "DealDesk" (
  "id" TEXT NOT NULL,
  "dealName" TEXT NOT NULL,
  "customerId" TEXT,
  "opportunityValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "requestedDiscount" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "requiredMargin" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "approvedDiscount" DOUBLE PRECISION,
  "currency" TEXT NOT NULL DEFAULT 'USD',
  "submittedBy" TEXT,
  "status" TEXT NOT NULL DEFAULT 'Pending',
  "decisionDate" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "DealDesk_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "DealDesk_status_idx" ON "DealDesk"("status");
CREATE INDEX IF NOT EXISTS "DealDesk_customerId_idx" ON "DealDesk"("customerId");

CREATE TABLE IF NOT EXISTS "Commission" (
  "id" TEXT NOT NULL,
  "employeeId" TEXT NOT NULL,
  "employeeName" TEXT,
  "period" TEXT NOT NULL,
  "baseRevenue" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "commissionRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "commissionAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "currency" TEXT NOT NULL DEFAULT 'USD',
  "status" TEXT NOT NULL DEFAULT 'Calculated',
  "paidDate" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Commission_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "Commission_employeeId_idx" ON "Commission"("employeeId");
CREATE INDEX IF NOT EXISTS "Commission_period_idx" ON "Commission"("period");
CREATE INDEX IF NOT EXISTS "Commission_status_idx" ON "Commission"("status");

CREATE TABLE IF NOT EXISTS "SalesForecast" (
  "id" TEXT NOT NULL,
  "forecastPeriod" TEXT NOT NULL,
  "ownerId" TEXT NOT NULL,
  "ownerTerritory" TEXT,
  "bestCase" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "baseCase" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "worstCase" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "currency" TEXT NOT NULL DEFAULT 'USD',
  "confidence" INTEGER NOT NULL DEFAULT 0,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "SalesForecast_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "SalesForecast_forecastPeriod_idx" ON "SalesForecast"("forecastPeriod");
CREATE INDEX IF NOT EXISTS "SalesForecast_ownerId_idx" ON "SalesForecast"("ownerId");

CREATE TABLE IF NOT EXISTS "OKR" (
  "id" TEXT NOT NULL,
  "objective" TEXT NOT NULL,
  "owner" TEXT NOT NULL,
  "progress" INTEGER NOT NULL DEFAULT 0,
  "keyResults" INTEGER NOT NULL DEFAULT 0,
  "completed" INTEGER NOT NULL DEFAULT 0,
  "period" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'On Track',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "OKR_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "OKR_period_idx" ON "OKR"("period");
CREATE INDEX IF NOT EXISTS "OKR_status_idx" ON "OKR"("status");

CREATE TABLE IF NOT EXISTS "Incident" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "severity" TEXT NOT NULL DEFAULT 'Medium',
  "reportedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "status" TEXT NOT NULL DEFAULT 'Open',
  "resolution" TEXT,
  "resolvedDate" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Incident_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "Incident_status_idx" ON "Incident"("status");
CREATE INDEX IF NOT EXISTS "Incident_severity_idx" ON "Incident"("severity");
