-- COUNTRY MASTER
CREATE TABLE IF NOT EXISTS country (
  code VARCHAR(3) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  region VARCHAR(100),
  currency_code VARCHAR(10),
  currency_symbol VARCHAR(5)
);

-- MACRO METRICS
CREATE TABLE IF NOT EXISTS country_metric (
  id SERIAL PRIMARY KEY,
  country_code VARCHAR(3) REFERENCES country(code),
  year INT,
  gdp_per_capita NUMERIC,
  population BIGINT,
  urban_percent NUMERIC,
  inflation_rate NUMERIC
);

-- TRADE FLOWS
CREATE TABLE IF NOT EXISTS country_trade (
  id SERIAL PRIMARY KEY,
  country_code VARCHAR(3) REFERENCES country(code),
  year INT,
  hs_code VARCHAR(10),
  import_value_usd NUMERIC,
  export_value_usd NUMERIC
);

-- LOGISTICS
CREATE TABLE IF NOT EXISTS country_logistics (
  id SERIAL PRIMARY KEY,
  country_code VARCHAR(3) REFERENCES country(code),
  logistics_cost_index NUMERIC,
  port_access_score NUMERIC,
  road_quality_score NUMERIC
);

-- RETAIL STRUCTURE
CREATE TABLE IF NOT EXISTS country_retail (
  id SERIAL PRIMARY KEY,
  country_code VARCHAR(3) REFERENCES country(code),
  modern_trade_index NUMERIC,
  traditional_trade_index NUMERIC,
  horeca_index NUMERIC
);

-- HARVICS SALES SUMMARY
CREATE TABLE IF NOT EXISTS harvics_sales_summary (
  id SERIAL PRIMARY KEY,
  country_code VARCHAR(3) REFERENCES country(code),
  year INT,
  month INT,
  containers_sold INT,
  revenue_usd NUMERIC
);

-- CITY
CREATE TABLE IF NOT EXISTS city (
  id SERIAL PRIMARY KEY,
  country_code VARCHAR(3) REFERENCES country(code),
  name VARCHAR(100),
  population BIGINT
);

-- DISTRIBUTOR
CREATE TABLE IF NOT EXISTS distributor (
  id SERIAL PRIMARY KEY,
  country_code VARCHAR(3) REFERENCES country(code),
  name VARCHAR(150),
  city VARCHAR(100),
  contact_phone VARCHAR(50),
  status VARCHAR(20)
);

-- RETAIL OUTLET
CREATE TABLE IF NOT EXISTS retail_outlet (
  id SERIAL PRIMARY KEY,
  city_id INT REFERENCES city(id),
  distributor_id INT REFERENCES distributor(id),
  outlet_name VARCHAR(150),
  outlet_type VARCHAR(50),
  latitude NUMERIC,
  longitude NUMERIC,
  avg_monthly_sales NUMERIC,
  active BOOLEAN DEFAULT TRUE
);

-- GRID TILE
CREATE TABLE IF NOT EXISTS grid_tile (
  id SERIAL PRIMARY KEY,
  country_code VARCHAR(3) REFERENCES country(code),
  tile_id VARCHAR(50),
  center_lat NUMERIC,
  center_lng NUMERIC,
  approx_population BIGINT,
  urban_density_score NUMERIC,
  road_access_score NUMERIC
);

-- GRID COVERAGE
CREATE TABLE IF NOT EXISTS grid_coverage_metric (
  id SERIAL PRIMARY KEY,
  grid_tile_id INT REFERENCES grid_tile(id),
  retailer_count INT,
  total_sales NUMERIC,
  coverage_score NUMERIC,
  white_space_flag BOOLEAN
);
