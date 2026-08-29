'use client'

import HarvicsOSShell from '@/components/shared/HarvicsOSShell'
import TalentModuleThirty from '@/components/os-domains/TalentModuleThirty'

/** Module #30 — Talent */
export default function TalentOSPage() {
  return (
    <HarvicsOSShell
      title="Talent Acquisition"
      subtitle="Module #30 — SAP+ postings · pipeline · Open→Filled"
      activeDomain="talent"
      breadcrumbs={[
        { label: 'OS', href: '/os' },
        { label: 'Talent' },
      ]}
    >
      <TalentModuleThirty />
    </HarvicsOSShell>
  )
}
