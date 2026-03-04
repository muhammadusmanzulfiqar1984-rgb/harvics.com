'use client'

import React from 'react'
import OSDomainTierStructure, { Tier2Module } from '@/components/shared/OSDomainTierStructure'
import GLOverviewContent from '@/components/domains/finance/GLOverviewContent'
import ARContent from '@/components/domains/finance/ARContent'
import APContent from '@/components/domains/finance/APContent'
import CashBankContent from '@/components/domains/finance/CashBankContent'

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
      description: 'Chart of accounts, invoices, journal entries — all live from backend',
      component: (
        <div className="p-6">
          <GLOverviewContent persona={persona} locale={locale} />
        </div>
      ),
      tier3Screens: [
        {
          id: 'gl-overview',
          label: 'GL Overview',
          icon: '📊',
          component: <GLOverviewContent persona={persona} locale={locale} />
        }
      ]
    },
    {
      id: 'accounts-receivable',
      label: 'Accounts Receivable',
      icon: '💵',
      description: 'Track customer invoices, record payments, monitor collections',
      component: <ARContent />,
      tier3Screens: [
        {
          id: 'ar-overview',
          label: 'AR Overview',
          icon: '💰',
          component: <ARContent />
        }
      ]
    },
    {
      id: 'accounts-payable',
      label: 'Accounts Payable',
      icon: '💸',
      description: 'Manage supplier invoices, purchase orders, and vendor balances',
      component: <APContent />,
      tier3Screens: [
        {
          id: 'ap-overview',
          label: 'AP Overview',
          icon: '💸',
          component: <APContent />
        }
      ]
    },
    {
      id: 'cash-bank',
      label: 'Cash & Bank',
      icon: '🏦',
      description: 'Bank balances, currency conversion, FX exposure, treasury management',
      component: <CashBankContent />,
      tier3Screens: [
        {
          id: 'cash-overview',
          label: 'Cash Overview',
          icon: '💵',
          component: <CashBankContent />
        }
      ]
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
                <h3 className="text-xl font-bold mb-2 text-[#6B1F2B]">Payment Verification Queue</h3>
                <p className="text-[#6B1F2B]/70">Review and verify payments requiring manual verification</p>
              </div>
              <a
                href={`/${locale}/os/finance/payments/verification-queue`}
                className="inline-block px-6 py-3 font-semibold text-white transition-colors"
                style={{ background: '#6B1F2B', borderRadius: 0 }}
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
                <h3 className="text-xl font-bold mb-2 text-[#6B1F2B]">Payment Reconciliation</h3>
                <p className="text-[#6B1F2B]/70">Advanced payment reconciliation and bank deposit matching</p>
              </div>
              <a
                href={`/${locale}/os/finance/payments/reconciliation`}
                className="inline-block px-6 py-3 font-semibold text-white transition-colors"
                style={{ background: '#6B1F2B', borderRadius: 0 }}
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

