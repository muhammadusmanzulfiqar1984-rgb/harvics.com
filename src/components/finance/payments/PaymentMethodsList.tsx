'use client'

import React from 'react'
import PaymentMethodCard from './PaymentMethodCard'
import { PaymentMethod } from '@/types/payments'

interface PaymentMethodConfig {
  method: PaymentMethod
  label: string
  icon: string
  description: string
  requiresProof: boolean
  requiresVerification: boolean
  disabled?: boolean
}

interface PaymentMethodsListProps {
  selectedMethod?: PaymentMethod
  onMethodSelect: (method: PaymentMethod) => void
  availableMethods?: PaymentMethod[]
}

const allPaymentMethods: PaymentMethodConfig[] = [
  {
    method: PaymentMethod.BANK_TRANSFER,
    label: 'Bank Transfer',
    icon: '🏦',
    description: 'Direct bank transfer with proof upload',
    requiresProof: true,
    requiresVerification: true
  },
  {
    method: PaymentMethod.CREDIT_CARD,
    label: 'Credit Card',
    icon: '💳',
    description: 'Secure credit card payment',
    requiresProof: false,
    requiresVerification: false
  },
  {
    method: PaymentMethod.DEBIT_CARD,
    label: 'Debit Card',
    icon: '💳',
    description: 'Secure debit card payment',
    requiresProof: false,
    requiresVerification: false
  },
  {
    method: PaymentMethod.PAYPAL,
    label: 'PayPal',
    icon: '🔵',
    description: 'Pay with your PayPal account',
    requiresProof: false,
    requiresVerification: false
  },
  {
    method: PaymentMethod.WISE,
    label: 'Wise',
    icon: '💸',
    description: 'International money transfer via Wise',
    requiresProof: true,
    requiresVerification: true
  },
  {
    method: PaymentMethod.APPLE_PAY,
    label: 'Apple Pay',
    icon: '🍎',
    description: 'Quick payment with Apple Pay',
    requiresProof: false,
    requiresVerification: false
  },
  {
    method: PaymentMethod.USDT,
    label: 'USDT (Crypto)',
    icon: '₮',
    description: 'Pay with USDT cryptocurrency',
    requiresProof: true,
    requiresVerification: true
  },
  {
    method: PaymentMethod.USDC,
    label: 'USDC (Crypto)',
    icon: '💵',
    description: 'Pay with USDC cryptocurrency',
    requiresProof: true,
    requiresVerification: true
  },
  {
    method: PaymentMethod.CHEQUE,
    label: 'Cheque',
    icon: '📝',
    description: 'Pay by cheque with photo upload',
    requiresProof: true,
    requiresVerification: true
  },
  {
    method: PaymentMethod.PAY_ORDER,
    label: 'Pay Order',
    icon: '📄',
    description: 'Pay by pay order',
    requiresProof: true,
    requiresVerification: true
  },
  {
    method: PaymentMethod.DEMAND_DRAFT,
    label: 'Demand Draft',
    icon: '📋',
    description: 'Pay by demand draft',
    requiresProof: true,
    requiresVerification: true
  }
]

export default function PaymentMethodsList({
  selectedMethod,
  onMethodSelect,
  availableMethods
}: PaymentMethodsListProps) {
  const methodsToShow = availableMethods
    ? allPaymentMethods.filter(m => availableMethods.includes(m.method))
    : allPaymentMethods

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-black mb-4">Select Payment Method</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {methodsToShow.map((config) => (
          <PaymentMethodCard
            key={config.method}
            method={config.method}
            label={config.label}
            icon={config.icon}
            description={config.description}
            isSelected={selectedMethod === config.method}
            onClick={() => onMethodSelect(config.method)}
            disabled={config.disabled}
          />
        ))}
      </div>
    </div>
  )
}

