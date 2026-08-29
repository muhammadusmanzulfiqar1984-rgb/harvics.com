'use client'

import HarvicsOSShell from '@/components/shared/HarvicsOSShell'
import LMSModuleThirtyOne from '@/components/os-domains/LMSModuleThirtyOne'

/** Module #31 — LMS */
export default function LmsOSPage() {
  return (
    <HarvicsOSShell
      title="Learning Management"
      subtitle="Module #31 — SAP+ courses · enroll · pass/fail"
      activeDomain="hr"
      breadcrumbs={[
        { label: 'OS', href: '/os' },
        { label: 'LMS' },
      ]}
    >
      <LMSModuleThirtyOne />
    </HarvicsOSShell>
  )
}
