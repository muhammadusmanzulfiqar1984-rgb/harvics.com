'use client'

import HarvicsOSShell from '@/components/shared/HarvicsOSShell'
import HRModuleTwentyNine from '@/components/os-domains/HRModuleTwentyNine'

/** Module #29 — HR Core & Payroll */
export default function HROSPage() {
  return (
    <HarvicsOSShell
      title="HR Core & Payroll"
      subtitle="Module #29 — SAP+ people · leave · attendance · payroll"
      activeDomain="hr"
      breadcrumbs={[
        { label: 'OS', href: '/os' },
        { label: 'HR' },
      ]}
    >
      <HRModuleTwentyNine />
    </HarvicsOSShell>
  )
}
