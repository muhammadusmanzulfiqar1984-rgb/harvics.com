/**
 * Payment Status Badge Component
 * Displays payment status with color coding
 */

'use client'

import React from 'react'
import { PaymentStatus } from '@/types/payments'

interface PaymentStatusBadgeProps {
  status: PaymentStatus
  className?: string
}

const statusConfig: Record<PaymentStatus, { label: string; color: string; bgColor: string }> = {
  [PaymentStatus.PENDING]: {
    label: 'Pending',
    color: 'text-yellow-800',
    bgColor: 'bg-yellow-100'
  },
  [PaymentStatus.PROCESSING]: {
    label: 'Processing',
    color: 'text-blue-800',
    bgColor: 'bg-blue-100'
  },
  [PaymentStatus.COMPLETED]: {
    label: 'Completed',
    color: 'text-green-800',
    bgColor: 'bg-green-100'
  },
  [PaymentStatus.FAILED]: {
    label: 'Failed',
    color: 'text-red-800',
    bgColor: 'bg-red-100'
  },
  [PaymentStatus.REQUIRES_MANUAL_VERIFICATION]: {
    label: 'Needs Verification',
    color: 'text-orange-800',
    bgColor: 'bg-orange-100'
  },
  [PaymentStatus.CANCELLED]: {
    label: 'Cancelled',
    color: 'text-gray-800',
    bgColor: 'bg-gray-100'
  }
}

export default function PaymentStatusBadge({ status, className = '' }: PaymentStatusBadgeProps) {
  const config = statusConfig[status] || statusConfig[PaymentStatus.PENDING]

  return (
    <span className={`
      inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
      ${config.color} ${config.bgColor} ${className}
    `}>
      {config.label}
    </span>
  )
}
