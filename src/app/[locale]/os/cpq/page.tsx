'use client'

import CommercialModuleNineCPQ from '@/components/os-domains/CommercialModuleNineCPQ'
import HarvicsOSShell from '@/components/shared/HarvicsOSShell'

/** Module #9 CPQ — configure, price, quote */
export default function CpqPage() {
  return (
    <HarvicsOSShell
      title="CPQ Engine"
      subtitle="Module #9 — SAP+ quotes · tax · accept → SO + AR"
      activeDomain="cpq"
      breadcrumbs={[
        { label: 'OS', href: '/os' },
        { label: 'CRM', href: '/os/crm' },
        { label: 'CPQ' },
      ]}
    >
      <CommercialModuleNineCPQ />
    </HarvicsOSShell>
  )
}
