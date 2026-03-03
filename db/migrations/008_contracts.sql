-- Contracts Table Migration
-- For SQLite compatibility

CREATE TABLE IF NOT EXISTS contracts (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  title TEXT NOT NULL,
  type TEXT NOT NULL, -- supplier/distributor/staff/other
  party_name TEXT NOT NULL,
  valid_from DATE NOT NULL,
  valid_to DATE,
  auto_renew BOOLEAN DEFAULT 0,
  file_url TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_contracts_type ON contracts(type);
CREATE INDEX IF NOT EXISTS idx_contracts_status ON contracts(status);
CREATE INDEX IF NOT EXISTS idx_contracts_valid_to ON contracts(valid_to);
CREATE INDEX IF NOT EXISTS idx_contracts_party_name ON contracts(party_name);

-- Trigger to update updated_at timestamp
CREATE TRIGGER IF NOT EXISTS update_contracts_timestamp 
AFTER UPDATE ON contracts
FOR EACH ROW
BEGIN
  UPDATE contracts SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

