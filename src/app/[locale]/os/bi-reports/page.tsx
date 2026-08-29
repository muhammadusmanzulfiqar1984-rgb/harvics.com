'use client'

import HarvicsOSShell from '@/components/shared/HarvicsOSShell'
import AnalyticsModuleFortyOne from '@/components/os-domains/AnalyticsModuleFortyOne'

/** Module #41 — BI & Reporting */
export default function BiReportsOSPage() {
  return (
    <HarvicsOSShell
      title="BI & Reporting"
      subtitle="Module #41 — SAP+ workspace"
      activeDomain="bi"
      breadcrumbs={[
        { label: 'OS', href: '/os' },
        { label: 'BI Reports' },
      ]}
    >
      <AnalyticsModuleFortyOne />
    </HarvicsOSShell>
  )
}
