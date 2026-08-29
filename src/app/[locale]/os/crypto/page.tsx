'use client'

import HarvicsOSShell from '@/components/shared/HarvicsOSShell'
import UniverseModuleSixtyFive from '@/components/os-domains/UniverseModuleSixtyFive'

/** #crypto */
export default function Page() {
  return (
    <HarvicsOSShell
      title="Crypto Lite"
      subtitle="Module #65 — SAP+ workspace"
      activeDomain="crypto"
      breadcrumbs={[
        { label: 'OS', href: '/os' },
        { label: 'Crypto Lite' },
      ]}
    >
      <UniverseModuleSixtyFive />
    </HarvicsOSShell>
  )
}
