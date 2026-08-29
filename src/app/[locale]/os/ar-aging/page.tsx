'use client'

import FinanceModuleThreeAR from '@/components/os-domains/FinanceModuleThreeAR'
import HarvicsOSShell from '@/components/shared/HarvicsOSShell'

/** Standalone Module #3 AR page — same workspace as Finance → Module #3. */
export default function ArAgingPage() {
  return (
    <HarvicsOSShell
      title="Accounts Receivable"
      subtitle="Module #3 — invoices, collections, aging"
      activeDomain="ar"
      breadcrumbs={[
        { label: 'OS', href: '/os' },
        { label: 'Finance', href: '/os/finance' },
        { label: 'AR' },
      ]}
    >
      <FinanceModuleThreeAR />
    </HarvicsOSShell>
  )
}
