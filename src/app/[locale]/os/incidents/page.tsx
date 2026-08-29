'use client'

import HarvicsOSShell from '@/components/shared/HarvicsOSShell'
import GRCModuleThirtySeven from '@/components/os-domains/GRCModuleThirtySeven'

/** Module #37 — GRC Incidents */
export default function IncidentsOSPage() {
  return (
    <HarvicsOSShell
      title="GRC Core — Incidents"
      subtitle="Module #37 — SAP+ Open→Resolved→Closed"
      activeDomain="legal"
      breadcrumbs={[
        { label: 'OS', href: '/os' },
        { label: 'Incidents' },
      ]}
    >
      <GRCModuleThirtySeven />
    </HarvicsOSShell>
  )
}
