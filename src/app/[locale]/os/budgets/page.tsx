'use client'

import FinanceModuleSevenPlanning from '@/components/os-domains/FinanceModuleSevenPlanning'
import HarvicsOSShell from '@/components/shared/HarvicsOSShell'

/** Standalone Module #7 Planning — same workspace as Finance → Module #7. */
export default function BudgetsPage() {
  return (
    <HarvicsOSShell
      title="Financial Planning"
      subtitle="Module #7 — budgets, variance, approve vs Controlling"
      activeDomain="budgets"
      breadcrumbs={[
        { label: 'OS', href: '/os' },
        { label: 'Finance', href: '/os/finance' },
        { label: 'Planning' },
      ]}
    >
      <FinanceModuleSevenPlanning />
    </HarvicsOSShell>
  )
}
