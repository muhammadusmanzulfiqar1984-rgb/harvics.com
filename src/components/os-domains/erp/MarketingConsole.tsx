'use client'

import { useEffect, useState } from 'react'
import { ConsoleShell, Card, api } from './_shell'

interface Campaign {
  id: string
  name: string
  channel: 'Email' | 'Social' | 'Web' | 'Event' | 'Direct'
  targetAudience: string
  budget: number
  spend: number
  currency: string
  status: 'Planning' | 'Active' | 'Paused' | 'Completed'
  startDate: string
  endDate?: string
  leadsGenerated: number
  conversions: number
}

export default function MarketingConsole() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(false)

  const load = async () => {
    setLoading(true)
    const r = await api<Campaign[]>('/api/modules/demo/batch2/marketing')
    if (r.ok && r.data) setCampaigns(r.data)
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  const totalBudget = campaigns.reduce((s, c) => s + c.budget, 0)
  const totalSpend = campaigns.reduce((s, c) => s + c.spend, 0)
  const totalLeads = campaigns.reduce((s, c) => s + c.leadsGenerated, 0)

  return (
    <ConsoleShell
      title="Marketing"
      subtitle="Campaigns, channels, budget tracking, and lead generation."
      kpis={[
        { label: 'Campaigns', value: campaigns.length },
        { label: 'Budget', value: `$${totalBudget.toLocaleString()}` },
        { label: 'Spend', value: `$${totalSpend.toLocaleString()}`, sub: `${((totalSpend / totalBudget) * 100).toFixed(0)}% used` },
        { label: 'Leads', value: totalLeads },
      ]}
      onRefresh={load}
      loading={loading}
    >
      <Card title="Active Campaigns" count={campaigns.length}>
        <div className="grid max-h-96 gap-2 overflow-auto">
          {campaigns.map(c => (
            <div key={c.id} className="rounded border border-[#e8e2d5] p-2 text-xs">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="font-bold">{c.name}</p>
                  <p className="text-[10px] text-[#5d5d5d]">{c.channel} → {c.targetAudience}</p>
                </div>
                <span className={`rounded px-1.5 py-0.5 text-[9px] font-bold ${c.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100'}`}>{c.status}</span>
              </div>
              <div className="mt-1.5 flex justify-between text-[10px] text-[#5d5d5d]">
                <span>Budget: ${c.budget} | Spend: ${c.spend}</span>
                <span className="font-mono">{c.conversions} conversions</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </ConsoleShell>
  )
}
