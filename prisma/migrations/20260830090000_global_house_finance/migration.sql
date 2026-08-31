-- Global House / Oracle Finance parity — PostgreSQL schema
-- Replaces JSON file stores under data/ for production persistence.

-- Extend core finance tables
ALTER TABLE "Invoice" ADD COLUMN IF NOT EXISTS "legalEntityCode" TEXT;
ALTER TABLE "Invoice" ADD COLUMN IF NOT EXISTS "shipToCountry" TEXT;
CREATE INDEX IF NOT EXISTS "Invoice_legalEntityCode_idx" ON "Invoice"("legalEntityCode");

ALTER TABLE "JournalEntry" ADD COLUMN IF NOT EXISTS "entityCode" TEXT;
CREATE INDEX IF NOT EXISTS "JournalEntry_entityCode_idx" ON "JournalEntry"("entityCode");

-- Global House group
CREATE TABLE IF NOT EXISTS "GlobalHouseGroup" (
    "id" TEXT NOT NULL,
    "groupCode" TEXT NOT NULL,
    "groupName" TEXT NOT NULL,
    "reportingCurrency" TEXT NOT NULL DEFAULT 'USD',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "GlobalHouseGroup_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "GlobalHouseGroup_groupCode_key" ON "GlobalHouseGroup"("groupCode");

-- Legal entities
CREATE TABLE IF NOT EXISTS "FhLegalEntity" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "legalName" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "parentCode" TEXT,
    "country" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "city" TEXT,
    "address" TEXT,
    "functionalCurrency" TEXT NOT NULL DEFAULT 'USD',
    "reportingCurrency" TEXT NOT NULL DEFAULT 'USD',
    "taxId" TEXT,
    "vatNumber" TEXT,
    "consolidationMethod" TEXT NOT NULL DEFAULT 'FULL',
    "ownershipPercent" DOUBLE PRECISION NOT NULL DEFAULT 100,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "roles" JSONB NOT NULL DEFAULT '[]',
    "corridors" JSONB,
    "groupCode" TEXT NOT NULL DEFAULT 'HGH',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "FhLegalEntity_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "FhLegalEntity_code_key" ON "FhLegalEntity"("code");
CREATE INDEX IF NOT EXISTS "FhLegalEntity_country_idx" ON "FhLegalEntity"("country");
CREATE INDEX IF NOT EXISTS "FhLegalEntity_parentCode_idx" ON "FhLegalEntity"("parentCode");
CREATE INDEX IF NOT EXISTS "FhLegalEntity_active_idx" ON "FhLegalEntity"("active");
CREATE INDEX IF NOT EXISTS "FhLegalEntity_groupCode_idx" ON "FhLegalEntity"("groupCode");

CREATE TABLE IF NOT EXISTS "FhOperatingUnit" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "entityCode" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "FhOperatingUnit_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "FhOperatingUnit_code_key" ON "FhOperatingUnit"("code");
CREATE INDEX IF NOT EXISTS "FhOperatingUnit_entityCode_idx" ON "FhOperatingUnit"("entityCode");

CREATE TABLE IF NOT EXISTS "FhTradeCorridor" (
    "id" TEXT NOT NULL,
    "fromCode" TEXT NOT NULL,
    "toCode" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "modes" JSONB NOT NULL DEFAULT '[]',
    "incoterms" JSONB NOT NULL DEFAULT '[]',
    "primary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "FhTradeCorridor_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "FhTradeCorridor_fromCode_idx" ON "FhTradeCorridor"("fromCode");
CREATE INDEX IF NOT EXISTS "FhTradeCorridor_toCode_idx" ON "FhTradeCorridor"("toCode");

CREATE TABLE IF NOT EXISTS "FhEliminationRule" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "debitAccount" TEXT NOT NULL,
    "creditAccount" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "FhEliminationRule_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "FhEliminationRule_code_key" ON "FhEliminationRule"("code");

CREATE TABLE IF NOT EXISTS "JournalEntityTag" (
    "id" TEXT NOT NULL,
    "entryNo" TEXT NOT NULL,
    "entityCode" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "JournalEntityTag_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "JournalEntityTag_entryNo_key" ON "JournalEntityTag"("entryNo");
CREATE INDEX IF NOT EXISTS "JournalEntityTag_entityCode_idx" ON "JournalEntityTag"("entityCode");

CREATE TABLE IF NOT EXISTS "FhIntercompanyTransaction" (
    "id" TEXT NOT NULL,
    "txnNo" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "fromEntityCode" TEXT NOT NULL,
    "toEntityCode" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "sellerJournalEntryNo" TEXT,
    "buyerJournalEntryNo" TEXT,
    "reference" TEXT,
    "postedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "FhIntercompanyTransaction_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "FhIntercompanyTransaction_txnNo_key" ON "FhIntercompanyTransaction"("txnNo");
CREATE INDEX IF NOT EXISTS "FhIntercompanyTransaction_fromEntityCode_idx" ON "FhIntercompanyTransaction"("fromEntityCode");
CREATE INDEX IF NOT EXISTS "FhIntercompanyTransaction_toEntityCode_idx" ON "FhIntercompanyTransaction"("toEntityCode");
CREATE INDEX IF NOT EXISTS "FhIntercompanyTransaction_status_idx" ON "FhIntercompanyTransaction"("status");

CREATE TABLE IF NOT EXISTS "FhTaxNexusRegistration" (
    "id" TEXT NOT NULL,
    "entityCode" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "region" TEXT,
    "nexusType" TEXT NOT NULL,
    "taxType" TEXT NOT NULL,
    "registrationNumber" TEXT,
    "effectiveFrom" TEXT NOT NULL,
    "thresholdAmount" DOUBLE PRECISION,
    "thresholdTransactions" INTEGER,
    "ytdSales" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "ytdTransactions" INTEGER NOT NULL DEFAULT 0,
    "defaultTaxCode" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "FhTaxNexusRegistration_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "FhTaxNexusRegistration_entityCode_idx" ON "FhTaxNexusRegistration"("entityCode");
CREATE INDEX IF NOT EXISTS "FhTaxNexusRegistration_country_idx" ON "FhTaxNexusRegistration"("country");
CREATE INDEX IF NOT EXISTS "FhTaxNexusRegistration_active_idx" ON "FhTaxNexusRegistration"("active");

CREATE TABLE IF NOT EXISTS "FhTaxJurisdictionRule" (
    "id" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "taxType" TEXT NOT NULL,
    "defaultRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "originBased" BOOLEAN NOT NULL DEFAULT false,
    "exportZeroRated" BOOLEAN NOT NULL DEFAULT false,
    "requiresRegion" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "FhTaxJurisdictionRule_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "FhTaxJurisdictionRule_country_key" ON "FhTaxJurisdictionRule"("country");

CREATE TABLE IF NOT EXISTS "FhRevenueContract" (
    "id" TEXT NOT NULL,
    "contractNo" TEXT NOT NULL,
    "invoiceId" TEXT,
    "invoiceNo" TEXT,
    "salesOrderId" TEXT,
    "customerName" TEXT NOT NULL,
    "entityCode" TEXT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "transactionPrice" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "obligations" JSONB NOT NULL DEFAULT '[]',
    "schedule" JSONB NOT NULL DEFAULT '[]',
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "FhRevenueContract_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "FhRevenueContract_contractNo_key" ON "FhRevenueContract"("contractNo");
CREATE INDEX IF NOT EXISTS "FhRevenueContract_entityCode_idx" ON "FhRevenueContract"("entityCode");
CREATE INDEX IF NOT EXISTS "FhRevenueContract_status_idx" ON "FhRevenueContract"("status");
CREATE INDEX IF NOT EXISTS "FhRevenueContract_invoiceId_idx" ON "FhRevenueContract"("invoiceId");

CREATE TABLE IF NOT EXISTS "FhConsolidationRun" (
    "id" TEXT NOT NULL,
    "runNo" TEXT NOT NULL,
    "periodCode" TEXT,
    "postedAt" TIMESTAMP(3) NOT NULL,
    "dryRun" BOOLEAN NOT NULL DEFAULT false,
    "lines" JSONB NOT NULL DEFAULT '[]',
    "journals" JSONB NOT NULL DEFAULT '[]',
    "totalAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FhConsolidationRun_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "FhConsolidationRun_runNo_key" ON "FhConsolidationRun"("runNo");
CREATE INDEX IF NOT EXISTS "FhConsolidationRun_periodCode_idx" ON "FhConsolidationRun"("periodCode");
CREATE INDEX IF NOT EXISTS "FhConsolidationRun_status_idx" ON "FhConsolidationRun"("status");
CREATE INDEX IF NOT EXISTS "FhConsolidationRun_postedAt_idx" ON "FhConsolidationRun"("postedAt");

CREATE TABLE IF NOT EXISTS "ArCustomerMaster" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "legalName" TEXT,
    "billToLine1" TEXT,
    "billToLine2" TEXT,
    "city" TEXT,
    "country" TEXT,
    "postalCode" TEXT,
    "vatNumber" TEXT,
    "taxId" TEXT,
    "contactEmail" TEXT,
    "contactPhone" TEXT,
    "paymentTerms" TEXT NOT NULL DEFAULT 'Net 30',
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "creditLimit" DOUBLE PRECISION NOT NULL DEFAULT 100000,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ArCustomerMaster_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "ArCustomerMaster_code_key" ON "ArCustomerMaster"("code");
CREATE INDEX IF NOT EXISTS "ArCustomerMaster_country_idx" ON "ArCustomerMaster"("country");
CREATE INDEX IF NOT EXISTS "ArCustomerMaster_active_idx" ON "ArCustomerMaster"("active");

CREATE TABLE IF NOT EXISTS "ArTaxCode" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "rate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "country" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ArTaxCode_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "ArTaxCode_code_key" ON "ArTaxCode"("code");
CREATE INDEX IF NOT EXISTS "ArTaxCode_country_idx" ON "ArTaxCode"("country");
CREATE INDEX IF NOT EXISTS "ArTaxCode_active_idx" ON "ArTaxCode"("active");

CREATE TABLE IF NOT EXISTS "ArCatalogItem" (
    "id" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "uom" TEXT NOT NULL DEFAULT 'EA',
    "unitPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "taxPercent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "hsCode" TEXT,
    "taxCode" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ArCatalogItem_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "ArCatalogItem_sku_key" ON "ArCatalogItem"("sku");
CREATE INDEX IF NOT EXISTS "ArCatalogItem_active_idx" ON "ArCatalogItem"("active");

-- Foreign keys (idempotent)
DO $$ BEGIN
  ALTER TABLE "FhOperatingUnit" ADD CONSTRAINT "FhOperatingUnit_entityCode_fkey"
    FOREIGN KEY ("entityCode") REFERENCES "FhLegalEntity"("code") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "JournalEntityTag" ADD CONSTRAINT "JournalEntityTag_entityCode_fkey"
    FOREIGN KEY ("entityCode") REFERENCES "FhLegalEntity"("code") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "JournalEntityTag" ADD CONSTRAINT "JournalEntityTag_entryNo_fkey"
    FOREIGN KEY ("entryNo") REFERENCES "JournalEntry"("entryNo") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "FhIntercompanyTransaction" ADD CONSTRAINT "FhIntercompanyTransaction_fromEntityCode_fkey"
    FOREIGN KEY ("fromEntityCode") REFERENCES "FhLegalEntity"("code") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "FhIntercompanyTransaction" ADD CONSTRAINT "FhIntercompanyTransaction_toEntityCode_fkey"
    FOREIGN KEY ("toEntityCode") REFERENCES "FhLegalEntity"("code") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "FhTaxNexusRegistration" ADD CONSTRAINT "FhTaxNexusRegistration_entityCode_fkey"
    FOREIGN KEY ("entityCode") REFERENCES "FhLegalEntity"("code") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "FhRevenueContract" ADD CONSTRAINT "FhRevenueContract_entityCode_fkey"
    FOREIGN KEY ("entityCode") REFERENCES "FhLegalEntity"("code") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
