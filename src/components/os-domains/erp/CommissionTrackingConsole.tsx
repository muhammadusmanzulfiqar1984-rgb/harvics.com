'use client'

import { useEffect, useState } from 'react'
import { ConsoleShell, Card, api } from './_shell'

interface Commission {
  id: string
  employeeId: string
  employeeName: string
  period: string
  baseRevenue: number
  commissionRate: number
  commissionAmount: number
  currency: string
  status: 'Calculated' | 'Approved' | 'Paid'
  paidDate?: string
}

export default function CommissionTrackingConsole() {
  const [records, setRecords] = useState<Commission[]>([])
  const [loading, setLoading] = useState(false)

  const load = async () => {
    setLoading(true)
    const r = await api<Commission[]>('/api/modules/demo/batch2/commissions')
    if (r.ok && r.data) setRecords(r.data)
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  const totalCommission = records.reduce((s, r) => s + r.commissionAmount, 0)
  const paid = records.filter(r => r.status === 'Paid').length
  const pending = records.filter(r => r.status !== 'Paid').length

  return (
    <ConsoleShell
      title="Commission Tracking"
      subtitle="Sales rep commissions, calculations, approvals, and payouts."
      kpis={[
        { label: 'Total Commission', value: `$${totalCommission.toLocaleString()}` },
        { label: 'Paid', value: paid },
        { label: 'Pending', value: pending },
        { label: 'Reps', value: new Set(records.map(r => r.employeeId)).size },
      ]}
      onRefresh={load}
      loading={loading}
    >
      <Card title="Commission Queue" count={records.length}>
        <div className="grid max-h-96 gap-2 overflow-auto">
          {records.map(r => (
            <div key={r.id} className="rounded border border-[#e8e2d5] p-2 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold">{r.employeeName}</p>
                  <p className="text-[10px] text-[#5d5d5d]">{r.period}</p>
                </div>
                <span className={`rounded px-1.5 py-0.5 text-[9px] font-bold ${r.status === 'Paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{r.status}</span>
              </div>
              <div className="mt-1 flex justify-between text-[10px] text-[#5d5d5d]">
                <span>Revenue: ${r.baseRevenue.toLocaleString()}</span>
                <span className="font-mono font-bold">${r.commissionAmount.toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </ConsoleShell>
  )
}
