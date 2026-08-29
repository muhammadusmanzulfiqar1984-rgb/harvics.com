-- Phase 4b: orgs + memberships (D1)
-- wrangler d1 execute harvics-leads --remote --file=migrations/0003_orgs.sql

CREATE TABLE IF NOT EXISTS orgs (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  clerk_org_id TEXT,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  plan TEXT NOT NULL DEFAULT 'free',
  seats INTEGER NOT NULL DEFAULT 3,
  daily_send_cap INTEGER NOT NULL DEFAULT 20,
  daily_enrich_cap INTEGER NOT NULL DEFAULT 50,
  batch_send_hard_max INTEGER NOT NULL DEFAULT 10,
  resend_api_key TEXT,
  groq_api_key TEXT,
  openai_api_key TEXT,
  created_at TEXT,
  updated_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_orgs_clerk ON orgs(clerk_org_id);
CREATE INDEX IF NOT EXISTS idx_orgs_stripe ON orgs(stripe_customer_id);

CREATE TABLE IF NOT EXISTS org_members (
  org_id TEXT NOT NULL,
  clerk_user_id TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member',
  created_at TEXT,
  PRIMARY KEY (org_id, clerk_user_id),
  FOREIGN KEY (org_id) REFERENCES orgs(id)
);

CREATE INDEX IF NOT EXISTS idx_org_members_user ON org_members(clerk_user_id);

INSERT OR IGNORE INTO orgs (
  id, name, plan, seats, daily_send_cap, daily_enrich_cap, batch_send_hard_max,
  created_at, updated_at
) VALUES (
  'harvics', 'Harvics', 'scale', 10, 100, 200, 20,
  datetime('now'), datetime('now')
);
