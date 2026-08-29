-- Module #8 CRM — Lead / Deal / CrmContact / CrmActivity / CrmAiInsight / CrmEmailDraft (IF NOT EXISTS)

CREATE TABLE IF NOT EXISTS "Lead" (
  "id" TEXT NOT NULL,
  "company" TEXT NOT NULL,
  "contact" TEXT,
  "email" TEXT,
  "stage" TEXT NOT NULL DEFAULT 'Lead',
  "value" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "source" TEXT,
  "notes" TEXT,
  "aiScore" INTEGER,
  "aiTier" TEXT,
  "aiScoredAt" TIMESTAMP(3),
  "ownerId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "Lead_stage_idx" ON "Lead"("stage");
CREATE INDEX IF NOT EXISTS "Lead_aiTier_idx" ON "Lead"("aiTier");
CREATE INDEX IF NOT EXISTS "Lead_ownerId_idx" ON "Lead"("ownerId");

CREATE TABLE IF NOT EXISTS "Deal" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "customerId" TEXT,
  "ownerId" TEXT,
  "stage" TEXT NOT NULL DEFAULT 'Prospecting',
  "value" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "currency" TEXT NOT NULL DEFAULT 'USD',
  "probability" INTEGER NOT NULL DEFAULT 20,
  "expectedClose" TIMESTAMP(3),
  "source" TEXT,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Deal_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "Deal_stage_idx" ON "Deal"("stage");
CREATE INDEX IF NOT EXISTS "Deal_ownerId_idx" ON "Deal"("ownerId");

CREATE TABLE IF NOT EXISTS "CrmContact" (
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
CREATE INDEX IF NOT EXISTS "CrmContact_leadId_idx" ON "CrmContact"("leadId");
CREATE INDEX IF NOT EXISTS "CrmContact_dealId_idx" ON "CrmContact"("dealId");
CREATE INDEX IF NOT EXISTS "CrmContact_customerId_idx" ON "CrmContact"("customerId");
CREATE INDEX IF NOT EXISTS "CrmContact_email_idx" ON "CrmContact"("email");

CREATE TABLE IF NOT EXISTS "CrmActivity" (
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
CREATE INDEX IF NOT EXISTS "CrmActivity_leadId_idx" ON "CrmActivity"("leadId");
CREATE INDEX IF NOT EXISTS "CrmActivity_dealId_idx" ON "CrmActivity"("dealId");
CREATE INDEX IF NOT EXISTS "CrmActivity_customerId_idx" ON "CrmActivity"("customerId");
CREATE INDEX IF NOT EXISTS "CrmActivity_type_idx" ON "CrmActivity"("type");
CREATE INDEX IF NOT EXISTS "CrmActivity_occurredAt_idx" ON "CrmActivity"("occurredAt");

CREATE TABLE IF NOT EXISTS "CrmAiInsight" (
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
CREATE INDEX IF NOT EXISTS "CrmAiInsight_leadId_idx" ON "CrmAiInsight"("leadId");
CREATE INDEX IF NOT EXISTS "CrmAiInsight_dealId_idx" ON "CrmAiInsight"("dealId");

CREATE TABLE IF NOT EXISTS "CrmEmailDraft" (
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
CREATE INDEX IF NOT EXISTS "CrmEmailDraft_leadId_idx" ON "CrmEmailDraft"("leadId");
CREATE INDEX IF NOT EXISTS "CrmEmailDraft_dealId_idx" ON "CrmEmailDraft"("dealId");
CREATE INDEX IF NOT EXISTS "CrmEmailDraft_status_idx" ON "CrmEmailDraft"("status");

DO $$ BEGIN
  ALTER TABLE "CrmActivity" ADD CONSTRAINT "CrmActivity_contactId_fkey"
    FOREIGN KEY ("contactId") REFERENCES "CrmContact"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
