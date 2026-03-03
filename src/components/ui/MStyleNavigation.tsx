'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useTranslations, useLocale } from 'next-intl'
import SaleMegaMenu from './SaleMegaMenu'

interface NavigationItem {
  id: string
  label: string
  href: string
  category: 'gender' | 'product' | 'special' | 'corporate'
  order: number
}

interface MStyleNavigationProps {
  activeTab?: string
}

const MStyleNavigation: React.FC<MStyleNavigationProps> = ({ activeTab }) => {
  const t = useTranslations('navigation')
  const locale = useLocale()
  const [hoveredTab, setHoveredTab] = useState<string | null>(null)
  const [saleMegaMenuOpen, setSaleMegaMenuOpen] = useState(false)

  // Harvics Product Categories (Folder-based)
  // Hardcoded for reliability and to ensure they match folder structure
  const productCategories = [
    { key: 'bakery', label: 'Bakery', href: `/${locale}/products/bakery` },
    { key: 'beverages', label: 'Beverages', href: `/${locale}/products/beverages` },
    { key: 'confectionery', label: 'Confectionery', href: `/${locale}/products/confectionery` },
    { key: 'culinary', label: 'Culinary', href: `/${locale}/products/culinary` },
    { key: 'frozenFoods', label: 'Frozen Foods', href: `/${locale}/products/frozenFoods` },
    { key: 'pasta', label: 'Pasta', href: `/${locale}/products/pasta` },
    { key: 'snacks', label: 'Snacks', href: `/${locale}/products/snacks` }
  ]

  // Left Side: Products + Brands A-Z
  const leftTabs = [
    ...productCategories,
    { key: 'brands-az', label: 'Brands A-Z', href: `/${locale}/products/brands-az` }
  ]

  // Right Side: Corporate & Commercial
  const rightTabs = [
    { key: 'harvics-house', label: t('harvicsHouse'), href: `/${locale}/harvics-house` },
    { key: 'about', label: t('about'), href: `/${locale}/about` },
    { key: 'money', label: t('money'), href: `/${locale}/money/rewards-card` },
    { key: 'offers', label: t('offers'), href: `/${locale}/offers/special-offers` },
    { key: 'sale', label: 'Sale', href: `/${locale}/sales/current-sales` }
  ]

  // Cleanup unused food menu logic (not needed for Nestlé-style categories)

  return (
    <div className="relative w-full z-[100]">
      <div className="w-full relative z-[100]" style={{ background: '#F5F1E8', borderBottom: '1px solid rgba(195,163,94,0.3)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center justify-between h-12 w-full relative z-[100]">
            
            {/* LEFT GROUP: Products & Brands - Takes available space */}
            <div className="flex-1 flex items-center space-x-0 overflow-x-auto scrollbar-hide h-full min-w-0 pr-4">
              {leftTabs.map((category) => {
                const isActive = activeTab === category.key
                const isHovered = hoveredTab === category.key
                
                return (
                  <div
                    key={category.key}
                    className="relative h-full flex items-center flex-shrink-0"
                    onMouseEnter={() => setHoveredTab(category.key)}
                    onMouseLeave={() => setHoveredTab(null)}
                  >
                    <Link
                      href={category.href}
                      className={`
                        relative z-[101] h-full flex items-center px-4 lg:px-6 text-sm font-extrabold uppercase tracking-widest whitespace-nowrap transition-all duration-200
                        ${isActive 
                          ? 'bg-white text-maroon border-b-2 border-gold' 
                          : isHovered 
                            ? 'bg-gold text-maroon' 
                            : 'bg-maroon text-gold'}
                      `}
                    >
                      {category.label}
                    </Link>
                  </div>
                )
              })}
            </div>

            {/* RIGHT GROUP: Corporate & Sale - Fixed width/shrink behavior */}
            <div className="flex-shrink-0 flex items-center space-x-0 h-full hidden md:flex">
              {rightTabs.map((tab) => {
                const isSale = tab.key === 'sale'
                const isActive = activeTab === tab.key
                const isHovered = hoveredTab === tab.key

                return (
                  <div
                    key={tab.key}
                    className="relative h-full flex items-center flex-shrink-0"
                    onMouseEnter={() => {
                      setHoveredTab(tab.key)
                      if (isSale) setSaleMegaMenuOpen(true)
                    }}
                    onMouseLeave={() => {
                      setHoveredTab(null)
                      if (isSale) setSaleMegaMenuOpen(false)
                    }}
                  >
                    <Link
                      href={tab.href}
                      className={`
                        relative z-[101] h-full flex items-center px-4 lg:px-6 text-sm font-extrabold uppercase tracking-widest whitespace-nowrap transition-all duration-200
                        ${isActive 
                          ? 'font-bold' 
                          : isHovered 
                            ? 'opacity-100' 
                            : 'opacity-75'}
                        text-[#6B1F2B]
                      `}
                    >
                      {tab.label}
                    </Link>
                    {isSale && (
                      <div className="absolute top-full right-0 z-[102]">
                        <SaleMegaMenu
                          isOpen={saleMegaMenuOpen}
                          onClose={() => {
                            setSaleMegaMenuOpen(false)
                            setHoveredTab(null)
                          }}
                        />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
            
            {/* Mobile indicator for right tabs if needed (optional) */}
          </nav>
        </div>
      </div>
    </div>
  )
}

export default MStyleNavigation

