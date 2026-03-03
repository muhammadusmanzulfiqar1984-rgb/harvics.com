-- Sales Officer Routes Table Migration
-- For SQLite compatibility

CREATE TABLE IF NOT EXISTS so_routes (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  employee_id TEXT NOT NULL,
  lat REAL NOT NULL,
  lng REAL NOT NULL,
  timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_so_routes_employee_id ON so_routes(employee_id);
CREATE INDEX IF NOT EXISTS idx_so_routes_timestamp ON so_routes(timestamp);
CREATE INDEX IF NOT EXISTS idx_so_routes_employee_timestamp ON so_routes(employee_id, timestamp);

