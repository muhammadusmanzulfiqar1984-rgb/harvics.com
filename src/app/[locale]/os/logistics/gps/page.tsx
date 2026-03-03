'use client'

import React, { useState, useEffect } from 'react'
import { useCountry } from '@/contexts/CountryContext'

interface GPSDashboard {
  activeTracks: number
  totalVehicles: number
  activeFleet: number
  coverageArea: number
}

export default function GPSFleetMapPage() {
  const { selectedCountry } = useCountry()
  const [dashboard, setDashboard] = useState<GPSDashboard | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchDashboard()
  }, [selectedCountry])

  const fetchDashboard = async () => {
    try {
      setLoading(true)
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      }
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const response = await fetch(`/api/os-domains/gps-tracking/dashboard?countryCode=${selectedCountry || ''}`, { headers })
      const result = await response.json()

      if (!response.ok || !result.success) {
        setError(result.error || 'Failed to load GPS dashboard')
      } else {
        setDashboard(result.data)
      }
    } catch (err) {
      console.error('Error fetching GPS dashboard:', err)
      setError('Failed to load GPS dashboard')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#C3A35E] mb-2">GPS Tracking Dashboard</h1>
        <p className="text-[#C3A35E]/90">Real-time vehicle tracking and fleet management</p>
      </div>

      {loading && <div className="text-center py-12">Loading...</div>}
      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

      {dashboard && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-[#C3A35E]/90 mb-4">📍 Active Tracks</h3>
            <div className="text-3xl font-bold text-[#C3A35E]">{dashboard.activeTracks || 0}</div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-[#C3A35E]/90 mb-4">🚛 Total Vehicles</h3>
            <div className="text-3xl font-bold text-blue-600">{dashboard.totalVehicles || 0}</div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-[#C3A35E]/90 mb-4">🚚 Active Fleet</h3>
            <div className="text-3xl font-bold text-green-600">{dashboard.activeFleet || 0}</div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-[#C3A35E]/90 mb-4">🗺️ Coverage Area</h3>
            <div className="text-3xl font-bold text-purple-600">
              {(dashboard.coverageArea || 0).toLocaleString()} km²
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-[#C3A35E]/90 mb-4">Real-time GPS Map</h2>
        <div className="bg-white rounded-lg h-96 flex items-center justify-center">
          <p className="text-[#C3A35E]/90">GPS Map View - Coming Soon</p>
        </div>
      </div>
    </div>
  )
}
