'use client'

import HarvicsOSShell from '@/components/shared/HarvicsOSShell'
import AnalyticsModuleFortyFour from '@/components/os-domains/AnalyticsModuleFortyFour'

/** Module #44 — AI Variance Commentary */
export default function VarianceAiOSPage() {
  return (
    <HarvicsOSShell
      title="AI Variance Commentary"
      subtitle="Module #44 — SAP+ workspace"
      activeDomain="budgets"
      breadcrumbs={[
        { label: 'OS', href: '/os' },
        { label: 'Variance AI' },
      ]}
    >
      <AnalyticsModuleFortyFour />
    </HarvicsOSShell>
  )
}
