-- Module #2 Controlling — CostCenter / CostAllocation / CostPosting / BudgetLine (IF NOT EXISTS)

CREATE TABLE IF NOT EXISTS "CostCenter" (
  "id" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "manager" TEXT,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CostCenter_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "CostCenter_code_key" ON "CostCenter"("code");

CREATE TABLE IF NOT EXISTS "CostAllocation" (
  "id" TEXT NOT NULL,
  "period" TEXT NOT NULL,
  "fromAccount" TEXT NOT NULL,
  "toCostCenter" TEXT NOT NULL,
  "amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "currency" TEXT NOT NULL DEFAULT 'USD',
  "basis" TEXT,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CostAllocation_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "CostAllocation_period_idx" ON "CostAllocation"("period");
CREATE INDEX IF NOT EXISTS "CostAllocation_toCostCenter_idx" ON "CostAllocation"("toCostCenter");

CREATE TABLE IF NOT EXISTS "BudgetLine" (
  "id" TEXT NOT NULL,
  "period" TEXT NOT NULL,
  "account" TEXT NOT NULL,
  "costCenter" TEXT,
  "budgeted" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "scenario" TEXT NOT NULL DEFAULT 'Base',
  "status" TEXT NOT NULL DEFAULT 'Draft',
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "BudgetLine_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "BudgetLine_period_account_costCenter_scenario_key"
  ON "BudgetLine"("period", "account", "costCenter", "scenario");
CREATE INDEX IF NOT EXISTS "BudgetLine_period_idx" ON "BudgetLine"("period");

DO $$ BEGIN
  ALTER TABLE "BudgetLine" ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'Draft';
EXCEPTION WHEN others THEN NULL;
END $$;
CREATE INDEX IF NOT EXISTS "BudgetLine_status_idx" ON "BudgetLine"("status");

CREATE TABLE IF NOT EXISTS "CostPosting" (
  "id" TEXT NOT NULL,
  "costCenterId" TEXT NOT NULL,
  "period" TEXT NOT NULL,
  "account" TEXT NOT NULL,
  "amount" DOUBLE PRECISION NOT NULL,
  "description" TEXT,
  "type" TEXT NOT NULL DEFAULT 'Actual',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CostPosting_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "CostPosting_costCenterId_idx" ON "CostPosting"("costCenterId");
CREATE INDEX IF NOT EXISTS "CostPosting_period_idx" ON "CostPosting"("period");

DO $$ BEGIN
  ALTER TABLE "CostPosting" ADD CONSTRAINT "CostPosting_costCenterId_fkey"
    FOREIGN KEY ("costCenterId") REFERENCES "CostCenter"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
