-- Migration: Create countries, regions, and cities tables
-- Part of TIER_0_FOUNDATIONS: Localisation_Engine
-- Created: 2025-01-20

-- Countries table
CREATE TABLE IF NOT EXISTS countries (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  iso_code      VARCHAR(3) UNIQUE NOT NULL,  -- e.g. PAK, OMN, ESP
  name          VARCHAR(100) NOT NULL,
  currency_code VARCHAR(3) NOT NULL,        -- PKR, OMR, EUR
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create index on iso_code for faster lookups
CREATE INDEX IF NOT EXISTS idx_countries_iso_code ON countries(iso_code);
CREATE INDEX IF NOT EXISTS idx_countries_currency_code ON countries(currency_code);

-- Regions table
CREATE TABLE IF NOT EXISTS regions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_id  UUID NOT NULL REFERENCES countries(id) ON DELETE CASCADE,
  name        VARCHAR(100) NOT NULL,
  code        VARCHAR(20),
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes on regions
CREATE INDEX IF NOT EXISTS idx_regions_country_id ON regions(country_id);
CREATE INDEX IF NOT EXISTS idx_regions_code ON regions(code);

-- Cities table
CREATE TABLE IF NOT EXISTS cities (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_id  UUID NOT NULL REFERENCES countries(id) ON DELETE CASCADE,
  region_id   UUID REFERENCES regions(id) ON DELETE SET NULL,
  name        VARCHAR(100) NOT NULL,
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes on cities
CREATE INDEX IF NOT EXISTS idx_cities_country_id ON cities(country_id);
CREATE INDEX IF NOT EXISTS idx_cities_region_id ON cities(region_id);
CREATE INDEX IF NOT EXISTS idx_cities_name ON cities(name);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to auto-update updated_at
CREATE TRIGGER update_countries_updated_at BEFORE UPDATE ON countries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_regions_updated_at BEFORE UPDATE ON regions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cities_updated_at BEFORE UPDATE ON cities
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert initial countries (based on existing localization data)
INSERT INTO countries (iso_code, name, currency_code) VALUES
  ('PAK', 'Pakistan', 'PKR'),
  ('OMN', 'Oman', 'OMR'),
  ('ESP', 'Spain', 'EUR'),
  ('USA', 'United States', 'USD'),
  ('ARE', 'United Arab Emirates', 'AED'),
  ('GBR', 'United Kingdom', 'GBP'),
  ('ITA', 'Italy', 'EUR'),
  ('FRA', 'France', 'EUR'),
  ('DEU', 'Germany', 'EUR'),
  ('CHN', 'China', 'CNY'),
  ('IND', 'India', 'INR'),
  ('SAU', 'Saudi Arabia', 'SAR'),
  ('TUR', 'Turkey', 'TRY'),
  ('EGY', 'Egypt', 'EGP'),
  ('MAR', 'Morocco', 'MAD'),
  ('ZAF', 'South Africa', 'ZAR'),
  ('NGA', 'Nigeria', 'NGN'),
  ('KEN', 'Kenya', 'KES'),
  ('BRA', 'Brazil', 'BRL'),
  ('MEX', 'Mexico', 'MXN'),
  ('ARG', 'Argentina', 'ARS'),
  ('CAN', 'Canada', 'CAD'),
  ('AUS', 'Australia', 'AUD'),
  ('JPN', 'Japan', 'JPY'),
  ('KOR', 'South Korea', 'KRW'),
  ('SGP', 'Singapore', 'SGD'),
  ('MYS', 'Malaysia', 'MYR'),
  ('THA', 'Thailand', 'THB'),
  ('IDN', 'Indonesia', 'IDR'),
  ('PHL', 'Philippines', 'PHP'),
  ('VNM', 'Vietnam', 'VND'),
  ('BGD', 'Bangladesh', 'BDT'),
  ('LKA', 'Sri Lanka', 'LKR'),
  ('NPL', 'Nepal', 'NPR'),
  ('AFG', 'Afghanistan', 'AFN'),
  ('IRN', 'Iran', 'IRR'),
  ('IRQ', 'Iraq', 'IQD'),
  ('JOR', 'Jordan', 'JOD'),
  ('LBN', 'Lebanon', 'LBP'),
  ('KWT', 'Kuwait', 'KWD'),
  ('BHR', 'Bahrain', 'BHD'),
  ('QAT', 'Qatar', 'QAR'),
  ('YEM', 'Yemen', 'YER'),
  ('SYR', 'Syria', 'SYP'),
  ('PSE', 'Palestine', 'ILS'),
  ('ISR', 'Israel', 'ILS'),
  ('GRC', 'Greece', 'EUR'),
  ('PRT', 'Portugal', 'EUR'),
  ('NLD', 'Netherlands', 'EUR'),
  ('BEL', 'Belgium', 'EUR'),
  ('CHE', 'Switzerland', 'CHF'),
  ('AUT', 'Austria', 'EUR'),
  ('SWE', 'Sweden', 'SEK'),
  ('NOR', 'Norway', 'NOK'),
  ('DNK', 'Denmark', 'DKK'),
  ('FIN', 'Finland', 'EUR'),
  ('POL', 'Poland', 'PLN'),
  ('CZE', 'Czech Republic', 'CZK'),
  ('HUN', 'Hungary', 'HUF'),
  ('ROU', 'Romania', 'RON'),
  ('BGR', 'Bulgaria', 'BGN'),
  ('HRV', 'Croatia', 'HRK'),
  ('SRB', 'Serbia', 'RSD'),
  ('UKR', 'Ukraine', 'UAH'),
  ('RUS', 'Russia', 'RUB'),
  ('KAZ', 'Kazakhstan', 'KZT'),
  ('UZB', 'Uzbekistan', 'UZS'),
  ('PAK', 'Pakistan', 'PKR')
ON CONFLICT (iso_code) DO NOTHING;

-- Sample regions for Pakistan
INSERT INTO regions (country_id, name, code)
SELECT id, 'Punjab', 'PK-PB' FROM countries WHERE iso_code = 'PAK'
ON CONFLICT DO NOTHING;

INSERT INTO regions (country_id, name, code)
SELECT id, 'Sindh', 'PK-SD' FROM countries WHERE iso_code = 'PAK'
ON CONFLICT DO NOTHING;

INSERT INTO regions (country_id, name, code)
SELECT id, 'Khyber Pakhtunkhwa', 'PK-KP' FROM countries WHERE iso_code = 'PAK'
ON CONFLICT DO NOTHING;

-- Sample cities for Pakistan regions
INSERT INTO cities (country_id, region_id, name)
SELECT 
  c.id,
  r.id,
  'Lahore'
FROM countries c
JOIN regions r ON r.country_id = c.id
WHERE c.iso_code = 'PAK' AND r.code = 'PK-PB'
ON CONFLICT DO NOTHING;

INSERT INTO cities (country_id, region_id, name)
SELECT 
  c.id,
  r.id,
  'Karachi'
FROM countries c
JOIN regions r ON r.country_id = c.id
WHERE c.iso_code = 'PAK' AND r.code = 'PK-SD'
ON CONFLICT DO NOTHING;

