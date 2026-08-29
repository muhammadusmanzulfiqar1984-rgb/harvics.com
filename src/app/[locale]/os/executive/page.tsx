'use client'

import HarvicsOSShell from '@/components/shared/HarvicsOSShell'
import ExecutiveModuleSeventyTwo from '@/components/os-domains/ExecutiveModuleSeventyTwo'

/** Module #72 — Executive Intelligence */
export default function Page() {
  return (
    <HarvicsOSShell
      title="Executive Command"
      subtitle="Module #72 — SAP+ workspace"
      activeDomain="executive"
      breadcrumbs={[{ label: 'OS', href: '/os' }, { label: 'Executive' }]}
    >
      <ExecutiveModuleSeventyTwo />
    </HarvicsOSShell>
  )
}
