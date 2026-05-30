'use client'

import React from 'react'
import OSDomainTierStructure, { Tier2Module } from '@/components/shared/OSDomainTierStructure'

interface PaymentsDigitalFinanceDomainContentProps {
  persona: 'company' | 'distributor' | 'supplier'
  locale: string
}

export default function PaymentsDigitalFinanceDomainContent({ persona, locale }: PaymentsDigitalFinanceDomainContentProps) {
  const tier2Modules: Tier2Module[] = [
    {
      id: 'payment-rails',
      label: 'Payment Rails',
      icon: '',
      description: 'Operate SWIFT, RTGS, ACH, and wallet settlement queues',
      tier3Screens: [
        {
          id: 'settlement-queue',
          label: 'Settlement Queue',
          icon: '',
          component: (
            <div className="p-6 space-y-4">
              <h3 className="text-xl font-semibold text-[#1A1A1A]">Settlement Queue</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[{ label: 'Pending', value: '38' }, { label: 'Auto-Approved', value: '21' }, { label: 'Escalated', value: '4' }, { label: 'Success Rate', value: '97.8%' }].map((k) => (
                  <div key={k.label} className="bg-[#F5F5F7] p-4" style={{ borderRadius: 0 }}>
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
      id: 'digital-wallets',
      label: 'Wallet & Crypto Ops',
      icon: '',
      description: 'Track wallet balances, conversion windows, and risk flags',
      tier3Screens: [
        {
          id: 'wallet-monitor',
          label: 'Wallet Monitor',
          icon: '',
          component: (
            <div className="p-6 space-y-4">
              <h3 className="text-xl font-semibold text-[#1A1A1A]">Digital Wallet Monitor</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[#F5F5F7] border-b border-[#E5E5EA]">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase">Wallet</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-[#8E8E93] uppercase">Asset</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-[#8E8E93] uppercase">Balance</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-[#8E8E93] uppercase">Risk</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[{ wallet: 'HPAY-MAIN', asset: 'USDT', balance: '845,200', risk: 'Low' }, { wallet: 'HPAY-SETTLEMENT', asset: 'USDC', balance: '322,900', risk: 'Low' }, { wallet: 'HPAY-TRADING', asset: 'ETH', balance: '128.4', risk: 'Medium' }].map((r, i) => (
                      <tr key={r.wallet} className={i % 2 === 0 ? 'bg-white' : 'bg-[#F5F5F7]'}>
                        <td className="px-4 py-3 font-semibold text-[#1A1A1A]">{r.wallet}</td>
                        <td className="px-4 py-3">{r.asset}</td>
                        <td className="px-4 py-3 text-right">{r.balance}</td>
                        <td className="px-4 py-3 text-center"><span className="px-2 py-1 text-xs bg-[#1A1A1A] text-white" style={{ borderRadius: 0 }}>{r.risk}</span></td>
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
      domainId="payments-digital-finance"
      domainName="Payments & Digital Finance OS"
      tier2Modules={tier2Modules}
    />
  )
}
