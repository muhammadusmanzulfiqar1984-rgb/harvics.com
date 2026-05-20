'use client'

import React from 'react'
import { useLocale } from 'next-intl'
import { usePathname } from 'next/navigation'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import ProjectManagementDomainContent from '@/components/os-domains/ProjectManagementDomainContent'
import LiveModuleData from '@/components/shared/LiveModuleData'

export default function ProjectManagementOSPage() {
  const locale = useLocale()
  const pathname = usePathname()

  const persona = pathname?.includes('/portal/distributor') ? 'distributor' :
                  pathname?.includes('/portal/supplier') ? 'supplier' : 'company'

  return (
    <DashboardLayout portal={persona} pageTitle="Project Management OS">
      <ProjectManagementDomainContent persona={persona} locale={locale} />
      <LiveModuleData
        endpoint="/api/v2/projects"
        title="Live Projects"
        columns={[
          { key: 'code', label: 'Code' },
          { key: 'name', label: 'Name' },
          { key: 'status', label: 'Status' },
          { key: 'priority', label: 'Priority' },
          { key: 'budget', label: 'Budget', format: (v) => v != null ? `$${Number(v).toLocaleString()}` : '—' },
          { key: 'currency', label: 'Ccy' },
        ]}
        emptyMessage="No projects yet. POST to /api/v2/projects to create one."
      />
    </DashboardLayout>
  )
}
