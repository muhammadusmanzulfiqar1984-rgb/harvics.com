'use client'

import React from 'react'
import { useLocale } from 'next-intl'
import { usePathname } from 'next/navigation'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import ExecutiveDomainContent from '@/components/os-domains/ExecutiveDomainContent'
import LiveModuleData from '@/components/shared/LiveModuleData'

export default function ExecutiveOSPage() {
  const locale = useLocale()
  const pathname = usePathname()
  
  const persona = pathname?.includes('/portal/distributor') ? 'distributor' :
                  pathname?.includes('/portal/supplier') ? 'supplier' : 'company'

  return (
    <DashboardLayout
      portal={persona}
      pageTitle="Executive Control Tower"
    >
      <ExecutiveDomainContent persona={persona} locale={locale} />
      <LiveModuleData
        endpoint="/api/v2/notifications"
        title="Live Notifications Feed"
        columns={[
          { key: 'severity', label: 'Severity' },
          { key: 'category', label: 'Category' },
          { key: 'title', label: 'Title' },
          { key: 'message', label: 'Message' },
          { key: 'channel', label: 'Channel' },
          { key: 'createdAt', label: 'When', format: (v: any) => v ? new Date(v).toLocaleString() : '—' },
        ]}
        emptyMessage="No notifications. POST to /api/v2/notifications to send one."
      />
    </DashboardLayout>
  )
}
