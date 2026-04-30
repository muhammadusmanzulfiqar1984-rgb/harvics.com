'use client'

import React from 'react'
import OSDomainTierStructure, { Tier2Module } from '@/components/shared/OSDomainTierStructure'

interface TreasuryBankingDomainContentProps {
  persona: 'company' | 'distributor' | 'supplier'
  locale: string
}

export default function TreasuryBankingDomainContent({ persona, locale }: TreasuryBankingDomainContentProps) {
  const tier2Modules: Tier2Module[] = [
    {
      id: 'cash-position',
      label: 'Cash Position',
      icon: '',
      description: 'Track liquidity by entity, bank, and currency in real time',
      tier3Screens: [
        {
          id: 'liquidity-dashboard',
          label: 'Liquidity Dashboard',
          icon: '',
          component: (
            <div className="p-6 space-y-4">
              <h3 className="text-xl font-semibold text-[#1D1D1F]">Global Liquidity Position</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[{ label: 'Available Cash', value: '$12.8M' }, { label: '7-Day Outflows', value: '$4.1M' }, { label: 'FX Exposure', value: '$2.3M' }, { label: 'Coverage Ratio', value: '3.1x' }].map((k) => (
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
      id: 'bank-ops',
      label: 'Bank Operations',
      icon: '',
      description: 'Monitor statement imports, reconciliation, and payment factory queues',
      tier3Screens: [
        {
          id: 'bank-register',
          label: 'Bank Register',
          icon: '',
          component: (
            <div className="p-6 space-y-4">
              <h3 className="text-xl font-semibold text-[#1D1D1F]">Bank Account Register</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[#F5F5F7] border-b border-[#E5E5EA]">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase">Bank</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase">Country</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase">Currency</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-[#8E8E93] uppercase">Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[{ bank: 'HSBC', country: 'UAE', currency: 'USD', balance: '4,820,000' }, { bank: 'Standard Chartered', country: 'Pakistan', currency: 'PKR', balance: '410,000,000' }, { bank: 'Barclays', country: 'UK', currency: 'GBP', balance: '1,180,000' }].map((r, i) => (
                      <tr key={r.bank + r.country} className={i % 2 === 0 ? 'bg-white' : 'bg-[#F5F5F7]'}>
                        <td className="px-4 py-3 font-semibold text-[#1D1D1F]">{r.bank}</td>
                        <td className="px-4 py-3">{r.country}</td>
                        <td className="px-4 py-3">{r.currency}</td>
                        <td className="px-4 py-3 text-right">{r.balance}</td>
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
      domainId="treasury-banking"
      domainName="Treasury & Banking OS"
      tier2Modules={tier2Modules}
    />
  )
}
