'use client'

import React, { useState } from 'react'

export default function RequestTerritory() {
  const [formData, setFormData] = useState({
    country: '',
    region: '',
    cities: [] as string[],
    channels: [] as string[],
    fleetSize: '',
    expectedVolume: '',
    reason: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Submit logic here - creates lead in CRM.Distributor_Leads
    alert('Territory request submitted successfully!')
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#C3A35E]">Request Territory</h1>

      <div className="bg-white border border-black200 shadow-sm p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-[#C3A35E]/90 mb-2">Country *</label>
              <select
                required
                value={formData.country}
                onChange={(e) => setFormData({...formData, country: e.target.value})}
                className="w-full px-4 py-2 border border-black300 focus:ring-2 focus:ring-black"
              >
                <option value="">Select Country</option>
                <option value="US">United States</option>
                <option value="PK">Pakistan</option>
                <option value="AE">UAE</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#C3A35E]/90 mb-2">Region *</label>
              <select
                required
                value={formData.region}
                onChange={(e) => setFormData({...formData, region: e.target.value})}
                className="w-full px-4 py-2 border border-black300 focus:ring-2 focus:ring-black"
              >
                <option value="">Select Region</option>
                <option value="west">West</option>
                <option value="east">East</option>
                <option value="north">North</option>
                <option value="south">South</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-[#C3A35E]/90 mb-2">Cities Interested *</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {['Los Angeles', 'New York', 'Chicago', 'Miami', 'Seattle', 'Boston', 'Atlanta', 'Dallas'].map(city => (
                  <label key={city} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.cities.includes(city)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({...formData, cities: [...formData.cities, city]})
                        } else {
                          setFormData({...formData, cities: formData.cities.filter(c => c !== city)})
                        }
                      }}
                      className="mr-2"
                    />
                    <span className="text-sm">{city}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-[#C3A35E]/90 mb-2">Current Channels *</label>
              <div className="flex flex-wrap gap-4">
                {['GT', 'MT', 'Wholesale', 'HoReCa'].map(channel => (
                  <label key={channel} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.channels.includes(channel)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({...formData, channels: [...formData.channels, channel]})
                        } else {
                          setFormData({...formData, channels: formData.channels.filter(c => c !== channel)})
                        }
                      }}
                      className="mr-2"
                    />
                    <span className="text-sm">{channel}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#C3A35E]/90 mb-2">Fleet Size</label>
              <input
                type="number"
                value={formData.fleetSize}
                onChange={(e) => setFormData({...formData, fleetSize: e.target.value})}
                className="w-full px-4 py-2 border border-black300 focus:ring-2 focus:ring-black"
                placeholder="e.g., 5 vehicles"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#C3A35E]/90 mb-2">Expected Monthly Volume (USD)</label>
              <input
                type="number"
                value={formData.expectedVolume}
                onChange={(e) => setFormData({...formData, expectedVolume: e.target.value})}
                className="w-full px-4 py-2 border border-black300 focus:ring-2 focus:ring-black"
                placeholder="e.g., 50000"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-[#C3A35E]/90 mb-2">Reason / Business Case *</label>
              <textarea
                required
                rows={5}
                value={formData.reason}
                onChange={(e) => setFormData({...formData, reason: e.target.value})}
                className="w-full px-4 py-2 border border-black300 focus:ring-2 focus:ring-black"
                placeholder="Explain why you want this territory and your business case..."
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-[#C3A35E]/90 mb-2">Supporting Documents</label>
              <input
                type="file"
                multiple
                className="w-full px-4 py-2 border border-black300 focus:ring-2 focus:ring-black"
              />
              <p className="text-xs text-[#C3A35E]/90 mt-1">Upload any supporting documents (business plan, financials, etc.)</p>
            </div>
          </div>

          <div className="flex space-x-4">
            <button
              type="submit"
              className="bg-white text-white px-8 py-3 font-semibold hover:opacity-90 transition-opacity"
            >
              Submit Request
            </button>
            <button
              type="button"
              className="bg-white text-[#C3A35E]/90 px-8 py-3 font-semibold hover:bg-white transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

