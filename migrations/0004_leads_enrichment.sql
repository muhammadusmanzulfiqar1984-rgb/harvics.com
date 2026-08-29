-- HarvyX Enrichment — D1 migration (0004)
-- Run: wrangler d1 execute harvics-leads --remote --file=migrations/0004_leads_enrichment.sql
--
-- Note: title + linkedin already exist from 0001_leads.sql — do not re-ADD them.

ALTER TABLE leads ADD COLUMN domain TEXT;
ALTER TABLE leads ADD COLUMN location TEXT;
ALTER TABLE leads ADD COLUMN tech_stack TEXT;   -- JSON array stored as text
ALTER TABLE leads ADD COLUMN signals TEXT;      -- JSON array stored as text
ALTER TABLE leads ADD COLUMN enriched_at TEXT;

CREATE INDEX IF NOT EXISTS idx_leads_domain ON leads(domain);
CREATE INDEX IF NOT EXISTS idx_leads_location ON leads(location);
