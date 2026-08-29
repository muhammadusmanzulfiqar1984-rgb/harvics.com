'use client'

import HarvicsOSShell from '@/components/shared/HarvicsOSShell'
import UniverseModuleSixtyTwo from '@/components/os-domains/UniverseModuleSixtyTwo'

/** #events */
export default function Page() {
  return (
    <HarvicsOSShell
      title="Events & Engagement"
      subtitle="Module #62 — SAP+ workspace"
      activeDomain="events"
      breadcrumbs={[
        { label: 'OS', href: '/os' },
        { label: 'Events & Engagement' },
      ]}
    >
      <UniverseModuleSixtyTwo />
    </HarvicsOSShell>
  )
}
