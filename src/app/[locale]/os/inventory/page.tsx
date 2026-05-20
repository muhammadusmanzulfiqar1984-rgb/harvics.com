'use client'

import React from 'react'
import { useLocale } from 'next-intl'
import { usePathname } from 'next/navigation'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import InventoryDomainContent from '@/components/os-domains/InventoryDomainContent'
import LiveModuleData from '@/components/shared/LiveModuleData'

export default function InventoryOSPage() {
  const locale = useLocale()
  const pathname = usePathname()
  
  const persona = pathname?.includes('/portal/distributor') ? 'distributor' :
                  pathname?.includes('/portal/supplier') ? 'supplier' : 'company'

  return (
    <DashboardLayout
      portal={persona}
      pageTitle="Inventory OS"
    >
      <InventoryDomainContent persona={persona} locale={locale} />
      <LiveModuleData
        endpoint="/api/v2/assets"
        title="Live Assets Register"
        columns={[
          { key: 'assetCode', label: 'Code' },
          { key: 'name', label: 'Name' },
          { key: 'category', label: 'Category' },
          { key: 'location', label: 'Location' },
          { key: 'status', label: 'Status' },
          { key: 'purchasePrice', label: 'Value', format: (v: any) => v ? `$${Number(v).toLocaleString()}` : '—' },
        ]}
        emptyMessage="No assets registered yet. POST to /api/v2/assets to add one."
      />
    </DashboardLayout>
  )
}
