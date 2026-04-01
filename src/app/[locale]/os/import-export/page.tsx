'use client'

import React from 'react'
import { useLocale } from 'next-intl'
import { usePathname } from 'next/navigation'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import ImportExportDomainContent from '@/components/os-domains/ImportExportDomainContent'

export default function ImportExportOSPage() {
  const locale = useLocale()
  const pathname = usePathname()
  
  const persona = pathname?.includes('/portal/distributor') ? 'distributor' :
                  pathname?.includes('/portal/supplier') ? 'supplier' : 'company'

  return (
    <DashboardLayout
      portal={persona}
      pageTitle="Import/Export OS"
    >
      <ImportExportDomainContent persona={persona} locale={locale} />
    </DashboardLayout>
  )
}
