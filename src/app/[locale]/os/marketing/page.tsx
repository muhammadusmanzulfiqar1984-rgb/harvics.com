'use client'

import CommercialModuleElevenMarketing from '@/components/os-domains/CommercialModuleElevenMarketing'
import HarvicsOSShell from '@/components/shared/HarvicsOSShell'

export default function MarketingOSPage() {
  return (
    <HarvicsOSShell
      title="Marketing Automation"
      subtitle="Module #11 — SAP+ campaigns · schedule/send · CRM leads"
      activeDomain="marketing"
      breadcrumbs={[
        { label: 'OS', href: '/os' },
        { label: 'CRM', href: '/os/crm' },
        { label: 'Marketing' },
      ]}
    >
      <CommercialModuleElevenMarketing />
    </HarvicsOSShell>
  )
}
