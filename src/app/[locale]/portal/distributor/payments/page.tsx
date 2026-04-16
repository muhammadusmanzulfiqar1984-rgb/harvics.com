'use client'

import { useLocale } from 'next-intl'
import SectionCard from '@/components/shared/SectionCard'
import KPICard from '@/components/shared/KPICard'
import PortalSubPageLayout from '@/components/shared/PortalSubPageLayout'

export default function DistributorPaymentsPage() {
  const locale = useLocale()

  return (
    <PortalSubPageLayout
      portal="distributor"
      allowedRoles={['distributor', 'sales_officer']}
      currentPage="Payments"
      pageTitle="Payments & Statements"
      pageDescription="Tier 2: Payments Module — Payment tracking, invoices, statements, and payment history"
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <KPICard label="Outstanding Amount" value="$125K" icon="💵" />
            <KPICard label="Paid This Month" value="$85K" icon="✅" />
            <KPICard label="Pending Invoices" value="12" icon="📄" />
            <KPICard label="Payment Score" value="95%" icon="📊" />
          </div>

          <SectionCard title="Payment Management" subtitle="Manage your payments, invoices, and receipts">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <a
                href={`/${locale}/portal/distributor/payments/make-payment`}
                className="p-6 border border-gray-200 bg-white hover:border-[#F5C542] hover:shadow-md transition-all cursor-pointer"
              >
                <div className="text-3xl mb-3">💳</div>
                <h4 className="font-semibold text-gray-700 mb-2">Make Payment</h4>
                <p className="text-sm text-black/70 mb-4">Pay invoices, advance, or top-up wallet</p>
                <span className="text-sm text-[#F5C542] font-medium">Go to Payment →</span>
              </a>
              
              <a
                href={`/${locale}/portal/distributor/payments/invoices`}
                className="p-6 border border-gray-200 bg-white hover:border-[#F5C542] hover:shadow-md transition-all cursor-pointer"
              >
                <div className="text-3xl mb-3">📄</div>
                <h4 className="font-semibold text-gray-700 mb-2">Invoices</h4>
                <p className="text-sm text-black/70 mb-4">View and manage your invoices</p>
                <span className="text-sm text-[#F5C542] font-medium">View Invoices →</span>
              </a>
              
              <a
                href={`/${locale}/portal/distributor/payments/history`}
                className="p-6 border border-gray-200 bg-white hover:border-[#F5C542] hover:shadow-md transition-all cursor-pointer"
              >
                <div className="text-3xl mb-3">📊</div>
                <h4 className="font-semibold text-gray-700 mb-2">Payment History</h4>
                <p className="text-sm text-black/70 mb-4">View all payment transactions</p>
                <span className="text-sm text-[#F5C542] font-medium">View History →</span>
              </a>
              
              <a
                href={`/${locale}/portal/distributor/payments/receipts`}
                className="p-6 border border-gray-200 bg-white hover:border-[#F5C542] hover:shadow-md transition-all cursor-pointer"
              >
                <div className="text-3xl mb-3">🧾</div>
                <h4 className="font-semibold text-gray-700 mb-2">Receipts</h4>
                <p className="text-sm text-black/70 mb-4">Download payment receipts</p>
                <span className="text-sm text-[#F5C542] font-medium">View Receipts →</span>
              </a>
            </div>
          </SectionCard>
    </PortalSubPageLayout>
  )
}

