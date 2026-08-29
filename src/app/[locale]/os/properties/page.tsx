'use client'

import HarvicsOSShell from '@/components/shared/HarvicsOSShell'
import PropertiesModuleThirtySix from '@/components/os-domains/PropertiesModuleThirtySix'

/** Module #36 — Properties */
export default function PropertiesOSPage() {
  return (
    <HarvicsOSShell
      title="Real Estate & Facilities"
      subtitle="Module #36 — SAP+ portfolio · occupancy · status"
      activeDomain="inventory"
      breadcrumbs={[
        { label: 'OS', href: '/os' },
        { label: 'Properties' },
      ]}
    >
      <PropertiesModuleThirtySix />
    </HarvicsOSShell>
  )
}
