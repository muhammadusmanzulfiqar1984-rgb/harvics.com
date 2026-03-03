'use client'

import { useState, useEffect } from 'react'
import { apiClient } from '@/lib/api'

export default function FleetPage() {
  const [vehicles, setVehicles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadFleet()
  }, [])

  const loadFleet = async () => {
    try {
      setLoading(true)
      const response = await apiClient.getDomainGPSVehicles()
      if (response?.data) {
        setVehicles(Array.isArray(response.data) ? response.data : [])
      }
    } catch (error) {
      console.error('Error loading fleet:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Transit': return 'bg-blue-100 text-blue-800'
      case 'Delivering': return 'bg-green-100 text-green-800'
      case 'Returning': return 'bg-[#C3A35E]/20 text-[#C3A35E]'
      case 'Parked': return 'bg-white text-[#C3A35E]/90'
      default: return 'bg-white text-[#C3A35E]/90'
    }
  }

  return (
    <div>
      {/* Page Header - V16 Spec */}
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-[#C3A35E] mb-2">Fleet Management</h1>
            <p className="text-[#C3A35E]/90">Manage vehicles and driver assignments</p>
          </div>
          <button className="bg-[#C3A35E] text-[#6B1F2B] px-4 py-2 rounded-lg hover:bg-[#C3A35E] transition-colors">
            + Add Vehicle
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : (
        <div className="bg-white rounded-lg border border-black200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-white">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#C3A35E]/90 uppercase">Vehicle Number</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#C3A35E]/90 uppercase">Driver</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#C3A35E]/90 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#C3A35E]/90 uppercase">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#C3A35E]/90 uppercase">Route</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#C3A35E]/90 uppercase">ETA</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#C3A35E]/90 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {vehicles.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-[#C3A35E]/90">
                    No vehicles found
                  </td>
                </tr>
              ) : (
                vehicles.map((vehicle) => (
                  <tr key={vehicle.id} className="hover:bg-white">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#C3A35E]/90">{vehicle.vehicleNumber}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#C3A35E]/90">{vehicle.driver}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(vehicle.status)}`}>
                        {vehicle.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-[#C3A35E]/90">{vehicle.currentLocation}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#C3A35E]/90">{vehicle.route}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#C3A35E]/90">{vehicle.eta}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button className="text-[#C3A35E]/90 hover:text-[#5a000c]">View</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

