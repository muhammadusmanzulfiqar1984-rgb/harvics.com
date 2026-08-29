'use client'

import HarvicsOSShell from '@/components/shared/HarvicsOSShell'
import DemandModuleTwentyFour from '@/components/os-domains/DemandModuleTwentyFour'

/** Module #24 — Demand Planning */
export default function DemandPlanningPage() {
  return (
    <HarvicsOSShell
      title="Demand Planning"
      subtitle="Module #24 — SAP+ history · moving-average forecast"
      activeDomain="inventory"
      breadcrumbs={[
        { label: 'OS', href: '/os' },
        { label: 'Demand Planning' },
      ]}
    >
      <DemandModuleTwentyFour />
    </HarvicsOSShell>
  )
}
