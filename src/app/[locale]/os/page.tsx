'use client'

import HarvicsOSShell from '@/components/shared/HarvicsOSShell'
import OsCommandCenter from '@/components/os-domains/OsCommandCenter'

/**
 * OS home — extraordinary Command Center with live charts & indicators.
 */
export default function OSIndexPage() {
  return (
    <HarvicsOSShell
      title="Command Center"
      subtitle="Live enterprise pulse · charts · indicators"
      activeDomain="overview"
      breadcrumbs={[{ label: 'OS' }, { label: 'Command' }]}
    >
      <OsCommandCenter />
    </HarvicsOSShell>
  )
}
