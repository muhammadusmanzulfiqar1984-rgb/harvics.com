'use client'

/**
 * Finance OS - Payment Verification Queue
 * Manual verification of payments requiring verification
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

export default function VerificationQueuePage() {
  const locale = useLocale()
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [verifying, setVerifying] = useState<string | null>(null)
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)

  useEffect(() => {
    loadVerificationQueue()
  }, [])

  const loadVerificationQueue = async () => {
    setLoading(true)
    try {
      const result = await paymentApi.getVerificationQueue(100)
      if (result.success && result.payments) {
        setPayments(result.payments)
      }
    } catch (err) {
      console.error('Failed to load verification queue:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async (paymentId: string, approved: boolean) => {
    setVerifying(paymentId)
    try {
      const status = approved ? PaymentStatus.COMPLETED : PaymentStatus.FAILED
      const result = await paymentApi.verifyPayment(paymentId, status)
      
      if (result.success) {
        // Reload queue
        await loadVerificationQueue()
        setSelectedPayment(null)
      } else {
        alert(result.error || 'Failed to verify payment')
      }
    } catch (err: any) {
      alert(err.message || 'An error occurred')
    } finally {
      setVerifying(null)
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
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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
    <AuthGuard allowedRoles={['hq', 'company_admin', 'admin']}>
      <OSDomainPageWrapper
        title="Payment Verification Queue"
        description="Review and verify payments requiring manual verification"
        domain="finance"
        portal="company"
      >
        <div className="space-y-6">
          <GlobalFilters />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white border border-black200 p-4">
              <div className="text-sm text-black/70 mb-1">Pending Verification</div>
              <div className="text-2xl font-bold text-black">{payments.length}</div>
            </div>
            <div className="bg-white border border-black200 p-4">
              <div className="text-sm text-black/70 mb-1">Bank Transfers</div>
              <div className="text-2xl font-bold text-black">
                {payments.filter(p => p.payment_method === 'BANK_TRANSFER').length}
              </div>
            </div>
            <div className="bg-white border border-black200 p-4">
              <div className="text-sm text-black/70 mb-1">Crypto Payments</div>
              <div className="text-2xl font-bold text-black">
                {payments.filter(p => p.payment_method === 'USDT' || p.payment_method === 'USDC').length}
              </div>
            </div>
          </div>

          <SectionCard
            title="Payments Requiring Verification"
            subtitle="Review and approve payments with proof documents"
          >
            {loading && (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#F5C542]"></div>
                <p className="mt-2 text-black/70">Loading verification queue...</p>
              </div>
            )}

            {!loading && payments.length === 0 && (
              <div className="text-center py-12 text-black/70">
                <p className="text-lg mb-2">No payments requiring verification</p>
                <p className="text-sm">All payments are verified</p>
              </div>
            )}

            {!loading && payments.length > 0 && (
              <div className="space-y-4">
                {payments.map((payment) => (
                  <div
                    key={payment.id}
                    className="p-6 border border-black200 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold text-black text-lg">
                            {formatCurrency(payment.amount, payment.currency)}
                          </h4>
                          <PaymentStatusBadge status={payment.status} />
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-black/70">
                          <div>
                            <span className="font-medium">Method:</span>
                            <p>{getPaymentMethodLabel(payment.payment_method)}</p>
                          </div>
                          <div>
                            <span className="font-medium">Date:</span>
                            <p>{formatDate(payment.created_at)}</p>
                          </div>
                          <div>
                            <span className="font-medium">Portal:</span>
                            <p className="capitalize">{payment.portal_type}</p>
                          </div>
                          {payment.reference_number && (
                            <div>
                              <span className="font-medium">Reference:</span>
                              <p>{payment.reference_number}</p>
                            </div>
                          )}
                        </div>
                        
                        {payment.tx_hash && (
                          <div className="mt-2 text-sm">
                            <span className="font-medium text-black">Transaction Hash:</span>
                            <p className="text-black/70 font-mono">{payment.tx_hash}</p>
                          </div>
                        )}

                        {payment.bank_name && (
                          <div className="mt-2 text-sm">
                            <span className="font-medium text-black">Bank:</span>
                            <p className="text-black/70">{payment.bank_name}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {payment.proof_url && (
                      <div className="mb-4 p-3 bg-[#F2F2F2] rounded border border-black200">
                        <a
                          href={payment.proof_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-[#F5C542] hover:underline flex items-center gap-2"
                        >
                          <span>📎</span>
                          View Proof Document →
                        </a>
                      </div>
                    )}

                    <div className="flex items-center gap-3 pt-4 border-t border-black100">
                      <button
                        onClick={() => handleVerify(payment.id, true)}
                        disabled={verifying === payment.id}
                        className="px-4 py-2 bg-green-600 text-white font-medium rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {verifying === payment.id ? 'Verifying...' : '✓ Approve'}
                      </button>
                      <button
                        onClick={() => handleVerify(payment.id, false)}
                        disabled={verifying === payment.id}
                        className="px-4 py-2 bg-red-600 text-white font-medium rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {verifying === payment.id ? 'Verifying...' : '✗ Reject'}
                      </button>
                      <button
                        onClick={() => setSelectedPayment(payment)}
                        className="px-4 py-2 border border-black200 text-black font-medium rounded hover:bg-[#F2F2F2] transition-colors"
                      >
                        View Details
                      </button>
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

