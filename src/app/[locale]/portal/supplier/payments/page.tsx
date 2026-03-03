'use client'

import React from 'react'
import { useLocale } from 'next-intl'
import AuthGuard from '@/components/shared/AuthGuard'
import PortalSwitcher from '@/components/shared/PortalSwitcher'
import GeoSelector from '@/components/shared/GeoSelector'
import GlobalFilters from '@/components/shared/GlobalFilters'
import SectionCard from '@/components/shared/SectionCard'
import KPICard from '@/components/shared/KPICard'

export default function SupplierPaymentsPage() {
  const locale = useLocale()

  return (
    <AuthGuard allowedRoles={['supplier']}>
      <div className="min-h-screen bg-[#F2F2F2]">
        <header className="bg-white border-b border-black300 sticky top-0 z-50">
          <div className="max-w-[1920px] mx-auto px-6">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-4">
                <div className="text-2xl font-bold text-black">H</div>
                <div>
                  <h1 className="text-lg font-bold text-black leading-tight">Harvics OS — Supplier Portal</h1>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <GeoSelector />
                <PortalSwitcher currentPortal="supplier" />
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-[1920px] mx-auto px-6 py-6">
          <nav className="mb-6 text-sm">
            <ol className="flex items-center gap-2 text-black">
              <li><a href={`/${locale}/portal/supplier`} className="hover:underline">Dashboard</a></li>
              <li>/</li>
              <li className="font-semibold">Payments</li>
            </ol>
          </nav>

          <div className="mb-6">
            <h1 className="text-3xl font-bold text-black mb-2">Payments & Invoicing</h1>
            <p className="text-black">Tier 2: Payments Module - Payment tracking, invoices, and payment history</p>
          </div>

          <div className="mb-6">
            <GlobalFilters />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <KPICard label="Outstanding" value="$85K" icon="💵" />
            <KPICard label="Received This Month" value="$125K" icon="✅" />
            <KPICard label="Pending Invoices" value="8" icon="📄" />
            <KPICard label="Payment Score" value="98%" icon="📊" />
          </div>

          <SectionCard title="Tier 2: Main Modules" subtitle="Payment management capabilities">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border border-black200 rounded-lg">
                <h4 className="font-semibold text-black mb-2">💳 Payment Tracking</h4>
                <p className="text-sm text-black mb-2">Track received payments and outstanding amounts</p>
              </div>
              <div className="p-4 border border-black200 rounded-lg">
                <h4 className="font-semibold text-black mb-2">📄 Invoice Management</h4>
                <p className="text-sm text-black mb-2">Create and manage supplier invoices</p>
              </div>
              <div className="p-4 border border-black200 rounded-lg">
                <h4 className="font-semibold text-black mb-2">📊 Payment Analytics</h4>
                <p className="text-sm text-black mb-2">Payment trends and performance metrics</p>
              </div>
            </div>
          </SectionCard>
        </main>
      </div>
    </AuthGuard>
  )
}

