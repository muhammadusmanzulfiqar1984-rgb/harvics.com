'use client'

import React from 'react'
import { useLocale } from 'next-intl'
import AuthGuard from '@/components/shared/AuthGuard'
import PortalSwitcher from '@/components/shared/PortalSwitcher'
import GeoSelector from '@/components/shared/GeoSelector'
import GlobalFilters from '@/components/shared/GlobalFilters'
import SectionCard from '@/components/shared/SectionCard'
import KPICard from '@/components/shared/KPICard'

export default function DistributorOrdersPage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = useLocale()

  return (
    <AuthGuard allowedRoles={['distributor']}>
      <div className="min-h-screen bg-[#F2F2F2]">
        {/* Header */}
        <header className="bg-white border-b border-black300 sticky top-0 z-50">
          <div className="max-w-[1920px] mx-auto px-6">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-4">
                <div className="text-2xl font-bold text-black">H</div>
                <div>
                  <h1 className="text-lg font-bold text-black leading-tight">
                    Harvics OS — Distributor Portal
                  </h1>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <GeoSelector />
                <PortalSwitcher currentPortal="distributor" />
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-[1920px] mx-auto px-6 py-6">
          {/* Breadcrumbs */}
          <nav className="mb-6 text-sm">
            <ol className="flex items-center gap-2 text-black">
              <li>
                <a href={`/${locale}/portal/distributor`} className="hover:underline">
                  Dashboard
                </a>
              </li>
              <li>/</li>
              <li className="font-semibold">Orders</li>
            </ol>
          </nav>

          {/* Page Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-black mb-2">Orders Management</h1>
            <p className="text-black">Tier 2: Order Management Module - Track, manage, and fulfill distributor orders</p>
          </div>

          {/* Global Filters */}
          <div className="mb-6">
            <GlobalFilters />
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <KPICard label="Total Orders" value="1,245" icon="📦" />
            <KPICard label="Pending Orders" value="23" icon="⏳" />
            <KPICard label="Delivered" value="1,189" icon="✅" />
            <KPICard label="Fill Rate" value="96.5%" icon="📊" />
          </div>

          {/* Tier 2: Modules */}
          <SectionCard
            title="Tier 2: Main Modules"
            subtitle="Order management capabilities organized by workflow stage"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border border-black200 rounded-lg">
                <h4 className="font-semibold text-black mb-2">📋 Order Processing</h4>
                <p className="text-sm text-black mb-2">Create, track, and manage orders throughout lifecycle</p>
                <ul className="text-xs text-black space-y-1 list-disc list-inside">
                  <li>Order creation and approval</li>
                  <li>Status tracking</li>
                  <li>Order modifications</li>
                </ul>
              </div>
              <div className="p-4 border border-black200 rounded-lg">
                <h4 className="font-semibold text-black mb-2">📊 Order Analytics</h4>
                <p className="text-sm text-black mb-2">Performance metrics and insights</p>
                <ul className="text-xs text-black space-y-1 list-disc list-inside">
                  <li>Order trends</li>
                  <li>Product performance</li>
                  <li>Fulfillment metrics</li>
                </ul>
              </div>
              <div className="p-4 border border-black200 rounded-lg">
                <h4 className="font-semibold text-black mb-2">🔄 Order Fulfillment</h4>
                <p className="text-sm text-black mb-2">Inventory allocation and delivery coordination</p>
                <ul className="text-xs text-black space-y-1 list-disc list-inside">
                  <li>Stock allocation</li>
                  <li>Shipping coordination</li>
                  <li>Delivery tracking</li>
                </ul>
              </div>
            </div>
          </SectionCard>

          {/* Tier 3: Operational Screens */}
          <SectionCard
            title="Tier 3: Operational Screens"
            subtitle="Key screens for order management operations"
          >
            <div className="space-y-3">
              <div className="p-3 border border-black100 rounded-md bg-[#F2F2F2]">
                <h4 className="font-medium text-black mb-1">📄 Order List</h4>
                <p className="text-sm text-black">View all orders with filters, sorting, and bulk actions</p>
              </div>
              <div className="p-3 border border-black100 rounded-md bg-[#F2F2F2]">
                <h4 className="font-medium text-black mb-1">📝 Order Detail</h4>
                <p className="text-sm text-black">Detailed order view with line items, status, and history</p>
              </div>
              <div className="p-3 border border-black100 rounded-md bg-[#F2F2F2]">
                <h4 className="font-medium text-black mb-1">📊 Order Dashboard</h4>
                <p className="text-sm text-black">KPI overview, charts, and performance metrics</p>
              </div>
            </div>
          </SectionCard>

          {/* Tier 4: Key Actions */}
          <SectionCard
            title="Tier 4: Key Actions"
            subtitle="Primary actions available within order management"
          >
            <div className="flex flex-wrap gap-2">
              <button className="px-4 py-2 bg-[#F5C542] text-black rounded-md hover:bg-[#F5C542]/90 font-medium text-sm">
                Create New Order
              </button>
              <button className="px-4 py-2 bg-white border border-black200 text-black rounded-md hover:bg-[#F2F2F2] font-medium text-sm">
                Import Orders
              </button>
              <button className="px-4 py-2 bg-white border border-black200 text-black rounded-md hover:bg-[#F2F2F2] font-medium text-sm">
                Export Orders
              </button>
              <button className="px-4 py-2 bg-white border border-black200 text-black rounded-md hover:bg-[#F2F2F2] font-medium text-sm">
                Bulk Update Status
              </button>
            </div>
          </SectionCard>
        </main>
      </div>
    </AuthGuard>
  )
}

