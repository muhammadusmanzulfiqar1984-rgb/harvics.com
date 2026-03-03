'use client'

import { useState, useEffect } from 'react'
import { apiClient } from '@/lib/api'

export default function GPSAnalyticsPage() {
  const [analytics, setAnalytics] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAnalytics()
  }, [])

  const loadAnalytics = async () => {
    try {
      setLoading(true)
      const response = await apiClient.getDomainGPSAnalytics()
      if (response?.data) {
        setAnalytics(response.data)
      }
    } catch (error) {
      console.error('Error loading analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center py-12">Loading...</div>
  }

  return (
    <>
      {/* Page Header - V16 Spec */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#C3A35E] mb-2">GPS Analytics</h1>
        <p className="text-[#C3A35E]/90">Performance metrics and geographic insights</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border border-black200 p-6">
          <div className="text-sm text-[#C3A35E]/90 mb-1">On-Time Delivery</div>
          <div className="text-3xl font-bold text-[#C3A35E]">{analytics?.onTimeDelivery || 0}%</div>
        </div>
        <div className="bg-white rounded-lg border border-black200 p-6">
          <div className="text-sm text-[#C3A35E]/90 mb-1">Average Delivery Time</div>
          <div className="text-3xl font-bold text-[#ffffff]">{analytics?.averageDeliveryTime || 0} hrs</div>
        </div>
        <div className="bg-white rounded-lg border border-black200 p-6">
          <div className="text-sm text-[#C3A35E]/90 mb-1">Route Efficiency</div>
          <div className="text-3xl font-bold text-green-600">{analytics?.routeEfficiency || 0}%</div>
        </div>
        <div className="bg-white rounded-lg border border-black200 p-6">
          <div className="text-sm text-[#C3A35E]/90 mb-1">Fuel Consumption</div>
          <div className="text-3xl font-bold text-blue-600">{analytics?.fuelConsumption?.toLocaleString() || 0} L</div>
        </div>
        <div className="bg-white rounded-lg border border-black200 p-6">
          <div className="text-sm text-[#C3A35E]/90 mb-1">Total Distance</div>
          <div className="text-3xl font-bold text-purple-600">{analytics?.totalDistance?.toLocaleString() || 0} km</div>
        </div>
        <div className="bg-white rounded-lg border border-black200 p-6">
          <div className="text-sm text-[#C3A35E]/90 mb-1">Coverage Gaps</div>
          <div className="text-3xl font-bold text-red-600">{analytics?.coverageGaps || 0}</div>
        </div>
      </div>
    </>
  )
}

