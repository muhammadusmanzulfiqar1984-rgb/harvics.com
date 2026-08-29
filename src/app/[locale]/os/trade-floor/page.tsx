'use client'

import HarvicsOSShell from '@/components/shared/HarvicsOSShell'
import UniverseModuleSixtyOne from '@/components/os-domains/UniverseModuleSixtyOne'

/** #trade-floor */
export default function Page() {
  return (
    <HarvicsOSShell
      title="Trade Floor"
      subtitle="Module #61 — SAP+ workspace"
      activeDomain="trade-floor"
      breadcrumbs={[
        { label: 'OS', href: '/os' },
        { label: 'Trade Floor' },
      ]}
    >
      <UniverseModuleSixtyOne />
    </HarvicsOSShell>
  )
}
