'use client'

import React from 'react'
import OSDomainTierStructure, { Tier2Module } from '@/components/shared/OSDomainTierStructure'

interface QualityDomainContentProps {
  persona: 'company' | 'distributor' | 'supplier'
  locale: string
}

export default function QualityDomainContent({ persona, locale }: QualityDomainContentProps) {
  const tier2Modules: Tier2Module[] = [
    {
      id: 'inspection-plans',
      label: 'Inspection Plans',
      icon: '',
      description: 'Define quality gates and testing templates by item type',
      tier3Screens: [
        {
          id: 'plan-library',
          label: 'Plan Library',
          icon: '',
          component: (
            <div className="p-6 space-y-4">
              <h3 className="text-xl font-semibold text-[#1A1A1A]">Inspection Plan Library</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[#F5F5F7] border-b border-[#E5E5EA]">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase">Plan</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase">Industry</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase">Sampling</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-[#8E8E93] uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[{ plan: 'FMCG Batch Release', ind: 'FMCG', sampling: 'AQL 1.0', status: 'Active' }, { plan: 'Textile Dye Lot Check', ind: 'Textiles', sampling: 'Lot Based', status: 'Active' }, { plan: 'Commodity Moisture QA', ind: 'Commodities', sampling: 'Per Shipment', status: 'Draft' }].map((r, i) => (
                      <tr key={r.plan} className={i % 2 === 0 ? 'bg-white' : 'bg-[#F5F5F7]'}>
                        <td className="px-4 py-3 font-semibold text-[#1A1A1A]">{r.plan}</td>
                        <td className="px-4 py-3">{r.ind}</td>
                        <td className="px-4 py-3">{r.sampling}</td>
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
      id: 'inspection-execution',
      label: 'QC Inspections',
      icon: '',
      description: 'Run inspections, capture findings, and issue release decisions',
      tier3Screens: [
        {
          id: 'qc-dashboard',
          label: 'QC Dashboard',
          icon: '',
          component: (
            <div className="p-6 space-y-4">
              <h3 className="text-xl font-semibold text-[#1A1A1A]">Quality Performance</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[{ label: 'Inspections', value: '128' }, { label: 'Pass Rate', value: '96.1%' }, { label: 'NCR Open', value: '5' }, { label: 'CAPA On Time', value: '92%' }].map((k) => (
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
      domainId="quality"
      domainName="Quality Management OS"
      tier2Modules={tier2Modules}
    />
  )
}
