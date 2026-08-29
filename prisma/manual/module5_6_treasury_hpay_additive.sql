-- Module #5 Treasury + #6 HPay — additive (safe to re-run)
-- Matches prisma/schema.prisma BankAccount / BankTransaction / PaymentRun*

CREATE TABLE IF NOT EXISTS "BankAccount" (
    "id" TEXT NOT NULL,
    "accountNo" TEXT NOT NULL,
    "bankName" TEXT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "balance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "accountType" TEXT NOT NULL DEFAULT 'Operating',
    "country" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BankAccount_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "BankAccount_accountNo_key" ON "BankAccount"("accountNo");

CREATE TABLE IF NOT EXISTS "BankTransaction" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "reference" TEXT,
    "description" TEXT,
    "postedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BankTransaction_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "BankTransaction_accountId_idx" ON "BankTransaction"("accountId");
CREATE INDEX IF NOT EXISTS "BankTransaction_postedAt_idx" ON "BankTransaction"("postedAt");

DO $$ BEGIN
  ALTER TABLE "BankTransaction"
    ADD CONSTRAINT "BankTransaction_accountId_fkey"
    FOREIGN KEY ("accountId") REFERENCES "BankAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "PaymentRun" (
    "id" TEXT NOT NULL,
    "runNo" TEXT NOT NULL,
    "description" TEXT,
    "totalAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "itemCount" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'Draft',
    "releasedAt" TIMESTAMP(3),
    "releasedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PaymentRun_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "PaymentRun_runNo_key" ON "PaymentRun"("runNo");
CREATE INDEX IF NOT EXISTS "PaymentRun_status_idx" ON "PaymentRun"("status");

CREATE TABLE IF NOT EXISTS "PaymentRunItem" (
    "id" TEXT NOT NULL,
    "runId" TEXT NOT NULL,
    "payeeName" TEXT NOT NULL,
    "payeeAccount" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "invoiceRef" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Pending',
    CONSTRAINT "PaymentRunItem_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "PaymentRunItem_runId_idx" ON "PaymentRunItem"("runId");

DO $$ BEGIN
  ALTER TABLE "PaymentRunItem"
    ADD CONSTRAINT "PaymentRunItem_runId_fkey"
    FOREIGN KEY ("runId") REFERENCES "PaymentRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
