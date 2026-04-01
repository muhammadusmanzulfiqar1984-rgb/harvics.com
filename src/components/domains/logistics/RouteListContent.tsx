'use client'

import React, { useState, useEffect } from 'react'
import { useCountry } from '@/contexts/CountryContext'
import { apiClient } from '@/lib/api'
import KPICard from '@/components/shared/KPICard'
import { WeatherWidget } from '@/components/widgets/WeatherWidget'

interface RouteListContentProps {
  persona: 'company' | 'distributor' | 'supplier'
  locale: string
}

const statusColors: Record<string, string> = {
  'In Transit': 'bg-[#F5F5F7] text-[#1D1D1F]',
  'Completed': 'bg-[#F5F5F7] text-[#1D1D1F]',
  'Pending': 'bg-[#F5F5F7] text-[#1D1D1F]',
  'Delayed': 'bg-[#F5F5F7] text-[#1D1D1F]',
}

export default function RouteListContent({ persona, locale }: RouteListContentProps) {
  const { selectedCountry } = useCountry()
  const [loading, setLoading] = useState(true)
  const [routes, setRoutes] = useState<any[]>([])
  const [summary, setSummary] = useState<any>(null)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({ origin: '', destination: '', driver: '', vehicle: '', distance: '' })

  useEffect(() => {
    loadData()
  }, [selectedCountry, persona])

  const loadData = async () => {
    setLoading(true)
    try {
      const [routesRes, summaryRes] = await Promise.all([
        apiClient.getLogisticsRoutes(),
        apiClient.getLogisticsSummary()
      ])
      setRoutes(Array.isArray((routesRes as any)?.data) ? (routesRes as any).data : [])
      setSummary((summaryRes as any)?.data || null)
    } catch (error) {
      console.error('Error loading routes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    try {
      await apiClient.createLogisticsRoute({
        origin: formData.origin,
        destination: formData.destination,
        driver: formData.driver || undefined,
        vehicle: formData.vehicle || undefined,
        distance: formData.distance ? Number(formData.distance) : 0
      })
      setShowForm(false)
      setFormData({ origin: '', destination: '', driver: '', vehicle: '', distance: '' })
      loadData()
    } catch (error) {
      console.error('Error creating route:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E5E5EA]"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[#1D1D1F]">Route List</h3>
        <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 bg-[#6B1F2B] text-white text-xs font-medium rounded-xl hover:bg-[#5a1a24] transition-colors">
          + New Route
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard label="Total Routes" value={summary?.totalRoutes ?? routes.length} icon="🗺️" />
        <KPICard label="Active / In Transit" value={summary?.activeDeliveries ?? 0} icon={<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="16" height="16"><rect x="1" y="6" width="9" height="7" rx="1"/><path d="M10 8h3.5L15 10.5V13h-5"/><circle cx="4.5" cy="13.5" r="1.5"/><circle cx="12.5" cy="13.5" r="1.5"/></svg>} />
        <KPICard label="Completed" value={summary?.completedToday ?? 0} icon={<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="16" height="16"><circle cx="8" cy="8" r="6.5"/><path d="M5 8l2 2 4-4"/></svg>} />
        <KPICard label="On-Time Rate" value={`${summary?.onTimeRate ?? 0}%`} icon="⚡" />
      </div>

      {showForm && (
        <div className="bg-white border border-black/20 rounded-lg p-6 space-y-4">
          <h4 className="text-sm font-semibold text-[#1D1D1F]">Create New Route</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <input placeholder="Origin *" value={formData.origin} onChange={e => setFormData(p => ({...p, origin: e.target.value}))} className="border border-black/20 rounded-lg px-3 py-2 text-black" />
            <input placeholder="Destination *" value={formData.destination} onChange={e => setFormData(p => ({...p, destination: e.target.value}))} className="border border-black/20 rounded-lg px-3 py-2 text-black" />
            <input placeholder="Driver" value={formData.driver} onChange={e => setFormData(p => ({...p, driver: e.target.value}))} className="border border-black/20 rounded-lg px-3 py-2 text-black" />
            <input placeholder="Vehicle" value={formData.vehicle} onChange={e => setFormData(p => ({...p, vehicle: e.target.value}))} className="border border-black/20 rounded-lg px-3 py-2 text-black" />
            <input placeholder="Distance (km)" type="number" value={formData.distance} onChange={e => setFormData(p => ({...p, distance: e.target.value}))} className="border border-black/20 rounded-lg px-3 py-2 text-black" />
          </div>
          <div className="flex gap-3">
            <button onClick={handleCreate} disabled={!formData.origin || !formData.destination} className="bg-[#6B1F2B] text-black px-6 py-2 rounded-lg font-semibold hover:bg-[#b8963f] disabled:opacity-50 transition-colors">Create</button>
            <button onClick={() => setShowForm(false)} className="border border-black/20 text-black px-6 py-2 rounded-lg hover:bg-black/5 transition-colors">Cancel</button>
          </div>
        </div>
      )}

      <div className="bg-white border border-black/10 rounded-lg p-6">
        <h4 className="text-sm font-semibold text-[#1D1D1F] mb-4">Route Management</h4>
        {routes.length === 0 ? (
          <p className="text-black/60 text-center py-8">No routes found. Create your first route above.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-black/20">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Route ID</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Origin</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Destination</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Driver</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Vehicle</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Distance</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">ETA</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody>
                {routes.map((route: any) => (
                  <tr key={route.id} className="border-b border-black/10 hover:bg-black/[0.02]">
                    <td className="py-2 text-black font-mono text-xs">{route.routeId}</td>
                    <td className="px-5 py-3.5 text-sm text-[#8E8E93]">{route.origin}</td>
                    <td className="px-5 py-3.5 text-sm text-[#8E8E93]">{route.destination}</td>
                    <td className="px-5 py-3.5 text-sm text-[#8E8E93]">{route.driver || '—'}</td>
                    <td className="px-5 py-3.5 text-sm text-[#8E8E93]">{route.vehicle || '—'}</td>
                    <td className="px-5 py-3.5 text-sm text-[#8E8E93]">{route.distance ? `${route.distance} km` : '—'}</td>
                    <td className="py-2 text-black text-xs">{route.eta ? new Date(route.eta).toLocaleDateString() : '—'}</td>
                    <td className="py-2">
                      <span className={`px-2 py-1 rounded text-xs ${statusColors[route.status] || 'bg-[#F5F5F7] text-[#1D1D1F]'}`}>{route.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {/* Live weather across logistics hubs */}
      <div className="mt-6"><WeatherWidget /></div>
    </div>
  )
}

