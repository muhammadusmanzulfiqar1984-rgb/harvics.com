'use client'

import React from 'react'
import { useLocale } from 'next-intl'
import { usePathname } from 'next/navigation'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import WorkflowsDomainContent from '@/components/os-domains/WorkflowsDomainContent'

export default function WorkflowsOSPage() {
  const locale = useLocale()
  const pathname = usePathname()
  
  const persona = pathname?.includes('/portal/distributor') ? 'distributor' :
                  pathname?.includes('/portal/supplier') ? 'supplier' : 'company'

  return (
    <DashboardLayout
      portal={persona}
      pageTitle="Workflows & Operations OS"
    >
      <WorkflowsDomainContent persona={persona} locale={locale} />
    </DashboardLayout>
  )
}
