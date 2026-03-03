'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useTranslations, useLocale } from 'next-intl'
import type { ProductCategory } from '@/data/folderBasedProducts'

interface ProductSliderProps {
  categories: ProductCategory[]
}

const ProductSlider: React.FC<ProductSliderProps> = ({ categories }) => {
  const t = useTranslations()
  const locale = useLocale()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const sliderRef = useRef<HTMLDivElement>(null)
  const timeoutRefs = useRef<NodeJS.Timeout[]>([])

  const displayCategories = (categories || []).slice(0, 6)

  // Cleanup all timeouts on unmount
  useEffect(() => {
    return () => {
      timeoutRefs.current.forEach(timeout => clearTimeout(timeout))
      timeoutRefs.current = []
    }
  }, [])

  // Auto-sliding removed - images stay static
  // Users can manually navigate using arrows or dots

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
    setIsAutoPlaying(false)
    const timeout = setTimeout(() => setIsAutoPlaying(true), 8000) // Resume after 8 seconds
    timeoutRefs.current.push(timeout)
  }

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? displayCategories.length - 1 : prev - 1))
    setIsAutoPlaying(false)
    const timeout = setTimeout(() => setIsAutoPlaying(true), 8000)
    timeoutRefs.current.push(timeout)
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % displayCategories.length)
    setIsAutoPlaying(false)
    const timeout = setTimeout(() => setIsAutoPlaying(true), 8000)
    timeoutRefs.current.push(timeout)
  }

  return (
    <section className="relative py-16 md:py-24 px-4 md:px-6 bg-white-soft overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-20 w-96 h-96 bg-maroon-deep rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-maroon-deep rounded-full blur-3xl animate-pulse-slow" style={{animationDelay: '2s'}}></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#6B1F2B] mb-4 font-display">
            {t('products.ourProducts')}
          </h2>
          <p className="text-lg md:text-xl text-maroon max-w-2xl mx-auto">
            {t('products.discoverPremium')}
          </p>
        </div>

        {/* Slider Container */}
        <div className="relative" ref={sliderRef}>
          {/* Slider */}
          <div className="relative h-[300px] sm:h-[400px] md:h-[500px] lg:h-[600px] rounded-xl md:rounded-2xl overflow-hidden shadow-2xl">
            {displayCategories.map((category, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-all duration-700 ease-in-out ${
                  index === currentIndex
                    ? 'opacity-100 scale-100 z-10'
                    : 'opacity-0 scale-95 z-0'
                }`}
              >
                <Link href={`/${locale}${category.url}`} className="block h-full w-full">
                  <div className="relative h-full w-full">
                    {/* Background Image */}
                    <img
                      src={category.image || '/Images/logo.png'}
                      alt={t(`products.${category.key}`)}
                      className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                    />
                    
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-maroon-deep/80 via-maroon-deep/60 to-transparent"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-maroon-deep/90 via-transparent to-transparent"></div>
                    
                    {/* Content */}
                    <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-12 lg:p-16">
                      <div className="max-w-2xl">
                        <div className="flex items-center space-x-4 mb-4">
                          <span className="text-5xl md:text-6xl lg:text-7xl">{category.icon}</span>
                          <h3 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white font-serif drop-shadow-2xl">
                            {t(`products.${category.key}`)}
                          </h3>
                        </div>
                        <p className="text-lg md:text-xl lg:text-2xl text-white/90 mb-6 leading-relaxed">
                          {t(`products.${category.key}Desc`)}
                        </p>
                        <div className="flex items-center space-x-2 text-white font-semibold group">
                          <span className="text-base md:text-lg">Explore {t(`products.${category.key}`)}</span>
                          <svg className="w-5 h-5 md:w-6 md:h-6 group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={goToPrevious}
            className="absolute left-2 sm:left-4 md:left-6 top-1/2 transform -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-white/20 backdrop-blur-sm hover:bg-white/30 border-2 border-gold/30 hover:border-white/50 rounded-full flex items-center justify-center text-white shadow-2xl hover:scale-110 transition-all duration-300 group"
            aria-label="Previous slide"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 group-hover:-translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <button
            onClick={goToNext}
            className="absolute right-2 sm:right-4 md:right-6 top-1/2 transform -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-white/20 backdrop-blur-sm hover:bg-white/30 border-2 border-gold/30 hover:border-white/50 rounded-full flex items-center justify-center text-white shadow-2xl hover:scale-110 transition-all duration-300 group"
            aria-label="Next slide"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Dots Indicator */}
          <div className="flex justify-center space-x-2 sm:space-x-3 mt-4 sm:mt-6 md:mt-8">
            {displayCategories.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`transition-all duration-300 rounded-full ${
                  index === currentIndex
                    ? 'w-8 md:w-10 h-3 md:h-4 bg-white shadow-lg'
                    : 'w-3 md:w-4 h-3 md:h-4 bg-white/40 hover:bg-white/60'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default ProductSlider

