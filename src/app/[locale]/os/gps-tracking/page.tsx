'use client'

import React from 'react'
import { useLocale } from 'next-intl'
import { usePathname } from 'next/navigation'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import GPSTrackingDomainContent from '@/components/os-domains/GPSTrackingDomainContent'

export default function GPSTrackingOSPage() {
  const locale = useLocale()
  const pathname = usePathname()
  
  const persona = pathname?.includes('/portal/distributor') ? 'distributor' :
                  pathname?.includes('/portal/supplier') ? 'supplier' : 'company'

  return (
    <DashboardLayout
      portal={persona}
      pageTitle="GPS Tracking OS"
    >
      <GPSTrackingDomainContent persona={persona} locale={locale} />
    </DashboardLayout>
  )
}
