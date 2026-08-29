'use client'

import HarvicsOSShell from '@/components/shared/HarvicsOSShell'
import DataAIModuleFiftyFive from '@/components/os-domains/DataAIModuleFiftyFive'

/** #data-ocean */
export default function Page() {
  return (
    <HarvicsOSShell
      title="Data Ocean"
      subtitle="Module #55 — SAP+ workspace"
      activeDomain="data-ocean"
      breadcrumbs={[
        { label: 'OS', href: '/os' },
        { label: 'Data Ocean' },
      ]}
    >
      <DataAIModuleFiftyFive />
    </HarvicsOSShell>
  )
}
