'use client'

import CrmModuleEight from '@/components/os-domains/CrmModuleEight'
import HarvicsOSShell from '@/components/shared/HarvicsOSShell'

/** Module #8 CRM workspace — Smart CRM remains at /os/crm/smart */
export default function CRMOSPage() {
  return (
    <HarvicsOSShell
      title="CRM + Sales"
      subtitle="Module #8 — leads, pipeline, customers, activity"
      activeDomain="crm"
      breadcrumbs={[
        { label: 'OS', href: '/os' },
        { label: 'CRM' },
      ]}
    >
      <CrmModuleEight />
    </HarvicsOSShell>
  )
}
