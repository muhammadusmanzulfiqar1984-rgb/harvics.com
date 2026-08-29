'use client'

import React from 'react'
import { useLocale } from 'next-intl'
import HarvicsOSShell from '@/components/shared/HarvicsOSShell'
import FinanceModuleOneHub from '@/components/os-domains/FinanceModuleOneHub'

export default function FinanceOSPage() {
  const locale = useLocale()

  return (
    <HarvicsOSShell
      title="Financial Accounting"
      subtitle="Module #1 — SAP+ GL · park/post/reverse · ledger · BS & P&L"
      activeDomain="finance"
      breadcrumbs={[
        { label: 'OS', href: '/os' },
        { label: 'Finance' },
      ]}
    >
      <FinanceModuleOneHub locale={locale} />
    </HarvicsOSShell>
  )
}
