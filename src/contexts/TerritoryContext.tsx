'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import apiClient from '@/lib/api'

export interface TerritoryLevel {
  id: string
  name: string
  code?: string
  [key: string]: any
}

export interface TerritoryPath {
  global?: TerritoryLevel
  continent?: TerritoryLevel
  regional?: TerritoryLevel
  country?: TerritoryLevel
  city?: TerritoryLevel
  district?: TerritoryLevel
  street?: TerritoryLevel
  point?: TerritoryLevel
  fullPath?: string
}

interface TerritoryContextType {
  // Current selections
  selectedGlobal: TerritoryLevel | null
  selectedContinent: TerritoryLevel | null
  selectedRegional: TerritoryLevel | null
  selectedCountry: TerritoryLevel | null
  selectedCity: TerritoryLevel | null
  selectedDistrict: TerritoryLevel | null
  selectedStreet: TerritoryLevel | null
  selectedPoint: TerritoryLevel | null

  // Full path
  fullPath: TerritoryPath | null

  // Available options
  continents: TerritoryLevel[]
  regionals: TerritoryLevel[]
  countries: TerritoryLevel[]
  cities: TerritoryLevel[]
  districts: TerritoryLevel[]
  streets: TerritoryLevel[]
  points: TerritoryLevel[]

  // Actions
  setSelectedGlobal: (global: TerritoryLevel | null) => void
  setSelectedContinent: (continent: TerritoryLevel | null) => void
  setSelectedRegional: (regional: TerritoryLevel | null) => void
  setSelectedCountry: (country: TerritoryLevel | null) => void
  setSelectedCity: (city: TerritoryLevel | null) => void
  setSelectedDistrict: (district: TerritoryLevel | null) => void
  setSelectedStreet: (street: TerritoryLevel | null) => void
  setSelectedPoint: (point: TerritoryLevel | null) => void

  // Load children
  loadContinents: () => Promise<void>
  loadRegionals: (continentId: string) => Promise<void>
  loadCountries: (regionalId: string) => Promise<void>
  loadCities: (countryId: string) => Promise<void>
  loadDistricts: (cityId: string) => Promise<void>
  loadStreets: (districtId: string) => Promise<void>
  loadPoints: (streetId: string) => Promise<void>

  // Load full path from point
  loadFullPath: (pointId: string) => Promise<void>

  // Reset
  reset: () => void
  resetFromLevel: (level: 'continent' | 'regional' | 'country' | 'city' | 'district' | 'street' | 'point') => void
}

const TerritoryContext = createContext<TerritoryContextType | undefined>(undefined)

export function TerritoryProvider({ children }: { children: ReactNode }) {
  const [selectedGlobal, setSelectedGlobal] = useState<TerritoryLevel | null>(null)
  const [selectedContinent, setSelectedContinent] = useState<TerritoryLevel | null>(null)
  const [selectedRegional, setSelectedRegional] = useState<TerritoryLevel | null>(null)
  const [selectedCountry, setSelectedCountry] = useState<TerritoryLevel | null>(null)
  const [selectedCity, setSelectedCity] = useState<TerritoryLevel | null>(null)
  const [selectedDistrict, setSelectedDistrict] = useState<TerritoryLevel | null>(null)
  const [selectedStreet, setSelectedStreet] = useState<TerritoryLevel | null>(null)
  const [selectedPoint, setSelectedPoint] = useState<TerritoryLevel | null>(null)

  const [fullPath, setFullPath] = useState<TerritoryPath | null>(null)

  const [continents, setContinents] = useState<TerritoryLevel[]>([])
  const [regionals, setRegionals] = useState<TerritoryLevel[]>([])
  const [countries, setCountries] = useState<TerritoryLevel[]>([])
  const [cities, setCities] = useState<TerritoryLevel[]>([])
  const [districts, setDistricts] = useState<TerritoryLevel[]>([])
  const [streets, setStreets] = useState<TerritoryLevel[]>([])
  const [points, setPoints] = useState<TerritoryLevel[]>([])

  // Load continents on mount (only in browser)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      loadContinents()
    }
  }, [])

  const loadContinents = async () => {
    try {
      const response = await apiClient.getContinents()
      if (response.data) {
        setContinents(Array.isArray(response.data) ? response.data : [])
      }
    } catch (error) {
      console.error('Failed to load continents:', error)
      setContinents([])
    }
  }

  const loadRegionals = async (continentId: string) => {
    try {
      const response = await apiClient.getRegionals(continentId)
      if (response.data) {
        setRegionals(Array.isArray(response.data) ? response.data : [])
      }
    } catch (error) {
      console.error('Failed to load regionals:', error)
      setRegionals([])
    }
  }

  const loadCountries = async (regionalId: string) => {
    try {
      const response = await apiClient.getCountries(regionalId)
      if (response.data) {
        setCountries(Array.isArray(response.data) ? response.data : [])
      }
    } catch (error) {
      console.error('Failed to load countries:', error)
      setCountries([])
    }
  }

  const loadCities = async (countryId: string) => {
    try {
      const response = await apiClient.getCities(countryId)
      if (response.data) {
        setCities(Array.isArray(response.data) ? response.data : [])
      }
    } catch (error) {
      console.error('Failed to load cities:', error)
      setCities([])
    }
  }

  const loadDistricts = async (cityId: string) => {
    try {
      const response = await apiClient.getDistricts(cityId)
      if (response.data) {
        setDistricts(Array.isArray(response.data) ? response.data : [])
      }
    } catch (error) {
      console.error('Failed to load districts:', error)
      setDistricts([])
    }
  }

  const loadStreets = async (districtId: string) => {
    try {
      const response = await apiClient.getStreets(districtId)
      if (response.data) {
        setStreets(Array.isArray(response.data) ? response.data : [])
      }
    } catch (error) {
      console.error('Failed to load streets:', error)
      setStreets([])
    }
  }

  const loadPoints = async (streetId: string) => {
    try {
      const response = await apiClient.getPoints(streetId)
      if (response.data) {
        setPoints(Array.isArray(response.data) ? response.data : [])
      }
    } catch (error) {
      console.error('Failed to load points:', error)
      setPoints([])
    }
  }

  const loadFullPath = async (pointId: string) => {
    try {
      const response = await apiClient.getTerritoryPath(pointId)
      if (response.data) {
        setFullPath(response.data)
        // Auto-select all levels
        if ((response.data as any).global) setSelectedGlobal((response.data as any).global)
        if ((response.data as any).continent) setSelectedContinent((response.data as any).continent)
        if ((response.data as any).regional) setSelectedRegional((response.data as any).regional)
        if ((response.data as any).country) setSelectedCountry((response.data as any).country)
        if ((response.data as any).city) setSelectedCity((response.data as any).city)
        if ((response.data as any).district) setSelectedDistrict((response.data as any).district)
        if ((response.data as any).street) setSelectedStreet((response.data as any).street)
        if ((response.data as any).point) setSelectedPoint((response.data as any).point)
      }
    } catch (error) {
      console.error('Failed to load full path:', error)
      setFullPath(null)
    }
  }

  // Auto-load children when parent is selected
  useEffect(() => {
    if (selectedContinent?.id) {
      loadRegionals(selectedContinent.id)
      // Reset lower levels
      setSelectedRegional(null)
      setSelectedCountry(null)
      setSelectedCity(null)
      setSelectedDistrict(null)
      setSelectedStreet(null)
      setSelectedPoint(null)
    }
  }, [selectedContinent])

  useEffect(() => {
    if (selectedRegional?.id) {
      loadCountries(selectedRegional.id)
      setSelectedCountry(null)
      setSelectedCity(null)
      setSelectedDistrict(null)
      setSelectedStreet(null)
      setSelectedPoint(null)
    }
  }, [selectedRegional])

  useEffect(() => {
    if (selectedCountry?.id) {
      loadCities(selectedCountry.id)
      setSelectedCity(null)
      setSelectedDistrict(null)
      setSelectedStreet(null)
      setSelectedPoint(null)
    }
  }, [selectedCountry])

  useEffect(() => {
    if (selectedCity?.id) {
      loadDistricts(selectedCity.id)
      setSelectedDistrict(null)
      setSelectedStreet(null)
      setSelectedPoint(null)
    }
  }, [selectedCity])

  useEffect(() => {
    if (selectedDistrict?.id) {
      loadStreets(selectedDistrict.id)
      setSelectedStreet(null)
      setSelectedPoint(null)
    }
  }, [selectedDistrict])

  useEffect(() => {
    if (selectedStreet?.id) {
      loadPoints(selectedStreet.id)
      setSelectedPoint(null)
    }
  }, [selectedStreet])

  const reset = () => {
    setSelectedGlobal(null)
    setSelectedContinent(null)
    setSelectedRegional(null)
    setSelectedCountry(null)
    setSelectedCity(null)
    setSelectedDistrict(null)
    setSelectedStreet(null)
    setSelectedPoint(null)
    setFullPath(null)
    setRegionals([])
    setCountries([])
    setCities([])
    setDistricts([])
    setStreets([])
    setPoints([])
  }

  const resetFromLevel = (level: string) => {
    switch (level) {
      case 'continent':
        setSelectedContinent(null)
        setSelectedRegional(null)
        setSelectedCountry(null)
        setSelectedCity(null)
        setSelectedDistrict(null)
        setSelectedStreet(null)
        setSelectedPoint(null)
        setRegionals([])
        setCountries([])
        setCities([])
        setDistricts([])
        setStreets([])
        setPoints([])
        break
      case 'regional':
        setSelectedRegional(null)
        setSelectedCountry(null)
        setSelectedCity(null)
        setSelectedDistrict(null)
        setSelectedStreet(null)
        setSelectedPoint(null)
        setCountries([])
        setCities([])
        setDistricts([])
        setStreets([])
        setPoints([])
        break
      // ... similar for other levels
    }
  }

  return (
    <TerritoryContext.Provider
      value={{
        selectedGlobal,
        selectedContinent,
        selectedRegional,
        selectedCountry,
        selectedCity,
        selectedDistrict,
        selectedStreet,
        selectedPoint,
        fullPath,
        continents,
        regionals,
        countries,
        cities,
        districts,
        streets,
        points,
        setSelectedGlobal,
        setSelectedContinent,
        setSelectedRegional,
        setSelectedCountry,
        setSelectedCity,
        setSelectedDistrict,
        setSelectedStreet,
        setSelectedPoint,
        loadContinents,
        loadRegionals,
        loadCountries,
        loadCities,
        loadDistricts,
        loadStreets,
        loadPoints,
        loadFullPath,
        reset,
        resetFromLevel
      }}
    >
      {children}
    </TerritoryContext.Provider>
  )
}

export function useTerritory() {
  const context = useContext(TerritoryContext)
  if (context === undefined) {
    throw new Error('useTerritory must be used within a TerritoryProvider')
  }
  return context
}

