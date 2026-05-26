-- CreateTable
CREATE TABLE "CostCenter" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "manager" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CostCenter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CostAllocation" (
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

-- CreateTable
CREATE TABLE "BudgetLine" (
    "id" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "account" TEXT NOT NULL,
    "costCenter" TEXT,
    "budgeted" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "scenario" TEXT NOT NULL DEFAULT 'Base',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BudgetLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalesChannel" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 50,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "leadTimeDays" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SalesChannel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeliverySlot" (
    "id" TEXT NOT NULL,
    "orderId" TEXT,
    "channelCode" TEXT NOT NULL,
    "scheduledFor" TIMESTAMP(3) NOT NULL,
    "windowStart" TEXT,
    "windowEnd" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Scheduled',
    "driver" TEXT,
    "vehicle" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeliverySlot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BillOfMaterial" (
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

-- CreateTable
CREATE TABLE "BOMComponent" (
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

-- CreateTable
CREATE TABLE "Recipe" (
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

-- CreateTable
CREATE TABLE "RecipeIngredient" (
    "id" TEXT NOT NULL,
    "recipeId" TEXT NOT NULL,
    "ingredient" TEXT NOT NULL,
    "qty" DOUBLE PRECISION NOT NULL,
    "uom" TEXT NOT NULL DEFAULT 'kg',
    "unitCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "notes" TEXT,

    CONSTRAINT "RecipeIngredient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Warehouse" (
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

-- CreateTable
CREATE TABLE "Bin" (
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

-- CreateTable
CREATE TABLE "PutawayMove" (
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

-- CreateTable
CREATE TABLE "DemandHistory" (
    "id" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "units" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "revenue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DemandHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DemandForecast" (
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

-- CreateTable
CREATE TABLE "FleetVehicle" (
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

-- CreateTable
CREATE TABLE "FleetTrip" (
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

-- CreateIndex
CREATE UNIQUE INDEX "CostCenter_code_key" ON "CostCenter"("code");

-- CreateIndex
CREATE INDEX "CostAllocation_period_idx" ON "CostAllocation"("period");

-- CreateIndex
CREATE INDEX "CostAllocation_toCostCenter_idx" ON "CostAllocation"("toCostCenter");

-- CreateIndex
CREATE INDEX "BudgetLine_period_idx" ON "BudgetLine"("period");

-- CreateIndex
CREATE UNIQUE INDEX "BudgetLine_period_account_costCenter_scenario_key" ON "BudgetLine"("period", "account", "costCenter", "scenario");

-- CreateIndex
CREATE UNIQUE INDEX "SalesChannel_code_key" ON "SalesChannel"("code");

-- CreateIndex
CREATE INDEX "DeliverySlot_scheduledFor_idx" ON "DeliverySlot"("scheduledFor");

-- CreateIndex
CREATE INDEX "DeliverySlot_status_idx" ON "DeliverySlot"("status");

-- CreateIndex
CREATE UNIQUE INDEX "BillOfMaterial_productSku_key" ON "BillOfMaterial"("productSku");

-- CreateIndex
CREATE INDEX "BOMComponent_bomId_idx" ON "BOMComponent"("bomId");

-- CreateIndex
CREATE INDEX "BOMComponent_componentSku_idx" ON "BOMComponent"("componentSku");

-- CreateIndex
CREATE UNIQUE INDEX "Recipe_code_key" ON "Recipe"("code");

-- CreateIndex
CREATE INDEX "RecipeIngredient_recipeId_idx" ON "RecipeIngredient"("recipeId");

-- CreateIndex
CREATE UNIQUE INDEX "Warehouse_code_key" ON "Warehouse"("code");

-- CreateIndex
CREATE INDEX "Bin_zone_idx" ON "Bin"("zone");

-- CreateIndex
CREATE UNIQUE INDEX "Bin_warehouseId_code_key" ON "Bin"("warehouseId", "code");

-- CreateIndex
CREATE INDEX "PutawayMove_sku_idx" ON "PutawayMove"("sku");

-- CreateIndex
CREATE INDEX "PutawayMove_movedAt_idx" ON "PutawayMove"("movedAt");

-- CreateIndex
CREATE INDEX "DemandHistory_period_idx" ON "DemandHistory"("period");

-- CreateIndex
CREATE UNIQUE INDEX "DemandHistory_sku_period_key" ON "DemandHistory"("sku", "period");

-- CreateIndex
CREATE INDEX "DemandForecast_period_idx" ON "DemandForecast"("period");

-- CreateIndex
CREATE UNIQUE INDEX "DemandForecast_sku_period_method_key" ON "DemandForecast"("sku", "period", "method");

-- CreateIndex
CREATE UNIQUE INDEX "FleetVehicle_plate_key" ON "FleetVehicle"("plate");

-- CreateIndex
CREATE INDEX "FleetTrip_vehicleId_idx" ON "FleetTrip"("vehicleId");

-- CreateIndex
CREATE INDEX "FleetTrip_status_idx" ON "FleetTrip"("status");

-- AddForeignKey
ALTER TABLE "BOMComponent" ADD CONSTRAINT "BOMComponent_bomId_fkey" FOREIGN KEY ("bomId") REFERENCES "BillOfMaterial"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecipeIngredient" ADD CONSTRAINT "RecipeIngredient_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bin" ADD CONSTRAINT "Bin_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "Warehouse"("id") ON DELETE CASCADE ON UPDATE CASCADE;
