'use client'

import HarvicsOSShell from '@/components/shared/HarvicsOSShell'
import PlatformModuleFiftyTwo from '@/components/os-domains/PlatformModuleFiftyTwo'

/** #52 Document Vault */
export default function Page() {
  return (
    <HarvicsOSShell
      title="Document Vault"
      subtitle="Module #52 — SAP+ workspace"
      activeDomain="document-vault"
      breadcrumbs={[
        { label: 'OS', href: '/os' },
        { label: 'Document Vault' },
      ]}
    >
      <PlatformModuleFiftyTwo />
    </HarvicsOSShell>
  )
}
