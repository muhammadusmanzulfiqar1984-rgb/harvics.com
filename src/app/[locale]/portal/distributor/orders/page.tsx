'use client'

import SectionCard from '@/components/shared/SectionCard'
import KPICard from '@/components/shared/KPICard'
import PortalSubPageLayout from '@/components/shared/PortalSubPageLayout'

export default function DistributorOrdersPage() {
  return (
    <PortalSubPageLayout
      portal="distributor"
      allowedRoles={['distributor', 'sales_officer']}
      currentPage="Orders"
      pageTitle="Orders Management"
      pageDescription="Tier 2: Order Management Module — Track, manage, and fulfill distributor orders"
    >

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
              <div className="p-4 border border-gray-200">
                <h4 className="font-semibold text-gray-700 mb-2">📋 Order Processing</h4>
                <p className="text-sm text-gray-600 mb-2">Create, track, and manage orders throughout lifecycle</p>
                <ul className="text-xs text-gray-500 space-y-1 list-disc list-inside">
                  <li>Order creation and approval</li>
                  <li>Status tracking</li>
                  <li>Order modifications</li>
                </ul>
              </div>
              <div className="p-4 border border-gray-200">
                <h4 className="font-semibold text-gray-700 mb-2">📊 Order Analytics</h4>
                <p className="text-sm text-gray-600 mb-2">Performance metrics and insights</p>
                <ul className="text-xs text-gray-500 space-y-1 list-disc list-inside">
                  <li>Order trends</li>
                  <li>Product performance</li>
                  <li>Fulfillment metrics</li>
                </ul>
              </div>
              <div className="p-4 border border-gray-200">
                <h4 className="font-semibold text-gray-700 mb-2">🔄 Order Fulfillment</h4>
                <p className="text-sm text-gray-600 mb-2">Inventory allocation and delivery coordination</p>
                <ul className="text-xs text-gray-500 space-y-1 list-disc list-inside">
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
              <div className="p-3 border border-gray-100 bg-[#F2F2F2]">
                <h4 className="font-medium text-gray-700 mb-1">📄 Order List</h4>
                <p className="text-sm text-black">View all orders with filters, sorting, and bulk actions</p>
              </div>
              <div className="p-3 border border-gray-100 bg-[#F2F2F2]">
                <h4 className="font-medium text-gray-700 mb-1">📝 Order Detail</h4>
                <p className="text-sm text-black">Detailed order view with line items, status, and history</p>
              </div>
              <div className="p-3 border border-gray-100 bg-[#F2F2F2]">
                <h4 className="font-medium text-gray-700 mb-1">📊 Order Dashboard</h4>
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
              <button className="px-4 py-2 bg-[#6B1F2B] text-white hover:bg-[#F5C542]/90 font-medium text-sm">
                Create New Order
              </button>
              <button className="px-4 py-2 bg-white border border-gray-200 text-black hover:bg-[#F2F2F2] font-medium text-sm">
                Import Orders
              </button>
              <button className="px-4 py-2 bg-white border border-gray-200 text-black hover:bg-[#F2F2F2] font-medium text-sm">
                Export Orders
              </button>
              <button className="px-4 py-2 bg-white border border-gray-200 text-black hover:bg-[#F2F2F2] font-medium text-sm">
                Bulk Update Status
              </button>
            </div>
          </SectionCard>
    </PortalSubPageLayout>
  )
}

