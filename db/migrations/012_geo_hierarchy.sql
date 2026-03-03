-- Geo Hierarchy Tables - VERSION-1 SPEC (8 Levels)
-- Hierarchy: Global → Continent → Region → Country → City → District → Area → Location

-- Level 1: Global
CREATE TABLE IF NOT EXISTS geo_global (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT UNIQUE,
  metadata TEXT, -- JSON
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Level 2: Continent
CREATE TABLE IF NOT EXISTS geo_continent (
  id TEXT PRIMARY KEY,
  global_id TEXT NOT NULL,
  name TEXT NOT NULL,
  code TEXT UNIQUE,
  metadata TEXT, -- JSON
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (global_id) REFERENCES geo_global(id) ON DELETE CASCADE
);

-- Level 3: Region
CREATE TABLE IF NOT EXISTS geo_region (
  id TEXT PRIMARY KEY,
  continent_id TEXT NOT NULL,
  name TEXT NOT NULL,
  code TEXT UNIQUE,
  metadata TEXT, -- JSON
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (continent_id) REFERENCES geo_continent(id) ON DELETE CASCADE
);

-- Level 4: Country
CREATE TABLE IF NOT EXISTS geo_country (
  id TEXT PRIMARY KEY,
  region_id TEXT NOT NULL,
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL, -- ISO country code (US, PK, AE, etc.)
  currency_code TEXT, -- For auto-switch (TASK 4)
  metadata TEXT, -- JSON
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (region_id) REFERENCES geo_region(id) ON DELETE CASCADE
);

-- Level 5: City
CREATE TABLE IF NOT EXISTS geo_city (
  id TEXT PRIMARY KEY,
  country_id TEXT NOT NULL,
  name TEXT NOT NULL,
  code TEXT,
  metadata TEXT, -- JSON
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (country_id) REFERENCES geo_country(id) ON DELETE CASCADE
);

-- Level 6: District
CREATE TABLE IF NOT EXISTS geo_district (
  id TEXT PRIMARY KEY,
  city_id TEXT NOT NULL,
  name TEXT NOT NULL,
  code TEXT,
  metadata TEXT, -- JSON
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (city_id) REFERENCES geo_city(id) ON DELETE CASCADE
);

-- Level 7: Area (Territory level - used for filtering)
CREATE TABLE IF NOT EXISTS geo_area (
  id TEXT PRIMARY KEY,
  district_id TEXT NOT NULL,
  name TEXT NOT NULL,
  code TEXT,
  metadata TEXT, -- JSON
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (district_id) REFERENCES geo_district(id) ON DELETE CASCADE
);

-- Level 8: Location (Final granular level)
CREATE TABLE IF NOT EXISTS geo_location (
  id TEXT PRIMARY KEY,
  area_id TEXT NOT NULL,
  name TEXT NOT NULL,
  code TEXT,
  latitude REAL,
  longitude REAL,
  metadata TEXT, -- JSON
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (area_id) REFERENCES geo_area(id) ON DELETE CASCADE
);

-- User Territory Assignments (TASK 3: Session-based binding)
CREATE TABLE IF NOT EXISTS user_territories (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  area_id TEXT NOT NULL, -- Level 7 (Area) is the territory level
  assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  assigned_by TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (area_id) REFERENCES geo_area(id) ON DELETE CASCADE,
  UNIQUE(user_id, area_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_geo_continent_global ON geo_continent(global_id);
CREATE INDEX IF NOT EXISTS idx_geo_region_continent ON geo_region(continent_id);
CREATE INDEX IF NOT EXISTS idx_geo_country_region ON geo_country(region_id);
CREATE INDEX IF NOT EXISTS idx_geo_country_code ON geo_country(code);
CREATE INDEX IF NOT EXISTS idx_geo_city_country ON geo_city(country_id);
CREATE INDEX IF NOT EXISTS idx_geo_district_city ON geo_district(city_id);
CREATE INDEX IF NOT EXISTS idx_geo_area_district ON geo_area(district_id);
CREATE INDEX IF NOT EXISTS idx_geo_location_area ON geo_location(area_id);
CREATE INDEX IF NOT EXISTS idx_user_territories_user ON user_territories(user_id);
CREATE INDEX IF NOT EXISTS idx_user_territories_area ON user_territories(area_id);

