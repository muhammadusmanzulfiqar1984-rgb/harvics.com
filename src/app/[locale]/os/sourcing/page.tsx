'use client'

import ProcurementModuleSixteen from '@/components/os-domains/ProcurementModuleSixteen'
import HarvicsOSShell from '@/components/shared/HarvicsOSShell'

/** Module #16 — Sourcing network */
export default function SourcingPage() {
  return (
    <HarvicsOSShell
      title="Sourcing Network"
      subtitle="Module #16 — discover, review, qualify"
      activeDomain="sourcing"
      breadcrumbs={[
        { label: 'OS', href: '/os' },
        { label: 'Procurement', href: '/os/rfq' },
        { label: 'Sourcing' },
      ]}
    >
      <ProcurementModuleSixteen />
    </HarvicsOSShell>
  )
}
