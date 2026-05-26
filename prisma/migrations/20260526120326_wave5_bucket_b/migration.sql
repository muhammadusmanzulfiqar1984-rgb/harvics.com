-- CreateTable
CREATE TABLE "PaymentRun" (
    "id" TEXT NOT NULL,
    "runNo" TEXT NOT NULL,
    "description" TEXT,
    "totalAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "itemCount" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'Draft',
    "releasedAt" TIMESTAMP(3),
    "releasedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentRunItem" (
    "id" TEXT NOT NULL,
    "runId" TEXT NOT NULL,
    "payeeName" TEXT NOT NULL,
    "payeeAccount" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "invoiceRef" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Pending',

    CONSTRAINT "PaymentRunItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Quote" (
    "id" TEXT NOT NULL,
    "quoteNo" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Draft',
    "validUntil" TIMESTAMP(3),
    "subtotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "discount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "notes" TEXT,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Quote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuoteLine" (
    "id" TEXT NOT NULL,
    "quoteId" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "description" TEXT,
    "qty" DOUBLE PRECISION NOT NULL,
    "unitPrice" DOUBLE PRECISION NOT NULL,
    "discount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lineTotal" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "QuoteLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contract" (
    "id" TEXT NOT NULL,
    "contractNo" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "counterparty" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'MSA',
    "value" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Draft',
    "signedAt" TIMESTAMP(3),
    "signedBy" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Contract_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SourcingSupplier" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "country" TEXT,
    "category" TEXT,
    "certifications" TEXT,
    "capabilities" TEXT,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "qualifiedStatus" TEXT NOT NULL DEFAULT 'Discovered',
    "contactEmail" TEXT,
    "contactPhone" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SourcingSupplier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShopFloorOp" (
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

-- CreateTable
CREATE TABLE "ThreePLPartner" (
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

-- CreateTable
CREATE TABLE "ThreePLEvent" (
    "id" TEXT NOT NULL,
    "partnerCode" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "processed" BOOLEAN NOT NULL DEFAULT false,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ThreePLEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobPosting" (
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

-- CreateTable
CREATE TABLE "Candidate" (
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

-- CreateTable
CREATE TABLE "Course" (
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

-- CreateTable
CREATE TABLE "Enrollment" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "enrolledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "score" DOUBLE PRECISION,
    "status" TEXT NOT NULL DEFAULT 'Enrolled',

    CONSTRAINT "Enrollment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PerformanceReview" (
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

-- CreateTable
CREATE TABLE "HeadcountPlan" (
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

-- CreateTable
CREATE TABLE "PMWorkOrder" (
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

-- CreateTable
CREATE TABLE "Property" (
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

-- CreateTable
CREATE TABLE "SavedReport" (
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

-- CreateTable
CREATE TABLE "BoardPack" (
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

-- CreateTable
CREATE TABLE "VarianceCommentary" (
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

-- CreateTable
CREATE TABLE "ServiceTicket" (
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

-- CreateTable
CREATE TABLE "Engagement" (
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

-- CreateTable
CREATE TABLE "TimeEntry" (
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

-- CreateIndex
CREATE UNIQUE INDEX "PaymentRun_runNo_key" ON "PaymentRun"("runNo");

-- CreateIndex
CREATE INDEX "PaymentRun_status_idx" ON "PaymentRun"("status");

-- CreateIndex
CREATE INDEX "PaymentRunItem_runId_idx" ON "PaymentRunItem"("runId");

-- CreateIndex
CREATE UNIQUE INDEX "Quote_quoteNo_key" ON "Quote"("quoteNo");

-- CreateIndex
CREATE INDEX "Quote_status_idx" ON "Quote"("status");

-- CreateIndex
CREATE INDEX "QuoteLine_quoteId_idx" ON "QuoteLine"("quoteId");

-- CreateIndex
CREATE UNIQUE INDEX "Contract_contractNo_key" ON "Contract"("contractNo");

-- CreateIndex
CREATE INDEX "Contract_status_idx" ON "Contract"("status");

-- CreateIndex
CREATE INDEX "Contract_endDate_idx" ON "Contract"("endDate");

-- CreateIndex
CREATE INDEX "SourcingSupplier_qualifiedStatus_idx" ON "SourcingSupplier"("qualifiedStatus");

-- CreateIndex
CREATE INDEX "SourcingSupplier_category_idx" ON "SourcingSupplier"("category");

-- CreateIndex
CREATE INDEX "ShopFloorOp_workOrderId_idx" ON "ShopFloorOp"("workOrderId");

-- CreateIndex
CREATE INDEX "ShopFloorOp_status_idx" ON "ShopFloorOp"("status");

-- CreateIndex
CREATE UNIQUE INDEX "ThreePLPartner_code_key" ON "ThreePLPartner"("code");

-- CreateIndex
CREATE INDEX "ThreePLEvent_partnerCode_idx" ON "ThreePLEvent"("partnerCode");

-- CreateIndex
CREATE INDEX "ThreePLEvent_eventType_idx" ON "ThreePLEvent"("eventType");

-- CreateIndex
CREATE INDEX "ThreePLEvent_processed_idx" ON "ThreePLEvent"("processed");

-- CreateIndex
CREATE UNIQUE INDEX "JobPosting_reqNo_key" ON "JobPosting"("reqNo");

-- CreateIndex
CREATE INDEX "JobPosting_status_idx" ON "JobPosting"("status");

-- CreateIndex
CREATE INDEX "Candidate_postingId_idx" ON "Candidate"("postingId");

-- CreateIndex
CREATE INDEX "Candidate_stage_idx" ON "Candidate"("stage");

-- CreateIndex
CREATE UNIQUE INDEX "Course_code_key" ON "Course"("code");

-- CreateIndex
CREATE INDEX "Enrollment_status_idx" ON "Enrollment"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Enrollment_courseId_employeeId_key" ON "Enrollment"("courseId", "employeeId");

-- CreateIndex
CREATE INDEX "PerformanceReview_employeeId_idx" ON "PerformanceReview"("employeeId");

-- CreateIndex
CREATE INDEX "PerformanceReview_period_idx" ON "PerformanceReview"("period");

-- CreateIndex
CREATE UNIQUE INDEX "HeadcountPlan_period_department_key" ON "HeadcountPlan"("period", "department");

-- CreateIndex
CREATE UNIQUE INDEX "PMWorkOrder_woNo_key" ON "PMWorkOrder"("woNo");

-- CreateIndex
CREATE INDEX "PMWorkOrder_assetId_idx" ON "PMWorkOrder"("assetId");

-- CreateIndex
CREATE INDEX "PMWorkOrder_status_idx" ON "PMWorkOrder"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Property_code_key" ON "Property"("code");

-- CreateIndex
CREATE INDEX "Property_status_idx" ON "Property"("status");

-- CreateIndex
CREATE UNIQUE INDEX "BoardPack_period_key" ON "BoardPack"("period");

-- CreateIndex
CREATE INDEX "VarianceCommentary_period_idx" ON "VarianceCommentary"("period");

-- CreateIndex
CREATE INDEX "VarianceCommentary_account_idx" ON "VarianceCommentary"("account");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceTicket_ticketNo_key" ON "ServiceTicket"("ticketNo");

-- CreateIndex
CREATE INDEX "ServiceTicket_status_idx" ON "ServiceTicket"("status");

-- CreateIndex
CREATE INDEX "ServiceTicket_priority_idx" ON "ServiceTicket"("priority");

-- CreateIndex
CREATE UNIQUE INDEX "Engagement_code_key" ON "Engagement"("code");

-- CreateIndex
CREATE INDEX "Engagement_status_idx" ON "Engagement"("status");

-- CreateIndex
CREATE INDEX "TimeEntry_engagementId_idx" ON "TimeEntry"("engagementId");

-- CreateIndex
CREATE INDEX "TimeEntry_employeeId_idx" ON "TimeEntry"("employeeId");

-- CreateIndex
CREATE INDEX "TimeEntry_date_idx" ON "TimeEntry"("date");

-- AddForeignKey
ALTER TABLE "PaymentRunItem" ADD CONSTRAINT "PaymentRunItem_runId_fkey" FOREIGN KEY ("runId") REFERENCES "PaymentRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuoteLine" ADD CONSTRAINT "QuoteLine_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "Quote"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Candidate" ADD CONSTRAINT "Candidate_postingId_fkey" FOREIGN KEY ("postingId") REFERENCES "JobPosting"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimeEntry" ADD CONSTRAINT "TimeEntry_engagementId_fkey" FOREIGN KEY ("engagementId") REFERENCES "Engagement"("id") ON DELETE CASCADE ON UPDATE CASCADE;
