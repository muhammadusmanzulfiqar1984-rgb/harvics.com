'use client'

import React from 'react'
import { useLocale } from 'next-intl'
import { usePathname } from 'next/navigation'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import CRMDomainContent from '@/components/os-domains/CRMDomainContent'

export default function CRMOSPage() {
  const locale = useLocale()
  const pathname = usePathname()
  
  // Determine persona from pathname
  const persona = pathname?.includes('/portal/distributor') ? 'distributor' :
                  pathname?.includes('/portal/supplier') ? 'supplier' : 'company'

  return (
    <DashboardLayout
      portal={persona}
      pageTitle="CRM OS"
    >
      <CRMDomainContent persona={persona} locale={locale} />
    </DashboardLayout>
  )
}
