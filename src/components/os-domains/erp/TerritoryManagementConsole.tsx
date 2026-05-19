'use client'

import { useEffect, useState } from 'react'
import { ConsoleShell, Card, api } from './_shell'

interface Territory {
  id: string
  code: string
  name: string
  manager: string
  region: string
  potentialRevenue: number
  actualRevenue: number
  currency: string
  achievementPercent: number
  status: 'Active' | 'New' | 'Underperforming'
  updatedAt: string
}

export default function TerritoryManagementConsole() {
  const [territories, setTerritories] = useState<Territory[]>([])
  const [loading, setLoading] = useState(false)

  const load = async () => {
    setLoading(true)
    const r = await api<Territory[]>('/api/modules/demo/batch2/territories')
    if (r.ok && r.data) setTerritories(r.data)
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  const totalPotential = territories.reduce((s, t) => s + t.potentialRevenue, 0)
  const totalActual = territories.reduce((s, t) => s + t.actualRevenue, 0)
  const avgAchievement = territories.length ? (totalActual / totalPotential * 100).toFixed(0) : '—'

  return (
    <ConsoleShell
      title="Territory Management"
      subtitle="Geographic segments, targets, and performance tracking."
      kpis={[
        { label: 'Territories', value: territories.length },
        { label: 'Potential', value: `$${totalPotential.toLocaleString()}` },
        { label: 'Actual Revenue', value: `$${totalActual.toLocaleString()}` },
        { label: 'Achievement', value: `${avgAchievement}%` },
      ]}
      onRefresh={load}
      loading={loading}
    >
      <Card title="Territory Portfolio" count={territories.length}>
        <div className="grid max-h-96 gap-2 overflow-auto">
          {territories.map(t => (
            <div key={t.id} className="rounded border border-[#e8e2d5] p-2 text-xs">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="font-bold">{t.code} • {t.name}</p>
                  <p className="text-[10px] text-[#5d5d5d]">{t.manager} • {t.region}</p>
                </div>
                <span className={`rounded px-1.5 py-0.5 text-[9px] font-bold ${t.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{t.status}</span>
              </div>
              <div className="mt-1 flex justify-between text-[10px]">
                <span className="text-[#5d5d5d]">Target: ${(t.potentialRevenue / 1000).toFixed(0)}k</span>
                <span className="font-mono">{t.achievementPercent}%</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </ConsoleShell>
  )
}
