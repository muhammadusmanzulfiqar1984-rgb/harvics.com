-- Modules #13–16 Procurement band — RFQ / RFQResponse / VendorScorecard / Contract / SourcingSupplier (IF NOT EXISTS)

CREATE TABLE IF NOT EXISTS "RFQ" (
  "id" TEXT NOT NULL,
  "rfqNo" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "category" TEXT,
  "dueDate" TIMESTAMP(3),
  "status" TEXT NOT NULL DEFAULT 'Draft',
  "awardedTo" TEXT,
  "awardedAt" TIMESTAMP(3),
  "createdBy" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "RFQ_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "RFQ_rfqNo_key" ON "RFQ"("rfqNo");
CREATE INDEX IF NOT EXISTS "RFQ_status_idx" ON "RFQ"("status");

CREATE TABLE IF NOT EXISTS "RFQResponse" (
  "id" TEXT NOT NULL,
  "rfqId" TEXT NOT NULL,
  "vendorId" TEXT NOT NULL,
  "vendorName" TEXT,
  "amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "currency" TEXT NOT NULL DEFAULT 'USD',
  "leadTimeDays" INTEGER,
  "notes" TEXT,
  "status" TEXT NOT NULL DEFAULT 'Submitted',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "RFQResponse_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "RFQResponse_rfqId_idx" ON "RFQResponse"("rfqId");
CREATE INDEX IF NOT EXISTS "RFQResponse_status_idx" ON "RFQResponse"("status");

DO $$ BEGIN
  ALTER TABLE "RFQResponse" ADD CONSTRAINT "RFQResponse_rfqId_fkey"
    FOREIGN KEY ("rfqId") REFERENCES "RFQ"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "VendorScorecard" (
  "id" TEXT NOT NULL,
  "vendorId" TEXT NOT NULL,
  "vendorName" TEXT,
  "period" TEXT NOT NULL,
  "onTimePercent" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "qualityScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "priceScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "responseScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "overallScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "recommendation" TEXT NOT NULL DEFAULT 'Maintain',
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "VendorScorecard_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "VendorScorecard_vendorId_period_key" ON "VendorScorecard"("vendorId", "period");
CREATE INDEX IF NOT EXISTS "VendorScorecard_overallScore_idx" ON "VendorScorecard"("overallScore");

CREATE TABLE IF NOT EXISTS "Contract" (
  "id" TEXT NOT NULL,
  "contractNo" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "counterparty" TEXT NOT NULL,
  "type" TEXT NOT NULL DEFAULT 'MSA',
  "value" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "currency" TEXT NOT NULL DEFAULT 'USD',
  "startDate" TIMESTAMP(3) NOT NULL,
  "endDate" TIMESTAMP(3) NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'Draft',
  "signedAt" TIMESTAMP(3),
  "signedBy" TEXT,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Contract_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "Contract_contractNo_key" ON "Contract"("contractNo");
CREATE INDEX IF NOT EXISTS "Contract_status_idx" ON "Contract"("status");
CREATE INDEX IF NOT EXISTS "Contract_endDate_idx" ON "Contract"("endDate");

CREATE TABLE IF NOT EXISTS "SourcingSupplier" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "country" TEXT,
  "category" TEXT,
  "certifications" TEXT,
  "capabilities" TEXT,
  "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "qualifiedStatus" TEXT NOT NULL DEFAULT 'Discovered',
  "contactEmail" TEXT,
  "contactPhone" TEXT,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "SourcingSupplier_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "SourcingSupplier_qualifiedStatus_idx" ON "SourcingSupplier"("qualifiedStatus");
CREATE INDEX IF NOT EXISTS "SourcingSupplier_category_idx" ON "SourcingSupplier"("category");
