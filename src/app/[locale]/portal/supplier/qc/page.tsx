'use client'

import SectionCard from '@/components/shared/SectionCard'
import KPICard from '@/components/shared/KPICard'
import PortalSubPageLayout from '@/components/shared/PortalSubPageLayout'

export default function SupplierQCPage() {
  return (
    <PortalSubPageLayout
      portal="supplier"
      allowedRoles={['supplier', 'company_admin', 'admin', 'hq']}
      currentPage="Quality Control"
      pageTitle="Quality Control"
      pageDescription="Tier 2: QC Module — Quality control, testing, inspections, and quality metrics"
    >

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <KPICard label="QC Pass Rate" value="98.5%" icon="✅" />
            <KPICard label="Pending Inspections" value="5" icon="🔍" />
            <KPICard label="QC Failures" value="3" icon="❌" />
            <KPICard label="Quality Score" value="97%" icon="📊" />
          </div>

          <SectionCard title="Tier 2: Main Modules" subtitle="Quality control capabilities">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border border-gray-200">
                <h4 className="font-semibold text-gray-700 mb-2">🔍 Inspection Management</h4>
                <p className="text-sm text-gray-600 mb-2">Schedule and track quality inspections</p>
              </div>
              <div className="p-4 border border-gray-200">
                <h4 className="font-semibold text-gray-700 mb-2">📋 Test Results</h4>
                <p className="text-sm text-gray-600 mb-2">Record and track QC test results</p>
              </div>
              <div className="p-4 border border-gray-200">
                <h4 className="font-semibold text-gray-700 mb-2">📊 Quality Analytics</h4>
                <p className="text-sm text-gray-600 mb-2">Quality metrics and trend analysis</p>
              </div>
            </div>
          </SectionCard>
    </PortalSubPageLayout>
  )
}

