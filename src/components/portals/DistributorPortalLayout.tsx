'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { apiClient } from '@/lib/api'

interface DistributorPortalLayoutProps {
  children: React.ReactNode
}

const DistributorPortalLayout: React.FC<DistributorPortalLayoutProps> = ({ children }) => {
  const locale = useLocale()
  const pathname = usePathname()
  const t = useTranslations('distributorPortal')
  const tCommon = useTranslations('common')
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
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

  // Get distributor info from user scope or locale-based defaults
  const getDistributorInfo = () => {
    // Default based on locale
    const localeDefaults: Record<string, { name: string; country: string; code: string; currency: string }> = {
      'ar': { name: 'دبي للتوزيع', country: 'United Arab Emirates', code: 'AE', currency: 'AED' },
      'en': { name: 'Costco West', country: 'United States', code: 'US', currency: 'USD' },
      'fr': { name: 'Distributeur Paris', country: 'France', code: 'FR', currency: 'EUR' },
      'es': { name: 'Distribuidor Madrid', country: 'Spain', code: 'ES', currency: 'EUR' }
    }
    
    const defaultInfo = localeDefaults[locale] || localeDefaults['en']
    
    // Try to get from localStorage user scope
    if (typeof window !== 'undefined') {
      const userScopeStr = localStorage.getItem('user_scope')
      if (userScopeStr) {
        try {
          const userScope = JSON.parse(userScopeStr)
          if (userScope.countries && userScope.countries.length > 0) {
            const countryCode = userScope.countries[0]
            const countryMap: Record<string, { name: string; country: string; currency: string }> = {
              'AE': { name: locale === 'ar' ? 'دبي للتوزيع' : 'Dubai Distributor', country: 'United Arab Emirates', currency: 'AED' },
              'US': { name: 'Costco West', country: 'United States', currency: 'USD' },
              'PK': { name: 'Lahore Distributor', country: 'Pakistan', currency: 'PKR' },
              'GB': { name: 'London Distributor', country: 'United Kingdom', currency: 'GBP' }
            }
            const countryInfo = countryMap[countryCode] || defaultInfo
            return {
              name: countryInfo.name,
              country: countryInfo.country,
              code: countryCode,
              currency: userScope.currency || countryInfo.currency
            }
          }
        } catch (e) {
          console.error('Error parsing user scope:', e)
        }
      }
      
      // If Arabic locale, force UAE/AED
      if (locale === 'ar') {
        return {
          name: 'دبي للتوزيع',
          country: 'United Arab Emirates',
          code: 'AE',
          currency: 'AED'
        }
      }
    }
    
    return {
      name: defaultInfo.name,
      country: defaultInfo.country,
      code: defaultInfo.code,
      currency: defaultInfo.currency
    }
  }
  
  const [distributorInfo] = useState(getDistributorInfo)

  // Navigation structure
  const navigation = [
    {
      label: t('sidebar.dashboard'),
      href: `/${locale}/distributor-portal/`,
      icon: '📊'
    },
    {
      label: t('sidebar.orders'),
      children: [
        { label: t('sidebar.placeNewOrder'), href: `/${locale}/distributor-portal/orders/new` },
        { label: t('sidebar.orderHistory'), href: `/${locale}/distributor-portal/orders/history` },
        { label: t('sidebar.invoices'), href: `/${locale}/distributor-portal/orders/invoices` }
      ],
      icon: '📦'
    },
    {
      label: t('sidebar.products'),
      children: [
        { label: t('sidebar.catalogue'), href: `/${locale}/distributor-portal/products/catalogue` },
        { label: t('sidebar.promotions'), href: `/${locale}/distributor-portal/products/promotions` },
        { label: t('sidebar.pricing'), href: `/${locale}/distributor-portal/products/pricing` }
      ],
      icon: '🛍️'
    },
    {
      label: t('sidebar.coverage'),
      children: [
        { label: t('sidebar.territories'), href: `/${locale}/distributor-portal/coverage/territories` },
        { label: t('sidebar.heatmap'), href: `/${locale}/distributor-portal/coverage/heatmap` },
        { label: t('sidebar.requestTerritory'), href: `/${locale}/distributor-portal/coverage/request` }
      ],
      icon: '🗺️'
    },
    {
      label: t('sidebar.market'),
      children: [
        { label: t('sidebar.sellout'), href: `/${locale}/distributor-portal/market/sellout` },
        { label: t('sidebar.competitors'), href: `/${locale}/distributor-portal/market/competitors` }
      ],
      icon: '📈'
    },
    {
      label: t('sidebar.support'),
      children: [
        { label: t('sidebar.tickets'), href: `/${locale}/distributor-portal/support/tickets` },
        { label: t('sidebar.knowledge'), href: `/${locale}/distributor-portal/support/knowledge` }
      ],
      icon: '🆘'
    },
    {
      label: t('sidebar.account'),
      children: [
        { label: t('sidebar.profile'), href: `/${locale}/distributor-portal/account/profile` },
        { label: t('sidebar.documents'), href: `/${locale}/distributor-portal/account/documents` },
        { label: t('sidebar.users'), href: `/${locale}/distributor-portal/account/users` }
      ],
      icon: '⚙️'
    }
  ]

  const isActive = (href: string) => {
    if (href === `/${locale}/distributor-portal/`) {
      return pathname === href || pathname === `/${locale}/distributor-portal`
    }
    return pathname?.startsWith(href)
  }

  return (
    <div className="flex h-screen bg-[#F8F9FA] overflow-hidden">
      {/* Left Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-white transition-all duration-300 flex flex-col border-r border-[#C3A35E]/30 shadow-sm z-20`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-[#C3A35E]/30 flex items-center justify-between">
          {sidebarOpen && (
            <h2 className="text-xl font-bold text-[#6B1F2B] font-serif">Harvics</h2>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-[#C3A35E] hover:text-[#6B1F2B] transition-colors"
          >
            {sidebarOpen ? '←' : '→'}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {navigation.map((item, index) => (
            <div key={index}>
              {item.children ? (
                <div>
                  <div className="flex items-center space-x-2 px-3 py-2 text-[#6B1F2B] font-semibold">
                    <span>{item.icon}</span>
                    {sidebarOpen && <span>{item.label}</span>}
                  </div>
                  {sidebarOpen && (
                    <div className="ml-4 space-y-1 mt-1">
                      {item.children.map((child, childIndex) => (
                        <Link
                          key={childIndex}
                          href={child.href}
                          className={`block px-3 py-2 rounded-md text-sm transition-colors ${
                            isActive(child.href)
                              ? 'bg-[#6B1F2B] text-white font-semibold'
                              : 'text-[#6B1F2B]/70 hover:text-[#6B1F2B] hover:bg-[#C3A35E]/10'
                          }`}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href={item.href}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                    isActive(item.href)
                      ? 'bg-[#6B1F2B] text-white font-semibold'
                      : 'text-[#6B1F2B]/70 hover:text-[#6B1F2B] hover:bg-[#C3A35E]/10'
                  }`}
                >
                  <span>{item.icon}</span>
                  {sidebarOpen && <span>{item.label}</span>}
                </Link>
              )}
            </div>
          ))}
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden bg-[#F8F9FA]">
        {/* Top Bar */}
        <header className="bg-white border-b border-[#C3A35E]/30 px-6 py-4 flex items-center justify-between shadow-sm sticky top-0 z-10">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold text-[#6B1F2B] font-serif">{t('common.title')}</h1>
            <div className="text-xs text-[#6B1F2B]/70 hidden md:flex items-center gap-2 px-3 py-1 bg-[#F8F9FA] rounded-full border border-[#C3A35E]/20">
              <span className="font-semibold text-[#6B1F2B]">{distributorInfo.name}</span>
              <span className="text-[#C3A35E]">•</span>
              <span>{distributorInfo.country}</span>
              {distributorInfo.currency && (
                <>
                  <span className="text-[#C3A35E]">•</span>
                  <span className="font-semibold text-[#6B1F2B]">{distributorInfo.currency}</span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Harvey Chat Button */}
            <button
              className="p-2 rounded-lg bg-gradient-to-r from-[#6B1F2B] to-[#50000b] text-white hover:shadow-lg transition-all border border-[#C3A35E]/30"
              title={t('common.harveyAI')}
            >
              <span className="text-xl">🤖</span>
            </button>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => {
                  setNotificationsOpen(!notificationsOpen)
                  setUserMenuOpen(false)
                }}
                className="relative p-2 rounded-lg hover:bg-[#F8F9FA] transition-colors text-[#6B1F2B]"
              >
                <span className="text-2xl">🔔</span>
                <span className="absolute top-1 right-1 w-2 h-2 bg-[#C3A35E] rounded-full border border-white"></span>
              </button>
              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-[#C3A35E]/30 z-50">
                  <div className="p-4 border-b border-[#C3A35E]/20 bg-[#F8F9FA]">
                    <h3 className="font-semibold text-[#6B1F2B]">{t('common.notifications')}</h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    <div className="p-4 border-b border-gray-100 hover:bg-[#F8F9FA]">
                      <div className="text-sm font-semibold text-[#6B1F2B]">{t('common.orderStatusUpdate')}</div>
                      <div className="text-xs text-gray-500 mt-1">Order #12345 has been dispatched</div>
                    </div>
                    <div className="p-4 border-b border-gray-100 hover:bg-[#F8F9FA]">
                      <div className="text-sm font-semibold text-[#6B1F2B]">{t('common.newPromotion')}</div>
                      <div className="text-xs text-gray-500 mt-1">Summer promotion available</div>
                    </div>
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
                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-[#F8F9FA] transition-colors border border-transparent hover:border-[#C3A35E]/20"
              >
                <div className="w-8 h-8 rounded-full bg-[#6B1F2B] flex items-center justify-center text-white font-semibold border border-[#C3A35E]/50">
                  {username.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-semibold text-[#6B1F2B] hidden md:inline">{username}</span>
              </button>
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-[#C3A35E]/30 z-50">
                  <div className="p-2">
                    <div className="px-4 py-2 border-b border-[#C3A35E]/20">
                      <div className="font-semibold text-[#6B1F2B] text-sm">Logged in as</div>
                      <div className="text-xs text-gray-500 mt-1">{username}</div>
                    </div>
                    <Link
                      href={`/${locale}/distributor-portal/account/profile`}
                      className="block px-4 py-2 text-sm text-[#6B1F2B] hover:bg-[#F8F9FA] rounded-md hover:text-[#C3A35E]"
                    >
                      {t('common.profile')}
                    </Link>
                    <Link
                      href={`/${locale}/distributor-portal/account/users`}
                      className="block px-4 py-2 text-sm text-[#6B1F2B] hover:bg-[#F8F9FA] rounded-md hover:text-[#C3A35E]"
                    >
                      {t('common.settings')}
                    </Link>
                    <div className="border-t border-[#C3A35E]/20 my-1"></div>
                    <button 
                      onClick={() => {
                        apiClient.clearToken()
                        router.push(`/${locale}/login`)
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md"
                    >
                      {t('common.logout')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-[#F8F9FA] p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

export default DistributorPortalLayout

