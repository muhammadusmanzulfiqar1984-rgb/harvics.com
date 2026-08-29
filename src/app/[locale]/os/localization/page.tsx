'use client'

import React from 'react'
import { useLocale } from 'next-intl'
import { usePathname } from 'next/navigation'
import HarvicsOSShell from '@/components/shared/HarvicsOSShell'
import LocalizationDomainContent from '@/components/os-domains/LocalizationDomainContent'

export default function LocalizationOSPage() {
  const locale = useLocale()
  const pathname = usePathname()
  
  const persona = pathname?.includes('/portal/distributor') ? 'distributor' :
                  pathname?.includes('/portal/supplier') ? 'supplier' : 'company'

  return (
    <HarvicsOSShell
      title="Localization Lab"
      subtitle="Legacy geo/i18n lab — Tax Engine is /os/tax-engine (#48); Locales is /os/locales (#58)"
      activeDomain="locales"
      portal={persona}
      breadcrumbs={[
        { label: 'OS', href: '/os' },
        { label: 'Localization Lab' },
      ]}
    >
      <LocalizationDomainContent persona={persona} locale={locale} />
    </HarvicsOSShell>
  )
}
