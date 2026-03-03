'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import Lightbox from '@/components/ui/Lightbox'

interface Product {
  id: string
  name: string
  description: string
  image: string
  weight?: string
  subcategory?: string
}

interface ProductLineClientProps {
  products: Product[]
  productLineTitle: string
  productLineDescription: string
  locale: string
  productLineKey: string
}

const ProductLineClient: React.FC<ProductLineClientProps> = ({
  products,
  productLineTitle,
  productLineDescription,
  locale,
  productLineKey
}) => {
  const [lightboxImage, setLightboxImage] = useState<string | null>(null)
  const [lightboxAlt, setLightboxAlt] = useState<string>('')
  const t = useTranslations('products')

  // Get a representative image for the product line hero
  const getHeroImage = () => {
    if (products.length > 0) {
      return products[0].image
    }
    return '/Images/logo.png' // Fallback
  }

  return (
    <>
      {/* Breadcrumb */}
      <section className="py-8 px-6 bg-gradient-to-r from-red-100 via-red-50 to-red-100 dark:from-red-800 dark:via-red-900 dark:to-red-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-red-400/5 to-transparent"></div>
        <div className="relative z-10 max-w-7xl mx-auto">
          <nav className="flex items-center space-x-2 text-sm">
            <Link href={`/${locale}/products`} className="text-black dark:text-black hover:text-red-600 dark:hover:text-red-400 transition-colors duration-300 flex items-center space-x-1">
              <span>←</span>
              <span>{t('pageTitle')}</span>
            </Link>
            <span className="text-black">/</span>
            <Link href={`/${locale}/products/confectionery`} className="text-black dark:text-black hover:text-red-600 dark:hover:text-red-400 transition-colors duration-300 flex items-center space-x-1">
              <span>{t('confectionery')}</span>
            </Link>
            <span className="text-black">/</span>
            <span className="font-semibold text-red-600 dark:text-red-400">
              {productLineTitle}
            </span>
          </nav>
        </div>
      </section>

      {/* Product Line Hero with Background */}
      <section className="relative py-24 px-6 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src={getHeroImage()}
            alt={productLineTitle}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/60 to-black/80"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/50"></div>
        </div>

        {/* Floating Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-32 h-32 bg-red-400/10 rounded-full blur-2xl animate-float"></div>
          <div className="absolute bottom-20 right-20 w-48 h-48 bg-red-400/5 rounded-full blur-3xl animate-float" style={{animationDelay: '2s'}}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-red-400/8 rounded-full blur-3xl animate-float" style={{animationDelay: '4s'}}></div>
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto text-center">
          <div className="animate-fade-in-up">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 text-gradient">
              {productLineTitle}
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8 leading-relaxed">
              {productLineDescription}
            </p>

            {/* Product Line Stats */}
            <div className="flex justify-center items-center space-x-8 mb-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-red-400">{products.length}</div>
                <div className="text-sm text-gray-300">Varieties</div>
              </div>
              <div className="w-px h-12 bg-red-400/30"></div>
              <div className="text-center">
                <div className="text-3xl font-bold text-red-400">Unique</div>
                <div className="text-sm text-gray-300">Flavors</div>
              </div>
              <div className="w-px h-12 bg-red-400/30"></div>
              <div className="text-center">
                <div className="text-3xl font-bold text-red-400">Premium</div>
                <div className="text-sm text-gray-300">Quality</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-16 px-6 bg-gradient-to-br from-red-50 via-white to-red-50 dark:from-red-900 dark:via-red-800 dark:to-red-900">
        <div className="max-w-7xl mx-auto">
          {products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
              {products.map((product, index) => (
                <div
                  key={index}
                  className="group relative p-6 rounded-2xl border-2 border-red-400/20 hover:border-red-400/60 transition-all duration-500 hover:scale-105 bg-gradient-to-br from-white/80 to-red-50/60 dark:from-white800/40 dark:to-red-900/60 backdrop-blur-sm shadow-2xl hover:shadow-red-400/20 card-enhanced"
                >
                  <div className="text-center">
                    <div
                      className="w-32 h-32 mx-auto mb-4 rounded-xl overflow-hidden border-2 border-red-400/30 group-hover:border-red-400/60 transition-all duration-500 shadow-lg cursor-pointer"
                      onClick={() => {
                        setLightboxImage(product.image)
                        setLightboxAlt(product.name)
                      }}
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-red-400/0 group-hover:bg-red-400/20 transition-all duration-300"></div>
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="w-6 h-6 bg-red-400/90 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">🔍</span>
                        </div>
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-black dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors duration-300 mb-3">
                      {product.name}
                    </h3>
                    {product.subcategory && (
                      <p className="text-sm text-red-600 dark:text-red-400 font-medium mb-2">
                        {product.subcategory}
                      </p>
                    )}
                    <p className="text-black dark:text-black group-hover:text-black dark:group-hover:text-gray-300 transition-colors duration-300 mb-4">
                      {product.description}
                    </p>
                    {product.weight && (
                      <p className="text-sm text-red-600 dark:text-red-400 font-medium mb-4">
                        {product.weight}
                      </p>
                    )}
                    <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="w-8 h-1 bg-red-400 rounded-full mx-auto"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <h3 className="text-3xl font-bold text-black dark:text-white mb-4">
                Coming Soon
              </h3>
              <p className="text-black dark:text-black mb-8">
                Products in this line will be available soon.
              </p>
              <Link
                href={`/${locale}/products/confectionery`}
                className="inline-flex items-center px-6 py-3 bg-red-500 text-white font-semibold rounded-full hover:bg-red-600 transition-colors duration-300"
              >
                ← Back to Confectionery
              </Link>
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

export default ProductLineClient
