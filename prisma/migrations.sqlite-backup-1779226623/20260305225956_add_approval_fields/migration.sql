-- AlterTable
ALTER TABLE "Approval" ADD COLUMN "approvedAt" TEXT;
ALTER TABLE "Approval" ADD COLUMN "approvedBy" TEXT;
ALTER TABLE "Approval" ADD COLUMN "notes" TEXT;
ALTER TABLE "Approval" ADD COLUMN "rejectedAt" TEXT;
ALTER TABLE "Approval" ADD COLUMN "rejectedBy" TEXT;
ALTER TABLE "Approval" ADD COLUMN "rejectionReason" TEXT;
