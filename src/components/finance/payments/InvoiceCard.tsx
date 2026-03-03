/**
 * Invoice Card Component
 * Displays invoice information with payment options
 */

'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import PaymentStatusBadge from './PaymentStatusBadge'
import { PaymentStatus } from '@/types/payments'

interface InvoiceCardProps {
  invoice: {
    id: string
    invoice_number: string
    invoice_date: string
    due_date?: string
    amount: number
    paid_amount?: number
    currency: string
    status: string
    pdf_url?: string
  }
  onPay?: (invoiceId: string) => void
  onView?: (invoiceId: string) => void
}

export default function InvoiceCard({ invoice, onPay, onView }: InvoiceCardProps) {
  const locale = useLocale()
  const router = useRouter()

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency || 'USD'
    }).format(amount)
  }

  const outstandingAmount = invoice.amount - (invoice.paid_amount || 0)
  const isPaid = invoice.status === 'paid' || outstandingAmount <= 0

  return (
    <div className="bg-white border border-black200 rounded-lg p-6 hover:shadow-md transition-all">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-black text-lg mb-1">
            Invoice #{invoice.invoice_number}
          </h3>
          <p className="text-sm text-black/70">
            Date: {new Date(invoice.invoice_date).toLocaleDateString()}
            {invoice.due_date && (
              <> • Due: {new Date(invoice.due_date).toLocaleDateString()}</>
            )}
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-black mb-1">
            {formatCurrency(invoice.amount, invoice.currency)}
          </div>
          {!isPaid && outstandingAmount > 0 && (
            <p className="text-sm text-red-600">
              Outstanding: {formatCurrency(outstandingAmount, invoice.currency)}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-black100">
        <div className="flex items-center gap-2">
          <span className="text-xs text-black/70">Status:</span>
          <PaymentStatusBadge 
            status={isPaid ? PaymentStatus.COMPLETED : PaymentStatus.PENDING} 
          />
        </div>

        <div className="flex items-center gap-2">
          {invoice.pdf_url && (
            <button
              onClick={() => onView?.(invoice.id)}
              className="px-3 py-1.5 text-xs font-medium text-black border border-black200 rounded hover:bg-[#F2F2F2] transition-colors"
            >
              View PDF
            </button>
          )}
          {!isPaid && onPay && (
            <button
              onClick={() => onPay(invoice.id)}
              className="px-4 py-1.5 text-xs font-medium text-white bg-[#F5C542] rounded hover:bg-[#F5C542]/90 transition-colors"
            >
              Pay Now
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

