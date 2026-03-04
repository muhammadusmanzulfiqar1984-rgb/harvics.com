'use client'

import React from 'react'
import { useLocale } from 'next-intl'
import EnterpriseCRM from '@/components/shared/EnterpriseCRM'
import { DistributorDashboard as DistributorDashboardWidget } from '@/apps/crm/widgets/DistributorDashboard'

export default function DistributorPortalPage() {
  const locale = useLocale()

  return (
    <div className="space-y-8">
      {/* Distributor Dashboard Widget (AI & Analytics) */}
      <DistributorDashboardWidget />

      {/* Distributor CRM System (Transactional) */}
      <section className="mt-8 pt-8 border-t border-gray-200">
        <div className="text-center mb-6">
          <h2 className="text-xl md:text-2xl font-bold text-[#C3A35E] mb-2">
            📦 Distributor CRM System
          </h2>
          <p className="text-gray-600 max-w-3xl mx-auto text-sm">
            Complete distributor management: Sales orders, warehouse inventory, logistics & delivery, financial tracking, and retailer/customer relationships
          </p>
        </div>
        <div className="bg-white shadow-lg border-2 border-[#C3A35E]/30 overflow-hidden">
          <EnterpriseCRM persona="distributor" locale={locale} />
        </div>
      </section>
    </div>
  )
}

