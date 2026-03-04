'use client'

import React, { useState, useEffect } from 'react'
import KPICard from '@/components/shared/KPICard'

interface PO {
  id: string
  poNumber: string
  supplier: string
  items: any[]
  total: number
  currency: string
  status: string
  expectedDate: string
}

export default function APContent() {
  const [pos, setPOs] = useState<PO[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/procurement-crud/po').then(r => r.json())
      if (res.success) setPOs(res.data)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin h-8 w-8 border-b-2 border-[#C3A35E]"></div></div>

  const totalAP = pos.reduce((s, p) => s + p.total, 0)
  const pending = pos.filter(p => p.status === 'Pending')

  return (
    <div className="space-y-6 p-6">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <KPICard label="Total Payables" value={`$${(totalAP / 1000).toFixed(1)}K`} icon="💸" />
        <KPICard label="Pending Approval" value={pending.length} icon="⏳" />
        <KPICard label="Active Suppliers" value={new Set(pos.map(p => p.supplier)).size} icon="🏭" />
      </div>

      <h4 className="text-lg font-bold text-[#6B1F2B]">Purchase Orders ({pos.length})</h4>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#6B1F2B] text-white">
              <th className="px-4 py-3 text-left">PO #</th>
              <th className="px-4 py-3 text-left">Supplier</th>
              <th className="px-4 py-3 text-right">Total</th>
              <th className="px-4 py-3 text-center">Status</th>
              <th className="px-4 py-3 text-left">Expected</th>
            </tr>
          </thead>
          <tbody>
            {pos.map((po, i) => (
              <tr key={po.id} className={i % 2 === 0 ? 'bg-white' : 'bg-[#F5F1E8]/50'}>
                <td className="px-4 py-3 font-mono font-bold text-[#6B1F2B]">{po.poNumber}</td>
                <td className="px-4 py-3 text-[#6B1F2B]">{po.supplier}</td>
                <td className="px-4 py-3 text-right font-bold">{po.currency} {po.total.toLocaleString()}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`px-2 py-1 text-xs font-bold ${po.status === 'Approved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`} style={{ borderRadius: 0 }}>{po.status}</span>
                </td>
                <td className="px-4 py-3 text-[#6B1F2B]/70">{po.expectedDate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-[#F5F1E8] border-l-4 border-[#C3A35E] p-4" style={{ borderRadius: 0 }}>
        <div className="flex items-start gap-3">
          <span className="text-xl">🤖</span>
          <div>
            <h5 className="font-bold text-[#6B1F2B] text-sm">AI Payables Insight</h5>
            <p className="text-[#6B1F2B]/80 text-sm mt-1">
              Vietnam Textiles Co has 96% on-time delivery. Consider negotiating 5% volume discount on next PO.
              Brazil Coffee Exports PO awaiting approval — coffee prices expected to rise 8% in Q2.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
