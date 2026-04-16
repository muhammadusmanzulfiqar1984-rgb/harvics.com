'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import { useRouter } from 'next/navigation'
import AuthGuard from '@/components/shared/AuthGuard'
import PortalSwitcher from '@/components/shared/PortalSwitcher'
import GeoSelector from '@/components/shared/GeoSelector'
import GlobalFilters from '@/components/shared/GlobalFilters'
import { UserRole } from '@/types/userScope'

interface NavItem {
  label: string
  path: string
  icon: string
}

interface PortalSubPageLayoutProps {
  portal: 'distributor' | 'supplier'
  allowedRoles: UserRole[]
  currentPage: string
  pageTitle: string
  pageDescription: string
  children: React.ReactNode
}

const PORTAL_CONFIG = {
  distributor: {
    label: 'Distributor Portal',
    dashboardPath: '/portal/distributor',
    nav: [
      { label: 'Dashboard',   path: '/portal/distributor',            icon: '🏠' },
      { label: 'Orders',      path: '/portal/distributor/orders',     icon: '📦' },
      { label: 'Inventory',   path: '/portal/distributor/inventory',  icon: '🏭' },
      { label: 'Payments',    path: '/portal/distributor/payments',   icon: '💳' },
      { label: 'Retailers',   path: '/portal/distributor/retailers',  icon: '🏪' },
      { label: 'Compliance',  path: '/portal/distributor/compliance', icon: '📋' },
      { label: 'AI Insights', path: '/portal/distributor/ai',         icon: '🤖' },
    ] as NavItem[],
  },
  supplier: {
    label: 'Supplier Portal',
    dashboardPath: '/portal/supplier',
    nav: [
      { label: 'Dashboard',       path: '/portal/supplier',                  icon: '🏠' },
      { label: 'Purchase Orders', path: '/portal/supplier/pos',              icon: '📦' },
      { label: 'RFQs',            path: '/portal/supplier/rfqs',             icon: '📋' },
      { label: 'Deliveries',      path: '/portal/supplier/deliveries',       icon: '🚚' },
      { label: 'Quality Control', path: '/portal/supplier/qc',               icon: '🔍' },
      { label: 'Contracts',       path: '/portal/supplier/contracts',        icon: '📄' },
      { label: 'Payments',        path: '/portal/supplier/payments',         icon: '💳' },
      { label: 'AI Insights',     path: '/portal/supplier/ai',               icon: '🤖' },
    ] as NavItem[],
  },
}

export default function PortalSubPageLayout({
  portal,
  allowedRoles,
  currentPage,
  pageTitle,
  pageDescription,
  children,
}: PortalSubPageLayoutProps) {
  const locale = useLocale()
  const router = useRouter()
  const config = PORTAL_CONFIG[portal]
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user_data')
      localStorage.removeItem('user_scope')
      localStorage.removeItem('user_type')
      document.cookie = 'auth_token=; path=/; max-age=0'
      document.cookie = 'x_role=; path=/; max-age=0'
    }
    router.replace(`/${locale}/login`)
  }

  return (
    <AuthGuard allowedRoles={allowedRoles}>
      <div className="min-h-screen bg-[#F2F2F2] flex flex-col">

        {/* ── Sticky Header ── */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50 flex-shrink-0">
          <div className="px-4 sm:px-6">
            <div className="flex items-center justify-between h-14">

              {/* Left: sidebar toggle + logo */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSidebarOpen(o => !o)}
                  className="p-1.5 rounded hover:bg-gray-100 transition-colors text-gray-500"
                  aria-label="Toggle sidebar"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                <Link
                  href={`/${locale}${config.dashboardPath}`}
                  className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                >
                  <span className="text-xl font-bold text-[#6B1F2B]">H</span>
                  <div className="hidden sm:block">
                    <p className="text-[10px] text-gray-400 leading-none uppercase tracking-wide">Harvics OS</p>
                    <p className="text-sm font-bold text-gray-900 leading-tight">{config.label}</p>
                  </div>
                </Link>
              </div>

              {/* Right: geo + portal switcher + logout */}
              <div className="flex items-center gap-2">
                <GeoSelector />
                <PortalSwitcher currentPortal={portal} />
                <button
                  onClick={handleLogout}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-[#6B1F2B] hover:bg-gray-100 rounded transition-colors border border-gray-200"
                  title="Sign out"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Sign out
                </button>
              </div>

            </div>
          </div>
        </header>

        {/* ── Body: sidebar + main ── */}
        <div className="flex flex-1 overflow-hidden">

          {/* ── Sidebar ── */}
          <aside
            className={`
              bg-white border-r border-gray-200 flex-shrink-0 transition-all duration-200 overflow-y-auto
              ${sidebarOpen ? 'w-52' : 'w-0 overflow-hidden'}
            `}
          >
            <nav className="py-4 px-2" aria-label="Portal navigation">
              {config.nav.map((item) => {
                const isActive = currentPage === item.label
                return (
                  <Link
                    key={item.path}
                    href={`/${locale}${item.path}`}
                    className={`
                      flex items-center gap-3 px-3 py-2.5 rounded-lg mb-0.5 text-sm font-medium transition-all
                      ${isActive
                        ? 'bg-[#6B1F2B] text-white shadow-sm'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      }
                    `}
                  >
                    <span className="text-base leading-none">{item.icon}</span>
                    <span className="truncate">{item.label}</span>
                    {isActive && (
                      <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#C3A35E] flex-shrink-0" />
                    )}
                  </Link>
                )
              })}

              {/* Divider + logout for mobile */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Sign out
                </button>
              </div>
            </nav>
          </aside>

          {/* ── Main Content ── */}
          <main className="flex-1 overflow-auto px-5 py-5 min-w-0">

            {/* Breadcrumbs */}
            <nav className="mb-5 text-sm" aria-label="Breadcrumb">
              <ol className="flex items-center gap-2 text-gray-400">
                <li>
                  <Link
                    href={`/${locale}${config.dashboardPath}`}
                    className="hover:text-[#6B1F2B] transition-colors"
                  >
                    Dashboard
                  </Link>
                </li>
                <li>/</li>
                <li className="font-semibold text-gray-700">{currentPage}</li>
              </ol>
            </nav>

            {/* Page Header */}
            <div className="mb-5">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">{pageTitle}</h2>
              <p className="text-gray-400 text-sm">{pageDescription}</p>
            </div>

            {/* Global Filters */}
            <div className="mb-5">
              <GlobalFilters />
            </div>

            {/* Page-specific content */}
            {children}

          </main>
        </div>
      </div>
    </AuthGuard>
  )
}

