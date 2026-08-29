'use client'

import React, { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import PortalOSHeader from '@/components/shared/PortalOSHeader'
import OSDomainNavigation from '@/components/shared/OSDomainNavigation'
import GeminiCopilot from '@/components/ai/GeminiCopilot'

interface DashboardLayoutProps {
  children: React.ReactNode
  portal: 'company' | 'distributor' | 'supplier'
  pageTitle: string
}

/**
 * Portal dashboards keep header + domain nav.
 * /os/* routes get chrome from [locale]/os/layout (OsAppShell) — no second sidebar.
 */
export default function DashboardLayout({ children, portal, pageTitle }: DashboardLayoutProps) {
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()
  useEffect(() => {
    setMounted(true)
  }, [])

  const inOs = !!pathname?.includes('/os/')

  if (inOs) {
    return (
      <div className="min-w-0">
        <div
          className="mb-6 pb-5"
          style={{
            borderBottom: '1.5px solid rgba(195, 163, 94, 0.35)',
          }}
        >
          <h1 className="text-xl font-semibold tracking-tight text-harvics-burgundy">{pageTitle}</h1>
        </div>
        {children}
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: 'transparent' }}>
      <PortalOSHeader portal={portal} backHref="/" showBackButton={true} />
      <div className="flex">
        <OSDomainNavigation />
        <main className="flex-1 min-w-0 px-8 py-7">
          <div
            className="mb-6 pb-5"
            style={{
              borderBottom: '1.5px solid rgba(195, 163, 94,0.4)',
              background: 'linear-gradient(90deg, transparent, rgba(195, 163, 94,0.06), transparent)',
            }}
          >
            <h1 className="text-xl font-semibold tracking-tight" style={{ color: '#2C1810' }}>
              {pageTitle}
            </h1>
          </div>
          {children}
        </main>
      </div>
      {mounted && <GeminiCopilot />}
    </div>
  )
}
