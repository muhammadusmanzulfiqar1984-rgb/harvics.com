'use client'

import React from 'react'
import { useLocale } from 'next-intl'
import { usePathname } from 'next/navigation'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import TreasuryBankingDomainContent from '@/components/os-domains/TreasuryBankingDomainContent'

export default function TreasuryBankingOSPage() {
  const locale = useLocale()
  const pathname = usePathname()

  const persona = pathname?.includes('/portal/distributor') ? 'distributor' :
                  pathname?.includes('/portal/supplier') ? 'supplier' : 'company'

  return (
    <DashboardLayout portal={persona} pageTitle="Treasury & Banking OS">
      <TreasuryBankingDomainContent persona={persona} locale={locale} />
    </DashboardLayout>
  )
}
