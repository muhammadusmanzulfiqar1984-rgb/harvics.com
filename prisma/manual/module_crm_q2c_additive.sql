-- CRM quote-to-cash completion: PriceList, SalesOrder, CreditLimit
-- CrmContact already exists from module8_crm_additive.sql

CREATE TABLE IF NOT EXISTS "PriceList" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'USD',
  "type" TEXT NOT NULL DEFAULT 'STANDARD',
  "validFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "validTo" TIMESTAMP(3),
  "isDefault" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "PriceList_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "PriceList_isDefault_idx" ON "PriceList"("isDefault");
CREATE INDEX IF NOT EXISTS "PriceList_type_idx" ON "PriceList"("type");

CREATE TABLE IF NOT EXISTS "PriceListEntry" (
  "id" TEXT NOT NULL,
  "priceListId" TEXT NOT NULL,
  "sku" TEXT NOT NULL,
  "minQty" DOUBLE PRECISION NOT NULL DEFAULT 1,
  "unitPrice" DOUBLE PRECISION NOT NULL,
  "discount" DOUBLE PRECISION NOT NULL DEFAULT 0,
  CONSTRAINT "PriceListEntry_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "PriceListEntry_priceListId_idx" ON "PriceListEntry"("priceListId");
CREATE INDEX IF NOT EXISTS "PriceListEntry_sku_idx" ON "PriceListEntry"("sku");

DO $$ BEGIN
  ALTER TABLE "PriceListEntry" ADD CONSTRAINT "PriceListEntry_priceListId_fkey"
    FOREIGN KEY ("priceListId") REFERENCES "PriceList"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "SalesOrder" (
  "id" TEXT NOT NULL,
  "orderNumber" TEXT NOT NULL,
  "quoteId" TEXT,
  "customerId" TEXT,
  "customerName" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'DRAFT',
  "orderDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "currency" TEXT NOT NULL DEFAULT 'USD',
  "subtotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "discountAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "taxAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "totalAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "paymentTerms" TEXT,
  "idempotencyKey" TEXT,
  "invoiceId" TEXT,
  "notes" TEXT,
  "createdBy" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "SalesOrder_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "SalesOrder_orderNumber_key" ON "SalesOrder"("orderNumber");
CREATE UNIQUE INDEX IF NOT EXISTS "SalesOrder_idempotencyKey_key" ON "SalesOrder"("idempotencyKey");
CREATE INDEX IF NOT EXISTS "SalesOrder_status_idx" ON "SalesOrder"("status");
CREATE INDEX IF NOT EXISTS "SalesOrder_quoteId_idx" ON "SalesOrder"("quoteId");
CREATE INDEX IF NOT EXISTS "SalesOrder_customerId_idx" ON "SalesOrder"("customerId");

CREATE TABLE IF NOT EXISTS "SalesOrderLine" (
  "id" TEXT NOT NULL,
  "orderId" TEXT NOT NULL,
  "lineNumber" INTEGER NOT NULL,
  "sku" TEXT NOT NULL,
  "description" TEXT,
  "quantity" DOUBLE PRECISION NOT NULL,
  "uom" TEXT NOT NULL DEFAULT 'EA',
  "unitPrice" DOUBLE PRECISION NOT NULL,
  "discount" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "taxAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "lineTotal" DOUBLE PRECISION NOT NULL,
  CONSTRAINT "SalesOrderLine_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "SalesOrderLine_orderId_idx" ON "SalesOrderLine"("orderId");

DO $$ BEGIN
  ALTER TABLE "SalesOrderLine" ADD CONSTRAINT "SalesOrderLine_orderId_fkey"
    FOREIGN KEY ("orderId") REFERENCES "SalesOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "CreditLimit" (
  "id" TEXT NOT NULL,
  "customerId" TEXT NOT NULL,
  "approvedLimit" DOUBLE PRECISION NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'USD',
  "usedAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "availableAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "basis" TEXT,
  "reviewDate" TIMESTAMP(3),
  "approvedBy" TEXT,
  "approvedAt" TIMESTAMP(3),
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CreditLimit_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "CreditLimit_customerId_key" ON "CreditLimit"("customerId");

-- Quote tax fields (Tax Engine block-if-missing)
ALTER TABLE "Quote" ADD COLUMN IF NOT EXISTS "taxCountry" TEXT;
ALTER TABLE "Quote" ADD COLUMN IF NOT EXISTS "taxType" TEXT;
ALTER TABLE "Quote" ADD COLUMN IF NOT EXISTS "taxRatePercent" DOUBLE PRECISION;
ALTER TABLE "Quote" ADD COLUMN IF NOT EXISTS "taxAmount" DOUBLE PRECISION NOT NULL DEFAULT 0;
