-- CreateTable
CREATE TABLE "GovernancePolicy" (
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

-- CreateTable
CREATE TABLE "GovernanceDecision" (
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

-- CreateTable
CREATE TABLE "TaxRate" (
    "id" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "region" TEXT,
    "taxType" TEXT NOT NULL,
    "ratePercent" DOUBLE PRECISION NOT NULL,
    "effectiveFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "effectiveTo" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TaxRate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AppUser" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT,
    "displayName" TEXT,
    "role" TEXT NOT NULL DEFAULT 'operator',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" TIMESTAMP(3),
    "mfaEnabled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AppUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LocaleConfig" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "direction" TEXT NOT NULL DEFAULT 'ltr',
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "fallback" TEXT,
    "numberFormat" JSONB,
    "dateFormat" TEXT,
    "currency" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LocaleConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GovernancePolicy_enabled_idx" ON "GovernancePolicy"("enabled");

-- CreateIndex
CREATE INDEX "GovernancePolicy_scope_targetKey_idx" ON "GovernancePolicy"("scope", "targetKey");

-- CreateIndex
CREATE INDEX "GovernanceDecision_policyId_idx" ON "GovernanceDecision"("policyId");

-- CreateIndex
CREATE INDEX "GovernanceDecision_outcome_idx" ON "GovernanceDecision"("outcome");

-- CreateIndex
CREATE INDEX "GovernanceDecision_createdAt_idx" ON "GovernanceDecision"("createdAt");

-- CreateIndex
CREATE INDEX "TaxRate_country_taxType_idx" ON "TaxRate"("country", "taxType");

-- CreateIndex
CREATE INDEX "TaxRate_effectiveFrom_idx" ON "TaxRate"("effectiveFrom");

-- CreateIndex
CREATE UNIQUE INDEX "AppUser_username_key" ON "AppUser"("username");

-- CreateIndex
CREATE UNIQUE INDEX "AppUser_email_key" ON "AppUser"("email");

-- CreateIndex
CREATE INDEX "AppUser_role_idx" ON "AppUser"("role");

-- CreateIndex
CREATE INDEX "AppUser_active_idx" ON "AppUser"("active");

-- CreateIndex
CREATE UNIQUE INDEX "LocaleConfig_code_key" ON "LocaleConfig"("code");

-- CreateIndex
CREATE INDEX "LocaleConfig_enabled_idx" ON "LocaleConfig"("enabled");
