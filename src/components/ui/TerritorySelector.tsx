'use client'

import React, { useCallback, useEffect } from 'react'
import { useTerritory } from '@/contexts/TerritoryContext'

interface TerritorySelectorProps {
  onSelectionChange?: (path: string) => void
  showLabels?: boolean
  className?: string
}

export default function TerritorySelector({ 
  onSelectionChange, 
  showLabels = true,
  className = '' 
}: TerritorySelectorProps) {
  const {
    selectedContinent,
    selectedRegional,
    selectedCountry,
    selectedCity,
    selectedDistrict,
    selectedStreet,
    selectedPoint,
    continents,
    regionals,
    countries,
    cities,
    districts,
    streets,
    points,
    setSelectedContinent,
    setSelectedRegional,
    setSelectedCountry,
    setSelectedCity,
    setSelectedDistrict,
    setSelectedStreet,
    setSelectedPoint,
    fullPath
  } = useTerritory()

  // Build path string for display
  const buildPath = useCallback(() => {
    const parts = []
    if (selectedContinent) parts.push(selectedContinent.name)
    if (selectedRegional) parts.push(selectedRegional.name)
    if (selectedCountry) parts.push(selectedCountry.name)
    if (selectedCity) parts.push(selectedCity.name)
    if (selectedDistrict) parts.push(selectedDistrict.name)
    if (selectedStreet) parts.push(selectedStreet.name)
    if (selectedPoint) parts.push(selectedPoint.name)
    return parts.join(' / ') || 'Select territory...'
  }, [selectedContinent, selectedRegional, selectedCountry, selectedCity, selectedDistrict, selectedStreet, selectedPoint])

  useEffect(() => {
    if (onSelectionChange) {
      onSelectionChange(buildPath())
    }
  }, [buildPath, onSelectionChange])

  return (
    <div className={`territory-selector ${className}`}>
      {showLabels && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">Territory Selection</h3>
          <div className="text-sm text-black bg-white p-3 rounded">
            <strong>Selected:</strong> {buildPath()}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Level 1: Continent */}
        <div>
          <label className="block text-sm font-medium mb-2">
            1. Continent
          </label>
          <select
            value={selectedContinent?.id || ''}
            onChange={(e) => {
              const continent = continents.find(c => c.id === e.target.value)
              setSelectedContinent(continent || null)
            }}
            className="w-full p-2 border border-black300 rounded-md focus:ring-2 focus:ring-black focus:border-white"
          >
            <option value="">Select Continent</option>
            {continents.map((continent) => (
              <option key={continent.id} value={continent.id}>
                {continent.name}
              </option>
            ))}
          </select>
        </div>

        {/* Level 2: Regional */}
        {selectedContinent && (
          <div>
            <label className="block text-sm font-medium mb-2">
              2. Regional
            </label>
            <select
              value={selectedRegional?.id || ''}
              onChange={(e) => {
                const regional = regionals.find(r => r.id === e.target.value)
                setSelectedRegional(regional || null)
              }}
              className="w-full p-2 border border-black300 rounded-md focus:ring-2 focus:ring-black focus:border-white"
              disabled={!selectedContinent}
            >
              <option value="">Select Regional</option>
              {regionals.map((regional) => (
                <option key={regional.id} value={regional.id}>
                  {regional.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Level 3: Country */}
        {selectedRegional && (
          <div>
            <label className="block text-sm font-medium mb-2">
              3. Country
            </label>
            <select
              value={selectedCountry?.id || ''}
              onChange={(e) => {
                const country = countries.find(c => c.id === e.target.value)
                setSelectedCountry(country || null)
              }}
              className="w-full p-2 border border-black300 rounded-md focus:ring-2 focus:ring-black focus:border-white"
              disabled={!selectedRegional}
            >
              <option value="">Select Country</option>
              {countries.map((country) => (
                <option key={country.id} value={country.id}>
                  {country.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Level 4: City */}
        {selectedCountry && (
          <div>
            <label className="block text-sm font-medium mb-2">
              4. City
            </label>
            <select
              value={selectedCity?.id || ''}
              onChange={(e) => {
                const city = cities.find(c => c.id === e.target.value)
                setSelectedCity(city || null)
              }}
              className="w-full p-2 border border-black300 rounded-md focus:ring-2 focus:ring-black focus:border-white"
              disabled={!selectedCountry}
            >
              <option value="">Select City</option>
              {cities.map((city) => (
                <option key={city.id} value={city.id}>
                  {city.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Level 5: District */}
        {selectedCity && (
          <div>
            <label className="block text-sm font-medium mb-2">
              5. District
            </label>
            <select
              value={selectedDistrict?.id || ''}
              onChange={(e) => {
                const district = districts.find(d => d.id === e.target.value)
                setSelectedDistrict(district || null)
              }}
              className="w-full p-2 border border-black300 rounded-md focus:ring-2 focus:ring-black focus:border-white"
              disabled={!selectedCity}
            >
              <option value="">Select District</option>
              {districts.map((district) => (
                <option key={district.id} value={district.id}>
                  {district.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Level 6: Street */}
        {selectedDistrict && (
          <div>
            <label className="block text-sm font-medium mb-2">
              6. Street
            </label>
            <select
              value={selectedStreet?.id || ''}
              onChange={(e) => {
                const street = streets.find(s => s.id === e.target.value)
                setSelectedStreet(street || null)
              }}
              className="w-full p-2 border border-black300 rounded-md focus:ring-2 focus:ring-black focus:border-white"
              disabled={!selectedDistrict}
            >
              <option value="">Select Street</option>
              {streets.map((street) => (
                <option key={street.id} value={street.id}>
                  {street.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Level 7: Point */}
        {selectedStreet && (
          <div>
            <label className="block text-sm font-medium mb-2">
              7. Point/Location
            </label>
            <select
              value={selectedPoint?.id || ''}
              onChange={(e) => {
                const point = points.find(p => p.id === e.target.value)
                setSelectedPoint(point || null)
              }}
              className="w-full p-2 border border-black300 rounded-md focus:ring-2 focus:ring-black focus:border-white"
              disabled={!selectedStreet}
            >
              <option value="">Select Point</option>
              {points.map((point) => (
                <option key={point.id} value={point.id}>
                  {point.name} {point.point_type ? `(${point.point_type})` : ''}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Display full path if point is selected */}
      {fullPath && selectedPoint && (
        <div className="mt-4 p-4 bg-white/10 border border-white rounded-md">
          <div className="text-sm font-semibold mb-2">Complete Territory Path:</div>
          <div className="text-sm text-black">{fullPath.fullPath}</div>
        </div>
      )}
    </div>
  )
}
