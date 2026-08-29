'use client'

import HarvicsOSShell from '@/components/shared/HarvicsOSShell'
import PortalsModulePanel from '@/components/os-domains/PortalsModulePanel'

/** Module #70 — Vendor Portal */
export default function Page() {
  return (
    <HarvicsOSShell
      title="Vendor Portal"
      subtitle="Module #70 — SAP+ workspace"
      activeDomain="portal-vendor"
      breadcrumbs={[{ label: 'OS', href: '/os' }, { label: 'Vendor Portal' }]}
    >
      <PortalsModulePanel portalType="vendor" />
    </HarvicsOSShell>
  )
}
