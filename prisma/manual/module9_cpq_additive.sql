-- Module #9 CPQ — Quote / QuoteLine (IF NOT EXISTS)

CREATE TABLE IF NOT EXISTS "Quote" (
  "id" TEXT NOT NULL,
  "quoteNo" TEXT NOT NULL,
  "customerName" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'Draft',
  "validUntil" TIMESTAMP(3),
  "subtotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "discount" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "total" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "currency" TEXT NOT NULL DEFAULT 'USD',
  "notes" TEXT,
  "createdBy" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Quote_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "Quote_quoteNo_key" ON "Quote"("quoteNo");
CREATE INDEX IF NOT EXISTS "Quote_status_idx" ON "Quote"("status");

CREATE TABLE IF NOT EXISTS "QuoteLine" (
  "id" TEXT NOT NULL,
  "quoteId" TEXT NOT NULL,
  "sku" TEXT NOT NULL,
  "description" TEXT,
  "qty" DOUBLE PRECISION NOT NULL,
  "unitPrice" DOUBLE PRECISION NOT NULL,
  "discount" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "lineTotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
  CONSTRAINT "QuoteLine_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "QuoteLine_quoteId_idx" ON "QuoteLine"("quoteId");

DO $$ BEGIN
  ALTER TABLE "QuoteLine" ADD CONSTRAINT "QuoteLine_quoteId_fkey"
    FOREIGN KEY ("quoteId") REFERENCES "Quote"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
