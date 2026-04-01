'use client'

import React, { useState, useEffect } from 'react'
import { useCountry } from '@/contexts/CountryContext'
import { apiClient } from '@/lib/api'
import KPICard from '@/components/shared/KPICard'

interface PendingReturnsContentProps {
  persona: 'company' | 'distributor' | 'supplier'
  locale: string
}

export default function PendingReturnsContent({ persona, locale }: PendingReturnsContentProps) {
  const { selectedCountry } = useCountry()
  const [loading, setLoading] = useState(true)
  const [routes, setRoutes] = useState<any[]>([])
  const [summary, setSummary] = useState<any>(null)

  useEffect(() => {
    loadReturns()
  }, [selectedCountry, persona])

  const loadReturns = async () => {
    setLoading(true)
    try {
      const [routesRes, summaryRes] = await Promise.all([
        apiClient.getLogisticsRoutes(),
        apiClient.getLogisticsSummary()
      ])
      setRoutes(Array.isArray((routesRes as any)?.data) ? (routesRes as any).data : [])
      setSummary((summaryRes as any)?.data || null)
    } catch (error) {
      console.error('Error loading returns:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkDelayed = async (routeId: string) => {
    try {
      await apiClient.updateLogisticsRouteStatus(routeId, 'Delayed', 'Return required')
      loadReturns()
    } catch (error) {
      console.error('Error marking delayed:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E5E5EA]"></div>
      </div>
    )
  }

  // Returns = delayed deliveries that need handling
  const byStatus = summary?.byStatus || {}
  const delayed = routes.filter((r: any) => r.status === 'Delayed')
  const completed = byStatus['Completed'] || 0
  const totalDistance = summary?.totalDistance || 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[#1D1D1F]">Pending Returns</h3>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard label="Delayed / Returns" value={delayed.length} icon="⏳" />
        <KPICard label="Completed" value={completed} icon={<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="16" height="16"><circle cx="8" cy="8" r="6.5"/><path d="M5 8l2 2 4-4"/></svg>} />
        <KPICard label="Total Distance" value={`${totalDistance} km`} icon="📏" />
        <KPICard label="On-Time Rate" value={`${summary?.onTimeRate ?? 0}%`} icon="⏱️" />
      </div>

      <div className="bg-white border border-black/10 rounded-lg p-6">
        <h4 className="text-sm font-semibold text-[#1D1D1F] mb-4">Delayed Deliveries Requiring Attention</h4>
        {delayed.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-[#1D1D1F] font-semibold text-lg">All Clear</p>
            <p className="text-black/60 mt-1">No delayed deliveries. All routes are on track.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-black/20">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Route</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Origin → Destination</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Driver</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">ETA (overdue)</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody>
                {delayed.map((route: any) => (
                  <tr key={route.id} className="border-b border-black/10 hover:bg-[#F5F5F7]/50">
                    <td className="py-2 text-black font-mono text-xs">{route.routeId}</td>
                    <td className="px-5 py-3.5 text-sm text-[#8E8E93]">{route.origin} → {route.destination}</td>
                    <td className="px-5 py-3.5 text-sm text-[#8E8E93]">{route.driver || 'Unassigned'}</td>
                    <td className="py-2 text-black text-xs">{route.eta ? new Date(route.eta).toLocaleDateString() : '—'}</td>
                    <td className="py-2">
                      <span className="px-2 py-1 bg-[#F5F5F7] text-[#1D1D1F] rounded text-xs">Delayed</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick action: Mark any In Transit route as Delayed */}
      {routes.filter((r: any) => r.status === 'In Transit').length > 0 && (
        <div className="bg-white border border-black/10 rounded-lg p-6">
          <h4 className="text-sm font-semibold text-[#1D1D1F] mb-4">Flag as Return</h4>
          <p className="text-black/60 mb-4">Mark an in-transit delivery as delayed/return-required.</p>
          <div className="space-y-2">
            {routes.filter((r: any) => r.status === 'In Transit').map((route: any) => (
              <div key={route.id} className="flex items-center justify-between p-3 border border-black/10 rounded-lg">
                <div>
                  <span className="font-mono text-xs text-black">{route.routeId}</span>
                  <span className="text-black ml-3">{route.origin} → {route.destination}</span>
                </div>
                <button onClick={() => handleMarkDelayed(route.id)} className="text-xs bg-[#F5F5F7] text-[#1D1D1F] px-3 py-1 rounded hover:bg-[#F5F5F7] transition-colors">Flag Delayed</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

