'use client'

import HarvicsOSShell from '@/components/shared/HarvicsOSShell'
import PlatformModuleFortyNine from '@/components/os-domains/PlatformModuleFortyNine'

/** #49 FX Engine */
export default function Page() {
  return (
    <HarvicsOSShell
      title="FX Engine"
      subtitle="Module #49 — SAP+ workspace"
      activeDomain="fx-engine"
      breadcrumbs={[
        { label: 'OS', href: '/os' },
        { label: 'FX Engine' },
      ]}
    >
      <PlatformModuleFortyNine />
    </HarvicsOSShell>
  )
}
