'use client'

import FinanceModuleFiveTreasury from '@/components/os-domains/FinanceModuleFiveTreasury'
import HarvicsOSShell from '@/components/shared/HarvicsOSShell'

/** Module #5 Treasury & Risk — bank accounts, cash, FX. */
export default function TreasuryBankingOSPage() {
  return (
    <HarvicsOSShell
      title="Treasury & Risk"
      subtitle="Module #5 — bank accounts, transfers, positions & risk"
      activeDomain="treasury"
      breadcrumbs={[
        { label: 'OS', href: '/os' },
        { label: 'Finance', href: '/os/finance' },
        { label: 'Treasury' },
      ]}
    >
      <FinanceModuleFiveTreasury />
    </HarvicsOSShell>
  )
}
