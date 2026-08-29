'use client'

import HarvicsOSShell from '@/components/shared/HarvicsOSShell'
import ShippingModuleTwentySix from '@/components/os-domains/ShippingModuleTwentySix'

/** Module #26 — Shipping & freight */
export default function ShippingTradeOSPage() {
  return (
    <HarvicsOSShell
      title="Shipping & Freight"
      subtitle="Module #26 — SAP+ shipments · track · book"
      activeDomain="shipping"
      breadcrumbs={[
        { label: 'OS', href: '/os' },
        { label: 'Shipping' },
      ]}
    >
      <ShippingModuleTwentySix />
    </HarvicsOSShell>
  )
}
