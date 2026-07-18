'use client'

import React from 'react'
import PortalSwitcher from '@/components/shared/PortalSwitcher'
import BackButton from '@/components/shared/BackButton'
import LocalizationBar from '@/components/shared/LocalizationBar'

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
  return (
    <header className="border-b border-[#EAE0D5] sticky top-0 z-50" style={{ background: 'rgba(255,255,255,0.88)', boxShadow: '0 1px 0 rgba(195, 163, 94,0.25), 0 4px 16px rgba(107,31,43,0.06)' }}>
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
            <span className="text-base font-semibold text-[#1A1A1A] tracking-tight">{portalInfo.title}</span>
            {(subtitle || portalInfo.defaultSubtitle) && (
              <span className="hidden md:block text-sm text-[#8E8E93]">— {subtitle || portalInfo.defaultSubtitle}</span>
            )}
          </div>

          {/* Right */}
          <div className="flex items-center gap-3">
            <div className="hidden lg:flex">
              <LocalizationBar compact showGeo={false} className="items-center gap-2" />
            </div>
            <PortalSwitcher currentPortal={portal} />
          </div>
        </div>
      </div>
    </header>
  )
}

