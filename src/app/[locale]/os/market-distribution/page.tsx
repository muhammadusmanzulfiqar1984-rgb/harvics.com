'use client'

import React from 'react'
import { useLocale } from 'next-intl'
import { usePathname } from 'next/navigation'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import KPICard from '@/components/shared/KPICard'

export default function MarketDistributionOSPage() {
  const locale = useLocale()
  const pathname = usePathname()
  
  const portal = pathname?.includes('/portal/distributor') ? 'distributor' :
                 pathname?.includes('/portal/supplier') ? 'supplier' : 'company'

  return (
    <DashboardLayout
      portal={portal}
      pageTitle="Market & Distribution OS"
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <KPICard
            label="Active Distributors"
            value="234"
            icon="🚚"
          />
          <KPICard
            label="Territories"
            value="45"
            icon="🗺️"
          />
          <KPICard
            label="Coverage"
            value="92%"
            icon="📊"
          />
          <KPICard
            label="Performance Score"
            value="88"
            icon="⭐"
          />
        </div>

        <div className="border-t border-black200 pt-6">
          <h3 className="text-lg font-semibold text-black mb-4">Distributor Management</h3>
          <p className="text-black mb-4">
            Manage distributor relationships, territories, pricing, and performance metrics.
            Track distributor KPIs and ensure optimal market coverage.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white border border-black200 rounded-lg p-4">
              <h4 className="font-semibold text-black mb-2">Distributor Profiles</h4>
              <p className="text-sm text-black">Complete distributor information and contact details</p>
            </div>
            <div className="bg-white border border-black200 rounded-lg p-4">
              <h4 className="font-semibold text-black mb-2">Territory Assignment</h4>
              <p className="text-sm text-black">Assign and manage distributor territories</p>
            </div>
            <div className="bg-white border border-black200 rounded-lg p-4">
              <h4 className="font-semibold text-black mb-2">Pricing Management</h4>
              <p className="text-sm text-black">Set and manage distributor pricing tiers</p>
            </div>
            <div className="bg-white border border-black200 rounded-lg p-4">
              <h4 className="font-semibold text-black mb-2">Performance Tracking</h4>
              <p className="text-sm text-black">Monitor distributor KPIs and metrics</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
