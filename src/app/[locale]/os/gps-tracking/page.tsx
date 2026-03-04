'use client'

import React, { useState, useEffect } from 'react'
import { useCountry } from '@/contexts/CountryContext'
import { useLocale, useTranslations } from 'next-intl'

interface GPSDashboard {
  activeTracks: number
  totalVehicles: number
  activeFleet: number
  coverageArea: number
}

export default function GPSTrackingOSPage() {
  const locale = useLocale()
  const t = useTranslations('gps')
  const { selectedCountry, role } = useCountry()
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

      const response = await fetch('/api/os-domains/gps-tracking/dashboard', { headers })
      const result = await response.json()
      
      if (response.ok && result.success) {
        setDashboard(result.data)
      } else {
        setError(result.error || 'Failed to load GPS dashboard')
      }
    } catch (err) {
      console.error('Error fetching GPS dashboard:', err)
      setError('Failed to load GPS dashboard')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Page Header - V16 Spec */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#C3A35E] mb-2">GPS Tracking Dashboard</h1>
        <p className="text-[#C3A35E]/90">Monitor real-time vehicle tracking, fleet management, and geographic analytics</p>
      </div>

      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#6B1F2B]"></div>
          <p className="mt-4 text-[#C3A35E]/90">Loading...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
          <button
            onClick={fetchDashboard}
            className="ml-4 text-red-800 underline hover:text-red-900"
          >
            Retry
          </button>
        </div>
      )}

      {dashboard && !loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[#C3A35E]/90">Active Tracks</h3>
              <span className="text-2xl">📍</span>
            </div>
            <div className="text-3xl font-bold text-blue-600">{dashboard.activeTracks || 0}</div>
          </div>

          <div className="bg-white shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[#C3A35E]/90">Total Vehicles</h3>
              <span className="text-2xl">🚛</span>
            </div>
            <div className="text-3xl font-bold text-[#C3A35E]">{dashboard.totalVehicles || 0}</div>
          </div>

          <div className="bg-white shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[#C3A35E]/90">Active Fleet</h3>
              <span className="text-2xl">🚚</span>
            </div>
            <div className="text-3xl font-bold text-green-600">{dashboard.activeFleet || 0}</div>
          </div>

          <div className="bg-white shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[#C3A35E]/90">Coverage Area</h3>
              <span className="text-2xl">🗺️</span>
            </div>
            <div className="text-3xl font-bold text-purple-600">
              {(dashboard.coverageArea || 0).toLocaleString()} km²
            </div>
          </div>
        </div>
      )}

      {/* Map Section */}
      {dashboard && !loading && (
        <div className="mt-6 bg-white shadow p-6">
          <h2 className="text-xl font-semibold text-[#C3A35E]/90 mb-4">Real-time GPS Map</h2>
          <div className="bg-white h-96 flex items-center justify-center">
            <p className="text-[#C3A35E]/90">GPS Map View - Coming Soon</p>
          </div>
        </div>
      )}
    </>
  )
}

