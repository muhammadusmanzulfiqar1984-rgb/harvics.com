'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useCountry } from '@/contexts/CountryContext'
import { useLocale } from 'next-intl'

const COUNTRY_NAME_MAP: Record<string, string> = {
  us: 'United States',
  pk: 'Pakistan',
  ae: 'United Arab Emirates',
  gb: 'United Kingdom',
  sa: 'Saudi Arabia',
  eg: 'Egypt',
  jo: 'Jordan',
  kw: 'Kuwait',
  qa: 'Qatar',
  bh: 'Bahrain',
  om: 'Oman',
  iq: 'Iraq',
  lb: 'Lebanon',
  ma: 'Morocco',
  tn: 'Tunisia',
  dz: 'Algeria',
  ly: 'Libya',
  sd: 'Sudan',
  ye: 'Yemen',
  so: 'Somalia',
  dj: 'Djibouti',
  comoros: 'Comoros',
  global: 'Global Site'
}

const formatCountry = (value?: string) => {
  if (!value) return 'Global Site'
  const mapped = COUNTRY_NAME_MAP[value.toLowerCase()]
  if (mapped) return mapped
  return value
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

export default function RegionSelector() {
  const { selectedCountry, countryData, availableCountries } = useCountry()
  const locale = useLocale()
  const [isOpen, setIsOpen] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const displayCountry = countryData?.countryName || formatCountry(selectedCountry) || 'Global Site'
  const displayText = selectedCountry ? `You are in our ${displayCountry} Site` : 'You are in our Global Site'

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    setIsOpen(true)
  }

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false)
    }, 200)
  }

  return (
    <div 
      className="relative"
      ref={dropdownRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-1.5 bg-[#f5f5dc] border border-[#6B1F2B]/20 rounded-md hover:border-[#6B1F2B]/40 transition-all duration-200 text-black text-xs sm:text-sm font-medium"
        aria-label="Select region"
      >
        {/* Globe Icon */}
        <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        
        {/* Region Text */}
        <span className="hidden sm:inline text-black">{displayText}</span>
        <span className="sm:hidden text-black">Region</span>
        
        {/* Chevron */}
        <svg 
          className={`w-3 h-3 text-black transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-64 bg-white border-2 border-[#6B1F2B] shadow-xl z-50 rounded-md overflow-hidden">
          <div className="p-2 max-h-80 overflow-y-auto">
            <div className="mb-2 pb-2 border-b-2 border-[#6B1F2B]">
              <h3 className="text-black font-bold text-xs uppercase tracking-wide px-2">Select Region</h3>
            </div>
            <div className="space-y-1">
              {availableCountries.length > 0 ? (
                availableCountries.map((code) => (
                  <button
                    key={code}
                    onClick={() => {
                      // Handle region change - would integrate with CountryContext
                      if (typeof window !== 'undefined') {
                        localStorage.setItem('selected_region', code)
                      }
                      setIsOpen(false)
                      // Reload to apply region change
                      window.location.reload()
                    }}
                    className={`w-full text-left px-3 py-2 text-sm rounded-md transition-all duration-200 ${
                      selectedCountry === code
                        ? 'bg-white text-white font-bold border-2 border-[#6B1F2B]'
                        : 'text-black hover:bg-white/10 hover:border-2 hover:border-[#6B1F2B] border-2 border-transparent font-medium'
                    }`}
                  >
                    {formatCountry(code)}
                  </button>
                ))
              ) : (
                <button
                  className="w-full text-left px-3 py-2 text-sm text-black hover:bg-white/10 rounded-md transition-all duration-200 font-medium border-2 border-transparent hover:border-[#6B1F2B]"
                >
                  Global Site
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
