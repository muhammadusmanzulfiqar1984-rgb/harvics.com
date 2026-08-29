'use client'

import CommercialModuleTwelveDistributor from '@/components/os-domains/CommercialModuleTwelveDistributor'
import HarvicsOSShell from '@/components/shared/HarvicsOSShell'

export default function DistributorHqPage() {
  return (
    <HarvicsOSShell
      title="Distributor Portal"
      subtitle="Module #12 — SAP+ accounts · replenishment · fulfillment"
      activeDomain="distributor"
      breadcrumbs={[
        { label: 'OS', href: '/os' },
        { label: 'Sales', href: '/os/sales-distribution' },
        { label: 'Distributors' },
      ]}
    >
      <CommercialModuleTwelveDistributor />
    </HarvicsOSShell>
  )
}
