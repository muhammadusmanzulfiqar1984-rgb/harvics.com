'use client'

import HarvicsOSShell from '@/components/shared/HarvicsOSShell'
import WarehouseModuleTwentyThree from '@/components/os-domains/WarehouseModuleTwentyThree'

/** Module #23 — Warehouses & bins */
export default function WarehousesOSPage() {
  return (
    <HarvicsOSShell
      title="Warehouse Management"
      subtitle="Module #23 — SAP+ warehouses · bins · putaway"
      activeDomain="inventory"
      breadcrumbs={[
        { label: 'OS', href: '/os' },
        { label: 'Warehouses' },
      ]}
    >
      <WarehouseModuleTwentyThree />
    </HarvicsOSShell>
  )
}
