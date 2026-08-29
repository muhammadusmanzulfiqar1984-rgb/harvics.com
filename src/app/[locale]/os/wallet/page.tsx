'use client'

import HarvicsOSShell from '@/components/shared/HarvicsOSShell'
import WalletModulePanel from '@/components/os-domains/WalletModulePanel'

/** Module #66 — Harvicoins Wallet */
export default function Page() {
  return (
    <HarvicsOSShell
      title="Harvicoins Wallet"
      subtitle="Module #66 — SAP+ workspace"
      activeDomain="wallet"
      breadcrumbs={[{ label: 'OS', href: '/os' }, { label: 'Harvicoins' }]}
    >
      <WalletModulePanel segment="harvicoins" />
    </HarvicsOSShell>
  )
}
