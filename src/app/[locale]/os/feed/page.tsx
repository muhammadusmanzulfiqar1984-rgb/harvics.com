'use client'

import HarvicsOSShell from '@/components/shared/HarvicsOSShell'
import UniverseModuleFiftyNine from '@/components/os-domains/UniverseModuleFiftyNine'

/** #feed */
export default function Page() {
  return (
    <HarvicsOSShell
      title="Social Feed"
      subtitle="Module #59 — SAP+ workspace"
      activeDomain="feed"
      breadcrumbs={[
        { label: 'OS', href: '/os' },
        { label: 'Social Feed' },
      ]}
    >
      <UniverseModuleFiftyNine />
    </HarvicsOSShell>
  )
}
