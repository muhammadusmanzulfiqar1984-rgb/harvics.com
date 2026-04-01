'use client'

import React, { useState } from 'react'
import { getCountryFlag } from '@/utils/countryFlags'

interface LocationLevel {
  id: string
  name: string
  type: 'global' | 'continent' | 'region' | 'country' | 'city' | 'street' | 'location'
  children?: LocationLevel[]
  flag?: string
  data?: {
    revenue?: number
    growth?: number
    distributors?: number
    retailers?: number
  }
}

// Hierarchical Location Data Structure
const locationHierarchy: LocationLevel = {
  id: 'global',
  name: 'Global',
  type: 'global',
  data: { revenue: 2500000000, growth: 15.5, distributors: 1250, retailers: 15000 },
  children: [
    {
      id: 'europe',
      name: 'Europe',
      type: 'continent',
      data: { revenue: 850000000, growth: 12.3, distributors: 420, retailers: 5200 },
      children: [
        {
          id: 'western-europe',
          name: 'Western Europe',
          type: 'region',
          data: { revenue: 650000000, growth: 14.2, distributors: 320, retailers: 3800 },
          children: [
            {
              id: 'united-kingdom',
              name: 'United Kingdom',
              type: 'country',
              flag: '🇬🇧',
              data: { revenue: 320000000, growth: 16.8, distributors: 180, retailers: 2100 },
              children: [
                {
                  id: 'london',
                  name: 'London',
                  type: 'city',
                  data: { revenue: 180000000, growth: 18.5, distributors: 95, retailers: 1150 },
                  children: [
                    {
                      id: 'edgware-road',
                      name: 'Edgware Road',
                      type: 'street',
                      data: { revenue: 45000000, growth: 22.3, distributors: 25, retailers: 280 },
                      children: [
                        {
                          id: 'victoria-casino',
                          name: 'Victoria Casino (Distribution Center)',
                          type: 'location',
                          data: { revenue: 12000000, growth: 25.5, distributors: 8, retailers: 95 }
                        }
                      ]
                    }
                  ]
                }
              ]
            },
            {
              id: 'france',
              name: 'France',
              type: 'country',
              flag: '🇫🇷',
              data: { revenue: 180000000, growth: 13.5, distributors: 85, retailers: 1050 },
              children: [
                {
                  id: 'paris',
                  name: 'Paris',
                  type: 'city',
                  data: { revenue: 95000000, growth: 15.2, distributors: 45, retailers: 580 }
                }
              ]
            },
            {
              id: 'germany',
              name: 'Germany',
              type: 'country',
              flag: '🇩🇪',
              data: { revenue: 150000000, growth: 11.8, distributors: 55, retailers: 650 }
            }
          ]
        },
        {
          id: 'eastern-europe',
          name: 'Eastern Europe',
          type: 'region',
          data: { revenue: 200000000, growth: 8.5, distributors: 100, retailers: 1400 }
        }
      ]
    },
    {
      id: 'middle-east',
      name: 'Middle East',
      type: 'continent',
      data: { revenue: 650000000, growth: 18.2, distributors: 380, retailers: 4200 },
      children: [
        {
          id: 'gulf-region',
          name: 'Gulf Region',
          type: 'region',
          data: { revenue: 450000000, growth: 20.5, distributors: 280, retailers: 3100 },
          children: [
            {
              id: 'uae',
              name: 'United Arab Emirates',
              type: 'country',
              flag: '🇦🇪',
              data: { revenue: 220000000, growth: 22.3, distributors: 140, retailers: 1650 },
              children: [
                {
                  id: 'dubai',
                  name: 'Dubai',
                  type: 'city',
                  data: { revenue: 150000000, growth: 24.8, distributors: 95, retailers: 1120 }
                }
              ]
            },
            {
              id: 'saudi-arabia',
              name: 'Saudi Arabia',
              type: 'country',
              flag: '🇸🇦',
              data: { revenue: 180000000, growth: 19.5, distributors: 110, retailers: 1280 }
            }
          ]
        }
      ]
    },
    {
      id: 'asia',
      name: 'Asia',
      type: 'continent',
      data: { revenue: 750000000, growth: 22.5, distributors: 350, retailers: 4500 },
      children: [
        {
          id: 'south-asia',
          name: 'South Asia',
          type: 'region',
          data: { revenue: 450000000, growth: 25.2, distributors: 220, retailers: 2800 },
          children: [
            {
              id: 'pakistan',
              name: 'Pakistan',
              type: 'country',
              flag: '🇵🇰',
              data: { revenue: 280000000, growth: 28.5, distributors: 150, retailers: 1900 },
              children: [
                {
                  id: 'karachi',
                  name: 'Karachi',
                  type: 'city',
                  data: { revenue: 120000000, growth: 30.2, distributors: 65, retailers: 820 }
                },
                {
                  id: 'lahore',
                  name: 'Lahore',
                  type: 'city',
                  data: { revenue: 95000000, growth: 27.8, distributors: 50, retailers: 650 }
                }
              ]
            }
          ]
        }
      ]
    },
    {
      id: 'north-america',
      name: 'North America',
      type: 'continent',
      data: { revenue: 250000000, growth: 9.5, distributors: 100, retailers: 1100 }
    }
  ]
}

interface HierarchicalLocationSelectorProps {
  onLocationChange?: (location: LocationLevel) => void
  showAnalytics?: boolean
}

const HierarchicalLocationSelector: React.FC<HierarchicalLocationSelectorProps> = ({
  onLocationChange,
  showAnalytics = true
}) => {
  const [selectedPath, setSelectedPath] = useState<LocationLevel[]>([])
  const [currentLevel, setCurrentLevel] = useState<LocationLevel>(locationHierarchy)

  const handleLocationSelect = (location: LocationLevel) => {
    const newPath = [...selectedPath, location]
    setSelectedPath(newPath)
    
    if (location.children && location.children.length > 0) {
      setCurrentLevel(location)
    } else {
      // Final location selected
      if (onLocationChange) {
        onLocationChange(location)
      }
    }
  }

  const handleBack = () => {
    if (selectedPath.length > 0) {
      const newPath = selectedPath.slice(0, -1)
      setSelectedPath(newPath)
      setCurrentLevel(newPath.length > 0 ? newPath[newPath.length - 1] : locationHierarchy)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const getBreadcrumb = () => {
    return selectedPath.map(loc => loc.name).join(' / ')
  }

  return (
    <div className="bg-[#1a1a1a] border border-[#333] rounded-lg p-4">
      {/* Breadcrumb Navigation */}
      {selectedPath.length > 0 && (
        <div className="mb-4 pb-3 border-b border-[#333]">
          <button
            onClick={handleBack}
            className="text-white hover:text-[#C3A35E]/90 text-sm font-semibold flex items-center space-x-2 mb-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back</span>
          </button>
          <div className="text-xs text-black">
            {getBreadcrumb()}
          </div>
        </div>
      )}

      {/* Current Level Title */}
      <div className="mb-4">
        <h3 className="text-lg font-bold text-white flex items-center space-x-2">
          {currentLevel.type === 'global' && <span>🌍</span>}
          {currentLevel.type === 'continent' && <span>🌎</span>}
          {currentLevel.type === 'region' && <span>🗺️</span>}
          {currentLevel.type === 'country' && currentLevel.flag && <span>{currentLevel.flag}</span>}
          {currentLevel.type === 'city' && <span>🏙️</span>}
          {currentLevel.type === 'street' && <span>🛣️</span>}
          {currentLevel.type === 'location' && <span>📍</span>}
          <span>{currentLevel.name}</span>
        </h3>
        {showAnalytics && currentLevel.data && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
            <div className="bg-[#2a2a2a] p-2 rounded border border-[#333]">
              <div className="text-xs text-black">Revenue</div>
              <div className="text-sm font-bold text-white">{formatCurrency(currentLevel.data.revenue || 0)}</div>
            </div>
            <div className="bg-[#2a2a2a] p-2 rounded border border-[#333]">
              <div className="text-xs text-black">Growth</div>
              <div className="text-sm font-bold text-green-400">+{currentLevel.data.growth?.toFixed(1)}%</div>
            </div>
            <div className="bg-[#2a2a2a] p-2 rounded border border-[#333]">
              <div className="text-xs text-black">Distributors</div>
              <div className="text-sm font-bold text-white">{currentLevel.data.distributors || 0}</div>
            </div>
            <div className="bg-[#2a2a2a] p-2 rounded border border-[#333]">
              <div className="text-xs text-black">Retailers</div>
              <div className="text-sm font-bold text-white">{currentLevel.data.retailers || 0}</div>
            </div>
          </div>
        )}
      </div>

      {/* Location Options */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {currentLevel.children?.map((location) => (
          <button
            key={location.id}
            onClick={() => handleLocationSelect(location)}
            className="w-full text-left p-3 bg-[#2a2a2a] hover:bg-[#333] border border-[#333] hover:border-white/50 rounded transition-all duration-200 group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {location.flag && <span className="text-2xl">{location.flag}</span>}
                <div>
                  <div className="font-semibold text-white group-hover:text-[#C3A35E] transition-colors">
                    {location.name}
                  </div>
                  {showAnalytics && location.data && (
                    <div className="text-xs text-black mt-1">
                      {formatCurrency(location.data.revenue || 0)} • +{location.data.growth?.toFixed(1)}%
                    </div>
                  )}
                </div>
              </div>
              {location.children && location.children.length > 0 && (
                <svg className="w-5 h-5 text-black group-hover:text-[#C3A35E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

export default HierarchicalLocationSelector

