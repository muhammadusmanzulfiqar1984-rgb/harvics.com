-- Modules #41–47 Analytics & Projects/Services
-- CREATE TABLE IF NOT EXISTS — match prisma/schema.prisma.
-- Idempotent; safe if already applied via module41_71_platform_additive.sql.

-- #41 BI & Reporting
CREATE TABLE IF NOT EXISTS "SavedReport" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "category" TEXT,
  "sourceTable" TEXT NOT NULL,
  "filters" JSONB,
  "groupBy" TEXT,
  "metric" TEXT NOT NULL,
  "metricField" TEXT,
  "description" TEXT,
  "lastRunAt" TIMESTAMP(3),
  "createdBy" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "SavedReport_pkey" PRIMARY KEY ("id")
);

-- #42 Board Pack Generator
CREATE TABLE IF NOT EXISTS "BoardPack" (
  "id" TEXT NOT NULL,
  "period" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "sections" JSONB NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'Draft',
  "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "approvedBy" TEXT,
  "approvedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "BoardPack_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "BoardPack_period_key" ON "BoardPack"("period");

-- #43 OKR Tracking
CREATE TABLE IF NOT EXISTS "OKR" (
  "id" TEXT NOT NULL,
  "objective" TEXT NOT NULL,
  "owner" TEXT NOT NULL,
  "progress" INTEGER NOT NULL DEFAULT 0,
  "keyResults" INTEGER NOT NULL DEFAULT 0,
  "completed" INTEGER NOT NULL DEFAULT 0,
  "period" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'On Track',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "OKR_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "OKR_period_idx" ON "OKR"("period");
CREATE INDEX IF NOT EXISTS "OKR_status_idx" ON "OKR"("status");

-- #44 AI Variance Commentary
CREATE TABLE IF NOT EXISTS "VarianceCommentary" (
  "id" TEXT NOT NULL,
  "period" TEXT NOT NULL,
  "account" TEXT NOT NULL,
  "costCenter" TEXT,
  "variance" DOUBLE PRECISION NOT NULL,
  "variancePct" DOUBLE PRECISION,
  "commentary" TEXT NOT NULL,
  "classification" TEXT NOT NULL DEFAULT 'Unexplained',
  "generatedBy" TEXT NOT NULL DEFAULT 'ai',
  "approved" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "VarianceCommentary_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "VarianceCommentary_period_idx" ON "VarianceCommentary"("period");
CREATE INDEX IF NOT EXISTS "VarianceCommentary_account_idx" ON "VarianceCommentary"("account");

-- #45 Project Management
CREATE TABLE IF NOT EXISTS "Project" (
  "id" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "status" TEXT NOT NULL DEFAULT 'Active',
  "priority" TEXT NOT NULL DEFAULT 'Normal',
  "startDate" TEXT,
  "endDate" TEXT,
  "ownerId" TEXT,
  "budget" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "spent" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "currency" TEXT NOT NULL DEFAULT 'USD',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "Project_code_key" ON "Project"("code");
CREATE INDEX IF NOT EXISTS "Project_status_idx" ON "Project"("status");

CREATE TABLE IF NOT EXISTS "Task" (
  "id" TEXT NOT NULL,
  "projectId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'Todo',
  "priority" TEXT NOT NULL DEFAULT 'Normal',
  "assigneeId" TEXT,
  "dueDate" TEXT,
  "completedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "Task_projectId_idx" ON "Task"("projectId");
CREATE INDEX IF NOT EXISTS "Task_status_idx" ON "Task"("status");

CREATE TABLE IF NOT EXISTS "Milestone" (
  "id" TEXT NOT NULL,
  "projectId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "dueDate" TEXT,
  "status" TEXT NOT NULL DEFAULT 'Pending',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Milestone_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "Milestone_projectId_idx" ON "Milestone"("projectId");

DO $$ BEGIN
  ALTER TABLE "Task" ADD CONSTRAINT "Task_projectId_fkey"
    FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE "Milestone" ADD CONSTRAINT "Milestone_projectId_fkey"
    FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- #46 Service Management
CREATE TABLE IF NOT EXISTS "ServiceTicket" (
  "id" TEXT NOT NULL,
  "ticketNo" TEXT NOT NULL,
  "customerName" TEXT NOT NULL,
  "subject" TEXT NOT NULL,
  "description" TEXT,
  "priority" TEXT NOT NULL DEFAULT 'Medium',
  "status" TEXT NOT NULL DEFAULT 'Open',
  "assignedTo" TEXT,
  "category" TEXT,
  "resolution" TEXT,
  "openedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "resolvedAt" TIMESTAMP(3),
  "closedAt" TIMESTAMP(3),
  "slaBreached" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ServiceTicket_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "ServiceTicket_ticketNo_key" ON "ServiceTicket"("ticketNo");
CREATE INDEX IF NOT EXISTS "ServiceTicket_status_idx" ON "ServiceTicket"("status");
CREATE INDEX IF NOT EXISTS "ServiceTicket_priority_idx" ON "ServiceTicket"("priority");

-- #47 Professional Services
CREATE TABLE IF NOT EXISTS "Engagement" (
  "id" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "clientName" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "type" TEXT NOT NULL DEFAULT 'FixedFee',
  "budget" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "spent" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "status" TEXT NOT NULL DEFAULT 'Active',
  "startDate" TIMESTAMP(3) NOT NULL,
  "endDate" TIMESTAMP(3),
  "manager" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Engagement_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "Engagement_code_key" ON "Engagement"("code");
CREATE INDEX IF NOT EXISTS "Engagement_status_idx" ON "Engagement"("status");

CREATE TABLE IF NOT EXISTS "TimeEntry" (
  "id" TEXT NOT NULL,
  "engagementId" TEXT NOT NULL,
  "employeeId" TEXT NOT NULL,
  "date" TIMESTAMP(3) NOT NULL,
  "hours" DOUBLE PRECISION NOT NULL,
  "rate" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "description" TEXT,
  "billable" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "TimeEntry_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "TimeEntry_engagementId_idx" ON "TimeEntry"("engagementId");
CREATE INDEX IF NOT EXISTS "TimeEntry_employeeId_idx" ON "TimeEntry"("employeeId");
CREATE INDEX IF NOT EXISTS "TimeEntry_date_idx" ON "TimeEntry"("date");
DO $$ BEGIN
  ALTER TABLE "TimeEntry" ADD CONSTRAINT "TimeEntry_engagementId_fkey"
    FOREIGN KEY ("engagementId") REFERENCES "Engagement"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
