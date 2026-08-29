'use client'

import HarvicsOSShell from '@/components/shared/HarvicsOSShell'
import HRModuleTwentyNine from '@/components/os-domains/HRModuleTwentyNine'

/** Module #29 — leave & attendance (alias of /os/hr) */
export default function HrLeaveOSPage() {
  return (
    <HarvicsOSShell
      title="HR Leave & Attendance"
      subtitle="Module #29 — leave workflow & daily log"
      activeDomain="hr"
      breadcrumbs={[
        { label: 'OS', href: '/os' },
        { label: 'HR', href: '/os/hr' },
        { label: 'Leave' },
      ]}
    >
      <HRModuleTwentyNine />
    </HarvicsOSShell>
  )
}
