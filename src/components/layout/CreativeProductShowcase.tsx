'use client'

import React, { useState, useEffect } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import Link from 'next/link'
import type { ProductCategory } from '@/data/folderBasedProducts'

interface CreativeProductShowcaseProps {
  categories: ProductCategory[]
}

interface TierButton {
  id: string
  label: string
  href?: string
  icon?: string
}

const CreativeProductShowcase: React.FC<CreativeProductShowcaseProps> = ({ categories }) => {
  const tProducts = useTranslations('products')
  const tCommon = useTranslations('common')
  const locale = useLocale()
  const [isVisible, setIsVisible] = useState(true) // Start visible immediately
  
  // Fallback text values
  const getText = (key: string, namespace: 'products' | 'common', fallback: string) => {
    try {
      const translator = namespace === 'products' ? tProducts : tCommon
      const translated = translator(key)
      if (translated === key || !translated || translated.trim() === '') {
        return fallback
      }
      return translated
    } catch (error) {
      return fallback
    }
  }
  
  // Tier navigation state
  const [selectedTier1, setSelectedTier1] = useState<string | null>(null)
  const [selectedTier2, setSelectedTier2] = useState<string | null>(null)
  const [selectedTier3, setSelectedTier3] = useState<string | null>(null)
  const [selectedTier4, setSelectedTier4] = useState<string | null>(null)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  // Tier 1: Main Categories
  const tier1Buttons: TierButton[] = (categories || []).slice(0, 6).map(cat => ({
    id: cat.key,
    label: cat.name,
    href: `/${locale}${cat.url}`,
    icon: cat.icon
  }))

  // Tier 2: Subcategories (when Tier 1 is selected)
  // Use subcategories from the category data passed as props (already loaded server-side)
  const tier2Buttons: TierButton[] = selectedTier1 
    ? (() => {
        try {
          const selectedCategory = categories.find(cat => cat.key === selectedTier1)
          const subcategories = selectedCategory?.subcategories || []
          return subcategories && subcategories.length > 0
            ? subcategories.map((sub) => ({
                id: `${selectedTier1}-${sub}`,
                label: sub.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                href: `/${locale}/products/${selectedTier1}/${sub}`
              }))
            : []
        } catch (error) {
          // Error loading subcategories - return empty array
          return []
        }
      })()
    : []

  // Extract subcategory slug from tier2 ID
  const selectedSubcategory = selectedTier2 ? selectedTier2.split('-').slice(1).join('-') : null

  // Tier 3: Product Lines (sample data - can be enhanced)
  const tier3Buttons: TierButton[] = (selectedTier1 && selectedSubcategory) ? [
    { id: `${selectedTier2}-line1`, label: 'Premium Line', href: `/${locale}/products/${selectedTier1}/${selectedSubcategory}/premium` },
    { id: `${selectedTier2}-line2`, label: 'Classic Line', href: `/${locale}/products/${selectedTier1}/${selectedSubcategory}/classic` },
    { id: `${selectedTier2}-line3`, label: 'Special Edition', href: `/${locale}/products/${selectedTier1}/${selectedSubcategory}/special` }
  ] : []

  // Extract product line from tier3 ID (format: category-subcategory-line1/line2/line3)
  const selectedProductLine = selectedTier3 
    ? (() => {
        const parts = selectedTier3.split('-')
        const linePart = parts[parts.length - 1] // Get last part (line1, line2, line3)
        const lineMap: Record<string, string> = {
          'line1': 'premium',
          'line2': 'classic',
          'line3': 'special'
        }
        return lineMap[linePart] || linePart.replace('line', '')
      })()
    : null

  // Tier 4: Individual Products (sample data - can be enhanced)
  const tier4Buttons: TierButton[] = (selectedTier1 && selectedSubcategory && selectedProductLine) ? [
    { id: `${selectedTier3}-prod1`, label: 'Product A', href: `/${locale}/products/${selectedTier1}/${selectedSubcategory}/${selectedProductLine}/product-a` },
    { id: `${selectedTier3}-prod2`, label: 'Product B', href: `/${locale}/products/${selectedTier1}/${selectedSubcategory}/${selectedProductLine}/product-b` },
    { id: `${selectedTier3}-prod3`, label: 'Product C', href: `/${locale}/products/${selectedTier1}/${selectedSubcategory}/${selectedProductLine}/product-c` }
  ] : []

  const handleTier1Click = (tierId: string) => {
    setSelectedTier1(tierId)
    setSelectedTier2(null)
    setSelectedTier3(null)
    setSelectedTier4(null)
  }

  const handleTier2Click = (tierId: string) => {
    setSelectedTier2(tierId)
    setSelectedTier3(null)
    setSelectedTier4(null)
  }

  const handleTier3Click = (tierId: string) => {
    setSelectedTier3(tierId)
    setSelectedTier4(null)
  }

  const handleTier4Click = (tierId: string) => {
    setSelectedTier4(tierId)
  }

  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-white-soft relative overflow-hidden">
      <div className="relative z-10 w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16 lg:mb-20">
          <div className="opacity-100">
            <span className="text-maroon-deep text-xs font-bold uppercase tracking-[0.2em] mb-3 block">Discover Excellence</span>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-serif text-maroon-deep mb-6 tracking-tight">
              {getText('ourProducts', 'products', 'Our Collections')}
            </h2>
            <div className="w-16 h-0.5 bg-maroon-deep mx-auto"></div>
          </div>
        </div>

        {/* 4-Tier Button Navigation System */}
        <div className="mb-12 sm:mb-16 lg:mb-20">
          <div className="opacity-100">
            
            {/* Tier 1: Main Categories */}
            <div className="mb-8 flex justify-center">
              <div className="flex flex-wrap justify-center gap-4">
                {tier1Buttons.map((button) => (
                  <button
                    key={button.id}
                    onClick={() => handleTier1Click(button.id)}
                    className={`px-6 py-3 text-xs uppercase tracking-[0.15em] transition-all duration-300 border rounded-sm ${
                      selectedTier1 === button.id
                        ? 'text-gold bg-maroon-deep border-maroon-deep shadow-md'
                        : 'text-maroon-deep bg-white/90 border-white hover:bg-maroon-deep hover:text-gold'
                    } font-semibold`}
                  >
                    {button.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tier 2: Subcategories (shown when Tier 1 is selected) */}
            {selectedTier1 && (
              <div className="mb-8 flex justify-center animate-fadeIn">
                {tier2Buttons.length > 0 ? (
                  <div className="flex flex-wrap justify-center gap-3">
                    {tier2Buttons.map((button) => (
                      <button
                        key={button.id}
                        onClick={() => handleTier2Click(button.id)}
                        className={`px-5 py-2 text-xs uppercase tracking-widest transition-all duration-300 rounded-sm border ${
                          selectedTier2 === button.id
                        ? 'text-white bg-maroon-deep border-maroon-deep shadow-sm'
                        : 'text-maroon-deep bg-white/80 border-white hover:bg-maroon-deep hover:text-white'
                        } font-medium`}
                      >
                        {button.label}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-maroon-deep/70 italic font-light">No subcategories available for this category.</div>
                )}
              </div>
            )}
            

            {/* Tier 3: Product Lines (shown when Tier 2 is selected) */}
            {selectedTier2 && tier3Buttons.length > 0 && (
              <div className="mb-8 flex justify-center animate-fadeIn">
                <div className="flex flex-wrap justify-center gap-3">
                  {tier3Buttons.map((button) => (
                    <button
                      key={button.id}
                      onClick={() => handleTier3Click(button.id)}
                      className={`px-4 py-2 text-[10px] uppercase tracking-widest transition-all duration-300 rounded-sm border ${
                        selectedTier3 === button.id
                        ? 'text-white bg-maroon-deep border-maroon-deep'
                        : 'text-maroon-deep bg-white/80 border-white hover:bg-maroon-deep hover:text-white'
                      } font-medium`}
                    >
                      {button.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Tier 4: Individual Products (shown when Tier 3 is selected) */}
            {selectedTier3 && tier4Buttons.length > 0 && (
              <div className="mb-8 flex justify-center animate-fadeIn">
                <div className="flex flex-wrap justify-center gap-3">
                  {tier4Buttons.map((button) => (
                    <Link
                      key={button.id}
                      href={button.href || '#'}
                      onClick={() => handleTier4Click(button.id)}
                      className={`px-4 py-2 text-[10px] uppercase tracking-widest transition-all duration-300 rounded-sm border ${
                        selectedTier4 === button.id
                        ? 'text-white bg-maroon-deep border-maroon-deep'
                        : 'text-maroon-deep bg-white/80 border-white hover:bg-maroon-deep hover:text-white'
                          } font-medium`}
                    >
                      {button.label}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Reset Button */}
            {(selectedTier1 || selectedTier2 || selectedTier3 || selectedTier4) && (
              <div className="mb-12 flex justify-center">
                <button
                  onClick={() => {
                    setSelectedTier1(null)
                    setSelectedTier2(null)
                    setSelectedTier3(null)
                    setSelectedTier4(null)
                  }}
                  className="text-maroon-deep/70 hover:text-maroon-deep text-[10px] uppercase tracking-[0.2em] transition-all duration-300 border-b border-transparent hover:border-maroon-deep"
                >
                  Reset Filter
                </button>
              </div>
            )}

            {!selectedTier1 && (
              <div className="mt-12">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {(categories || []).slice(0, 6).map((category, index) => {
                    const productImage = category.image || '/Images/logo.png';
                    const productLabel = category.name || category.key

                    return (
                      <Link
                        key={index}
                        href={`/${locale}${category.url}`}
                        className="group relative overflow-hidden bg-white border border-gold-soft/60 rounded-lg transition-all duration-500 hover:border-gold hover:-translate-y-1"
                      >
                        <div className="relative aspect-[4/3] overflow-hidden bg-white">
                          <img 
                            src={productImage} 
                            alt={productLabel}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                          />
                          <div className="absolute inset-0 bg-maroon-deep/0 group-hover:bg-maroon-deep/10 transition-colors duration-500"></div>
                        </div>
                        <div className="p-8 text-center bg-white border border-white-card border-t-0 group-hover:border-gold-soft transition-colors">
                          <h4 className="text-xl font-serif text-maroon-deep mb-3 group-hover:text-gold transition-colors duration-300">
                            {productLabel}
                          </h4>
                          <span className="inline-block text-xs font-bold uppercase tracking-widest text-maroon-deep/60 group-hover:text-maroon-deep transition-colors duration-300 border-b border-transparent group-hover:border-maroon-deep">
                            View Collection
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

    </section>
  )
}

export default CreativeProductShowcase
