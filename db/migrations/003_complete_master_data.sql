-- Migration: Complete Master Data Schema V15.2
-- Part of TIER_0_FOUNDATIONS: Master_Data_Engine & Market_Distribution_OS
-- Created: 2025-01-20

-- ============================================
-- 1. REFERENCE & SHARED TABLES (continued)
-- ============================================

-- Territories table
CREATE TABLE IF NOT EXISTS territories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_id  UUID NOT NULL REFERENCES countries(id) ON DELETE CASCADE,
  region_id   UUID REFERENCES regions(id) ON DELETE SET NULL,
  city_id     UUID REFERENCES cities(id) ON DELETE SET NULL,
  code        VARCHAR(50) NOT NULL,    -- TERR-LHR-01 etc
  name        VARCHAR(100) NOT NULL,
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_territories_country_id ON territories(country_id);
CREATE INDEX IF NOT EXISTS idx_territories_region_id ON territories(region_id);
CREATE INDEX IF NOT EXISTS idx_territories_city_id ON territories(city_id);
CREATE INDEX IF NOT EXISTS idx_territories_code ON territories(code);

-- Channels table
CREATE TABLE IF NOT EXISTS channels (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code        VARCHAR(20) UNIQUE NOT NULL,  -- GT, MT, HORECA, WHOLESALE
  name        VARCHAR(50) NOT NULL,
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_channels_code ON channels(code);

-- Currencies table
CREATE TABLE IF NOT EXISTS currencies (
  code        VARCHAR(3) PRIMARY KEY,
  name        VARCHAR(50) NOT NULL,
  symbol      VARCHAR(5),
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 2. IDENTITY & ACCESS (PORTAL USERS)
-- ============================================

-- Distributors table
CREATE TABLE IF NOT EXISTS distributors (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code               VARCHAR(50) UNIQUE NOT NULL, -- internal distributor code
  name               VARCHAR(200) NOT NULL,
  legal_name         VARCHAR(200),
  tax_id             VARCHAR(50),
  country_id         UUID NOT NULL REFERENCES countries(id),
  head_office_addr   TEXT,
  phone              VARCHAR(50),
  email              VARCHAR(200),
  credit_limit       NUMERIC(18,4) DEFAULT 0,
  credit_currency    VARCHAR(3) REFERENCES currencies(code),
  is_import_partner  BOOLEAN DEFAULT FALSE,
  status             VARCHAR(20) NOT NULL DEFAULT 'ACTIVE', -- ACTIVE/BLOCKED
  created_at         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_distributors_code ON distributors(code);
CREATE INDEX IF NOT EXISTS idx_distributors_country_id ON distributors(country_id);
CREATE INDEX IF NOT EXISTS idx_distributors_status ON distributors(status);
CREATE INDEX IF NOT EXISTS idx_distributors_email ON distributors(email);

-- Distributor warehouses table
CREATE TABLE IF NOT EXISTS distributor_warehouses (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  distributor_id UUID NOT NULL REFERENCES distributors(id) ON DELETE CASCADE,
  name          VARCHAR(150) NOT NULL,
  address       TEXT,
  city_id       UUID REFERENCES cities(id) ON DELETE SET NULL,
  latitude      NUMERIC(10,6),
  longitude     NUMERIC(10,6),
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_distributor_warehouses_distributor_id ON distributor_warehouses(distributor_id);
CREATE INDEX IF NOT EXISTS idx_distributor_warehouses_city_id ON distributor_warehouses(city_id);

-- Distributor territories table
CREATE TABLE IF NOT EXISTS distributor_territories (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  distributor_id UUID NOT NULL REFERENCES distributors(id) ON DELETE CASCADE,
  territory_id   UUID NOT NULL REFERENCES territories(id) ON DELETE CASCADE,
  channel_id     UUID REFERENCES channels(id) ON DELETE SET NULL,
  status         VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',  -- ACTIVE / INACTIVE
  assigned_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (distributor_id, territory_id, channel_id)
);

CREATE INDEX IF NOT EXISTS idx_distributor_territories_distributor_id ON distributor_territories(distributor_id);
CREATE INDEX IF NOT EXISTS idx_distributor_territories_territory_id ON distributor_territories(territory_id);
CREATE INDEX IF NOT EXISTS idx_distributor_territories_channel_id ON distributor_territories(channel_id);

-- Portal users table
CREATE TABLE IF NOT EXISTS portal_users (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  distributor_id UUID REFERENCES distributors(id) ON DELETE SET NULL, -- null for internal staff
  email          VARCHAR(200) UNIQUE NOT NULL,
  full_name      VARCHAR(150) NOT NULL,
  password_hash  TEXT NOT NULL,
  role           VARCHAR(50) NOT NULL, -- ADMIN / SALES / FINANCE / VIEWER, etc.
  status         VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
  last_login_at  TIMESTAMP,
  created_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_portal_users_email ON portal_users(email);
CREATE INDEX IF NOT EXISTS idx_portal_users_distributor_id ON portal_users(distributor_id);
CREATE INDEX IF NOT EXISTS idx_portal_users_status ON portal_users(status);

-- Portal user permissions table
CREATE TABLE IF NOT EXISTS portal_user_permissions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES portal_users(id) ON DELETE CASCADE,
  permission  VARCHAR(100) NOT NULL, -- e.g. 'orders.read', 'orders.create'
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (user_id, permission)
);

CREATE INDEX IF NOT EXISTS idx_portal_user_permissions_user_id ON portal_user_permissions(user_id);

-- ============================================
-- 3. MASTER DATA (PRODUCTS & PRICING)
-- ============================================

-- SKUs table
CREATE TABLE IF NOT EXISTS skus (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code           VARCHAR(50) UNIQUE NOT NULL,
  name           VARCHAR(200) NOT NULL,
  category       VARCHAR(50) NOT NULL,  -- WAFER, GUM, BEVERAGE, etc.
  pack_size_g    NUMERIC(10,3),
  carton_size    INTEGER,               -- units per carton
  hs_code        VARCHAR(20),
  shelf_life_days INTEGER,
  is_active      BOOLEAN DEFAULT TRUE,
  created_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_skus_code ON skus(code);
CREATE INDEX IF NOT EXISTS idx_skus_category ON skus(category);
CREATE INDEX IF NOT EXISTS idx_skus_is_active ON skus(is_active);

-- SKU images table
CREATE TABLE IF NOT EXISTS sku_images (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku_id    UUID NOT NULL REFERENCES skus(id) ON DELETE CASCADE,
  url       TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sku_images_sku_id ON sku_images(sku_id);
CREATE INDEX IF NOT EXISTS idx_sku_images_is_primary ON sku_images(is_primary);

-- Price lists table
CREATE TABLE IF NOT EXISTS price_lists (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name           VARCHAR(150) NOT NULL,
  country_id     UUID NOT NULL REFERENCES countries(id),
  channel_id     UUID REFERENCES channels(id) ON DELETE SET NULL,
  currency_code  VARCHAR(3) NOT NULL REFERENCES currencies(code),
  valid_from     DATE NOT NULL,
  valid_to       DATE,
  created_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_price_lists_country_id ON price_lists(country_id);
CREATE INDEX IF NOT EXISTS idx_price_lists_channel_id ON price_lists(channel_id);
CREATE INDEX IF NOT EXISTS idx_price_lists_valid_from ON price_lists(valid_from);
CREATE INDEX IF NOT EXISTS idx_price_lists_valid_to ON price_lists(valid_to);

-- Price list items table
CREATE TABLE IF NOT EXISTS price_list_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  price_list_id   UUID NOT NULL REFERENCES price_lists(id) ON DELETE CASCADE,
  sku_id          UUID NOT NULL REFERENCES skus(id),
  mrp             NUMERIC(18,4),
  distributor_price NUMERIC(18,4),
  vat_percent     NUMERIC(6,3),
  created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (price_list_id, sku_id)
);

CREATE INDEX IF NOT EXISTS idx_price_list_items_price_list_id ON price_list_items(price_list_id);
CREATE INDEX IF NOT EXISTS idx_price_list_items_sku_id ON price_list_items(sku_id);

-- ============================================
-- 4. ORDERS, INVOICES & FINANCE
-- ============================================

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number     VARCHAR(50) UNIQUE NOT NULL,
  distributor_id   UUID NOT NULL REFERENCES distributors(id),
  warehouse_id     UUID REFERENCES distributor_warehouses(id) ON DELETE SET NULL,
  country_id       UUID NOT NULL REFERENCES countries(id),
  currency_code    VARCHAR(3) NOT NULL REFERENCES currencies(code),
  order_type       VARCHAR(20) NOT NULL, -- CONTAINER / MIXED / CUSTOM
  status           VARCHAR(20) NOT NULL DEFAULT 'DRAFT', 
                   -- DRAFT / SUBMITTED / APPROVED / DISPATCHED / DELIVERED / CANCELLED
  payment_terms    VARCHAR(100),
  incoterms        VARCHAR(10),          -- FOB/CFR/CIF/EXW
  expected_delivery_date DATE,
  subtotal_amount  NUMERIC(18,4) DEFAULT 0,
  tax_amount       NUMERIC(18,4) DEFAULT 0,
  total_amount     NUMERIC(18,4) DEFAULT 0,
  created_by       UUID REFERENCES portal_users(id) ON DELETE SET NULL,
  submitted_at     TIMESTAMP,
  created_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_distributor_id ON orders(distributor_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id     UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  sku_id       UUID NOT NULL REFERENCES skus(id),
  quantity     NUMERIC(18,3) NOT NULL,
  unit_price   NUMERIC(18,4) NOT NULL,
  line_total   NUMERIC(18,4) NOT NULL,
  ai_suggested BOOLEAN DEFAULT FALSE,  -- if quantity from AI recommendation
  created_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (order_id, sku_id)
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_sku_id ON order_items(sku_id);

-- Invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number  VARCHAR(50) UNIQUE NOT NULL,
  order_id        UUID NOT NULL REFERENCES orders(id),
  distributor_id  UUID NOT NULL REFERENCES distributors(id),
  currency_code   VARCHAR(3) NOT NULL REFERENCES currencies(code),
  invoice_date    DATE NOT NULL,
  due_date        DATE NOT NULL,
  subtotal_amount NUMERIC(18,4) NOT NULL,
  tax_amount      NUMERIC(18,4) NOT NULL,
  total_amount    NUMERIC(18,4) NOT NULL,
  status          VARCHAR(20) NOT NULL DEFAULT 'OPEN', -- OPEN / PAID / PARTIAL / OVERDUE
  created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_invoices_invoice_number ON invoices(invoice_number);
CREATE INDEX IF NOT EXISTS idx_invoices_order_id ON invoices(order_id);
CREATE INDEX IF NOT EXISTS idx_invoices_distributor_id ON invoices(distributor_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON invoices(due_date);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  distributor_id  UUID NOT NULL REFERENCES distributors(id),
  invoice_id      UUID REFERENCES invoices(id) ON DELETE SET NULL,
  amount          NUMERIC(18,4) NOT NULL,
  currency_code   VARCHAR(3) NOT NULL REFERENCES currencies(code),
  payment_date    DATE NOT NULL,
  method          VARCHAR(50), -- bank transfer, cheque, etc.
  reference       VARCHAR(100),
  created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_payments_distributor_id ON payments(distributor_id);
CREATE INDEX IF NOT EXISTS idx_payments_invoice_id ON payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payments_payment_date ON payments(payment_date);

-- Credit limits history table
CREATE TABLE IF NOT EXISTS credit_limits_history (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  distributor_id  UUID NOT NULL REFERENCES distributors(id),
  old_limit       NUMERIC(18,4),
  new_limit       NUMERIC(18,4),
  currency_code   VARCHAR(3) REFERENCES currencies(code),
  changed_by      UUID, -- internal user
  reason          TEXT,
  created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_credit_limits_history_distributor_id ON credit_limits_history(distributor_id);
CREATE INDEX IF NOT EXISTS idx_credit_limits_history_created_at ON credit_limits_history(created_at);

-- ============================================
-- 5. PROMOTIONS
-- ============================================

-- Promotions table
CREATE TABLE IF NOT EXISTS promotions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code            VARCHAR(50) UNIQUE NOT NULL,
  name            VARCHAR(200) NOT NULL,
  description     TEXT,
  country_id      UUID REFERENCES countries(id) ON DELETE SET NULL,
  start_date      DATE NOT NULL,
  end_date        DATE NOT NULL,
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_promotions_code ON promotions(code);
CREATE INDEX IF NOT EXISTS idx_promotions_country_id ON promotions(country_id);
CREATE INDEX IF NOT EXISTS idx_promotions_start_date ON promotions(start_date);
CREATE INDEX IF NOT EXISTS idx_promotions_end_date ON promotions(end_date);
CREATE INDEX IF NOT EXISTS idx_promotions_is_active ON promotions(is_active);

-- Promotion SKUs table
CREATE TABLE IF NOT EXISTS promotion_skus (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  promotion_id  UUID NOT NULL REFERENCES promotions(id) ON DELETE CASCADE,
  sku_id        UUID NOT NULL REFERENCES skus(id),
  extra_margin_percent NUMERIC(6,3),
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (promotion_id, sku_id)
);

CREATE INDEX IF NOT EXISTS idx_promotion_skus_promotion_id ON promotion_skus(promotion_id);
CREATE INDEX IF NOT EXISTS idx_promotion_skus_sku_id ON promotion_skus(sku_id);

-- Distributor promotions table
CREATE TABLE IF NOT EXISTS distributor_promotions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  promotion_id    UUID NOT NULL REFERENCES promotions(id) ON DELETE CASCADE,
  distributor_id  UUID NOT NULL REFERENCES distributors(id) ON DELETE CASCADE,
  status          VARCHAR(20) NOT NULL DEFAULT 'JOINED', -- JOINED / OPTED_OUT
  joined_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (promotion_id, distributor_id)
);

CREATE INDEX IF NOT EXISTS idx_distributor_promotions_promotion_id ON distributor_promotions(promotion_id);
CREATE INDEX IF NOT EXISTS idx_distributor_promotions_distributor_id ON distributor_promotions(distributor_id);

-- ============================================
-- 6. SUPPORT / TICKETS / MARKET DATA
-- ============================================

-- Tickets table
CREATE TABLE IF NOT EXISTS tickets (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number   VARCHAR(50) UNIQUE NOT NULL,
  distributor_id  UUID REFERENCES distributors(id) ON DELETE SET NULL,
  created_by_user UUID REFERENCES portal_users(id) ON DELETE SET NULL,
  category        VARCHAR(50) NOT NULL, -- PRODUCT / FINANCE / LOGISTICS / OTHER
  subject         VARCHAR(200) NOT NULL,
  description     TEXT,
  status          VARCHAR(20) NOT NULL DEFAULT 'OPEN', 
                   -- OPEN / IN_PROGRESS / RESOLVED / CLOSED
  priority        VARCHAR(20) DEFAULT 'MEDIUM',
  related_order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  closed_at       TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_tickets_ticket_number ON tickets(ticket_number);
CREATE INDEX IF NOT EXISTS idx_tickets_distributor_id ON tickets(distributor_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_category ON tickets(category);

-- Ticket comments table
CREATE TABLE IF NOT EXISTS ticket_comments (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id   UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  author_type VARCHAR(20) NOT NULL,  -- DISTRIBUTOR / INTERNAL
  author_id   UUID NOT NULL,         -- portal_users or internal user table
  message     TEXT NOT NULL,
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ticket_comments_ticket_id ON ticket_comments(ticket_id);

-- Documents table
CREATE TABLE IF NOT EXISTS documents (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  distributor_id  UUID REFERENCES distributors(id) ON DELETE SET NULL,
  related_type    VARCHAR(50),   -- ORDER / INVOICE / CONTRACT / LICENSE / OTHER
  related_id      UUID,          -- id of that entity
  name            VARCHAR(200) NOT NULL,
  doc_type        VARCHAR(50),   -- CONTRACT / LICENSE / INVOICE / POD
  url             TEXT NOT NULL,
  uploaded_by     UUID,          -- portal_users or staff
  uploaded_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expiry_date     DATE,
  created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_documents_distributor_id ON documents(distributor_id);
CREATE INDEX IF NOT EXISTS idx_documents_related_type ON documents(related_type);
CREATE INDEX IF NOT EXISTS idx_documents_expiry_date ON documents(expiry_date);

-- Sellout uploads table
CREATE TABLE IF NOT EXISTS sellout_uploads (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  distributor_id  UUID NOT NULL REFERENCES distributors(id),
  uploaded_by     UUID NOT NULL REFERENCES portal_users(id),
  period_month    INTEGER NOT NULL,   -- 1-12
  period_year     INTEGER NOT NULL,
  file_url        TEXT NOT NULL,
  status          VARCHAR(20) NOT NULL DEFAULT 'PENDING', -- PENDING / PROCESSED / FAILED
  processed_at    TIMESTAMP,
  created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (distributor_id, period_month, period_year)
);

CREATE INDEX IF NOT EXISTS idx_sellout_uploads_distributor_id ON sellout_uploads(distributor_id);
CREATE INDEX IF NOT EXISTS idx_sellout_uploads_period ON sellout_uploads(period_year, period_month);

-- Sellout lines table
CREATE TABLE IF NOT EXISTS sellout_lines (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sellout_upload_id UUID NOT NULL REFERENCES sellout_uploads(id) ON DELETE CASCADE,
  sku_id          UUID REFERENCES skus(id) ON DELETE SET NULL,
  territory_id    UUID REFERENCES territories(id) ON DELETE SET NULL,
  quantity        NUMERIC(18,3),
  sales_amount    NUMERIC(18,4),
  created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sellout_lines_upload_id ON sellout_lines(sellout_upload_id);
CREATE INDEX IF NOT EXISTS idx_sellout_lines_sku_id ON sellout_lines(sku_id);

-- Competitor reports table
CREATE TABLE IF NOT EXISTS competitor_reports (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  distributor_id  UUID REFERENCES distributors(id) ON DELETE SET NULL,
  reported_by     UUID REFERENCES portal_users(id) ON DELETE SET NULL,
  competitor_brand VARCHAR(100),
  competitor_sku   VARCHAR(150),
  price           NUMERIC(18,4),
  promo_type      VARCHAR(50), -- DISCOUNT / BUNDLE / DISPLAY / FREE_GOODS / OTHER
  retailer_name   VARCHAR(150),
  city_id         UUID REFERENCES cities(id) ON DELETE SET NULL,
  photo_url       TEXT,
  notes           TEXT,
  reported_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_competitor_reports_distributor_id ON competitor_reports(distributor_id);
CREATE INDEX IF NOT EXISTS idx_competitor_reports_city_id ON competitor_reports(city_id);
CREATE INDEX IF NOT EXISTS idx_competitor_reports_reported_at ON competitor_reports(reported_at);

-- ============================================
-- 7. HARVEY / AI TRACKING
-- ============================================

-- AI recommendations log table
CREATE TABLE IF NOT EXISTS ai_recommendations_log (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  context_type    VARCHAR(50) NOT NULL, -- ORDER / PORTAL_DASHBOARD / COVERAGE
  context_id      UUID,                 -- order_id, distributor_id, etc.
  distributor_id  UUID REFERENCES distributors(id) ON DELETE SET NULL,
  user_id         UUID REFERENCES portal_users(id) ON DELETE SET NULL,
  model_type      VARCHAR(50),          -- AI_SALES / AI_GEO / AI_FIN, etc.
  payload_in      JSONB NOT NULL,       -- what we sent to AI
  payload_out     JSONB NOT NULL,       -- recommendation
  accepted        BOOLEAN,              -- did user accept / use it?
  created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ai_recommendations_context ON ai_recommendations_log(context_type, context_id);
CREATE INDEX IF NOT EXISTS idx_ai_recommendations_distributor_id ON ai_recommendations_log(distributor_id);
CREATE INDEX IF NOT EXISTS idx_ai_recommendations_user_id ON ai_recommendations_log(user_id);

-- ============================================
-- 8. AUDIT / LOGS
-- ============================================

-- Audit logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type   VARCHAR(50) NOT NULL, -- ORDER / INVOICE / TICKET / etc.
  entity_id     UUID NOT NULL,
  action        VARCHAR(50) NOT NULL, -- CREATED / UPDATED / STATUS_CHANGED
  user_type     VARCHAR(20) NOT NULL, -- PORTAL / INTERNAL / SYSTEM
  user_id       UUID,
  description   TEXT,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_type, user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- ============================================
-- TRIGGERS FOR AUTO-UPDATE TIMESTAMPS
-- ============================================

-- Add triggers for all new tables
CREATE TRIGGER update_territories_updated_at BEFORE UPDATE ON territories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_channels_updated_at BEFORE UPDATE ON channels
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_currencies_updated_at BEFORE UPDATE ON currencies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_distributors_updated_at BEFORE UPDATE ON distributors
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_distributor_warehouses_updated_at BEFORE UPDATE ON distributor_warehouses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_distributor_territories_updated_at BEFORE UPDATE ON distributor_territories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_portal_users_updated_at BEFORE UPDATE ON portal_users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_portal_user_permissions_updated_at BEFORE UPDATE ON portal_user_permissions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_skus_updated_at BEFORE UPDATE ON skus
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sku_images_updated_at BEFORE UPDATE ON sku_images
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_price_lists_updated_at BEFORE UPDATE ON price_lists
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_price_list_items_updated_at BEFORE UPDATE ON price_list_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_order_items_updated_at BEFORE UPDATE ON order_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_promotions_updated_at BEFORE UPDATE ON promotions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_promotion_skus_updated_at BEFORE UPDATE ON promotion_skus
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_distributor_promotions_updated_at BEFORE UPDATE ON distributor_promotions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tickets_updated_at BEFORE UPDATE ON tickets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sellout_uploads_updated_at BEFORE UPDATE ON sellout_uploads
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- INITIAL DATA
-- ============================================

-- Insert default currencies
INSERT INTO currencies (code, name, symbol) VALUES
  ('PKR', 'Pakistani Rupee', 'Rs'),
  ('OMR', 'Omani Rial', '﷼'),
  ('EUR', 'Euro', '€'),
  ('USD', 'US Dollar', '$'),
  ('AED', 'UAE Dirham', 'د.إ'),
  ('GBP', 'British Pound', '£'),
  ('CNY', 'Chinese Yuan', '¥'),
  ('INR', 'Indian Rupee', '₹'),
  ('SAR', 'Saudi Riyal', '﷼')
ON CONFLICT (code) DO NOTHING;

-- Insert default channels
INSERT INTO channels (code, name) VALUES
  ('GT', 'General Trade'),
  ('MT', 'Modern Trade'),
  ('HORECA', 'Hotels, Restaurants & Cafes'),
  ('WHOLESALE', 'Wholesale')
ON CONFLICT (code) DO NOTHING;

