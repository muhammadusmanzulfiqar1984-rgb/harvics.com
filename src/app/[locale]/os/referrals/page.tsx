'use client'

import HarvicsOSShell from '@/components/shared/HarvicsOSShell'
import UniverseModuleSixtyEight from '@/components/os-domains/UniverseModuleSixtyEight'

/** #referrals */
export default function Page() {
  return (
    <HarvicsOSShell
      title="Referral Program"
      subtitle="Module #68 — SAP+ workspace"
      activeDomain="referrals"
      breadcrumbs={[
        { label: 'OS', href: '/os' },
        { label: 'Referral Program' },
      ]}
    >
      <UniverseModuleSixtyEight />
    </HarvicsOSShell>
  )
}
