'use client'

import HarvicsOSShell from '@/components/shared/HarvicsOSShell'
import UniverseModuleSixtyThree from '@/components/os-domains/UniverseModuleSixtyThree'

/** #mentorship */
export default function Page() {
  return (
    <HarvicsOSShell
      title="Mentorship & Experts"
      subtitle="Module #63 — SAP+ workspace"
      activeDomain="mentorship"
      breadcrumbs={[
        { label: 'OS', href: '/os' },
        { label: 'Mentorship & Experts' },
      ]}
    >
      <UniverseModuleSixtyThree />
    </HarvicsOSShell>
  )
}
