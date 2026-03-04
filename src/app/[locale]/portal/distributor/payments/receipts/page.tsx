/**
 * Distributor Portal - Receipts Page
 * View and download payment receipts
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

export default function ReceiptsPage() {
  const locale = useLocale()
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCompletedPayments()
  }, [])

  const loadCompletedPayments = async () => {
    setLoading(true)
    try {
      const result = await paymentApi.getMyPayments({ 
        status: PaymentStatus.COMPLETED,
        limit: 100 
      })
      if (result.success && result.payments) {
        setPayments(result.payments)
      }
    } catch (err) {
      console.error('Failed to load receipts:', err)
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
      month: 'long',
      day: 'numeric'
    })
  }

  const handleDownloadReceipt = async (paymentId: string) => {
    try {
      // First, generate receipt if it doesn't exist
      const generateResult = await paymentApi.generateReceipt(paymentId)
      
      if (generateResult.success) {
        // Download the receipt PDF
        const receiptUrl = `/api/payments/receipt/${paymentId}`
        window.open(receiptUrl, '_blank')
      } else {
        alert('Failed to generate receipt. Please try again.')
      }
    } catch (err: any) {
      alert(err.message || 'Failed to download receipt')
    }
  }

  return (
    <AuthGuard allowedRoles={['distributor']}>
      <OSDomainPageWrapper
        title="Payment Receipts"
        description="Download receipts for your completed payments"
        domain="finance"
        portal="distributor"
      >
        <div className="space-y-6">
          <GlobalFilters />

          <SectionCard
            title="Payment Receipts"
            subtitle="Receipts for completed payments"
          >
            {loading && (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#F5C542]"></div>
                <p className="mt-2 text-black/70">Loading receipts...</p>
              </div>
            )}

            {!loading && payments.length === 0 && (
              <div className="text-center py-12 text-black/70">
                <p className="text-lg mb-2">No receipts available</p>
                <p className="text-sm">Receipts for completed payments will appear here</p>
              </div>
            )}

            {!loading && payments.length > 0 && (
              <div className="space-y-3">
                {payments.map((payment) => (
                  <div
                    key={payment.id}
                    className="p-4 border border-black200 hover:shadow-md transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold text-black text-lg">
                            Payment Receipt
                          </h4>
                          <PaymentStatusBadge status={payment.status} />
                        </div>
                        <div className="space-y-1 text-sm text-black/70">
                          <p>
                            <span className="font-medium">Amount:</span>{' '}
                            {formatCurrency(payment.amount, payment.currency)}
                          </p>
                          <p>
                            <span className="font-medium">Date:</span>{' '}
                            {formatDate(payment.payment_date || payment.created_at)}
                          </p>
                          {payment.reference_number && (
                            <p>
                              <span className="font-medium">Reference:</span>{' '}
                              {payment.reference_number}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDownloadReceipt(payment.id)}
                          className="px-4 py-2 bg-[#F5C542] text-white font-medium rounded hover:bg-[#F5C542]/90 transition-colors"
                        >
                          Download PDF
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
