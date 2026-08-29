-- Modules #17–28 Ops band (Manufacturing + Inventory + Logistics)
-- CREATE TABLE IF NOT EXISTS for Prisma models that may be missing on Neon.
-- Match prisma/schema.prisma exactly.

-- #17 Production — WorkOrder + BOMItem (WO-attached)
CREATE TABLE IF NOT EXISTS "WorkOrder" (
  "id" TEXT NOT NULL,
  "workOrderNo" TEXT NOT NULL,
  "productSku" TEXT NOT NULL,
  "qty" INTEGER NOT NULL DEFAULT 0,
  "status" TEXT NOT NULL DEFAULT 'Planned',
  "startDate" TEXT,
  "completionDate" TEXT,
  "priority" TEXT NOT NULL DEFAULT 'Normal',
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "WorkOrder_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "WorkOrder_workOrderNo_key" ON "WorkOrder"("workOrderNo");
CREATE INDEX IF NOT EXISTS "WorkOrder_status_idx" ON "WorkOrder"("status");
CREATE INDEX IF NOT EXISTS "WorkOrder_productSku_idx" ON "WorkOrder"("productSku");

CREATE TABLE IF NOT EXISTS "BOMItem" (
  "id" TEXT NOT NULL,
  "workOrderId" TEXT NOT NULL,
  "componentSku" TEXT NOT NULL,
  "qty" INTEGER NOT NULL,
  "unitCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
  CONSTRAINT "BOMItem_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "BOMItem_workOrderId_idx" ON "BOMItem"("workOrderId");

DO $$ BEGIN
  ALTER TABLE "BOMItem" ADD CONSTRAINT "BOMItem_workOrderId_fkey"
    FOREIGN KEY ("workOrderId") REFERENCES "WorkOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- #18 Shop Floor
CREATE TABLE IF NOT EXISTS "ShopFloorOp" (
  "id" TEXT NOT NULL,
  "workOrderId" TEXT,
  "operationNo" INTEGER NOT NULL,
  "workCenter" TEXT NOT NULL,
  "description" TEXT,
  "setupMins" INTEGER NOT NULL DEFAULT 0,
  "runMins" INTEGER NOT NULL DEFAULT 0,
  "qtyPlanned" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "qtyDone" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "qtyScrap" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "status" TEXT NOT NULL DEFAULT 'Queued',
  "operator" TEXT,
  "startedAt" TIMESTAMP(3),
  "completedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ShopFloorOp_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "ShopFloorOp_workOrderId_idx" ON "ShopFloorOp"("workOrderId");
CREATE INDEX IF NOT EXISTS "ShopFloorOp_status_idx" ON "ShopFloorOp"("status");

-- #19 Bill of Materials (standalone multi-level)
CREATE TABLE IF NOT EXISTS "BillOfMaterial" (
  "id" TEXT NOT NULL,
  "productSku" TEXT NOT NULL,
  "productName" TEXT NOT NULL,
  "version" TEXT NOT NULL DEFAULT 'v1',
  "uom" TEXT NOT NULL DEFAULT 'EA',
  "active" BOOLEAN NOT NULL DEFAULT true,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "BillOfMaterial_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "BillOfMaterial_productSku_key" ON "BillOfMaterial"("productSku");

CREATE TABLE IF NOT EXISTS "BOMComponent" (
  "id" TEXT NOT NULL,
  "bomId" TEXT NOT NULL,
  "componentSku" TEXT NOT NULL,
  "componentName" TEXT,
  "qtyPer" DOUBLE PRECISION NOT NULL,
  "uom" TEXT NOT NULL DEFAULT 'EA',
  "scrapPercent" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "unitCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
  CONSTRAINT "BOMComponent_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "BOMComponent_bomId_idx" ON "BOMComponent"("bomId");
CREATE INDEX IF NOT EXISTS "BOMComponent_componentSku_idx" ON "BOMComponent"("componentSku");

DO $$ BEGIN
  ALTER TABLE "BOMComponent" ADD CONSTRAINT "BOMComponent_bomId_fkey"
    FOREIGN KEY ("bomId") REFERENCES "BillOfMaterial"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- #20 Quality
CREATE TABLE IF NOT EXISTS "QualityCheck" (
  "id" TEXT NOT NULL,
  "checkNo" TEXT NOT NULL,
  "workOrderId" TEXT,
  "productSku" TEXT NOT NULL,
  "inspector" TEXT,
  "status" TEXT NOT NULL DEFAULT 'Pending',
  "defectsFound" INTEGER NOT NULL DEFAULT 0,
  "notes" TEXT,
  "inspectedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "QualityCheck_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "QualityCheck_checkNo_key" ON "QualityCheck"("checkNo");
CREATE INDEX IF NOT EXISTS "QualityCheck_status_idx" ON "QualityCheck"("status");
CREATE INDEX IF NOT EXISTS "QualityCheck_productSku_idx" ON "QualityCheck"("productSku");

CREATE TABLE IF NOT EXISTS "NonConformanceReport" (
  "id" TEXT NOT NULL,
  "ncrNo" TEXT NOT NULL,
  "qualityCheckId" TEXT,
  "severity" TEXT NOT NULL DEFAULT 'Minor',
  "description" TEXT NOT NULL,
  "rootCause" TEXT,
  "correctiveAction" TEXT,
  "status" TEXT NOT NULL DEFAULT 'Open',
  "assignedTo" TEXT,
  "closedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "NonConformanceReport_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "NonConformanceReport_ncrNo_key" ON "NonConformanceReport"("ncrNo");
CREATE INDEX IF NOT EXISTS "NonConformanceReport_status_idx" ON "NonConformanceReport"("status");
CREATE INDEX IF NOT EXISTS "NonConformanceReport_severity_idx" ON "NonConformanceReport"("severity");

-- #21 Recipes
CREATE TABLE IF NOT EXISTS "Recipe" (
  "id" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "category" TEXT,
  "baseYield" DOUBLE PRECISION NOT NULL DEFAULT 1,
  "baseUom" TEXT NOT NULL DEFAULT 'L',
  "notes" TEXT,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Recipe_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "Recipe_code_key" ON "Recipe"("code");

CREATE TABLE IF NOT EXISTS "RecipeIngredient" (
  "id" TEXT NOT NULL,
  "recipeId" TEXT NOT NULL,
  "ingredient" TEXT NOT NULL,
  "qty" DOUBLE PRECISION NOT NULL,
  "uom" TEXT NOT NULL DEFAULT 'kg',
  "unitCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "notes" TEXT,
  CONSTRAINT "RecipeIngredient_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "RecipeIngredient_recipeId_idx" ON "RecipeIngredient"("recipeId");

DO $$ BEGIN
  ALTER TABLE "RecipeIngredient" ADD CONSTRAINT "RecipeIngredient_recipeId_fkey"
    FOREIGN KEY ("recipeId") REFERENCES "Recipe"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- #22 Inventory
CREATE TABLE IF NOT EXISTS "InventoryItem" (
  "id" TEXT NOT NULL,
  "sku" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "category" TEXT,
  "onHand" INTEGER NOT NULL DEFAULT 0,
  "minStock" INTEGER NOT NULL DEFAULT 0,
  "warehouse" TEXT,
  "unitCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "InventoryItem_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "InventoryItem_sku_key" ON "InventoryItem"("sku");
CREATE INDEX IF NOT EXISTS "InventoryItem_category_idx" ON "InventoryItem"("category");
CREATE INDEX IF NOT EXISTS "InventoryItem_warehouse_idx" ON "InventoryItem"("warehouse");

CREATE TABLE IF NOT EXISTS "CycleCount" (
  "id" TEXT NOT NULL,
  "sku" TEXT NOT NULL,
  "warehouseId" TEXT,
  "systemQty" INTEGER NOT NULL DEFAULT 0,
  "countedQty" INTEGER NOT NULL DEFAULT 0,
  "variance" INTEGER NOT NULL DEFAULT 0,
  "countedBy" TEXT,
  "countedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "status" TEXT NOT NULL DEFAULT 'Pending',
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CycleCount_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "CycleCount_sku_idx" ON "CycleCount"("sku");
CREATE INDEX IF NOT EXISTS "CycleCount_status_idx" ON "CycleCount"("status");

-- #23 Warehouse
CREATE TABLE IF NOT EXISTS "Warehouse" (
  "id" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "location" TEXT,
  "type" TEXT NOT NULL DEFAULT 'DC',
  "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Warehouse_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "Warehouse_code_key" ON "Warehouse"("code");

CREATE TABLE IF NOT EXISTS "Bin" (
  "id" TEXT NOT NULL,
  "warehouseId" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "aisle" TEXT,
  "rack" TEXT,
  "level" TEXT,
  "zone" TEXT,
  "capacityUom" TEXT NOT NULL DEFAULT 'EA',
  "capacity" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "occupied" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "active" BOOLEAN NOT NULL DEFAULT true,
  CONSTRAINT "Bin_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "Bin_warehouseId_code_key" ON "Bin"("warehouseId", "code");
CREATE INDEX IF NOT EXISTS "Bin_zone_idx" ON "Bin"("zone");

DO $$ BEGIN
  ALTER TABLE "Bin" ADD CONSTRAINT "Bin_warehouseId_fkey"
    FOREIGN KEY ("warehouseId") REFERENCES "Warehouse"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "PutawayMove" (
  "id" TEXT NOT NULL,
  "sku" TEXT NOT NULL,
  "qty" DOUBLE PRECISION NOT NULL,
  "fromBinId" TEXT,
  "toBinId" TEXT NOT NULL,
  "strategy" TEXT,
  "movedBy" TEXT,
  "movedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PutawayMove_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "PutawayMove_sku_idx" ON "PutawayMove"("sku");
CREATE INDEX IF NOT EXISTS "PutawayMove_movedAt_idx" ON "PutawayMove"("movedAt");

-- #24 Demand
CREATE TABLE IF NOT EXISTS "DemandHistory" (
  "id" TEXT NOT NULL,
  "sku" TEXT NOT NULL,
  "period" TEXT NOT NULL,
  "units" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "revenue" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "DemandHistory_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "DemandHistory_sku_period_key" ON "DemandHistory"("sku", "period");
CREATE INDEX IF NOT EXISTS "DemandHistory_period_idx" ON "DemandHistory"("period");

CREATE TABLE IF NOT EXISTS "DemandForecast" (
  "id" TEXT NOT NULL,
  "sku" TEXT NOT NULL,
  "period" TEXT NOT NULL,
  "forecastUnits" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "method" TEXT NOT NULL DEFAULT 'moving_avg',
  "confidence" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "seasonality" DOUBLE PRECISION NOT NULL DEFAULT 1,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "DemandForecast_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "DemandForecast_sku_period_method_key" ON "DemandForecast"("sku", "period", "method");
CREATE INDEX IF NOT EXISTS "DemandForecast_period_idx" ON "DemandForecast"("period");

-- #25 Fleet
CREATE TABLE IF NOT EXISTS "FleetVehicle" (
  "id" TEXT NOT NULL,
  "plate" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "capacityKg" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "homeDepot" TEXT,
  "driver" TEXT,
  "status" TEXT NOT NULL DEFAULT 'Available',
  "odometerKm" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "fuelType" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "FleetVehicle_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "FleetVehicle_plate_key" ON "FleetVehicle"("plate");

CREATE TABLE IF NOT EXISTS "FleetTrip" (
  "id" TEXT NOT NULL,
  "vehicleId" TEXT NOT NULL,
  "driver" TEXT,
  "startedAt" TIMESTAMP(3),
  "completedAt" TIMESTAMP(3),
  "stops" JSONB NOT NULL,
  "distanceKm" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "optimizedKm" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "savingsKm" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "status" TEXT NOT NULL DEFAULT 'Planned',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "FleetTrip_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "FleetTrip_vehicleId_idx" ON "FleetTrip"("vehicleId");
CREATE INDEX IF NOT EXISTS "FleetTrip_status_idx" ON "FleetTrip"("status");

-- #26 Shipping
CREATE TABLE IF NOT EXISTS "Shipment" (
  "id" TEXT NOT NULL,
  "trackingNo" TEXT NOT NULL,
  "origin" TEXT NOT NULL,
  "destination" TEXT NOT NULL,
  "carrier" TEXT,
  "service" TEXT,
  "weightKg" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "status" TEXT NOT NULL DEFAULT 'Booked',
  "bookedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "estimatedEta" TIMESTAMP(3),
  "actualDelivery" TIMESTAMP(3),
  "orderId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Shipment_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "Shipment_trackingNo_key" ON "Shipment"("trackingNo");
CREATE INDEX IF NOT EXISTS "Shipment_status_idx" ON "Shipment"("status");

CREATE TABLE IF NOT EXISTS "TrackingEvent" (
  "id" TEXT NOT NULL,
  "shipmentId" TEXT NOT NULL,
  "location" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "eventTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "description" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "TrackingEvent_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "TrackingEvent_shipmentId_idx" ON "TrackingEvent"("shipmentId");
CREATE INDEX IF NOT EXISTS "TrackingEvent_eventTime_idx" ON "TrackingEvent"("eventTime");

DO $$ BEGIN
  ALTER TABLE "TrackingEvent" ADD CONSTRAINT "TrackingEvent_shipmentId_fkey"
    FOREIGN KEY ("shipmentId") REFERENCES "Shipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- #27 Trade / HS codes
CREATE TABLE IF NOT EXISTS "HSCode" (
  "id" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "category" TEXT,
  "dutyPercent" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "HSCode_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "HSCode_code_key" ON "HSCode"("code");
CREATE INDEX IF NOT EXISTS "HSCode_category_idx" ON "HSCode"("category");

-- #28 3PL
CREATE TABLE IF NOT EXISTS "ThreePLPartner" (
  "id" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "apiBaseUrl" TEXT,
  "authMode" TEXT NOT NULL DEFAULT 'apikey',
  "active" BOOLEAN NOT NULL DEFAULT true,
  "webhookUrl" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ThreePLPartner_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "ThreePLPartner_code_key" ON "ThreePLPartner"("code");

CREATE TABLE IF NOT EXISTS "ThreePLEvent" (
  "id" TEXT NOT NULL,
  "partnerCode" TEXT NOT NULL,
  "eventType" TEXT NOT NULL,
  "payload" JSONB NOT NULL,
  "processed" BOOLEAN NOT NULL DEFAULT false,
  "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ThreePLEvent_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "ThreePLEvent_partnerCode_idx" ON "ThreePLEvent"("partnerCode");
CREATE INDEX IF NOT EXISTS "ThreePLEvent_eventType_idx" ON "ThreePLEvent"("eventType");
CREATE INDEX IF NOT EXISTS "ThreePLEvent_processed_idx" ON "ThreePLEvent"("processed");
