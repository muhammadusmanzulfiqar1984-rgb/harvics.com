-- Import Partners Table Migration
-- For SQLite compatibility

CREATE TABLE IF NOT EXISTS import_partners (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  company_name TEXT NOT NULL,
  country TEXT NOT NULL,
  license_no TEXT,
  ports TEXT, -- JSON array stored as text
  status TEXT NOT NULL DEFAULT 'active',
  documents TEXT, -- JSON array stored as text
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_import_partners_country ON import_partners(country);
CREATE INDEX IF NOT EXISTS idx_import_partners_status ON import_partners(status);
CREATE INDEX IF NOT EXISTS idx_import_partners_company_name ON import_partners(company_name);

-- Trigger to update updated_at timestamp
CREATE TRIGGER IF NOT EXISTS update_import_partners_timestamp 
AFTER UPDATE ON import_partners
FOR EACH ROW
BEGIN
  UPDATE import_partners SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

