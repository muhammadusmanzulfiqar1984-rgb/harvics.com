'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useLocale } from 'next-intl'

// ─── Types ───────────────────────────────────────────────────────────────────

export interface OSNavItem {
  id: string
  label: string
  icon: string
  path: string
  badge?: number | string
  children?: OSNavItem[]
}

export interface Breadcrumb {
  label: string
  href?: string
}

interface HarvicsOSShellProps {
  children: React.ReactNode
  /** Page title shown in top header */
  title: string
  /** Current domain ID (e.g., 'orders-sales', 'finance') */
  activeDomain?: string
  /** Breadcrumbs for navigation context */
  breadcrumbs?: Breadcrumb[]
  /** Portal type (affects header label) */
  portal?: 'company' | 'distributor' | 'supplier'
  /** Optional subtitle under title */
  subtitle?: string
  /** Show the AI copilot shortcut in header */
  showAIShortcut?: boolean
  /** Custom actions to show in header (right side) */
  headerActions?: React.ReactNode
  /** Sidebar title override */
  sidebarTitle?: string
}

// ─── Domain Navigation ──────────────────────────────────────────────────────

const OS_DOMAINS: OSNavItem[] = [
  { id: 'overview', label: 'Dashboard', icon: '📊', path: '/dashboard/company' },
  { id: 'orders-sales', label: 'Orders & Sales', icon: '📋', path: '/os/orders-sales' },
  { id: 'inventory', label: 'Inventory', icon: '📦', path: '/os/inventory' },
  { id: 'logistics', label: 'Logistics', icon: '🚚', path: '/os/logistics' },
  { id: 'finance', label: 'Finance', icon: '💰', path: '/os/finance' },
  { id: 'crm', label: 'CRM', icon: '👥', path: '/os/crm' },
  { id: 'hr', label: 'HR & People', icon: '👔', path: '/os/hr' },
  { id: 'executive', label: 'Executive', icon: '🎯', path: '/os/executive' },
  { id: 'legal', label: 'Legal & IPR', icon: '⚖️', path: '/os/legal' },
  { id: 'gps-tracking', label: 'GPS Tracking', icon: '📍', path: '/os/gps-tracking' },
  { id: 'competitor', label: 'Competitor Intel', icon: '🔍', path: '/os/competitor' },
  { id: 'import-export', label: 'Import / Export', icon: '🌐', path: '/os/import-export' },
  { id: 'market-distribution', label: 'Market & Dist.', icon: '🗺️', path: '/os/market-distribution' },
  { id: 'procurement', label: 'Procurement', icon: '🏭', path: '/os/procurement' },
]

const AI_NAV: OSNavItem[] = [
  { id: 'ai-copilot', label: 'AI Copilot', icon: '🤖', path: '/copilot' },
  { id: 'ai-automation', label: 'Automation', icon: '⚡', path: '/os/automation' },
]

const PORTAL_LABELS: Record<string, { title: string; abbreviation: string }> = {
  company: { title: 'Harvics OS — HQ', abbreviation: 'HQ' },
  distributor: { title: 'Harvics OS — Distributor', abbreviation: 'DIST' },
  supplier: { title: 'Harvics OS — Supplier', abbreviation: 'SUPP' },
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function HarvicsOSShell({
  children,
  title,
  activeDomain,
  breadcrumbs = [],
  portal = 'company',
  subtitle,
  showAIShortcut = true,
  headerActions,
  sidebarTitle,
}: HarvicsOSShellProps) {
  const locale = useLocale()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [sidebarMobileOpen, setSidebarMobileOpen] = useState(false)
  const [username, setUsername] = useState('User')
  const [userRole, setUserRole] = useState('admin')
  const [currentTime, setCurrentTime] = useState(new Date())

  // Load user from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const scope = localStorage.getItem('user_scope')
        if (scope) {
          const parsed = JSON.parse(scope)
          setUsername(parsed.userId || parsed.username || 'User')
          setUserRole(parsed.role || 'admin')
        }
      } catch { /* graceful fallback */ }
    }
  }, [])

  // Live clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  const isActive = (path: string) => {
    const fullPath = `/${locale}${path}`
    if (path === '/dashboard/company') {
      return pathname === fullPath || pathname === `/${locale}/dashboard/company/`
    }
    return pathname?.startsWith(fullPath) || false
  }

  const portalInfo = PORTAL_LABELS[portal] || PORTAL_LABELS.company

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="flex h-screen bg-harvics-cream overflow-hidden">
      {/* ─── Mobile Overlay ─── */}
      {sidebarMobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setSidebarMobileOpen(false)}
        />
      )}

      {/* ─── Sidebar ─── */}
      <aside
        className={`
          fixed lg:relative z-50
          ${sidebarOpen ? 'w-64' : 'w-[68px]'}
          ${sidebarMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          bg-harvics-burgundy text-harvics-gold transition-all duration-300 flex flex-col h-full
          border-r border-harvics-gold/20
        `}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-harvics-gold/20 flex items-center justify-between min-h-[64px]">
          {sidebarOpen ? (
            <div className="flex items-center gap-3 overflow-hidden">
              <div
                className="w-9 h-9 flex-shrink-0 flex items-center justify-center bg-harvics-gold text-harvics-burgundy font-bold text-lg font-serif"
                style={{ borderRadius: 0 }}
              >
                H
              </div>
              <div className="min-w-0">
                <h2 className="text-sm font-bold text-harvics-gold font-serif truncate tracking-wide">
                  {sidebarTitle || portalInfo.title}
                </h2>
                <p className="text-[10px] text-harvics-gold/50 uppercase tracking-widest">
                  Enterprise OS
                </p>
              </div>
            </div>
          ) : (
            <div
              className="w-9 h-9 mx-auto flex items-center justify-center bg-harvics-gold text-harvics-burgundy font-bold text-lg font-serif"
              style={{ borderRadius: 0 }}
            >
              H
            </div>
          )}
          <button
            onClick={() => {
              setSidebarOpen(!sidebarOpen)
              setSidebarMobileOpen(false)
            }}
            className="text-harvics-gold/60 hover:text-harvics-gold transition-colors p-1 hidden lg:block"
            aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            {sidebarOpen ? '‹' : '›'}
          </button>
        </div>

        {/* Domain Navigation */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
          {/* Tier 0 — Dashboard */}
          <div className="mb-3">
            {sidebarOpen && (
              <p className="px-3 mb-1.5 text-[10px] font-bold text-harvics-gold/40 uppercase tracking-[0.15em]">
                Overview
              </p>
            )}
            {OS_DOMAINS.filter((d) => d.id === 'overview').map((item) => (
              <NavLink key={item.id} item={item} locale={locale} isActive={isActive} sidebarOpen={sidebarOpen} />
            ))}
          </div>

          {/* Tier 1 — Core Domains */}
          <div className="mb-3">
            {sidebarOpen && (
              <p className="px-3 mb-1.5 text-[10px] font-bold text-harvics-gold/40 uppercase tracking-[0.15em]">
                Domains
              </p>
            )}
            {OS_DOMAINS.filter((d) => d.id !== 'overview').map((item) => (
              <NavLink key={item.id} item={item} locale={locale} isActive={isActive} sidebarOpen={sidebarOpen} />
            ))}
          </div>

          {/* AI Layer */}
          <div className="pt-2 border-t border-harvics-gold/15">
            {sidebarOpen && (
              <p className="px-3 mb-1.5 text-[10px] font-bold text-harvics-gold/40 uppercase tracking-[0.15em]">
                AI Layer
              </p>
            )}
            {AI_NAV.map((item) => (
              <NavLink key={item.id} item={item} locale={locale} isActive={isActive} sidebarOpen={sidebarOpen} />
            ))}
          </div>
        </nav>

        {/* Sidebar Footer — User */}
        <div className="p-3 border-t border-harvics-gold/20">
          {sidebarOpen ? (
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 flex-shrink-0 flex items-center justify-center bg-harvics-gold text-harvics-burgundy font-bold text-sm font-serif"
                style={{ borderRadius: 0 }}
              >
                {username.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-harvics-gold truncate">{username}</p>
                <p className="text-[10px] text-harvics-gold/50 uppercase">{userRole}</p>
              </div>
            </div>
          ) : (
            <div
              className="w-8 h-8 mx-auto flex items-center justify-center bg-harvics-gold text-harvics-burgundy font-bold text-sm font-serif"
              style={{ borderRadius: 0 }}
              title={`${username} (${userRole})`}
            >
              {username.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      </aside>

      {/* ─── Main Area ─── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header Bar */}
        <header
          className="bg-white border-b border-harvics-gold/20 px-4 lg:px-6 flex items-center justify-between min-h-[64px] z-30"
          style={{ boxShadow: 'none' }}
        >
          <div className="flex items-center gap-4">
            {/* Mobile menu toggle */}
            <button
              onClick={() => setSidebarMobileOpen(true)}
              className="lg:hidden text-harvics-burgundy p-1"
              aria-label="Open menu"
            >
              ☰
            </button>

            {/* Breadcrumbs */}
            <div className="flex items-center gap-1.5">
              {breadcrumbs.length > 0 ? (
                breadcrumbs.map((crumb, idx) => (
                  <React.Fragment key={idx}>
                    {idx > 0 && <span className="text-harvics-burgundy/30 text-xs">›</span>}
                    {crumb.href ? (
                      <Link
                        href={crumb.href}
                        className="text-xs text-harvics-burgundy/60 hover:text-harvics-burgundy transition-colors font-medium"
                      >
                        {crumb.label}
                      </Link>
                    ) : (
                      <span className="text-xs text-harvics-burgundy font-bold">{crumb.label}</span>
                    )}
                  </React.Fragment>
                ))
              ) : (
                <>
                  <Link
                    href={`/${locale}/dashboard/company`}
                    className="text-xs text-harvics-burgundy/60 hover:text-harvics-burgundy transition-colors font-medium"
                  >
                    Harvics OS
                  </Link>
                  <span className="text-harvics-burgundy/30 text-xs">›</span>
                  <span className="text-xs text-harvics-burgundy font-bold">{title}</span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Custom header actions */}
            {headerActions}

            {/* AI Copilot Shortcut */}
            {showAIShortcut && (
              <Link
                href={`/${locale}/copilot`}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-harvics-burgundy bg-harvics-gold/10 border border-harvics-gold/30 hover:bg-harvics-gold/25 transition-colors"
                style={{ borderRadius: 0 }}
                title="Open AI Copilot"
              >
                <span>🤖</span>
                <span className="hidden sm:inline">AI Copilot</span>
              </Link>
            )}

            {/* Time */}
            <div className="hidden md:flex items-center gap-2 text-xs text-harvics-burgundy/60 font-medium">
              <span>{formatTime(currentTime)}</span>
            </div>

            {/* Notifications placeholder */}
            <button
              className="relative p-2 text-harvics-burgundy/60 hover:text-harvics-burgundy transition-colors"
              title="Notifications"
            >
              🔔
              <span
                className="absolute top-1 right-1 w-2 h-2 bg-red-500"
                style={{ borderRadius: 0 }}
              />
            </button>
          </div>
        </header>

        {/* Page Title Bar */}
        <div className="bg-harvics-cream border-b border-harvics-gold/15 px-4 lg:px-6 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-harvics-burgundy font-serif tracking-tight">{title}</h1>
            {subtitle && <p className="text-xs text-harvics-burgundy/50 mt-0.5">{subtitle}</p>}
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 bg-harvics-cream">
          {children}
        </main>
      </div>
    </div>
  )
}

// ─── NavLink Sub-Component ───────────────────────────────────────────────────

function NavLink({
  item,
  locale,
  isActive,
  sidebarOpen,
}: {
  item: OSNavItem
  locale: string
  isActive: (path: string) => boolean
  sidebarOpen: boolean
}) {
  const active = isActive(item.path)
  const href = `/${locale}${item.path}`

  return (
    <Link
      href={href}
      className={`
        flex items-center gap-3 px-3 py-2 text-sm transition-all
        ${
          active
            ? 'bg-harvics-gold/20 text-harvics-gold font-bold border-r-2 border-harvics-gold'
            : 'text-harvics-gold/65 hover:text-harvics-gold hover:bg-harvics-gold/8'
        }
      `}
      style={{ borderRadius: 0 }}
      title={!sidebarOpen ? item.label : undefined}
    >
      <span className="text-base leading-none flex-shrink-0 w-5 text-center">{item.icon}</span>
      {sidebarOpen && (
        <span className="truncate">{item.label}</span>
      )}
      {sidebarOpen && item.badge !== undefined && (
        <span
          className="ml-auto text-[10px] font-bold px-1.5 py-0.5 bg-harvics-gold/20 text-harvics-gold"
          style={{ borderRadius: 0 }}
        >
          {item.badge}
        </span>
      )}
    </Link>
  )
}
