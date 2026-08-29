'use client'

import HarvicsOSShell from '@/components/shared/HarvicsOSShell'
import UniverseModuleSixty from '@/components/os-domains/UniverseModuleSixty'

/** #marketplace */
export default function Page() {
  return (
    <HarvicsOSShell
      title="Marketplace"
      subtitle="Module #60 — SAP+ workspace"
      activeDomain="marketplace"
      breadcrumbs={[
        { label: 'OS', href: '/os' },
        { label: 'Marketplace' },
      ]}
    >
      <UniverseModuleSixty />
    </HarvicsOSShell>
  )
}
