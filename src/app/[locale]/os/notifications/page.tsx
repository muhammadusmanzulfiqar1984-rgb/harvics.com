'use client'

import HarvicsOSShell from '@/components/shared/HarvicsOSShell'
import PlatformModuleFiftyOne from '@/components/os-domains/PlatformModuleFiftyOne'

/** #51 Notifications */
export default function Page() {
  return (
    <HarvicsOSShell
      title="Notifications"
      subtitle="Module #51 — SAP+ workspace"
      activeDomain="notifications"
      breadcrumbs={[
        { label: 'OS', href: '/os' },
        { label: 'Notifications' },
      ]}
    >
      <PlatformModuleFiftyOne />
    </HarvicsOSShell>
  )
}
