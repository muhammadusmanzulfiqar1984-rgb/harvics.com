'use client'

import { useState } from 'react'
import { useLocale } from 'next-intl'
import { useCountry } from '@/contexts/CountryContext'
import Link from 'next/link'

export default function FindStorePage() {
  const locale = useLocale()
  const { selectedCountry, countryData } = useCountry()
  const [selectedCity, setSelectedCity] = useState<string>('')
  const [selectedArea, setSelectedArea] = useState<string>('')

  // Sample data - in real app, fetch from API
  const citiesByCountry: Record<string, string[]> = {
    'united-states': ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix'],
    'pakistan': ['Karachi', 'Lahore', 'Islamabad', 'Faisalabad', 'Rawalpindi'],
    'uae': ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Ras Al Khaimah'],
    'saudi-arabia': ['Riyadh', 'Jeddah', 'Mecca', 'Medina', 'Dammam'],
    'united-kingdom': ['London', 'Manchester', 'Birmingham', 'Liverpool', 'Leeds'],
    'india': ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai']
  }

  const areasByCity: Record<string, string[]> = {
    'New York': ['Manhattan', 'Brooklyn', 'Queens', 'Bronx', 'Staten Island'],
    'Los Angeles': ['Downtown LA', 'Hollywood', 'Beverly Hills', 'Santa Monica', 'Pasadena'],
    'Karachi': ['Clifton', 'DHA', 'Gulshan', 'PECHS', 'Saddar'],
    'Lahore': ['Gulberg', 'DHA', 'Model Town', 'Johar Town', 'Faisal Town'],
    'Dubai': ['Downtown', 'Marina', 'JBR', 'Business Bay', 'Deira'],
    'Abu Dhabi': ['Corniche', 'Al Markaziyah', 'Al Khalidiyah', 'Yas Island', 'Saadiyat'],
    'London': ['Westminster', 'Camden', 'Islington', 'Hackney', 'Tower Hamlets'],
    'Mumbai': ['South Mumbai', 'Andheri', 'Bandra', 'Powai', 'Navi Mumbai']
  }

  const currentCities = citiesByCountry[selectedCountry || 'united-states'] || []
  const currentAreas = selectedCity ? (areasByCity[selectedCity] || []) : []

  const stores = [
    { id: 1, name: 'Harvics Store Downtown', address: '123 Main Street', city: selectedCity || 'Select City', area: selectedArea || 'Select Area', phone: '+1 234 567 8900', hours: '9 AM - 9 PM' },
    { id: 2, name: 'Harvics Store Mall', address: '456 Mall Road', city: selectedCity || 'Select City', area: selectedArea || 'Select Area', phone: '+1 234 567 8901', hours: '10 AM - 10 PM' }
  ]

  return (
    <main className="min-h-screen bg-[#F5F1E8] pt-20">
      <section className="h-[400px] relative bg-[#6B1F2B] overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute inset-0">
           <div className="absolute top-0 left-0 w-full h-full bg-[url('/patterns/grid.svg')] opacity-10"></div>
           <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#C3A35E] rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
           <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#C3A35E] rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
        </div>
        
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-medium text-white mb-6">
            Find a Store
          </h1>
          <p className="text-lg md:text-xl text-white/80 max-w-3xl mx-auto font-light leading-relaxed">
            Locate Harvics stores near you
          </p>
        </div>
      </section>

      <div className="relative px-4 pb-20 -mt-20 z-20 max-w-7xl mx-auto">
        {/* Location Selector */}
        <div className="bg-white p-8 mb-8 border border-gray-100 shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Country */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
              <div className="px-4 py-3 bg-gray-50 border border-gray-200 text-gray-900 font-medium">
                {countryData?.countryName || selectedCountry || 'Select Country'}
              </div>
            </div>

            {/* City */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
              <select
                value={selectedCity}
                onChange={(e) => {
                  setSelectedCity(e.target.value)
                  setSelectedArea('')
                }}
                className="w-full px-4 py-3 border border-gray-200 text-gray-900 font-medium focus:border-[#6B1F2B] focus:ring-1 focus:ring-[#6B1F2B] focus:outline-none bg-white"
              >
                <option value="">Select City</option>
                {currentCities.map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

            {/* Area */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Area</label>
              <select
                value={selectedArea}
                onChange={(e) => setSelectedArea(e.target.value)}
                disabled={!selectedCity}
                className="w-full px-4 py-3 border border-gray-200 text-gray-900 font-medium focus:border-[#6B1F2B] focus:ring-1 focus:ring-[#6B1F2B] focus:outline-none disabled:opacity-50 bg-white"
              >
                <option value="">Select Area</option>
                {currentAreas.map((area) => (
                  <option key={area} value={area}>{area}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Store Results */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {stores.map((store) => (
            <div key={store.id} className="bg-white p-8 border border-gray-100 hover:shadow-lg transition-all duration-300">
              <h3 className="text-xl font-serif font-medium text-gray-900 mb-4">{store.name}</h3>
              <div className="space-y-3 text-gray-600 mb-6">
                <p className="flex items-center">
                  <span className="w-8 h-8 bg-[#6B1F2B]/5 flex items-center justify-center mr-3 text-lg">📍</span>
                  {store.address}, {store.area}, {store.city}
                </p>
                <p className="flex items-center">
                  <span className="w-8 h-8 bg-[#6B1F2B]/5 flex items-center justify-center mr-3 text-lg">📞</span>
                  {store.phone}
                </p>
                <p className="flex items-center">
                  <span className="w-8 h-8 bg-[#6B1F2B]/5 flex items-center justify-center mr-3 text-lg">🕐</span>
                  {store.hours}
                </p>
              </div>
              <div className="flex gap-4">
                <Link
                  href={`/${locale}/contact`}
                  className="flex-1 text-center bg-[#6B1F2B] hover:bg-[#50000b] text-white px-4 py-3 font-medium transition-all duration-300 shadow-md hover:shadow-lg"
                >
                  Get Directions
                </Link>
                <Link
                  href={`tel:${store.phone}`}
                  className="flex-1 text-center border border-gray-200 text-gray-700 hover:border-[#6B1F2B] hover:text-[#6B1F2B] px-4 py-3 font-medium transition-all duration-300"
                >
                  Call Store
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}

