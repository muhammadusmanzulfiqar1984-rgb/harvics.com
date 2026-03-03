/**
 * Master Data Types - V15.2 Schema
 * Part of TIER_0_FOUNDATIONS: Master_Data_Engine
 */

// ============================================
// REFERENCE & SHARED TABLES
// ============================================

export interface Territory {
  id: string;
  country_id: string;
  region_id?: string;
  city_id?: string;
  code: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface Channel {
  id: string;
  code: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface Currency {
  code: string;
  name: string;
  symbol?: string;
  created_at: string;
  updated_at: string;
}

// ============================================
// IDENTITY & ACCESS
// ============================================

export interface Distributor {
  id: string;
  code: string;
  name: string;
  legal_name?: string;
  tax_id?: string;
  country_id: string;
  head_office_addr?: string;
  phone?: string;
  email?: string;
  credit_limit: number;
  credit_currency?: string;
  is_import_partner: boolean;
  status: 'ACTIVE' | 'BLOCKED';
  created_at: string;
  updated_at: string;
}

export interface DistributorWarehouse {
  id: string;
  distributor_id: string;
  name: string;
  address?: string;
  city_id?: string;
  latitude?: number;
  longitude?: number;
  created_at: string;
  updated_at: string;
}

export interface DistributorTerritory {
  id: string;
  distributor_id: string;
  territory_id: string;
  channel_id?: string;
  status: 'ACTIVE' | 'INACTIVE';
  assigned_at: string;
  created_at: string;
  updated_at: string;
}

export interface PortalUser {
  id: string;
  distributor_id?: string;
  email: string;
  full_name: string;
  password_hash: string;
  role: 'ADMIN' | 'SALES' | 'FINANCE' | 'VIEWER' | string;
  status: 'ACTIVE' | 'INACTIVE';
  last_login_at?: string;
  created_at: string;
  updated_at: string;
}

export interface PortalUserPermission {
  id: string;
  user_id: string;
  permission: string;
  created_at: string;
  updated_at: string;
}

// ============================================
// MASTER DATA - PRODUCTS & PRICING
// ============================================

export interface SKU {
  id: string;
  code: string;
  name: string;
  category: string;
  pack_size_g?: number;
  carton_size?: number;
  hs_code?: string;
  shelf_life_days?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SKUImage {
  id: string;
  sku_id: string;
  url: string;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

export interface PriceList {
  id: string;
  name: string;
  country_id: string;
  channel_id?: string;
  currency_code: string;
  valid_from: string; // DATE
  valid_to?: string; // DATE
  created_at: string;
  updated_at: string;
}

export interface PriceListItem {
  id: string;
  price_list_id: string;
  sku_id: string;
  mrp?: number;
  distributor_price?: number;
  vat_percent?: number;
  created_at: string;
  updated_at: string;
}

// ============================================
// ORDERS, INVOICES & FINANCE
// ============================================

export type OrderStatus = 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'DISPATCHED' | 'DELIVERED' | 'CANCELLED';
export type OrderType = 'CONTAINER' | 'MIXED' | 'CUSTOM';

export interface Order {
  id: string;
  order_number: string;
  distributor_id: string;
  warehouse_id?: string;
  country_id: string;
  currency_code: string;
  order_type: OrderType;
  status: OrderStatus;
  payment_terms?: string;
  incoterms?: string;
  expected_delivery_date?: string; // DATE
  subtotal_amount: number;
  tax_amount: number;
  total_amount: number;
  created_by?: string;
  submitted_at?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  sku_id: string;
  quantity: number;
  unit_price: number;
  line_total: number;
  ai_suggested: boolean;
  created_at: string;
  updated_at: string;
}

export type InvoiceStatus = 'OPEN' | 'PAID' | 'PARTIAL' | 'OVERDUE';

export interface Invoice {
  id: string;
  invoice_number: string;
  order_id: string;
  distributor_id: string;
  currency_code: string;
  invoice_date: string; // DATE
  due_date: string; // DATE
  subtotal_amount: number;
  tax_amount: number;
  total_amount: number;
  status: InvoiceStatus;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  distributor_id: string;
  invoice_id?: string;
  amount: number;
  currency_code: string;
  payment_date: string; // DATE
  method?: string;
  reference?: string;
  created_at: string;
  updated_at: string;
}

export interface CreditLimitHistory {
  id: string;
  distributor_id: string;
  old_limit?: number;
  new_limit?: number;
  currency_code?: string;
  changed_by?: string;
  reason?: string;
  created_at: string;
}

// ============================================
// PROMOTIONS
// ============================================

export interface Promotion {
  id: string;
  code: string;
  name: string;
  description?: string;
  country_id?: string;
  start_date: string; // DATE
  end_date: string; // DATE
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PromotionSKU {
  id: string;
  promotion_id: string;
  sku_id: string;
  extra_margin_percent?: number;
  created_at: string;
  updated_at: string;
}

export interface DistributorPromotion {
  id: string;
  promotion_id: string;
  distributor_id: string;
  status: 'JOINED' | 'OPTED_OUT';
  joined_at: string;
  created_at: string;
  updated_at: string;
}

// ============================================
// SUPPORT / TICKETS / MARKET DATA
// ============================================

export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
export type TicketCategory = 'PRODUCT' | 'FINANCE' | 'LOGISTICS' | 'OTHER';
export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface Ticket {
  id: string;
  ticket_number: string;
  distributor_id?: string;
  created_by_user?: string;
  category: TicketCategory;
  subject: string;
  description?: string;
  status: TicketStatus;
  priority: TicketPriority;
  related_order_id?: string;
  created_at: string;
  updated_at: string;
  closed_at?: string;
}

export type AuthorType = 'DISTRIBUTOR' | 'INTERNAL';

export interface TicketComment {
  id: string;
  ticket_id: string;
  author_type: AuthorType;
  author_id: string;
  message: string;
  created_at: string;
}

export interface Document {
  id: string;
  distributor_id?: string;
  related_type?: string; // ORDER / INVOICE / CONTRACT / LICENSE / OTHER
  related_id?: string;
  name: string;
  doc_type?: string; // CONTRACT / LICENSE / INVOICE / POD
  url: string;
  uploaded_by?: string;
  uploaded_at: string;
  expiry_date?: string; // DATE
  created_at: string;
  updated_at: string;
}

export type SelloutUploadStatus = 'PENDING' | 'PROCESSED' | 'FAILED';

export interface SelloutUpload {
  id: string;
  distributor_id: string;
  uploaded_by: string;
  period_month: number; // 1-12
  period_year: number;
  file_url: string;
  status: SelloutUploadStatus;
  processed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface SelloutLine {
  id: string;
  sellout_upload_id: string;
  sku_id?: string;
  territory_id?: string;
  quantity?: number;
  sales_amount?: number;
  created_at: string;
}

export interface CompetitorReport {
  id: string;
  distributor_id?: string;
  reported_by?: string;
  competitor_brand?: string;
  competitor_sku?: string;
  price?: number;
  promo_type?: string; // DISCOUNT / BUNDLE / DISPLAY / FREE_GOODS / OTHER
  retailer_name?: string;
  city_id?: string;
  photo_url?: string;
  notes?: string;
  reported_at: string;
  created_at: string;
}

// ============================================
// AI TRACKING
// ============================================

export type ContextType = 'ORDER' | 'PORTAL_DASHBOARD' | 'COVERAGE';
export type ModelType = 'AI_SALES' | 'AI_GEO' | 'AI_FIN' | 'AI_PROC' | 'AI_LOG' | 'AI_HR' | 'AI_COMP';

export interface AIRecommendationLog {
  id: string;
  context_type: ContextType;
  context_id?: string;
  distributor_id?: string;
  user_id?: string;
  model_type?: ModelType;
  payload_in: Record<string, any>;
  payload_out: Record<string, any>;
  accepted?: boolean;
  created_at: string;
}

// ============================================
// AUDIT LOGS
// ============================================

export type UserType = 'PORTAL' | 'INTERNAL' | 'SYSTEM';

export interface AuditLog {
  id: string;
  entity_type: string;
  entity_id: string;
  action: string; // CREATED / UPDATED / STATUS_CHANGED
  user_type: UserType;
  user_id?: string;
  description?: string;
  created_at: string;
}

// ============================================
// REQUEST/RESPONSE TYPES
// ============================================

export interface CreateTerritoryRequest {
  country_id: string;
  region_id?: string;
  city_id?: string;
  code: string;
  name: string;
}

export interface CreateChannelRequest {
  code: string;
  name: string;
}

export interface CreateCurrencyRequest {
  code: string;
  name: string;
  symbol?: string;
}

export interface CreateDistributorRequest {
  code: string;
  name: string;
  legal_name?: string;
  tax_id?: string;
  country_id: string;
  head_office_addr?: string;
  phone?: string;
  email?: string;
  credit_limit?: number;
  credit_currency?: string;
  is_import_partner?: boolean;
  status?: 'ACTIVE' | 'BLOCKED';
}

export interface UpdateDistributorRequest {
  name?: string;
  legal_name?: string;
  tax_id?: string;
  head_office_addr?: string;
  phone?: string;
  email?: string;
  credit_limit?: number;
  credit_currency?: string;
  is_import_partner?: boolean;
  status?: 'ACTIVE' | 'BLOCKED';
}

export interface CreateDistributorWarehouseRequest {
  distributor_id: string;
  name: string;
  address?: string;
  city_id?: string;
  latitude?: number;
  longitude?: number;
}

export interface CreateOrderRequest {
  distributor_id: string;
  warehouse_id?: string;
  country_id: string;
  currency_code: string;
  order_type: OrderType;
  payment_terms?: string;
  incoterms?: string;
  expected_delivery_date?: string;
  items: CreateOrderItemRequest[];
}

export interface CreateOrderItemRequest {
  sku_id: string;
  quantity: number;
  unit_price: number;
  ai_suggested?: boolean;
}

export interface CreateSKURequest {
  code: string;
  name: string;
  category: string;
  pack_size_g?: number;
  carton_size?: number;
  hs_code?: string;
  shelf_life_days?: number;
  is_active?: boolean;
}

export interface CreatePriceListRequest {
  name: string;
  country_id: string;
  channel_id?: string;
  currency_code: string;
  valid_from: string;
  valid_to?: string;
  items?: CreatePriceListItemRequest[];
}

export interface CreatePriceListItemRequest {
  sku_id: string;
  mrp?: number;
  distributor_price?: number;
  vat_percent?: number;
}

export interface CreatePromotionRequest {
  code: string;
  name: string;
  description?: string;
  country_id?: string;
  start_date: string;
  end_date: string;
  is_active?: boolean;
  skus?: Array<{ sku_id: string; extra_margin_percent?: number }>;
}

export interface CreateTicketRequest {
  distributor_id?: string;
  created_by_user?: string;
  category: TicketCategory;
  subject: string;
  description?: string;
  priority?: TicketPriority;
  related_order_id?: string;
}

export interface CreateTicketCommentRequest {
  ticket_id: string;
  author_type: AuthorType;
  author_id: string;
  message: string;
}

// ============================================
// FILTERS & QUERY TYPES
// ============================================

export interface TerritoryFilters {
  country_id?: string;
  region_id?: string;
  city_id?: string;
  code?: string;
  name?: string;
}

export interface DistributorFilters {
  country_id?: string;
  status?: 'ACTIVE' | 'BLOCKED';
  is_import_partner?: boolean;
  code?: string;
  name?: string;
}

export interface OrderFilters {
  distributor_id?: string;
  status?: OrderStatus;
  order_type?: OrderType;
  country_id?: string;
  date_from?: string;
  date_to?: string;
}

export interface SKUFilters {
  category?: string;
  is_active?: boolean;
  code?: string;
  name?: string;
}

export interface TicketFilters {
  distributor_id?: string;
  status?: TicketStatus;
  category?: TicketCategory;
  priority?: TicketPriority;
}

