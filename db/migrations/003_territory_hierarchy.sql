-- Migration: Create Hierarchical Territory System
-- 8-Level Hierarchy: Global → Continent → Regional → Country → City → District → Street → Point
-- Part of Globalization Implementation
-- Created: 2025-01-XX

-- ============================================
-- TERRITORY HIERARCHY TABLES
-- ============================================

-- Level 1: Global (Single root node)
CREATE TABLE IF NOT EXISTS territory_global (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL DEFAULT 'Global',
  code VARCHAR(10) UNIQUE NOT NULL DEFAULT 'GLOBAL',
  description TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Level 2: Continents
CREATE TABLE IF NOT EXISTS territory_continent (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  global_id UUID NOT NULL REFERENCES territory_global(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(10) UNIQUE NOT NULL, -- e.g., 'EU', 'AS', 'NA', 'SA', 'AF', 'OC', 'AN'
  display_order INT DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_continent_global ON territory_continent(global_id);
CREATE INDEX IF NOT EXISTS idx_continent_code ON territory_continent(code);

-- Level 3: Regional (Sub-continental regions)
CREATE TABLE IF NOT EXISTS territory_regional (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  continent_id UUID NOT NULL REFERENCES territory_continent(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(20) UNIQUE NOT NULL, -- e.g., 'WEU', 'EEU', 'MEA', 'SEA'
  display_order INT DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_regional_continent ON territory_regional(continent_id);
CREATE INDEX IF NOT EXISTS idx_regional_code ON territory_regional(code);

-- Level 4: Countries
CREATE TABLE IF NOT EXISTS territory_country (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  regional_id UUID NOT NULL REFERENCES territory_regional(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(3) UNIQUE NOT NULL, -- ISO 3166-1 alpha-3
  iso_code_2 VARCHAR(2), -- ISO 3166-1 alpha-2
  currency_code VARCHAR(3),
  currency_symbol VARCHAR(5),
  timezone VARCHAR(50),
  locale VARCHAR(10),
  display_order INT DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_country_regional ON territory_country(regional_id);
CREATE INDEX IF NOT EXISTS idx_country_code ON territory_country(code);
CREATE INDEX IF NOT EXISTS idx_country_iso2 ON territory_country(iso_code_2);

-- Level 5: Cities
CREATE TABLE IF NOT EXISTS territory_city (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_id UUID NOT NULL REFERENCES territory_country(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(20),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  population BIGINT,
  is_capital BOOLEAN DEFAULT FALSE,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_city_country ON territory_city(country_id);
CREATE INDEX IF NOT EXISTS idx_city_code ON territory_city(code);
CREATE INDEX IF NOT EXISTS idx_city_location ON territory_city(latitude, longitude);

-- Level 6: Districts/Areas
CREATE TABLE IF NOT EXISTS territory_district (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city_id UUID NOT NULL REFERENCES territory_city(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(20),
  postal_code VARCHAR(20),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  display_order INT DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_district_city ON territory_district(city_id);
CREATE INDEX IF NOT EXISTS idx_district_code ON territory_district(code);
CREATE INDEX IF NOT EXISTS idx_district_postal ON territory_district(postal_code);

-- Level 7: Streets/Roads
CREATE TABLE IF NOT EXISTS territory_street (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  district_id UUID NOT NULL REFERENCES territory_district(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  code VARCHAR(20),
  street_type VARCHAR(50), -- Road, Street, Avenue, Boulevard, etc.
  display_order INT DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_street_district ON territory_street(district_id);
CREATE INDEX IF NOT EXISTS idx_street_code ON territory_street(code);

-- Level 8: Points/Locations (Final level - specific locations)
CREATE TABLE IF NOT EXISTS territory_point (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  street_id UUID NOT NULL REFERENCES territory_street(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  code VARCHAR(20),
  point_type VARCHAR(50), -- Distribution Center, Warehouse, Retail Outlet, Office, etc.
  address_line1 VARCHAR(255),
  address_line2 VARCHAR(255),
  building_number VARCHAR(50),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  phone VARCHAR(50),
  email VARCHAR(255),
  contact_person VARCHAR(100),
  metadata JSONB, -- Additional flexible data
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_point_street ON territory_point(street_id);
CREATE INDEX IF NOT EXISTS idx_point_code ON territory_point(code);
CREATE INDEX IF NOT EXISTS idx_point_type ON territory_point(point_type);
CREATE INDEX IF NOT EXISTS idx_point_location ON territory_point(latitude, longitude);

-- ============================================
-- TERRITORY PATH VIEW (Full hierarchy path)
-- ============================================
CREATE OR REPLACE VIEW territory_full_path AS
SELECT 
  p.id as point_id,
  p.name as point_name,
  p.code as point_code,
  p.point_type,
  s.id as street_id,
  s.name as street_name,
  d.id as district_id,
  d.name as district_name,
  c.id as city_id,
  c.name as city_name,
  co.id as country_id,
  co.name as country_name,
  co.code as country_code,
  r.id as regional_id,
  r.name as regional_name,
  cont.id as continent_id,
  cont.name as continent_name,
  g.id as global_id,
  g.name as global_name,
  -- Full path string
  g.name || ' / ' || 
  cont.name || ' / ' || 
  r.name || ' / ' || 
  co.name || ' / ' || 
  c.name || ' / ' || 
  d.name || ' / ' || 
  s.name || ' / ' || 
  p.name as full_path
FROM territory_point p
JOIN territory_street s ON p.street_id = s.id
JOIN territory_district d ON s.district_id = d.id
JOIN territory_city c ON d.city_id = c.id
JOIN territory_country co ON c.country_id = co.id
JOIN territory_regional r ON co.regional_id = r.id
JOIN territory_continent cont ON r.continent_id = cont.id
JOIN territory_global g ON cont.global_id = g.id;

-- ============================================
-- INITIAL DATA: Global and Continents
-- ============================================

-- Insert Global root
INSERT INTO territory_global (name, code) 
VALUES ('Global', 'GLOBAL')
ON CONFLICT (code) DO NOTHING;

-- Insert Continents
INSERT INTO territory_continent (global_id, name, code, display_order)
SELECT g.id, 'Europe', 'EU', 1
FROM territory_global g WHERE g.code = 'GLOBAL'
ON CONFLICT (code) DO NOTHING;

INSERT INTO territory_continent (global_id, name, code, display_order)
SELECT g.id, 'Asia', 'AS', 2
FROM territory_global g WHERE g.code = 'GLOBAL'
ON CONFLICT (code) DO NOTHING;

INSERT INTO territory_continent (global_id, name, code, display_order)
SELECT g.id, 'North America', 'NA', 3
FROM territory_global g WHERE g.code = 'GLOBAL'
ON CONFLICT (code) DO NOTHING;

INSERT INTO territory_continent (global_id, name, code, display_order)
SELECT g.id, 'South America', 'SA', 4
FROM territory_global g WHERE g.code = 'GLOBAL'
ON CONFLICT (code) DO NOTHING;

INSERT INTO territory_continent (global_id, name, code, display_order)
SELECT g.id, 'Africa', 'AF', 5
FROM territory_global g WHERE g.code = 'GLOBAL'
ON CONFLICT (code) DO NOTHING;

INSERT INTO territory_continent (global_id, name, code, display_order)
SELECT g.id, 'Oceania', 'OC', 6
FROM territory_global g WHERE g.code = 'GLOBAL'
ON CONFLICT (code) DO NOTHING;

-- ============================================
-- SAMPLE DATA: Europe → Western Europe → UK → London → Edgware → Road → Victoria Casino
-- ============================================

-- Regional: Western Europe
INSERT INTO territory_regional (continent_id, name, code, display_order)
SELECT c.id, 'Western Europe', 'WEU', 1
FROM territory_continent c WHERE c.code = 'EU'
ON CONFLICT (code) DO NOTHING;

-- Country: United Kingdom
INSERT INTO territory_country (regional_id, name, code, iso_code_2, currency_code, currency_symbol, timezone, locale, display_order)
SELECT r.id, 'United Kingdom', 'GBR', 'GB', 'GBP', '£', 'Europe/London', 'en-GB', 1
FROM territory_regional r WHERE r.code = 'WEU'
ON CONFLICT (code) DO NOTHING;

-- City: London
INSERT INTO territory_city (country_id, name, code, latitude, longitude, population, is_capital, display_order)
SELECT co.id, 'London', 'LON', 51.5074, -0.1278, 9000000, TRUE, 1
FROM territory_country co WHERE co.code = 'GBR'
ON CONFLICT DO NOTHING;

-- District: Edgware
INSERT INTO territory_district (city_id, name, code, postal_code, latitude, longitude, display_order)
SELECT c.id, 'Edgware', 'EDG', 'HA8', 51.6144, -0.2750, 1
FROM territory_city c WHERE c.code = 'LON'
ON CONFLICT DO NOTHING;

-- Street: Road (generic, or specific road name)
INSERT INTO territory_street (district_id, name, code, street_type, display_order)
SELECT d.id, 'High Street', 'HS', 'Street', 1
FROM territory_district d WHERE d.code = 'EDG'
ON CONFLICT DO NOTHING;

-- Point: Victoria Casino (Distribution Center)
INSERT INTO territory_point (
  street_id, name, code, point_type, 
  address_line1, building_number,
  latitude, longitude, phone, email, contact_person
)
SELECT 
  s.id, 
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
FROM territory_street s 
WHERE s.code = 'HS' 
AND s.district_id IN (SELECT id FROM territory_district WHERE code = 'EDG')
ON CONFLICT DO NOTHING;

-- ============================================
-- TRIGGERS: Auto-update updated_at
-- ============================================

CREATE TRIGGER update_territory_global_updated_at 
  BEFORE UPDATE ON territory_global
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_territory_continent_updated_at 
  BEFORE UPDATE ON territory_continent
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_territory_regional_updated_at 
  BEFORE UPDATE ON territory_regional
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_territory_country_updated_at 
  BEFORE UPDATE ON territory_country
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_territory_city_updated_at 
  BEFORE UPDATE ON territory_city
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_territory_district_updated_at 
  BEFORE UPDATE ON territory_district
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_territory_street_updated_at 
  BEFORE UPDATE ON territory_street
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_territory_point_updated_at 
  BEFORE UPDATE ON territory_point
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to get full territory path by point ID
CREATE OR REPLACE FUNCTION get_territory_path(point_uuid UUID)
RETURNS TABLE (
  level_name TEXT,
  level_value TEXT,
  level_code TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    'Point'::TEXT, p.name, p.code
  FROM territory_point p WHERE p.id = point_uuid
  UNION ALL
  SELECT 
    'Street'::TEXT, s.name, s.code
  FROM territory_point p
  JOIN territory_street s ON p.street_id = s.id
  WHERE p.id = point_uuid
  UNION ALL
  SELECT 
    'District'::TEXT, d.name, d.code
  FROM territory_point p
  JOIN territory_street s ON p.street_id = s.id
  JOIN territory_district d ON s.district_id = d.id
  WHERE p.id = point_uuid
  UNION ALL
  SELECT 
    'City'::TEXT, c.name, c.code
  FROM territory_point p
  JOIN territory_street s ON p.street_id = s.id
  JOIN territory_district d ON s.district_id = d.id
  JOIN territory_city c ON d.city_id = c.id
  WHERE p.id = point_uuid
  UNION ALL
  SELECT 
    'Country'::TEXT, co.name, co.code
  FROM territory_point p
  JOIN territory_street s ON p.street_id = s.id
  JOIN territory_district d ON s.district_id = d.id
  JOIN territory_city c ON d.city_id = c.id
  JOIN territory_country co ON c.country_id = co.id
  WHERE p.id = point_uuid
  UNION ALL
  SELECT 
    'Regional'::TEXT, r.name, r.code
  FROM territory_point p
  JOIN territory_street s ON p.street_id = s.id
  JOIN territory_district d ON s.district_id = d.id
  JOIN territory_city c ON d.city_id = c.id
  JOIN territory_country co ON c.country_id = co.id
  JOIN territory_regional r ON co.regional_id = r.id
  WHERE p.id = point_uuid
  UNION ALL
  SELECT 
    'Continent'::TEXT, cont.name, cont.code
  FROM territory_point p
  JOIN territory_street s ON p.street_id = s.id
  JOIN territory_district d ON s.district_id = d.id
  JOIN territory_city c ON d.city_id = c.id
  JOIN territory_country co ON c.country_id = co.id
  JOIN territory_regional r ON co.regional_id = r.id
  JOIN territory_continent cont ON r.continent_id = cont.id
  WHERE p.id = point_uuid
  UNION ALL
  SELECT 
    'Global'::TEXT, g.name, g.code
  FROM territory_point p
  JOIN territory_street s ON p.street_id = s.id
  JOIN territory_district d ON s.district_id = d.id
  JOIN territory_city c ON d.city_id = c.id
  JOIN territory_country co ON c.country_id = co.id
  JOIN territory_regional r ON co.regional_id = r.id
  JOIN territory_continent cont ON r.continent_id = cont.id
  JOIN territory_global g ON cont.global_id = g.id
  WHERE p.id = point_uuid
  ORDER BY 
    CASE level_name
      WHEN 'Global' THEN 1
      WHEN 'Continent' THEN 2
      WHEN 'Regional' THEN 3
      WHEN 'Country' THEN 4
      WHEN 'City' THEN 5
      WHEN 'District' THEN 6
      WHEN 'Street' THEN 7
      WHEN 'Point' THEN 8
    END;
END;
$$ LANGUAGE plpgsql;

