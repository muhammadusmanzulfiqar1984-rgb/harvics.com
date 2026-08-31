'use client'

/**
 * Module #1 — Financial Accounting hub
 * Scope: Module #1 ONLY (CoA · Journals · Trial Balance · Fiscal Periods).
 * Other finance modules are linked, not embedded (wire one module at a time).
 */

import React from 'react'
import Link from 'next/link'
import OSDomainTierStructure, { Tier2Module } from '@/components/shared/OSDomainTierStructure'
import FinanceModuleOneGL from '@/components/os-domains/FinanceModuleOneGL'

function ModuleOneReports() {
  return (
    <div className="p-6 space-y-4">
      <p className="text-sm text-[#6B5E52]">
        Module #1 operational reports — live Prisma data only.
      </p>
      <div className="flex flex-wrap gap-2">
        <a
          href="/api/finance/reports/gl-summary"
          target="_blank"
          rel="noreferrer"
          className="px-4 py-2 text-xs font-semibold border border-[#3D1212]/20 text-[#3D1212] hover:bg-[#F5F0E8]"
        >
          GL Summary (JSON) →
        </a>
        <a
          href="/api/finance/reports/trial-balance/export?format=csv"
          target="_blank"
          rel="noreferrer"
          className="px-4 py-2 text-xs font-semibold border border-[#3D1212]/20 text-[#3D1212] hover:bg-[#F5F0E8]"
        >
          Trial Balance CSV →
        </a>
        <a
          href="/api/finance/trial-balance"
          target="_blank"
          rel="noreferrer"
          className="px-4 py-2 text-xs font-semibold border border-[#3D1212]/20 text-[#3D1212] hover:bg-[#F5F0E8]"
        >
          Trial Balance (JSON) →
        </a>
      </div>
    </div>
  )
}

function RelatedFinanceLinks({ locale }: { locale: string }) {
  const links = [
    { href: `/${locale}/os/controlling`, label: 'Module #2 · Controlling' },
    { href: `/${locale}/os/ar-aging`, label: 'Module #3 · AR' },
    { href: `/${locale}/os/ap-aging`, label: 'Module #4 · AP' },
    { href: `/${locale}/os/treasury-banking`, label: 'Module #5 · Treasury' },
    { href: `/${locale}/os/payment-runs`, label: 'Module #6 · HPay' },
    { href: `/${locale}/os/budgets`, label: 'Module #7 · Planning' },
    { href: `/${locale}/os/finance/global-house`, label: 'Global House · Multi-entity' },
  ]
  return (
    <div className="p-6 space-y-3">
      <p className="text-sm text-[#6B5E52]">
        Sibling finance modules — wired separately. Do not embed here.
      </p>
      <div className="flex flex-wrap gap-2">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="px-4 py-2 text-xs font-semibold border border-[#3D1212]/20 text-[#3D1212] hover:bg-[#F5F0E8]"
          >
            {l.label} →
          </Link>
        ))}
      </div>
    </div>
  )
}

export default function FinanceModuleOneHub({ locale }: { locale: string }) {
  const tier2Modules: Tier2Module[] = [
    {
      id: 'module-1-gl',
      label: 'GL Workspace',
      icon: '',
      description: 'CoA · journals · trial balance · fiscal periods',
      component: <FinanceModuleOneGL />,
      tier3Screens: [
        { id: 'coa', label: 'Chart of Accounts', icon: '', component: <FinanceModuleOneGL /> },
        { id: 'journals', label: 'Journals', icon: '', component: <FinanceModuleOneGL /> },
        { id: 'trial', label: 'Trial Balance', icon: '', component: <FinanceModuleOneGL /> },
        { id: 'periods', label: 'Fiscal Periods', icon: '', component: <FinanceModuleOneGL /> },
      ],
    },
    {
      id: 'module-1-reports',
      label: 'GL Reports',
      icon: '',
      description: 'Trial balance export + GL summary',
      component: <ModuleOneReports />,
      tier3Screens: [{ id: 'reports', label: 'Reports', icon: '', component: <ModuleOneReports /> }],
    },
    {
      id: 'related-modules',
      label: 'Related Modules',
      icon: '',
      description: 'Links only — other modules wired next',
      component: <RelatedFinanceLinks locale={locale} />,
      tier3Screens: [{ id: 'links', label: 'Links', icon: '', component: <RelatedFinanceLinks locale={locale} /> }],
    },
  ]

  return (
    <OSDomainTierStructure
      domainId="finance"
      domainName="Module #1 · Financial Accounting"
      tier2Modules={tier2Modules}
      defaultModule="module-1-gl"
    />
  )
}
