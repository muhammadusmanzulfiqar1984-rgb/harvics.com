-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "customer" TEXT NOT NULL,
    "city" TEXT,
    "channel" TEXT,
    "amount" REAL NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" TEXT NOT NULL DEFAULT 'Pending',
    "shippingAddress" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "OrderItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderId" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "qty" INTEGER NOT NULL,
    "unitPrice" REAL NOT NULL DEFAULT 0,
    CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "InventoryItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sku" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT,
    "onHand" INTEGER NOT NULL DEFAULT 0,
    "minStock" INTEGER NOT NULL DEFAULT 0,
    "warehouse" TEXT,
    "unitCost" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "segment" TEXT,
    "country" TEXT,
    "city" TEXT,
    "creditRating" TEXT,
    "lifetimeValue" REAL NOT NULL DEFAULT 0,
    "contactEmail" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "company" TEXT NOT NULL,
    "contact" TEXT,
    "email" TEXT,
    "stage" TEXT NOT NULL DEFAULT 'Lead',
    "value" REAL NOT NULL DEFAULT 0,
    "source" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Campaign" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Active',
    "budget" REAL NOT NULL DEFAULT 0,
    "spent" REAL NOT NULL DEFAULT 0,
    "leads" INTEGER NOT NULL DEFAULT 0,
    "conversions" INTEGER NOT NULL DEFAULT 0,
    "startDate" TEXT,
    "endDate" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Employee" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "department" TEXT,
    "position" TEXT,
    "country" TEXT,
    "city" TEXT,
    "salary" REAL NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" TEXT NOT NULL DEFAULT 'Active',
    "joinDate" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Payroll" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "period" TEXT NOT NULL,
    "totalAmount" REAL NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "employeeCount" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'Pending',
    "processedDate" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Invoice" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "invoiceNo" TEXT NOT NULL,
    "customerId" TEXT,
    "customer" TEXT,
    "amount" REAL NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" TEXT NOT NULL DEFAULT 'Unpaid',
    "dueDate" TEXT,
    "type" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "invoiceNo" TEXT NOT NULL,
    "amount" REAL NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "method" TEXT,
    "reference" TEXT,
    "receivedDate" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Payment_invoiceNo_fkey" FOREIGN KEY ("invoiceNo") REFERENCES "Invoice" ("invoiceNo") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "JournalEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "entryNo" TEXT NOT NULL,
    "description" TEXT,
    "debit" TEXT,
    "credit" TEXT,
    "amount" REAL NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "postedDate" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Route" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "routeId" TEXT NOT NULL,
    "origin" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "driver" TEXT,
    "vehicle" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Pending',
    "eta" TEXT,
    "distance" REAL,
    "orderId" TEXT,
    "delayReason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "PurchaseOrder" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "poNumber" TEXT NOT NULL,
    "supplier" TEXT NOT NULL,
    "total" REAL NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" TEXT NOT NULL DEFAULT 'Pending',
    "expectedDate" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "PurchaseItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "purchaseOrderId" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "qty" INTEGER NOT NULL,
    "unitPrice" REAL NOT NULL DEFAULT 0,
    CONSTRAINT "PurchaseItem_purchaseOrderId_fkey" FOREIGN KEY ("purchaseOrderId") REFERENCES "PurchaseOrder" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Approval" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "referenceId" TEXT NOT NULL,
    "description" TEXT,
    "amount" REAL NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "requestedBy" TEXT,
    "tier" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Pending',
    "requiredRole" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "GPSRetailer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "outletName" TEXT NOT NULL,
    "city" TEXT,
    "outletType" TEXT,
    "lat" REAL,
    "lng" REAL,
    "countryCode" TEXT,
    "monthlySales" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Satellite" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "region" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "opportunity" TEXT,
    "coverageScore" REAL NOT NULL DEFAULT 0,
    "detectedAt" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "TerritoryAssignment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "territoryCode" TEXT NOT NULL,
    "assignedTo" TEXT NOT NULL,
    "region" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Active',
    "retailers" INTEGER NOT NULL DEFAULT 0,
    "coverage" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE INDEX "Order_status_idx" ON "Order"("status");

-- CreateIndex
CREATE INDEX "Order_customer_idx" ON "Order"("customer");

-- CreateIndex
CREATE INDEX "OrderItem_orderId_idx" ON "OrderItem"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "InventoryItem_sku_key" ON "InventoryItem"("sku");

-- CreateIndex
CREATE INDEX "InventoryItem_category_idx" ON "InventoryItem"("category");

-- CreateIndex
CREATE INDEX "InventoryItem_warehouse_idx" ON "InventoryItem"("warehouse");

-- CreateIndex
CREATE INDEX "Customer_segment_idx" ON "Customer"("segment");

-- CreateIndex
CREATE INDEX "Customer_country_idx" ON "Customer"("country");

-- CreateIndex
CREATE INDEX "Lead_stage_idx" ON "Lead"("stage");

-- CreateIndex
CREATE INDEX "Employee_department_idx" ON "Employee"("department");

-- CreateIndex
CREATE INDEX "Employee_country_idx" ON "Employee"("country");

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_invoiceNo_key" ON "Invoice"("invoiceNo");

-- CreateIndex
CREATE INDEX "Invoice_status_idx" ON "Invoice"("status");

-- CreateIndex
CREATE INDEX "Payment_invoiceNo_idx" ON "Payment"("invoiceNo");

-- CreateIndex
CREATE UNIQUE INDEX "JournalEntry_entryNo_key" ON "JournalEntry"("entryNo");

-- CreateIndex
CREATE UNIQUE INDEX "Route_routeId_key" ON "Route"("routeId");

-- CreateIndex
CREATE INDEX "Route_status_idx" ON "Route"("status");

-- CreateIndex
CREATE UNIQUE INDEX "PurchaseOrder_poNumber_key" ON "PurchaseOrder"("poNumber");

-- CreateIndex
CREATE INDEX "PurchaseItem_purchaseOrderId_idx" ON "PurchaseItem"("purchaseOrderId");

-- CreateIndex
CREATE INDEX "GPSRetailer_countryCode_idx" ON "GPSRetailer"("countryCode");

-- CreateIndex
CREATE UNIQUE INDEX "TerritoryAssignment_territoryCode_key" ON "TerritoryAssignment"("territoryCode");
