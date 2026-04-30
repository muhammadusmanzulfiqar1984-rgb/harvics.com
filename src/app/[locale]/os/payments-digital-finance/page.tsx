'use client'

import React from 'react'
import { useLocale } from 'next-intl'
import { usePathname } from 'next/navigation'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import PaymentsDigitalFinanceDomainContent from '@/components/os-domains/PaymentsDigitalFinanceDomainContent'

export default function PaymentsDigitalFinanceOSPage() {
  const locale = useLocale()
  const pathname = usePathname()

  const persona = pathname?.includes('/portal/distributor') ? 'distributor' :
                  pathname?.includes('/portal/supplier') ? 'supplier' : 'company'

  return (
    <DashboardLayout portal={persona} pageTitle="Payments & Digital Finance OS">
      <PaymentsDigitalFinanceDomainContent persona={persona} locale={locale} />
    </DashboardLayout>
  )
}
