'use client'

import HarvicsOSShell from '@/components/shared/HarvicsOSShell'
import GovernanceModuleForty from '@/components/os-domains/GovernanceModuleForty'

/** Module #40 — Neural Governance */
export default function GovernanceOSPage() {
  return (
    <HarvicsOSShell
      title="Neural Governance"
      subtitle="Module #40 — SAP+ policies · decisions · enable/disable"
      activeDomain="governance"
      breadcrumbs={[
        { label: 'OS', href: '/os' },
        { label: 'Governance' },
      ]}
    >
      <GovernanceModuleForty />
    </HarvicsOSShell>
  )
}
