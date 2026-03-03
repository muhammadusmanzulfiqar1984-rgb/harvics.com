'use client'

import React, { useState, useEffect } from 'react'
import { useCountry } from '@/contexts/CountryContext'
import { useLocalization } from '@/utils/localization'
import { apiClient } from '@/lib/api'
import KPICard from '@/components/shared/KPICard'

interface RouteListContentProps {
  persona: 'company' | 'distributor' | 'supplier'
  locale: string
}

export default function RouteListContent({ persona, locale }: RouteListContentProps) {
  const { selectedCountry, countryData } = useCountry()
  const { getCurrencyCode, getCurrencySymbol, currency } = useLocalization()
  const [loading, setLoading] = useState(true)
  const [routeData, setRouteData] = useState<any>(null)

  const currentCurrency = currency?.code || countryData?.currency?.code || getCurrencyCode() || 'USD'
  const currencySymbol = currency?.symbol || countryData?.currency?.symbol || getCurrencySymbol() || '$'

  useEffect(() => {
    loadRoutes()
  }, [selectedCountry, persona])

  const loadRoutes = async () => {
    setLoading(true)
    try {
      const response = await apiClient.getCompanyDashboard({
        scope: 'global',
        country: selectedCountry || 'global',
        period: 'last30days',
        currency: currentCurrency
      })
      setRouteData((response as any)?.data?.data?.logistics || (response as any)?.data?.logistics || null)
    } catch (error) {
      console.error('Error loading routes:', error)
      setRouteData({
        totalRoutes: 1200,
        activeRoutes: 856,
        completed: 23400,
        efficiency: 92
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C3A35E]"></div>
      </div>
    )
  }

  const totalRoutes = routeData?.routes || 0
  const activeRoutes = routeData?.activeRoutes || 0
  const completed = routeData?.deliveries || 0
  const efficiency = routeData?.efficiency || 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-black">Route List</h3>
        <button className="bg-[#C3A35E] text-black px-4 py-2 rounded-lg font-semibold hover:bg-[#C3A35E] transition-colors">
          + New Route
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard
          label="Total Routes"
          value={totalRoutes}
          icon="🗺️"
        />
        <KPICard
          label="Active Routes"
          value={activeRoutes}
          icon="🚚"
        />
        <KPICard
          label="Completed"
          value={completed.toLocaleString()}
          icon="✅"
        />
        <KPICard
          label="Efficiency"
          value={`${efficiency}%`}
          icon="⚡"
        />
      </div>

      <div className="bg-white border border-black200 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-black mb-4">Route Management</h4>
        <p className="text-black mb-4">View and manage all delivery routes, optimize paths, and track route performance.</p>
        <div className="mt-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-black200">
                <th className="text-left py-2 font-medium text-black">Route ID</th>
                <th className="text-left py-2 font-medium text-black">Destination</th>
                <th className="text-left py-2 font-medium text-black">Distance</th>
                <th className="text-left py-2 font-medium text-black">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-black100">
                <td className="py-2 text-black">RT-001</td>
                <td className="py-2 text-black">North Warehouse</td>
                <td className="py-2 text-black">125 km</td>
                <td className="py-2">
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">Active</span>
                </td>
              </tr>
              <tr className="border-b border-black100">
                <td className="py-2 text-black">RT-002</td>
                <td className="py-2 text-black">City Center</td>
                <td className="py-2 text-black">45 km</td>
                <td className="py-2">
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">Active</span>
                </td>
              </tr>
              <tr className="border-b border-black100">
                <td className="py-2 text-black">RT-003</td>
                <td className="py-2 text-black">Airport Zone</td>
                <td className="py-2 text-black">89 km</td>
                <td className="py-2">
                  <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">Scheduled</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

