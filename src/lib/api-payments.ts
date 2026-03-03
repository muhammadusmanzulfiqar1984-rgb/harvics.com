/**
 * Payment Engine API Client
 * Frontend API client for payment operations
 */

import { 
  CreatePaymentRequest, 
  PaymentApiResponse, 
  PaymentStatus 
} from '@/types/payments';

// Use Next.js proxy approach for consistency
// Client-side: relative URL uses Next.js proxy (port 3000 -> 4000)
// Server-side: use Next.js port, rewrites handle proxying
const isServer = typeof window === 'undefined';
const RAW_BASE_URL = isServer 
  ? (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000').replace(/\/$/, '') // Server: use Next.js port, rewrites handle proxying
  : ''; // Client: relative URL, uses same origin (port 3000)
const API_BASE_URL = `${RAW_BASE_URL}/api`;

async function apiRequest<T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

// Payment Operations
export const paymentApi = {
  /**
   * Create a new payment
   */
  async createPayment(request: CreatePaymentRequest): Promise<PaymentApiResponse> {
    return apiRequest<PaymentApiResponse>('/payments/create', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },

  /**
   * Process a payment with method-specific data
   */
  async processPayment(paymentId: string, methodData: Record<string, unknown>): Promise<PaymentApiResponse> {
    return apiRequest<PaymentApiResponse>(`/payments/process/${paymentId}`, {
      method: 'POST',
      body: JSON.stringify(methodData),
    });
  },

  /**
   * Get payment by ID
   */
  async getPayment(paymentId: string): Promise<PaymentApiResponse> {
    return apiRequest<PaymentApiResponse>(`/payments/${paymentId}`);
  },

  /**
   * Get current user's payments
   */
  async getMyPayments(filters?: {
    status?: PaymentStatus;
    method?: string;
    limit?: number;
  }): Promise<PaymentApiResponse> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.method) params.append('method', filters.method);
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const query = params.toString() ? `?${params.toString()}` : '';
    return apiRequest<PaymentApiResponse>(`/payments${query}`);
  },

  /**
   * Get payments requiring verification (Finance OS only)
   */
  async getVerificationQueue(limit = 100): Promise<PaymentApiResponse> {
    return apiRequest<PaymentApiResponse>(`/payments/verification-queue?limit=${limit}`);
  },

  /**
   * Verify a payment manually (Finance OS only)
   */
  async verifyPayment(
    paymentId: string, 
    status: PaymentStatus = PaymentStatus.COMPLETED,
    notes?: string
  ): Promise<PaymentApiResponse> {
    return apiRequest<PaymentApiResponse>(`/payments/verify/${paymentId}`, {
      method: 'POST',
      body: JSON.stringify({ status, notes }),
    });
  },

  /**
   * Upload proof document for a payment
   */
  async uploadProof(paymentId: string, proofUrl: string): Promise<PaymentApiResponse> {
    return apiRequest<PaymentApiResponse>(`/payments/upload-proof/${paymentId}`, {
      method: 'POST',
      body: JSON.stringify({ proofUrl }),
    });
  },

  /**
   * Upload supplier invoice
   */
  async uploadSupplierInvoice(invoiceData: {
    invoiceNumber: string;
    invoiceDate?: string;
    amount: number;
    currency?: string;
    dueDate?: string;
    pdfUrl: string;
  }): Promise<PaymentApiResponse> {
    return apiRequest<PaymentApiResponse>('/payments/invoice/upload', {
      method: 'POST',
      body: JSON.stringify(invoiceData),
    });
  },

  /**
   * Get supplier invoices
   */
  async getSupplierInvoices(status?: string): Promise<PaymentApiResponse> {
    const query = status ? `?status=${status}` : '';
    return apiRequest<PaymentApiResponse>(`/payments/invoices/supplier${query}`);
  },

  /**
   * Generate receipt for a payment
   */
  async generateReceipt(paymentId: string): Promise<PaymentApiResponse> {
    return apiRequest<PaymentApiResponse>(`/payments/receipt/${paymentId}`, {
      method: 'POST',
    });
  },
};

export default paymentApi;
