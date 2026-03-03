'use client'

import React from 'react'
import { useLocale } from 'next-intl'
import { usePathname } from 'next/navigation'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import FinanceDomainContent from '@/components/os-domains/FinanceDomainContent'

export default function FinanceOSPage() {
  const locale = useLocale()
  const pathname = usePathname()
  
  const persona = pathname?.includes('/portal/distributor') ? 'distributor' :
                  pathname?.includes('/portal/supplier') ? 'supplier' : 'company'

  return (
    <DashboardLayout
      portal={persona}
      pageTitle="Finance OS"
    >
      <FinanceDomainContent persona={persona} locale={locale} />
    </DashboardLayout>
  )
}
