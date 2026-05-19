'use client'

import { useEffect, useState } from 'react'
import { ConsoleShell, Card, api } from './_shell'

interface Contract {
  id: string
  contractNumber: string
  counterparty: string
  type: 'Supply' | 'Service' | 'Distribution' | 'License'
  value: number
  currency: string
  status: 'Draft' | 'Pending Sign' | 'Active' | 'Expired'
  startDate: string
  endDate: string
  renewalTerms: string
  createdAt: string
}

export default function ContractsConsole() {
  const [contracts, setContracts] = useState<Contract[]>([])
  const [loading, setLoading] = useState(false)

  const load = async () => {
    setLoading(true)
    const r = await api<Contract[]>('/api/modules/demo/batch2/contracts')
    if (r.ok && r.data) setContracts(r.data)
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  const totalValue = contracts.reduce((s, c) => s + c.value, 0)
  const active = contracts.filter(c => c.status === 'Active').length

  return (
    <ConsoleShell
      title="Contracts"
      subtitle="Active agreements, renewals, and contract lifecycle."
      kpis={[
        { label: 'Total Contracts', value: contracts.length },
        { label: 'Active', value: active },
        { label: 'Total Value', value: `$${totalValue.toLocaleString()}` },
        { label: 'Pending Sign', value: contracts.filter(c => c.status === 'Pending Sign').length },
      ]}
      onRefresh={load}
      loading={loading}
    >
      <Card title="Contract Portfolio" count={contracts.length}>
        <div className="grid max-h-96 gap-2 overflow-auto">
          {contracts.map(c => (
            <div key={c.id} className="rounded border border-[#e8e2d5] p-2 text-xs">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-bold">{c.contractNumber} • {c.counterparty}</p>
                  <p className="text-[10px] text-[#5d5d5d]">{c.type}</p>
                </div>
                <span className={`rounded px-1.5 py-0.5 text-[9px] font-bold ${c.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{c.status}</span>
              </div>
              <div className="mt-1 flex justify-between text-[10px] text-[#5d5d5d]">
                <span>${c.value.toLocaleString()}</span>
                <span>{new Date(c.endDate).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </ConsoleShell>
  )
}
