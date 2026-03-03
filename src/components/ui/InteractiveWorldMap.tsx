'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { useTranslations, useLocale } from 'next-intl'
import { useRegion } from '@/contexts/RegionContext'
import { regions } from '@/data/regions'

const InteractiveWorldMap: React.FC = () => {
  const t = useTranslations()
  const locale = useLocale()
  const { selectedRegion } = useRegion()
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null)
  const [isVisible, setIsVisible] = useState(true) // Start visible immediately
  
  // Fallback text values
  const getText = (key: string, fallback: string) => {
    try {
      const translated = t(key)
      if (translated === key || !translated || translated.trim() === '') {
        return fallback
      }
      return translated
    } catch (error) {
      return fallback
    }
  }
  const [expandedCountry, setExpandedCountry] = useState<string | null>(null)

  // Function to generate office-specific email
  const getOfficeEmail = (officeCode: string) => {
    const emailMap: { [key: string]: string } = {
      'great-britain': 'sales.uk@harvics.com', // London office
      'italy': 'sales.it@harvics.com', // Milan office
      'united-states': 'sales.us@harvics.com' // New York office
    }
    return emailMap[officeCode] || 'sales.uk@harvics.com' // Default fallback
  }

  // Map country names to regions
  const countryToRegionMap: { [key: string]: string } = {
    'Pakistan': 'india-southwest-asia',
    'India': 'india-southwest-asia',
    'China': 'greater-china-mongolia',
    'United States': 'north-america',
    'United Kingdom': 'europe',
    'Italy': 'europe',
    'Saudi Arabia': 'eurasia-middle-east',
    'Brazil': 'latin-america',
    'Egypt': 'africa',
    'South Africa': 'africa',
    'Nigeria': 'africa',
    'Australia': 'asean-south-pacific',
    'Thailand': 'asean-south-pacific',
    'Indonesia': 'asean-south-pacific',
    'Malaysia': 'asean-south-pacific',
    'Philippines': 'asean-south-pacific',
    'Vietnam': 'asean-south-pacific',
    'Japan': 'japan-south-korea',
    'South Korea': 'japan-south-korea'
  }

  // Major Market Offices - Actual offices: London (UK), Milan (Italy), New York (US)
  const majorMarketOffices: { [key: string]: { flag: string, coordinates: { x: number, y: number }, established: string, name: string } } = {
    'great-britain': { flag: '🇬🇧', coordinates: { x: 48, y: 25 }, established: '2019', name: 'United Kingdom (London)' },
    'italy': { flag: '🇮🇹', coordinates: { x: 52, y: 32 }, established: '2019', name: 'Italy (Milan)' },
    'united-states': { flag: '🇺🇸', coordinates: { x: 20, y: 35 }, established: '2019', name: 'United States (New York)' }
  }

  // Map regions to their serving major market offices
  const regionToOfficeMap: { [key: string]: string[] } = {
    'africa': ['great-britain', 'italy'], // Served by London and Milan
    'asean-south-pacific': ['great-britain', 'united-states'], // Served by London and New York
    'eurasia-middle-east': ['great-britain', 'italy'], // Served by London and Milan
    'europe': ['great-britain', 'italy'], // Served by London and Milan
    'greater-china-mongolia': ['united-states', 'great-britain'], // Served by New York and London
    'india-southwest-asia': ['great-britain', 'italy'], // Served by London and Milan
    'japan-south-korea': ['united-states', 'great-britain'], // Served by New York and London
    'latin-america': ['united-states', 'italy'], // Served by New York and Milan
    'north-america': ['united-states'] // Served by New York
  }


  // Get markets based on selected region - shows serving offices for that region
  const getFilteredMarkets = () => {
    if (!selectedRegion) {
      // Return all major market offices if no region selected
      return Object.entries(majorMarketOffices).map(([code, data]) => ({
        name: data.name,
        code,
        flag: data.flag,
        coordinates: data.coordinates,
        established: data.established,
        tier: 'major' as const
      }))
    }

    // Get serving offices for the selected region
    const servingOffices = regionToOfficeMap[selectedRegion] || []
    
    if (servingOffices.length === 0) {
      // If no specific mapping, return all offices
      return Object.entries(majorMarketOffices).map(([code, data]) => ({
        name: data.name,
        code,
        flag: data.flag,
        coordinates: data.coordinates,
        established: data.established,
        tier: 'major' as const
      }))
    }

    // Return only the offices that serve this region
    return servingOffices
      .filter(code => majorMarketOffices[code])
      .map(code => ({
        name: majorMarketOffices[code].name,
        code,
        flag: majorMarketOffices[code].flag,
        coordinates: majorMarketOffices[code].coordinates,
        established: majorMarketOffices[code].established,
        tier: 'major' as const
      }))
  }

  const globalPresence = getFilteredMarkets()

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <section className="py-12 sm:py-16 lg:py-20 relative overflow-hidden min-h-screen flex items-center" style={{ background: '#F5F1E8' }}>
      {/* Background Elements — removed, clean ivory */}

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-8 sm:mb-12 lg:mb-16">
          <div className="opacity-100">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 font-serif" style={{ color: '#6B1F2B' }}>
              {getText('worldMap.globalReach', 'Our Global Reach')}
            </h2>
            <div className="w-24 mx-auto mt-6" style={{ height: '1px', background: '#C3A35E' }}></div>
          </div>
        </div>

        {/* Interactive Map Container */}
        <div className="opacity-100">
          <div className="relative overflow-hidden min-h-[300px] sm:min-h-[400px] md:min-h-[450px] lg:min-h-[500px] xl:min-h-[550px]" style={{ background: '#FFFFFF', border: '1px solid rgba(195,163,94,0.3)' }}>
            {/* World Map Image with Interactive Overlay */}
            <div className="relative w-full h-64 sm:h-80 md:h-96 lg:h-[500px] xl:h-[550px] overflow-hidden">
              {/* Actual World Map Image */}
              <Image
                src="/Images/worldmap.png"
                alt="World Map showing Harvics Global Presence"
                fill
                className="object-cover brightness-75 contrast-125 hover:brightness-90 transition-all duration-300"
                priority
                sizes="(max-width: 640px) 100vw, (max-width: 768px) 100vw, (max-width: 1024px) 100vw, 100vw"
                quality={85}
                placeholder="blur"
                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
              />
              
              {/* Interactive Overlay */}
              <div className="absolute inset-0">
                {/* Global Presence Markers - 40 Countries */}
                {globalPresence.map((country, index) => (
                  <div
                    key={country.name}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer touch-manipulation"
                    style={{
                      left: `${country.coordinates.x}%`,
                      top: `${country.coordinates.y}%`
                    }}
                    onMouseEnter={() => setHoveredCountry(country.name)}
                    onMouseLeave={() => setHoveredCountry(null)}
                    onTouchStart={() => setHoveredCountry(country.name)}
                    onTouchEnd={() => setHoveredCountry(null)}
                  >
                    {/* Country Marker */}
                    <div className="relative">
                      {/* Flag Marker */}
                      <div className={`${
                        country.tier === 'major' ? 'w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12' : 
                        country.tier === 'key' ? 'w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10' : 'w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8'
                      } bg-white/20 border-2 border-white/40 shadow-lg animate-pulse-slow flex items-center justify-center rounded-sm overflow-hidden hover:scale-110 transition-transform duration-200`}>
                        <div className={`${
                          country.tier === 'major' ? 'text-lg sm:text-xl lg:text-2xl' : 
                          country.tier === 'key' ? 'text-sm sm:text-lg lg:text-xl' : 'text-xs sm:text-sm lg:text-lg'
                        } flag-emoji leading-none`}>
                          {country.flag}
                        </div>
                      </div>
                      
                      {/* Pulsing ring - Only show on larger screens for performance */}
                      <div className={`absolute inset-0 ${
                        country.tier === 'major' ? 'w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12' : 
                        country.tier === 'key' ? 'w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10' : 'w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8'
                      } bg-gradient-to-r from-harvics-red to-harvics-red animate-ping opacity-30 hidden sm:block`}></div>
                      
                      {/* Tooltip - Responsive positioning */}
                      {hoveredCountry === country.name && (
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 sm:px-3 sm:py-2 bg-white text-black text-xs sm:text-sm shadow-xl whitespace-nowrap z-20 rounded-md border border-[#C3A35E]/30">
                          <div className="flex items-center space-x-1 sm:space-x-2">
                            <div className="text-sm sm:text-lg flag-emoji leading-none">{country.flag}</div>
                            <div>
                              <div className="font-semibold text-xs sm:text-sm">{country.name}</div>
                              <div className="text-xs text-black opacity-80">Since {country.established}</div>
                            </div>
                          </div>
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 sm:border-l-4 sm:border-r-4 sm:border-t-4 border-transparent border-t-[#6B1F2B]"></div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

              </div>
            </div>

            {/* Market Tiers Legend */}
            <div className="p-4 sm:p-6 lg:p-8">
              <div className="flex flex-wrap justify-center gap-4 sm:gap-6 mb-6 sm:mb-8">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-gradient-to-br from-harvics-red to-harvics-red flex items-center justify-center">
                    <span className="text-black text-xs">🏢</span>
                  </div>
                  <span className="text-white text-sm font-bold">Major Markets (6)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 bg-gradient-to-br from-harvics-red to-harvics-red flex items-center justify-center">
                    <span className="text-white text-xs">⭐</span>
                  </div>
                  <span className="text-white text-sm font-bold">Key Markets (10)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-gradient-to-br from-harvics-red to-harvics-red flex items-center justify-center">
                    <span className="text-white text-xs">🌍</span>
                  </div>
                  <span className="text-white text-sm font-bold">Regional Markets (24)</span>
                </div>
              </div>

              {/* Major Markets - Dynamic based on selected region */}
              <div className="mb-6 sm:mb-8 lg:mb-12">
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#6B1F2B] text-center mb-4 sm:mb-6 lg:mb-8 font-serif">
                  <span className="text-[#6B1F2B]">{getText('worldMap.majorMarkets', 'Major Markets')}</span> <span className="text-[#6B1F2B]">{getText('worldMap.presence', 'Presence')}</span>
                  {selectedRegion && (
                    <span className="text-[#C3A35E] text-lg sm:text-xl ml-2">
                      - {regions.find(r => r.id === selectedRegion)?.name}
                    </span>
                  )}
                </h3>
                
                {/* Desktop Version - Full Cards */}
                <div className="hidden sm:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
                  {globalPresence.filter(country => country.tier === 'major').map((market, index) => (
                    <div
                      key={market.name}
                      className={`group p-3 sm:p-4 lg:p-6 border-2 border-[#C3A35E]/30 hover:border-white/80 transition-all duration-500 hover:scale-110 bg-gradient-to-br from-[#6B1F2B] to-[#6B1F2B] backdrop-blur-sm shadow-xl hover:shadow-2xl ${
                        isVisible ? 'animate-fade-in-up' : 'opacity-0'
                      }`}
                      style={{ animationDelay: `${1200 + index * 200}ms` }}
                    >
                      <div className="flex items-center space-x-3 sm:space-x-4 mb-3 sm:mb-4">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-harvics-red to-harvics-red flex items-center justify-center shadow-2xl ring-4 ring-harvics-red/30 group-hover:ring-harvics-red/60 transition-all duration-300">
                          <span className="text-white text-xl sm:text-2xl">
                            {market.flag}
                          </span>
                        </div>
                        <div>
                          <h4 className="text-base sm:text-lg font-bold text-white group-hover:text-[#C3A35E] transition-colors duration-300">
                            {market.name}
                          </h4>
                          <p className="text-white text-sm font-medium">
                            {getText('worldMap.majorMarket', 'Major Market')}
                          </p>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <p className="text-harvics-red font-bold text-sm">
                          {getText('worldMap.since', 'Since')}: {market.established}
                        </p>
                        <div className="flex items-center space-x-2">
                          <span className="text-harvics-red text-sm">📧</span>
                          <span className="text-white text-sm font-medium">{getOfficeEmail(market.code)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Mobile Version - Compact List */}
                <div className="sm:hidden space-y-2">
                  {globalPresence.filter(country => country.tier === 'major').map((market, index) => (
                    <div
                      key={market.name}
                      className={`border border-harvics-red/30 rounded-lg overflow-hidden transition-all duration-300 ${
                        isVisible ? 'animate-fade-in-up' : 'opacity-0'
                      }`}
                      style={{ animationDelay: `${1200 + index * 100}ms` }}
                    >
                      {/* Country Header - Always Visible */}
                      <button
                        onClick={() => setExpandedCountry(expandedCountry === market.name ? null : market.name)}
                        className="w-full p-3 bg-gradient-to-r from-[#6B1F2B] to-[#6B1F2B] hover:from-[#6B1F2B] hover:to-[#6B1F2B] transition-all duration-300 flex items-center justify-between border border-[#C3A35E]/30"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-harvics-red to-harvics-red flex items-center justify-center shadow-lg rounded">
                            <span className="text-white text-sm">
                              {market.flag}
                            </span>
                          </div>
                          <div className="text-left">
                            <h4 className="text-sm font-bold text-white">
                              {market.name}
                            </h4>
                            <p className="text-xs text-[#C3A35E]/80">
                              {getText('worldMap.majorMarket', 'Major Market')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-harvics-red font-medium">
                            Since {market.established}
                          </span>
                          <svg 
                            className={`w-4 h-4 text-white transition-transform duration-300 ${
                              expandedCountry === market.name ? 'rotate-180' : 'rotate-0'
                            }`} 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </button>

                      {/* Expanded Content */}
                      {expandedCountry === market.name && (
                        <div className="p-3 bg-white border-t border-[#C3A35E]/30 animate-fadeInUp">
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <span className="text-harvics-red text-sm">📧</span>
                              <span className="text-white text-sm font-medium">{getOfficeEmail(market.code)}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-harvics-red text-sm">🏢</span>
                              <span className="text-white text-sm">Major Market Hub</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-harvics-red text-sm">📅</span>
                              <span className="text-white text-sm">Established {market.established}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Stats Section */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 lg:gap-8">
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-black mb-2">40</div>
                  <div className="text-white font-medium text-sm lg:text-base" style={{ color: '#000000' }}>{getText('worldMap.countriesServed', 'Countries Served')}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-harvics-red mb-2">6</div>
                  <div className="text-white font-medium text-sm lg:text-base" style={{ color: '#000000' }}>{getText('worldMap.majorMarketsCount', 'Major Markets')}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-black mb-2">6</div>
                  <div className="text-white font-medium text-sm lg:text-base" style={{ color: '#000000' }}>{getText('worldMap.productCategoriesCount', 'Product Categories')}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-harvics-red mb-2">2019</div>
                  <div className="text-white font-medium text-sm lg:text-base" style={{ color: '#000000' }}>{getText('worldMap.establishedYear', 'Established')}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default InteractiveWorldMap