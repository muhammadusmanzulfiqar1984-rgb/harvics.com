'use client'

import FinanceModuleFourAP from '@/components/os-domains/FinanceModuleFourAP'
import HarvicsOSShell from '@/components/shared/HarvicsOSShell'

/** Standalone Module #4 AP — same workspace as Finance → Module #4. */
export default function ApAgingPage() {
  return (
    <HarvicsOSShell
      title="Accounts Payable"
      subtitle="Module #4 — vendor bills, payments, aging"
      activeDomain="ap"
      breadcrumbs={[
        { label: 'OS', href: '/os' },
        { label: 'Finance', href: '/os/finance' },
        { label: 'AP' },
      ]}
    >
      <FinanceModuleFourAP />
    </HarvicsOSShell>
  )
}
