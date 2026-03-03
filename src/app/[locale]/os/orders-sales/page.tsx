'use client'

import React from 'react'
import { useLocale } from 'next-intl'
import { usePathname } from 'next/navigation'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import OrdersDomainContent from '@/components/os-domains/OrdersDomainContent'

export default function OrdersSalesOSPage() {
  const locale = useLocale()
  const pathname = usePathname()
  
  const persona = pathname?.includes('/portal/distributor') ? 'distributor' :
                  pathname?.includes('/portal/supplier') ? 'supplier' : 'company'

  return (
    <DashboardLayout
      portal={persona}
      pageTitle="Orders / Sales OS"
    >
      <OrdersDomainContent persona={persona} locale={locale} />
    </DashboardLayout>
  )
}
