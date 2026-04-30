'use client'

import React from 'react'
import OSDomainTierStructure, { Tier2Module } from '@/components/shared/OSDomainTierStructure'

interface ShippingTradeDomainContentProps {
  persona: 'company' | 'distributor' | 'supplier'
  locale: string
}

export default function ShippingTradeDomainContent({ persona, locale }: ShippingTradeDomainContentProps) {
  const tier2Modules: Tier2Module[] = [
    {
      id: 'shipment-control',
      label: 'Shipment Control Tower',
      icon: '',
      description: 'Track multimodal shipments, milestones, and delivery risks',
      tier3Screens: [
        {
          id: 'shipment-tracker',
          label: 'Shipment Tracker',
          icon: '',
          component: (
            <div className="p-6 space-y-4">
              <h3 className="text-xl font-semibold text-[#1D1D1F]">Shipment Tracker</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[{ label: 'In Transit', value: '26' }, { label: 'At Port', value: '9' }, { label: 'Delayed', value: '3' }, { label: 'On-Time', value: '92.4%' }].map((k) => (
                  <div key={k.label} className="bg-[#F5F5F7] p-4" style={{ borderRadius: 0 }}>
                    <div className="text-xl font-semibold text-[#1D1D1F]">{k.value}</div>
                    <div className="text-xs text-[#8E8E93] mt-1">{k.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )
        }
      ]
    },
    {
      id: 'trade-compliance',
      label: 'Trade Compliance',
      icon: '',
      description: 'Validate trade documentation, sanctions checks, and landed costs',
      tier3Screens: [
        {
          id: 'document-vault',
          label: 'Document Vault',
          icon: '',
          component: (
            <div className="p-6 space-y-4">
              <h3 className="text-xl font-semibold text-[#1D1D1F]">Trade Document Vault</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[#F5F5F7] border-b border-[#E5E5EA]">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase">Shipment</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase">Incoterm</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase">Status</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-[#8E8E93] uppercase">Compliance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[{ shipment: 'SHP-2026-7811', incoterm: 'CIF', status: 'Ocean Transit', compliance: 'Cleared' }, { shipment: 'SHP-2026-7812', incoterm: 'FOB', status: 'Port Hold', compliance: 'Review' }, { shipment: 'SHP-2026-7813', incoterm: 'DAP', status: 'Last Mile', compliance: 'Cleared' }].map((r, i) => (
                      <tr key={r.shipment} className={i % 2 === 0 ? 'bg-white' : 'bg-[#F5F5F7]'}>
                        <td className="px-4 py-3 font-mono text-xs text-[#8E8E93]">{r.shipment}</td>
                        <td className="px-4 py-3">{r.incoterm}</td>
                        <td className="px-4 py-3">{r.status}</td>
                        <td className="px-4 py-3 text-center"><span className="px-2 py-1 text-xs bg-[#1D1D1F] text-white" style={{ borderRadius: 0 }}>{r.compliance}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
        }
      ]
    }
  ]

  return (
    <OSDomainTierStructure
      domainId="shipping-trade"
      domainName="Shipping & Trade OS"
      tier2Modules={tier2Modules}
    />
  )
}
