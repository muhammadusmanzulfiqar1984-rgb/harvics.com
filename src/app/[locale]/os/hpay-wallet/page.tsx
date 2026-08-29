'use client'

import HarvicsOSShell from '@/components/shared/HarvicsOSShell'
import WalletModulePanel from '@/components/os-domains/WalletModulePanel'

/** Module #67 — HPay Wallet */
export default function Page() {
  return (
    <HarvicsOSShell
      title="HPay Wallet"
      subtitle="Module #67 — SAP+ workspace"
      activeDomain="hpay"
      breadcrumbs={[{ label: 'OS', href: '/os' }, { label: 'HPay Wallet' }]}
    >
      <WalletModulePanel segment="hpay" />
    </HarvicsOSShell>
  )
}
