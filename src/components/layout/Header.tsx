'use client'

import React, { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useTranslations, useLocale } from 'next-intl'
import { usePathname } from 'next/navigation'
import CountrySelector from '@/components/ui/CountrySelector'
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
  
  // State management
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  
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
    <header className="relative z-[200] pointer-events-auto font-sans" style={{ background: '#F5F1E8' }}>

      {/* T1 — TOP UTILITY BAR: Maroon bg, gold text, 32px */}
      <div style={{ background: '#6B1F2B', borderBottom: '1px solid rgba(195,163,94,0.2)' }}>
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="flex justify-between items-center" style={{ height: '32px' }}>

            {/* Left links */}
            <div className="hidden md:flex items-center gap-6">
              {[
                { href: `/${locale}/csr`, label: t('esgReport') },
                { href: `/${locale}/investor-relations`, label: t('investors') },
                { href: `/${locale}/media`, label: t('media') },
              ].map((link) => (
                <Link key={link.href} href={link.href}
                  className="transition-opacity duration-200 hover:opacity-70"
                  style={{ color: '#C3A35E', fontSize: '11px', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', textDecoration: 'none' }}
                >{link.label}</Link>
              ))}

              {/* Countries dropdown */}
              <div className="relative" onMouseEnter={() => handleMouseEnter('countries')} onMouseLeave={handleMouseLeave}>
                <button
                  className="flex items-center gap-1 transition-opacity duration-200 hover:opacity-70"
                  style={{ color: '#C3A35E', fontSize: '11px', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', background: 'none', border: 'none', cursor: 'pointer' }}
                  aria-expanded={activeDropdown === 'countries'}
                >
                  <span>{t('countries')}</span>
                  <svg className={`w-3 h-3 transition-transform duration-200 ${activeDropdown === 'countries' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div className={`absolute top-full ${isRTLMode ? 'right-0' : 'left-0'} mt-1 w-72 z-50 transition-opacity duration-200 ${activeDropdown === 'countries' ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                  style={{ background: '#F5F1E8', border: '1px solid rgba(195,163,94,0.4)' }}>
                  <div className="p-3">
                    <CountrySelector buttonClassName="w-full justify-start text-left px-4 py-3 font-semibold" menuAlignment="left"
                      options={canSwitchMarket ? availableCountries.map(code => ({ code, name: formatCountry(code) })) : undefined} />
                  </div>
                </div>
              </div>

              <Link href={`/${locale}/contact`}
                className="transition-opacity duration-200 hover:opacity-70"
                style={{ color: '#C3A35E', fontSize: '11px', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', textDecoration: 'none' }}
              >{t('contactUs')}</Link>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-4">
              <div className="hidden sm:block [&_button]:text-xs [&_button]:font-semibold" style={{ color: '#C3A35E' }}>
                <LanguageSwitcher />
              </div>
              <Link href={`/${locale}/login`}
                className="transition-opacity duration-200 hover:opacity-70"
                style={{ color: '#C3A35E', fontSize: '11px', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', textDecoration: 'none' }}
              >{getTranslation('signIn', 'navigation', 'Sign In')}</Link>
            </div>
          </div>
        </div>
      </div>

      {/* T2 — MAIN BRAND BAR: Ivory bg, logo left, search center, icons right */}
      <div style={{ background: '#F5F1E8', borderBottom: '1px solid rgba(195,163,94,0.3)' }}>
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="flex items-center justify-between" style={{ height: '64px' }}>

            {/* Logo */}
            <Link href={`/${locale}`} className="flex-shrink-0 transition-opacity duration-200 hover:opacity-80">
              <img src="/Images/logo.png" alt="Harvics" style={{ height: '48px', width: 'auto', objectFit: 'contain' }} />
            </Link>

            {/* Search */}
            <div className="flex-1 max-w-xl mx-8 hidden md:block">
              <div className="w-full flex items-center overflow-hidden" style={{ background: '#FFFFFF', border: '1px solid rgba(195,163,94,0.4)' }}>
                <input type="text" placeholder={getTranslation('search', 'common', 'Search product, code or brand')}
                  onClick={() => setIsSearchOpen(true)} readOnly
                  className="flex-1 px-4 py-2.5 bg-transparent outline-none"
                  style={{ color: '#6B1F2B', fontSize: '13px' }} />
                <button onClick={() => setIsSearchOpen(true)}
                  className="px-4 py-2.5 transition-opacity duration-200 hover:opacity-70"
                  style={{ color: '#6B1F2B', background: 'transparent', border: 'none', borderLeft: '1px solid rgba(195,163,94,0.2)' }}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Right icons */}
            <div className="flex items-center gap-3">
              <Link href={`/${locale}/wishlist`} className="p-2 transition-opacity duration-200 hover:opacity-60" style={{ color: '#6B1F2B' }}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </Link>
              <Link href={`/${locale}/checkout`} className="p-2 relative transition-opacity duration-200 hover:opacity-60" style={{ color: '#6B1F2B' }}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 flex items-center justify-center" style={{ background: '#6B1F2B', color: '#C3A35E', fontSize: '9px', fontWeight: 700 }}>0</span>
              </Link>
              <button onClick={() => setIsSearchOpen(true)} className="md:hidden p-2 transition-opacity duration-200 hover:opacity-60" style={{ color: '#6B1F2B', background: 'none', border: 'none' }}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="lg:hidden p-2 transition-opacity duration-200 hover:opacity-60" style={{ color: '#6B1F2B', background: 'none', border: 'none' }}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isMenuOpen
                    ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* T3 — NAV BAR: 10 Industry verticals + mega dropdown */}
        <div className="hidden lg:block">
          <SupremeNavBar />
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 z-50" style={{ background: '#F5F1E8', borderTop: '1px solid rgba(195,163,94,0.3)' }}>
          <div className="p-6 space-y-4">
            <div className="flex flex-col items-center text-sm space-y-1" style={{ color: '#6B1F2B' }}>
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
                { href: `/${locale}/csr`, label: t('csr') },
                { href: `/${locale}/investor-relations`, label: t('investorRelations') },
                { href: `/${locale}/portals/`, label: t('portals') },
                { href: `/${locale}/contact`, label: t('contactUs') },
              ].map((link) => (
                <Link key={link.href} href={link.href}
                  className="block px-4 py-3 text-sm font-medium text-center transition-opacity duration-200 hover:opacity-70"
                  style={{ color: '#6B1F2B', borderBottom: '1px solid rgba(195,163,94,0.2)', textDecoration: 'none' }}
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