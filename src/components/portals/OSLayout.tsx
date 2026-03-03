'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { useCountry } from '@/contexts/CountryContext'

export interface NavigationItem {
  label: string
  href?: string // Optional if children exist
  icon: string
  children?: NavigationItem[] // Optional: nested navigation items
  roles?: string[] // Optional: restrict to specific roles
}

interface OSLayoutProps {
  children: React.ReactNode
  module: 'legal' | 'import-export' | 'gps-tracking' | 'competitor-intel' | string
  title: string
  navigation: NavigationItem[]
  allowedRoles?: string[]
  sidebarTitle?: string
}

const OSLayout: React.FC<OSLayoutProps> = ({
  children,
  module,
  title,
  navigation,
  allowedRoles = [],
  sidebarTitle
}) => {
  const locale = useLocale()
  const pathname = usePathname()
  const { role, selectedCountry } = useCountry()
  const t = useTranslations('common')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [username, setUsername] = useState<string>('User')

  // Get username from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userScopeStr = localStorage.getItem('user_scope')
      if (userScopeStr) {
        try {
          const userScope = JSON.parse(userScopeStr)
          setUsername(userScope.userId || userScope.username || 'User')
        } catch (e) {
          console.error('Error parsing user scope:', e)
        }
      }
    }
  }, [])

  // Check if user has access
  const hasAccess = allowedRoles.length === 0 || allowedRoles.includes(role || '')

  // Filter navigation by role
  const filteredNavigation = navigation.filter(item => {
    if (!item.roles || item.roles.length === 0) return true
    return item.roles.includes(role || '')
  })

  const isActive = (href: string) => {
    if (href === `/${locale}/os/${module}`) {
      return pathname === href || pathname === `/${locale}/os/${module}/`
    }
    return pathname?.startsWith(href)
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#6B1F2B] mb-4 font-serif">Access Denied</h1>
          <p className="text-[#6B1F2B]">You don't have permission to access this module.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      {/* Left Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-[#6B1F2B] text-[#C3A35E] transition-all duration-300 flex flex-col border-r border-[#C3A35E]/30 shadow-xl z-50`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-[#C3A35E]/30 flex items-center justify-between">
          {sidebarOpen && (
            <h2 className="text-xl font-bold text-[#C3A35E] font-serif tracking-wide">
              {sidebarTitle || title}
            </h2>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-[#C3A35E] hover:text-white transition-colors p-1"
            aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            {sidebarOpen ? '←' : '→'}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {filteredNavigation.map((item, index) => {
            // If item has children, render as expandable group
            if (item.children && item.children.length > 0) {
              return (
                <div key={index} className="space-y-1">
                  <div className="flex items-center space-x-2 px-3 py-2 text-[#C3A35E]/80">
                    <span className="text-lg">{item.icon}</span>
                    {sidebarOpen && <span className="font-medium">{item.label}</span>}
                  </div>
                  {sidebarOpen && (
                    <div className="ml-6 space-y-1">
                      {item.children.map((child, childIndex) => (
                        <Link
                          key={childIndex}
                          href={child.href || '#'}
                          className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                            isActive(child.href || '')
                              ? 'bg-[#C3A35E]/20 text-[#C3A35E] font-bold border-r-2 border-[#C3A35E]'
                              : 'text-[#C3A35E]/70 hover:text-[#C3A35E] hover:bg-[#C3A35E]/10'
                          }`}
                        >
                          {sidebarOpen && <span className="text-sm">{child.label}</span>}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )
            }
            // Regular navigation item
            return (
              <Link
                key={index}
                href={item.href || '#'}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                  isActive(item.href || '')
                    ? 'bg-[#C3A35E]/20 text-[#C3A35E] font-bold border-r-2 border-[#C3A35E]'
                    : 'text-[#C3A35E]/70 hover:text-[#C3A35E] hover:bg-[#C3A35E]/10'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            )
          })}
        </nav>

        {/* Sidebar Footer - Country/Region Info */}
        {sidebarOpen && selectedCountry && (
          <div className="p-4 border-t border-[#C3A35E]/30 text-sm text-[#C3A35E]/60">
            <div className="flex items-center space-x-2">
              <span>🌍</span>
              <span className="uppercase font-bold tracking-wider">{selectedCountry}</span>
            </div>
          </div>
        )}
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-[#C3A35E] border-b border-[#6B1F2B]/20 px-6 py-4 flex items-center justify-between shadow-md z-40">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold text-[#6B1F2B] font-serif tracking-wide">{title}</h1>
            {selectedCountry && (
              <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-white/20 rounded-lg border border-[#6B1F2B]/10 backdrop-blur-sm">
                <span className="text-sm text-[#6B1F2B] font-bold uppercase">{selectedCountry}</span>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {/* User Menu */}
            <div className="relative">
              <button
                className="flex items-center space-x-2 p-1.5 pr-3 rounded-lg hover:bg-[#6B1F2B]/10 transition-colors border border-[#6B1F2B]/10 bg-white/10"
                aria-label="User menu"
              >
                <div className="w-8 h-8 rounded-full bg-[#6B1F2B] flex items-center justify-center text-[#C3A35E] font-bold text-sm border-2 border-[#C3A35E]">
                  {username.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-bold text-[#6B1F2B] hidden md:inline">
                  {username}
                </span>
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

export default OSLayout

