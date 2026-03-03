'use client'

import React, { useState, useEffect } from 'react'
import { useCountry } from '@/contexts/CountryContext'

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
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-[#C3A35E]/90 mb-4">📦 Tracked Products</h3>
              <div className="text-3xl font-bold text-[#C3A35E]">
                {dashboard.totalProducts || 0}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-[#C3A35E]/90 mb-4">🏢 Competitors</h3>
              <div className="text-3xl font-bold text-blue-600">
                {dashboard.totalCompetitors || 0}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-[#C3A35E]/90 mb-4">⚠️ Price Alerts</h3>
              <div className="text-3xl font-bold text-orange-600">
                {dashboard.priceAlerts || 0}
              </div>
            </div>
          </div>

          {/* Analysis Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg border border-black200 p-6">
              <h2 className="text-xl font-semibold text-[#C3A35E]/90 mb-4">Market Share</h2>
              {dashboard.marketShareData ? (
                <div className="text-[#C3A35E]/90">
                  Market share analysis data available
                </div>
              ) : (
                <p className="text-[#C3A35E]/90">Market share analysis coming soon</p>
              )}
            </div>

            <div className="bg-white rounded-lg border border-black200 p-6">
              <h2 className="text-xl font-semibold text-[#C3A35E]/90 mb-4">Pricing Analysis</h2>
              <p className="text-[#C3A35E]/90">Pricing analysis coming soon</p>
            </div>

            <div className="bg-white rounded-lg border border-black200 p-6">
              <h2 className="text-xl font-semibold text-[#C3A35E]/90 mb-4">Market Trends</h2>
              <p className="text-[#C3A35E]/90">Trend analysis coming soon</p>
            </div>

            <div className="bg-white rounded-lg border border-black200 p-6">
              <h2 className="text-xl font-semibold text-[#C3A35E]/90 mb-4">Brand Analysis</h2>
              <p className="text-[#C3A35E]/90">Brand analysis coming soon</p>
            </div>
          </div>
        </>
      ) : null}
    </>
  )
}
