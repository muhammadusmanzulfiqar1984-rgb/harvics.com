'use client'

import HarvicsOSShell from '@/components/shared/HarvicsOSShell'
import PlatformModuleFifty from '@/components/os-domains/PlatformModuleFifty'

/** #50 Audit Log */
export default function Page() {
  return (
    <HarvicsOSShell
      title="Audit Log"
      subtitle="Module #50 — SAP+ workspace"
      activeDomain="audit-log"
      breadcrumbs={[
        { label: 'OS', href: '/os' },
        { label: 'Audit Log' },
      ]}
    >
      <PlatformModuleFifty />
    </HarvicsOSShell>
  )
}
