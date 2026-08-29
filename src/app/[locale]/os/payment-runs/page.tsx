'use client'

import FinanceModuleSixHPay from '@/components/os-domains/FinanceModuleSixHPay'
import HarvicsOSShell from '@/components/shared/HarvicsOSShell'

/** Module #6 HPay Payments — outbound payment runs. */
export default function PaymentRunsOSPage() {
  return (
    <HarvicsOSShell
      title="HPay Payments"
      subtitle="Module #6 — Draft → Approve → Release → Paid"
      activeDomain="hpay"
      breadcrumbs={[
        { label: 'OS', href: '/os' },
        { label: 'Finance', href: '/os/finance' },
        { label: 'HPay' },
      ]}
    >
      <FinanceModuleSixHPay />
    </HarvicsOSShell>
  )
}
