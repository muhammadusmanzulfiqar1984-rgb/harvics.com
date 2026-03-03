'use client'

import React, { useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { usePathname, useRouter } from 'next/navigation'
import PortalOSNavigation from '@/components/shared/PortalOSNavigation'
import PortalOSHeader from '@/components/shared/PortalOSHeader'
import BackButton from '@/components/shared/BackButton'
import TierBreadcrumb from '@/components/shared/TierBreadcrumb'
import GlobalFilters, { FilterState } from '@/components/shared/GlobalFilters'
import { getTierColors } from '@/config/tier-colors'

interface OSDomainPageWrapperProps {
  children: React.ReactNode
  title: string
  description?: string
  domain?: string
  portal?: 'company' | 'distributor' | 'supplier'
}

export default function OSDomainPageWrapper({
  children,
  title,
  description,
  domain,
  portal = 'company'
}: OSDomainPageWrapperProps) {
  const locale = useLocale()
  const pathname = usePathname()
  const router = useRouter()
  const [filters, setFilters] = useState<FilterState | null>(null)

  // Determine portal from pathname if not provided
  const detectedPortal = pathname?.includes('/portal/distributor') ? 'distributor' :
                         pathname?.includes('/portal/supplier') ? 'supplier' : 'company'

  const activePortal = portal || detectedPortal
  const backHref = activePortal === 'company' ? '/admin/company-dashboard' : `/${locale}/portal/${activePortal}`

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters)
    // Store filters in context or pass to children as needed
    // You can also trigger a re-render of child components here
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col">
      {/* Header - Consistent with Company Dashboard */}
      <PortalOSHeader 
        portal={activePortal}
        showDomainHint={true}
        domainTitle={title}
        backHref={backHref}
        showBackButton={true}
      />

      {/* Main Layout */}
      <div className="flex flex-1">
        {/* OS Navigation Sidebar */}
        <PortalOSNavigation portal={activePortal} currentDomain={domain || pathname?.split('/os/')[1]?.split('/')[0]} />

        {/* Main Content */}
        <main className="flex-1 px-6 py-6">
          {/* Back Button */}
          <div className="mb-4">
            <BackButton 
              href={backHref}
              label="Back to Dashboard"
            />
          </div>

          {/* Tier Breadcrumb Navigation */}
          <TierBreadcrumb
            tier0={{ 
              label: 'Foundational Engines', 
              href: `/${locale}/os/tier0` 
            }}
            tier1={{ 
              label: title, 
              href: domain ? `/${locale}/os/${domain}` : undefined 
            }}
            currentTier="1"
          />

          {/* Page Header with Tier Indicator - BLUE for Tier 1 */}
          <div className="mb-6">
            {(() => {
              const tier1Colors = getTierColors('1')
              return (
                <div className="flex items-center gap-3 mb-2">
                  <span 
                    className="px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider text-white shadow-sm"
                    style={{
                      background: `linear-gradient(to right, ${tier1Colors.primary}, ${tier1Colors.primaryDark})`,
                      borderColor: tier1Colors.border
                    }}
                  >
                    Tier 1: OS Domain
                  </span>
                  <h1 className="text-3xl font-bold text-[#6B1F2B] font-serif">{title}</h1>
                </div>
              )
            })()}
            {description && (
              <p className="text-[#6B1F2B]/70 text-sm max-w-4xl">{description}</p>
            )}
          </div>

          {/* Global Filters for Currency, Country, Period, Scope */}
          <div className="mb-6">
            <GlobalFilters 
              onFilterChange={handleFilterChange}
              defaultFilters={{
                scope: 'global',
                period: '30d'
              }}
            />
          </div>

          {/* Page Content */}
          <div className="bg-white rounded-xl shadow-sm border border-[#C3A35E]/30 p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
