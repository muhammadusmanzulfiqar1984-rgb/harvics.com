export type CurrencyCode = 'USD' | 'AED' | 'PKR' | 'EUR' | 'USDC' | 'USDT' | 'eUSD' | 'eAED' | 'BTC' | 'ETH';

export interface UserProfile {
  name: string;
  hpayId: string;
  email: string;
  accounts: string[];
  businessName: string;
  avatarUrl: string;
  kycStatus: 'Verified' | 'Pending' | 'Action Required';
}

export interface WalletBalances {
  USD: number;
  AED: number;
  PKR: number;
  EUR: number;
  USDC: number;
  USDT: number;
  eUSD: number;
  eAED: number;
  BTC: number;
  ETH: number;
}

export type TransactionStatus = 'Completed' | 'Pending' | 'Failed' | 'Refunded';

export interface LedgerEntry {
  accountName: string;
  debit: number;
  credit: number;
  description: string;
}

export interface Transaction {
  id: string;
  amount: number;
  currency: CurrencyCode;
  status: TransactionStatus;
  merchantOrPerson: string;
  recipientHPayId?: string;
  senderHPayId?: string;
  category: string;
  direction: 'in' | 'out';
  paymentMethod: string;
  paymentRail: string;
  timestamp: string;
  reference: string;
  riskStatus: string;
  riskScore: number;
  fee: number;
  settlementAmount: number;
  ledgerEntries: LedgerEntry[];
  note?: string;
}

export type InvoiceStatus = 'Paid' | 'Pending' | 'Overdue' | 'Draft';

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxPct: number;
  discount: number;
  total: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  currency: CurrencyCode;
  issueDate: string;
  dueDate: string;
  status: InvoiceStatus;
  items: InvoiceItem[];
  notes?: string;
}

export interface PaymentLink {
  id: string;
  code: string;
  productTitle: string;
  amount: number;
  currency: CurrencyCode;
  description: string;
  expirationDate: string;
  status: 'Active' | 'Paid' | 'Expired';
  createdAt: string;
  url: string;
}

export interface Payout {
  id: string;
  reference: string;
  beneficiaryName: string;
  bankName: string;
  accountNumber: string;
  amount: number;
  currency: CurrencyCode;
  status: 'Completed' | 'Processing' | 'Scheduled' | 'Failed';
  date: string;
}

export interface EscrowMilestone {
  step: string;
  label: string;
  date?: string;
  completed: boolean;
  current?: boolean;
}

export interface EscrowTrade {
  id: string;
  tradeTitle: string;
  buyerName: string;
  buyerId: string;
  supplierName: string;
  supplierId: string;
  tradeValue: number;
  currency: CurrencyCode;
  status: 'Funds Secured' | 'In Dispute' | 'Settled' | 'Draft' | 'Released';
  createdDate: string;
  timeline: EscrowMilestone[];
  trackingNumber?: string;
  carrier?: string;
}

export interface Trade {
  id: string;
  buyer: string;
  supplier: string;
  product: string;
  quantity: number;
  unitPrice: number;
  totalValue: number;
  currency: CurrencyCode;
  incoterm: 'FOB' | 'CIF' | 'EXW' | 'DDP';
  paymentTerms: string;
  status: 'Open' | 'Escrowed' | 'Pending Settlement' | 'Completed';
  complianceStatus: 'Passed' | 'Review' | 'Pending';
  escrowId?: string;
}

export interface SplitPaymentConfig {
  amount: number;
  sellerPct: number;
  harvicsPct: number;
  creatorPct: number;
  affiliatePct: number;
}

export interface PriceAlert {
  id: string;
  asset: CurrencyCode;
  targetPrice: number;
  condition: 'ABOVE' | 'BELOW';
  active: boolean;
  createdAt: string;
  triggeredAt?: string;
}

export interface StakingPosition {
  id: string;
  asset: CurrencyCode;
  amount: number;
  apr: number;
  stakedDate: string;
  lockPeriodDays: number;
  earnedYield: number;
  status: 'ACTIVE' | 'UNSTAKED';
}

export interface VaultApprover {
  name: string;
  role: string;
  signed: boolean;
  timestamp?: string;
}

export interface VaultTransferRequest {
  id: string;
  title: string;
  recipient: string;
  amount: number;
  asset: CurrencyCode;
  requiredSignatures: number;
  currentSignatures: number;
  approvers: VaultApprover[];
  status: 'SECURITY_PENDING' | 'APPROVED' | 'EXECUTED' | 'REJECTED';
  createdAt: string;
  riskAssessment: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  category: 'Payments' | 'Invoices' | 'Escrow' | 'Settlement' | 'Security' | 'KYC' | 'PriceAlert';
  read: boolean;
  link?: string;
}

export interface PreparedPaymentAction {
  recipient: string;
  amount: number;
  currency: CurrencyCode;
  fee: number;
  total: number;
  hpayId?: string;
}

export interface HarveyMessage {
  id: string;
  sender: 'user' | 'harvey';
  text: string;
  timestamp: string;
  preparedAction?: PreparedPaymentAction | null;
  metrics?: { label: string; value: string }[];
}

export type ActiveTab =
  | 'home'
  | 'pay'
  | 'wallet'
  | 'activity'
  | 'merchants'
  | 'checkout'
  | 'invoices'
  | 'payouts'
  | 'escrow'
  | 'trade'
  | 'split'
  | 'analytics'
  | 'harvey'
  | 'settings'
  | 'security'
  | 'profile'
  | 'developer';
