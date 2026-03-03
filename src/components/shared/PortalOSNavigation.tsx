'use client'

import React from 'react'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import { usePathname } from 'next/navigation'
import { getTierColors } from '@/config/tier-colors'

interface OSModule {
  id: string
  label: string
  icon: string
  path: string
  tier: '0' | '1' | '2' | '3' | '4'
}

interface PortalOSNavigationProps {
  portal: 'company' | 'distributor' | 'supplier'
  currentDomain?: string
}

export default function PortalOSNavigation({ portal, currentDomain }: PortalOSNavigationProps) {
  const locale = useLocale()
  const pathname = usePathname()

  // Tier 0: Foundational Engines (Available for all portals)
  const tier0Engines: OSModule[] = [
    { id: 'identity', label: 'Identity & Access', icon: '🔐', path: `/os/identity`, tier: '0' },
    { id: 'localization', label: 'Localization', icon: '🌍', path: `/os/localization`, tier: '0' },
    { id: 'geo', label: 'Geo Engine', icon: '📍', path: `/os/geo`, tier: '0' }
  ]

  // Tier 1: Core OS Domains (Portal-specific)
  const getTier1Domains = (): OSModule[] => {
    const commonDomains: OSModule[] = [
      { id: 'orders-sales', label: 'Orders / Sales', icon: '📋', path: `/os/orders-sales`, tier: '1' },
      { id: 'inventory', label: 'Inventory', icon: '📦', path: `/os/inventory`, tier: '1' },
      { id: 'finance', label: 'Finance', icon: '💰', path: `/os/finance`, tier: '1' },
      { id: 'crm', label: 'CRM', icon: '👥', path: `/os/crm`, tier: '1' }
    ]

    if (portal === 'company') {
      return [
        ...commonDomains,
        { id: 'logistics', label: 'Logistics', icon: '🚚', path: `/os/logistics`, tier: '1' },
        { id: 'hr', label: 'HR', icon: '👔', path: `/os/hr`, tier: '1' },
        { id: 'executive', label: 'Executive', icon: '🎯', path: `/os/executive`, tier: '1' },
        { id: 'legal', label: 'Legal/IPR', icon: '⚖️', path: `/os/legal`, tier: '1' },
        { id: 'competitor', label: 'Competitor Intel', icon: '🔍', path: `/os/competitor-intel`, tier: '1' },
        { id: 'import-export', label: 'Import/Export', icon: '🌐', path: `/os/import-export`, tier: '1' },
        { id: 'market-distribution', label: 'Market & Distribution', icon: '📦', path: `/os/market-distribution`, tier: '1' },
        { id: 'supplier-procurement', label: 'Supplier & Procurement', icon: '🏭', path: `/os/supplier-procurement`, tier: '1' }
      ]
    } else if (portal === 'distributor') {
      return [
        ...commonDomains,
        { id: 'logistics', label: 'Logistics', icon: '🚚', path: `/os/logistics`, tier: '1' },
        { id: 'retailers', label: 'Retailers', icon: '🏪', path: `/os/retailers`, tier: '1' }
      ]
    } else { // supplier
      return [
        ...commonDomains.filter(d => d.id !== 'crm'), // Suppliers don't need CRM
        { id: 'procurement', label: 'Procurement', icon: '🏭', path: `/os/procurement`, tier: '1' },
        { id: 'quality', label: 'Quality Control', icon: '✅', path: `/os/quality`, tier: '1' }
      ]
    }
  }

  const tier1Domains = getTier1Domains()

  // Determine active section
  const isActive = (path: string) => {
    return pathname?.includes(path) || false
  }

  const isTier0Active = tier0Engines.some(e => isActive(e.path))
  const isTier1Active = tier1Domains.some(d => isActive(d.path))

  return (
    <nav className="w-72 bg-white border-r border-[#C3A35E]/30 min-h-screen overflow-y-auto">
      {/* Simplified Sidebar Header */}
      <div className="sticky top-0 bg-white border-b border-[#C3A35E]/30 z-20 px-6 py-4">
        <h2 className="text-xs font-bold text-[#6B1F2B]/50 uppercase tracking-wider">
          OS Navigation
        </h2>
      </div>

      {/* Tier 0: Foundational Engines - PURPLE */}
      <div className="px-6 py-5">
        {(() => {
          const tier0Colors = getTierColors('0')
          return (
            <>
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-1">
                  <div className="w-1 h-5 rounded-full" style={{ background: `linear-gradient(to bottom, ${tier0Colors.primary}, ${tier0Colors.primaryDark})` }}></div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#6B1F2B]">
              Tier 0
          </h3>
                  <span className="text-xs text-[#C3A35E]">•</span>
            <span className="text-xs font-medium text-[#6B1F2B]/70">Foundational</span>
          </div>
          <p className="text-xs text-[#6B1F2B]/50 ml-3">Core infrastructure engines</p>
        </div>
        <ul className="space-y-1.5">
          {tier0Engines.map((engine) => {
            const href = `/${locale}${engine.path}`
            const active = isActive(engine.path)
            return (
              <li key={engine.id}>
                <Link
                  href={href}
                        className="group flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200"
                        style={{
                          background: active ? '#6B1F2B' : 'transparent',
                          color: active ? '#ffffff' : '#6B1F2B'
                        }}
                        onMouseEnter={(e) => {
                          if (!active) {
                            e.currentTarget.style.backgroundColor = 'rgba(212, 175, 55, 0.1)'
                            e.currentTarget.style.color = '#6B1F2B'
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!active) {
                            e.currentTarget.style.backgroundColor = 'transparent'
                            e.currentTarget.style.color = '#6B1F2B'
                          }
                        }}
                >
                  <span className={`text-xl transition-transform duration-200 ${active ? 'scale-110' : 'group-hover:scale-110'}`}>
                    {engine.icon}
                  </span>
                  <span className="flex-1">{engine.label}</span>
                  {active && (
                          <div className="w-2 h-2 rounded-full bg-[#C3A35E]"></div>
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
            </>
          )
        })()}
      </div>

      {/* Tier 1: Core OS Domains - BLUE */}
      <div className="px-6 py-5 border-t border-[#C3A35E]/30 bg-[#F8F9FA]/50">
        {(() => {
          const tier1Colors = getTierColors('1')
          return (
            <>
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-1">
                  <div className="w-1 h-5 rounded-full" style={{ background: `linear-gradient(to bottom, ${tier1Colors.primary}, ${tier1Colors.primaryDark})` }}></div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#6B1F2B]">
              Tier 1
          </h3>
                  <span className="text-xs text-[#C3A35E]">•</span>
            <span className="text-xs font-medium text-[#6B1F2B]/70">OS Domains</span>
          </div>
          <p className="text-xs text-[#6B1F2B]/50 ml-3">Operational systems & workflows</p>
        </div>
        <ul className="space-y-1.5">
          {tier1Domains.map((domain) => {
            const href = `/${locale}${domain.path}`
            const active = isActive(domain.path)
            return (
              <li key={domain.id}>
                <Link
                  href={href}
                        className="group flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 border-l-4"
                        style={{
                          background: active ? '#6B1F2B' : 'transparent',
                          color: active ? '#ffffff' : '#6B1F2B',
                          borderLeftColor: active ? '#C3A35E' : 'transparent'
                        }}
                        onMouseEnter={(e) => {
                          if (!active) {
                            e.currentTarget.style.backgroundColor = '#ffffff'
                            e.currentTarget.style.color = '#6B1F2B'
                            e.currentTarget.style.borderLeftColor = 'rgba(212, 175, 55, 0.5)'
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!active) {
                            e.currentTarget.style.backgroundColor = 'transparent'
                            e.currentTarget.style.color = '#6B1F2B'
                            e.currentTarget.style.borderLeftColor = 'transparent'
                          }
                        }}
                >
                  <span className={`text-xl transition-transform duration-200 ${active ? 'scale-110' : 'group-hover:scale-110'}`}>
                    {domain.icon}
                  </span>
                  <span className="flex-1">{domain.label}</span>
                  {active && (
                          <div className="w-2 h-2 rounded-full bg-[#C3A35E] animate-pulse"></div>
                  )}
                  {!active && (
                    <span className="text-[#C3A35E]/50 group-hover:text-[#C3A35E] transition-colors">→</span>
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
            </>
          )
        })()}
      </div>

      {/* Reporting Section - Sophisticated Design */}
      <div className="px-6 py-5 border-t border-[#C3A35E]/30">
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">📊</span>
            <h3 className="text-xs font-bold text-[#6B1F2B] uppercase tracking-wider">
              Reports
          </h3>
          </div>
          <p className="text-xs text-[#6B1F2B]/50 ml-7">Analytics & exports</p>
        </div>
        <ul className="space-y-1.5">
          <li>
            <Link
              href={`/${locale}/reports/dashboard`}
              className={`group flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                pathname?.includes('/reports')
                  ? 'bg-[#6B1F2B] text-white font-semibold shadow-md'
                  : 'text-[#6B1F2B]/80 hover:bg-[#F8F9FA] hover:text-[#6B1F2B] hover:shadow-sm'
              }`}
            >
              <span className="text-xl">📈</span>
              <span className="flex-1">Dashboard Reports</span>
              {pathname?.includes('/reports') && (
                <div className="w-2 h-2 rounded-full bg-[#C3A35E]"></div>
              )}
            </Link>
          </li>
          <li>
            <Link
              href={`/${locale}/reports/analytics`}
              className="group flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-[#6B1F2B]/80 hover:bg-[#F8F9FA] hover:text-[#6B1F2B] hover:shadow-sm transition-all duration-200"
            >
              <span className="text-xl">📊</span>
              <span className="flex-1">Analytics</span>
              <span className="text-[#C3A35E]/50 group-hover:text-[#C3A35E] transition-colors">→</span>
            </Link>
          </li>
          <li>
            <Link
              href={`/${locale}/reports/exports`}
              className="group flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-[#6B1F2B]/80 hover:bg-[#F8F9FA] hover:text-[#6B1F2B] hover:shadow-sm transition-all duration-200"
            >
              <span className="text-xl">📥</span>
              <span className="flex-1">Export Reports</span>
              <span className="text-[#C3A35E]/50 group-hover:text-[#C3A35E] transition-colors">→</span>
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  )
}

