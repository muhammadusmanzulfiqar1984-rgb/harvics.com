'use client'

import React, { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useTranslations, useLocale } from 'next-intl'
import { usePathname, useRouter } from 'next/navigation'
import CountrySelector from '@/features/geo/CountrySelector'
import LanguageSwitcher from '@/components/ui/LanguageSwitcher'
import SearchModal from '@/components/ui/SearchModal'
import SupremeNavBar from '@/components/layout/SupremeNavBar'
import type { ProductCategory } from '@/data/folderBasedProducts'
import { useCountry } from '@/contexts/CountryContext'
import { isRTL } from '@/utils/rtl'

const COUNTRY_NAME_MAP: Record<string, string> = {
  us: 'United States',
  pk: 'Pakistan',
  ae: 'United Arab Emirates',
}

interface HeaderProps {
  categories?: ProductCategory[]
}

const Header: React.FC<HeaderProps> = ({ categories = [] }) => {
  const t = useTranslations('navigation')
  const tCommon = useTranslations('common')
  
  // Helper function to safely get translations with fallback
  const getTranslation = (key: string, namespace: 'navigation' | 'common' = 'navigation', fallback?: string) => {
    try {
      const translator = namespace === 'navigation' ? t : tCommon
      const result = translator(key)
      
      const isMissing = !result || 
                       result === key || 
                       result === `${namespace}.${key}` || 
                       result.startsWith(`${namespace}.`) ||
                       (typeof result === 'string' && result.includes('.') && result.split('.').length === 2)
      
      if (isMissing) {
        if (fallback) return fallback
        return key
          .replace(/([A-Z])/g, ' $1')
          .replace(/^./, str => str.toUpperCase())
          .trim()
      }
      return result
    } catch (error) {
      return fallback || key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()).trim()
    }
  }

  const locale = useLocale()
  const pathname = usePathname()
  const isRTLMode = isRTL(locale)
  
  const router = useRouter()

  // State management
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const checkAuth = () => setIsLoggedIn(!!localStorage.getItem('auth_token'))
    checkAuth()
    window.addEventListener('storage', checkAuth)
    return () => window.removeEventListener('storage', checkAuth)
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user_scope')
    localStorage.removeItem('user_data')
    localStorage.removeItem('user_type')
    document.cookie = 'auth_token=; path=/; max-age=0'
    document.cookie = 'x_role=; path=/; max-age=0'
    setIsLoggedIn(false)
    router.push(`/${locale}/login`)
  }
  
  // Single active dropdown state to ensure mutual exclusivity
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const { selectedCountry, countryData, role, userScope, availableCountries } = useCountry()
  
  // Unified handler for entering a dropdown area
  const handleMouseEnter = (dropdown: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => {
      setActiveDropdown(dropdown)
    }, 50)
  }

  // Unified handler for leaving a dropdown area
  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => {
      setActiveDropdown(null)
    }, 150)
  }

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  const productCategories = (categories || []).map(category => ({
    key: category.key,
    name: category.name,
    icon: category.icon,
    href: `/${locale}${category.url}`,
    image: category.image || '/Images/logo.png',
    description: category.description,
    color: category.color
  }))

  const formatCountry = (value?: string) => {
    if (!value) return ''
    const mapped = COUNTRY_NAME_MAP[value.toLowerCase()]
    if (mapped) return mapped
    return value
      .replace(/-/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase())
  }

  const displayCountry = countryData?.countryName || formatCountry(selectedCountry)
  const currencyDisplay = countryData?.currency
    ? `${countryData.currency.symbol || ''} ${countryData.currency.code || ''}`.trim()
    : userScope?.currency || ''
    
  const roleLabelMap: Record<string, string> = {
    supplier: 'Supplier',
    distributor: 'Distributor',
    sales_officer: 'Sales Officer',
    country_manager: 'Country Manager',
    hq: 'HQ',
    company: 'Company'
  }
  const roleLabel = role ? roleLabelMap[role] || role : ''
  // Allow market switching if multiple countries are available, regardless of role
  const canSwitchMarket = availableCountries.length > 1

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-md border-b border-[#1A0505]/10 pointer-events-auto font-sans">

      {/* T1 — TOP UTILITY BAR: deep oxblood with cream text */}
      <div className="w-full bg-[#1A0505]">
        <div className="relative hidden lg:block text-[#F5F0E8] py-2 text-xs font-normal">
          <div className="universal-layout-frame max-w-harvics-layout flex justify-between items-center" style={{ height: '24px' }}>

            {/* Left links */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '28px', whiteSpace: 'nowrap' }}>
              {[
                { href: `/${locale}/csr`, label: t('esgReport') },
                { href: `/${locale}/investor-relations`, label: t('investors') },
                { href: `/${locale}/media`, label: t('media') },
              ].map((link) => (
                <Link key={link.href} href={link.href}
                  className="transition-opacity duration-200 hover:opacity-70"
                  style={{ color: '#C3A35E', fontSize: '11px', fontWeight: 400, letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'none', whiteSpace: 'nowrap' }}
                >{link.label}</Link>
              ))}

              {/* Countries dropdown */}
              <div className="relative" onMouseEnter={() => handleMouseEnter('countries')} onMouseLeave={handleMouseLeave}>
                <button
                  className="flex items-center gap-1 transition-opacity duration-200 hover:opacity-70"
                  style={{ color: '#C3A35E', fontSize: '11px', fontWeight: 400, letterSpacing: '0.1em', textTransform: 'uppercase', background: 'none', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}
                  aria-expanded={activeDropdown === 'countries'}
                >
                  <span>{t('countries')}</span>
                  <svg className={`w-3 h-3 transition-transform duration-200 ${activeDropdown === 'countries' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div className={`absolute top-full ${isRTLMode ? 'right-0' : 'left-0'} mt-1 w-72 transition-opacity duration-200 ${activeDropdown === 'countries' ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                  style={{ background: '#ffffff', border: '1px solid rgba(195,163,94,0.4)', zIndex: 9999 }}>
                  <div className="p-3">
                    <CountrySelector buttonClassName="w-full justify-start text-left px-4 py-3 font-semibold" menuAlignment="left"
                      options={canSwitchMarket ? availableCountries.map(code => ({ code, name: formatCountry(code) })) : undefined} />
                  </div>
                </div>
              </div>

              <Link href={`/${locale}/contact`}
                className="transition-opacity duration-200 hover:opacity-70"
                style={{ color: '#C3A35E', fontSize: '11px', fontWeight: 400, letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'none', whiteSpace: 'nowrap' }}
              >{t('contactUs')}</Link>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-5" style={{ whiteSpace: 'nowrap' }}>
              <LanguageSwitcher />
              {isLoggedIn ? (
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 transition-opacity duration-200 hover:opacity-70"
                  style={{ 
                    color: '#C3A35E', 
                    fontSize: '11px', 
                    fontWeight: 600, 
                    letterSpacing: '0.05em', 
                    textTransform: 'uppercase' as const, 
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Logout
                </button>
              ) : (
                <Link
                  href={`/${locale}/login`}
                  className="flex items-center gap-1.5 transition-opacity duration-200 hover:opacity-70"
                  style={{ 
                    color: '#C3A35E', 
                    fontSize: '11px', 
                    fontWeight: 600, 
                    letterSpacing: '0.05em', 
                    textTransform: 'uppercase' as const, 
                    textDecoration: 'none',
                  }}
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* T2 — MAIN BRAND BAR: Cream bg, logo left, search center, icons right */}
      <div className="relative w-full py-1 border-b border-[#1A0505]/10" style={{
        background: scrolled ? 'rgba(245,240,232,0.92)' : '#F5F0E8',
        backdropFilter: scrolled ? 'blur(20px) saturate(180%)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(20px) saturate(180%)' : 'none',
        transition: 'background 0.4s ease, backdrop-filter 0.4s ease',
      }}>
        <div className="universal-layout-frame">
          <div className="flex items-center justify-between" style={{ height: '48px' }}>

            {/* Logo */}
            <Link href={`/${locale}`} className="flex-shrink-0 transition-all duration-300 hover:opacity-90 hover:scale-105 relative group">
              <div className="relative flex items-center gap-3">
                    <Image src="/logo.svg" alt="Harvics" width={36} height={36} style={{ width: '36px', height: 'auto', objectFit: 'contain' }} priority />
                <div className="flex flex-col">
                  <span className="text-xl font-bold tracking-tight" style={{ color: '#1A0505' }}>HARVICS</span>
                  <span className="text-[10px] uppercase tracking-widest" style={{ color: '#C3A35E' }}>Global Ventures</span>
                </div>
                {/* Gold accent glow on hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300" 
                  style={{ 
                    background: 'radial-gradient(circle, rgba(195,163,94,0.4) 0%, transparent 70%)',
                    filter: 'blur(8px)'
                  }} 
                />
              </div>
            </Link>

            {/* Search */}
            <div className="flex-1 max-w-xl mx-8 hidden md:block relative">
              <div
                className="w-full flex items-center overflow-hidden relative search-bar-wrap"
                style={{ background: 'transparent', border: '0.5px solid rgba(201,168,76,0.3)', transition: 'border-color 0.25s ease' }}
              >
                <input type="text" placeholder={getTranslation('search', 'common', 'Search product, code or brand')}
                  onClick={() => setIsSearchOpen(true)} readOnly
                  className="flex-1 px-4 py-1.5 bg-transparent outline-none search-bar-input"
                  style={{ color: '#1a0608', fontSize: '12px' }} />
                <button onClick={() => setIsSearchOpen(true)}
                  className="px-4 py-1.5 transition-opacity duration-200 hover:opacity-70"
                  style={{ color: '#1a0608', background: 'transparent', border: 'none' }}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>
              <style dangerouslySetInnerHTML={{__html: `
                .search-bar-wrap:focus-within { border-color: #C3A35E !important; }
                .search-bar-input::placeholder { color: rgba(0,0,0,0.35); }
              `}} />
            </div>

            {/* Right icons */}
            <div className="flex items-center gap-3">
              {/* Account / Login / Logout */}
              {isLoggedIn ? (
                <button onClick={handleLogout} className="p-2 transition-opacity duration-200 hover:opacity-60 group relative" style={{ color: '#1A0505', background: 'none', border: 'none', cursor: 'pointer' }}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[9px] font-bold uppercase tracking-wider whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: '#1A0505' }}>
                    Logout
                  </span>
                </button>
              ) : (
                <Link href={`/${locale}/login`} className="p-2 transition-opacity duration-200 hover:opacity-60 group relative" style={{ color: '#1A0505' }}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[9px] font-bold uppercase tracking-wider whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: '#1A0505' }}>
                    Login
                  </span>
                </Link>
              )}
              <Link href={`/${locale}/wishlist`} className="p-2 transition-opacity duration-200 hover:opacity-60" style={{ color: '#1A0505' }}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </Link>
              <Link href={`/${locale}/checkout`} className="p-2 relative transition-opacity duration-200 hover:opacity-60" style={{ color: '#1A0505' }}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 flex items-center justify-center" style={{ background: '#1A0505', color: '#C3A35E', fontSize: '9px', fontWeight: 700 }}>0</span>
              </Link>
              <button onClick={() => setIsSearchOpen(true)} className="md:hidden p-2 transition-opacity duration-200 hover:opacity-60" style={{ color: '#1A0505', background: 'none', border: 'none' }}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="lg:hidden p-2 transition-opacity duration-200 hover:opacity-60" style={{ color: '#1A0505', background: 'none', border: 'none' }}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isMenuOpen
                    ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Animated running gold line - Full width */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 overflow-hidden">
          <div 
            className="h-full"
            style={{
              width: '30%',
              background: 'linear-gradient(to right, transparent, #C3A35E, transparent)',
              animation: 'runningLine 3s linear infinite'
            }}
          />
        </div>
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes runningLine {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(400%); }
          }
        `}} />

        {/* T3 — NAV BAR: 10 Industry verticals + mega dropdown */}
        <div className="hidden lg:block w-full py-1 bg-white shadow-sm">
          <div className="universal-layout-frame">
            <SupremeNavBar />
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 z-50" style={{ background: '#ffffff', borderTop: '1px solid rgba(195,163,94,0.3)' }}>
          <div className="p-6 space-y-4">
            <div className="flex flex-col items-center text-sm space-y-1" style={{ color: '#1A0505' }}>
              {roleLabel && <span className="font-semibold uppercase">{roleLabel}</span>}
              <span>{displayCountry || getTranslation('selectCountry', 'common', 'Select Country')}</span>
              {currencyDisplay && <span className="font-semibold">{currencyDisplay}</span>}
            </div>
            {canSwitchMarket && (
              <div className="flex justify-center mb-4">
                <div className="w-full max-w-xs">
                  <CountrySelector fullWidth buttonClassName="justify-center" menuAlignment="left"
                    options={availableCountries.map(code => ({ code, name: formatCountry(code) }))} />
                </div>
              </div>
            )}
            <nav className="space-y-0">
              {[
                { href: `/${locale}`, label: t('home') },
                { href: `/${locale}/about`, label: t('about') },
                { href: `/${locale}/products`, label: t('products') },
                { href: `/${locale}/videos`, label: 'Videos' },
                { href: `/${locale}/csr`, label: t('csr') },
                { href: `/${locale}/investor-relations`, label: t('investorRelations') },
                { href: `/${locale}/portals/`, label: t('portals') },
                { href: `/${locale}/contact`, label: t('contactUs') },
              ].map((link) => (
                <Link key={link.href} href={link.href}
                  className="block px-4 py-3 text-sm font-medium text-center transition-opacity duration-200 hover:opacity-70"
                  style={{ color: '#1A0505', borderBottom: '1px solid rgba(195,163,94,0.2)', textDecoration: 'none' }}
                >{link.label}</Link>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Search Modal */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </header>
  )
}

export default Header