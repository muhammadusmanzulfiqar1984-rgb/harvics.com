'use client'

import HarvicsOSShell from '@/components/shared/HarvicsOSShell'
import DataAIModuleFiftySix from '@/components/os-domains/DataAIModuleFiftySix'

/** #ai-engine */
export default function Page() {
  return (
    <HarvicsOSShell
      title="AI Engine"
      subtitle="Module #56 — SAP+ workspace"
      activeDomain="ai-engine"
      breadcrumbs={[
        { label: 'OS', href: '/os' },
        { label: 'AI Engine' },
      ]}
    >
      <DataAIModuleFiftySix />
    </HarvicsOSShell>
  )
}
