'use client'

import React from 'react'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import { usePathname } from 'next/navigation'

interface OSDomain {
  id: string
  label: string
  icon: string
  path: string
}

export default function OSDomainNavigation() {
  const locale = useLocale()
  const pathname = usePathname()

  // 11 Harvics OS Domains (as per spec)
  const domains: OSDomain[] = [
    { id: 'overview', label: 'Overview', icon: '📊', path: `/dashboard/company` },
    { id: 'orders-sales', label: 'Orders / Sales', icon: '📋', path: `/os/orders-sales` },
    { id: 'inventory', label: 'Inventory', icon: '📦', path: `/os/inventory` },
    { id: 'logistics', label: 'Logistics', icon: '🚚', path: `/os/logistics` },
    { id: 'finance', label: 'Finance', icon: '💰', path: `/os/finance` },
    { id: 'crm', label: 'CRM', icon: '👥', path: `/os/crm` },
    { id: 'hr', label: 'HR', icon: '👔', path: `/os/hr` },
    { id: 'executive', label: 'Executive', icon: '🎯', path: `/os/executive` },
    { id: 'investor', label: 'Investor', icon: '📈', path: `/os/investor` },
    { id: 'legal', label: 'Legal/IPR', icon: '⚖️', path: `/os/legal` },
    { id: 'competitor', label: 'Competitor', icon: '🔍', path: `/os/competitor` },
    { id: 'import-export', label: 'Import/Export', icon: '🌐', path: `/os/import-export` }
  ]

  const isActive = (path: string) => {
    return pathname?.includes(path) || false
  }

  return (
    <nav className="w-64 bg-white border-r border-black300 min-h-screen p-4">
      <div className="mb-6">
        <h2 className="text-sm font-semibold text-black uppercase tracking-wider mb-4">
          OS Domains
        </h2>
      </div>
      
      <ul className="space-y-1">
        {domains.map((domain) => {
          const href = `/${locale}${domain.path}`
          const active = isActive(domain.path)
          
          return (
            <li key={domain.id}>
              <Link
                href={href}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-md text-sm font-medium transition-all min-h-[44px] ${
                  active
                    ? 'bg-[#C3A35E] text-[#6B1F2B] font-semibold'
                    : 'text-black hover:bg-[#C3A35E]/10 hover:text-[#C3A35E]'
                }`}
              >
                <span className="text-lg leading-none flex-shrink-0 w-6 text-center">{domain.icon}</span>
                <span className="leading-tight">{domain.label}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

