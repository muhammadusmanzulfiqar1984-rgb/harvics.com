'use client'

import React from 'react'
import GeoSelector from '@/components/shared/GeoSelector'
import PortalSwitcher from '@/components/shared/PortalSwitcher'
import BackButton from '@/components/shared/BackButton'
import { useLocalization } from '@/utils/localization'

interface PortalOSHeaderProps {
  portal: 'company' | 'distributor' | 'supplier'
  subtitle?: string
  showDomainHint?: boolean
  domainTitle?: string
  backHref?: string
  showBackButton?: boolean
}

export default function PortalOSHeader({ 
  portal, 
  subtitle,
  showDomainHint = false,
  domainTitle,
  backHref,
  showBackButton = true
}: PortalOSHeaderProps) {
  const portalLabels = {
    company: {
      title: 'Harvics Global OS — Company Portal',
      defaultSubtitle: 'HQ Command Center'
    },
    distributor: {
      title: 'Harvics Global OS — Distributor Portal',
      defaultSubtitle: 'Distribution Management'
    },
    supplier: {
      title: 'Harvics Global OS — Supplier Portal',
      defaultSubtitle: 'Supplier Operations'
    }
  }

  const portalInfo = portalLabels[portal]
  const { getCurrencySymbol, getCurrencyCode, getCountryName } = useLocalization()

  return (
    <header className="bg-white border-b border-[#C3A35E]/30 sticky top-0 z-50 shadow-sm">
      <div className="max-w-[1920px] mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Left: Back Button + Logo + Title */}
          <div className="flex items-center gap-4">
            {showBackButton && (
              <BackButton 
                href={backHref || (portal === 'company' ? '/admin/company-dashboard' : `/portal/${portal}`)}
                label="Back"
              />
            )}
            <div className="text-2xl font-bold text-[#6B1F2B] font-serif">H</div>
            <div>
              <h1 className="text-lg font-bold text-[#6B1F2B] leading-tight font-serif">
                {portalInfo.title}
              </h1>
              <p className="text-xs text-[#6B1F2B]/70">{subtitle || portalInfo.defaultSubtitle}</p>
            </div>
          </div>

          {/* Right: Localization + Geo Selector + Portal Switcher */}
          <div className="flex items-center gap-3">
            {/* Currency & Country Info */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-[#F8F9FA] rounded-md border border-[#C3A35E]/30">
              <span className="text-xs font-semibold text-[#6B1F2B]">
                {getCurrencySymbol()} {getCurrencyCode()}
              </span>
              <span className="text-xs text-[#C3A35E]">•</span>
              <span className="text-xs text-[#6B1F2B]">{getCountryName()}</span>
            </div>
            <GeoSelector />
            <PortalSwitcher currentPortal={portal} />
          </div>
        </div>
        
        {/* OS Domain Hint (optional) */}
        {showDomainHint && domainTitle && (
          <div className="border-t border-[#C3A35E]/20 px-4 py-2 bg-[#F8F9FA]">
            <div className="flex items-center gap-2 text-sm text-[#6B1F2B]">
              <span>📍</span>
              <span className="font-medium">OS Domain: {domainTitle}</span>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

