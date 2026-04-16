'use client'

import SectionCard from '@/components/shared/SectionCard'
import KPICard from '@/components/shared/KPICard'
import PortalSubPageLayout from '@/components/shared/PortalSubPageLayout'

export default function SupplierPOsPage() {
  return (
    <PortalSubPageLayout
      portal="supplier"
      allowedRoles={['supplier', 'company_admin', 'admin', 'hq']}
      currentPage="Purchase Orders"
      pageTitle="Purchase Orders"
      pageDescription="Tier 2: Purchase Orders Module — PO management, fulfillment, and tracking"
    >

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <KPICard label="Open POs" value="45" icon="📦" />
            <KPICard label="In Progress" value="32" icon="⚙️" />
            <KPICard label="Completed" value="128" icon="✅" />
            <KPICard label="On-Time Rate" value="94%" icon="⏰" />
          </div>

          <SectionCard title="Tier 2: Main Modules" subtitle="Purchase order management capabilities">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border border-gray-200">
                <h4 className="font-semibold text-gray-700 mb-2">📋 PO Processing</h4>
                <p className="text-sm text-gray-600 mb-2">Receive, acknowledge, and process purchase orders</p>
              </div>
              <div className="p-4 border border-gray-200">
                <h4 className="font-semibold text-gray-700 mb-2">📦 Fulfillment</h4>
                <p className="text-sm text-gray-600 mb-2">Order fulfillment and delivery coordination</p>
              </div>
              <div className="p-4 border border-gray-200">
                <h4 className="font-semibold text-gray-700 mb-2">📊 PO Analytics</h4>
                <p className="text-sm text-gray-600 mb-2">Performance metrics and delivery tracking</p>
              </div>
            </div>
          </SectionCard>
    </PortalSubPageLayout>
  )
}

