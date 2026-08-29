'use client'

import HarvicsOSShell from '@/components/shared/HarvicsOSShell'
import LegalModuleThirtyNine from '@/components/os-domains/LegalModuleThirtyNine'

/** Module #39 — Legal & Compliance */
export default function LegalOSPage() {
  return (
    <HarvicsOSShell
      title="Legal & Compliance"
      subtitle="Module #39 — SAP+ cases · open→closed · IPR"
      activeDomain="legal"
      breadcrumbs={[
        { label: 'OS', href: '/os' },
        { label: 'Legal' },
      ]}
    >
      <LegalModuleThirtyNine />
    </HarvicsOSShell>
  )
}
