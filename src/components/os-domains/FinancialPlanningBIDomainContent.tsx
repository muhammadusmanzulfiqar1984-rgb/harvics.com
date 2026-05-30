'use client'

import React from 'react'
import OSDomainTierStructure, { Tier2Module } from '@/components/shared/OSDomainTierStructure'

interface FinancialPlanningBIDomainContentProps {
  persona: 'company' | 'distributor' | 'supplier'
  locale: string
}

export default function FinancialPlanningBIDomainContent({ persona, locale }: FinancialPlanningBIDomainContentProps) {
  const tier2Modules: Tier2Module[] = [
    {
      id: 'budget-forecast',
      label: 'Budgeting & Forecasting',
      icon: '',
      description: 'Create forecasts, compare against actuals, and monitor variance',
      tier3Screens: [
        {
          id: 'forecast-overview',
          label: 'Forecast Overview',
          icon: '',
          component: (
            <div className="p-6 space-y-4">
              <h3 className="text-xl font-semibold text-[#1A1A1A]">Forecast Overview</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[{ label: 'Revenue Forecast', value: '$18.4M' }, { label: 'OpEx Forecast', value: '$6.9M' }, { label: 'Variance', value: '-3.1%' }, { label: 'Forecast Accuracy', value: '91.2%' }].map((k) => (
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
    },
    {
      id: 'reporting-bi',
      label: 'BI & Reporting',
      icon: '',
      description: 'Build board packs, schedule reports, and track KPI trends',
      tier3Screens: [
        {
          id: 'report-library',
          label: 'Report Library',
          icon: '',
          component: (
            <div className="p-6 space-y-4">
              <h3 className="text-xl font-semibold text-[#1A1A1A]">Report Library</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[#F5F5F7] border-b border-[#E5E5EA]">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase">Report</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase">Owner</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase">Cadence</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-[#8E8E93] uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[{ name: 'Executive Weekly Board Pack', owner: 'FP&A', cadence: 'Weekly', status: 'Ready' }, { name: 'Country P&L Variance', owner: 'Finance Control', cadence: 'Monthly', status: 'Ready' }, { name: 'Cash Flow Forecast 13W', owner: 'Treasury Office', cadence: 'On Demand', status: 'Draft' }].map((r, i) => (
                      <tr key={r.name} className={i % 2 === 0 ? 'bg-white' : 'bg-[#F5F5F7]'}>
                        <td className="px-4 py-3 font-semibold text-[#1A1A1A]">{r.name}</td>
                        <td className="px-4 py-3">{r.owner}</td>
                        <td className="px-4 py-3">{r.cadence}</td>
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
    }
  ]

  return (
    <OSDomainTierStructure
      domainId="financial-planning-bi"
      domainName="Financial Planning & BI"
      tier2Modules={tier2Modules}
    />
  )
}
