'use client'

import SectionCard from '@/components/shared/SectionCard'
import KPICard from '@/components/shared/KPICard'
import PortalSubPageLayout from '@/components/shared/PortalSubPageLayout'

export default function SupplierContractsPage() {
  return (
    <PortalSubPageLayout
      portal="supplier"
      allowedRoles={['supplier', 'company_admin', 'admin', 'hq']}
      currentPage="Contracts"
      pageTitle="Contracts Management"
      pageDescription="Tier 2: Contracts Module — Contract management, renewals, terms, and compliance"
    >

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <KPICard label="Active Contracts" value="15" icon="📋" />
            <KPICard label="Expiring Soon" value="3" icon="⚠️" />
            <KPICard label="Renewals Due" value="2" icon="🔄" />
            <KPICard label="Compliance Rate" value="100%" icon="✅" />
          </div>

          <SectionCard title="Tier 2: Main Modules" subtitle="Contract management capabilities">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border border-gray-200">
                <h4 className="font-semibold text-gray-700 mb-2">📋 Contract Management</h4>
                <p className="text-sm text-gray-600 mb-2">Track contracts, terms, and key dates</p>
              </div>
              <div className="p-4 border border-gray-200">
                <h4 className="font-semibold text-gray-700 mb-2">🔄 Renewal Tracking</h4>
                <p className="text-sm text-gray-600 mb-2">Monitor contract renewals and expirations</p>
              </div>
              <div className="p-4 border border-gray-200">
                <h4 className="font-semibold text-gray-700 mb-2">⚖️ Compliance</h4>
                <p className="text-sm text-gray-600 mb-2">Track contract compliance and performance</p>
              </div>
            </div>
          </SectionCard>
    </PortalSubPageLayout>
  )
}

