'use client'

import HarvicsOSShell from '@/components/shared/HarvicsOSShell'
import AnalyticsModuleFortyThree from '@/components/os-domains/AnalyticsModuleFortyThree'

/** Module #43 — OKR Tracking */
export default function OkrOSPage() {
  return (
    <HarvicsOSShell
      title="OKR Tracking"
      subtitle="Module #43 — SAP+ workspace"
      activeDomain="okr"
      breadcrumbs={[
        { label: 'OS', href: '/os' },
        { label: 'OKR' },
      ]}
    >
      <AnalyticsModuleFortyThree />
    </HarvicsOSShell>
  )
}
