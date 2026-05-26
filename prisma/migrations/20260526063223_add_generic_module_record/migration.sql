-- CreateTable
CREATE TABLE "GenericModuleRecord" (
    "id" TEXT NOT NULL,
    "moduleId" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Active',
    "data" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GenericModuleRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GenericModuleRecord_moduleId_idx" ON "GenericModuleRecord"("moduleId");

-- CreateIndex
CREATE INDEX "GenericModuleRecord_moduleId_status_idx" ON "GenericModuleRecord"("moduleId", "status");

-- CreateIndex
CREATE INDEX "GenericModuleRecord_createdAt_idx" ON "GenericModuleRecord"("createdAt");
