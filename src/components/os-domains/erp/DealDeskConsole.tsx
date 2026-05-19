'use client'

import { useEffect, useState } from 'react'
import { ConsoleShell, Card, inputCls, btnPrimary, api } from './_shell'

interface DealRequest {
  id: string
  dealName: string
  customerId: string
  opportunityValue: number
  requestedDiscount: number
  requiredMargin: number
  currency: string
  submittedBy: string
  status: 'Pending' | 'Approved' | 'Rejected' | 'Negotiating'
  approvedDiscount?: number
  decisionDate?: string
}

export default function DealDeskConsole() {
  const [deals, setDeals] = useState<DealRequest[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const load = async () => {
    setLoading(true)
    const r = await api<DealRequest[]>('/api/modules/demo/batch2/deal-desk')
    if (r.ok && r.data) setDeals(r.data)
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  const approve = async (id: string) => {
    const deal = deals.find(d => d.id === id)
    if (!deal) return
    const r = await api(`/api/modules/demo/batch2/deal-desk/${id}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ approvedDiscount: deal.requestedDiscount * 0.8 }),
    })
    setMessage(r.ok ? 'Deal approved' : r.error || 'Approval failed')
    if (r.ok) load()
  }

  const pending = deals.filter(d => d.status === 'Pending').length
  const totalValue = deals.reduce((s, d) => s + d.opportunityValue, 0)

  return (
    <ConsoleShell
      title="Deal Desk"
      subtitle="Deal exceptions, discount requests, and margin management."
      kpis={[
        { label: 'Total Opportunities', value: `$${totalValue.toLocaleString()}` },
        { label: 'Pending Approval', value: pending },
        { label: 'Approved', value: deals.filter(d => d.status === 'Approved').length },
        { label: 'Deals', value: deals.length },
      ]}
      message={message}
      onRefresh={load}
      loading={loading}
    >
      <Card title="Deal Requests" count={deals.length}>
        <div className="grid max-h-96 gap-2 overflow-auto">
          {deals.map(d => (
            <div key={d.id} className="rounded border border-[#e8e2d5] p-2 text-xs">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <p className="font-bold">{d.dealName}</p>
                  <p className="text-[10px] text-[#5d5d5d]">{d.customerId} • ${d.opportunityValue.toLocaleString()}</p>
                </div>
                <span className={`rounded px-1.5 py-0.5 text-[9px] font-bold ${d.status === 'Pending' ? 'bg-amber-100 text-amber-700' : d.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100'}`}>{d.status}</span>
              </div>
              {d.status === 'Pending' && (
                <button type="button" onClick={() => approve(d.id)} className={`${btnPrimary} mt-2 w-full`}>Approve {(d.requestedDiscount * 0.8).toFixed(0)}% discount</button>
              )}
            </div>
          ))}
        </div>
      </Card>
    </ConsoleShell>
  )
}
