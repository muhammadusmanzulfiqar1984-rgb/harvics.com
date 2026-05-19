'use client'

import { useEffect, useState } from 'react'
import { ConsoleShell, Card, api } from './_shell'

interface SalesOpsRecord {
  id: string
  type: 'quota' | 'forecast' | 'pipeline' | 'target'
  owner: string
  ownerRole: string
  territory: string
  value: number
  currency: string
  period: string
  status: 'On Track' | 'At Risk' | 'Overachieving'
  lastUpdated: string
}

const STATUS_COLOR: Record<string, string> = {
  'On Track': 'bg-emerald-100 text-emerald-700',
  'At Risk': 'bg-amber-100 text-amber-700',
  'Overachieving': 'bg-blue-100 text-blue-700',
}

export default function SalesOpsConsole() {
  const [records, setRecords] = useState<SalesOpsRecord[]>([])
  const [loading, setLoading] = useState(false)

  const load = async () => {
    setLoading(true)
    const r = await api<SalesOpsRecord[]>('/api/modules/demo/batch2/sales-ops')
    if (r.ok && r.data) setRecords(r.data)
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  const totalValue = records.reduce((s, r) => s + r.value, 0)
  const quotas = records.filter(r => r.type === 'quota').length

  return (
    <ConsoleShell
      title="Sales Operations"
      subtitle="Quotas, forecasts, pipeline, and targets across territories."
      kpis={[
        { label: 'Total Value', value: `$${totalValue.toLocaleString()}` },
        { label: 'Quotas', value: quotas },
        { label: 'Territories', value: new Set(records.map(r => r.territory)).size },
        { label: 'At Risk', value: records.filter(r => r.status === 'At Risk').length },
      ]}
      onRefresh={load}
      loading={loading}
    >
      <Card title="Sales Records" count={records.length}>
        <div className="grid max-h-96 gap-1.5 overflow-auto">
          {records.map(r => (
            <div key={r.id} className="rounded border border-[#e8e2d5] p-2 text-xs flex items-center justify-between">
              <div>
                <span className="font-bold">{r.type}</span> · {r.territory}
                <p className="text-[10px] text-[#5d5d5d] mt-0.5">{r.period} • {r.owner}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono">${r.value.toLocaleString()}</span>
                <span className={`rounded px-2 py-0.5 text-[10px] font-bold ${STATUS_COLOR[r.status] || 'bg-gray-100'}`}>{r.status}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </ConsoleShell>
  )
}
