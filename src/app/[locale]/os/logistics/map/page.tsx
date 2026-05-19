'use client'

import { useState, useEffect } from 'react'
import { apiClient } from '@/lib/api'
import LocalizationBar from '@/components/shared/LocalizationBar'

export default function MapPage() {
  const [warehouses, setWarehouses] = useState<any[]>([])
  const [retailers, setRetailers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadLocations()
  }, [])

  const loadLocations = async () => {
    try {
      setLoading(true)
      const [warehousesRes, retailersRes] = await Promise.all([
        apiClient.getDomainGPSWarehouses(),
        apiClient.getDomainGPSRetailers()
      ])
      if (warehousesRes?.data) {
        setWarehouses(Array.isArray(warehousesRes.data) ? warehousesRes.data : [])
      }
      if (retailersRes?.data) {
        setRetailers(Array.isArray(retailersRes.data) ? retailersRes.data : [])
      }
    } catch (error) {
      console.error('Error loading locations:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <LocalizationBar orientation="horizontal" compact showLabels={false} showGeo={false} className="mb-4" />
      {/* Page Header - V16 Spec */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#C3A35E] mb-2">Digital Mapping</h1>
        <p className="text-[#C3A35E]/90">View warehouses, retailers, and distribution network</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Warehouses */}
        <div className="bg-white border border-black200 p-6">
          <h2 className="text-xl font-semibold text-[#C3A35E]/90 mb-4">Warehouses</h2>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : (
            <div className="space-y-3">
              {warehouses.length === 0 ? (
                <p className="text-[#C3A35E]/90 text-center py-4">No warehouses found</p>
              ) : (
                warehouses.map((warehouse) => (
                  <div key={warehouse.id} className="border-b border-black100 pb-3">
                    <div className="font-medium text-[#C3A35E]/90">{warehouse.name}</div>
                    <div className="text-sm text-[#C3A35E]/90">{warehouse.location}</div>
                    <div className="text-sm text-[#C3A35E]/90 mt-1">
                      Capacity: {warehouse.currentStock?.toLocaleString()} / {warehouse.capacity?.toLocaleString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Retailers */}
        <div className="bg-white border border-black200 p-6">
          <h2 className="text-xl font-semibold text-[#C3A35E]/90 mb-4">Retailers</h2>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : (
            <div className="space-y-3">
              {retailers.length === 0 ? (
                <p className="text-[#C3A35E]/90 text-center py-4">No retailers found</p>
              ) : (
                retailers.map((retailer) => (
                  <div key={retailer.id} className="border-b border-black100 pb-3">
                    <div className="font-medium text-[#C3A35E]/90">{retailer.name}</div>
                    <div className="text-sm text-[#C3A35E]/90">{retailer.location}</div>
                    <div className="text-sm text-[#C3A35E]/90 mt-1">
                      Monthly Sales: ${retailer.monthlySales?.toLocaleString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Map Placeholder */}
      <div className="bg-white border border-black200 p-6">
        <h2 className="text-xl font-semibold text-[#C3A35E]/90 mb-4">Map View</h2>
        <div className="bg-white h-96 border border-black100 p-6 flex flex-col justify-center">
          <p className="text-[#C3A35E]/90 mb-3">
            Location intelligence is active. Use warehouse and retailer lists to validate node health and route
            sequencing.
          </p>
          <p className="text-sm text-[#C3A35E]/90">
            Total mapped points: {(warehouses.length + retailers.length).toLocaleString()} ({warehouses.length} warehouses, {retailers.length} retailers)
          </p>
          <p className="text-sm text-[#C3A35E]/90 mt-2">
            For coordinate overlays and lane heatmaps, connect your map provider key in environment settings.
          </p>
        </div>
      </div>
    </>
  )
}

