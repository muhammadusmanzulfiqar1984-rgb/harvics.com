/**
 * Finance OS - Payment Reconciliation Dashboard
 * Advanced reconciliation and matching system
 */

'use client'

import React, { useState, useEffect } from 'react'
import { useLocale } from 'next-intl'
import AuthGuard from '@/components/shared/AuthGuard'
import OSDomainPageWrapper from '@/components/os-domains/OSDomainPageWrapper'
import GlobalFilters from '@/components/shared/GlobalFilters'
import SectionCard from '@/components/shared/SectionCard'
import KPICard from '@/components/shared/KPICard'
import paymentApi from '@/lib/api-payments'

export default function ReconciliationDashboardPage() {
  const locale = useLocale()
  const [stats, setStats] = useState({
    totalPayments: 0,
    matched: 0,
    unmatched: 0,
    pendingReconciliation: 0,
    bankDeposits: 0,
    cryptoPayments: 0
  })
  const [loading, setLoading] = useState(true)
  const [reconciliationData, setReconciliationData] = useState<any[]>([])

  useEffect(() => {
    loadReconciliationData()
  }, [])

  const loadReconciliationData = async () => {
    setLoading(true)
    try {
      // Fetch payment data for reconciliation
      const paymentsResult = await paymentApi.getMyPayments({ limit: 1000 })
      
      if (paymentsResult.success && paymentsResult.payments) {
        const payments = paymentsResult.payments
        
        // Calculate statistics
        const completed = payments.filter(p => p.status === 'COMPLETED')
        const bankTransfers = payments.filter(p => p.payment_method === 'BANK_TRANSFER')
        const crypto = payments.filter(p => p.payment_method === 'USDT' || p.payment_method === 'USDC')
        
        setStats({
          totalPayments: payments.length,
          matched: completed.length,
          unmatched: payments.filter(p => p.status === 'PENDING' || p.status === 'REQUIRES_MANUAL_VERIFICATION').length,
          pendingReconciliation: payments.filter(p => p.status === 'REQUIRES_MANUAL_VERIFICATION').length,
          bankDeposits: bankTransfers.length,
          cryptoPayments: crypto.length
        })

        // Prepare reconciliation data
        setReconciliationData(payments.slice(0, 50))
      }
    } catch (err) {
      console.error('Failed to load reconciliation data:', err)
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

  const getMatchStatus = (payment: any) => {
    if (payment.status === 'COMPLETED') return { label: 'Matched', color: 'text-green-600' }
    if (payment.status === 'REQUIRES_MANUAL_VERIFICATION') return { label: 'Pending Match', color: 'text-yellow-600' }
    return { label: 'Unmatched', color: 'text-red-600' }
  }

  return (
    <AuthGuard allowedRoles={['hq', 'company_admin', 'admin']}>
      <OSDomainPageWrapper
        title="Payment Reconciliation Dashboard"
        description="Advanced payment reconciliation and bank deposit matching"
        domain="finance"
        portal="company"
      >
        <div className="space-y-6">
          <GlobalFilters />

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <KPICard
              label="Total Payments"
              value={stats.totalPayments}
            />
            <KPICard
              label="Matched"
              value={stats.matched}
              change={stats.totalPayments > 0 ? {
                value: (stats.matched / stats.totalPayments) * 100,
                label: '%',
                trend: 'up'
              } : undefined}
            />
            <KPICard
              label="Unmatched"
              value={stats.unmatched}
              change={stats.totalPayments > 0 ? {
                value: (stats.unmatched / stats.totalPayments) * 100,
                label: '%',
                trend: 'down'
              } : undefined}
            />
            <KPICard
              label="Pending Review"
              value={stats.pendingReconciliation}
            />
            <KPICard
              label="Bank Deposits"
              value={stats.bankDeposits}
            />
            <KPICard
              label="Crypto Payments"
              value={stats.cryptoPayments}
            />
          </div>

          {/* Reconciliation Summary */}
          <SectionCard
            title="Reconciliation Summary"
            subtitle="Payment matching and reconciliation overview"
          >
            {loading && (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#F5C542]"></div>
                <p className="mt-2 text-black/70">Loading reconciliation data...</p>
              </div>
            )}

            {!loading && (
              <div className="space-y-4">
                {/* Reconciliation Progress */}
                <div className="bg-[#F2F2F2] p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-black/70">Reconciliation Rate</span>
                    <span className="text-sm font-bold text-black">
                      {stats.totalPayments > 0 
                        ? ((stats.matched / stats.totalPayments) * 100).toFixed(1)
                        : 0}%
                    </span>
                  </div>
                  <div className="w-full bg-white rounded-full h-3">
                    <div
                      className="bg-[#F5C542] h-3 rounded-full transition-all duration-500"
                      style={{
                        width: `${stats.totalPayments > 0 ? (stats.matched / stats.totalPayments) * 100 : 0}%`
                      }}
                    />
                  </div>
                </div>

                {/* Reconciliation Table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-black200">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-black">Payment ID</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-black">Amount</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-black">Method</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-black">Date</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-black">Status</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-black">Match</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reconciliationData.slice(0, 10).map((payment: any) => {
                        const matchStatus = getMatchStatus(payment)
                        return (
                          <tr key={payment.id} className="border-b border-black100 hover:bg-[#F2F2F2]">
                            <td className="py-3 px-4 text-sm text-black/70 font-mono">
                              {payment.id.substring(0, 12)}...
                            </td>
                            <td className="py-3 px-4 text-sm font-medium text-black">
                              {formatCurrency(payment.amount, payment.currency)}
                            </td>
                            <td className="py-3 px-4 text-sm text-black/70 capitalize">
                              {payment.payment_method?.replace('_', ' ')}
                            </td>
                            <td className="py-3 px-4 text-sm text-black/70">
                              {formatDate(payment.created_at)}
                            </td>
                            <td className="py-3 px-4 text-sm">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${matchStatus.color} bg-opacity-10`}>
                                {payment.status}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-sm">
                              <span className={matchStatus.color}>
                                {matchStatus.label}
                              </span>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </SectionCard>

          {/* Bank Deposit Matching */}
          <SectionCard
            title="Bank Deposit Matching"
            subtitle="Match bank transfers with deposit records"
          >
            <div className="text-center py-8 text-black/70">
              <p>Bank deposit matching feature coming soon</p>
              <p className="text-sm mt-2">This will automatically match bank transfers with bank statement deposits</p>
            </div>
          </SectionCard>

          {/* Crypto Payment Monitor */}
          <SectionCard
            title="Crypto Payment Monitor"
            subtitle="Track USDT/USDC transactions"
          >
            <div className="text-center py-8 text-black/70">
              <p>Crypto payment monitoring feature coming soon</p>
              <p className="text-sm mt-2">Real-time tracking of blockchain transactions and confirmations</p>
            </div>
          </SectionCard>
        </div>
      </OSDomainPageWrapper>
    </AuthGuard>
  )
}
