-- Phase-1: GPS Tracking OS Domain
-- Database migration for GPS Tracking OS tables

-- GPS Tracking
CREATE TABLE IF NOT EXISTS gps_tracking (
  id TEXT PRIMARY KEY,
  vehicle_id TEXT,
  employee_id TEXT,
  entity_type TEXT NOT NULL,
  latitude REAL NOT NULL,
  longitude REAL NOT NULL,
  altitude REAL,
  speed REAL,
  heading REAL,
  accuracy REAL,
  timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  territory TEXT,
  region_code TEXT,
  country_code TEXT,
  city_code TEXT,
  district_code TEXT,
  area_code TEXT,
  location_code TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Fleet Vehicles
CREATE TABLE IF NOT EXISTS fleet_vehicles (
  id TEXT PRIMARY KEY,
  vehicle_no TEXT UNIQUE NOT NULL,
  vehicle_type TEXT NOT NULL,
  make TEXT,
  model TEXT,
  year INTEGER,
  registration_no TEXT,
  license_plate TEXT,
  driver_id TEXT,
  status TEXT NOT NULL DEFAULT 'available',
  capacity_weight REAL,
  capacity_volume REAL,
  fuel_type TEXT,
  current_fuel_level REAL,
  odometer_reading REAL,
  last_maintenance_date DATE,
  next_maintenance_date DATE,
  insurance_expiry_date DATE,
  registration_expiry_date DATE,
  gps_device_id TEXT,
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

-- Vehicle Assignments
CREATE TABLE IF NOT EXISTS vehicle_assignments (
  id TEXT PRIMARY KEY,
  vehicle_id TEXT NOT NULL,
  driver_id TEXT NOT NULL,
  route_id TEXT,
  assignment_date DATE NOT NULL,
  start_time DATETIME,
  end_time DATETIME,
  status TEXT DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (vehicle_id) REFERENCES fleet_vehicles(id) ON DELETE CASCADE
);

-- GPS Routes (Historical)
CREATE TABLE IF NOT EXISTS gps_routes (
  id TEXT PRIMARY KEY,
  route_name TEXT,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  start_time DATETIME NOT NULL,
  end_time DATETIME,
  start_location_lat REAL,
  start_location_lng REAL,
  end_location_lat REAL,
  end_location_lng REAL,
  total_distance REAL,
  total_duration REAL,
  average_speed REAL,
  max_speed REAL,
  stops_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'in_progress',
  territory TEXT,
  country_code TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_gps_vehicle ON gps_tracking(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_gps_employee ON gps_tracking(employee_id);
CREATE INDEX IF NOT EXISTS idx_gps_timestamp ON gps_tracking(timestamp);
CREATE INDEX IF NOT EXISTS idx_gps_entity ON gps_tracking(entity_type);
CREATE INDEX IF NOT EXISTS idx_fleet_vehicles_status ON fleet_vehicles(status);
CREATE INDEX IF NOT EXISTS idx_fleet_vehicles_country ON fleet_vehicles(country_code);
CREATE INDEX IF NOT EXISTS idx_assignments_vehicle ON vehicle_assignments(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_assignments_driver ON vehicle_assignments(driver_id);
CREATE INDEX IF NOT EXISTS idx_routes_entity ON gps_routes(entity_id, entity_type);
CREATE INDEX IF NOT EXISTS idx_routes_date ON gps_routes(start_time);

