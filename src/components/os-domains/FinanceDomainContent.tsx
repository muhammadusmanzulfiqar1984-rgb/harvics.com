'use client'

import React from 'react'
import OSDomainTierStructure, { Tier2Module } from '@/components/shared/OSDomainTierStructure'
import GLOverviewContent from '@/components/domains/finance/GLOverviewContent'

interface FinanceDomainContentProps {
  persona: 'company' | 'distributor' | 'supplier'
  locale: string
}

export default function FinanceDomainContent({ persona, locale }: FinanceDomainContentProps) {
  // Tier 2 Modules for Finance Domain
  const tier2Modules: Tier2Module[] = [
    {
      id: 'general-ledger',
      label: 'General Ledger',
      icon: '📚',
      description: 'Chart of accounts and financial transaction recording',
      component: (
        <div className="p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-black mb-2">
              📚 General Ledger
            </h3>
            <p className="text-black">Chart of accounts and financial transaction recording</p>
          </div>
          <GLOverviewContent persona={persona} locale={locale} />
        </div>
      ),
      tier3Screens: [
        {
          id: 'gl-overview',
          label: 'GL Overview',
          icon: '📊',
          component: <GLOverviewContent persona={persona} locale={locale} />
        },
        {
          id: 'journal-entries',
          label: 'Journal Entries',
          icon: '📝',
          component: <div className="p-6"><h3 className="text-xl font-bold mb-4">Journal Entries</h3><p>Manage accounting entries</p></div>
        }
      ]
    },
    {
      id: 'accounts-receivable',
      label: 'Accounts Receivable',
      icon: '💵',
      description: 'Track customer invoices, payments, and outstanding balances'
    },
    {
      id: 'accounts-payable',
      label: 'Accounts Payable',
      icon: '💸',
      description: 'Manage supplier invoices, payments, and vendor balances'
    },
    {
      id: 'cash-bank',
      label: 'Cash & Bank',
      icon: '🏦',
      description: 'Bank reconciliation, cash flow tracking, and treasury management'
    },
    {
      id: 'payments',
      label: 'Payment Engine',
      icon: '💳',
      description: 'Payment processing, verification, and reconciliation',
      tier3Screens: [
        {
          id: 'verification-queue',
          label: 'Verification Queue',
          icon: '✅',
          component: (
            <div className="p-6">
              <div className="mb-4">
                <h3 className="text-xl font-bold mb-2">Payment Verification Queue</h3>
                <p className="text-black/70">Review and verify payments requiring manual verification</p>
              </div>
              <a
                href={`/${locale}/os/finance/payments/verification-queue`}
                className="inline-block px-6 py-3 bg-[#F5C542] text-black font-semibold rounded-lg hover:bg-[#F5C542]/90 transition-colors"
              >
                Open Verification Queue →
              </a>
            </div>
          )
        },
        {
          id: 'reconciliation',
          label: 'Reconciliation',
          icon: '🔄',
          component: (
            <div className="p-6">
              <div className="mb-4">
                <h3 className="text-xl font-bold mb-2">Payment Reconciliation</h3>
                <p className="text-black/70">Advanced payment reconciliation and bank deposit matching</p>
              </div>
              <a
                href={`/${locale}/os/finance/payments/reconciliation`}
                className="inline-block px-6 py-3 bg-[#F5C542] text-black font-semibold rounded-lg hover:bg-[#F5C542]/90 transition-colors"
              >
                Open Reconciliation Dashboard →
              </a>
            </div>
          )
        }
      ]
    },
    {
      id: 'pricing',
      label: 'AI Pricing Engine',
      icon: '🤖',
      description: 'Dynamic pricing, promotions, and discount management'
    },
    {
      id: 'costing',
      label: 'Costing Engine',
      icon: '📊',
      description: 'SKU costing, container costing, and margin analysis'
    }
  ]

  return (
    <OSDomainTierStructure
      domainId="finance"
      domainName="Finance OS"
      tier2Modules={tier2Modules}
      defaultModule="general-ledger"
    />
  )
}

