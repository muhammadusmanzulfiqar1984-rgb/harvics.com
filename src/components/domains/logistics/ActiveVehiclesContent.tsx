'use client'

import React, { useState, useEffect } from 'react'
import { useCountry } from '@/contexts/CountryContext'
import { apiClient } from '@/lib/api'
import KPICard from '@/components/shared/KPICard'

interface ActiveVehiclesContentProps {
  persona: 'company' | 'distributor' | 'supplier'
  locale: string
}

const statusColors: Record<string, string> = {
  'In Transit': 'bg-[#F5F5F7] text-[#1A1A1A]',
  'Completed': 'bg-[#F5F5F7] text-[#1A1A1A]',
  'Pending': 'bg-[#F5F5F7] text-[#1A1A1A]',
  'Delayed': 'bg-[#F5F5F7] text-[#1A1A1A]',
}

export default function ActiveVehiclesContent({ persona, locale }: ActiveVehiclesContentProps) {
  const { selectedCountry } = useCountry()
  const [loading, setLoading] = useState(true)
  const [routes, setRoutes] = useState<any[]>([])
  const [summary, setSummary] = useState<any>(null)

  useEffect(() => {
    loadVehicles()
  }, [selectedCountry, persona])

  const loadVehicles = async () => {
    setLoading(true)
    try {
      const [routesRes, summaryRes] = await Promise.all([
        apiClient.getLogisticsRoutes(),
        apiClient.getLogisticsSummary()
      ])
      setRoutes(Array.isArray((routesRes as any)?.data) ? (routesRes as any).data : [])
      setSummary((summaryRes as any)?.data || null)
    } catch (error) {
      console.error('Error loading vehicles:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E5E5EA]"></div>
      </div>
    )
  }

  // Derive vehicle stats from routes (each route has a vehicle assigned)
  const allVehicles = routes.filter((r: any) => r.vehicle && r.vehicle !== 'TBD')
  const uniqueVehicles = [...new Set(allVehicles.map((r: any) => r.vehicle))]
  const inTransit = routes.filter((r: any) => r.status === 'In Transit')
  const available = routes.filter((r: any) => r.status === 'Pending' || r.status === 'Completed')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[#1A1A1A]">Active Vehicles</h3>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard label="Unique Vehicles" value={uniqueVehicles.length} icon={<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="16" height="16"><rect x="1" y="6" width="9" height="7" rx="1"/><path d="M10 8h3.5L15 10.5V13h-5"/><circle cx="4.5" cy="13.5" r="1.5"/><circle cx="12.5" cy="13.5" r="1.5"/></svg>} />
        <KPICard label="Total Routes" value={summary?.totalRoutes ?? routes.length} icon="🗺️" />
        <KPICard label="In Transit" value={inTransit.length} icon="🚗" />
        <KPICard label="Available" value={available.length} icon={<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="16" height="16"><circle cx="8" cy="8" r="6.5"/><path d="M5 8l2 2 4-4"/></svg>} />
      </div>

      <div className="bg-white border border-black/10 rounded-lg p-6">
        <h4 className="text-sm font-semibold text-[#1A1A1A] mb-4">Fleet Status</h4>
        <p className="text-black/60 mb-4">Vehicle assignments derived from active routes.</p>
        {routes.length === 0 ? (
          <p className="text-black/60 text-center py-8">No vehicle data available. Create routes first.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-black/20">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Vehicle</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Driver</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Route</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Destination</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody>
                {routes.map((route: any) => (
                  <tr key={route.id} className="border-b border-black/10 hover:bg-black/[0.02]">
                    <td className="py-2 text-black font-mono text-xs">{route.vehicle || 'TBD'}</td>
                    <td className="px-5 py-3.5 text-sm text-[#8E8E93]">{route.driver || 'Unassigned'}</td>
                    <td className="py-2 text-black font-mono text-xs">{route.routeId}</td>
                    <td className="px-5 py-3.5 text-sm text-[#8E8E93]">{route.destination}</td>
                    <td className="py-2">
                      <span className={`px-2 py-1 rounded text-xs ${statusColors[route.status] || 'bg-[#F5F5F7] text-[#1A1A1A]'}`}>{route.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

