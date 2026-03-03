-- Phase-1: Competitor Intelligence OS Domain
-- Database migration for Competitor Intelligence OS tables

-- Competitor Products
CREATE TABLE IF NOT EXISTS competitor_products (
  id TEXT PRIMARY KEY,
  competitor_name TEXT NOT NULL,
  brand TEXT NOT NULL,
  sku_name TEXT NOT NULL,
  category TEXT,
  subcategory TEXT,
  size TEXT,
  pack_size TEXT,
  description TEXT,
  barcode TEXT,
  country TEXT NOT NULL,
  status TEXT DEFAULT 'tracking',
  first_seen_date DATE,
  last_seen_date DATE,
  source TEXT,
  images TEXT,
  metadata TEXT,
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

-- Competitor Pricing
CREATE TABLE IF NOT EXISTS competitor_pricing (
  id TEXT PRIMARY KEY,
  competitor_product_id TEXT,
  competitor_name TEXT NOT NULL,
  brand TEXT NOT NULL,
  sku_name TEXT NOT NULL,
  price REAL NOT NULL,
  currency TEXT NOT NULL,
  country TEXT NOT NULL,
  location TEXT,
  retailer_name TEXT,
  promotion TEXT,
  promotion_details TEXT,
  effective_date DATE NOT NULL,
  source TEXT,
  verified BOOLEAN DEFAULT 0,
  notes TEXT,
  territory TEXT,
  region_code TEXT,
  country_code TEXT,
  city_code TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Price Alerts
CREATE TABLE IF NOT EXISTS price_alerts (
  id TEXT PRIMARY KEY,
  competitor_name TEXT NOT NULL,
  brand TEXT NOT NULL,
  sku_name TEXT NOT NULL,
  country TEXT NOT NULL,
  alert_type TEXT NOT NULL,
  current_price REAL,
  previous_price REAL,
  price_change_percentage REAL,
  our_price REAL,
  price_difference_percentage REAL,
  severity TEXT DEFAULT 'medium',
  status TEXT DEFAULT 'open',
  notes TEXT,
  country_code TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Market Intelligence
CREATE TABLE IF NOT EXISTS market_intelligence (
  id TEXT PRIMARY KEY,
  country TEXT NOT NULL,
  category TEXT NOT NULL,
  competitor_name TEXT,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  market_share_percentage REAL,
  volume_sold REAL,
  revenue REAL,
  currency TEXT,
  growth_rate REAL,
  rank INTEGER,
  source TEXT,
  confidence_score REAL,
  notes TEXT,
  territory TEXT,
  region_code TEXT,
  country_code TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Competitor Profiles
CREATE TABLE IF NOT EXISTS competitor_profiles (
  id TEXT PRIMARY KEY,
  competitor_name TEXT UNIQUE NOT NULL,
  company_name TEXT,
  country TEXT,
  regions TEXT,
  product_categories TEXT,
  market_position TEXT,
  strengths TEXT,
  weaknesses TEXT,
  strategies TEXT,
  metadata TEXT,
  territory TEXT,
  country_code TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_competitor_products_competitor ON competitor_products(competitor_name);
CREATE INDEX IF NOT EXISTS idx_competitor_products_country ON competitor_products(country_code);
CREATE INDEX IF NOT EXISTS idx_competitor_products_status ON competitor_products(status);
CREATE INDEX IF NOT EXISTS idx_competitor_pricing_country ON competitor_pricing(country_code);
CREATE INDEX IF NOT EXISTS idx_competitor_pricing_date ON competitor_pricing(effective_date);
CREATE INDEX IF NOT EXISTS idx_competitor_pricing_competitor ON competitor_pricing(competitor_name);
CREATE INDEX IF NOT EXISTS idx_price_alerts_status ON price_alerts(status);
CREATE INDEX IF NOT EXISTS idx_price_alerts_country ON price_alerts(country_code);
CREATE INDEX IF NOT EXISTS idx_market_intel_country ON market_intelligence(country_code);
CREATE INDEX IF NOT EXISTS idx_market_intel_category ON market_intelligence(category);
CREATE INDEX IF NOT EXISTS idx_competitor_profiles_name ON competitor_profiles(competitor_name);

