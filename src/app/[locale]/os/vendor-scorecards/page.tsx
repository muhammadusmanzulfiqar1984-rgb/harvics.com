'use client'

import ProcurementModuleFourteen from '@/components/os-domains/ProcurementModuleFourteen'
import HarvicsOSShell from '@/components/shared/HarvicsOSShell'

/** Module #14 — Vendor scorecards */
export default function VendorScorecardsPage() {
  return (
    <HarvicsOSShell
      title="Vendor Scorecards"
      subtitle="Module #14 — on-time, quality, price, response"
      activeDomain="procurement"
      breadcrumbs={[
        { label: 'OS', href: '/os' },
        { label: 'Procurement', href: '/os/rfq' },
        { label: 'Scorecards' },
      ]}
    >
      <ProcurementModuleFourteen />
    </HarvicsOSShell>
  )
}
