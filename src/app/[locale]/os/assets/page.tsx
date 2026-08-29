'use client'

import HarvicsOSShell from '@/components/shared/HarvicsOSShell'
import AssetsModuleThirtyFour from '@/components/os-domains/AssetsModuleThirtyFour'

/** Module #34 — Fixed Assets */
export default function AssetsOSPage() {
  return (
    <HarvicsOSShell
      title="Fixed Assets"
      subtitle="Module #34 — SAP+ register · maintenance · retire"
      activeDomain="inventory"
      breadcrumbs={[
        { label: 'OS', href: '/os' },
        { label: 'Assets' },
      ]}
    >
      <AssetsModuleThirtyFour />
    </HarvicsOSShell>
  )
}
