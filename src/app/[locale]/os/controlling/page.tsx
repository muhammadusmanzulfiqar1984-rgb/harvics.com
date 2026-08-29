'use client'

import FinanceModuleTwoControlling from '@/components/os-domains/FinanceModuleTwoControlling'
import HarvicsOSShell from '@/components/shared/HarvicsOSShell'

/** Standalone Module #2 Controlling — same workspace as Finance → Module #2. */
export default function ControllingPage() {
  return (
    <HarvicsOSShell
      title="Controlling"
      subtitle="Module #2 — cost centers, plan vs actual, variance"
      activeDomain="controlling"
      breadcrumbs={[
        { label: 'OS', href: '/os' },
        { label: 'Finance', href: '/os/finance' },
        { label: 'Controlling' },
      ]}
    >
      <FinanceModuleTwoControlling />
    </HarvicsOSShell>
  )
}
