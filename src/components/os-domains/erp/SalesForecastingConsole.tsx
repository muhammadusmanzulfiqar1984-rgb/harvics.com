'use client'

import { useEffect, useState } from 'react'
import { ConsoleShell, Card, api } from './_shell'

interface Forecast {
  id: string
  forecastPeriod: string
  ownerId: string
  ownerTerritory: string
  bestCase: number
  baseCase: number
  worstCase: number
  currency: string
  confidence: number
  lastUpdated: string
  notes: string
}

export default function SalesForecastingConsole() {
  const [forecasts, setForecasts] = useState<Forecast[]>([])
  const [loading, setLoading] = useState(false)

  const load = async () => {
    setLoading(true)
    const r = await api<Forecast[]>('/api/modules/demo/batch2/forecasts')
    if (r.ok && r.data) setForecasts(r.data)
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  const totalBase = forecasts.reduce((s, f) => s + f.baseCase, 0)
  const avgConfidence = forecasts.length ? (forecasts.reduce((s, f) => s + f.confidence, 0) / forecasts.length).toFixed(0) : '—'

  return (
    <ConsoleShell
      title="Sales Forecasting"
      subtitle="Quarterly forecasts, scenario planning, and confidence tracking."
      kpis={[
        { label: 'Base Case', value: `$${totalBase.toLocaleString()}` },
        { label: 'Forecasts', value: forecasts.length },
        { label: 'Avg Confidence', value: `${avgConfidence}%` },
        { label: 'Territories', value: new Set(forecasts.map(f => f.ownerTerritory)).size },
      ]}
      onRefresh={load}
      loading={loading}
    >
      <Card title="Forecast Scenarios" count={forecasts.length}>
        <div className="grid max-h-96 gap-2 overflow-auto">
          {forecasts.map(f => (
            <div key={f.id} className="rounded border border-[#e8e2d5] p-2 text-xs">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-bold">{f.forecastPeriod} • {f.ownerTerritory}</p>
                  <p className="text-[10px] text-[#5d5d5d]">{f.notes}</p>
                </div>
                <span className="text-[9px] font-bold bg-sky-100 text-sky-700 rounded px-1.5 py-0.5">{f.confidence}%</span>
              </div>
              <div className="mt-1.5 grid grid-cols-3 gap-1 text-[10px]">
                <div className="bg-rose-50 p-1 rounded">
                  <p className="text-[#5d5d5d]">Worst</p>
                  <p className="font-mono">${(f.worstCase / 1000).toFixed(0)}k</p>
                </div>
                <div className="bg-blue-50 p-1 rounded">
                  <p className="text-[#5d5d5d]">Base</p>
                  <p className="font-mono">${(f.baseCase / 1000).toFixed(0)}k</p>
                </div>
                <div className="bg-emerald-50 p-1 rounded">
                  <p className="text-[#5d5d5d]">Best</p>
                  <p className="font-mono">${(f.bestCase / 1000).toFixed(0)}k</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </ConsoleShell>
  )
}
