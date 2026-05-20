'use client'

import React from 'react'
import { useLocale } from 'next-intl'
import { usePathname } from 'next/navigation'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import ManufacturingDomainContent from '@/components/os-domains/ManufacturingDomainContent'
import LiveModuleData from '@/components/shared/LiveModuleData'

export default function ManufacturingOSPage() {
  const locale = useLocale()
  const pathname = usePathname()

  const persona = pathname?.includes('/portal/distributor') ? 'distributor' :
                  pathname?.includes('/portal/supplier') ? 'supplier' : 'company'

  return (
    <DashboardLayout portal={persona} pageTitle="Manufacturing OS">
      <ManufacturingDomainContent persona={persona} locale={locale} />
      <LiveModuleData
        endpoint="/api/v2/manufacturing/work-orders"
        title="Live Work Orders"
        columns={[
          { key: 'workOrderNo', label: 'WO #' },
          { key: 'productSku', label: 'SKU' },
          { key: 'qty', label: 'Qty' },
          { key: 'status', label: 'Status' },
          { key: 'priority', label: 'Priority' },
          { key: 'startDate', label: 'Start' },
        ]}
      />
    </DashboardLayout>
  )
}
