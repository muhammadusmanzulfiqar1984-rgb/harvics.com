'use client'

import ProcurementModuleThirteen from '@/components/os-domains/ProcurementModuleThirteen'
import HarvicsOSShell from '@/components/shared/HarvicsOSShell'

/** Module #13 — RFQ workflow */
export default function RfqPage() {
  return (
    <HarvicsOSShell
      title="RFQ Workflow"
      subtitle="Module #13 — draft, open, award"
      activeDomain="procurement"
      breadcrumbs={[
        { label: 'OS', href: '/os' },
        { label: 'Procurement', href: '/os/supplier-procurement' },
        { label: 'RFQs' },
      ]}
    >
      <ProcurementModuleThirteen />
    </HarvicsOSShell>
  )
}
