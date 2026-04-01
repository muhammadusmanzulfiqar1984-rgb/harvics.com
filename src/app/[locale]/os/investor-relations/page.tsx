'use client'

import React from 'react'
import { useLocale } from 'next-intl'
import { usePathname } from 'next/navigation'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import InvestorDomainContent from '@/components/os-domains/InvestorDomainContent'

export default function InvestorRelationsOSPage() {
  const locale = useLocale()
  const pathname = usePathname()
  
  const persona = pathname?.includes('/portal/distributor') ? 'distributor' :
                  pathname?.includes('/portal/supplier') ? 'supplier' : 'company'

  return (
    <DashboardLayout
      portal={persona}
      pageTitle="Investor Relations OS"
    >
      <InvestorDomainContent persona={persona} locale={locale} />
    </DashboardLayout>
  )
}
