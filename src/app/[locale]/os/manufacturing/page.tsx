'use client'

import HarvicsOSShell from '@/components/shared/HarvicsOSShell'
import ManufacturingModuleSeventeen from '@/components/os-domains/ManufacturingModuleSeventeen'

/** Module #17 — Production planning & work orders */
export default function ManufacturingOSPage() {
  return (
    <HarvicsOSShell
      title="Manufacturing OS"
      subtitle="Module #17 — Production planning & work orders"
      activeDomain="manufacturing"
      breadcrumbs={[
        { label: 'OS', href: '/os' },
        { label: 'Manufacturing' },
      ]}
    >
      <ManufacturingModuleSeventeen />
    </HarvicsOSShell>
  )
}
