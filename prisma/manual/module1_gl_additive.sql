-- Module #1 GL — create only missing tables (safe alongside HarvyX tables)

CREATE TABLE IF NOT EXISTS "JournalEntry" (
  "id" TEXT NOT NULL,
  "entryNo" TEXT NOT NULL,
  "description" TEXT,
  "debit" TEXT,
  "credit" TEXT,
  "amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "currency" TEXT NOT NULL DEFAULT 'USD',
  "postedDate" TEXT,
  "status" TEXT NOT NULL DEFAULT 'Posted',
  "periodCode" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "JournalEntry_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "JournalEntry_entryNo_key" ON "JournalEntry"("entryNo");
CREATE INDEX IF NOT EXISTS "JournalEntry_periodCode_idx" ON "JournalEntry"("periodCode");
CREATE INDEX IF NOT EXISTS "JournalEntry_status_idx" ON "JournalEntry"("status");
CREATE INDEX IF NOT EXISTS "JournalEntry_debit_idx" ON "JournalEntry"("debit");
CREATE INDEX IF NOT EXISTS "JournalEntry_credit_idx" ON "JournalEntry"("credit");

-- If table already existed without new columns, add them
DO $$ BEGIN
  ALTER TABLE "JournalEntry" ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'Posted';
EXCEPTION WHEN others THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE "JournalEntry" ADD COLUMN IF NOT EXISTS "periodCode" TEXT;
EXCEPTION WHEN others THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "GlAccount" (
  "id" TEXT NOT NULL,
  "accountCode" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "normalBalance" TEXT NOT NULL DEFAULT 'Debit',
  "currency" TEXT NOT NULL DEFAULT 'USD',
  "status" TEXT NOT NULL DEFAULT 'Active',
  "industryVertical" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "GlAccount_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "GlAccount_accountCode_key" ON "GlAccount"("accountCode");
CREATE INDEX IF NOT EXISTS "GlAccount_type_idx" ON "GlAccount"("type");
CREATE INDEX IF NOT EXISTS "GlAccount_status_idx" ON "GlAccount"("status");

CREATE TABLE IF NOT EXISTS "FiscalPeriod" (
  "id" TEXT NOT NULL,
  "periodCode" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "year" INTEGER NOT NULL,
  "month" INTEGER NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'Open',
  "closedBy" TEXT,
  "closedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "FiscalPeriod_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "FiscalPeriod_periodCode_key" ON "FiscalPeriod"("periodCode");
CREATE INDEX IF NOT EXISTS "FiscalPeriod_status_idx" ON "FiscalPeriod"("status");
CREATE INDEX IF NOT EXISTS "FiscalPeriod_year_month_idx" ON "FiscalPeriod"("year", "month");
