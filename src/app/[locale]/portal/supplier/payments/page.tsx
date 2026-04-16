'use client'

import SectionCard from '@/components/shared/SectionCard'
import KPICard from '@/components/shared/KPICard'
import PortalSubPageLayout from '@/components/shared/PortalSubPageLayout'

export default function SupplierPaymentsPage() {
  return (
    <PortalSubPageLayout
      portal="supplier"
      allowedRoles={['supplier', 'company_admin', 'admin', 'hq']}
      currentPage="Payments"
      pageTitle="Payments & Invoicing"
      pageDescription="Tier 2: Payments Module — Payment tracking, invoices, and payment history"
    >

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <KPICard label="Outstanding" value="$85K" icon="💵" />
            <KPICard label="Received This Month" value="$125K" icon="✅" />
            <KPICard label="Pending Invoices" value="8" icon="📄" />
            <KPICard label="Payment Score" value="98%" icon="📊" />
          </div>

          <SectionCard title="Tier 2: Main Modules" subtitle="Payment management capabilities">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border border-gray-200">
                <h4 className="font-semibold text-gray-700 mb-2">💳 Payment Tracking</h4>
                <p className="text-sm text-gray-600 mb-2">Track received payments and outstanding amounts</p>
              </div>
              <div className="p-4 border border-gray-200">
                <h4 className="font-semibold text-gray-700 mb-2">📄 Invoice Management</h4>
                <p className="text-sm text-gray-600 mb-2">Create and manage supplier invoices</p>
              </div>
              <div className="p-4 border border-gray-200">
                <h4 className="font-semibold text-gray-700 mb-2">📊 Payment Analytics</h4>
                <p className="text-sm text-gray-600 mb-2">Payment trends and performance metrics</p>
              </div>
            </div>
          </SectionCard>
    </PortalSubPageLayout>
  )
}

