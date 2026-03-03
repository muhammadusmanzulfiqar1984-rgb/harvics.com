/**
 * Payment Method Configuration
 * Central configuration for all payment methods
 */

import { PaymentMethod, SupportedCurrency } from '@/types/payments'

export interface PaymentMethodInfo {
  method: PaymentMethod
  label: string
  icon: string
  description: string
  requiresProof: boolean
  requiresVerification: boolean
  supportedCurrencies: SupportedCurrency[]
  availableInPortals: ('distributor' | 'supplier' | 'company')[]
}

export const PAYMENT_METHODS: PaymentMethodInfo[] = [
  {
    method: PaymentMethod.BANK_TRANSFER,
    label: 'Bank Transfer',
    icon: '🏦',
    description: 'Transfer funds directly from your bank account',
    requiresProof: true,
    requiresVerification: true,
    supportedCurrencies: ['USD', 'EUR', 'GBP', 'AED', 'SAR', 'PKR'],
    availableInPortals: ['distributor', 'company']
  },
  {
    method: PaymentMethod.CREDIT_CARD,
    label: 'Credit Card',
    icon: '💳',
    description: 'Pay securely with Visa, Mastercard, or Amex',
    requiresProof: false,
    requiresVerification: false,
    supportedCurrencies: ['USD', 'EUR', 'GBP', 'AED'],
    availableInPortals: ['distributor']
  },
  {
    method: PaymentMethod.DEBIT_CARD,
    label: 'Debit Card',
    icon: '💳',
    description: 'Pay directly from your bank account',
    requiresProof: false,
    requiresVerification: false,
    supportedCurrencies: ['USD', 'EUR', 'GBP', 'AED'],
    availableInPortals: ['distributor']
  },
  {
    method: PaymentMethod.PAYPAL,
    label: 'PayPal',
    icon: '🔵',
    description: 'Pay using your PayPal account',
    requiresProof: false,
    requiresVerification: false,
    supportedCurrencies: ['USD', 'EUR', 'GBP'],
    availableInPortals: ['distributor']
  },
  {
    method: PaymentMethod.WISE,
    label: 'Wise (formerly TransferWise)',
    icon: '💸',
    description: 'Low-cost international money transfers',
    requiresProof: true,
    requiresVerification: true,
    supportedCurrencies: ['USD', 'EUR', 'GBP', 'AED', 'SAR', 'PKR'],
    availableInPortals: ['distributor', 'company']
  },
  {
    method: PaymentMethod.APPLE_PAY,
    label: 'Apple Pay',
    icon: '🍎',
    description: 'Pay securely with Apple Pay',
    requiresProof: false,
    requiresVerification: false,
    supportedCurrencies: ['USD', 'EUR', 'GBP'],
    availableInPortals: ['distributor']
  },
  {
    method: PaymentMethod.USDT,
    label: 'USDT (Tether)',
    icon: '₿',
    description: 'Pay with USDT cryptocurrency',
    requiresProof: true,
    requiresVerification: true,
    supportedCurrencies: ['USDT'],
    availableInPortals: ['distributor', 'company']
  },
  {
    method: PaymentMethod.USDC,
    label: 'USDC (USD Coin)',
    icon: '₿',
    description: 'Pay with USDC cryptocurrency',
    requiresProof: true,
    requiresVerification: true,
    supportedCurrencies: ['USDC'],
    availableInPortals: ['distributor', 'company']
  },
  {
    method: PaymentMethod.CHEQUE,
    label: 'Cheque',
    icon: '📄',
    description: 'Pay by cheque (requires manual processing)',
    requiresProof: true,
    requiresVerification: true,
    supportedCurrencies: ['USD', 'EUR', 'GBP', 'AED', 'SAR', 'PKR'],
    availableInPortals: ['distributor']
  },
  {
    method: PaymentMethod.PAY_ORDER,
    label: 'Pay Order',
    icon: '📋',
    description: 'Pay by bank pay order',
    requiresProof: true,
    requiresVerification: true,
    supportedCurrencies: ['USD', 'PKR', 'AED', 'SAR'],
    availableInPortals: ['distributor']
  },
  {
    method: PaymentMethod.DEMAND_DRAFT,
    label: 'Demand Draft',
    icon: '📝',
    description: 'Pay by demand draft',
    requiresProof: true,
    requiresVerification: true,
    supportedCurrencies: ['USD', 'PKR', 'AED', 'SAR'],
    availableInPortals: ['distributor']
  }
]

export function getPaymentMethodInfo(method: PaymentMethod): PaymentMethodInfo | undefined {
  return PAYMENT_METHODS.find(m => m.method === method)
}

export function getAvailablePaymentMethods(portal: 'distributor' | 'supplier' | 'company'): PaymentMethodInfo[] {
  return PAYMENT_METHODS.filter(m => m.availableInPortals.includes(portal))
}

