'use client'

import HarvicsOSShell from '@/components/shared/HarvicsOSShell'
import PortalsModulePanel from '@/components/os-domains/PortalsModulePanel'

/** Module #69 — Customer Portal */
export default function Page() {
  return (
    <HarvicsOSShell
      title="Customer Portal"
      subtitle="Module #69 — SAP+ workspace"
      activeDomain="portal-customer"
      breadcrumbs={[{ label: 'OS', href: '/os' }, { label: 'Customer Portal' }]}
    >
      <PortalsModulePanel portalType="customer" />
    </HarvicsOSShell>
  )
}
