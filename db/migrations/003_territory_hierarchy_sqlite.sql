-- SQLite-Compatible Territory Hierarchy Migration
-- 7-Tier Hierarchy: Global → Continent → Regional → Country → City → District → Street → Point

-- Level 1: Global (Single root node)
CREATE TABLE IF NOT EXISTS territory_global (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL DEFAULT 'Global',
  code TEXT UNIQUE NOT NULL DEFAULT 'GLOBAL',
  description TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Level 2: Continents
CREATE TABLE IF NOT EXISTS territory_continent (
  id TEXT PRIMARY KEY,
  global_id TEXT NOT NULL,
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (global_id) REFERENCES territory_global(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_continent_global ON territory_continent(global_id);
CREATE INDEX IF NOT EXISTS idx_continent_code ON territory_continent(code);

-- Level 3: Regional (Sub-continental regions)
CREATE TABLE IF NOT EXISTS territory_regional (
  id TEXT PRIMARY KEY,
  continent_id TEXT NOT NULL,
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (continent_id) REFERENCES territory_continent(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_regional_continent ON territory_regional(continent_id);
CREATE INDEX IF NOT EXISTS idx_regional_code ON territory_regional(code);

-- Level 4: Countries
CREATE TABLE IF NOT EXISTS territory_country (
  id TEXT PRIMARY KEY,
  regional_id TEXT NOT NULL,
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  iso_code_2 TEXT,
  currency_code TEXT,
  currency_symbol TEXT,
  timezone TEXT,
  locale TEXT,
  display_order INTEGER DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (regional_id) REFERENCES territory_regional(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_country_regional ON territory_country(regional_id);
CREATE INDEX IF NOT EXISTS idx_country_code ON territory_country(code);
CREATE INDEX IF NOT EXISTS idx_country_iso2 ON territory_country(iso_code_2);

-- Level 5: Cities
CREATE TABLE IF NOT EXISTS territory_city (
  id TEXT PRIMARY KEY,
  country_id TEXT NOT NULL,
  name TEXT NOT NULL,
  code TEXT,
  latitude REAL,
  longitude REAL,
  population INTEGER,
  is_capital INTEGER DEFAULT 0,
  display_order INTEGER DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (country_id) REFERENCES territory_country(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_city_country ON territory_city(country_id);
CREATE INDEX IF NOT EXISTS idx_city_code ON territory_city(code);

-- Level 6: Districts/Areas
CREATE TABLE IF NOT EXISTS territory_district (
  id TEXT PRIMARY KEY,
  city_id TEXT NOT NULL,
  name TEXT NOT NULL,
  code TEXT,
  postal_code TEXT,
  latitude REAL,
  longitude REAL,
  display_order INTEGER DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (city_id) REFERENCES territory_city(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_district_city ON territory_district(city_id);
CREATE INDEX IF NOT EXISTS idx_district_code ON territory_district(code);
CREATE INDEX IF NOT EXISTS idx_district_postal ON territory_district(postal_code);

-- Level 7: Streets/Roads
CREATE TABLE IF NOT EXISTS territory_street (
  id TEXT PRIMARY KEY,
  district_id TEXT NOT NULL,
  name TEXT NOT NULL,
  code TEXT,
  street_type TEXT,
  display_order INTEGER DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (district_id) REFERENCES territory_district(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_street_district ON territory_street(district_id);
CREATE INDEX IF NOT EXISTS idx_street_code ON territory_street(code);

-- Level 8: Points/Locations (Final level)
CREATE TABLE IF NOT EXISTS territory_point (
  id TEXT PRIMARY KEY,
  street_id TEXT NOT NULL,
  name TEXT NOT NULL,
  code TEXT,
  point_type TEXT,
  address_line1 TEXT,
  address_line2 TEXT,
  building_number TEXT,
  latitude REAL,
  longitude REAL,
  phone TEXT,
  email TEXT,
  contact_person TEXT,
  metadata TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (street_id) REFERENCES territory_street(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_point_street ON territory_point(street_id);
CREATE INDEX IF NOT EXISTS idx_point_code ON territory_point(code);
CREATE INDEX IF NOT EXISTS idx_point_type ON territory_point(point_type);

-- Insert Global root
INSERT OR IGNORE INTO territory_global (id, name, code) 
VALUES ('global-1', 'Global', 'GLOBAL');

-- Insert Continents
INSERT OR IGNORE INTO territory_continent (id, global_id, name, code, display_order)
VALUES 
  ('continent-eu', 'global-1', 'Europe', 'EU', 1),
  ('continent-as', 'global-1', 'Asia', 'AS', 2),
  ('continent-na', 'global-1', 'North America', 'NA', 3),
  ('continent-sa', 'global-1', 'South America', 'SA', 4),
  ('continent-af', 'global-1', 'Africa', 'AF', 5),
  ('continent-oc', 'global-1', 'Oceania', 'OC', 6);

-- Insert Regional: Western Europe
INSERT OR IGNORE INTO territory_regional (id, continent_id, name, code, display_order)
VALUES ('region-weu', 'continent-eu', 'Western Europe', 'WEU', 1);

-- Insert Country: United Kingdom
INSERT OR IGNORE INTO territory_country (id, regional_id, name, code, iso_code_2, currency_code, currency_symbol, timezone, locale, display_order)
VALUES ('country-gbr', 'region-weu', 'United Kingdom', 'GBR', 'GB', 'GBP', '£', 'Europe/London', 'en-GB', 1);

-- Insert City: London
INSERT OR IGNORE INTO territory_city (id, country_id, name, code, latitude, longitude, population, is_capital, display_order)
VALUES ('city-london', 'country-gbr', 'London', 'LON', 51.5074, -0.1278, 9000000, 1, 1);

-- Insert District: Edgware
INSERT OR IGNORE INTO territory_district (id, city_id, name, code, postal_code, latitude, longitude, display_order)
VALUES ('district-edgware', 'city-london', 'Edgware', 'EDG', 'HA8', 51.6144, -0.2750, 1);

-- Insert Street: High Street
INSERT OR IGNORE INTO territory_street (id, district_id, name, code, street_type, display_order)
VALUES ('street-high-street', 'district-edgware', 'High Street', 'HS', 'Street', 1);

-- Insert Point: Victoria Casino Distribution
INSERT OR IGNORE INTO territory_point (
  id, street_id, name, code, point_type, 
  address_line1, building_number,
  latitude, longitude, phone, email, contact_person
)
VALUES (
  'point-victoria-casino',
  'street-high-street',
  'Victoria Casino Distribution',
  'VCD-001',
  'Distribution Center',
  'High Street',
  '123',
  51.6144,
  -0.2750,
  '+44 20 1234 5678',
  'distribution.uk@harvics.com',
  'John Smith'
);

