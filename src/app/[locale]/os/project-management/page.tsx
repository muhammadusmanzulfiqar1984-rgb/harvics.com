'use client'

import React from 'react'
import { useLocale } from 'next-intl'
import { usePathname } from 'next/navigation'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import ProjectManagementDomainContent from '@/components/os-domains/ProjectManagementDomainContent'

export default function ProjectManagementOSPage() {
  const locale = useLocale()
  const pathname = usePathname()

  const persona = pathname?.includes('/portal/distributor') ? 'distributor' :
                  pathname?.includes('/portal/supplier') ? 'supplier' : 'company'

  return (
    <DashboardLayout portal={persona} pageTitle="Project Management OS">
      <ProjectManagementDomainContent persona={persona} locale={locale} />
    </DashboardLayout>
  )
}
