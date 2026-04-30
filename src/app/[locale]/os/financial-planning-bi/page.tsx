'use client'

import React from 'react'
import { useLocale } from 'next-intl'
import { usePathname } from 'next/navigation'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import FinancialPlanningBIDomainContent from '@/components/os-domains/FinancialPlanningBIDomainContent'

export default function FinancialPlanningBIOSPage() {
  const locale = useLocale()
  const pathname = usePathname()

  const persona = pathname?.includes('/portal/distributor') ? 'distributor' :
                  pathname?.includes('/portal/supplier') ? 'supplier' : 'company'

  return (
    <DashboardLayout portal={persona} pageTitle="Financial Planning & BI OS">
      <FinancialPlanningBIDomainContent persona={persona} locale={locale} />
    </DashboardLayout>
  )
}
