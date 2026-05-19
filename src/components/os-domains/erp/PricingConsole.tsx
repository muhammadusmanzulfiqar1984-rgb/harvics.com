'use client'

import { useEffect, useState } from 'react'
import { ConsoleShell, Card, inputCls, btnPrimary, api } from './_shell'

interface PricingRecord {
  id: string
  sku: string
  territory: string
  listPrice: number
  discountPercent: number
  effectivePrice: number
  currency: string
  minVolume: number
  maxVolume: number
  validFrom: string
  validTo: string
  status: 'Active' | 'Archived'
}

export default function PricingConsole() {
  const [records, setRecords] = useState<PricingRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const load = async () => {
    setLoading(true)
    const r = await api<PricingRecord[]>('/api/modules/demo/batch2/pricing')
    if (r.ok && r.data) setRecords(r.data)
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  const avgPrice = records.length ? (records.reduce((s, r) => s + r.effectivePrice, 0) / records.length).toFixed(2) : '—'
  const active = records.filter(r => r.status === 'Active').length

  return (
    <ConsoleShell
      title="Pricing"
      subtitle="Tiered pricing by territory and volume. Real-time discount matrix."
      kpis={[
        { label: 'Price Points', value: records.length },
        { label: 'Active SKUs', value: new Set(records.map(r => r.sku)).size },
        { label: 'Avg Price', value: `$${avgPrice}` },
        { label: 'Territories', value: new Set(records.map(r => r.territory)).size },
      ]}
      message={message}
      onRefresh={load}
      loading={loading}
    >
      <Card title="Pricing Matrix" count={records.length}>
        <div className="grid max-h-96 gap-2 overflow-auto">
          {records.map(r => (
            <div key={r.id} className="rounded border border-[#e8e2d5] p-2 text-xs grid grid-cols-6 gap-1">
              <div><span className="font-bold">{r.sku}</span></div>
              <div>{r.territory}</div>
              <div className="font-mono">${r.effectivePrice.toFixed(2)}</div>
              <div className="text-[10px] text-[#5d5d5d]">vol {r.minVolume}-{r.maxVolume}</div>
              <div className="text-[10px]">{r.discountPercent}% off</div>
              <div className={`rounded px-1 text-[10px] ${r.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100'}`}>{r.status}</div>
            </div>
          ))}
        </div>
      </Card>
    </ConsoleShell>
  )
}
