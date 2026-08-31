'use client'

import { useLocale } from 'next-intl'
import HarvicsOSShell from '@/components/shared/HarvicsOSShell'
import FinanceGlobalHouse from '@/components/os-domains/FinanceGlobalHouse'

export default function GlobalHousePage() {
  const locale = useLocale()

  return (
    <HarvicsOSShell
      title="Global House"
      subtitle="Multi-subsidiary · intercompany · group consolidation"
      activeDomain="finance"
      breadcrumbs={[
        { label: 'OS', href: '/os' },
        { label: 'Finance', href: '/os/finance' },
        { label: 'Global House' },
      ]}
    >
      <FinanceGlobalHouse locale={locale} />
    </HarvicsOSShell>
  )
}
