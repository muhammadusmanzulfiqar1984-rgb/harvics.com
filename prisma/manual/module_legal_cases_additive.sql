-- Module #39 Legal Cases — litigation / case management

CREATE TABLE IF NOT EXISTS "LegalCase" (
  "id" TEXT NOT NULL,
  "caseTitle" TEXT NOT NULL,
  "caseType" TEXT NOT NULL,
  "country" TEXT NOT NULL,
  "description" TEXT,
  "assignedTo" TEXT,
  "status" TEXT NOT NULL DEFAULT 'open',
  "hearingDate" TIMESTAMP(3),
  "documents" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "LegalCase_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "LegalCase_status_idx" ON "LegalCase"("status");
CREATE INDEX IF NOT EXISTS "LegalCase_country_idx" ON "LegalCase"("country");
