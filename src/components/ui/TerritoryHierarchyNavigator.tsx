'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useLocale } from 'next-intl'
import { territoryService, Territory, TerritoryPath } from '@/services/territoryService'

interface TerritoryHierarchyNavigatorProps {
  onTerritorySelect?: (territory: Territory, hierarchy: TerritoryPath) => void
  initialLocationId?: string
  showFullPath?: boolean
  className?: string
}

export default function TerritoryHierarchyNavigator({
  onTerritorySelect,
  initialLocationId,
  showFullPath = true,
  className = ''
}: TerritoryHierarchyNavigatorProps) {
  const locale = useLocale()
  const [hierarchy, setHierarchy] = useState<TerritoryPath | null>(null)
  const [selectedTier, setSelectedTier] = useState<string | null>(null)
  const [expandedTiers, setExpandedTiers] = useState<Set<string>>(new Set(['globe']))
  const [children, setChildren] = useState<Record<string, Territory[]>>({})
  const [loading, setLoading] = useState(false)

  // Set locale
  useEffect(() => {
    territoryService.setLocale(locale)
  }, [locale])

  const loadChildren = useCallback(async (parentId: string, tier: 'globe' | 'continent' | 'region' | 'country' | 'city' | 'district' | 'location') => {
    try {
      const tierChildren = await territoryService.getChildren(parentId, tier, locale)
      setChildren(prev => ({
        ...prev,
        [tier]: tierChildren
      }))
    } catch (error) {
      console.error(`Failed to load ${tier} children:`, error)
    }
  }, [locale])

  const loadFullPath = useCallback(async (locationId: string) => {
    setLoading(true)
    try {
      const path = await territoryService.getFullPath(locationId, locale)
      if (path) {
        setHierarchy(path)
        // Expand all tiers
        const tiers = ['globe', 'continent', 'region', 'country', 'city', 'district', 'location']
        setExpandedTiers(new Set(tiers))
        // Load children for each tier
        if (path.globe) await loadChildren('globe', 'globe')
        if (path.continent) await loadChildren(path.continent.id, 'continent')
        if (path.region) await loadChildren(path.region.id, 'region')
        if (path.country) await loadChildren(path.country.id, 'country')
        if (path.city) await loadChildren(path.city.id, 'city')
        if (path.district) await loadChildren(path.district.id, 'district')
        if (path.location) await loadChildren(path.location.id, 'location')
        
        if (onTerritorySelect && path.location) {
          onTerritorySelect(path.location, path)
        }
      }
    } catch (error) {
      console.error('Failed to load full path:', error)
    } finally {
      setLoading(false)
    }
  }, [locale, loadChildren, onTerritorySelect])

  // Load initial hierarchy if location ID provided
  useEffect(() => {
    if (initialLocationId) {
      loadFullPath(initialLocationId)
    } else {
      // Load globe level by default
      loadChildren('globe', 'globe')
    }
  }, [initialLocationId, loadChildren, loadFullPath])

  const handleTierClick = (tier: string, territory?: Territory) => {
    setSelectedTier(tier)
    
    // Toggle expansion
    setExpandedTiers(prev => {
      const newSet = new Set(prev)
      if (newSet.has(tier)) {
        newSet.delete(tier)
      } else {
        newSet.add(tier)
      }
      return newSet
    })

    // Load children if territory provided
    if (territory) {
      const tierMap: Record<string, 'globe' | 'continent' | 'region' | 'country' | 'city' | 'district' | 'location'> = {
        'globe': 'globe',
        'continent': 'continent',
        'region': 'region',
        'country': 'country',
        'city': 'city',
        'district': 'district',
        'location': 'location'
      }
      
      const tierType = tierMap[tier]
      if (tierType) {
        loadChildren(territory.id, tierType)
      }
    }
  }

  const handleTerritorySelect = async (territory: Territory, tier: string) => {
    // Update hierarchy based on selected territory
    const newHierarchy: TerritoryPath = { ...hierarchy }
    
    switch (tier) {
      case 'continent':
        newHierarchy.continent = territory
        newHierarchy.region = undefined
        newHierarchy.country = undefined
        newHierarchy.city = undefined
        newHierarchy.district = undefined
        newHierarchy.location = undefined
        break
      case 'region':
        newHierarchy.region = territory
        newHierarchy.country = undefined
        newHierarchy.city = undefined
        newHierarchy.district = undefined
        newHierarchy.location = undefined
        break
      case 'country':
        newHierarchy.country = territory
        newHierarchy.city = undefined
        newHierarchy.district = undefined
        newHierarchy.location = undefined
        break
      case 'city':
        newHierarchy.city = territory
        newHierarchy.district = undefined
        newHierarchy.location = undefined
        break
      case 'district':
        newHierarchy.district = territory
        newHierarchy.location = undefined
        break
      case 'location':
        newHierarchy.location = territory
        break
    }

    setHierarchy(newHierarchy)
    
    // Load children for selected tier
    const tierMap: Record<string, 'globe' | 'continent' | 'region' | 'country' | 'city' | 'district' | 'location'> = {
      'continent': 'continent',
      'region': 'region',
      'country': 'country',
      'city': 'city',
      'district': 'district',
      'location': 'location'
    }
    
    const tierType = tierMap[tier]
    if (tierType) {
      await loadChildren(territory.id, tierType)
    }

    // Build full path
    const fullPath = territoryService.buildPathString(newHierarchy, locale)
    newHierarchy.fullPath = fullPath
    setHierarchy(newHierarchy)

    if (onTerritorySelect) {
      onTerritorySelect(territory, newHierarchy)
    }
  }

  const TierCard = ({ 
    tier, 
    territory, 
    label, 
    icon 
  }: { 
    tier: string
    territory?: Territory
    label: string
    icon: string
  }) => {
    const isExpanded = expandedTiers.has(tier)
    const isSelected = selectedTier === tier
    const tierChildren = children[tier] || []

    return (
      <div className={`border rounded-lg p-4 ${isSelected ? 'border-white bg-white/5' : 'border-black200'}`}>
        <div 
          className="flex items-center justify-between cursor-pointer"
          onClick={() => handleTierClick(tier, territory)}
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">{icon}</span>
            <div>
              <div className="font-semibold text-sm text-black">{label}</div>
              {territory && (
                <div className="text-lg font-bold text-black">
                  {territoryService.getLocalizedName(territory, locale)}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {territory && (
              <span className="text-xs text-black">
                {territory.code || ''}
              </span>
            )}
            <span className="text-black">
              {isExpanded ? '▼' : '▶'}
            </span>
          </div>
        </div>

        {isExpanded && (
          <div className="mt-4 space-y-2">
            {territory ? (
              // Show selected territory details
              <div className="bg-white p-3 rounded">
                <div className="text-sm">
                  <strong>Selected:</strong> {territoryService.getLocalizedName(territory, locale)}
                  {territory.currency && <span className="ml-2">({territory.currency})</span>}
                </div>
              </div>
            ) : (
              // Show children list
              <div className="space-y-1">
                {tierChildren.length > 0 ? (
                  tierChildren.map((child) => (
                    <div
                      key={child.id}
                      onClick={() => handleTerritorySelect(child, tier)}
                      className="p-2 hover:bg-white/10 rounded cursor-pointer border border-transparent hover:border-[#C3A35E]/30"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">
                          {territoryService.getLocalizedName(child, locale)}
                        </span>
                        {child.code && (
                          <span className="text-xs text-black">{child.code}</span>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-black p-2">
                    {loading ? 'Loading...' : 'No items available'}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={`territory-hierarchy-navigator ${className}`}>
      {showFullPath && hierarchy?.fullPath && (
        <div className="mb-6 p-4 bg-white/10 border border-white rounded-lg">
          <div className="text-sm font-semibold text-black mb-1">Complete Territory Path:</div>
          <div className="text-lg font-bold text-black">{hierarchy.fullPath}</div>
        </div>
      )}

      <div className="space-y-3">
        <TierCard 
          tier="globe" 
          territory={hierarchy?.globe}
          label="Tier 1: Globe" 
          icon="🌍"
        />
        
        {hierarchy?.continent && (
          <TierCard 
            tier="continent" 
            territory={hierarchy.continent}
            label="Tier 2: Continent" 
            icon="🌍"
          />
        )}

        {hierarchy?.region && (
          <TierCard 
            tier="region" 
            territory={hierarchy.region}
            label="Tier 3: Region" 
            icon="🗺️"
          />
        )}

        {hierarchy?.country && (
          <TierCard 
            tier="country" 
            territory={hierarchy.country}
            label="Tier 4: Country" 
            icon="🇬🇧"
          />
        )}

        {hierarchy?.city && (
          <TierCard 
            tier="city" 
            territory={hierarchy.city}
            label="Tier 5: City" 
            icon="🏙️"
          />
        )}

        {hierarchy?.district && (
          <TierCard 
            tier="district" 
            territory={hierarchy.district}
            label="Tier 6: District" 
            icon="📍"
          />
        )}

        {hierarchy?.location && (
          <TierCard 
            tier="location" 
            territory={hierarchy.location}
            label="Tier 7: Location" 
            icon="🏪"
          />
        )}
      </div>

      {!hierarchy && (
        <div className="text-center py-8 text-black">
          Select a territory to view hierarchy
        </div>
      )}
    </div>
  )
}
