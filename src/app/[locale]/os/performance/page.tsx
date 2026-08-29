'use client'

import HarvicsOSShell from '@/components/shared/HarvicsOSShell'
import PerformanceModuleThirtyTwo from '@/components/os-domains/PerformanceModuleThirtyTwo'

/** Module #32 — Performance */
export default function PerformanceOSPage() {
  return (
    <HarvicsOSShell
      title="Performance & Succession"
      subtitle="Module #32 — SAP+ reviews · 9-box · Draft→Closed"
      activeDomain="hr"
      breadcrumbs={[
        { label: 'OS', href: '/os' },
        { label: 'Performance' },
      ]}
    >
      <PerformanceModuleThirtyTwo />
    </HarvicsOSShell>
  )
}
