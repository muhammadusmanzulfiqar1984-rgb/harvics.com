-- Phase-1: Legal / IPR & Compliance OS Domain
-- Database migration for Legal OS tables

-- IPR (Intellectual Property Rights) Management
CREATE TABLE IF NOT EXISTS ipr_registrations (
  id TEXT PRIMARY KEY,
  ipr_type TEXT NOT NULL, -- 'trademark', 'patent', 'copyright', 'design'
  brand_name TEXT NOT NULL,
  class_number TEXT,
  country TEXT NOT NULL,
  application_no TEXT,
  registration_no TEXT,
  registration_date DATE,
  expiry_date DATE,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'expired', 'renewed'
  documents TEXT, -- JSON array of document references
  territory TEXT,
  region_code TEXT,
  country_code TEXT,
  city_code TEXT,
  district_code TEXT,
  area_code TEXT,
  location_code TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (country_code) REFERENCES territory_country(code)
);

CREATE TABLE IF NOT EXISTS ipr_renewals (
  id TEXT PRIMARY KEY,
  ipr_id TEXT NOT NULL,
  renewal_date DATE NOT NULL,
  expiry_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  documents TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (ipr_id) REFERENCES ipr_registrations(id) ON DELETE CASCADE
);

-- Counterfeit Detection & Reporting
CREATE TABLE IF NOT EXISTS counterfeit_reports (
  id TEXT PRIMARY KEY,
  report_no TEXT UNIQUE NOT NULL,
  brand_name TEXT NOT NULL,
  product_description TEXT,
  country TEXT NOT NULL,
  location TEXT,
  reported_by TEXT, -- user_id
  report_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'open', -- 'open', 'investigating', 'resolved', 'closed'
  severity TEXT DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
  evidence_documents TEXT, -- JSON array
  legal_action_taken TEXT,
  resolution_date DATE,
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

CREATE TABLE IF NOT EXISTS counterfeit_investigations (
  id TEXT PRIMARY KEY,
  report_id TEXT NOT NULL,
  investigator_id TEXT,
  investigation_date DATE,
  findings TEXT,
  status TEXT DEFAULT 'in_progress',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (report_id) REFERENCES counterfeit_reports(id) ON DELETE CASCADE
);

-- Compliance Tracking
CREATE TABLE IF NOT EXISTS compliance_records (
  id TEXT PRIMARY KEY,
  country TEXT NOT NULL,
  compliance_type TEXT NOT NULL, -- 'regulatory', 'tax', 'labor', 'environmental', 'food_safety'
  regulation_name TEXT NOT NULL,
  requirement_description TEXT,
  compliance_status TEXT NOT NULL DEFAULT 'compliant', -- 'compliant', 'non_compliant', 'pending', 'at_risk'
  last_audit_date DATE,
  next_audit_date DATE,
  risk_level TEXT DEFAULT 'low', -- 'low', 'medium', 'high'
  corrective_actions TEXT,
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

CREATE TABLE IF NOT EXISTS compliance_audits (
  id TEXT PRIMARY KEY,
  compliance_id TEXT NOT NULL,
  audit_date DATE NOT NULL,
  auditor TEXT,
  findings TEXT,
  status TEXT DEFAULT 'scheduled', -- 'scheduled', 'in_progress', 'completed', 'failed'
  score REAL, -- compliance score 0-100
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (compliance_id) REFERENCES compliance_records(id) ON DELETE CASCADE
);

-- Contracts Management
CREATE TABLE IF NOT EXISTS legal_contracts (
  id TEXT PRIMARY KEY,
  contract_no TEXT UNIQUE NOT NULL,
  contract_type TEXT NOT NULL, -- 'distributor', 'supplier', 'license', 'nda', 'employment', 'lease'
  party_name TEXT NOT NULL,
  party_type TEXT, -- 'distributor', 'supplier', 'customer', 'partner'
  country TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  renewal_date DATE,
  status TEXT NOT NULL DEFAULT 'active', -- 'draft', 'active', 'expired', 'terminated', 'renewed'
  value REAL,
  currency TEXT,
  terms_summary TEXT,
  documents TEXT, -- JSON array
  auto_renew BOOLEAN DEFAULT 0,
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

CREATE TABLE IF NOT EXISTS contract_amendments (
  id TEXT PRIMARY KEY,
  contract_id TEXT NOT NULL,
  amendment_date DATE NOT NULL,
  amendment_type TEXT, -- 'extension', 'modification', 'termination'
  description TEXT,
  documents TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (contract_id) REFERENCES legal_contracts(id) ON DELETE CASCADE
);

-- Litigation Management
CREATE TABLE IF NOT EXISTS litigation_cases (
  id TEXT PRIMARY KEY,
  case_no TEXT UNIQUE NOT NULL,
  case_type TEXT NOT NULL, -- 'ip_infringement', 'counterfeit', 'contract_dispute', 'regulatory', 'employment'
  case_title TEXT NOT NULL,
  country TEXT NOT NULL,
  court_name TEXT,
  filed_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'filed', -- 'filed', 'in_progress', 'settled', 'won', 'lost', 'dismissed'
  priority TEXT DEFAULT 'medium', -- 'low', 'medium', 'high', 'urgent'
  estimated_closure_date DATE,
  actual_closure_date DATE,
  legal_counsel TEXT,
  estimated_cost REAL,
  currency TEXT,
  actual_cost REAL,
  outcome_summary TEXT,
  documents TEXT,
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

CREATE TABLE IF NOT EXISTS litigation_hearings (
  id TEXT PRIMARY KEY,
  case_id TEXT NOT NULL,
  hearing_date DATE NOT NULL,
  hearing_type TEXT, -- 'preliminary', 'trial', 'settlement', 'appeal'
  location TEXT,
  outcome TEXT,
  next_hearing_date DATE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (case_id) REFERENCES litigation_cases(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_ipr_country ON ipr_registrations(country_code);
CREATE INDEX IF NOT EXISTS idx_ipr_status ON ipr_registrations(status);
CREATE INDEX IF NOT EXISTS idx_ipr_expiry ON ipr_registrations(expiry_date);
CREATE INDEX IF NOT EXISTS idx_counterfeit_country ON counterfeit_reports(country_code);
CREATE INDEX IF NOT EXISTS idx_counterfeit_status ON counterfeit_reports(status);
CREATE INDEX IF NOT EXISTS idx_compliance_country ON compliance_records(country_code);
CREATE INDEX IF NOT EXISTS idx_compliance_status ON compliance_records(compliance_status);
CREATE INDEX IF NOT EXISTS idx_contracts_country ON legal_contracts(country_code);
CREATE INDEX IF NOT EXISTS idx_contracts_status ON legal_contracts(status);
CREATE INDEX IF NOT EXISTS idx_contracts_end_date ON legal_contracts(end_date);
CREATE INDEX IF NOT EXISTS idx_litigation_country ON litigation_cases(country_code);
CREATE INDEX IF NOT EXISTS idx_litigation_status ON litigation_cases(status);
CREATE INDEX IF NOT EXISTS idx_litigation_filed_date ON litigation_cases(filed_date);

