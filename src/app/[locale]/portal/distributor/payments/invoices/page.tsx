'use client'

/**
 * Distributor Portal - Invoices Page
 * View and manage invoices
 */

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import AuthGuard from '@/components/shared/AuthGuard'
import OSDomainPageWrapper from '@/components/os-domains/OSDomainPageWrapper'
import GlobalFilters from '@/components/shared/GlobalFilters'
import SectionCard from '@/components/shared/SectionCard'
import InvoiceCard from '@/components/finance/payments/InvoiceCard'
import { apiClient } from '@/lib/api'

interface PortalInvoice {
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

function mapInvoice(inv: any): PortalInvoice {
  const paid = inv.paidAmount ?? inv.paid_amount ?? 0
  const amount = Number(inv.amount) || 0
  const rawStatus = String(inv.status || 'Unpaid').toLowerCase()
  let status = 'pending'
  if (rawStatus === 'paid') status = 'paid'
  else if (paid > 0 && paid < amount) status = 'partial'

  return {
    id: inv.id,
    invoice_number: inv.invoiceNo || inv.invoice_number || inv.id,
    invoice_date: inv.invoiceDate || inv.invoice_date || inv.createdAt?.slice?.(0, 10) || '',
    due_date: inv.dueDate || inv.due_date,
    amount,
    paid_amount: paid,
    currency: inv.currency || 'USD',
    status,
    pdf_url: inv.pdfUrl || inv.pdf_url,
  }
}

export default function InvoicesPage() {
  const locale = useLocale()
  const router = useRouter()
  const [invoices, setInvoices] = useState<PortalInvoice[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('ALL')

  useEffect(() => {
    void loadInvoices()
  }, [])

  const loadInvoices = async () => {
    setLoading(true)
    try {
      const res = await apiClient.request('/finance/invoices?type=AR&limit=100')
      const payload = (res?.data as any)
      const rows: any[] = Array.isArray(payload) ? payload : (payload?.data ?? [])
      setInvoices(rows.map(mapInvoice))
    } catch (error) {
      console.error('Error loading invoices:', error)
      setInvoices([])
    } finally {
      setLoading(false)
    }
  }

  const filteredInvoices = statusFilter === 'ALL'
    ? invoices
    : invoices.filter((inv) => inv.status === statusFilter.toLowerCase())

  const handlePay = (invoiceId: string) => {
    router.push(`/${locale}/portal/distributor/payments/make-payment?invoiceId=${invoiceId}`)
  }

  const handleView = (invoiceId: string) => {
    const invoice = invoices.find((inv) => inv.id === invoiceId)
    if (invoice?.pdf_url) {
      window.open(invoice.pdf_url, '_blank')
    }
  }

  return (
    <AuthGuard allowedRoles={['distributor', 'sales_officer']}>
      <OSDomainPageWrapper
        title="Invoices"
        description="View and manage your invoices"
        domain="finance"
        portal="distributor"
      >
        <div className="space-y-6">
          <GlobalFilters />

          <SectionCard
            title="Invoices"
            subtitle="Your invoice history"
            headerActions={
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 text-sm border border-gray-200 bg-white text-black"
              >
                <option value="ALL">All Invoices</option>
                <option value="PENDING">Pending</option>
                <option value="PAID">Paid</option>
                <option value="PARTIAL">Partial</option>
              </select>
            }
          >
            {loading ? (
              <div className="text-center py-12 text-black/70">Loading invoices…</div>
            ) : filteredInvoices.length === 0 ? (
              <div className="text-center py-12 text-black/70">
                <p className="text-lg mb-2">No invoices found</p>
                <p className="text-sm">Your invoices will appear here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredInvoices.map((invoice) => (
                  <InvoiceCard
                    key={invoice.id}
                    invoice={invoice}
                    onPay={handlePay}
                    onView={handleView}
                  />
                ))}
              </div>
            )}
          </SectionCard>
        </div>
      </OSDomainPageWrapper>
    </AuthGuard>
  )
}
