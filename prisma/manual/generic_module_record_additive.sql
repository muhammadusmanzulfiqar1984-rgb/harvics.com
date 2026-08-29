-- Optional: generic 71-module JSON bag table (stub catalog seed).
-- Not required for Module #1 GL or Module #3 AR.

CREATE TABLE IF NOT EXISTS "GenericModuleRecord" (
  "id" TEXT NOT NULL,
  "moduleId" INTEGER NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'Active',
  "data" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "GenericModuleRecord_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "GenericModuleRecord_moduleId_idx" ON "GenericModuleRecord"("moduleId");
CREATE INDEX IF NOT EXISTS "GenericModuleRecord_moduleId_status_idx" ON "GenericModuleRecord"("moduleId", "status");
CREATE INDEX IF NOT EXISTS "GenericModuleRecord_createdAt_idx" ON "GenericModuleRecord"("createdAt");

-- Seed universal-path modules (#43 #50 #53 #56 #58) + Field Officer (#71) when empty.
INSERT INTO "GenericModuleRecord" ("id", "moduleId", "status", "data", "createdAt", "updatedAt")
SELECT 'gmr-seed-43-okr-001', 43, 'Active',
  '{"objective":"Ship OS analytics band","owner":"PMO","period":"2026-H2","progress":42,"keyResults":4,"completed":1}'::jsonb,
  CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "GenericModuleRecord" WHERE "moduleId" = 43);

INSERT INTO "GenericModuleRecord" ("id", "moduleId", "status", "data", "createdAt", "updatedAt")
SELECT 'gmr-seed-50-audit-001', 50, 'Active',
  '{"action":"login","actorId":"admin","result":"success","module":"platform"}'::jsonb,
  CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "GenericModuleRecord" WHERE "moduleId" = 50);

INSERT INTO "GenericModuleRecord" ("id", "moduleId", "status", "data", "createdAt", "updatedAt")
SELECT 'gmr-seed-53-admin-001', 53, 'Active',
  '{"username":"hq.admin","role":"admin","active":true,"mfaEnabled":true}'::jsonb,
  CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "GenericModuleRecord" WHERE "moduleId" = 53);

INSERT INTO "GenericModuleRecord" ("id", "moduleId", "status", "data", "createdAt", "updatedAt")
SELECT 'gmr-seed-56-ai-001', 56, 'Active',
  '{"name":"Harvics LLM Router","provider":"groq","model":"llama-3.3-70b","status":"demo"}'::jsonb,
  CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "GenericModuleRecord" WHERE "moduleId" = 56);

INSERT INTO "GenericModuleRecord" ("id", "moduleId", "status", "data", "createdAt", "updatedAt")
SELECT 'gmr-seed-58-locale-001', 58, 'Active',
  '{"code":"en","name":"English","direction":"ltr","enabled":true,"currency":"USD"}'::jsonb,
  CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "GenericModuleRecord" WHERE "moduleId" = 58);

INSERT INTO "GenericModuleRecord" ("id", "moduleId", "status", "data", "createdAt", "updatedAt")
SELECT 'gmr-seed-71-fo-001', 71, 'Active',
  '{"name":"Omar Farouk","territory":"AE","role":"Field Officer","visitsToday":12,"samplesCollected":47}'::jsonb,
  CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "GenericModuleRecord" WHERE "moduleId" = 71);
