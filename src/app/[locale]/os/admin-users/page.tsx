'use client'

import HarvicsOSShell from '@/components/shared/HarvicsOSShell'
import PlatformModuleFiftyThree from '@/components/os-domains/PlatformModuleFiftyThree'

/** #53 Admin & Security */
export default function Page() {
  return (
    <HarvicsOSShell
      title="Admin & Security"
      subtitle="Module #53 — SAP+ workspace"
      activeDomain="admin-users"
      breadcrumbs={[
        { label: 'OS', href: '/os' },
        { label: 'Admin' },
      ]}
    >
      <PlatformModuleFiftyThree />
    </HarvicsOSShell>
  )
}
