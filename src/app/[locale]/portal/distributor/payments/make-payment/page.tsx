/**
 * Distributor Portal - Make Payment Page
 * Payment form for creating new payments
 */

'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import AuthGuard from '@/components/shared/AuthGuard'
import OSDomainPageWrapper from '@/components/os-domains/OSDomainPageWrapper'
import GlobalFilters from '@/components/shared/GlobalFilters'
import SectionCard from '@/components/shared/SectionCard'
import PaymentMethodCard from '@/components/finance/payments/PaymentMethodCard'
import { getAvailablePaymentMethods, PAYMENT_METHODS } from '@/components/finance/payments/PaymentMethodConfig'
import { PaymentMethod, PaymentFlowType } from '@/types/payments'
import paymentApi from '@/lib/api-payments'

export default function MakePaymentPage() {
  const locale = useLocale()
  const router = useRouter()
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null)
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const availableMethods = getAvailablePaymentMethods('distributor')

  const handleMethodSelect = (method: PaymentMethod) => {
    setSelectedMethod(method)
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedMethod || !amount) {
      setError('Please select a payment method and enter amount')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const result = await paymentApi.createPayment({
        amount: parseFloat(amount),
        currency: 'USD',
        method: selectedMethod,
        flowType: PaymentFlowType.PAY_OUTSTANDING_BALANCE
      })

      if (result.success && result.payment) {
        // Redirect to payment processing or details page
        router.push(`/${locale}/portal/distributor/payments/history/${result.payment.id}`)
      } else {
        setError(result.error || 'Failed to create payment')
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthGuard allowedRoles={['distributor']}>
      <OSDomainPageWrapper
        title="Make a Payment"
        description="Create a new payment using your preferred payment method"
        domain="finance"
        portal="distributor"
      >
        <div className="space-y-6">
          <GlobalFilters />

          <form onSubmit={handleSubmit}>
            <SectionCard
              title="Select Payment Method"
              subtitle="Choose how you would like to pay"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {availableMethods.map((methodInfo) => (
                  <PaymentMethodCard
                    key={methodInfo.method}
                    method={methodInfo.method}
                    label={methodInfo.label}
                    icon={methodInfo.icon}
                    description={methodInfo.description}
                    isSelected={selectedMethod === methodInfo.method}
                    onClick={() => handleMethodSelect(methodInfo.method)}
                  />
                ))}
              </div>

              {selectedMethod && (
                <div className="mt-6 p-4 bg-[#F2F2F2] rounded-lg border border-black200">
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-black mb-2">
                      Amount
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full px-3 py-2 border border-black200 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-[#F5C542]"
                      required
                    />
                  </div>

                  {error && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded text-red-800 text-sm">
                      {error}
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <button
                      type="submit"
                      disabled={loading || !amount}
                      className="px-6 py-2 bg-[#F5C542] text-white font-medium rounded hover:bg-[#F5C542]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {loading ? 'Processing...' : 'Continue to Payment'}
                    </button>
                    <button
                      type="button"
                      onClick={() => router.back()}
                      className="px-6 py-2 border border-black200 text-black font-medium rounded hover:bg-[#F2F2F2] transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </SectionCard>
          </form>
        </div>
      </OSDomainPageWrapper>
    </AuthGuard>
  )
}
