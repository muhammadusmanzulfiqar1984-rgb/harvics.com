'use client'

import HarvicsOSShell from '@/components/shared/HarvicsOSShell'
import PlantMaintenanceModuleThirtyFive from '@/components/os-domains/PlantMaintenanceModuleThirtyFive'

/** Module #35 — Plant Maintenance */
export default function PlantMaintenanceOSPage() {
  return (
    <HarvicsOSShell
      title="Plant Maintenance"
      subtitle="Module #35 — SAP+ work orders · Open→Completed"
      activeDomain="inventory"
      breadcrumbs={[
        { label: 'OS', href: '/os' },
        { label: 'Plant Maintenance' },
      ]}
    >
      <PlantMaintenanceModuleThirtyFive />
    </HarvicsOSShell>
  )
}
