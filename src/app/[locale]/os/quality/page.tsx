'use client'

import React from 'react'
import { useLocale } from 'next-intl'
import { usePathname } from 'next/navigation'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import QualityDomainContent from '@/components/os-domains/QualityDomainContent'
import LiveModuleData from '@/components/shared/LiveModuleData'

export default function QualityOSPage() {
  const locale = useLocale()
  const pathname = usePathname()

  const persona = pathname?.includes('/portal/distributor') ? 'distributor' :
                  pathname?.includes('/portal/supplier') ? 'supplier' : 'company'

  return (
    <DashboardLayout portal={persona} pageTitle="Quality Management OS">
      <QualityDomainContent persona={persona} locale={locale} />
      <LiveModuleData
        endpoint="/api/v2/quality/checks"
        title="Live Quality Checks"
        columns={[
          { key: 'checkNo', label: 'Check #' },
          { key: 'productSku', label: 'SKU' },
          { key: 'inspector', label: 'Inspector' },
          { key: 'status', label: 'Status' },
          { key: 'defectsFound', label: 'Defects' },
        ]}
      />
      <LiveModuleData
        endpoint="/api/v2/quality/ncrs"
        title="Non-Conformance Reports"
        columns={[
          { key: 'ncrNo', label: 'NCR #' },
          { key: 'severity', label: 'Severity' },
          { key: 'description', label: 'Description' },
          { key: 'status', label: 'Status' },
          { key: 'assignedTo', label: 'Assigned' },
        ]}
      />
    </DashboardLayout>
  )
}
