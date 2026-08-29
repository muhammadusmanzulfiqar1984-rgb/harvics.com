'use client'

import HarvicsOSShell from '@/components/shared/HarvicsOSShell'
import DataAIModuleFiftySeven from '@/components/os-domains/DataAIModuleFiftySeven'

/** #harvoice */
export default function Page() {
  return (
    <HarvicsOSShell
      title="Harvoice"
      subtitle="Module #57 — SAP+ workspace"
      activeDomain="harvoice"
      breadcrumbs={[
        { label: 'OS', href: '/os' },
        { label: 'Harvoice' },
      ]}
    >
      <DataAIModuleFiftySeven />
    </HarvicsOSShell>
  )
}
