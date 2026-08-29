'use client'

import HarvicsOSShell from '@/components/shared/HarvicsOSShell'
import WorkforceModuleThirtyThree from '@/components/os-domains/WorkforceModuleThirtyThree'

/** Module #33 — Workforce */
export default function WorkforceOSPage() {
  return (
    <HarvicsOSShell
      title="Workforce Planning"
      subtitle="Module #33 — SAP+ headcount · attrition → hire need"
      activeDomain="hr"
      breadcrumbs={[
        { label: 'OS', href: '/os' },
        { label: 'Workforce' },
      ]}
    >
      <WorkforceModuleThirtyThree />
    </HarvicsOSShell>
  )
}
