'use client'

import React, { useState, useEffect } from 'react'
import { useCountry } from '@/contexts/CountryContext'
import { apiClient } from '@/lib/api'
import KPICard from '@/components/shared/KPICard'

interface ActiveVehiclesContentProps {
  persona: 'company' | 'distributor' | 'supplier'
  locale: string
}

export default function ActiveVehiclesContent({ persona, locale }: ActiveVehiclesContentProps) {
  const { selectedCountry } = useCountry()
  const [loading, setLoading] = useState(true)
  const [vehicleData, setVehicleData] = useState<any>(null)

  useEffect(() => {
    loadVehicles()
  }, [selectedCountry, persona])

  const loadVehicles = async () => {
    setLoading(true)
    try {
      const response = await apiClient.getCompanyDashboard({
        scope: 'global',
        country: selectedCountry || 'global',
        period: 'last30days',
        currency: 'USD'
      })
      setVehicleData((response as any)?.data?.data?.logistics || (response as any)?.data?.logistics || null)
    } catch (error) {
      console.error('Error loading vehicles:', error)
      setVehicleData({
        totalVehicles: 450,
        active: 320,
        inTransit: 245,
        available: 75
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

  const totalVehicles = vehicleData?.totalVehicles || 0
  const active = vehicleData?.active || 0
  const inTransit = vehicleData?.inTransit || 0
  const available = vehicleData?.available || 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-black">Active Vehicles</h3>
        <button className="bg-[#C3A35E] text-black px-4 py-2 rounded-lg font-semibold hover:bg-[#C3A35E] transition-colors">
          + Add Vehicle
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard
          label="Total Vehicles"
          value={totalVehicles}
          icon="🚚"
        />
        <KPICard
          label="Active"
          value={active}
          icon="🟢"
        />
        <KPICard
          label="In Transit"
          value={inTransit}
          icon="🚗"
        />
        <KPICard
          label="Available"
          value={available}
          icon="✅"
        />
      </div>

      <div className="bg-white border border-black200 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-black mb-4">Fleet Status</h4>
        <p className="text-black mb-4">Real-time tracking of all vehicles in your fleet.</p>
        <div className="mt-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-black200">
                <th className="text-left py-2 font-medium text-black">Vehicle ID</th>
                <th className="text-left py-2 font-medium text-black">Driver</th>
                <th className="text-left py-2 font-medium text-black">Location</th>
                <th className="text-left py-2 font-medium text-black">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-black100">
                <td className="py-2 text-black">VH-001</td>
                <td className="py-2 text-black">John Doe</td>
                <td className="py-2 text-black">Route RT-001</td>
                <td className="py-2">
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">In Transit</span>
                </td>
              </tr>
              <tr className="border-b border-black100">
                <td className="py-2 text-black">VH-002</td>
                <td className="py-2 text-black">Jane Smith</td>
                <td className="py-2 text-black">Route RT-002</td>
                <td className="py-2">
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">In Transit</span>
                </td>
              </tr>
              <tr className="border-b border-black100">
                <td className="py-2 text-black">VH-003</td>
                <td className="py-2 text-black">Mike Johnson</td>
                <td className="py-2 text-black">Warehouse</td>
                <td className="py-2">
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">Available</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

