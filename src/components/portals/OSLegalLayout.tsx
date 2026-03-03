'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { apiClient } from '@/lib/api'
import { useCountry } from '@/contexts/CountryContext'

interface OSLegalLayoutProps {
  children: React.ReactNode
}

const OSLegalLayout: React.FC<OSLegalLayoutProps> = ({ children }) => {
  const locale = useLocale()
  const pathname = usePathname()
  const router = useRouter()
  const { role } = useCountry()
  const t = useTranslations('legal')
  const tCommon = useTranslations('common')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [username, setUsername] = useState<string>('User')

  // Check if user has access
  const hasAccess = role === 'legal_admin' || role === 'admin' || role === 'super_admin'

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

  // Navigation structure
  const navigation = [
    {
      label: t('dashboard'),
      href: `/${locale}/os/legal`,
      icon: '📊'
    },
    {
      label: t('trademarks'),
      href: `/${locale}/os/legal/trademarks`,
      icon: '™️'
    },
    {
      label: t('contracts'),
      href: `/${locale}/os/legal/contracts`,
      icon: '📄'
    },
    {
      label: t('certificates'),
      href: `/${locale}/os/legal/certificates`,
      icon: '📜'
    },
    {
      label: t('compliance'),
      href: `/${locale}/os/legal/compliance`,
      icon: '✅'
    },
    {
      label: t('cases'),
      href: `/${locale}/os/legal/cases`,
      icon: '⚖️'
    }
  ]

  const isActive = (href: string) => {
    if (href === `/${locale}/os/legal`) {
      return pathname === href || pathname === `/${locale}/os/legal`
    }
    return pathname?.startsWith(href)
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-black mb-4">{t('accessDenied')}</h1>
          <p className="text-black">{t('accessDeniedMessage')}</p>
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
        } bg-white text-white transition-all duration-300 flex flex-col border-r border-[#C3A35E]/30`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-[#C3A35E]/30 flex items-center justify-between">
          {sidebarOpen && (
            <h2 className="text-xl font-bold text-white">{t('sidebarTitle')}</h2>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-white hover:text-[#C3A35E]/90 transition-colors"
          >
            {sidebarOpen ? '←' : '→'}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {navigation.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                isActive(item.href)
                  ? 'bg-white/20 text-white font-semibold'
                  : 'text-[#C3A35E]/80 hover:text-[#C3A35E] hover:bg-white/10'
              }`}
            >
              <span>{item.icon}</span>
              {sidebarOpen && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white border-b border-black200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold text-black">{t('title')}</h1>
          </div>

          <div className="flex items-center space-x-4">
            {/* User Menu */}
            <div className="relative">
              <button
                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-white transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#ffffff] to-[#ffffff] flex items-center justify-center text-white font-semibold">
                  {username.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-semibold text-black hidden md:inline">{username}</span>
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-white p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

export default OSLegalLayout

