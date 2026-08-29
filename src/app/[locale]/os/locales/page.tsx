'use client'

import HarvicsOSShell from '@/components/shared/HarvicsOSShell'
import DataAIModuleFiftyEight from '@/components/os-domains/DataAIModuleFiftyEight'

/** #locales */
export default function Page() {
  return (
    <HarvicsOSShell
      title="Globalisation"
      subtitle="Module #58 — SAP+ workspace"
      activeDomain="locales"
      breadcrumbs={[
        { label: 'OS', href: '/os' },
        { label: 'Globalisation' },
      ]}
    >
      <DataAIModuleFiftyEight />
    </HarvicsOSShell>
  )
}
