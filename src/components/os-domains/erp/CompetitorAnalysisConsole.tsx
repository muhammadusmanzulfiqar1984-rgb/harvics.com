'use client'

import { useEffect, useState } from 'react'
import { ConsoleShell, Card, api } from './_shell'

interface Competitor {
  id: string
  name: string
  territory: string
  productLines: string[]
  estimatedMarketShare: number
  pricePosition: 'Premium' | 'Mid' | 'Budget'
  lastAnalyzedAt: string
  strengths: string[]
  weaknesses: string[]
}

export default function CompetitorAnalysisConsole() {
  const [competitors, setCompetitors] = useState<Competitor[]>([])
  const [loading, setLoading] = useState(false)

  const load = async () => {
    setLoading(true)
    const r = await api<Competitor[]>('/api/modules/demo/batch2/competitors')
    if (r.ok && r.data) setCompetitors(r.data)
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  const avgMarketShare = competitors.length ? (competitors.reduce((s, c) => s + c.estimatedMarketShare, 0) / competitors.length).toFixed(1) : '—'

  return (
    <ConsoleShell
      title="Competitor Analysis"
      subtitle="Market intelligence, positioning, and competitive landscape."
      kpis={[
        { label: 'Competitors Tracked', value: competitors.length },
        { label: 'Avg Market Share', value: `${avgMarketShare}%` },
        { label: 'Territories', value: new Set(competitors.map(c => c.territory)).size },
        { label: 'Premium Positioned', value: competitors.filter(c => c.pricePosition === 'Premium').length },
      ]}
      onRefresh={load}
      loading={loading}
    >
      <Card title="Competitive Landscape" count={competitors.length}>
        <div className="grid max-h-96 gap-2 overflow-auto">
          {competitors.map(c => (
            <div key={c.id} className="rounded border border-[#e8e2d5] p-2 text-xs">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-bold">{c.name}</p>
                  <p className="text-[10px] text-[#5d5d5d]">{c.territory} • {c.productLines.join(', ')}</p>
                </div>
                <span className={`rounded px-1.5 py-0.5 text-[9px] font-bold ${c.pricePosition === 'Premium' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100'}`}>{c.pricePosition}</span>
              </div>
              <div className="mt-1 text-[10px] text-[#5d5d5d]">
                <p>Market Share: {c.estimatedMarketShare}%</p>
                <p className="mt-0.5"><span className="text-emerald-600">✓</span> {c.strengths[0]}</p>
                <p><span className="text-rose-600">✗</span> {c.weaknesses[0]}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </ConsoleShell>
  )
}
