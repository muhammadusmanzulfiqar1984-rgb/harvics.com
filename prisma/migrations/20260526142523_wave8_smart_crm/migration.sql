-- AlterTable
ALTER TABLE "Lead" ADD COLUMN     "aiScore" INTEGER,
ADD COLUMN     "aiScoredAt" TIMESTAMP(3),
ADD COLUMN     "aiTier" TEXT,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "ownerId" TEXT;

-- CreateTable
CREATE TABLE "CrmContact" (
    "id" TEXT NOT NULL,
    "leadId" TEXT,
    "dealId" TEXT,
    "customerId" TEXT,
    "name" TEXT NOT NULL,
    "title" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "linkedin" TEXT,
    "notes" TEXT,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CrmContact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CrmActivity" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "body" TEXT,
    "outcome" TEXT,
    "leadId" TEXT,
    "dealId" TEXT,
    "customerId" TEXT,
    "contactId" TEXT,
    "ownerId" TEXT,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CrmActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CrmAiInsight" (
    "id" TEXT NOT NULL,
    "leadId" TEXT,
    "dealId" TEXT,
    "score" INTEGER NOT NULL DEFAULT 0,
    "tier" TEXT,
    "reasoning" TEXT,
    "nextAction" TEXT,
    "aiGenerated" BOOLEAN NOT NULL DEFAULT true,
    "modelName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CrmAiInsight_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CrmEmailDraft" (
    "id" TEXT NOT NULL,
    "leadId" TEXT,
    "dealId" TEXT,
    "purpose" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Draft',
    "aiGenerated" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sentAt" TIMESTAMP(3),

    CONSTRAINT "CrmEmailDraft_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CrmContact_leadId_idx" ON "CrmContact"("leadId");

-- CreateIndex
CREATE INDEX "CrmContact_dealId_idx" ON "CrmContact"("dealId");

-- CreateIndex
CREATE INDEX "CrmContact_customerId_idx" ON "CrmContact"("customerId");

-- CreateIndex
CREATE INDEX "CrmContact_email_idx" ON "CrmContact"("email");

-- CreateIndex
CREATE INDEX "CrmActivity_leadId_idx" ON "CrmActivity"("leadId");

-- CreateIndex
CREATE INDEX "CrmActivity_dealId_idx" ON "CrmActivity"("dealId");

-- CreateIndex
CREATE INDEX "CrmActivity_customerId_idx" ON "CrmActivity"("customerId");

-- CreateIndex
CREATE INDEX "CrmActivity_type_idx" ON "CrmActivity"("type");

-- CreateIndex
CREATE INDEX "CrmActivity_occurredAt_idx" ON "CrmActivity"("occurredAt");

-- CreateIndex
CREATE INDEX "CrmAiInsight_leadId_idx" ON "CrmAiInsight"("leadId");

-- CreateIndex
CREATE INDEX "CrmAiInsight_dealId_idx" ON "CrmAiInsight"("dealId");

-- CreateIndex
CREATE INDEX "CrmEmailDraft_leadId_idx" ON "CrmEmailDraft"("leadId");

-- CreateIndex
CREATE INDEX "CrmEmailDraft_dealId_idx" ON "CrmEmailDraft"("dealId");

-- CreateIndex
CREATE INDEX "CrmEmailDraft_status_idx" ON "CrmEmailDraft"("status");

-- CreateIndex
CREATE INDEX "Lead_aiTier_idx" ON "Lead"("aiTier");

-- CreateIndex
CREATE INDEX "Lead_ownerId_idx" ON "Lead"("ownerId");

-- AddForeignKey
ALTER TABLE "CrmActivity" ADD CONSTRAINT "CrmActivity_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "CrmContact"("id") ON DELETE SET NULL ON UPDATE CASCADE;
