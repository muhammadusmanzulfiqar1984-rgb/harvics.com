'use client'

import React from 'react'
import { useLocale } from 'next-intl'
import { usePathname } from 'next/navigation'
import OSDomainPageWrapper from '@/components/os-domains/OSDomainPageWrapper'
import KPICard from '@/components/shared/KPICard'

export default function LocalizationOSPage() {
  const locale = useLocale()
  const pathname = usePathname()
  
  const portal = pathname?.includes('/portal/distributor') ? 'distributor' :
                 pathname?.includes('/portal/supplier') ? 'supplier' : 'company'

  return (
    <OSDomainPageWrapper
      title="Localization Engine"
      description="Tier 0: Foundational Engine - Multi-language support with 38 languages and 8-level geographic hierarchy"
      domain="localization"
      portal={portal}
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <KPICard
            label="Supported Languages"
            value="38"
            icon="🌍"
          />
          <KPICard
            label="Active Locales"
            value="45"
            icon="🌐"
          />
          <KPICard
            label="Translation Coverage"
            value="98%"
            icon="📝"
          />
        </div>

        <div className="border-t border-black200 pt-6">
          <h3 className="text-lg font-semibold text-black mb-4">8-Level Geographic Hierarchy</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-white border border-black200">
              <div className="text-sm font-medium text-black mb-1">Level 1</div>
              <div className="text-2xl font-bold text-black">Global</div>
            </div>
            <div className="p-4 bg-white border border-black200">
              <div className="text-sm font-medium text-black mb-1">Level 2</div>
              <div className="text-2xl font-bold text-black">Region</div>
            </div>
            <div className="p-4 bg-white border border-black200">
              <div className="text-sm font-medium text-black mb-1">Level 3</div>
              <div className="text-2xl font-bold text-black">Country</div>
            </div>
            <div className="p-4 bg-white border border-black200">
              <div className="text-sm font-medium text-black mb-1">Level 4</div>
              <div className="text-2xl font-bold text-black">City</div>
            </div>
            <div className="p-4 bg-white border border-black200">
              <div className="text-sm font-medium text-black mb-1">Level 5</div>
              <div className="text-2xl font-bold text-black">District</div>
            </div>
            <div className="p-4 bg-white border border-black200">
              <div className="text-sm font-medium text-black mb-1">Level 6</div>
              <div className="text-2xl font-bold text-black">Area</div>
            </div>
            <div className="p-4 bg-white border border-black200">
              <div className="text-sm font-medium text-black mb-1">Level 7</div>
              <div className="text-2xl font-bold text-black">Zone</div>
            </div>
            <div className="p-4 bg-white border border-black200">
              <div className="text-sm font-medium text-black mb-1">Level 8</div>
              <div className="text-2xl font-bold text-black">Location</div>
            </div>
          </div>
        </div>

        <div className="border-t border-black200 pt-6">
          <h3 className="text-lg font-semibold text-black mb-4">Language Management</h3>
          <div className="bg-white border border-black200 p-4">
            <p className="text-black mb-4">
              Manage translations across all supported languages. Automatically detect and apply
              language preferences based on user location and settings.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-black">
              <div>English (en)</div>
              <div>Spanish (es)</div>
              <div>French (fr)</div>
              <div>German (de)</div>
              <div>Arabic (ar)</div>
              <div>Chinese (zh)</div>
              <div>Japanese (ja)</div>
              <div>Hindi (hi)</div>
              <div>... and 30 more</div>
            </div>
          </div>
        </div>
      </div>
    </OSDomainPageWrapper>
  )
}

