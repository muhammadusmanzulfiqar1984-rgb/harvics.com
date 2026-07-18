-- HarvyX leads — Cloudflare D1 (SQLite) schema
-- Applied with: wrangler d1 execute harvics-leads --file=migrations/0001_leads.sql [--local|--remote]

CREATE TABLE IF NOT EXISTS leads (
  id           TEXT PRIMARY KEY,
  source       TEXT,
  source_file  TEXT,
  company      TEXT,
  contact_name TEXT,
  title        TEXT,
  email        TEXT,
  phone        TEXT,
  linkedin     TEXT,
  website      TEXT,
  country      TEXT,
  city         TEXT,
  segment      TEXT,
  tags         TEXT,          -- JSON array as text
  status       TEXT DEFAULT 'new',
  score        INTEGER DEFAULT 0,
  created_at   TEXT,
  updated_at   TEXT,
  search_text  TEXT           -- lowercased concat for LIKE search
);

CREATE INDEX IF NOT EXISTS idx_leads_status   ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_score    ON leads(score);
CREATE INDEX IF NOT EXISTS idx_leads_country  ON leads(country);
CREATE INDEX IF NOT EXISTS idx_leads_segment  ON leads(segment);
CREATE INDEX IF NOT EXISTS idx_leads_company  ON leads(company);
CREATE INDEX IF NOT EXISTS idx_leads_email    ON leads(email);
