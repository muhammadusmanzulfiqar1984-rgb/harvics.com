'use client'

import React from 'react'
import OSDomainTierStructure, { Tier2Module } from '@/components/shared/OSDomainTierStructure'

interface ManufacturingDomainContentProps {
  persona: 'company' | 'distributor' | 'supplier'
  locale: string
}

export default function ManufacturingDomainContent({ persona, locale }: ManufacturingDomainContentProps) {
  const tier2Modules: Tier2Module[] = [
    {
      id: 'production-orders',
      label: 'Production Orders',
      icon: '',
      description: 'Plan, execute, and monitor production orders by line and SKU',
      tier3Screens: [
        {
          id: 'order-board',
          label: 'Order Board',
          icon: '',
          component: (
            <div className="p-6 space-y-4">
              <h3 className="text-xl font-semibold text-[#1A1A1A]">Production Order Board</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[{ label: 'Open Orders', value: '18' }, { label: 'In Production', value: '7' }, { label: 'Delayed', value: '2' }, { label: 'Planned Output', value: '221K units' }].map((k) => (
                  <div key={k.label} className="bg-[#F5F5F7] p-4" style={{ borderRadius: 0 }}>
                    <div className="text-xl font-semibold text-[#1A1A1A]">{k.value}</div>
                    <div className="text-xs text-[#8E8E93] mt-1">{k.label}</div>
                  </div>
                ))}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[#F5F5F7] border-b border-[#E5E5EA]">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase">Order</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase">Line</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase">SKU</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-[#8E8E93] uppercase">Planned</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-[#8E8E93] uppercase">Completed</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-[#8E8E93] uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[{ id: 'PO-2026-4001', line: 'Beverages L1', sku: 'FMCG-012', planned: 18000, done: 12600, status: 'In Production' }, { id: 'PO-2026-4002', line: 'Confectionery L2', sku: 'FMCG-018', planned: 9000, done: 9000, status: 'Completed' }, { id: 'PO-2026-4003', line: 'Textile Unit A', sku: 'TEX-015', planned: 4200, done: 2800, status: 'Delayed' }].map((r, i) => (
                      <tr key={r.id} className={i % 2 === 0 ? 'bg-white' : 'bg-[#F5F5F7]'}>
                        <td className="px-4 py-3 font-mono text-xs text-[#8E8E93]">{r.id}</td>
                        <td className="px-4 py-3 font-semibold text-[#1A1A1A]">{r.line}</td>
                        <td className="px-4 py-3">{r.sku}</td>
                        <td className="px-4 py-3 text-right">{r.planned.toLocaleString()}</td>
                        <td className="px-4 py-3 text-right">{r.done.toLocaleString()}</td>
                        <td className="px-4 py-3 text-center"><span className="px-2 py-1 text-xs bg-[#1A1A1A] text-white" style={{ borderRadius: 0 }}>{r.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
        }
      ]
    },
    {
      id: 'shop-floor',
      label: 'Shop Floor & Capacity',
      icon: '',
      description: 'Track line utilization, downtime, and throughput efficiency',
      tier3Screens: [
        {
          id: 'capacity-view',
          label: 'Capacity View',
          icon: '',
          component: (
            <div className="p-6 space-y-4">
              <h3 className="text-xl font-semibold text-[#1A1A1A]">Capacity and Downtime</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[{ label: 'Utilization', value: '78%' }, { label: 'OEE', value: '82.1%' }, { label: 'Downtime', value: '4.8 hrs' }, { label: 'Yield', value: '93.4%' }].map((k) => (
                  <div key={k.label} className="border border-[#E5E5EA] p-4" style={{ borderRadius: 0 }}>
                    <div className="text-xl font-semibold text-[#1A1A1A]">{k.value}</div>
                    <div className="text-xs text-[#8E8E93] mt-1">{k.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )
        }
      ]
    }
  ]

  return (
    <OSDomainTierStructure
      domainId="manufacturing"
      domainName="Manufacturing OS"
      tier2Modules={tier2Modules}
    />
  )
}
