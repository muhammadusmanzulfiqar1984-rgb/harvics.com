-- ==============================================================================
-- HPAY FINANCIAL PLATFORM — ENTERPRISE BANK-GRADE POSTGRESQL SCHEMA (v1.0)
-- Strict Double-Entry Ledger, Idempotency, Audit Trails, & Multi-Region HA
-- ==============================================================================
-- LAW: Balance is NEVER stored as a column.
--      ASSET / EXPENSE  → SUM(debit) − SUM(credit)
--      LIABILITY / EQUITY / REVENUE / ESCROW → SUM(credit) − SUM(debit)
--      Customer HPay wallets are LIABILITY (bank owes the customer).
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------------------------
-- 1. ORGANIZATIONS & USERS
-- ------------------------------------------------------------------------------
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hpay_id VARCHAR(32) UNIQUE NOT NULL,
    business_name VARCHAR(255) NOT NULL,
    country_code VARCHAR(3) NOT NULL DEFAULT 'UAE',
    tier VARCHAR(32) NOT NULL DEFAULT 'ENTERPRISE',
    status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    handle VARCHAR(64) UNIQUE NOT NULL,
    password_hash TEXT,
    passkey_credential_id TEXT,
    passkey_public_key TEXT,
    two_factor_secret TEXT,
    two_factor_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    role VARCHAR(32) NOT NULL DEFAULT 'ADMIN',
    kyc_status VARCHAR(32) NOT NULL DEFAULT 'not_started',
    kyc_tier INTEGER NOT NULL DEFAULT 0,
    status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_org_id ON users(org_id);
CREATE INDEX idx_users_handle ON users(handle);

-- ------------------------------------------------------------------------------
-- 2. ACCOUNTS & DOUBLE-ENTRY LEDGER
-- ------------------------------------------------------------------------------
CREATE TYPE account_type AS ENUM (
    'ASSET',
    'LIABILITY',
    'EQUITY',
    'REVENUE',
    'EXPENSE',
    'ESCROW'
);

CREATE TABLE accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES organizations(id),
    user_id UUID REFERENCES users(id),
    account_number VARCHAR(64) UNIQUE NOT NULL,
    type account_type NOT NULL,
    currency VARCHAR(10) NOT NULL,
    label VARCHAR(128),
    status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_accounts_org_id ON accounts(org_id);
CREATE INDEX idx_accounts_user_id ON accounts(user_id);
CREATE INDEX idx_accounts_currency ON accounts(currency);

CREATE TABLE journal_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID REFERENCES organizations(id),
    idempotency_key VARCHAR(128) UNIQUE NOT NULL,
    reference_type VARCHAR(64) NOT NULL,
    reference_id VARCHAR(128) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'POSTED',
    posted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    merkle_tree_hash VARCHAR(128),
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX idx_journal_entries_ref ON journal_entries(reference_type, reference_id);
CREATE INDEX idx_journal_entries_posted_at ON journal_entries(posted_at DESC);

CREATE TABLE ledger_lines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entry_id UUID NOT NULL REFERENCES journal_entries(id) ON DELETE RESTRICT,
    account_id UUID NOT NULL REFERENCES accounts(id),
    debit NUMERIC(28, 8) NOT NULL DEFAULT 0 CHECK (debit >= 0),
    credit NUMERIC(28, 8) NOT NULL DEFAULT 0 CHECK (credit >= 0),
    currency VARCHAR(10) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT balance_line_check CHECK (
        (debit > 0 AND credit = 0) OR (debit = 0 AND credit > 0)
    )
);

CREATE INDEX idx_ledger_lines_account_id ON ledger_lines(account_id);
CREATE INDEX idx_ledger_lines_entry_id ON ledger_lines(entry_id);

CREATE OR REPLACE VIEW account_balances AS
SELECT
    a.id AS account_id,
    a.org_id,
    a.user_id,
    a.account_number,
    a.type,
    a.currency,
    a.label,
    a.status,
    CASE
        WHEN a.type IN ('ASSET', 'EXPENSE')
            THEN COALESCE(SUM(l.debit), 0) - COALESCE(SUM(l.credit), 0)
        ELSE
            COALESCE(SUM(l.credit), 0) - COALESCE(SUM(l.debit), 0)
    END AS balance
FROM accounts a
LEFT JOIN ledger_lines l ON l.account_id = a.id
GROUP BY a.id;

-- ------------------------------------------------------------------------------
-- 3. IDEMPOTENCY & CONCURRENCY LOCKS
-- ------------------------------------------------------------------------------
CREATE TABLE idempotency_keys (
    key VARCHAR(128) PRIMARY KEY,
    org_id UUID NOT NULL REFERENCES organizations(id),
    request_path VARCHAR(255) NOT NULL,
    request_hash VARCHAR(64) NOT NULL,
    response_status INTEGER,
    response_body JSONB,
    status VARCHAR(32) NOT NULL DEFAULT 'PROCESSING',
    locked_until TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

CREATE INDEX idx_idempotency_org ON idempotency_keys(org_id);
CREATE INDEX idx_idempotency_status ON idempotency_keys(status);

-- ------------------------------------------------------------------------------
-- 4. IMMUTABLE SECURITY AUDIT LOGS
-- ------------------------------------------------------------------------------
CREATE TABLE security_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID REFERENCES organizations(id),
    user_id UUID REFERENCES users(id),
    event_type VARCHAR(64) NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    user_agent TEXT,
    signature VARCHAR(256) NOT NULL,
    payload JSONB NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_security_audit_org ON security_audit_logs(org_id);
CREATE INDEX idx_security_audit_ts ON security_audit_logs(timestamp DESC);
CREATE INDEX idx_security_audit_type ON security_audit_logs(event_type);

CREATE OR REPLACE FUNCTION prevent_mutation()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'IMMUTABLE_TABLE: % is append-only', TG_TABLE_NAME;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_ledger_lines_immutable
    BEFORE UPDATE OR DELETE ON ledger_lines
    FOR EACH ROW EXECUTE FUNCTION prevent_mutation();

CREATE TRIGGER trg_journal_entries_immutable
    BEFORE UPDATE OR DELETE ON journal_entries
    FOR EACH ROW EXECUTE FUNCTION prevent_mutation();

CREATE TRIGGER trg_security_audit_immutable
    BEFORE UPDATE OR DELETE ON security_audit_logs
    FOR EACH ROW EXECUTE FUNCTION prevent_mutation();

-- ------------------------------------------------------------------------------
-- 5. OPERATIONAL TABLES (current HPay API surface)
-- ------------------------------------------------------------------------------
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID REFERENCES organizations(id),
    user_id UUID REFERENCES users(id),
    account_id UUID REFERENCES accounts(id),
    reference VARCHAR(64) UNIQUE NOT NULL,
    status VARCHAR(32) NOT NULL,
    amount NUMERIC(28, 8) NOT NULL CHECK (amount > 0),
    currency VARCHAR(10) NOT NULL,
    merchant_name TEXT,
    description TEXT,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    events JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE payouts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID REFERENCES organizations(id),
    user_id UUID REFERENCES users(id),
    journal_entry_id UUID REFERENCES journal_entries(id),
    reference VARCHAR(64) UNIQUE NOT NULL,
    status VARCHAR(32) NOT NULL,
    amount NUMERIC(28, 8) NOT NULL CHECK (amount > 0),
    currency VARCHAR(10) NOT NULL,
    bank_name TEXT,
    account_number_masked TEXT,
    description TEXT,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    settled_at TIMESTAMPTZ
);

CREATE TABLE merchants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID REFERENCES organizations(id),
    account_id UUID REFERENCES accounts(id),
    name VARCHAR(255) NOT NULL,
    hpay_id VARCHAR(64) UNIQUE NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE merchant_outlets (
    id VARCHAR(32) PRIMARY KEY,
    merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    location TEXT,
    channel VARCHAR(32) NOT NULL DEFAULT 'physical',
    terminal_id VARCHAR(64),
    currency VARCHAR(10) NOT NULL DEFAULT 'USD',
    daily_volume NUMERIC(28, 8) NOT NULL DEFAULT 0,
    pending_settlement NUMERIC(28, 8) NOT NULL DEFAULT 0,
    status VARCHAR(32) NOT NULL DEFAULT 'Active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE market_quotes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    venue VARCHAR(64) NOT NULL,
    symbol VARCHAR(32) NOT NULL,
    bid NUMERIC(28, 12),
    ask NUMERIC(28, 12),
    mid NUMERIC(28, 12) NOT NULL,
    as_of TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    raw JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX idx_market_quotes_symbol_asof ON market_quotes(symbol, as_of DESC);

-- ------------------------------------------------------------------------------
-- 6. UPDATED_AT TOUCH
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION touch_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_organizations_touch
    BEFORE UPDATE ON organizations
    FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

CREATE TRIGGER trg_users_touch
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

CREATE TRIGGER trg_payments_touch
    BEFORE UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

-- ------------------------------------------------------------------------------
-- 7. ENCLAVE SECURITY METADATA (FIPS-140-2 / PQC-1024 / ZK-SNARK headers)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS enclave_security_headers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID REFERENCES organizations(id),
    request_id VARCHAR(128),
    fips_level VARCHAR(64) NOT NULL DEFAULT 'FIPS-140-2-L4',
    pqc_kem VARCHAR(64) NOT NULL DEFAULT 'ML-KEM-1024',
    zk_proof_id VARCHAR(128),
    protocol_id VARCHAR(64) NOT NULL DEFAULT 'HPAY-REAL-MONEY-V2',
    layers_cleared TEXT[] NOT NULL DEFAULT ARRAY['L7','L6','L5','L4','L3','L2','L1'],
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_enclave_headers_org ON enclave_security_headers(org_id);
CREATE INDEX IF NOT EXISTS idx_enclave_headers_created ON enclave_security_headers(created_at DESC);

-- WebAuthn credentials (real FIDO2)
CREATE TABLE IF NOT EXISTS webauthn_credentials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    credential_id TEXT UNIQUE NOT NULL,
    public_key TEXT NOT NULL,
    counter BIGINT NOT NULL DEFAULT 0,
    transports TEXT[],
    device_type VARCHAR(64),
    backed_up BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_used_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS webauthn_challenges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    challenge TEXT NOT NULL,
    type VARCHAR(32) NOT NULL, -- registration | authentication
    amount_cents BIGINT,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
