'use client'

import SectionCard from '@/components/shared/SectionCard'
import KPICard from '@/components/shared/KPICard'
import PortalSubPageLayout from '@/components/shared/PortalSubPageLayout'

export default function DistributorRetailersPage() {
  return (
    <PortalSubPageLayout
      portal="distributor"
      allowedRoles={['distributor', 'sales_officer']}
      currentPage="Retailers"
      pageTitle="Retailer Management"
      pageDescription="Tier 2: Retailers Module — Manage retailer relationships, coverage, and performance"
    >

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <KPICard label="Total Retailers" value="234" icon="🏪" />
            <KPICard label="Active Retailers" value="198" icon="✅" />
            <KPICard label="New This Month" value="12" icon="🆕" />
            <KPICard label="Coverage Score" value="92%" icon="📊" />
          </div>

          <SectionCard title="Tier 2: Main Modules" subtitle="Retailer management capabilities">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border border-gray-200">
                <h4 className="font-semibold text-gray-700 mb-2">👥 Retailer Master</h4>
                <p className="text-sm text-gray-600 mb-2">Retailer profiles, contact information, and relationships</p>
              </div>
              <div className="p-4 border border-gray-200">
                <h4 className="font-semibold text-gray-700 mb-2">🗺️ Coverage Management</h4>
                <p className="text-sm text-gray-600 mb-2">Territory coverage and retailer mapping</p>
              </div>
              <div className="p-4 border border-gray-200">
                <h4 className="font-semibold text-gray-700 mb-2">📊 Performance Tracking</h4>
                <p className="text-sm text-gray-600 mb-2">Retailer performance metrics and analytics</p>
              </div>
            </div>
          </SectionCard>
    </PortalSubPageLayout>
  )
}

