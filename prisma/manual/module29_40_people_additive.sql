-- Modules #29–40 People / Assets / GRC band
-- CREATE TABLE IF NOT EXISTS for Prisma models that may be missing on Neon.
-- Match prisma/schema.prisma exactly.

-- #29 HR Core — Employee + Payroll + LeaveRequest + Attendance
CREATE TABLE IF NOT EXISTS "Employee" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "department" TEXT,
  "position" TEXT,
  "country" TEXT,
  "city" TEXT,
  "salary" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "currency" TEXT NOT NULL DEFAULT 'USD',
  "status" TEXT NOT NULL DEFAULT 'Active',
  "joinDate" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Employee_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "Employee_department_idx" ON "Employee"("department");
CREATE INDEX IF NOT EXISTS "Employee_country_idx" ON "Employee"("country");

CREATE TABLE IF NOT EXISTS "Payroll" (
  "id" TEXT NOT NULL,
  "period" TEXT NOT NULL,
  "totalAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "currency" TEXT NOT NULL DEFAULT 'USD',
  "employeeCount" INTEGER NOT NULL DEFAULT 0,
  "status" TEXT NOT NULL DEFAULT 'Pending',
  "processedDate" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Payroll_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "LeaveRequest" (
  "id" TEXT NOT NULL,
  "employeeId" TEXT NOT NULL,
  "leaveType" TEXT NOT NULL,
  "startDate" TIMESTAMP(3) NOT NULL,
  "endDate" TIMESTAMP(3) NOT NULL,
  "days" INTEGER NOT NULL,
  "reason" TEXT,
  "status" TEXT NOT NULL DEFAULT 'Pending',
  "approvedBy" TEXT,
  "approvedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "LeaveRequest_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "LeaveRequest_employeeId_idx" ON "LeaveRequest"("employeeId");
CREATE INDEX IF NOT EXISTS "LeaveRequest_status_idx" ON "LeaveRequest"("status");

CREATE TABLE IF NOT EXISTS "Attendance" (
  "id" TEXT NOT NULL,
  "employeeId" TEXT NOT NULL,
  "date" TIMESTAMP(3) NOT NULL,
  "clockIn" TIMESTAMP(3),
  "clockOut" TIMESTAMP(3),
  "hoursWorked" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "status" TEXT NOT NULL DEFAULT 'Present',
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Attendance_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "Attendance_employeeId_date_key" ON "Attendance"("employeeId", "date");
CREATE INDEX IF NOT EXISTS "Attendance_date_idx" ON "Attendance"("date");

-- #30 Talent
CREATE TABLE IF NOT EXISTS "JobPosting" (
  "id" TEXT NOT NULL,
  "reqNo" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "department" TEXT,
  "location" TEXT,
  "level" TEXT,
  "status" TEXT NOT NULL DEFAULT 'Open',
  "description" TEXT,
  "postedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "filledAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "JobPosting_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "JobPosting_reqNo_key" ON "JobPosting"("reqNo");
CREATE INDEX IF NOT EXISTS "JobPosting_status_idx" ON "JobPosting"("status");

CREATE TABLE IF NOT EXISTS "Candidate" (
  "id" TEXT NOT NULL,
  "postingId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "email" TEXT,
  "phone" TEXT,
  "stage" TEXT NOT NULL DEFAULT 'Applied',
  "rating" INTEGER NOT NULL DEFAULT 0,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Candidate_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "Candidate_postingId_idx" ON "Candidate"("postingId");
CREATE INDEX IF NOT EXISTS "Candidate_stage_idx" ON "Candidate"("stage");

DO $$ BEGIN
  ALTER TABLE "Candidate" ADD CONSTRAINT "Candidate_postingId_fkey"
    FOREIGN KEY ("postingId") REFERENCES "JobPosting"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- #31 LMS
CREATE TABLE IF NOT EXISTS "Course" (
  "id" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "category" TEXT,
  "durationHrs" DOUBLE PRECISION NOT NULL DEFAULT 1,
  "level" TEXT,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "Course_code_key" ON "Course"("code");

CREATE TABLE IF NOT EXISTS "Enrollment" (
  "id" TEXT NOT NULL,
  "courseId" TEXT NOT NULL,
  "employeeId" TEXT NOT NULL,
  "enrolledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "completedAt" TIMESTAMP(3),
  "score" DOUBLE PRECISION,
  "status" TEXT NOT NULL DEFAULT 'Enrolled',
  CONSTRAINT "Enrollment_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "Enrollment_courseId_employeeId_key" ON "Enrollment"("courseId", "employeeId");
CREATE INDEX IF NOT EXISTS "Enrollment_status_idx" ON "Enrollment"("status");

DO $$ BEGIN
  ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_courseId_fkey"
    FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- #32 Performance
CREATE TABLE IF NOT EXISTS "PerformanceReview" (
  "id" TEXT NOT NULL,
  "employeeId" TEXT NOT NULL,
  "period" TEXT NOT NULL,
  "reviewer" TEXT,
  "selfRating" INTEGER NOT NULL DEFAULT 0,
  "mgrRating" INTEGER NOT NULL DEFAULT 0,
  "overallScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "strengths" TEXT,
  "improvements" TEXT,
  "potential" TEXT NOT NULL DEFAULT 'Hold',
  "status" TEXT NOT NULL DEFAULT 'Draft',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "PerformanceReview_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "PerformanceReview_employeeId_idx" ON "PerformanceReview"("employeeId");
CREATE INDEX IF NOT EXISTS "PerformanceReview_period_idx" ON "PerformanceReview"("period");

-- #33 Workforce
CREATE TABLE IF NOT EXISTS "HeadcountPlan" (
  "id" TEXT NOT NULL,
  "period" TEXT NOT NULL,
  "department" TEXT NOT NULL,
  "currentFte" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "plannedFte" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "attritionPct" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "hiringNeed" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "HeadcountPlan_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "HeadcountPlan_period_department_key" ON "HeadcountPlan"("period", "department");

-- #34 Fixed Assets
CREATE TABLE IF NOT EXISTS "Asset" (
  "id" TEXT NOT NULL,
  "assetCode" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "category" TEXT,
  "location" TEXT,
  "status" TEXT NOT NULL DEFAULT 'Active',
  "purchaseDate" TEXT,
  "purchasePrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "currency" TEXT NOT NULL DEFAULT 'USD',
  "warrantyExpiry" TEXT,
  "ownerId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Asset_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "Asset_assetCode_key" ON "Asset"("assetCode");
CREATE INDEX IF NOT EXISTS "Asset_status_idx" ON "Asset"("status");
CREATE INDEX IF NOT EXISTS "Asset_category_idx" ON "Asset"("category");

CREATE TABLE IF NOT EXISTS "MaintenanceLog" (
  "id" TEXT NOT NULL,
  "assetId" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "cost" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "currency" TEXT NOT NULL DEFAULT 'USD',
  "technician" TEXT,
  "performedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "nextDueAt" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "MaintenanceLog_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "MaintenanceLog_assetId_idx" ON "MaintenanceLog"("assetId");
CREATE INDEX IF NOT EXISTS "MaintenanceLog_performedAt_idx" ON "MaintenanceLog"("performedAt");

DO $$ BEGIN
  ALTER TABLE "MaintenanceLog" ADD CONSTRAINT "MaintenanceLog_assetId_fkey"
    FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- #35 Plant Maintenance
CREATE TABLE IF NOT EXISTS "PMWorkOrder" (
  "id" TEXT NOT NULL,
  "woNo" TEXT NOT NULL,
  "assetId" TEXT NOT NULL,
  "type" TEXT NOT NULL DEFAULT 'Corrective',
  "priority" TEXT NOT NULL DEFAULT 'Medium',
  "description" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'Open',
  "assignedTo" TEXT,
  "scheduledAt" TIMESTAMP(3),
  "completedAt" TIMESTAMP(3),
  "laborHours" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "partsCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "totalCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "PMWorkOrder_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "PMWorkOrder_woNo_key" ON "PMWorkOrder"("woNo");
CREATE INDEX IF NOT EXISTS "PMWorkOrder_assetId_idx" ON "PMWorkOrder"("assetId");
CREATE INDEX IF NOT EXISTS "PMWorkOrder_status_idx" ON "PMWorkOrder"("status");

-- #36 Properties
CREATE TABLE IF NOT EXISTS "Property" (
  "id" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "address" TEXT,
  "sqft" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "occupancyPct" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "monthlyRent" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "currency" TEXT NOT NULL DEFAULT 'USD',
  "leaseEnd" TIMESTAMP(3),
  "status" TEXT NOT NULL DEFAULT 'Active',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Property_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "Property_code_key" ON "Property"("code");
CREATE INDEX IF NOT EXISTS "Property_status_idx" ON "Property"("status");

-- #37 GRC incidents
CREATE TABLE IF NOT EXISTS "Incident" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "severity" TEXT NOT NULL DEFAULT 'Medium',
  "reportedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "status" TEXT NOT NULL DEFAULT 'Open',
  "resolution" TEXT,
  "resolvedDate" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Incident_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "Incident_status_idx" ON "Incident"("status");
CREATE INDEX IF NOT EXISTS "Incident_severity_idx" ON "Incident"("severity");

-- #38 Internal Audit
CREATE TABLE IF NOT EXISTS "AuditEvent" (
  "id" TEXT NOT NULL,
  "actorId" TEXT,
  "actorRole" TEXT,
  "action" TEXT NOT NULL,
  "module" TEXT,
  "entity" TEXT,
  "entityId" TEXT,
  "ipAddress" TEXT,
  "userAgent" TEXT,
  "payload" JSONB,
  "result" TEXT NOT NULL DEFAULT 'success',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AuditEvent_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "AuditEvent_actorId_idx" ON "AuditEvent"("actorId");
CREATE INDEX IF NOT EXISTS "AuditEvent_action_idx" ON "AuditEvent"("action");
CREATE INDEX IF NOT EXISTS "AuditEvent_entity_entityId_idx" ON "AuditEvent"("entity", "entityId");
CREATE INDEX IF NOT EXISTS "AuditEvent_createdAt_idx" ON "AuditEvent"("createdAt");

-- #39 Legal documents
CREATE TABLE IF NOT EXISTS "Document" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "category" TEXT,
  "url" TEXT,
  "ownerId" TEXT,
  "partyId" TEXT,
  "status" TEXT NOT NULL DEFAULT 'Draft',
  "effectiveDate" TEXT,
  "expiryDate" TEXT,
  "signedAt" TIMESTAMP(3),
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "Document_type_idx" ON "Document"("type");
CREATE INDEX IF NOT EXISTS "Document_status_idx" ON "Document"("status");

-- #40 Neural Governance
CREATE TABLE IF NOT EXISTS "GovernancePolicy" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "scope" TEXT NOT NULL,
  "targetKey" TEXT,
  "rule" JSONB NOT NULL,
  "severity" TEXT NOT NULL DEFAULT 'medium',
  "enabled" BOOLEAN NOT NULL DEFAULT true,
  "createdBy" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "GovernancePolicy_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "GovernancePolicy_enabled_idx" ON "GovernancePolicy"("enabled");
CREATE INDEX IF NOT EXISTS "GovernancePolicy_scope_targetKey_idx" ON "GovernancePolicy"("scope", "targetKey");

CREATE TABLE IF NOT EXISTS "GovernanceDecision" (
  "id" TEXT NOT NULL,
  "policyId" TEXT NOT NULL,
  "actorId" TEXT,
  "actorRole" TEXT,
  "module" TEXT,
  "route" TEXT,
  "outcome" TEXT NOT NULL,
  "reason" TEXT,
  "ipAddress" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "GovernanceDecision_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "GovernanceDecision_policyId_idx" ON "GovernanceDecision"("policyId");
CREATE INDEX IF NOT EXISTS "GovernanceDecision_outcome_idx" ON "GovernanceDecision"("outcome");
CREATE INDEX IF NOT EXISTS "GovernanceDecision_createdAt_idx" ON "GovernanceDecision"("createdAt");
