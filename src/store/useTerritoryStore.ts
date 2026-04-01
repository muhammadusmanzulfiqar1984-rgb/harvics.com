import { create } from 'zustand'
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

interface TerritoryState {
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

  // Loaders
  loadContinents: () => Promise<void>
  loadRegionals: (continentId: string) => Promise<void>
  loadCountries: (regionalId: string) => Promise<void>
  loadCities: (countryId: string) => Promise<void>
  loadDistricts: (cityId: string) => Promise<void>
  loadStreets: (districtId: string) => Promise<void>
  loadPoints: (streetId: string) => Promise<void>
  loadFullPath: (pointId: string) => Promise<void>

  reset: () => void
  resetFromLevel: (level: 'continent' | 'regional' | 'country' | 'city' | 'district' | 'street' | 'point') => void
}

export const useTerritoryStore = create<TerritoryState>((set, get) => ({
  selectedGlobal: null,
  selectedContinent: null,
  selectedRegional: null,
  selectedCountry: null,
  selectedCity: null,
  selectedDistrict: null,
  selectedStreet: null,
  selectedPoint: null,
  
  fullPath: null,
  
  continents: [],
  regionals: [],
  countries: [],
  cities: [],
  districts: [],
  streets: [],
  points: [],

  setSelectedGlobal: (global) => set({ selectedGlobal: global }),
  
  setSelectedContinent: (continent) => {
    set({ selectedContinent: continent })
    if (continent?.code) {
      get().loadRegionals(continent.code)
      get().resetFromLevel('continent')
    }
  },
  
  setSelectedRegional: (regional) => {
    set({ selectedRegional: regional })
    if (regional?.code) {
      get().loadCountries(regional.code)
      get().resetFromLevel('regional')
    }
  },
  
  setSelectedCountry: (country) => {
    set({ selectedCountry: country })
    if (country?.code) {
      get().loadCities(country.code)
      get().resetFromLevel('country')
    }
  },
  
  setSelectedCity: (city) => {
    set({ selectedCity: city })
    if (city?.code) {
      get().loadDistricts(city.code)
      get().resetFromLevel('city')
    }
  },
  
  setSelectedDistrict: (district) => {
    set({ selectedDistrict: district })
    if (district?.code) {
      get().loadStreets(district.code)
      get().resetFromLevel('district')
    }
  },
  
  setSelectedStreet: (street) => {
    set({ selectedStreet: street })
    if (street?.code) {
      get().loadPoints(street.code)
      get().resetFromLevel('street')
    }
  },
  
  setSelectedPoint: (point) => set({ selectedPoint: point }),

  loadContinents: async () => {
    try {
      const response = await apiClient.getContinents()
      if (response.data) {
        set({ continents: Array.isArray(response.data) ? response.data : [] })
      }
    } catch (error) {
      console.error('Failed to load continents:', error)
      set({ continents: [] })
    }
  },

  loadRegionals: async (continentId) => {
    try {
      const response = await apiClient.getRegionals(continentId)
      if (response.data) {
        set({ regionals: Array.isArray(response.data) ? response.data : [] })
      }
    } catch (error) {
      console.error('Failed to load regionals:', error)
      set({ regionals: [] })
    }
  },

  loadCountries: async (regionalId) => {
    try {
      const response = await apiClient.getCountries(regionalId, undefined)
      if (response.data) {
        set({ countries: Array.isArray(response.data) ? response.data : [] })
      }
    } catch (error) {
      console.error('Failed to load countries:', error)
      set({ countries: [] })
    }
  },

  loadCities: async (countryId) => {
    try {
      const response = await apiClient.getCities(countryId)
      if (response.data) {
        set({ cities: Array.isArray(response.data) ? response.data : [] })
      }
    } catch (error) {
      console.error('Failed to load cities:', error)
      set({ cities: [] })
    }
  },

  loadDistricts: async (cityId) => {
    try {
      const response = await apiClient.getDistricts(cityId)
      if (response.data) {
        set({ districts: Array.isArray(response.data) ? response.data : [] })
      }
    } catch (error) {
      console.error('Failed to load districts:', error)
      set({ districts: [] })
    }
  },

  loadStreets: async (districtId) => {
    try {
      const response = await apiClient.getAreas(districtId)
      if (response.data) {
        set({ streets: Array.isArray(response.data) ? response.data : [] })
      }
    } catch (error) {
      console.error('Failed to load streets:', error)
      set({ streets: [] })
    }
  },

  loadPoints: async (streetId) => {
    try {
      const response = await apiClient.getLocations(streetId, undefined)
      if (response.data) {
        set({ points: Array.isArray(response.data) ? response.data : [] })
      }
    } catch (error) {
      console.error('Failed to load points:', error)
      set({ points: [] })
    }
  },

  loadFullPath: async (pointId) => {
    try {
      const response = await apiClient.getTerritoryHierarchy(pointId)
      if (response.data) {
        const data = response.data as any
        set({
          fullPath: data,
          selectedGlobal: data.global || null,
          selectedContinent: data.continent || null,
          selectedRegional: data.regional || null,
          selectedCountry: data.country || null,
          selectedCity: data.city || null,
          selectedDistrict: data.district || null,
          selectedStreet: data.street || null,
          selectedPoint: data.point || null
        })
      }
    } catch (error) {
      console.error('Failed to load full path:', error)
      set({ fullPath: null })
    }
  },

  reset: () => {
    set({
      selectedGlobal: null,
      selectedContinent: null,
      selectedRegional: null,
      selectedCountry: null,
      selectedCity: null,
      selectedDistrict: null,
      selectedStreet: null,
      selectedPoint: null,
      fullPath: null,
      regionals: [],
      countries: [],
      cities: [],
      districts: [],
      streets: [],
      points: []
    })
  },

  resetFromLevel: (level) => {
    switch (level) {
      case 'continent':
        set({
          selectedRegional: null, selectedCountry: null, selectedCity: null,
          selectedDistrict: null, selectedStreet: null, selectedPoint: null,
          countries: [], cities: [], districts: [], streets: [], points: []
        })
        break
      case 'regional':
        set({
          selectedCountry: null, selectedCity: null, selectedDistrict: null,
          selectedStreet: null, selectedPoint: null,
          cities: [], districts: [], streets: [], points: []
        })
        break
      case 'country':
        set({
          selectedCity: null, selectedDistrict: null, selectedStreet: null, selectedPoint: null,
          districts: [], streets: [], points: []
        })
        break
      case 'city':
        set({
          selectedDistrict: null, selectedStreet: null, selectedPoint: null,
          streets: [], points: []
        })
        break
      case 'district':
        set({ selectedStreet: null, selectedPoint: null, points: [] })
        break
      case 'street':
        set({ selectedPoint: null })
        break
      default:
        break
    }
  }
}))
