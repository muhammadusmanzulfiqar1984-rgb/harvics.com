'use client'

import HarvicsOSShell from '@/components/shared/HarvicsOSShell'
import FleetModuleTwentyFive from '@/components/os-domains/FleetModuleTwentyFive'

/** Module #25 — Fleet Management */
export default function FleetPage() {
  return (
    <HarvicsOSShell
      title="Fleet Management"
      subtitle="Module #25 — SAP+ vehicles · trips · route opt"
      activeDomain="fleet"
      breadcrumbs={[
        { label: 'OS', href: '/os' },
        { label: 'Fleet' },
      ]}
    >
      <FleetModuleTwentyFive />
    </HarvicsOSShell>
  )
}
