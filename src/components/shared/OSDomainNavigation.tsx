'use client'

import React from 'react'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import { usePathname } from 'next/navigation'

// Clean SVG icon set — minimal line icons, Apple SF-symbol inspired
const NavIcon = ({ id }: { id: string }) => {
  const props = { viewBox: '0 0 20 20', fill: 'none', stroke: 'currentColor', strokeWidth: '1.5', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, width: 16, height: 16 }
  switch (id) {
    case 'overview':     return <svg {...props}><rect x="3" y="11" width="3" height="6" rx="0.5"/><rect x="8.5" y="7" width="3" height="10" rx="0.5"/><rect x="14" y="3" width="3" height="14" rx="0.5"/></svg>
    case 'orders-sales': return <svg {...props}><rect x="4" y="3" width="12" height="14" rx="1.5"/><path d="M7 7h6M7 10h6M7 13h4"/></svg>
    case 'inventory':    return <svg {...props}><path d="M3 8l7-5 7 5v9a1 1 0 01-1 1H4a1 1 0 01-1-1V8z"/><path d="M8 17V11h4v6"/></svg>
    case 'logistics':    return <svg {...props}><rect x="1" y="7" width="11" height="9" rx="1"/><path d="M12 10h4.5L19 13v3h-7"/><circle cx="5.5" cy="17" r="1.5"/><circle cx="15.5" cy="17" r="1.5"/></svg>
    case 'finance':      return <svg {...props}><circle cx="10" cy="10" r="7.5"/><path d="M10 5.5v9M7.5 7.5h3.75a1.25 1.25 0 010 2.5h-2.5a1.25 1.25 0 000 2.5H13"/></svg>
    case 'crm':          return <svg {...props}><circle cx="8" cy="6.5" r="2.5"/><path d="M3 17c0-2.8 2.2-5 5-5s5 2.2 5 5"/><circle cx="15" cy="6.5" r="2"/><path d="M18 17c0-1.9-1.1-3.5-2.5-4.3"/></svg>
    case 'hr':           return <svg {...props}><circle cx="10" cy="6" r="3"/><path d="M4 17c0-3.3 2.7-6 6-6s6 2.7 6 6"/></svg>
    case 'executive':    return <svg {...props}><circle cx="10" cy="10" r="7.5"/><circle cx="10" cy="10" r="2.5"/><path d="M10 2.5v2M10 15.5v2M2.5 10h2M15.5 10h2"/></svg>
    case 'investor':     return <svg {...props}><polyline points="2.5,14 7,8.5 11,12.5 17.5,5.5"/><polyline points="14,5.5 17.5,5.5 17.5,9"/></svg>
    case 'legal':        return <svg {...props}><path d="M10 2v16"/><path d="M3.5 7.5L7 3.5 10 7.5 6.5 12c-1.7 0-3-1.6-3-4.5z"/><path d="M16.5 7.5L13 3.5 10 7.5l3.5 4.5c1.7 0 3-1.6 3-4.5z"/><path d="M4 17h12"/></svg>
    case 'competitor':   return <svg {...props}><circle cx="9" cy="9" r="6"/><path d="M14 14l4.5 4.5"/></svg>
    case 'geo':          return <svg {...props}><circle cx="10" cy="10" r="7.5"/><path d="M10 2.5v15M2.5 10h15"/><path d="M4 5.5c2 1.5 4 2 6 2s4-.5 6-2M4 14.5c2-1.5 4-2 6-2s4 .5 6 2"/></svg>
    case 'workflows':    return <svg {...props}><rect x="3" y="3" width="5" height="4" rx="1"/><rect x="12" y="3" width="5" height="4" rx="1"/><rect x="7.5" y="13" width="5" height="4" rx="1"/><path d="M5.5 7v2.5a2 2 0 002 2h5a2 2 0 002-2V7"/><path d="M10 9.5V13"/></svg>
    case 'identity':     return <svg {...props}><rect x="3" y="5" width="14" height="10" rx="1.5"/><circle cx="7.5" cy="9.5" r="1.5"/><path d="M11 8h3.5M11 11h2.5"/></svg>
    case 'supply-chain': return <svg {...props}><circle cx="4" cy="10" r="2"/><circle cx="16" cy="10" r="2"/><circle cx="10" cy="4" r="2"/><circle cx="10" cy="16" r="2"/><path d="M6 10h8M10 6v8"/></svg>
    case 'market-dist':  return <svg {...props}><path d="M3 14l4-8 4 5 3-3 3 6"/><circle cx="17" cy="14" r="1"/></svg>
    case 'satellite':    return <svg {...props}><circle cx="10" cy="10" r="3"/><path d="M10 2v2M10 16v2M2 10h2M16 10h2M4.2 4.2l1.4 1.4M14.4 14.4l1.4 1.4M4.2 15.8l1.4-1.4M14.4 5.6l1.4-1.4"/></svg>
    case 'gps':          return <svg {...props}><path d="M10 2C7.2 2 5 4.2 5 7c0 4 5 9 5 9s5-5 5-9c0-2.8-2.2-5-5-5z"/><circle cx="10" cy="7" r="1.5"/></svg>
    case 'localization': return <svg {...props}><circle cx="10" cy="10" r="7.5"/><path d="M10 2.5C8 5 7 7.5 7 10s1 5 3 7.5"/><path d="M10 2.5C12 5 13 7.5 13 10s-1 5-3 7.5"/><path d="M2.5 7.5h15M2.5 12.5h15"/></svg>
    case 'tier0':        return <svg {...props}><rect x="2.5" y="2.5" width="15" height="15" rx="2"/><path d="M7 7h6M7 10h6M7 13h3"/></svg>
  }
}

interface OSDomain {
  id: string
  label: string
  path: string
}

export default function OSDomainNavigation() {
  const locale = useLocale()
  const pathname = usePathname()

  const domains: OSDomain[] = [
    { id: 'overview',      label: 'Overview',       path: `/dashboard/company` },
    { id: 'orders-sales',  label: 'Orders',         path: `/os/orders-sales` },
    { id: 'inventory',     label: 'Inventory',      path: `/os/inventory` },
    { id: 'logistics',     label: 'Logistics',      path: `/os/logistics` },
    { id: 'finance',       label: 'Finance',        path: `/os/finance` },
    { id: 'crm',           label: 'CRM',            path: `/os/crm` },
    { id: 'hr',            label: 'People',         path: `/os/hr` },
    { id: 'executive',     label: 'Executive',      path: `/os/executive` },
    { id: 'investor',      label: 'Investor',       path: `/os/investor-relations` },
    { id: 'legal',         label: 'Legal',          path: `/os/legal` },
    { id: 'competitor',    label: 'Intelligence',   path: `/os/competitor-intel` },
    { id: 'import-export', label: 'Trade',          path: `/os/import-export` },
    { id: 'supply-chain',  label: 'Supply Chain',   path: `/os/supply-chain` },
    { id: 'geo',           label: 'Geo Engine',     path: `/os/geo` },
    { id: 'market-dist',   label: 'Markets',        path: `/os/market-distribution` },
    { id: 'localization',  label: 'Localization',   path: `/os/localization` },
    { id: 'identity',      label: 'Identity',       path: `/os/identity` },
    { id: 'workflows',     label: 'Workflows',      path: `/os/workflows` },
    { id: 'tier0',         label: 'Tier 0 Engine',  path: `/os/tier0` },
    { id: 'gps',           label: 'GPS Tracking',   path: `/os/gps-tracking` },
    { id: 'satellite',     label: 'Satellite',      path: `/os/satellite` },
  ]

  const isActive = (path: string) => !!pathname?.includes(path)

  return (
    <nav className="w-56 border-r border-[#EAE0D5] min-h-screen flex flex-col" style={{ background: 'rgba(255,255,255,0.65)', boxShadow: 'inset -1px 0 0 rgba(195, 163, 94,0.2)' }}>
      <div className="px-4 pt-6 pb-3">
        <p className="text-[10px] font-semibold text-[#8E8E93] uppercase tracking-widest">OS Domains</p>
      </div>
      <ul className="flex-1 px-2 space-y-0.5 pb-6">
        {domains.map((domain) => {
          const href = `/${locale}${domain.path}`
          const active = isActive(domain.path)
          return (
            <li key={domain.id}>
              <Link
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-100 ${
                  active
                    ? 'bg-harvics-burgundy text-white'
                    : 'text-[#1A1A1A] hover:bg-[#FAF8F5]'
                }`}
              >
                <span className={`flex-shrink-0 ${active ? 'opacity-100' : 'opacity-50'}`}>
                  <NavIcon id={domain.id} />
                </span>
                <span className="truncate">{domain.label}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

