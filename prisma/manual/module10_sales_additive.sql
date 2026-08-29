-- Module #10 Sales & Distribution — SalesChannel / DeliverySlot (IF NOT EXISTS)

CREATE TABLE IF NOT EXISTS "SalesChannel" (
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
CREATE UNIQUE INDEX IF NOT EXISTS "SalesChannel_code_key" ON "SalesChannel"("code");

CREATE TABLE IF NOT EXISTS "DeliverySlot" (
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
CREATE INDEX IF NOT EXISTS "DeliverySlot_scheduledFor_idx" ON "DeliverySlot"("scheduledFor");
CREATE INDEX IF NOT EXISTS "DeliverySlot_status_idx" ON "DeliverySlot"("status");
