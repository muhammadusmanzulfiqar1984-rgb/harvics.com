'use client'

import React from 'react'
import { useLocale } from 'next-intl'
import { usePathname } from 'next/navigation'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import TreasuryBankingDomainContent from '@/components/os-domains/TreasuryBankingDomainContent'
import LiveModuleData from '@/components/shared/LiveModuleData'

export default function TreasuryBankingOSPage() {
  const locale = useLocale()
  const pathname = usePathname()

  const persona = pathname?.includes('/portal/distributor') ? 'distributor' :
                  pathname?.includes('/portal/supplier') ? 'supplier' : 'company'

  return (
    <DashboardLayout portal={persona} pageTitle="Treasury & Banking OS">
      <TreasuryBankingDomainContent persona={persona} locale={locale} />
      <LiveModuleData
        endpoint="/api/v2/treasury/accounts"
        title="Live Bank Accounts"
        columns={[
          { key: 'accountNo', label: 'Account #' },
          { key: 'bankName', label: 'Bank' },
          { key: 'accountType', label: 'Type' },
          { key: 'currency', label: 'Ccy' },
          { key: 'balance', label: 'Balance', format: (v) => v != null ? Number(v).toLocaleString() : '—' },
          { key: 'status', label: 'Status' },
        ]}
      />
      <LiveModuleData
        endpoint="/api/v2/treasury/fx-rates"
        title="FX Rates"
        columns={[
          { key: 'fromCcy', label: 'From' },
          { key: 'toCcy', label: 'To' },
          { key: 'rate', label: 'Rate' },
          { key: 'effectiveDate', label: 'Effective' },
          { key: 'source', label: 'Source' },
        ]}
      />
    </DashboardLayout>
  )
}
