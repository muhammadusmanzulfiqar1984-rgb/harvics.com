-- Modules #41–71 Analytics / Projects / Platform / Data-AI / Universe / Portals
-- CREATE TABLE IF NOT EXISTS for Prisma models that may be missing on Neon.
-- Match prisma/schema.prisma. Do not drop or alter existing Finance #1–16 / Ops #17–28 tables.

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

-- #49 FX Engine
CREATE TABLE IF NOT EXISTS "FxRate" (
  "id" TEXT NOT NULL,
  "fromCcy" TEXT NOT NULL,
  "toCcy" TEXT NOT NULL,
  "rate" DOUBLE PRECISION NOT NULL,
  "effectiveDate" TEXT NOT NULL,
  "source" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "FxRate_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "FxRate_fromCcy_toCcy_effectiveDate_key" ON "FxRate"("fromCcy", "toCcy", "effectiveDate");
CREATE INDEX IF NOT EXISTS "FxRate_effectiveDate_idx" ON "FxRate"("effectiveDate");

-- #52 Document Vault
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

-- #51 Notifications
CREATE TABLE IF NOT EXISTS "Notification" (
  "id" TEXT NOT NULL,
  "userId" TEXT,
  "channel" TEXT NOT NULL DEFAULT 'in-app',
  "category" TEXT,
  "title" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "actionUrl" TEXT,
  "severity" TEXT NOT NULL DEFAULT 'info',
  "read" BOOLEAN NOT NULL DEFAULT false,
  "readAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "Notification_userId_idx" ON "Notification"("userId");
CREATE INDEX IF NOT EXISTS "Notification_read_idx" ON "Notification"("read");
CREATE INDEX IF NOT EXISTS "Notification_category_idx" ON "Notification"("category");

-- #50 Audit Log
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

-- #48 Tax Engine
CREATE TABLE IF NOT EXISTS "TaxRate" (
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
CREATE INDEX IF NOT EXISTS "TaxRate_country_taxType_idx" ON "TaxRate"("country", "taxType");
CREATE INDEX IF NOT EXISTS "TaxRate_effectiveFrom_idx" ON "TaxRate"("effectiveFrom");

-- #53 Admin & Security
CREATE TABLE IF NOT EXISTS "AppUser" (
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
CREATE UNIQUE INDEX IF NOT EXISTS "AppUser_username_key" ON "AppUser"("username");
CREATE UNIQUE INDEX IF NOT EXISTS "AppUser_email_key" ON "AppUser"("email");
CREATE INDEX IF NOT EXISTS "AppUser_role_idx" ON "AppUser"("role");
CREATE INDEX IF NOT EXISTS "AppUser_active_idx" ON "AppUser"("active");

-- #58 Globalisation
CREATE TABLE IF NOT EXISTS "LocaleConfig" (
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
CREATE UNIQUE INDEX IF NOT EXISTS "LocaleConfig_code_key" ON "LocaleConfig"("code");
CREATE INDEX IF NOT EXISTS "LocaleConfig_enabled_idx" ON "LocaleConfig"("enabled");

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

-- #66/#67 Wallets
CREATE TABLE IF NOT EXISTS "Wallet" (
  "id" TEXT NOT NULL,
  "ownerType" TEXT NOT NULL,
  "ownerId" TEXT NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'USD',
  "label" TEXT,
  "balance" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "status" TEXT NOT NULL DEFAULT 'Active',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Wallet_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "Wallet_ownerType_ownerId_currency_key" ON "Wallet"("ownerType", "ownerId", "currency");
CREATE INDEX IF NOT EXISTS "Wallet_ownerId_idx" ON "Wallet"("ownerId");
-- Additive: existing DBs may lack label (harvicoins|hpay for #66/#67 split)
DO $$ BEGIN
  ALTER TABLE "Wallet" ADD COLUMN IF NOT EXISTS "label" TEXT;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;
CREATE INDEX IF NOT EXISTS "Wallet_label_idx" ON "Wallet"("label");

CREATE TABLE IF NOT EXISTS "WalletTxn" (
  "id" TEXT NOT NULL,
  "walletId" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "amount" DOUBLE PRECISION NOT NULL,
  "currency" TEXT NOT NULL,
  "balanceAfter" DOUBLE PRECISION NOT NULL,
  "counterparty" TEXT,
  "reference" TEXT,
  "status" TEXT NOT NULL DEFAULT 'Posted',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "WalletTxn_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "WalletTxn_walletId_idx" ON "WalletTxn"("walletId");
CREATE INDEX IF NOT EXISTS "WalletTxn_type_idx" ON "WalletTxn"("type");
DO $$ BEGIN
  ALTER TABLE "WalletTxn" ADD CONSTRAINT "WalletTxn_walletId_fkey"
    FOREIGN KEY ("walletId") REFERENCES "Wallet"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- #59 Social Feed
CREATE TABLE IF NOT EXISTS "FeedPost" (
  "id" TEXT NOT NULL,
  "authorId" TEXT NOT NULL,
  "authorName" TEXT NOT NULL,
  "body" TEXT NOT NULL,
  "imageUrl" TEXT,
  "likeCount" INTEGER NOT NULL DEFAULT 0,
  "commentCount" INTEGER NOT NULL DEFAULT 0,
  "visibility" TEXT NOT NULL DEFAULT 'public',
  "groupId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "FeedPost_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "FeedPost_authorId_idx" ON "FeedPost"("authorId");
CREATE INDEX IF NOT EXISTS "FeedPost_groupId_idx" ON "FeedPost"("groupId");

CREATE TABLE IF NOT EXISTS "FeedComment" (
  "id" TEXT NOT NULL,
  "postId" TEXT NOT NULL,
  "authorId" TEXT NOT NULL,
  "authorName" TEXT NOT NULL,
  "body" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "FeedComment_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "FeedComment_postId_idx" ON "FeedComment"("postId");
DO $$ BEGIN
  ALTER TABLE "FeedComment" ADD CONSTRAINT "FeedComment_postId_fkey"
    FOREIGN KEY ("postId") REFERENCES "FeedPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "FeedLike" (
  "id" TEXT NOT NULL,
  "postId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "FeedLike_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "FeedLike_postId_userId_key" ON "FeedLike"("postId", "userId");
DO $$ BEGIN
  ALTER TABLE "FeedLike" ADD CONSTRAINT "FeedLike_postId_fkey"
    FOREIGN KEY ("postId") REFERENCES "FeedPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Wave6 communities / marketplace / jobs / events / knowledge / mentorship / polls / kudos
CREATE TABLE IF NOT EXISTS "Community" (
  "id" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "visibility" TEXT NOT NULL DEFAULT 'public',
  "memberCount" INTEGER NOT NULL DEFAULT 0,
  "createdBy" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Community_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "Community_slug_key" ON "Community"("slug");

CREATE TABLE IF NOT EXISTS "CommunityMember" (
  "id" TEXT NOT NULL,
  "communityId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "role" TEXT NOT NULL DEFAULT 'member',
  "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CommunityMember_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "CommunityMember_communityId_userId_key" ON "CommunityMember"("communityId", "userId");
CREATE INDEX IF NOT EXISTS "CommunityMember_userId_idx" ON "CommunityMember"("userId");
DO $$ BEGIN
  ALTER TABLE "CommunityMember" ADD CONSTRAINT "CommunityMember_communityId_fkey"
    FOREIGN KEY ("communityId") REFERENCES "Community"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "MarketListing" (
  "id" TEXT NOT NULL,
  "sellerId" TEXT NOT NULL,
  "sellerName" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "category" TEXT,
  "price" DOUBLE PRECISION NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'USD',
  "qtyAvailable" INTEGER NOT NULL DEFAULT 1,
  "imageUrl" TEXT,
  "status" TEXT NOT NULL DEFAULT 'Active',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "MarketListing_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "MarketListing_sellerId_idx" ON "MarketListing"("sellerId");
CREATE INDEX IF NOT EXISTS "MarketListing_status_idx" ON "MarketListing"("status");
CREATE INDEX IF NOT EXISTS "MarketListing_category_idx" ON "MarketListing"("category");

CREATE TABLE IF NOT EXISTS "SavedJobPost" (
  "id" TEXT NOT NULL,
  "postingId" TEXT NOT NULL,
  "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "externalUrl" TEXT,
  "views" INTEGER NOT NULL DEFAULT 0,
  "applies" INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "SavedJobPost_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "SavedJobPost_postingId_key" ON "SavedJobPost"("postingId");

CREATE TABLE IF NOT EXISTS "Event" (
  "id" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "type" TEXT NOT NULL DEFAULT 'Webinar',
  "startsAt" TIMESTAMP(3) NOT NULL,
  "endsAt" TIMESTAMP(3) NOT NULL,
  "capacity" INTEGER NOT NULL DEFAULT 100,
  "location" TEXT,
  "meetingUrl" TEXT,
  "status" TEXT NOT NULL DEFAULT 'Scheduled',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "Event_slug_key" ON "Event"("slug");

CREATE TABLE IF NOT EXISTS "EventRegistration" (
  "id" TEXT NOT NULL,
  "eventId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "userName" TEXT NOT NULL,
  "attended" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "EventRegistration_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "EventRegistration_eventId_userId_key" ON "EventRegistration"("eventId", "userId");
DO $$ BEGIN
  ALTER TABLE "EventRegistration" ADD CONSTRAINT "EventRegistration_eventId_fkey"
    FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "KnowledgeArticle" (
  "id" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "category" TEXT,
  "body" TEXT NOT NULL,
  "tags" TEXT,
  "authorId" TEXT,
  "authorName" TEXT,
  "views" INTEGER NOT NULL DEFAULT 0,
  "status" TEXT NOT NULL DEFAULT 'Draft',
  "publishedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "KnowledgeArticle_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "KnowledgeArticle_slug_key" ON "KnowledgeArticle"("slug");
CREATE INDEX IF NOT EXISTS "KnowledgeArticle_status_idx" ON "KnowledgeArticle"("status");
CREATE INDEX IF NOT EXISTS "KnowledgeArticle_category_idx" ON "KnowledgeArticle"("category");

CREATE TABLE IF NOT EXISTS "MentorProfile" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "bio" TEXT,
  "expertise" TEXT,
  "yearsExp" INTEGER NOT NULL DEFAULT 0,
  "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "acceptingMentees" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "MentorProfile_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "MentorProfile_userId_key" ON "MentorProfile"("userId");

CREATE TABLE IF NOT EXISTS "MentorshipSession" (
  "id" TEXT NOT NULL,
  "mentorId" TEXT NOT NULL,
  "menteeId" TEXT NOT NULL,
  "topic" TEXT NOT NULL,
  "scheduledAt" TIMESTAMP(3) NOT NULL,
  "durationMins" INTEGER NOT NULL DEFAULT 30,
  "status" TEXT NOT NULL DEFAULT 'Requested',
  "notes" TEXT,
  "rating" INTEGER,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "MentorshipSession_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "MentorshipSession_mentorId_idx" ON "MentorshipSession"("mentorId");
CREATE INDEX IF NOT EXISTS "MentorshipSession_menteeId_idx" ON "MentorshipSession"("menteeId");
DO $$ BEGIN
  ALTER TABLE "MentorshipSession" ADD CONSTRAINT "MentorshipSession_mentorId_fkey"
    FOREIGN KEY ("mentorId") REFERENCES "MentorProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "Poll" (
  "id" TEXT NOT NULL,
  "question" TEXT NOT NULL,
  "options" JSONB NOT NULL,
  "multiSelect" BOOLEAN NOT NULL DEFAULT false,
  "closesAt" TIMESTAMP(3),
  "status" TEXT NOT NULL DEFAULT 'Open',
  "createdBy" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Poll_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "PollResponse" (
  "id" TEXT NOT NULL,
  "pollId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "choices" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PollResponse_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "PollResponse_pollId_userId_key" ON "PollResponse"("pollId", "userId");
DO $$ BEGIN
  ALTER TABLE "PollResponse" ADD CONSTRAINT "PollResponse_pollId_fkey"
    FOREIGN KEY ("pollId") REFERENCES "Poll"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "Kudos" (
  "id" TEXT NOT NULL,
  "fromUserId" TEXT NOT NULL,
  "fromName" TEXT NOT NULL,
  "toUserId" TEXT NOT NULL,
  "toName" TEXT NOT NULL,
  "category" TEXT NOT NULL DEFAULT 'Teamwork',
  "message" TEXT NOT NULL,
  "points" INTEGER NOT NULL DEFAULT 10,
  "visibility" TEXT NOT NULL DEFAULT 'public',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Kudos_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "Kudos_toUserId_idx" ON "Kudos"("toUserId");
CREATE INDEX IF NOT EXISTS "Kudos_fromUserId_idx" ON "Kudos"("fromUserId");

-- #68 Referral Program
CREATE TABLE IF NOT EXISTS "Referral" (
  "id" TEXT NOT NULL,
  "referralCode" TEXT NOT NULL,
  "referrerId" TEXT NOT NULL,
  "referrerName" TEXT NOT NULL,
  "refereeEmail" TEXT NOT NULL,
  "refereeName" TEXT,
  "status" TEXT NOT NULL DEFAULT 'Pending',
  "rewardAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "rewardCurrency" TEXT NOT NULL DEFAULT 'USD',
  "signedAt" TIMESTAMP(3),
  "qualifiedAt" TIMESTAMP(3),
  "paidAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Referral_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "Referral_referralCode_key" ON "Referral"("referralCode");
CREATE INDEX IF NOT EXISTS "Referral_referrerId_idx" ON "Referral"("referrerId");
CREATE INDEX IF NOT EXISTS "Referral_status_idx" ON "Referral"("status");

-- #69–71 Portals
CREATE TABLE IF NOT EXISTS "PortalSession" (
  "id" TEXT NOT NULL,
  "portalType" TEXT NOT NULL,
  "externalId" TEXT NOT NULL,
  "externalName" TEXT NOT NULL,
  "loginAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "ipAddress" TEXT,
  "userAgent" TEXT,
  "actionsCount" INTEGER NOT NULL DEFAULT 0,
  "lastActionAt" TIMESTAMP(3),
  CONSTRAINT "PortalSession_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "PortalSession_portalType_idx" ON "PortalSession"("portalType");
CREATE INDEX IF NOT EXISTS "PortalSession_externalId_idx" ON "PortalSession"("externalId");

CREATE TABLE IF NOT EXISTS "PortalAction" (
  "id" TEXT NOT NULL,
  "sessionId" TEXT NOT NULL,
  "portalType" TEXT NOT NULL,
  "externalId" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "payload" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PortalAction_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "PortalAction_sessionId_idx" ON "PortalAction"("sessionId");
CREATE INDEX IF NOT EXISTS "PortalAction_portalType_externalId_idx" ON "PortalAction"("portalType", "externalId");

CREATE TABLE IF NOT EXISTS "MobileApiToken" (
  "id" TEXT NOT NULL,
  "token" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "deviceId" TEXT,
  "platform" TEXT,
  "scopes" TEXT NOT NULL DEFAULT 'read',
  "active" BOOLEAN NOT NULL DEFAULT true,
  "lastUsedAt" TIMESTAMP(3),
  "expiresAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "MobileApiToken_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "MobileApiToken_token_key" ON "MobileApiToken"("token");
CREATE INDEX IF NOT EXISTS "MobileApiToken_userId_idx" ON "MobileApiToken"("userId");

CREATE TABLE IF NOT EXISTS "MobileApiCall" (
  "id" TEXT NOT NULL,
  "tokenId" TEXT,
  "endpoint" TEXT NOT NULL,
  "method" TEXT NOT NULL,
  "statusCode" INTEGER NOT NULL,
  "latencyMs" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "MobileApiCall_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "MobileApiCall_endpoint_idx" ON "MobileApiCall"("endpoint");
CREATE INDEX IF NOT EXISTS "MobileApiCall_createdAt_idx" ON "MobileApiCall"("createdAt");

-- #54 Integration Bus
CREATE TABLE IF NOT EXISTS "IntegrationEndpoint" (
  "id" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "url" TEXT NOT NULL,
  "method" TEXT NOT NULL DEFAULT 'POST',
  "authType" TEXT NOT NULL DEFAULT 'none',
  "authValue" TEXT,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "retryPolicy" TEXT NOT NULL DEFAULT '3x-exponential',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "IntegrationEndpoint_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "IntegrationEndpoint_code_key" ON "IntegrationEndpoint"("code");

CREATE TABLE IF NOT EXISTS "IntegrationDelivery" (
  "id" TEXT NOT NULL,
  "endpointId" TEXT NOT NULL,
  "event" TEXT NOT NULL,
  "payload" JSONB NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'Pending',
  "attempts" INTEGER NOT NULL DEFAULT 0,
  "responseCode" INTEGER,
  "responseBody" TEXT,
  "deliveredAt" TIMESTAMP(3),
  "nextRetryAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "IntegrationDelivery_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IntegrationDelivery_endpointId_idx" ON "IntegrationDelivery"("endpointId");
CREATE INDEX IF NOT EXISTS "IntegrationDelivery_status_idx" ON "IntegrationDelivery"("status");
DO $$ BEGIN
  ALTER TABLE "IntegrationDelivery" ADD CONSTRAINT "IntegrationDelivery_endpointId_fkey"
    FOREIGN KEY ("endpointId") REFERENCES "IntegrationEndpoint"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- #55 Data Ocean
CREATE TABLE IF NOT EXISTS "DataSnapshot" (
  "id" TEXT NOT NULL,
  "tableName" TEXT NOT NULL,
  "recordCount" INTEGER NOT NULL DEFAULT 0,
  "sizeBytes" INTEGER NOT NULL DEFAULT 0,
  "format" TEXT NOT NULL DEFAULT 'json',
  "storageRef" TEXT,
  "capturedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "capturedBy" TEXT,
  "metadata" JSONB,
  CONSTRAINT "DataSnapshot_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "DataSnapshot_tableName_idx" ON "DataSnapshot"("tableName");
CREATE INDEX IF NOT EXISTS "DataSnapshot_capturedAt_idx" ON "DataSnapshot"("capturedAt");

-- #56 AI Engine — model registry
CREATE TABLE IF NOT EXISTS "AiModel" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'Active',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AiModel_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "AiModel_provider_idx" ON "AiModel"("provider");
CREATE INDEX IF NOT EXISTS "AiModel_status_idx" ON "AiModel"("status");
CREATE INDEX IF NOT EXISTS "AiModel_name_idx" ON "AiModel"("name");

-- #57 Harvoice
CREATE TABLE IF NOT EXISTS "VoiceCommand" (
  "id" TEXT NOT NULL,
  "userId" TEXT,
  "transcript" TEXT NOT NULL,
  "intent" TEXT NOT NULL,
  "entities" JSONB,
  "confidence" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "responseText" TEXT,
  "durationMs" INTEGER NOT NULL DEFAULT 0,
  "status" TEXT NOT NULL DEFAULT 'Processed',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "VoiceCommand_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "VoiceCommand_intent_idx" ON "VoiceCommand"("intent");
CREATE INDEX IF NOT EXISTS "VoiceCommand_createdAt_idx" ON "VoiceCommand"("createdAt");

-- #61 Trade Floor
CREATE TABLE IF NOT EXISTS "TradeInstrument" (
  "id" TEXT NOT NULL,
  "symbol" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "category" TEXT NOT NULL DEFAULT 'Commodity',
  "unit" TEXT NOT NULL DEFAULT 'unit',
  "lastPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "baseCurrency" TEXT NOT NULL DEFAULT 'USD',
  "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "TradeInstrument_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "TradeInstrument_symbol_key" ON "TradeInstrument"("symbol");

CREATE TABLE IF NOT EXISTS "TradeOrder" (
  "id" TEXT NOT NULL,
  "instrumentId" TEXT NOT NULL,
  "traderId" TEXT NOT NULL,
  "side" TEXT NOT NULL,
  "orderType" TEXT NOT NULL DEFAULT 'limit',
  "price" DOUBLE PRECISION NOT NULL,
  "qty" DOUBLE PRECISION NOT NULL,
  "filledQty" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "status" TEXT NOT NULL DEFAULT 'Open',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "TradeOrder_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "TradeOrder_instrumentId_idx" ON "TradeOrder"("instrumentId");
CREATE INDEX IF NOT EXISTS "TradeOrder_status_idx" ON "TradeOrder"("status");
DO $$ BEGIN
  ALTER TABLE "TradeOrder" ADD CONSTRAINT "TradeOrder_instrumentId_fkey"
    FOREIGN KEY ("instrumentId") REFERENCES "TradeInstrument"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "Trade" (
  "id" TEXT NOT NULL,
  "instrumentId" TEXT NOT NULL,
  "buyOrderId" TEXT NOT NULL,
  "sellOrderId" TEXT NOT NULL,
  "price" DOUBLE PRECISION NOT NULL,
  "qty" DOUBLE PRECISION NOT NULL,
  "buyerId" TEXT NOT NULL,
  "sellerId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Trade_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "Trade_instrumentId_idx" ON "Trade"("instrumentId");
CREATE INDEX IF NOT EXISTS "Trade_createdAt_idx" ON "Trade"("createdAt");
DO $$ BEGIN
  ALTER TABLE "Trade" ADD CONSTRAINT "Trade_instrumentId_fkey"
    FOREIGN KEY ("instrumentId") REFERENCES "TradeInstrument"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- #65 Crypto Lite
CREATE TABLE IF NOT EXISTS "CryptoAsset" (
  "id" TEXT NOT NULL,
  "symbol" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "priceUsd" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "change24h" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CryptoAsset_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "CryptoAsset_symbol_key" ON "CryptoAsset"("symbol");

CREATE TABLE IF NOT EXISTS "CryptoHolding" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "assetId" TEXT NOT NULL,
  "qty" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "avgCostUsd" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CryptoHolding_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "CryptoHolding_userId_assetId_key" ON "CryptoHolding"("userId", "assetId");
CREATE INDEX IF NOT EXISTS "CryptoHolding_userId_idx" ON "CryptoHolding"("userId");
DO $$ BEGIN
  ALTER TABLE "CryptoHolding" ADD CONSTRAINT "CryptoHolding_assetId_fkey"
    FOREIGN KEY ("assetId") REFERENCES "CryptoAsset"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "CryptoTrade" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "assetId" TEXT NOT NULL,
  "side" TEXT NOT NULL,
  "qty" DOUBLE PRECISION NOT NULL,
  "priceUsd" DOUBLE PRECISION NOT NULL,
  "totalUsd" DOUBLE PRECISION NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CryptoTrade_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "CryptoTrade_userId_idx" ON "CryptoTrade"("userId");
CREATE INDEX IF NOT EXISTS "CryptoTrade_assetId_idx" ON "CryptoTrade"("assetId");
DO $$ BEGIN
  ALTER TABLE "CryptoTrade" ADD CONSTRAINT "CryptoTrade_assetId_fkey"
    FOREIGN KEY ("assetId") REFERENCES "CryptoAsset"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
