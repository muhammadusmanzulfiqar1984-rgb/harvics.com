'use client'

import HarvicsOSShell from '@/components/shared/HarvicsOSShell'
import AnalyticsModuleFortySix from '@/components/os-domains/AnalyticsModuleFortySix'

/** Module #46 — Service Management */
export default function ServiceTicketsOSPage() {
  return (
    <HarvicsOSShell
      title="Service Management"
      subtitle="Module #46 — SAP+ workspace"
      activeDomain="tickets"
      breadcrumbs={[
        { label: 'OS', href: '/os' },
        { label: 'Service Tickets' },
      ]}
    >
      <AnalyticsModuleFortySix />
    </HarvicsOSShell>
  )
}
