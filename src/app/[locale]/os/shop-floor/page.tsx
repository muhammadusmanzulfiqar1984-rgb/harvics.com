'use client'

import ManufacturingModuleEighteen from '@/components/os-domains/ManufacturingModuleEighteen'
import HarvicsOSShell from '@/components/shared/HarvicsOSShell'

/** Module #18 — Shop Floor Control */
export default function ShopFloorPage() {
  return (
    <HarvicsOSShell
      title="Shop Floor Control"
      subtitle="Module #18 — operations queue & scrap tracking"
      activeDomain="manufacturing"
      breadcrumbs={[
        { label: 'OS', href: '/os' },
        { label: 'Manufacturing', href: '/os/manufacturing' },
        { label: 'Shop Floor' },
      ]}
    >
      <ManufacturingModuleEighteen />
    </HarvicsOSShell>
  )
}
