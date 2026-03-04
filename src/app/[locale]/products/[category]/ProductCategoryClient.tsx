'use client'

import React from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import type { Subcategory } from '@/utils/folderScanner'

interface ProductCategoryClientProps {
  subcategories: Subcategory[]
  categoryTitle: string
  categoryDescription: string
  locale: string
  categoryKey: string
}

const ProductCategoryClient: React.FC<ProductCategoryClientProps> = ({
  subcategories,
  categoryTitle,
  categoryDescription,
  locale,
  categoryKey
}) => {
  const t = useTranslations('products')

  // Use site's design guidelines - golden gradient
  const siteGradient = 'from-[#ffffff] via-[#ffffff] to-[#ffffff]'
  const siteBgGradient = 'from-[#6B1F2B] via-[#6B1F2B] to-[#2a0005]'

  // Get a representative image for the category hero
  const getBackgroundImage = () => {
    if (subcategories.length > 0 && subcategories[0].images.length > 0) {
      return subcategories[0].images[0]
    }
    return '/Images/logo.png'
  }

  return (
    <>
      {/* Breadcrumb */}
      <section className="py-3 sm:py-4 md:py-8 bg-[#6B1F2B] relative overflow-hidden border-b border-[#C3A35E]/20">
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm md:text-base">
            <Link href={`/${locale}/products`} className="text-white hover:text-[#C3A35E]/90 transition-colors duration-300 flex items-center space-x-1 font-bold">
              <span className="text-sm sm:text-base">←</span>
              <span className="hidden sm:inline">{t('pageTitle') || 'Products'}</span>
              <span className="sm:hidden">Products</span>
            </Link>
            <span className="text-white/60 mx-1">/</span>
            <span className="text-white font-bold truncate text-xs sm:text-sm md:text-base">{categoryTitle}</span>
          </nav>
        </div>
      </section>

      {/* Category Hero - Category-Specific Colors - Compact */}
      <section className="relative py-6 sm:py-8 md:py-12 lg:py-16 overflow-hidden min-h-[180px] sm:min-h-[200px] md:min-h-[250px] lg:min-h-[300px] bg-[#6B1F2B]">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src={getBackgroundImage()}
            alt={categoryTitle}
            className="w-full h-full object-cover opacity-60"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/Images/logo.png';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#6B1F2B] via-[#6B1F2B]/50 to-transparent"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-fade-in-up">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-2 sm:mb-3 md:mb-4 font-serif drop-shadow-2xl">
              {categoryTitle}
            </h1>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed font-semibold">
              {categoryDescription}
            </p>
          </div>
        </div>
      </section>

      {/* Subcategories Grid - Site Design Guidelines */}
      <section className="py-8 sm:py-12 md:py-16 lg:py-20 bg-[#F5F1E8] relative overflow-hidden">
        
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-6 sm:mb-8 md:mb-12 lg:mb-16">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-[#6B1F2B] mb-4 sm:mb-6 font-serif">
              {t('subcategories') || 'Subcategories'}
            </h2>
            <div className="w-20 sm:w-24 h-1 bg-[#6B1F2B] mx-auto mt-4 sm:mt-6"></div>
          </div>

          {subcategories.length > 0 ? (
            <div className="px-[2px] sm:px-2">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5" style={{gap: '2px'}}>
                {subcategories.map((subcategory, index) => (
                  <Link
                    key={index}
                    href={`/${locale}/products/${categoryKey}/${subcategory.slug}`}
                    className="group relative aspect-square overflow-hidden hover:scale-105 transition-all duration-500 bg-white shadow-sm"
                  >
                    {/* Subcategory Image - Full Square, Full Width */}
                    <div className="absolute inset-0">
                      <img
                        src={subcategory.images[0] || '/Images/logo.png'}
                        alt={subcategory.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        loading="lazy"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/Images/logo.png';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
                    </div>
                    
                    {/* Subcategory Name at Bottom with Background */}
                    <div className="absolute bottom-0 left-0 right-0">
                      <div className="bg-white/95 backdrop-blur-sm px-3 py-3 lg:px-4 lg:py-4 border-t border-gray-100">
                        <h4 className="text-sm sm:text-lg lg:text-xl font-bold text-[#6B1F2B] group-hover:text-[#2a0006] transition-colors duration-300 line-clamp-2 text-center">
                          {subcategory.name}
                        </h4>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-16 px-6">
              <div className="max-w-md mx-auto">
                <div className="text-6xl mb-4">📦</div>
                <p className="text-lg text-[#6B1F2B] font-semibold mb-2">
                  No subcategories available
                </p>
                <p className="text-sm text-gray-600">
                  Check back soon for new subcategories in this category!
                </p>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  )
}

export default ProductCategoryClient
