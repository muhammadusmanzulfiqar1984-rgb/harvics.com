/**
 * Distributor Portal - Payment History Page
 * View all payment transactions
 */

'use client'

import React, { useState, useEffect } from 'react'
import { useLocale } from 'next-intl'
import AuthGuard from '@/components/shared/AuthGuard'
import OSDomainPageWrapper from '@/components/os-domains/OSDomainPageWrapper'
import GlobalFilters from '@/components/shared/GlobalFilters'
import SectionCard from '@/components/shared/SectionCard'
import PaymentStatusBadge from '@/components/finance/payments/PaymentStatusBadge'
import paymentApi from '@/lib/api-payments'
import { Payment, PaymentStatus } from '@/types/payments'

export default function PaymentHistoryPage() {
  const locale = useLocale()
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | 'ALL'>('ALL')

  useEffect(() => {
    loadPayments()
  }, [statusFilter])

  const loadPayments = async () => {
    setLoading(true)
    setError(null)
    try {
      const filters: any = { limit: 100 }
      if (statusFilter !== 'ALL') {
        filters.status = statusFilter
      }
      const result = await paymentApi.getMyPayments(filters)
      if (result.success && result.payments) {
        setPayments(result.payments)
      } else {
        setError(result.error || 'Failed to load payments')
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency || 'USD'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getPaymentMethodLabel = (method: string) => {
    const methodNames: Record<string, string> = {
      BANK_TRANSFER: 'Bank Transfer',
      CREDIT_CARD: 'Credit Card',
      DEBIT_CARD: 'Debit Card',
      PAYPAL: 'PayPal',
      WISE: 'Wise',
      APPLE_PAY: 'Apple Pay',
      USDT: 'USDT',
      USDC: 'USDC',
      CHEQUE: 'Cheque',
      PAY_ORDER: 'Pay Order',
      DEMAND_DRAFT: 'Demand Draft'
    }
    return methodNames[method] || method
  }

  return (
    <AuthGuard allowedRoles={['distributor']}>
      <OSDomainPageWrapper
        title="Payment History"
        description="View all your payment transactions and their status"
        domain="finance"
        portal="distributor"
      >
        <div className="space-y-6">
          <GlobalFilters />

          <SectionCard
            title="Payment History"
            subtitle="All your payment transactions"
            headerActions={
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as PaymentStatus | 'ALL')}
                className="px-3 py-1.5 text-sm border border-black200 rounded-md bg-white text-black"
              >
                <option value="ALL">All Status</option>
                <option value={PaymentStatus.PENDING}>Pending</option>
                <option value={PaymentStatus.PROCESSING}>Processing</option>
                <option value={PaymentStatus.COMPLETED}>Completed</option>
                <option value={PaymentStatus.FAILED}>Failed</option>
                <option value={PaymentStatus.REQUIRES_MANUAL_VERIFICATION}>Needs Verification</option>
              </select>
            }
          >
            {loading && (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#F5C542]"></div>
                <p className="mt-2 text-black/70">Loading payments...</p>
              </div>
            )}

            {error && (
              <div className="p-4 bg-red-100 border border-red-300 rounded text-red-800 mb-4">
                {error}
              </div>
            )}

            {!loading && !error && payments.length === 0 && (
              <div className="text-center py-12 text-black/70">
                <p className="text-lg mb-2">No payments found</p>
                <p className="text-sm">Your payment history will appear here</p>
              </div>
            )}

            {!loading && !error && payments.length > 0 && (
              <div className="space-y-3">
                {payments.map((payment) => (
                  <div
                    key={payment.id}
                    className="p-4 border border-black200 rounded-lg hover:shadow-md transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold text-black">
                            {formatCurrency(payment.amount, payment.currency)}
                          </h4>
                          <PaymentStatusBadge status={payment.status} />
                        </div>
                        <div className="flex items-center gap-4 text-sm text-black/70">
                          <span>{getPaymentMethodLabel(payment.payment_method)}</span>
                          <span>•</span>
                          <span>{formatDate(payment.created_at)}</span>
                          {payment.reference_number && (
                            <>
                              <span>•</span>
                              <span>Ref: {payment.reference_number}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {payment.proof_url && (
                          <a
                            href={payment.proof_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 text-xs font-medium text-black border border-black200 rounded hover:bg-[#F2F2F2] transition-colors"
                          >
                            View Proof
                          </a>
                        )}
                        <button
                          onClick={() => window.location.href = `/${locale}/portal/distributor/payments/history/${payment.id}`}
                          className="px-3 py-1.5 text-xs font-medium text-black border border-black200 rounded hover:bg-[#F2F2F2] transition-colors"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </div>
      </OSDomainPageWrapper>
    </AuthGuard>
  )
}
