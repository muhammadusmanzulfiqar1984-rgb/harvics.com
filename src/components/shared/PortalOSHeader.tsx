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
    <header className="border-b border-[#EAE0D5] sticky top-0 z-50" style={{ background: 'rgba(255,255,255,0.88)', boxShadow: '0 1px 0 rgba(195,163,94,0.25), 0 4px 16px rgba(107,31,43,0.06)' }}>
      <div className="max-w-[1920px] mx-auto px-6">
        <div className="flex items-center justify-between h-14">
          {/* Left */}
          <div className="flex items-center gap-3">
            {showBackButton && (
              <BackButton
                href={backHref || (portal === 'company' ? '/admin/company-dashboard' : `/portal/${portal}`)}
                label="Back"
              />
            )}
            <span className="w-px h-4 bg-[#E5E5EA]" />
            <span className="text-base font-semibold text-[#1D1D1F] tracking-tight">{portalInfo.title}</span>
            {(subtitle || portalInfo.defaultSubtitle) && (
              <span className="hidden md:block text-sm text-[#8E8E93]">— {subtitle || portalInfo.defaultSubtitle}</span>
            )}
          </div>

          {/* Right */}
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-[#FAF8F5] rounded-lg border border-[#EAE0D5]">
              <span className="text-xs font-medium text-[#1D1D1F]">
                {getCurrencySymbol()} {getCurrencyCode()}
              </span>
              <span className="text-[#C3A35E] text-xs">·</span>
              <span className="text-xs text-[#8E8E93]">{getCountryName()}</span>
            </div>
            <GeoSelector />
            <PortalSwitcher currentPortal={portal} />
          </div>
        </div>
      </div>
    </header>
  )
}

