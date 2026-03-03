-- Shipment Compliance Table Migration
-- For SQLite compatibility

CREATE TABLE IF NOT EXISTS shipment_compliance (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  shipment_id TEXT NOT NULL,
  country TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  review_notes TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_shipment_compliance_shipment_id ON shipment_compliance(shipment_id);
CREATE INDEX IF NOT EXISTS idx_shipment_compliance_status ON shipment_compliance(status);
CREATE INDEX IF NOT EXISTS idx_shipment_compliance_country ON shipment_compliance(country);

-- Trigger to update updated_at timestamp
CREATE TRIGGER IF NOT EXISTS update_shipment_compliance_timestamp 
AFTER UPDATE ON shipment_compliance
FOR EACH ROW
BEGIN
  UPDATE shipment_compliance SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

