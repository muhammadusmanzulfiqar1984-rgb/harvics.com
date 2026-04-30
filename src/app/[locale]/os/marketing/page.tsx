'use client'

import React from 'react'
import { useLocale } from 'next-intl'
import { usePathname } from 'next/navigation'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import MarketingDomainContent from '@/components/os-domains/MarketingDomainContent'

export default function MarketingOSPage() {
  const locale = useLocale()
  const pathname = usePathname()

  const persona = pathname?.includes('/portal/distributor') ? 'distributor' :
                  pathname?.includes('/portal/supplier') ? 'supplier' : 'company'

  return (
    <DashboardLayout portal={persona} pageTitle="Marketing OS">
      <MarketingDomainContent persona={persona} locale={locale} />
    </DashboardLayout>
  )
}
