'use client'

import ProcurementModuleFifteen from '@/components/os-domains/ProcurementModuleFifteen'
import HarvicsOSShell from '@/components/shared/HarvicsOSShell'

/** Module #15 — Contract lifecycle */
export default function ContractsPage() {
  return (
    <HarvicsOSShell
      title="Contract Lifecycle"
      subtitle="Module #15 — draft, sign, expiry watch"
      activeDomain="contracts"
      breadcrumbs={[
        { label: 'OS', href: '/os' },
        { label: 'Procurement', href: '/os/rfq' },
        { label: 'Contracts' },
      ]}
    >
      <ProcurementModuleFifteen />
    </HarvicsOSShell>
  )
}
