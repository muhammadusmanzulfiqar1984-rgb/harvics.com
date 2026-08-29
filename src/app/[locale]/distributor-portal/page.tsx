'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import LocalizationBar from '@/components/shared/LocalizationBar'
import { DistributorDashboard as DistributorDashboardWidget } from '@/apps/crm/widgets/DistributorDashboard'

const NAV = [
  { href: 'orders/new', label: 'Place Order' },
  { href: 'orders/history', label: 'Order History' },
  { href: 'orders/invoices', label: 'Invoices' },
  { href: 'products/catalogue', label: 'Catalogue' },
  { href: 'coverage/territories', label: 'Territories' },
  { href: 'account/documents', label: 'Documents' },
]

export default function DistributorPortalPage() {
  const locale = useLocale()

  return (
    <div className="space-y-8">
      <LocalizationBar compact showGeo={false} className="items-center gap-2" />
      <div>
        <h1 className="text-2xl font-bold text-harvics-burgundy">Distributor Portal</h1>
        <p className="text-sm text-gray-700 mt-1">Module #12 — live orders, catalogue, invoices, and credit.</p>
      </div>
      <DistributorDashboardWidget />
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {NAV.map((n) => (
          <Link
            key={n.href}
            href={`/${locale}/distributor-portal/${n.href}`}
            className="bg-white border border-harvics-burgundy/20 px-4 py-3 text-sm font-semibold text-harvics-burgundy hover:bg-[#F5F0E8]"
          >
            {n.label} →
          </Link>
        ))}
        <Link href={`/${locale}/os/distributors`} className="bg-harvics-burgundy text-[#F5F0E8] px-4 py-3 text-sm font-semibold">
          HQ Admin (Module #12 OS) →
        </Link>
      </div>
    </div>
  )
}
