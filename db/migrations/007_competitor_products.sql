-- Competitor Products Table Migration
-- For SQLite compatibility

CREATE TABLE IF NOT EXISTS competitor_products (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  brand TEXT NOT NULL,
  category TEXT,
  sku_name TEXT NOT NULL,
  size TEXT,
  price REAL,
  currency TEXT DEFAULT 'USD',
  country TEXT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_competitor_products_brand ON competitor_products(brand);
CREATE INDEX IF NOT EXISTS idx_competitor_products_category ON competitor_products(category);
CREATE INDEX IF NOT EXISTS idx_competitor_products_country ON competitor_products(country);
CREATE INDEX IF NOT EXISTS idx_competitor_products_brand_country ON competitor_products(brand, country);

-- Trigger to update updated_at timestamp
CREATE TRIGGER IF NOT EXISTS update_competitor_products_timestamp 
AFTER UPDATE ON competitor_products
FOR EACH ROW
BEGIN
  UPDATE competitor_products SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

