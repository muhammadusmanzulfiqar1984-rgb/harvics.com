'use client'

import React from 'react'
import { useLocale } from 'next-intl'
import { usePathname } from 'next/navigation'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import ShippingTradeDomainContent from '@/components/os-domains/ShippingTradeDomainContent'

export default function ShippingTradeOSPage() {
  const locale = useLocale()
  const pathname = usePathname()

  const persona = pathname?.includes('/portal/distributor') ? 'distributor' :
                  pathname?.includes('/portal/supplier') ? 'supplier' : 'company'

  return (
    <DashboardLayout portal={persona} pageTitle="Shipping & Trade OS">
      <ShippingTradeDomainContent persona={persona} locale={locale} />
    </DashboardLayout>
  )
}
