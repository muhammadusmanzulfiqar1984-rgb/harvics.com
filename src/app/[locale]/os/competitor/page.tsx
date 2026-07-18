'use client'

import React, { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useLocale } from 'next-intl'
import LocalizationBar from '@/components/shared/LocalizationBar'

export default function CompetitorOSPage() {
  const locale = useLocale()
  const router = useRouter()
  
  useEffect(() => {
    // Redirect to competitor-intel which has the full implementation
    router.replace(`/${locale}/os/competitor-intel`)
  }, [locale, router])

  return (
    <div className="min-h-screen bg-[#F2F2F2] flex items-center justify-center">
      <div className="text-center w-full max-w-lg px-4">
        <LocalizationBar orientation="horizontal" compact showLabels={false} showGeo={false} className="mb-4 justify-center" />
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-harvics-burgundy mx-auto mb-4"></div>
        <p className="text-black">Redirecting to Competitor Intelligence OS...</p>
      </div>
    </div>
  )
}

