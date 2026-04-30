'use client'

import React from 'react'
import { useLocale } from 'next-intl'
import { usePathname } from 'next/navigation'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import ManufacturingDomainContent from '@/components/os-domains/ManufacturingDomainContent'

export default function ManufacturingOSPage() {
  const locale = useLocale()
  const pathname = usePathname()

  const persona = pathname?.includes('/portal/distributor') ? 'distributor' :
                  pathname?.includes('/portal/supplier') ? 'supplier' : 'company'

  return (
    <DashboardLayout portal={persona} pageTitle="Manufacturing OS">
      <ManufacturingDomainContent persona={persona} locale={locale} />
    </DashboardLayout>
  )
}
