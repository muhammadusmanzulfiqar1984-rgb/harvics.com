'use client'

import CommercialModuleTenSales from '@/components/os-domains/CommercialModuleTenSales'
import HarvicsOSShell from '@/components/shared/HarvicsOSShell'

/** Module #10 Sales & Distribution */
export default function SalesDistributionPage() {
  return (
    <HarvicsOSShell
      title="Sales & Distribution"
      subtitle="Module #10 — SAP+ channels · routing · delivery slots"
      activeDomain="sales"
      breadcrumbs={[
        { label: 'OS', href: '/os' },
        { label: 'CRM', href: '/os/crm' },
        { label: 'Sales & Distribution' },
      ]}
    >
      <CommercialModuleTenSales />
    </HarvicsOSShell>
  )
}
