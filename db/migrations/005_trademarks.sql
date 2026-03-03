-- Trademarks Table Migration
-- For SQLite compatibility

CREATE TABLE IF NOT EXISTS trademarks (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  brand_name TEXT NOT NULL,
  class_number TEXT,
  country TEXT NOT NULL,
  application_no TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  expiry_date DATE,
  documents TEXT, -- JSON array stored as text
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_trademarks_country ON trademarks(country);
CREATE INDEX IF NOT EXISTS idx_trademarks_status ON trademarks(status);
CREATE INDEX IF NOT EXISTS idx_trademarks_expiry_date ON trademarks(expiry_date);
CREATE INDEX IF NOT EXISTS idx_trademarks_brand_name ON trademarks(brand_name);

-- Trigger to update updated_at timestamp
CREATE TRIGGER IF NOT EXISTS update_trademarks_timestamp 
AFTER UPDATE ON trademarks
FOR EACH ROW
BEGIN
  UPDATE trademarks SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

