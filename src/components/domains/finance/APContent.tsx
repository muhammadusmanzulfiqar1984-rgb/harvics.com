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

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin h-8 w-8 border-b-2 border-[#E5E5EA]"></div></div>

  const totalAP = pos.reduce((s, p) => s + p.total, 0)
  const pending = pos.filter(p => p.status === 'Pending')

  return (
    <div className="space-y-6 p-6">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <KPICard label="Total Payables" value={`$${(totalAP / 1000).toFixed(1)}K`} icon="💸" />
        <KPICard label="Pending Approval" value={pending.length} icon="⏳" />
        <KPICard label="Active Suppliers" value={new Set(pos.map(p => p.supplier)).size} icon="🏭" />
      </div>

      <h4 className="text-lg font-semibold text-[#1D1D1F]">Purchase Orders ({pos.length})</h4>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#F5F5F7] border-b border-[#E5E5EA]">
              <th className="px-5 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">PO #</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Supplier</th>
              <th className="px-5 py-3 text-right text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Total</th>
              <th className="px-5 py-3 text-center text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Status</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">Expected</th>
            </tr>
          </thead>
          <tbody>
            {pos.map((po, i) => (
              <tr key={po.id} className={i % 2 === 0 ? 'bg-white' : 'bg-[#F5F1E8]/50'}>
                <td className="px-4 py-3 font-mono font-semibold text-[#1D1D1F]">{po.poNumber}</td>
                <td className="px-4 py-3 text-[#6B1F2B]">{po.supplier}</td>
                <td className="px-4 py-3 text-right font-bold">{po.currency} {po.total.toLocaleString()}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`px-2 py-1 text-xs font-bold ${po.status === 'Approved' ? 'bg-[#F5F5F7] text-[#1D1D1F]' : 'bg-[#F5F5F7] text-[#1D1D1F]'}`} style={{ borderRadius: 0 }}>{po.status}</span>
                </td>
                <td className="px-4 py-3 text-[#8E8E93]">{po.expectedDate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-[#F5F1E8] border-l-4 border-[#E5E5EA] p-4" style={{ borderRadius: 0 }}>
        <div className="flex items-start gap-3">
          <span className="text-xl">🤖</span>
          <div>
            <h5 className="font-semibold text-[#1D1D1F] text-sm">AI Payables Insight</h5>
            <p className="text-[#8E8E93] text-sm mt-1">
              Vietnam Textiles Co has 96% on-time delivery. Consider negotiating 5% volume discount on next PO.
              Brazil Coffee Exports PO awaiting approval — coffee prices expected to rise 8% in Q2.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
