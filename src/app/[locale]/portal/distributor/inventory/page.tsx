'use client'

import SectionCard from '@/components/shared/SectionCard'
import KPICard from '@/components/shared/KPICard'
import PortalSubPageLayout from '@/components/shared/PortalSubPageLayout'

export default function DistributorInventoryPage() {
  return (
    <PortalSubPageLayout
      portal="distributor"
      allowedRoles={['distributor', 'sales_officer']}
      currentPage="Inventory"
      pageTitle="Inventory Management"
      pageDescription="Tier 2: Inventory Module — Stock levels, warehouse operations, and SKU management"
    >

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <KPICard label="Total SKUs" value="450" icon="📦" />
            <KPICard label="Low Stock Items" value="12" icon="⚠️" />
            <KPICard label="Inventory Value" value="$325K" icon="💰" />
            <KPICard label="Stock Turnover" value="8.5x" icon="🔄" />
          </div>

          <SectionCard
            title="Tier 2: Main Modules"
            subtitle="Inventory management capabilities"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border border-gray-200">
                <h4 className="font-semibold text-gray-700 mb-2">📦 Stock Management</h4>
                <p className="text-sm text-gray-600 mb-2">Real-time stock levels and movements</p>
              </div>
              <div className="p-4 border border-gray-200">
                <h4 className="font-semibold text-gray-700 mb-2">🏭 Warehouse Operations</h4>
                <p className="text-sm text-gray-600 mb-2">Multi-location warehouse management</p>
              </div>
              <div className="p-4 border border-gray-200">
                <h4 className="font-semibold text-gray-700 mb-2">📊 Stock Analytics</h4>
                <p className="text-sm text-gray-600 mb-2">Inventory performance and insights</p>
              </div>
            </div>
          </SectionCard>
    </PortalSubPageLayout>
  )
}

