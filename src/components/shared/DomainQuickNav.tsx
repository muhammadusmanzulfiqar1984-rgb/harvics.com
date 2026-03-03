'use client'

import React from 'react'
import Link from 'next/link'
import { useLocale } from 'next-intl'

interface DomainItem {
  id: string
  label: string
  icon: string
  href: string
}

interface DomainQuickNavProps {
  domains?: DomainItem[]
}

// Note: Localization is NOT included here - it's Tier 0 infrastructure, not a navigable domain
const defaultDomains: DomainItem[] = [
  { id: 'inventory', label: 'Inventory', icon: '📦', href: '/os/inventory' },
  { id: 'logistics', label: 'Logistics', icon: '🚚', href: '/os/logistics' },
  { id: 'finance', label: 'Finance', icon: '💰', href: '/os/finance' },
  { id: 'crm', label: 'CRM', icon: '👥', href: '/os/crm' },
  { id: 'hr', label: 'HR', icon: '👔', href: '/os/hr' },
  { id: 'executive', label: 'Executive', icon: '🎯', href: '/os/executive' },
  { id: 'investor', label: 'Investor', icon: '📈', href: '/os/investor' },
  { id: 'legal', label: 'Legal/IPR', icon: '⚖️', href: '/os/legal' },
  { id: 'competitor', label: 'Competitor', icon: '🔍', href: '/os/competitor' },
  { id: 'import-export', label: 'Import', icon: '🌐', href: '/os/import-export' }
]

export default function DomainQuickNav({ domains = defaultDomains }: DomainQuickNavProps) {
  const locale = useLocale()

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-black">🔧 OS Domains - Deep Work Access</h3>
        <span className="text-xs text-black/60">Full Tier 2/3 structure</span>
      </div>
      <nav className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {domains.map((domain) => (
          <Link
            key={domain.id}
            href={`/${locale}${domain.href}`}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-black200 rounded-lg hover:border-[#C3A35E] hover:bg-[#C3A35E]/5 transition-all duration-200 whitespace-nowrap group"
            title={`Open ${domain.label} OS Domain - Full Tier structure with modules and screens`}
          >
            <span className="text-xl group-hover:scale-110 transition-transform duration-200">
              {domain.icon}
            </span>
            <span className="text-sm font-medium text-black group-hover:text-[#C3A35E] transition-colors">
              {domain.label}
            </span>
          </Link>
        ))}
      </nav>
      <p className="text-xs text-black/60 mt-2">
        💡 These open dedicated OS Domain pages with full Tier 2 (Modules) → Tier 3 (Screens) structure
      </p>
    </div>
  )
}

