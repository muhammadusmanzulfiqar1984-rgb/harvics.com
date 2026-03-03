'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { useCountry } from '@/contexts/CountryContext'
import { apiClient } from '@/lib/api'

interface NavigationItem {
  label: string
  href?: string
  icon: string
  children?: Array<{
    label: string
    href: string
  }>
}

interface OSLayoutShellProps {
  children: React.ReactNode
  domainName: string
  domainIcon: string
  navigation: NavigationItem[]
  allowedRoles?: string[]
}

/**
 * Standard OS Layout Shell - V16 UI Spec Compliant
 * 
 * Features:
 * - Fixed top bar (64px) with domain name, geo context, user menu
 * - Collapsible sidebar (280px/64px) with navigation
 * - Main content area with proper margins
 * - RBAC support
 * - Localization support
 * - Geo context display
 */
export default function OSLayoutShell({
  children,
  domainName,
  domainIcon,
  navigation,
  allowedRoles = []
}: OSLayoutShellProps) {
  const locale = useLocale()
  const pathname = usePathname()
  const router = useRouter()
  const { selectedCountry, countryData, role } = useCountry()
  const t = useTranslations('common')
  
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [username, setUsername] = useState<string>('User')
  const [hasAccess, setHasAccess] = useState(true)

  // Get username and check access
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userScopeStr = localStorage.getItem('user_scope')
      if (userScopeStr) {
        try {
          const userScope = JSON.parse(userScopeStr)
          setUsername(userScope.userId || userScope.username || userScope.name || 'User')
          
          // Check RBAC
          if (allowedRoles.length > 0) {
            const userRole = userScope.role || role
            setHasAccess(allowedRoles.includes(userRole) || allowedRoles.length === 0)
          }
        } catch (e) {
          console.error('Error parsing user scope:', e)
        }
      }
    }
  }, [role, allowedRoles])

  const isActive = (href?: string) => {
    if (!href) return false
    if (href === `/${locale}/os/${domainName.toLowerCase().replace(/\s+/g, '-')}`) {
      return pathname === href || pathname === `/${locale}/os/${domainName.toLowerCase().replace(/\s+/g, '-')}`
    }
    return pathname?.startsWith(href)
  }

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user_scope')
      apiClient.clearToken()
      router.push(`/${locale}/login`)
    }
  }

  if (!hasAccess && allowedRoles.length > 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center bg-white rounded-lg shadow-lg p-8 max-w-md">
          <h1 className="text-2xl font-bold text-black mb-4">Access Denied</h1>
          <p className="text-black mb-6">You don't have permission to access this domain.</p>
          <Link
            href={`/${locale}/dashboard/company`}
            className="px-4 py-2 bg-white text-white rounded-lg hover:bg-[#7a0000] transition-colors"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      {/* Left Sidebar - V16 Spec: 280px (collapsed: 64px) */}
      <aside
        className={`${
          sidebarOpen ? 'w-[280px]' : 'w-16'
        } bg-[#6B1F2B] text-[#C3A35E] transition-all duration-300 flex flex-col border-r border-[#C3A35E]/30 fixed left-0 top-0 h-full z-[999] shadow-2xl`}
        style={{ height: '100vh', top: '64px' }}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-[#C3A35E]/30 flex items-center justify-between min-h-[64px]">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <span className="text-2xl drop-shadow-md">{domainIcon}</span>
              <h2 className="text-lg font-bold text-[#C3A35E] font-serif tracking-wide">{domainName}</h2>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-[#C3A35E] hover:text-white transition-colors p-1 rounded hover:bg-[#C3A35E]/10"
            aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            {sidebarOpen ? '←' : '→'}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {navigation.map((item, index) => (
            <div key={index}>
              {item.children ? (
                <div>
                  <div className="flex items-center space-x-2 px-3 py-2.5 text-[#C3A35E] font-bold text-sm uppercase tracking-wider opacity-80">
                    <span className="text-lg">{item.icon}</span>
                    {sidebarOpen && <span>{item.label}</span>}
                  </div>
                  {sidebarOpen && (
                    <div className="ml-4 space-y-1 mt-1 border-l border-[#C3A35E]/20 pl-2">
                      {item.children.map((child, childIndex) => (
                        <Link
                          key={childIndex}
                          href={child.href}
                          className={`block px-3 py-2 rounded-md text-sm transition-all duration-200 ${
                            isActive(child.href)
                              ? 'bg-[#C3A35E] text-[#6B1F2B] font-bold shadow-lg transform translate-x-1'
                              : 'text-[#C3A35E]/70 hover:text-[#C3A35E] hover:bg-[#C3A35E]/10'
                          }`}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : item.href ? (
                <Link
                  href={item.href}
                  className={`flex items-center space-x-2 px-3 py-2.5 rounded-md transition-all duration-200 ${
                    isActive(item.href)
                      ? 'bg-[#C3A35E] text-[#6B1F2B] font-bold shadow-lg'
                      : 'text-[#C3A35E]/70 hover:text-[#C3A35E] hover:bg-[#C3A35E]/10'
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
                </Link>
              ) : (
                <div className="flex items-center space-x-2 px-3 py-2.5 text-[#C3A35E] font-semibold">
                  <span className="text-lg">{item.icon}</span>
                  {sidebarOpen && <span className="text-sm">{item.label}</span>}
                </div>
              )}
            </div>
          ))}
        </nav>
      </aside>

      {/* Main Content Area */}
      <div 
        className="flex-1 flex flex-col overflow-hidden"
        style={{ marginLeft: sidebarOpen ? '280px' : '64px' }}
      >
        {/* Top Bar - V16 Spec: 64px fixed */}
        <header 
          className="bg-[#C3A35E] border-b border-[#6B1F2B]/20 px-6 py-4 flex items-center justify-between fixed top-0 left-0 right-0 z-[1000] shadow-md"
          style={{ height: '64px' }}
        >
          {/* Left: Logo + Domain Name */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl drop-shadow-sm">{domainIcon}</span>
              <h1 className="text-xl font-bold text-[#6B1F2B] font-serif tracking-wide">{domainName}</h1>
            </div>
            {countryData && (
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-white/20 rounded-lg border border-[#6B1F2B]/10 backdrop-blur-sm">
                <span className="text-xs text-[#6B1F2B]/80 font-semibold uppercase">Country:</span>
                <span className="text-sm font-bold text-[#6B1F2B]">{countryData.countryName || selectedCountry}</span>
                {countryData.currency && (
                  <>
                    <span className="text-[#6B1F2B]/40">•</span>
                    <span className="text-sm text-[#6B1F2B] font-bold">{countryData.currency.symbol} {countryData.currency.code}</span>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Right: User Menu + Notifications */}
          <div className="flex items-center gap-3">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => {
                  setNotificationsOpen(!notificationsOpen)
                  setUserMenuOpen(false)
                }}
                className="relative p-2 rounded-lg hover:bg-[#6B1F2B]/10 transition-colors group"
                aria-label="Notifications"
              >
                <span className="text-xl text-[#6B1F2B]">🔔</span>
                <span className="absolute top-1 right-1 w-2 h-2 bg-[#dc2626] rounded-full border border-[#C3A35E]"></span>
              </button>
              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-[#C3A35E]/30 z-50 ring-1 ring-[#6B1F2B]/5">
                  <div className="p-4 border-b border-gray-100 bg-[#C3A35E]/5">
                    <h3 className="font-bold text-[#6B1F2B]">Notifications</h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    <div className="p-4 text-sm text-gray-600">No new notifications</div>
                  </div>
                </div>
              )}
            </div>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => {
                  setUserMenuOpen(!userMenuOpen)
                  setNotificationsOpen(false)
                }}
                className="flex items-center gap-2 p-1.5 pr-3 rounded-lg hover:bg-[#6B1F2B]/10 transition-colors border border-[#6B1F2B]/10 bg-white/10"
                aria-label="User menu"
              >
                <div className="w-8 h-8 rounded-full bg-[#6B1F2B] flex items-center justify-center text-[#C3A35E] font-bold text-sm border-2 border-[#C3A35E]">
                  {username.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-bold text-[#6B1F2B] hidden md:inline">{username}</span>
              </button>
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-[#C3A35E]/30 z-50 ring-1 ring-[#6B1F2B]/5">
                  <div className="p-2">
                    <div className="px-4 py-3 border-b border-gray-100 bg-[#C3A35E]/5">
                      <div className="font-bold text-[#6B1F2B] text-sm">Logged in as</div>
                      <div className="text-xs text-gray-600 mt-0.5 font-medium">{username}</div>
                    </div>
                    <div className="my-1">
                      <button 
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-[#6B1F2B] hover:bg-[#6B1F2B]/5 rounded-md transition-colors font-medium flex items-center gap-2"
                      >
                        <span>🚪</span> Logout
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Content - V16 Spec: Proper margins and padding */}
        <main 
          className="flex-1 overflow-y-auto bg-white p-6"
          style={{ marginTop: '64px' }}
        >
          {children}
        </main>
      </div>
    </div>
  )
}

