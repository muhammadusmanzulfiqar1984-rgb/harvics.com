'use client'

import React, { useState, useEffect } from 'react'
import { useLocale } from 'next-intl'
import { useRouter, usePathname } from 'next/navigation'
import { regions, Region, RegionLocation } from '@/data/regions'
import { useRegion } from '@/contexts/RegionContext'

interface RegionSelectorModalProps {
  onClose: () => void
}

const RegionSelectorModal: React.FC<RegionSelectorModalProps> = ({ onClose }) => {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedRegions, setExpandedRegions] = useState<Set<string>>(new Set())

  // Filter regions and locations based on search
  const filteredRegions = regions.map(region => ({
    ...region,
    locations: region.locations.filter(location =>
      location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      location.languages.some(lang => lang.toLowerCase().includes(searchQuery.toLowerCase()))
    )
  })).filter(region => region.locations.length > 0)

  const toggleRegion = (regionId: string) => {
    const newExpanded = new Set(expandedRegions)
    if (newExpanded.has(regionId)) {
      newExpanded.delete(regionId)
    } else {
      newExpanded.add(regionId)
    }
    setExpandedRegions(newExpanded)
  }

  const { setSelectedLocation, setSelectedRegion } = useRegion()

  const handleLocationSelect = (location: RegionLocation) => {
    const targetLocale = location.locale || 'en'
    const pathWithoutLocale = (pathname && typeof pathname === 'string') ? pathname.replace(`/${locale}`, '') || '/' : '/'
    
    // Update region context
    setSelectedLocation(location.code)
    const region = regions.find(r => r.locations.some(loc => loc.code === location.code))
    if (region) {
      setSelectedRegion(region.id)
    }
    
    router.push(`/${targetLocale}${pathWithoutLocale}`)
    onClose()
  }

  // Close on escape key
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    document.addEventListener('keydown', handleEscape)
    document.body.style.overflow = 'hidden' // Prevent body scroll
    
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [onClose])

  return (
    <div 
      className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-gradient-to-br from-[#6B1F2B] via-[#6B1F2B] to-[#2a0005] border-2 border-[#C3A35E]/30 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-[#C3A35E]/30">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white">Select Your Location</h2>
            <button
              onClick={onClose}
              className="text-white hover:text-[#C3A35E]/90 transition-colors p-2 rounded-lg hover:bg-white/10"
              aria-label="Close"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Search Bar */}
          <div className="relative">
            <svg 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search by country or language..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-black/30 border border-[#C3A35E]/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-black/50 focus:border-white"
            />
          </div>
        </div>

        {/* Regions List */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4">
            {filteredRegions.map((region) => (
              <div key={region.id} className="border border-[#C3A35E]/20 rounded-lg overflow-hidden">
                {/* Region Header */}
                <button
                  onClick={() => toggleRegion(region.id)}
                  className="w-full flex items-center justify-between p-4 bg-white/10 hover:bg-white/20 transition-all duration-300 group"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-white font-bold text-lg">{region.name}</span>
                    <span className="text-white/60 text-sm">({region.count})</span>
                  </div>
                  <svg
                    className={`w-5 h-5 text-white transition-transform duration-300 ${
                      expandedRegions.has(region.id) ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Region Locations */}
                {expandedRegions.has(region.id) && (
                  <div className="bg-black/20 p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {region.locations.map((location) => (
                        <button
                          key={location.code}
                          onClick={() => handleLocationSelect(location)}
                          className="p-3 text-left bg-white/5 hover:bg-white/15 border border-[#C3A35E]/20 hover:border-white/40 rounded-lg transition-all duration-300 hover:scale-105 group"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="text-white font-semibold text-sm mb-1 group-hover:text-[#C3A35E] transition-colors">
                                {location.name}
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {location.languages.map((lang, idx) => (
                                  <span
                                    key={idx}
                                    className="text-xs text-[#C3A35E]/80 bg-white/10 px-2 py-1 rounded"
                                  >
                                    {lang}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <svg
                              className="w-4 h-4 text-white/40 group-hover:text-[#C3A35E] transition-colors ml-2"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {filteredRegions.length === 0 && (
            <div className="text-center py-12">
              <p className="text-white/60 text-lg">No locations found matching your search.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-[#C3A35E]/30 bg-black/20">
          <div className="flex items-center justify-center space-x-2 text-white/60 text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Select your region to view localized content</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RegionSelectorModal

