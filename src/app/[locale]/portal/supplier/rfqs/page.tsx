'use client'

import SectionCard from '@/components/shared/SectionCard'
import KPICard from '@/components/shared/KPICard'
import PortalSubPageLayout from '@/components/shared/PortalSubPageLayout'

export default function SupplierRFQsPage() {
  return (
    <PortalSubPageLayout
      portal="supplier"
      allowedRoles={['supplier', 'company_admin', 'admin', 'hq']}
      currentPage="RFQs"
      pageTitle="RFQ Management"
      pageDescription="Tier 2: RFQs Module — Request for Quotation management, quotes, and responses"
    >

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <KPICard label="Open RFQs" value="23" icon="📋" />
            <KPICard label="Quoted" value="18" icon="💬" />
            <KPICard label="Won" value="12" icon="✅" />
            <KPICard label="Win Rate" value="67%" icon="📊" />
          </div>

          <SectionCard title="Tier 2: Main Modules" subtitle="RFQ management capabilities">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border border-gray-200">
                <h4 className="font-semibold text-gray-700 mb-2">📋 RFQ Processing</h4>
                <p className="text-sm text-gray-600 mb-2">Receive, review, and respond to RFQs</p>
              </div>
              <div className="p-4 border border-gray-200">
                <h4 className="font-semibold text-gray-700 mb-2">💰 Quote Management</h4>
                <p className="text-sm text-gray-600 mb-2">Create and manage pricing quotes</p>
              </div>
              <div className="p-4 border border-gray-200">
                <h4 className="font-semibold text-gray-700 mb-2">📊 RFQ Analytics</h4>
                <p className="text-sm text-gray-600 mb-2">Track win rates and performance metrics</p>
              </div>
            </div>
          </SectionCard>
    </PortalSubPageLayout>
  )
}

