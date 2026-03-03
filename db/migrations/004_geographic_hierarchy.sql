-- Migration: Complete Geographic Hierarchy System
-- Implements: Global → Continent → Region → Country → City → District → Location
-- Created: 2025-01-21

-- ============================================
-- GEOGRAPHIC HIERARCHY TABLES
-- ============================================

-- Level 1: Continents
CREATE TABLE IF NOT EXISTS continents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(10) UNIQUE NOT NULL,  -- 'EU', 'AS', 'NA', 'SA', 'AF', 'OC'
  name VARCHAR(100) NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_continents_code ON continents(code);

-- Level 2: Regions (within continents)
CREATE TABLE IF NOT EXISTS geographic_regions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  continent_id UUID NOT NULL REFERENCES continents(id) ON DELETE CASCADE,
  code VARCHAR(20) UNIQUE NOT NULL,  -- 'WEU', 'EEU', 'SEA', etc.
  name VARCHAR(100) NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_geographic_regions_continent_id ON geographic_regions(continent_id);
CREATE INDEX IF NOT EXISTS idx_geographic_regions_code ON geographic_regions(code);

-- Update existing regions table to link to geographic_regions
-- (if regions table exists, we'll keep it for backward compatibility)
ALTER TABLE IF EXISTS regions ADD COLUMN IF NOT EXISTS geographic_region_id UUID REFERENCES geographic_regions(id);

-- Update countries table to include continent and geographic region
ALTER TABLE IF EXISTS countries ADD COLUMN IF NOT EXISTS continent_id UUID REFERENCES continents(id);
ALTER TABLE IF EXISTS countries ADD COLUMN IF NOT EXISTS geographic_region_id UUID REFERENCES geographic_regions(id);

-- Level 4: Districts/Areas (within cities)
CREATE TABLE IF NOT EXISTS districts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city_id UUID NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  postal_codes TEXT[],  -- Array of postal codes
  boundaries JSONB,  -- GeoJSON for boundaries
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_districts_city_id ON districts(city_id);
CREATE INDEX IF NOT EXISTS idx_districts_code ON districts(code);

-- Level 5: Areas/Streets (within districts)
CREATE TABLE IF NOT EXISTS areas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  district_id UUID NOT NULL REFERENCES districts(id) ON DELETE CASCADE,
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(200) NOT NULL,
  display_name VARCHAR(200) NOT NULL,
  street_name VARCHAR(200),
  boundaries JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_areas_district_id ON areas(district_id);
CREATE INDEX IF NOT EXISTS idx_areas_code ON areas(code);

-- Level 6: Specific Locations (retailers, warehouses, distribution points)
CREATE TABLE IF NOT EXISTS specific_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  area_id UUID REFERENCES areas(id) ON DELETE SET NULL,
  district_id UUID REFERENCES districts(id) ON DELETE SET NULL,  -- Direct reference for cases without area
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(200) NOT NULL,
  display_name VARCHAR(200) NOT NULL,
  address TEXT,
  latitude NUMERIC(10,6),
  longitude NUMERIC(10,6),
  location_type VARCHAR(50) NOT NULL,  -- 'retailer', 'warehouse', 'distribution_point', 'customer', etc.
  external_id VARCHAR(100),  -- Reference to retailers/distributors/etc.
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_specific_locations_area_id ON specific_locations(area_id);
CREATE INDEX IF NOT EXISTS idx_specific_locations_district_id ON specific_locations(district_id);
CREATE INDEX IF NOT EXISTS idx_specific_locations_code ON specific_locations(code);
CREATE INDEX IF NOT EXISTS idx_specific_locations_type ON specific_locations(location_type);
CREATE INDEX IF NOT EXISTS idx_specific_locations_coordinates ON specific_locations USING GIST (point(longitude, latitude));

-- Geographic Hierarchy Path (for quick lookups and full path generation)
CREATE TABLE IF NOT EXISTS geo_hierarchy_paths (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id UUID NOT NULL,  -- Can reference cities, districts, areas, or specific_locations
  location_type VARCHAR(50) NOT NULL,  -- 'city', 'district', 'area', 'specific_location'
  
  -- Full path components
  level_1_global BOOLEAN DEFAULT TRUE,
  level_2_continent_id UUID REFERENCES continents(id),
  level_3_region_id UUID REFERENCES geographic_regions(id),
  level_4_country_id UUID REFERENCES countries(id),
  level_5_city_id UUID REFERENCES cities(id),
  level_6_district_id UUID REFERENCES districts(id),
  level_7_area_id UUID REFERENCES areas(id),
  level_8_location_id UUID REFERENCES specific_locations(id),
  
  -- Full path string for easy querying
  full_path TEXT NOT NULL,  -- 'Global/Europe/Western Europe/United Kingdom/London/Westminster/Edgeware Road/Victoria Casino'
  path_codes TEXT NOT NULL,  -- 'GLOBAL/EU/WEU/GBR/LON/WEST/EDG/VIC-CAS-001'
  
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_geo_hierarchy_paths_location_id ON geo_hierarchy_paths(location_id);
CREATE INDEX IF NOT EXISTS idx_geo_hierarchy_paths_location_type ON geo_hierarchy_paths(location_type);
CREATE INDEX IF NOT EXISTS idx_geo_hierarchy_paths_full_path ON geo_hierarchy_paths USING GIN (full_path gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_geo_hierarchy_paths_country_id ON geo_hierarchy_paths(level_4_country_id);
CREATE INDEX IF NOT EXISTS idx_geo_hierarchy_paths_city_id ON geo_hierarchy_paths(level_5_city_id);
CREATE INDEX IF NOT EXISTS idx_geo_hierarchy_paths_district_id ON geo_hierarchy_paths(level_6_district_id);

-- Update territories table to support full geographic hierarchy
ALTER TABLE IF EXISTS territories ADD COLUMN IF NOT EXISTS continent_id UUID REFERENCES continents(id);
ALTER TABLE IF EXISTS territories ADD COLUMN IF NOT EXISTS geographic_region_id UUID REFERENCES geographic_regions(id);
ALTER TABLE IF EXISTS territories ADD COLUMN IF NOT EXISTS district_id UUID REFERENCES districts(id);
ALTER TABLE IF EXISTS territories ADD COLUMN IF NOT EXISTS area_id UUID REFERENCES areas(id);
ALTER TABLE IF EXISTS territories ADD COLUMN IF NOT EXISTS specific_location_id UUID REFERENCES specific_locations(id);
ALTER TABLE IF EXISTS territories ADD COLUMN IF NOT EXISTS full_path TEXT;
ALTER TABLE IF EXISTS territories ADD COLUMN IF NOT EXISTS coverage_type VARCHAR(50) DEFAULT 'full';  -- 'full', 'partial', 'exclusive'
ALTER TABLE IF EXISTS territories ADD COLUMN IF NOT EXISTS boundaries JSONB;  -- GeoJSON polygon

-- Update orders table to include full geographic hierarchy
ALTER TABLE IF EXISTS orders ADD COLUMN IF NOT EXISTS delivery_continent_id UUID REFERENCES continents(id);
ALTER TABLE IF EXISTS orders ADD COLUMN IF NOT EXISTS delivery_region_id UUID REFERENCES geographic_regions(id);
ALTER TABLE IF EXISTS orders ADD COLUMN IF NOT EXISTS delivery_district_id UUID REFERENCES districts(id);
ALTER TABLE IF EXISTS orders ADD COLUMN IF NOT EXISTS delivery_area_id UUID REFERENCES areas(id);
ALTER TABLE IF EXISTS orders ADD COLUMN IF NOT EXISTS delivery_location_id UUID REFERENCES specific_locations(id);
ALTER TABLE IF EXISTS orders ADD COLUMN IF NOT EXISTS delivery_full_path TEXT;
ALTER TABLE IF EXISTS orders ADD COLUMN IF NOT EXISTS delivery_coordinates JSONB;  -- {lat, lng}

-- Update distributor_warehouses to include geographic hierarchy
ALTER TABLE IF EXISTS distributor_warehouses ADD COLUMN IF NOT EXISTS district_id UUID REFERENCES districts(id);
ALTER TABLE IF EXISTS distributor_warehouses ADD COLUMN IF NOT EXISTS area_id UUID REFERENCES areas(id);
ALTER TABLE IF EXISTS distributor_warehouses ADD COLUMN IF NOT EXISTS specific_location_id UUID REFERENCES specific_locations(id);
ALTER TABLE IF EXISTS distributor_warehouses ADD COLUMN IF NOT EXISTS full_path TEXT;

-- Update retailers table to link to specific_locations
-- (Assuming retailers table exists)
ALTER TABLE IF EXISTS retail_outlet ADD COLUMN IF NOT EXISTS specific_location_id UUID REFERENCES specific_locations(id);
ALTER TABLE IF EXISTS retail_outlet ADD COLUMN IF NOT EXISTS district_id UUID REFERENCES districts(id);
ALTER TABLE IF EXISTS retail_outlet ADD COLUMN IF NOT EXISTS area_id UUID REFERENCES areas(id);
ALTER TABLE IF EXISTS retail_outlet ADD COLUMN IF NOT EXISTS full_path TEXT;

-- ============================================
-- INITIAL DATA: Continents
-- ============================================

INSERT INTO continents (code, name, display_name) VALUES
  ('GLOBAL', 'Global', 'Global'),
  ('EU', 'Europe', 'Europe'),
  ('AS', 'Asia', 'Asia'),
  ('NA', 'North America', 'North America'),
  ('SA', 'South America', 'South America'),
  ('AF', 'Africa', 'Africa'),
  ('OC', 'Oceania', 'Oceania')
ON CONFLICT (code) DO NOTHING;

-- ============================================
-- INITIAL DATA: Geographic Regions
-- ============================================

-- Europe Regions
INSERT INTO geographic_regions (continent_id, code, name, display_name)
SELECT id, 'WEU', 'Western Europe', 'Western Europe' FROM continents WHERE code = 'EU'
ON CONFLICT (code) DO NOTHING;

INSERT INTO geographic_regions (continent_id, code, name, display_name)
SELECT id, 'EEU', 'Eastern Europe', 'Eastern Europe' FROM continents WHERE code = 'EU'
ON CONFLICT (code) DO NOTHING;

INSERT INTO geographic_regions (continent_id, code, name, display_name)
SELECT id, 'NEU', 'Northern Europe', 'Northern Europe' FROM continents WHERE code = 'EU'
ON CONFLICT (code) DO NOTHING;

INSERT INTO geographic_regions (continent_id, code, name, display_name)
SELECT id, 'SEU', 'Southern Europe', 'Southern Europe' FROM continents WHERE code = 'EU'
ON CONFLICT (code) DO NOTHING;

-- Asia Regions
INSERT INTO geographic_regions (continent_id, code, name, display_name)
SELECT id, 'SEA', 'Southeast Asia', 'Southeast Asia' FROM continents WHERE code = 'AS'
ON CONFLICT (code) DO NOTHING;

INSERT INTO geographic_regions (continent_id, code, name, display_name)
SELECT id, 'EA', 'East Asia', 'East Asia' FROM continents WHERE code = 'AS'
ON CONFLICT (code) DO NOTHING;

INSERT INTO geographic_regions (continent_id, code, name, display_name)
SELECT id, 'SA', 'South Asia', 'South Asia' FROM continents WHERE code = 'AS'
ON CONFLICT (code) DO NOTHING;

INSERT INTO geographic_regions (continent_id, code, name, display_name)
SELECT id, 'WA', 'West Asia', 'West Asia' FROM continents WHERE code = 'AS'
ON CONFLICT (code) DO NOTHING;

-- ============================================
-- FUNCTIONS: Geographic Hierarchy Helpers
-- ============================================

-- Function to build full path for a location
CREATE OR REPLACE FUNCTION build_geo_path(
  p_location_type VARCHAR,
  p_location_id UUID
) RETURNS TEXT AS $$
DECLARE
  v_path TEXT := 'Global';
  v_continent_name TEXT;
  v_region_name TEXT;
  v_country_name TEXT;
  v_city_name TEXT;
  v_district_name TEXT;
  v_area_name TEXT;
  v_location_name TEXT;
BEGIN
  -- Build path based on location type
  IF p_location_type = 'specific_location' THEN
    SELECT 
      c.name, g.name, co.name, ci.name, d.name, a.name, sl.name
    INTO 
      v_continent_name, v_region_name, v_country_name, v_city_name, v_district_name, v_area_name, v_location_name
    FROM specific_locations sl
    LEFT JOIN areas a ON sl.area_id = a.id
    LEFT JOIN districts d ON COALESCE(sl.district_id, a.district_id) = d.id
    LEFT JOIN cities ci ON d.city_id = ci.id
    LEFT JOIN countries co ON ci.country_id = co.id
    LEFT JOIN geographic_regions g ON co.geographic_region_id = g.id
    LEFT JOIN continents c ON g.continent_id = c.id
    WHERE sl.id = p_location_id;
    
    v_path := v_path || '/' || COALESCE(v_continent_name, '') || '/' || 
              COALESCE(v_region_name, '') || '/' || 
              COALESCE(v_country_name, '') || '/' || 
              COALESCE(v_city_name, '') || '/' || 
              COALESCE(v_district_name, '') || '/' || 
              COALESCE(v_area_name, '') || '/' || 
              COALESCE(v_location_name, '');
              
  ELSIF p_location_type = 'city' THEN
    SELECT 
      c.name, g.name, co.name, ci.name
    INTO 
      v_continent_name, v_region_name, v_country_name, v_city_name
    FROM cities ci
    LEFT JOIN countries co ON ci.country_id = co.id
    LEFT JOIN geographic_regions g ON co.geographic_region_id = g.id
    LEFT JOIN continents c ON g.continent_id = c.id
    WHERE ci.id = p_location_id;
    
    v_path := v_path || '/' || COALESCE(v_continent_name, '') || '/' || 
              COALESCE(v_region_name, '') || '/' || 
              COALESCE(v_country_name, '') || '/' || 
              COALESCE(v_city_name, '');
  END IF;
  
  RETURN trim(v_path, '/');
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update full_path when hierarchy changes
CREATE OR REPLACE FUNCTION update_geo_path() RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_geo_path_trigger
  BEFORE UPDATE ON geo_hierarchy_paths
  FOR EACH ROW
  EXECUTE FUNCTION update_geo_path();

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE continents IS 'Level 1: Continents (Europe, Asia, etc.)';
COMMENT ON TABLE geographic_regions IS 'Level 2: Regions within continents (Western Europe, Southeast Asia, etc.)';
COMMENT ON TABLE districts IS 'Level 4: Districts/Areas within cities (Westminster, Camden, etc.)';
COMMENT ON TABLE areas IS 'Level 5: Areas/Streets within districts (Edgeware Road, etc.)';
COMMENT ON TABLE specific_locations IS 'Level 6: Specific locations (Victoria Casino, retailers, warehouses, etc.)';
COMMENT ON TABLE geo_hierarchy_paths IS 'Full geographic hierarchy paths for quick lookups';

