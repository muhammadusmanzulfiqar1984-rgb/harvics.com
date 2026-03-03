/**
 * Payment Method Card Component
 * Displays payment method option in the payment selection screen
 */

'use client'

import React from 'react'
import { PaymentMethod } from '@/types/payments'

interface PaymentMethodCardProps {
  method: PaymentMethod
  label: string
  icon: string
  description: string
  isSelected: boolean
  onClick: () => void
  disabled?: boolean
}

export default function PaymentMethodCard({
  method,
  label,
  icon,
  description,
  isSelected,
  onClick,
  disabled = false
}: PaymentMethodCardProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        p-4 border-2 rounded-lg text-left transition-all
        ${isSelected 
          ? 'border-[#F5C542] bg-[#F5C542]/10' 
          : 'border-black200 bg-white hover:border-[#F5C542]/50'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      <div className="flex items-start gap-4">
        <div className="text-3xl">{icon}</div>
        <div className="flex-1">
          <h3 className="font-semibold text-black mb-1">{label}</h3>
          <p className="text-sm text-black/70">{description}</p>
        </div>
        {isSelected && (
          <div className="w-5 h-5 rounded-full bg-[#F5C542] flex items-center justify-center">
            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        )}
      </div>
    </button>
  )
}
