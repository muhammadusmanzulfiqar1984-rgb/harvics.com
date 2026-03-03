-- Phase-1: Import/Export OS Domain
-- Database migration for Import/Export OS tables

-- Import Orders
CREATE TABLE IF NOT EXISTS import_orders (
  id TEXT PRIMARY KEY,
  order_no TEXT UNIQUE NOT NULL,
  supplier_id TEXT,
  supplier_name TEXT NOT NULL,
  import_partner_id TEXT,
  origin_country TEXT NOT NULL,
  destination_country TEXT NOT NULL,
  port_of_entry TEXT,
  order_date DATE NOT NULL,
  expected_arrival_date DATE,
  actual_arrival_date DATE,
  status TEXT NOT NULL DEFAULT 'pending',
  customs_status TEXT DEFAULT 'pending',
  total_value REAL,
  currency TEXT,
  total_weight REAL,
  total_volume REAL,
  incoterms TEXT,
  shipping_method TEXT,
  tracking_number TEXT,
  items TEXT,
  documents TEXT,
  notes TEXT,
  territory TEXT,
  region_code TEXT,
  country_code TEXT,
  city_code TEXT,
  district_code TEXT,
  area_code TEXT,
  location_code TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS import_order_items (
  id TEXT PRIMARY KEY,
  import_order_id TEXT NOT NULL,
  sku_code TEXT NOT NULL,
  sku_name TEXT,
  quantity REAL NOT NULL,
  unit_price REAL,
  currency TEXT,
  hs_code TEXT,
  weight REAL,
  volume REAL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (import_order_id) REFERENCES import_orders(id) ON DELETE CASCADE
);

-- Export Orders
CREATE TABLE IF NOT EXISTS export_orders (
  id TEXT PRIMARY KEY,
  order_no TEXT UNIQUE NOT NULL,
  customer_id TEXT,
  customer_name TEXT NOT NULL,
  distributor_id TEXT,
  origin_country TEXT NOT NULL,
  destination_country TEXT NOT NULL,
  port_of_exit TEXT,
  order_date DATE NOT NULL,
  expected_shipment_date DATE,
  actual_shipment_date DATE,
  status TEXT NOT NULL DEFAULT 'pending',
  export_license_status TEXT DEFAULT 'pending',
  customs_status TEXT DEFAULT 'pending',
  total_value REAL,
  currency TEXT,
  total_weight REAL,
  total_volume REAL,
  incoterms TEXT,
  shipping_method TEXT,
  tracking_number TEXT,
  items TEXT,
  documents TEXT,
  notes TEXT,
  territory TEXT,
  region_code TEXT,
  country_code TEXT,
  city_code TEXT,
  district_code TEXT,
  area_code TEXT,
  location_code TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS export_order_items (
  id TEXT PRIMARY KEY,
  export_order_id TEXT NOT NULL,
  sku_code TEXT NOT NULL,
  sku_name TEXT,
  quantity REAL NOT NULL,
  unit_price REAL,
  currency TEXT,
  hs_code TEXT,
  weight REAL,
  volume REAL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (export_order_id) REFERENCES export_orders(id) ON DELETE CASCADE
);

-- Customs Clearances
CREATE TABLE IF NOT EXISTS customs_clearances (
  id TEXT PRIMARY KEY,
  clearance_no TEXT UNIQUE NOT NULL,
  order_id TEXT,
  order_type TEXT NOT NULL,
  country TEXT NOT NULL,
  port_code TEXT,
  customs_office TEXT,
  filing_date DATE NOT NULL,
  clearance_date DATE,
  status TEXT NOT NULL DEFAULT 'pending',
  total_duty REAL DEFAULT 0,
  total_tax REAL DEFAULT 0,
  total_fees REAL DEFAULT 0,
  currency TEXT,
  duty_amount REAL,
  tax_amount REAL,
  fees_amount REAL,
  hs_codes TEXT,
  documents TEXT,
  notes TEXT,
  territory TEXT,
  region_code TEXT,
  country_code TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- HS Codes (Harmonized System)
CREATE TABLE IF NOT EXISTS hs_codes (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  category TEXT,
  unit TEXT,
  duty_rate REAL,
  duty_type TEXT,
  country TEXT,
  currency TEXT,
  effective_date DATE,
  expiry_date DATE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tariff_calculations (
  id TEXT PRIMARY KEY,
  clearance_id TEXT NOT NULL,
  hs_code TEXT NOT NULL,
  quantity REAL,
  unit_price REAL,
  currency TEXT,
  duty_rate REAL,
  duty_amount REAL,
  tax_rate REAL,
  tax_amount REAL,
  fees_amount REAL,
  total_amount REAL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (clearance_id) REFERENCES customs_clearances(id) ON DELETE CASCADE
);

-- Trade Documents
CREATE TABLE IF NOT EXISTS trade_documents (
  id TEXT PRIMARY KEY,
  document_no TEXT UNIQUE NOT NULL,
  document_type TEXT NOT NULL,
  order_id TEXT,
  order_type TEXT,
  country TEXT NOT NULL,
  issue_date DATE NOT NULL,
  expiry_date DATE,
  status TEXT NOT NULL DEFAULT 'draft',
  document_url TEXT,
  document_path TEXT,
  issued_by TEXT,
  verified_by TEXT,
  verification_date DATE,
  metadata TEXT,
  territory TEXT,
  region_code TEXT,
  country_code TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_import_orders_country ON import_orders(country_code);
CREATE INDEX IF NOT EXISTS idx_import_orders_status ON import_orders(status);
CREATE INDEX IF NOT EXISTS idx_import_orders_date ON import_orders(order_date);
CREATE INDEX IF NOT EXISTS idx_export_orders_country ON export_orders(country_code);
CREATE INDEX IF NOT EXISTS idx_export_orders_status ON export_orders(status);
CREATE INDEX IF NOT EXISTS idx_export_orders_date ON export_orders(order_date);
CREATE INDEX IF NOT EXISTS idx_clearances_country ON customs_clearances(country_code);
CREATE INDEX IF NOT EXISTS idx_clearances_status ON customs_clearances(status);
CREATE INDEX IF NOT EXISTS idx_hs_codes_code ON hs_codes(code);
CREATE INDEX IF NOT EXISTS idx_trade_docs_order ON trade_documents(order_id);
CREATE INDEX IF NOT EXISTS idx_trade_docs_type ON trade_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_trade_docs_status ON trade_documents(status);
