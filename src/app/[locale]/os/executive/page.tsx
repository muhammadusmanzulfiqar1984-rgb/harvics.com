'use client'

import React from 'react'
import { useLocale } from 'next-intl'
import { usePathname } from 'next/navigation'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import ExecutiveDomainContent from '@/components/os-domains/ExecutiveDomainContent'

export default function ExecutiveOSPage() {
  const locale = useLocale()
  const pathname = usePathname()
  
  const persona = pathname?.includes('/portal/distributor') ? 'distributor' :
                  pathname?.includes('/portal/supplier') ? 'supplier' : 'company'

  return (
    <DashboardLayout
      portal={persona}
      pageTitle="Executive Control Tower"
    >
      <ExecutiveDomainContent persona={persona} locale={locale} />
    </DashboardLayout>
  )
}
