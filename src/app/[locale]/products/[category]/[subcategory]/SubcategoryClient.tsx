'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import Lightbox from '@/components/ui/Lightbox'

interface SubcategoryClientProps {
  images: string[]
  categoryTitle: string
  subcategoryTitle: string
  locale: string
  categoryKey: string
  subcategorySlug: string
}

const SubcategoryClient: React.FC<SubcategoryClientProps> = ({
  images,
  categoryTitle,
  subcategoryTitle,
  locale,
  categoryKey,
  subcategorySlug
}) => {
  const [lightboxImage, setLightboxImage] = useState<string | null>(null)
  const [lightboxAlt, setLightboxAlt] = useState<string>('')
  const t = useTranslations('products')

  // Use site's design guidelines - golden gradient
  const siteGradient = 'from-[#ffffff] via-[#ffffff] to-[#ffffff]'

  // Get a representative image for the hero
  const getBackgroundImage = () => {
    if (images.length > 0) {
      return images[0]
    }
    return '/Images/logo.png'
  }

  return (
    <>
      {/* Breadcrumb */}
      <section className="py-3 sm:py-4 md:py-8 px-3 sm:px-4 md:px-6 bg-[#6B1F2B] relative overflow-hidden border-b border-[#C3A35E]/20">
        <div className="relative z-10 max-w-7xl mx-auto">
          <nav className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm md:text-base flex-wrap">
            <Link href={`/${locale}/products`} className="text-white hover:text-[#C3A35E]/90 transition-colors duration-300 flex items-center space-x-1 font-bold">
              <span className="text-sm sm:text-base">←</span>
              <span className="hidden sm:inline">{t('pageTitle') || 'Products'}</span>
              <span className="sm:hidden">Products</span>
            </Link>
            <span className="text-white/60 mx-1">/</span>
            <Link href={`/${locale}/products/${categoryKey}`} className="text-white hover:text-[#C3A35E]/90 transition-colors duration-300 truncate max-w-[120px] sm:max-w-none font-bold">
              {categoryTitle}
            </Link>
            <span className="text-white/60 mx-1">/</span>
            <span className="text-white font-bold truncate max-w-[120px] sm:max-w-none">{subcategoryTitle}</span>
          </nav>
        </div>
      </section>

      {/* Subcategory Hero */}
      <section className="relative py-6 sm:py-8 md:py-12 lg:py-16 overflow-hidden min-h-[180px] sm:min-h-[200px] md:min-h-[250px] lg:min-h-[300px] bg-[#6B1F2B]">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src={getBackgroundImage()}
            alt={subcategoryTitle}
            className="w-full h-full object-cover opacity-60"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/Images/logo.png';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#6B1F2B] via-[#6B1F2B]/50 to-transparent"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto text-center">
          <div className="animate-fade-in-up">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-2 sm:mb-3 md:mb-4 font-serif drop-shadow-2xl px-4">
              {subcategoryTitle}
            </h1>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed px-4 font-semibold">
              {categoryTitle}
            </p>
          </div>
        </div>
      </section>

      {/* Products Grid - Site Design Guidelines */}
      <section className="py-8 sm:py-12 md:py-16 lg:py-20 bg-[#F8F9FA] relative overflow-hidden">
        
        <div className="relative z-10 w-full">
          {images.length > 0 ? (
            <div className="px-[2px] sm:px-2">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5" style={{gap: '2px'}}>
                {images.map((image, index) => {
                  const imageName = image.split('/').pop()?.replace(/\.[^/.]+$/, '') || `Product ${index + 1}`
                  return (
                    <div
                      key={index}
                      className="group relative aspect-square overflow-hidden hover:scale-105 transition-all duration-500 cursor-pointer bg-white"
                      onClick={() => {
                        setLightboxImage(image)
                        setLightboxAlt(imageName)
                      }}
                    >
                      {/* Product Image - Full Square, Full Width */}
                      <div className="absolute inset-0">
                        <img
                          src={image}
                          alt={imageName}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          loading="lazy"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/Images/logo.png';
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            <div className="text-center py-16 px-6">
              <div className="max-w-md mx-auto">
                <div className="text-6xl mb-4">📦</div>
                <p className="text-lg text-[#6B1F2B] font-semibold mb-2">
                  No products available
                </p>
                <p className="text-sm text-gray-600">
                  Check back soon for new products in this subcategory!
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Lightbox */}
      <Lightbox
        isOpen={!!lightboxImage}
        onClose={() => setLightboxImage(null)}
        imageSrc={lightboxImage || ''}
        imageAlt={lightboxAlt}
      />
    </>
  )
}

export default SubcategoryClient

