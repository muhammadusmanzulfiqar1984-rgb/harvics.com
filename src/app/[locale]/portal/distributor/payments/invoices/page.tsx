'use client'

/**
 * Distributor Portal - Invoices Page
 * View and manage invoices
 */

'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import AuthGuard from '@/components/shared/AuthGuard'
import OSDomainPageWrapper from '@/components/os-domains/OSDomainPageWrapper'
import GlobalFilters from '@/components/shared/GlobalFilters'
import SectionCard from '@/components/shared/SectionCard'
import InvoiceCard from '@/components/finance/payments/InvoiceCard'

// Mock invoice data - Replace with API call
const mockInvoices = [
  {
    id: 'inv-1',
    invoice_number: 'INV-2024-001',
    invoice_date: '2024-01-15',
    due_date: '2024-02-15',
    amount: 50000,
    paid_amount: 0,
    currency: 'USD',
    status: 'pending',
    pdf_url: '/invoices/INV-2024-001.pdf'
  },
  {
    id: 'inv-2',
    invoice_number: 'INV-2024-002',
    invoice_date: '2024-01-20',
    due_date: '2024-02-20',
    amount: 75000,
    paid_amount: 75000,
    currency: 'USD',
    status: 'paid',
    pdf_url: '/invoices/INV-2024-002.pdf'
  }
]

export default function InvoicesPage() {
  const locale = useLocale()
  const router = useRouter()
  const [invoices, setInvoices] = useState(mockInvoices)
  const [statusFilter, setStatusFilter] = useState<string>('ALL')

  const filteredInvoices = statusFilter === 'ALL' 
    ? invoices 
    : invoices.filter(inv => inv.status === statusFilter.toLowerCase())

  const handlePay = (invoiceId: string) => {
    router.push(`/${locale}/portal/distributor/payments/make-payment?invoiceId=${invoiceId}`)
  }

  const handleView = (invoiceId: string) => {
    const invoice = invoices.find(inv => inv.id === invoiceId)
    if (invoice?.pdf_url) {
      window.open(invoice.pdf_url, '_blank')
    }
  }

  return (
    <AuthGuard allowedRoles={['distributor']}>
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
                className="px-3 py-1.5 text-sm border border-black200 bg-white text-black"
              >
                <option value="ALL">All Invoices</option>
                <option value="PENDING">Pending</option>
                <option value="PAID">Paid</option>
                <option value="PARTIAL">Partial</option>
              </select>
            }
          >
            {filteredInvoices.length === 0 ? (
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
