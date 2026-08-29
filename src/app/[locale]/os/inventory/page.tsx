'use client'

import HarvicsOSShell from '@/components/shared/HarvicsOSShell'
import InventoryModuleTwentyTwo from '@/components/os-domains/InventoryModuleTwentyTwo'

/** Module #22 — Inventory cycle counts & ABC */
export default function InventoryOSPage() {
  return (
    <HarvicsOSShell
      title="Inventory Management"
      subtitle="Module #22 — SAP+ cycle counts · ABC · stock"
      activeDomain="inventory"
      breadcrumbs={[
        { label: 'OS', href: '/os' },
        { label: 'Inventory' },
      ]}
    >
      <InventoryModuleTwentyTwo />
    </HarvicsOSShell>
  )
}
