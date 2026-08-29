'use client'

import HarvicsOSShell from '@/components/shared/HarvicsOSShell'
import AnalyticsModuleFortyTwo from '@/components/os-domains/AnalyticsModuleFortyTwo'

/** Module #42 — Board Pack Generator */
export default function BoardPackOSPage() {
  return (
    <HarvicsOSShell
      title="Board Pack Generator"
      subtitle="Module #42 — SAP+ workspace"
      activeDomain="board"
      breadcrumbs={[
        { label: 'OS', href: '/os' },
        { label: 'Board Pack' },
      ]}
    >
      <AnalyticsModuleFortyTwo />
    </HarvicsOSShell>
  )
}
