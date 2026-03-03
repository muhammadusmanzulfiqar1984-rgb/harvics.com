'use client'

import React from 'react'
import { useLocale } from 'next-intl'
import { usePathname } from 'next/navigation'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import InventoryDomainContent from '@/components/os-domains/InventoryDomainContent'

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
    </DashboardLayout>
  )
}
