-- HarvyX LinkedIn campaigns (JSON blob per row)
CREATE TABLE IF NOT EXISTS campaigns (
  id         TEXT PRIMARY KEY,
  created_at TEXT NOT NULL,
  data       TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_campaigns_created ON campaigns(created_at DESC);
