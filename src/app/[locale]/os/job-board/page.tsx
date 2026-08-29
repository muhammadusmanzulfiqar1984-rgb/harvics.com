'use client'

import HarvicsOSShell from '@/components/shared/HarvicsOSShell'
import UniverseModuleSixtyFour from '@/components/os-domains/UniverseModuleSixtyFour'

/** #job-board */
export default function Page() {
  return (
    <HarvicsOSShell
      title="Public Job Board"
      subtitle="Module #64 — SAP+ workspace"
      activeDomain="job-board"
      breadcrumbs={[
        { label: 'OS', href: '/os' },
        { label: 'Public Job Board' },
      ]}
    >
      <UniverseModuleSixtyFour />
    </HarvicsOSShell>
  )
}
