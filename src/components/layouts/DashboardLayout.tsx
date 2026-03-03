'use client'

import React from 'react'
import PortalOSHeader from '@/components/shared/PortalOSHeader'
import OSDomainNavigation from '@/components/shared/OSDomainNavigation'

interface DashboardLayoutProps {
  children: React.ReactNode
  portal: 'company' | 'distributor' | 'supplier'
  pageTitle: string
}

export default function DashboardLayout({ children, portal, pageTitle }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <PortalOSHeader 
        portal={portal} 
        backHref="/"
        showBackButton={true}
      />
      <div className="flex flex-1">
        <OSDomainNavigation />
        <main className="flex-1 px-6 py-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-[#6B1F2B] font-serif mb-2">{pageTitle}</h1>
          </div>
          {children}
        </main>
      </div>
    </div>
  )
}
