'use client'

import React from 'react'
import { useLocalization } from '@/utils/localization'
import { useCountry } from '@/contexts/CountryContext'

/**
 * Geo Mapping Display Component
 * Shows current geographic context: Country, Region, Coordinates, Timezone
 * Can be displayed horizontally or vertically
 */
interface GeoMappingDisplayProps {
  orientation?: 'horizontal' | 'vertical'
  showCoordinates?: boolean
  showTimezone?: boolean
  compact?: boolean
  className?: string
}

export default function GeoMappingDisplay({
  orientation = 'horizontal',
  showCoordinates = true,
  showTimezone = true,
  compact = false,
  className = ''
}: GeoMappingDisplayProps) {
  const { getCountryName, getTimezone } = useLocalization()
  const { countryData } = useCountry()

  const gps = (countryData as any)?.gps || { latitude: 0, longitude: 0 }
  const timezone = getTimezone()

  if (compact) {
    return (
      <div className={`flex ${orientation === 'vertical' ? 'flex-col' : 'items-center'} gap-2 text-xs text-black ${className}`}>
        <span className="font-semibold">📍 {getCountryName()}</span>
        {showTimezone && <span>🕐 {timezone}</span>}
      </div>
    )
  }

  return (
    <div className={`flex ${orientation === 'vertical' ? 'flex-col' : 'items-center'} gap-3 text-sm ${className}`}>
      {/* Country */}
      <div className="flex items-center gap-2">
        <span className="text-lg">🌍</span>
        <div className="flex flex-col">
          <span className="font-semibold text-black">{getCountryName()}</span>
          {countryData?.countryName && (
            <span className="text-xs text-black/60">Country</span>
          )}
        </div>
      </div>

      {/* GPS Coordinates */}
      {showCoordinates && gps.latitude && gps.longitude && (
        <div className="flex items-center gap-2">
          <span className="text-lg">📍</span>
          <div className="flex flex-col">
            <span className="font-semibold text-black">
              {gps.latitude.toFixed(4)}, {gps.longitude.toFixed(4)}
            </span>
            <span className="text-xs text-black/60">GPS Coordinates</span>
          </div>
        </div>
      )}

      {/* Timezone */}
      {showTimezone && (
        <div className="flex items-center gap-2">
          <span className="text-lg">🕐</span>
          <div className="flex flex-col">
            <span className="font-semibold text-black">{timezone}</span>
            <span className="text-xs text-black/60">Timezone</span>
          </div>
        </div>
      )}
    </div>
  )
}

