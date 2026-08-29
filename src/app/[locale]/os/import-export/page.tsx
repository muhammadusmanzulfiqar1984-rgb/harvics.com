'use client'

import HarvicsOSShell from '@/components/shared/HarvicsOSShell'
import TradeModuleTwentySeven from '@/components/os-domains/TradeModuleTwentySeven'

/** Module #27 — Trade & customs (HS codes) */
export default function ImportExportOSPage() {
  return (
    <HarvicsOSShell
      title="Trade & Customs"
      subtitle="Module #27 — SAP+ HS codes · duty · customs"
      activeDomain="import-export"
      breadcrumbs={[
        { label: 'OS', href: '/os' },
        { label: 'Import / Export' },
      ]}
    >
      <TradeModuleTwentySeven />
    </HarvicsOSShell>
  )
}
