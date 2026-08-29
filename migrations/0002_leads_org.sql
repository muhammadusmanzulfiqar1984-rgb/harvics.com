-- Phase 4a: org_id on leads (default Harvics)
-- wrangler d1 execute harvics-leads --remote --file=migrations/0002_leads_org.sql

ALTER TABLE leads ADD COLUMN org_id TEXT DEFAULT 'harvics';
CREATE INDEX IF NOT EXISTS idx_leads_org ON leads(org_id);
