/**
 * Supplier Portal - Payment Status Page
 * Track invoice payment status
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
import { SupplierInvoice } from '@/types/payments'

export default function PaymentStatusPage() {
  const locale = useLocale()
  const [invoices, setInvoices] = useState<SupplierInvoice[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('ALL')

  useEffect(() => {
    loadInvoices()
  }, [statusFilter])

  const loadInvoices = async () => {
    setLoading(true)
    try {
      const result = await paymentApi.getSupplierInvoices(statusFilter !== 'ALL' ? statusFilter : undefined)
      if (result.success && result.invoices) {
        setInvoices(result.invoices)
      }
    } catch (err) {
      console.error('Failed to load invoices:', err)
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

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, any> = {
      pending: { status: 'PENDING', color: 'text-yellow-800', bg: 'bg-yellow-100' },
      approved: { status: 'PROCESSING', color: 'text-blue-800', bg: 'bg-blue-100' },
      paid: { status: 'COMPLETED', color: 'text-green-800', bg: 'bg-green-100' },
      rejected: { status: 'FAILED', color: 'text-red-800', bg: 'bg-red-100' }
    }
    const config = statusMap[status] || statusMap.pending
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color} ${config.bg}`}>
        {status.toUpperCase()}
      </span>
    )
  }

  return (
    <AuthGuard allowedRoles={['supplier']}>
      <OSDomainPageWrapper
        title="Payment Status"
        description="Track the status of your submitted invoices"
        domain="finance"
        portal="supplier"
      >
        <div className="space-y-6">
          <GlobalFilters />

          <SectionCard
            title="Invoice Payment Status"
            subtitle="Track your invoice payments"
            headerActions={
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 text-sm border border-black200 bg-white text-black"
              >
                <option value="ALL">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="paid">Paid</option>
                <option value="rejected">Rejected</option>
              </select>
            }
          >
            {loading && (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#F5C542]"></div>
                <p className="mt-2 text-black/70">Loading invoices...</p>
              </div>
            )}

            {!loading && invoices.length === 0 && (
              <div className="text-center py-12 text-black/70">
                <p className="text-lg mb-2">No invoices found</p>
                <p className="text-sm">Your submitted invoices will appear here</p>
              </div>
            )}

            {!loading && invoices.length > 0 && (
              <div className="space-y-4">
                {invoices.map((invoice) => (
                  <div
                    key={invoice.id}
                    className="p-6 border border-black200 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-black text-lg">
                            Invoice #{invoice.invoice_number}
                          </h3>
                          {getStatusBadge(invoice.status)}
                        </div>
                        <div className="space-y-1 text-sm text-black/70">
                          <p>
                            <span className="font-medium">Amount:</span>{' '}
                            {formatCurrency(invoice.amount, invoice.currency)}
                          </p>
                          <p>
                            <span className="font-medium">Submitted:</span>{' '}
                            {formatDate(invoice.created_at)}
                          </p>
                          {invoice.due_date && (
                            <p>
                              <span className="font-medium">Due Date:</span>{' '}
                              {formatDate(invoice.due_date)}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        {invoice.payment_date && (
                          <div className="mb-2">
                            <p className="text-xs text-black/70">Payment Date</p>
                            <p className="text-sm font-medium text-black">
                              {formatDate(invoice.payment_date)}
                            </p>
                          </div>
                        )}
                        {invoice.payment_reference && (
                          <div className="mb-2">
                            <p className="text-xs text-black/70">Reference</p>
                            <p className="text-sm font-medium text-black">
                              {invoice.payment_reference}
                            </p>
                          </div>
                        )}
                        {invoice.bank_used && (
                          <div>
                            <p className="text-xs text-black/70">Bank</p>
                            <p className="text-sm font-medium text-black">
                              {invoice.bank_used}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {invoice.pdf_url && (
                      <div className="pt-4 border-t border-black100">
                        <a
                          href={invoice.pdf_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-[#F5C542] hover:underline"
                        >
                          View Invoice PDF →
                        </a>
                      </div>
                    )}
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

