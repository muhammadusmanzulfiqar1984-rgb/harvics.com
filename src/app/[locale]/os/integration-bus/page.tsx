'use client'

import HarvicsOSShell from '@/components/shared/HarvicsOSShell'
import PlatformModuleFiftyFour from '@/components/os-domains/PlatformModuleFiftyFour'

/** #54 Integration Bus */
export default function Page() {
  return (
    <HarvicsOSShell
      title="Integration Bus"
      subtitle="Module #54 — SAP+ workspace"
      activeDomain="bus"
      breadcrumbs={[
        { label: 'OS', href: '/os' },
        { label: 'Integration Bus' },
      ]}
    >
      <PlatformModuleFiftyFour />
    </HarvicsOSShell>
  )
}
