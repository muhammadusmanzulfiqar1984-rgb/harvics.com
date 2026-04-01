'use client'

import React from 'react'
import { useLocale } from 'next-intl'
import { usePathname } from 'next/navigation'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import LocalizationDomainContent from '@/components/os-domains/LocalizationDomainContent'

export default function LocalizationOSPage() {
  const locale = useLocale()
  const pathname = usePathname()
  
  const persona = pathname?.includes('/portal/distributor') ? 'distributor' :
                  pathname?.includes('/portal/supplier') ? 'supplier' : 'company'

  return (
    <DashboardLayout
      portal={persona}
      pageTitle="Localization OS"
    >
      <LocalizationDomainContent persona={persona} locale={locale} />
    </DashboardLayout>
  )
}
