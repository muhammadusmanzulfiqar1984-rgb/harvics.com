'use client'

import HarvicsOSShell from '@/components/shared/HarvicsOSShell'
import AnalyticsModuleFortySeven from '@/components/os-domains/AnalyticsModuleFortySeven'

/** Module #47 — Professional Services */
export default function ProfessionalServicesOSPage() {
  return (
    <HarvicsOSShell
      title="Professional Services"
      subtitle="Module #47 — SAP+ workspace"
      activeDomain="projects"
      breadcrumbs={[
        { label: 'OS', href: '/os' },
        { label: 'Professional Services' },
      ]}
    >
      <AnalyticsModuleFortySeven />
    </HarvicsOSShell>
  )
}
