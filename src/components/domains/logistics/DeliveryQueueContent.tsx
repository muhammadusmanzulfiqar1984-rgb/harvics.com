'use client'

import React, { useState, useEffect } from 'react'
import { useCountry } from '@/contexts/CountryContext'
import { apiClient } from '@/lib/api'
import KPICard from '@/components/shared/KPICard'

interface DeliveryQueueContentProps {
  persona: 'company' | 'distributor' | 'supplier'
  locale: string
}

const statusColors: Record<string, string> = {
  'In Transit': 'bg-[#F5F5F7] text-[#1A1A1A]',
  'Completed': 'bg-[#F5F5F7] text-[#1A1A1A]',
  'Pending': 'bg-[#F5F5F7] text-[#1A1A1A]',
  'Delayed': 'bg-[#F5F5F7] text-[#1A1A1A]',
}

export default function DeliveryQueueContent({ persona, locale }: DeliveryQueueContentProps) {
  const { selectedCountry } = useCountry()
  const [loading, setLoading] = useState(true)
  const [routes, setRoutes] = useState<any[]>([])
  const [summary, setSummary] = useState<any>(null)
  const [filter, setFilter] = useState<string>('all')

  useEffect(() => {
    loadDeliveries()
  }, [selectedCountry, persona])

  const loadDeliveries = async () => {
    setLoading(true)
    try {
      const [routesRes, summaryRes] = await Promise.all([
        apiClient.getLogisticsRoutes(),
        apiClient.getLogisticsSummary()
      ])
      setRoutes(Array.isArray((routesRes as any)?.data) ? (routesRes as any).data : [])
      setSummary((summaryRes as any)?.data || null)
    } catch (error) {
      console.error('Error loading deliveries:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (routeId: string, newStatus: string) => {
    try {
      await apiClient.updateLogisticsRouteStatus(routeId, newStatus)
      loadDeliveries()
    } catch (error) {
      console.error('Error updating status:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E5E5EA]"></div>
      </div>
    )
  }

  const byStatus = summary?.byStatus || {}
  const pending = byStatus['Pending'] || 0
  const inTransit = byStatus['In Transit'] || 0
  const completed = byStatus['Completed'] || 0
  const delayed = byStatus['Delayed'] || 0

  const filteredRoutes = filter === 'all' ? routes : routes.filter((r: any) => r.status === filter)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[#1A1A1A]">Delivery Queue</h3>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard label="Pending" value={pending} icon="⏳" />
        <KPICard label="In Transit" value={inTransit} icon={<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="16" height="16"><rect x="1" y="6" width="9" height="7" rx="1"/><path d="M10 8h3.5L15 10.5V13h-5"/><circle cx="4.5" cy="13.5" r="1.5"/><circle cx="12.5" cy="13.5" r="1.5"/></svg>} />
        <KPICard label="Completed" value={completed} icon={<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="16" height="16"><circle cx="8" cy="8" r="6.5"/><path d="M5 8l2 2 4-4"/></svg>} />
        <KPICard label="Delayed" value={delayed} icon={<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="16" height="16"><path d="M8 2L1.5 13.5h13L8 2z"/><path d="M8 7v3M8 11.5v.5"/></svg>} />
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {['all', 'Pending', 'In Transit', 'Completed', 'Delayed'].map(s => (
          <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            filter === s ? 'bg-[#6B1F2B] text-white' : 'bg-[#F5F5F7] text-[#8E8E93] hover:bg-[#EBEBF0]'
          }`}>{s === 'all' ? 'All' : s}</button>
        ))}
      </div>

      <div className="bg-white border border-black/10 rounded-lg p-6">
        <h4 className="text-sm font-semibold text-[#1A1A1A] mb-4">Delivery Routes</h4>
        {filteredRoutes.length === 0 ? (
          <p className="text-black/60 text-center py-8">No deliveries matching filter.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-black/20">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Route</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Origin → Destination</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Driver</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">ETA</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Status</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredRoutes.map((route: any) => (
                  <tr key={route.id} className="border-b border-black/10 hover:bg-black/[0.02]">
                    <td className="py-2 text-black font-mono text-xs">{route.routeId}</td>
                    <td className="px-5 py-3.5 text-sm text-[#8E8E93]">{route.origin} → {route.destination}</td>
                    <td className="px-5 py-3.5 text-sm text-[#8E8E93]">{route.driver || 'Unassigned'}</td>
                    <td className="py-2 text-black text-xs">{route.eta ? new Date(route.eta).toLocaleDateString() : '—'}</td>
                    <td className="py-2">
                      <span className={`px-2 py-1 rounded text-xs ${statusColors[route.status] || 'bg-[#F5F5F7] text-[#1A1A1A]'}`}>{route.status}</span>
                    </td>
                    <td className="py-2">
                      {route.status === 'Pending' && (
                        <button onClick={() => handleStatusUpdate(route.id, 'In Transit')} className="text-xs text-[#1A1A1A] hover:underline">Start</button>
                      )}
                      {route.status === 'In Transit' && (
                        <button onClick={() => handleStatusUpdate(route.id, 'Completed')} className="text-xs text-[#1A1A1A] hover:underline">Complete</button>
                      )}
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

