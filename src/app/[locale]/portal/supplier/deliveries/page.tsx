'use client'

import SectionCard from '@/components/shared/SectionCard'
import KPICard from '@/components/shared/KPICard'
import PortalSubPageLayout from '@/components/shared/PortalSubPageLayout'

export default function SupplierDeliveriesPage() {
  return (
    <PortalSubPageLayout
      portal="supplier"
      allowedRoles={['supplier', 'company_admin', 'admin', 'hq']}
      currentPage="Deliveries / GRN"
      pageTitle="Deliveries & GRN"
      pageDescription="Tier 2: Deliveries Module — Delivery tracking, GRN (Goods Receipt Note), and shipment management"
    >

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <KPICard label="Pending Deliveries" value="12" icon="📦" />
            <KPICard label="In Transit" value="8" icon="🚚" />
            <KPICard label="Delivered" value="156" icon="✅" />
            <KPICard label="On-Time Rate" value="96%" icon="⏰" />
          </div>

          <SectionCard title="Tier 2: Main Modules" subtitle="Delivery and GRN management capabilities">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border border-gray-200">
                <h4 className="font-semibold text-gray-700 mb-2">🚚 Delivery Management</h4>
                <p className="text-sm text-gray-600 mb-2">Track shipments and delivery status</p>
              </div>
              <div className="p-4 border border-gray-200">
                <h4 className="font-semibold text-gray-700 mb-2">📋 GRN Processing</h4>
                <p className="text-sm text-gray-600 mb-2">Goods Receipt Note creation and tracking</p>
              </div>
              <div className="p-4 border border-gray-200">
                <h4 className="font-semibold text-gray-700 mb-2">📊 Delivery Analytics</h4>
                <p className="text-sm text-gray-600 mb-2">Performance metrics and delivery insights</p>
              </div>
            </div>
          </SectionCard>
    </PortalSubPageLayout>
  )
}

