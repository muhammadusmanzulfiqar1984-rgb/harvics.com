'use client'

import React, { useState } from 'react'
import { useCountry } from '@/contexts/CountryContext'

interface GeoLevel {
  level: 'global' | 'region' | 'country' | 'city' | 'district' | 'area' | 'location'
  label: string
  value: string
}

export default function GeoSelector() {
  const { selectedCountry, availableCountries } = useCountry()
  const [isOpen, setIsOpen] = useState(false)
  const [currentLevel, setCurrentLevel] = useState<'global' | 'region' | 'country' | 'city' | 'district' | 'area' | 'location'>('global')

  // 8-level geographic hierarchy
  const geoLevels: GeoLevel[] = [
    { level: 'global', label: 'Global', value: 'global' },
    { level: 'region', label: 'Region', value: 'asia' },
    { level: 'country', label: 'Country', value: selectedCountry || 'US' },
    { level: 'city', label: 'City', value: 'dubai' },
    { level: 'district', label: 'District', value: 'business-bay' },
    { level: 'area', label: 'Area', value: 'area-1' },
    { level: 'location', label: 'Location', value: 'location-1' }
  ]

  const currentGeo = geoLevels.find(g => g.level === currentLevel) || geoLevels[0]

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-black300 rounded-md text-sm font-medium text-black hover:bg-white transition-colors"
      >
        <span className="text-lg">🌍</span>
        <span>{currentGeo.label}</span>
        <span className="text-xs text-black">({currentGeo.value})</span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full right-0 mt-2 w-64 bg-white border border-black300 rounded-md shadow-lg z-50 py-2 max-h-[400px] overflow-y-auto">
            {geoLevels.map((level) => (
              <button
                key={level.level}
                onClick={() => {
                  setCurrentLevel(level.level)
                  setIsOpen(false)
                }}
                className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                  currentLevel === level.level
                    ? 'bg-[#F5C542] text-black font-semibold'
                    : 'text-black hover:bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>{level.label}</span>
                  <span className="text-xs text-black">{level.value}</span>
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

