-- Legal Cases Table Migration
-- For SQLite compatibility

CREATE TABLE IF NOT EXISTS legal_cases (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  case_title TEXT NOT NULL,
  case_type TEXT NOT NULL,
  country TEXT NOT NULL,
  description TEXT,
  assigned_to TEXT,
  status TEXT NOT NULL DEFAULT 'open',
  hearing_date DATE,
  documents TEXT, -- JSON array stored as text
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_legal_cases_status ON legal_cases(status);
CREATE INDEX IF NOT EXISTS idx_legal_cases_country ON legal_cases(country);
CREATE INDEX IF NOT EXISTS idx_legal_cases_assigned_to ON legal_cases(assigned_to);
CREATE INDEX IF NOT EXISTS idx_legal_cases_hearing_date ON legal_cases(hearing_date);
CREATE INDEX IF NOT EXISTS idx_legal_cases_type ON legal_cases(case_type);

-- Trigger to update updated_at timestamp
CREATE TRIGGER IF NOT EXISTS update_legal_cases_timestamp 
AFTER UPDATE ON legal_cases
FOR EACH ROW
BEGIN
  UPDATE legal_cases SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

