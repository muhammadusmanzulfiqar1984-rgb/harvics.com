'use client'

import HarvicsOSShell from '@/components/shared/HarvicsOSShell'
import PortalsModulePanel from '@/components/os-domains/PortalsModulePanel'

/** Module #71 — Field Officer Portal */
export default function Page() {
  return (
    <HarvicsOSShell
      title="Field Officer Portal"
      subtitle="Module #71 — SAP+ workspace"
      activeDomain="portal-field"
      breadcrumbs={[{ label: 'OS', href: '/os' }, { label: 'Field Officer Portal' }]}
    >
      <PortalsModulePanel portalType="field" />
    </HarvicsOSShell>
  )
}
