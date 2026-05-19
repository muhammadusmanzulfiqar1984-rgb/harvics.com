'use client'

import React, { useState, useEffect } from 'react'
import { useCountry } from '@/contexts/CountryContext'
import LocalizationBar from '@/components/shared/LocalizationBar'

interface CompetitorDashboard {
  totalProducts: number
  totalCompetitors: number
  priceAlerts: number
  marketShareData: any
}

export default function CompetitorAnalysisPage() {
  const { selectedCountry } = useCountry()
  const [dashboard, setDashboard] = useState<CompetitorDashboard | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadDashboard()
  }, [selectedCountry])

  const loadDashboard = async () => {
    try {
      setLoading(true)
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      }
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const response = await fetch('/api/os-domains/competitor-intel/dashboard', { headers })
      const result = await response.json()

      if (!response.ok || !result.success) {
        setError(result.error || 'Failed to load competitor dashboard')
      } else {
        setDashboard(result.data)
      }
    } catch (error) {
      console.error('Error loading competitor dashboard:', error)
      setError('Failed to load competitor dashboard')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <LocalizationBar orientation="horizontal" compact showLabels={false} showGeo={false} className="mb-4" />
      {/* Page Header - V16 Spec */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#C3A35E] mb-2">Competitor Intelligence Dashboard</h1>
        <p className="text-[#C3A35E]/90">Market share, pricing, and trend analysis</p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#6B1F2B]"></div>
          <p className="mt-4 text-[#C3A35E]/90">Loading...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      ) : dashboard ? (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white shadow p-6">
              <h3 className="text-lg font-semibold text-[#C3A35E]/90 mb-4">📦 Tracked Products</h3>
              <div className="text-3xl font-bold text-[#C3A35E]">
                {dashboard.totalProducts || 0}
              </div>
            </div>

            <div className="bg-white shadow p-6">
              <h3 className="text-lg font-semibold text-[#C3A35E]/90 mb-4">🏢 Competitors</h3>
              <div className="text-3xl font-bold text-blue-600">
                {dashboard.totalCompetitors || 0}
              </div>
            </div>

            <div className="bg-white shadow p-6">
              <h3 className="text-lg font-semibold text-[#C3A35E]/90 mb-4">⚠️ Price Alerts</h3>
              <div className="text-3xl font-bold text-orange-600">
                {dashboard.priceAlerts || 0}
              </div>
            </div>
          </div>

          {/* Analysis Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-black200 p-6">
              <h2 className="text-xl font-semibold text-[#C3A35E]/90 mb-4">Market Share</h2>
              {dashboard.marketShareData ? (
                <div className="text-[#C3A35E]/90">
                  Market share analysis is active. Use this panel to benchmark category share, rank movement,
                  and concentration by top competitor groups.
                </div>
              ) : (
                <p className="text-[#C3A35E]/90">
                  No market share payload is currently returned for this country. Trackers remain active and this
                  panel will populate automatically once comparative inputs are synced.
                </p>
              )}
            </div>

            <div className="bg-white border border-black200 p-6">
              <h2 className="text-xl font-semibold text-[#C3A35E]/90 mb-4">Pricing Analysis</h2>
              <p className="text-[#C3A35E]/90">
                Monitor competitor price ladders, promo intensity, and sudden discount behavior to protect margin
                while preserving shelf competitiveness.
              </p>
            </div>

            <div className="bg-white border border-black200 p-6">
              <h2 className="text-xl font-semibold text-[#C3A35E]/90 mb-4">Market Trends</h2>
              <p className="text-[#C3A35E]/90">
                Track weekly velocity shifts, seasonal demand waves, and emerging category movements to anticipate
                channel-level changes before competitors react.
              </p>
            </div>

            <div className="bg-white border border-black200 p-6">
              <h2 className="text-xl font-semibold text-[#C3A35E]/90 mb-4">Brand Analysis</h2>
              <p className="text-[#C3A35E]/90">
                Evaluate brand momentum through visibility score, price confidence, and assortment breadth across
                priority territories.
              </p>
            </div>
          </div>
        </>
      ) : null}
    </>
  )
}
