'use client'

import React from 'react'
import OSDomainTierStructure, { Tier2Module } from '@/components/shared/OSDomainTierStructure'

interface MarketingDomainContentProps {
  persona: 'company' | 'distributor' | 'supplier'
  locale: string
}

export default function MarketingDomainContent({ persona, locale }: MarketingDomainContentProps) {
  const tier2Modules: Tier2Module[] = [
    {
      id: 'campaign-ops',
      label: 'Campaign Operations',
      icon: '',
      description: 'Plan campaigns across channels with spend and ROI visibility',
      tier3Screens: [
        {
          id: 'campaign-board',
          label: 'Campaign Board',
          icon: '',
          component: (
            <div className="p-6 space-y-4">
              <h3 className="text-xl font-semibold text-[#1D1D1F]">Campaign Board</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[{ label: 'Active Campaigns', value: '14' }, { label: 'Total Reach', value: '2.8M' }, { label: 'CTR', value: '4.9%' }, { label: 'ROI', value: '2.3x' }].map((k) => (
                  <div key={k.label} className="border border-[#E5E5EA] p-4" style={{ borderRadius: 0 }}>
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
      id: 'journeys-segmentation',
      label: 'Journeys & Segments',
      icon: '',
      description: 'Execute customer journeys and segment performance cohorts',
      tier3Screens: [
        {
          id: 'segment-performance',
          label: 'Segment Performance',
          icon: '',
          component: (
            <div className="p-6 space-y-4">
              <h3 className="text-xl font-semibold text-[#1D1D1F]">Segment Performance</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[#F5F5F7] border-b border-[#E5E5EA]">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase">Segment</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-[#8E8E93] uppercase">Contacts</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-[#8E8E93] uppercase">Conversion</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-[#8E8E93] uppercase">Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[{ segment: 'Modern Trade Buyers', contacts: '18,400', conversion: '6.2%', revenue: '$420,000' }, { segment: 'Distributor Owners', contacts: '6,120', conversion: '8.1%', revenue: '$368,000' }, { segment: 'Export Procurement Teams', contacts: '2,940', conversion: '4.7%', revenue: '$214,000' }].map((r, i) => (
                      <tr key={r.segment} className={i % 2 === 0 ? 'bg-white' : 'bg-[#F5F5F7]'}>
                        <td className="px-4 py-3 font-semibold text-[#1D1D1F]">{r.segment}</td>
                        <td className="px-4 py-3 text-right">{r.contacts}</td>
                        <td className="px-4 py-3 text-right">{r.conversion}</td>
                        <td className="px-4 py-3 text-right">{r.revenue}</td>
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
      domainId="marketing"
      domainName="Marketing OS"
      tier2Modules={tier2Modules}
    />
  )
}
