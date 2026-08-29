'use client'

import ManufacturingModuleNineteen from '@/components/os-domains/ManufacturingModuleNineteen'
import HarvicsOSShell from '@/components/shared/HarvicsOSShell'

/** Module #19 — Bill of Materials */
export default function BomPage() {
  return (
    <HarvicsOSShell
      title="Bill of Materials"
      subtitle="Module #19 — multi-level BOM & cost rollup"
      activeDomain="manufacturing"
      breadcrumbs={[
        { label: 'OS', href: '/os' },
        { label: 'Manufacturing', href: '/os/manufacturing' },
        { label: 'BOM' },
      ]}
    >
      <ManufacturingModuleNineteen />
    </HarvicsOSShell>
  )
}
