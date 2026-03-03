'use client'

import React from 'react'
import { useLocalization } from '@/utils/localization'
import LanguageSwitcher from '@/components/ui/LanguageSwitcher'
import CountrySelector from '@/components/ui/CountrySelector'
import GeoSelector from '@/components/shared/GeoSelector'
import GeoMappingDisplay from '@/components/shared/GeoMappingDisplay'

/**
 * Comprehensive Localization Bar Component
 * Shows language, country, currency, and geo mapping
 * Can be placed horizontally (top bar) or vertically (sidebar)
 */
interface LocalizationBarProps {
  orientation?: 'horizontal' | 'vertical'
  showLabels?: boolean
  compact?: boolean
  className?: string
}

export default function LocalizationBar({
  orientation = 'horizontal',
  showLabels = true,
  compact = false,
  className = ''
}: LocalizationBarProps) {
  const { locale, country, currency, getCountryName, getCurrencySymbol, getTimezone } = useLocalization()

  const containerClass = orientation === 'horizontal'
    ? `flex items-center gap-4 ${className}`
    : `flex flex-col gap-3 ${className}`

  if (compact) {
    return (
      <div className={containerClass}>
        <LanguageSwitcher />
        <CountrySelector />
      </div>
    )
  }

  return (
    <div className={containerClass}>
      {/* Language Switcher */}
      <div className={orientation === 'vertical' ? 'w-full' : ''}>
        {showLabels && orientation === 'vertical' && (
          <label className="block text-xs font-semibold text-black mb-1 uppercase tracking-wider">
            Language
          </label>
        )}
        <LanguageSwitcher />
      </div>

      {/* Country Selector */}
      <div className={orientation === 'vertical' ? 'w-full' : ''}>
        {showLabels && orientation === 'vertical' && (
          <label className="block text-xs font-semibold text-black mb-1 uppercase tracking-wider">
            Country
          </label>
        )}
        <CountrySelector />
      </div>

      {/* Geo Selector */}
      <div className={orientation === 'vertical' ? 'w-full' : ''}>
        {showLabels && orientation === 'vertical' && (
          <label className="block text-xs font-semibold text-black mb-1 uppercase tracking-wider">
            Region
          </label>
        )}
        <GeoSelector />
      </div>

      {/* Geo Mapping Display */}
      <GeoMappingDisplay 
        orientation={orientation}
        showCoordinates={true}
        showTimezone={true}
        compact={!showLabels}
      />

      {/* Currency Info */}
      {showLabels && (
        <div className={`flex ${orientation === 'vertical' ? 'flex-col' : 'items-center'} gap-2 text-xs text-black`}>
          <div className="flex items-center gap-1">
            <span className="font-semibold">Currency:</span>
            <span>{getCurrencySymbol()} {currency.code}</span>
          </div>
        </div>
      )}
    </div>
  )
}

