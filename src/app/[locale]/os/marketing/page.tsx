'use client'

import React from 'react'
import { useLocale } from 'next-intl'
import { usePathname } from 'next/navigation'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import MarketingDomainContent from '@/components/os-domains/MarketingDomainContent'
import LiveModuleData from '@/components/shared/LiveModuleData'

export default function MarketingOSPage() {
  const locale = useLocale()
  const pathname = usePathname()

  const persona = pathname?.includes('/portal/distributor') ? 'distributor' :
                  pathname?.includes('/portal/supplier') ? 'supplier' : 'company'

  return (
    <DashboardLayout portal={persona} pageTitle="Marketing OS">
      <MarketingDomainContent persona={persona} locale={locale} />
      <LiveModuleData
        endpoint="/api/v2/marketing/email-campaigns"
        title="Live Email Campaigns"
        columns={[
          { key: 'name', label: 'Name' },
          { key: 'subject', label: 'Subject' },
          { key: 'segment', label: 'Segment' },
          { key: 'status', label: 'Status' },
          { key: 'sentCount', label: 'Sent' },
          { key: 'openCount', label: 'Opens' },
        ]}
      />
      <LiveModuleData
        endpoint="/api/v2/marketing/social-posts"
        title="Social Posts"
        columns={[
          { key: 'platform', label: 'Platform' },
          { key: 'content', label: 'Content', format: (v) => v ? String(v).slice(0, 60) : '—' },
          { key: 'status', label: 'Status' },
          { key: 'impressions', label: 'Impr.' },
          { key: 'engagements', label: 'Eng.' },
        ]}
      />
    </DashboardLayout>
  )
}
