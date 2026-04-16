'use client'

import SectionCard from '@/components/shared/SectionCard'
import KPICard from '@/components/shared/KPICard'
import PortalSubPageLayout from '@/components/shared/PortalSubPageLayout'

export default function DistributorCompliancePage() {
  return (
    <PortalSubPageLayout
      portal="distributor"
      allowedRoles={['distributor', 'sales_officer']}
      currentPage="Compliance"
      pageTitle="Compliance Management"
      pageDescription="Tier 2: Compliance Module — Regulatory compliance, certifications, and audit tracking"
    >

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <KPICard label="Compliance Score" value="98%" icon="✅" />
            <KPICard label="Active Certifications" value="15" icon="📜" />
            <KPICard label="Pending Audits" value="2" icon="🔍" />
            <KPICard label="Violations" value="0" icon="⚠️" />
          </div>

          <SectionCard title="Tier 2: Main Modules" subtitle="Compliance management capabilities">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border border-gray-200">
                <h4 className="font-semibold text-gray-700 mb-2">📋 Certifications</h4>
                <p className="text-sm text-gray-600 mb-2">Track certifications, licenses, and renewals</p>
              </div>
              <div className="p-4 border border-gray-200">
                <h4 className="font-semibold text-gray-700 mb-2">🔍 Audit Management</h4>
                <p className="text-sm text-gray-600 mb-2">Schedule and track compliance audits</p>
              </div>
              <div className="p-4 border border-gray-200">
                <h4 className="font-semibold text-gray-700 mb-2">⚖️ Regulatory Tracking</h4>
                <p className="text-sm text-gray-600 mb-2">Monitor regulatory requirements and changes</p>
              </div>
            </div>
          </SectionCard>
    </PortalSubPageLayout>
  )
}

