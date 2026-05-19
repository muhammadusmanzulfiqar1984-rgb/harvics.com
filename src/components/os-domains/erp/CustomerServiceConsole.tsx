'use client'

import { useEffect, useState } from 'react'
import { ConsoleShell, Card, api } from './_shell'

interface Case {
  id: string
  customerId: string
  subject: string
  description: string
  priority: 'Low' | 'Medium' | 'High' | 'Critical'
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed'
  assignedTo: string
  createdAt: string
  resolvedAt?: string
}

const PRIORITY_COLOR: Record<string, string> = {
  'Critical': 'bg-rose-100 text-rose-700',
  'High': 'bg-amber-100 text-amber-700',
  'Medium': 'bg-sky-100 text-sky-700',
  'Low': 'bg-slate-100 text-slate-700',
}

export default function CustomerServiceConsole() {
  const [cases, setCases] = useState<Case[]>([])
  const [loading, setLoading] = useState(false)

  const load = async () => {
    setLoading(true)
    const r = await api<Case[]>('/api/modules/demo/batch2/customer-service')
    if (r.ok && r.data) setCases(r.data)
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  const open = cases.filter(c => c.status === 'Open' || c.status === 'In Progress').length
  const critical = cases.filter(c => c.priority === 'Critical').length

  return (
    <ConsoleShell
      title="Customer Service"
      subtitle="Support cases, tickets, and resolutions."
      kpis={[
        { label: 'Total Cases', value: cases.length },
        { label: 'Open/In Progress', value: open },
        { label: 'Critical', value: critical },
        { label: 'Closed', value: cases.filter(c => c.status === 'Closed').length },
      ]}
      onRefresh={load}
      loading={loading}
    >
      <Card title="Support Queue" count={cases.length}>
        <div className="grid max-h-96 gap-1.5 overflow-auto">
          {cases.map(c => (
            <div key={c.id} className="rounded border border-[#e8e2d5] p-2 text-xs">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <p className="font-bold">{c.subject}</p>
                  <p className="text-[10px] text-[#5d5d5d] mt-0.5">{c.description.substring(0, 50)}...</p>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <span className={`rounded px-1.5 py-0.5 text-[9px] font-bold ${PRIORITY_COLOR[c.priority] || 'bg-slate-100'}`}>{c.priority}</span>
                  <span className={`rounded px-1.5 py-0.5 text-[9px] font-bold ${c.status === 'Open' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100'}`}>{c.status}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </ConsoleShell>
  )
}
