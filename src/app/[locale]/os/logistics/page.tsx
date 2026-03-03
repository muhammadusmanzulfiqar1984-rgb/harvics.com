'use client'

import React from 'react'
import { useLocale } from 'next-intl'
import { usePathname } from 'next/navigation'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import LogisticsDomainContent from '@/components/os-domains/LogisticsDomainContent'

export default function LogisticsOSPage() {
  const locale = useLocale()
  const pathname = usePathname()
  
  const persona = pathname?.includes('/portal/distributor') ? 'distributor' :
                  pathname?.includes('/portal/supplier') ? 'supplier' : 'company'

  return (
    <DashboardLayout
      portal={persona}
      pageTitle="Logistics OS"
    >
      <LogisticsDomainContent persona={persona} locale={locale} />
    </DashboardLayout>
  )
}

