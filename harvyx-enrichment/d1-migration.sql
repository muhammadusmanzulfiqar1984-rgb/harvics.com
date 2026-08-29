-- HarvyX Enrichment — D1 migration
-- Run: wrangler d1 execute harvics-leads --remote --file=harvyx-enrichment/d1-migration.sql
--
-- title + linkedin already present on harvics-leads (0001). Only enrichment fields below.

ALTER TABLE leads ADD COLUMN domain TEXT;
ALTER TABLE leads ADD COLUMN location TEXT;
ALTER TABLE leads ADD COLUMN tech_stack TEXT;   -- JSON array stored as text
ALTER TABLE leads ADD COLUMN signals TEXT;      -- JSON array stored as text
ALTER TABLE leads ADD COLUMN enriched_at TEXT;

CREATE INDEX IF NOT EXISTS idx_leads_domain ON leads(domain);
CREATE INDEX IF NOT EXISTS idx_leads_location ON leads(location);
