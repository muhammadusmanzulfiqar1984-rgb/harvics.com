'use client'

import React from 'react'
import { useLocale } from 'next-intl'
import AuthGuard from '@/components/shared/AuthGuard'
import PortalSwitcher from '@/components/shared/PortalSwitcher'
import GeoSelector from '@/components/shared/GeoSelector'
import GlobalFilters from '@/components/shared/GlobalFilters'
import SectionCard from '@/components/shared/SectionCard'
import KPICard from '@/components/shared/KPICard'

export default function DistributorPaymentsPage() {
  const locale = useLocale()

  return (
    <AuthGuard allowedRoles={['distributor']}>
      <div className="min-h-screen bg-[#F2F2F2]">
        <header className="bg-white border-b border-black300 sticky top-0 z-50">
          <div className="max-w-[1920px] mx-auto px-6">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-4">
                <div className="text-2xl font-bold text-black">H</div>
                <div>
                  <h1 className="text-lg font-bold text-black leading-tight">Harvics OS — Distributor Portal</h1>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <GeoSelector />
                <PortalSwitcher currentPortal="distributor" />
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-[1920px] mx-auto px-6 py-6">
          <nav className="mb-6 text-sm">
            <ol className="flex items-center gap-2 text-black">
              <li><a href={`/${locale}/portal/distributor`} className="hover:underline">Dashboard</a></li>
              <li>/</li>
              <li className="font-semibold">Payments</li>
            </ol>
          </nav>

          <div className="mb-6">
            <h1 className="text-3xl font-bold text-black mb-2">Payments & Statements</h1>
            <p className="text-black">Tier 2: Payments Module - Payment tracking, invoices, statements, and payment history</p>
          </div>

          <div className="mb-6">
            <GlobalFilters />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <KPICard label="Outstanding Amount" value="$125K" icon="💵" />
            <KPICard label="Paid This Month" value="$85K" icon="✅" />
            <KPICard label="Pending Invoices" value="12" icon="📄" />
            <KPICard label="Payment Score" value="95%" icon="📊" />
          </div>

          <SectionCard title="Payment Management" subtitle="Manage your payments, invoices, and receipts">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <a
                href={`/${locale}/portal/distributor/payments/make-payment`}
                className="p-6 border border-black200 bg-white hover:border-[#F5C542] hover:shadow-md transition-all cursor-pointer"
              >
                <div className="text-3xl mb-3">💳</div>
                <h4 className="font-semibold text-black mb-2">Make Payment</h4>
                <p className="text-sm text-black/70 mb-4">Pay invoices, advance, or top-up wallet</p>
                <span className="text-sm text-[#F5C542] font-medium">Go to Payment →</span>
              </a>
              
              <a
                href={`/${locale}/portal/distributor/payments/invoices`}
                className="p-6 border border-black200 bg-white hover:border-[#F5C542] hover:shadow-md transition-all cursor-pointer"
              >
                <div className="text-3xl mb-3">📄</div>
                <h4 className="font-semibold text-black mb-2">Invoices</h4>
                <p className="text-sm text-black/70 mb-4">View and manage your invoices</p>
                <span className="text-sm text-[#F5C542] font-medium">View Invoices →</span>
              </a>
              
              <a
                href={`/${locale}/portal/distributor/payments/history`}
                className="p-6 border border-black200 bg-white hover:border-[#F5C542] hover:shadow-md transition-all cursor-pointer"
              >
                <div className="text-3xl mb-3">📊</div>
                <h4 className="font-semibold text-black mb-2">Payment History</h4>
                <p className="text-sm text-black/70 mb-4">View all payment transactions</p>
                <span className="text-sm text-[#F5C542] font-medium">View History →</span>
              </a>
              
              <a
                href={`/${locale}/portal/distributor/payments/receipts`}
                className="p-6 border border-black200 bg-white hover:border-[#F5C542] hover:shadow-md transition-all cursor-pointer"
              >
                <div className="text-3xl mb-3">🧾</div>
                <h4 className="font-semibold text-black mb-2">Receipts</h4>
                <p className="text-sm text-black/70 mb-4">Download payment receipts</p>
                <span className="text-sm text-[#F5C542] font-medium">View Receipts →</span>
              </a>
            </div>
          </SectionCard>
        </main>
      </div>
    </AuthGuard>
  )
}

