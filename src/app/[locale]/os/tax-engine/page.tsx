'use client'

import HarvicsOSShell from '@/components/shared/HarvicsOSShell'
import PlatformModuleFortyEight from '@/components/os-domains/PlatformModuleFortyEight'

/** #48 Tax Engine */
export default function Page() {
  return (
    <HarvicsOSShell
      title="Tax Engine"
      subtitle="Module #48 — SAP+ workspace"
      activeDomain="tax-engine"
      breadcrumbs={[
        { label: 'OS', href: '/os' },
        { label: 'Tax Engine' },
      ]}
    >
      <PlatformModuleFortyEight />
    </HarvicsOSShell>
  )
}
