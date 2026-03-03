'use client'

import React, { useState, useEffect } from 'react'
import { GeographicScope, GeographicLocation } from '@/types/geographicScope'

interface GeographicHierarchySelectorProps {
  selectedPath: string[]  // ['EU', 'WEU', 'GBR', 'LON', 'WEST', 'EDG', 'VIC-CAS-001']
  levels: ('continent' | 'region' | 'country' | 'city' | 'district' | 'area' | 'location')[]
  onChange: (path: string[]) => void
  disabled?: boolean
}

export default function GeographicHierarchySelector({
  selectedPath = [],
  levels,
  onChange,
  disabled = false
}: GeographicHierarchySelectorProps) {
  const [currentPath, setCurrentPath] = useState<string[]>(selectedPath)

  useEffect(() => {
    setCurrentPath(selectedPath)
  }, [selectedPath])

  const handleLevelChange = (levelIndex: number, value: string) => {
    const newPath = [...currentPath]
    newPath[levelIndex] = value
    // Clear deeper levels when a level changes
    newPath.splice(levelIndex + 1)
    setCurrentPath(newPath)
    onChange(newPath)
  }

  // Mock data - in production, fetch from API based on parent selections
  const getOptionsForLevel = (levelIndex: number): Array<{ code: string; name: string }> => {
    const level = levels[levelIndex]
    const parentPath = currentPath.slice(0, levelIndex)

    // Mock data - replace with API calls
    switch (level) {
      case 'continent':
        return [
          { code: 'EU', name: 'Europe' },
          { code: 'AS', name: 'Asia' },
          { code: 'NA', name: 'North America' },
          { code: 'SA', name: 'South America' },
          { code: 'AF', name: 'Africa' },
          { code: 'OC', name: 'Oceania' }
        ]
      case 'region':
        if (parentPath[0] === 'EU') {
          return [
            { code: 'WEU', name: 'Western Europe' },
            { code: 'EEU', name: 'Eastern Europe' },
            { code: 'NEU', name: 'Northern Europe' },
            { code: 'SEU', name: 'Southern Europe' }
          ]
        }
        return []
      case 'country':
        if (parentPath[1] === 'WEU') {
          return [
            { code: 'GBR', name: 'United Kingdom' },
            { code: 'FRA', name: 'France' },
            { code: 'DEU', name: 'Germany' },
            { code: 'ESP', name: 'Spain' },
            { code: 'ITA', name: 'Italy' }
          ]
        }
        return []
      case 'city':
        if (parentPath[2] === 'GBR') {
          return [
            { code: 'LON', name: 'London' },
            { code: 'MAN', name: 'Manchester' },
            { code: 'BIR', name: 'Birmingham' },
            { code: 'LIV', name: 'Liverpool' }
          ]
        }
        return []
      case 'district':
        if (parentPath[3] === 'LON') {
          return [
            { code: 'WEST', name: 'Westminster' },
            { code: 'CAM', name: 'Camden' },
            { code: 'KIN', name: 'Kensington' },
            { code: 'ISL', name: 'Islington' }
          ]
        }
        return []
      case 'area':
        if (parentPath[4] === 'WEST') {
          return [
            { code: 'EDG', name: 'Edgeware Road' },
            { code: 'OXF', name: 'Oxford Street' },
            { code: 'REG', name: 'Regent Street' }
          ]
        }
        return []
      case 'location':
        if (parentPath[5] === 'EDG') {
          return [
            { code: 'VIC-CAS-001', name: 'Victoria Casino' },
            { code: 'EDG-RET-002', name: 'Edgeware Retail Store' }
          ]
        }
        return []
      default:
        return []
    }
  }

  const getLevelLabel = (level: string): string => {
    const labels: Record<string, string> = {
      continent: '🌍 Continent',
      region: '📍 Region',
      country: '🇬🇧 Country',
      city: '🏙️ City',
      district: '📍 District',
      area: '🏢 Area/Street',
      location: '🎯 Location'
    }
    return labels[level] || level
  }

  return (
    <div className="space-y-4">
      {levels.map((level, index) => {
        const options = getOptionsForLevel(index)
        const value = currentPath[index] || ''
        const isEnabled = index === 0 || currentPath[index - 1] !== undefined

        return (
          <div key={level} className="flex items-center gap-4">
            <label className="w-32 text-sm font-medium text-black">
              {getLevelLabel(level)}
            </label>
            <select
              value={value}
              onChange={(e) => handleLevelChange(index, e.target.value)}
              disabled={disabled || !isEnabled || options.length === 0}
              className="flex-1 px-4 py-2 border border-black300 rounded-lg focus:ring-2 focus:ring-black focus:border-white disabled:bg-white disabled:cursor-not-allowed"
            >
              <option value="">Select {level}...</option>
              {options.map((option) => (
                <option key={option.code} value={option.code}>
                  {option.name}
                </option>
              ))}
            </select>
          </div>
        )
      })}

      {/* Display Full Path */}
      {currentPath.length > 0 && (
        <div className="mt-4 p-4 bg-white rounded-lg">
          <div className="text-sm text-black mb-1">Full Geographic Path:</div>
          <div className="font-semibold text-black">
            Global / {currentPath.map((code, idx) => {
              const options = getOptionsForLevel(idx)
              const option = options.find(opt => opt.code === code)
              return option?.name || code
            }).filter(Boolean).join(' / ')}
          </div>
        </div>
      )}
    </div>
  )
}

