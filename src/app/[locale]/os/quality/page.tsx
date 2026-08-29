'use client'

import HarvicsOSShell from '@/components/shared/HarvicsOSShell'
import QualityModuleTwenty from '@/components/os-domains/QualityModuleTwenty'

/** Module #20 — Quality checks & NCRs */
export default function QualityOSPage() {
  return (
    <HarvicsOSShell
      title="Quality Management"
      subtitle="Module #20 — checks & NCRs"
      activeDomain="quality"
      breadcrumbs={[
        { label: 'OS', href: '/os' },
        { label: 'Quality' },
      ]}
    >
      <QualityModuleTwenty />
    </HarvicsOSShell>
  )
}
