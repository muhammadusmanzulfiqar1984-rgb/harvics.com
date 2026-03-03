/**
 * Payment Engine - TypeScript Types
 * Frontend types for payment processing
 */

// Payment Methods
export enum PaymentMethod {
  BANK_TRANSFER = 'BANK_TRANSFER',
  CREDIT_CARD = 'CREDIT_CARD',
  DEBIT_CARD = 'DEBIT_CARD',
  PAYPAL = 'PAYPAL',
  WISE = 'WISE',
  APPLE_PAY = 'APPLE_PAY',
  USDT = 'USDT',
  USDC = 'USDC',
  CHEQUE = 'CHEQUE',
  PAY_ORDER = 'PAY_ORDER',
  DEMAND_DRAFT = 'DEMAND_DRAFT'
}

// Payment Status
export enum PaymentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REQUIRES_MANUAL_VERIFICATION = 'REQUIRES_MANUAL_VERIFICATION',
  CANCELLED = 'CANCELLED'
}

// Payment Flow Types
export enum PaymentFlowType {
  PAY_ADVANCE = 'PAY_ADVANCE',
  PAY_INVOICE = 'PAY_INVOICE',
  PAY_OUTSTANDING_BALANCE = 'PAY_OUTSTANDING_BALANCE',
  TOP_UP_WALLET = 'TOP_UP_WALLET',
  PAY_SECURITY_DEPOSIT = 'PAY_SECURITY_DEPOSIT',
  PAY_TERRITORY_DEPOSIT = 'PAY_TERRITORY_DEPOSIT'
}

// Supported Currencies
export type SupportedCurrency = 
  | 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD' 
  | 'AED' | 'SAR' | 'PKR' | 'USDT' | 'USDC';

// Portal Types
export type PortalType = 'company' | 'distributor' | 'supplier';

// Payment Record
export interface Payment {
  id: string;
  invoice_id?: string | null;
  user_id: string;
  portal_type: PortalType;
  amount: number;
  currency: SupportedCurrency;
  payment_method: PaymentMethod;
  status: PaymentStatus;
  flow_type?: PaymentFlowType;
  payment_date?: string;
  reference_number?: string | null;
  tx_hash?: string | null;
  provider_reference?: string | null;
  proof_url?: string | null;
  network?: string | null;
  bank_name?: string | null;
  account_number?: string | null;
  iban?: string | null;
  swift_bic?: string | null;
  cheque_number?: string | null;
  cheque_date?: string | null;
  notes?: string | null;
  requires_verification: boolean;
  verified_by?: string | null;
  verified_at?: string | null;
  created_at: string;
  updated_at: string;
}

// Create Payment Request
export interface CreatePaymentRequest {
  invoiceId?: string;
  amount: number;
  currency?: SupportedCurrency;
  method: PaymentMethod;
  flowType?: PaymentFlowType;
  metadata?: PaymentMetadata;
}

// Payment Metadata (method-specific data)
export interface PaymentMetadata {
  txHash?: string;
  providerReference?: string;
  proofUrl?: string;
  network?: string;
  bankName?: string;
  accountNumber?: string;
  iban?: string;
  swiftBic?: string;
  chequeNumber?: string;
  chequeDate?: string;
  referenceNumber?: string;
  notes?: string;
}

// Payment Method Config
export interface PaymentMethodConfig {
  method: PaymentMethod;
  label: string;
  icon: string;
  description: string;
  requiresProof: boolean;
  requiresVerification: boolean;
  supportedCurrencies: SupportedCurrency[];
}

// Supplier Invoice
export interface SupplierInvoice {
  id: string;
  supplier_id: string;
  invoice_number: string;
  invoice_date: string;
  amount: number;
  currency: SupportedCurrency;
  due_date?: string;
  pdf_url: string;
  status: 'pending' | 'approved' | 'paid' | 'rejected';
  approved_by?: string | null;
  approved_at?: string | null;
  payment_date?: string | null;
  payment_reference?: string | null;
  bank_used?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

// Payment API Response
export interface PaymentApiResponse {
  success: boolean;
  payment?: Payment;
  payments?: Payment[];
  invoice?: SupplierInvoice;
  invoices?: SupplierInvoice[];
  error?: string;
}

// Payment Form Data
export interface PaymentFormData {
  method: PaymentMethod;
  amount: number;
  currency: SupportedCurrency;
  flowType: PaymentFlowType;
  invoiceId?: string;
  
  // Method-specific fields
  bankTransfer?: {
    accountName?: string;
    iban?: string;
    accountNumber?: string;
    bankName?: string;
    swiftBic?: string;
    proofFile?: File;
  };
  
  card?: {
    cardholderName?: string;
    cardNumber?: string;
    expiryMonth?: string;
    expiryYear?: string;
    cvv?: string;
    billingCountry?: string;
  };
  
  wise?: {
    email?: string;
    wiseId?: string;
    paymentReference?: string;
    screenshotFile?: File;
  };
  
  crypto?: {
    network?: 'ERC20' | 'TRC20';
    txHash?: string;
    screenshotFile?: File;
  };
  
  cheque?: {
    type?: 'CHEQUE' | 'PAY_ORDER' | 'DEMAND_DRAFT';
    bankName?: string;
    instrumentNumber?: string;
    date?: string;
    photoFile?: File;
  };
}

