'use client'

import HarvicsOSShell from '@/components/shared/HarvicsOSShell'
import ThreePLModuleTwentyEight from '@/components/os-domains/ThreePLModuleTwentyEight'

/** Module #28 — 3PL Integration */
export default function ThreePLPage() {
  return (
    <HarvicsOSShell
      title="3PL Integration"
      subtitle="Module #28 — SAP+ partners · EDI/webhook ledger"
      activeDomain="logistics"
      breadcrumbs={[
        { label: 'OS', href: '/os' },
        { label: '3PL' },
      ]}
    >
      <ThreePLModuleTwentyEight />
    </HarvicsOSShell>
  )
}
