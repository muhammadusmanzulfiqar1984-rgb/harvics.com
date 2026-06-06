'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { useTranslations, useLocale, useMessages } from 'next-intl'
import type { ProductCategory } from '@/data/folderBasedProducts'

interface ProductSliderProps {
  categories: ProductCategory[]
}

const humanize = (key: string) =>
  key
    .replace(/Desc$/, '')
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')

const ProductSlider: React.FC<ProductSliderProps> = ({ categories }) => {
  const t = useTranslations()
  const locale = useLocale()
  const messages = useMessages() as Record<string, any>

  // Check if a dotted key exists in the messages tree before calling t().
  // Prevents next-intl MISSING_MESSAGE errors flooding the console for dynamic
  // API-loaded subcategories that aren't in the translation files.
  const tSafe = (key: string, fallback?: string) => {
    const parts = key.split('.')
    let node: any = messages
    for (const p of parts) {
      if (node && typeof node === 'object' && p in node) {
        node = node[p]
      } else {
        return fallback ?? humanize(parts[parts.length - 1] ?? key)
      }
    }
    return typeof node === 'string' ? node : (fallback ?? humanize(parts[parts.length - 1] ?? key))
  }
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [progress, setProgress] = useState(0)
  const sliderRef = useRef<HTMLDivElement>(null)
  const progressRef = useRef<number>(0)
  const animFrameRef = useRef<number>(0)
  const lastTickRef = useRef<number>(0)

  const displayCategories = (categories || []).slice(0, 6)
  const SLIDE_DURATION = 5000 // ms per slide

  /* ── Autoplay with progress bar ── */
  const tick = useCallback((timestamp: number) => {
    if (!lastTickRef.current) lastTickRef.current = timestamp
    const delta = timestamp - lastTickRef.current
    lastTickRef.current = timestamp

    if (!isPaused) {
      progressRef.current += delta
      const pct = Math.min((progressRef.current / SLIDE_DURATION) * 100, 100)
      setProgress(pct)

      if (progressRef.current >= SLIDE_DURATION) {
        setCurrentIndex(prev => (prev + 1) % displayCategories.length)
        progressRef.current = 0
        setProgress(0)
      }
    }

    animFrameRef.current = requestAnimationFrame(tick)
  }, [isPaused, displayCategories.length])

  useEffect(() => {
    animFrameRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(animFrameRef.current)
  }, [tick])

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
    progressRef.current = 0
    setProgress(0)
    lastTickRef.current = 0
  }

  const goToPrevious = () => {
    goToSlide(currentIndex === 0 ? displayCategories.length - 1 : currentIndex - 1)
  }

  const goToNext = () => {
    goToSlide((currentIndex + 1) % displayCategories.length)
  }

  return (
    <section
      className="relative py-16 md:py-20 px-4 md:px-6 bg-white overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background texture */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, #6B1F2B 1px, transparent 0)',
          backgroundSize: '32px 32px',
        }} />

      <div className="relative z-10 max-w-[1200px] mx-auto">
        {/* Section Header */}
        <div className="text-center mb-10 md:mb-14">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="w-6 h-[2px] bg-[#C3A35E]/50" />
            <span className="text-[10px] font-bold text-[#C3A35E] uppercase tracking-[0.25em]">Featured</span>
            <div className="w-6 h-[2px] bg-[#C3A35E]/50" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-[#6B1F2B] mb-3" style={{ letterSpacing: '-0.02em' }}>
            {t('products.ourProducts')}
          </h2>
          <p className="text-sm text-[#6B1F2B]/45 max-w-lg mx-auto">
            {t('products.discoverPremium')}
          </p>
        </div>

        {/* Slider Container */}
        <div className="relative" ref={sliderRef}>
          {/* Slider */}
          <div className="relative h-[300px] sm:h-[400px] md:h-[480px] lg:h-[540px] overflow-hidden">
            {displayCategories.map((category, index) => (
              <div
                key={index}
                className="absolute inset-0"
                style={{
                  opacity: index === currentIndex ? 1 : 0,
                  transform: index === currentIndex ? 'scale(1)' : 'scale(1.04)',
                  transition: 'opacity 0.8s cubic-bezier(0.4,0,0.2,1), transform 0.8s cubic-bezier(0.4,0,0.2,1)',
                  zIndex: index === currentIndex ? 10 : 0,
                }}
              >
                <Link href={`/${locale}${category.url}`} className="block h-full w-full">
                  <div className="relative h-full w-full">
                    <img
                      src={category.image || '/assets/brand/photo/logo.png'}
                      alt={tSafe(`products.${category.key}`, category.name)}
                      className="w-full h-full object-cover"
                      loading={index === 0 ? 'eager' : 'lazy'}
                    />
                    {/* Gradient overlays */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#6B1F2B]/75 via-[#6B1F2B]/40 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#6B1F2B]/80 via-transparent to-transparent" />

                    {/* Content */}
                    <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-12 lg:p-14">
                      <div className="max-w-2xl">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="text-4xl md:text-5xl">{category.icon}</span>
                          <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white" style={{ letterSpacing: '-0.02em' }}>
                            {tSafe(`products.${category.key}`, category.name)}
                          </h3>
                        </div>
                        <p className="text-sm md:text-base text-white/70 mb-5 leading-relaxed max-w-lg">
                          {tSafe(`products.${category.key}Desc`, category.description)}
                        </p>
                        <div className="inline-flex items-center gap-1.5 text-white/90 text-sm font-semibold group">
                          <span>Explore {tSafe(`products.${category.key}`, category.name)}</span>
                          <svg className="w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            ))}

            {/* Progress bar overlay at bottom of slide */}
            <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-white/10 z-20">
              <div
                className="h-full bg-[#C3A35E]"
                style={{
                  width: `${progress}%`,
                  transition: isPaused ? 'none' : 'width 0.1s linear',
                }}
              />
            </div>
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={goToPrevious}
            className="absolute left-3 md:left-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 bg-white/10 backdrop-blur-sm hover:bg-white/25 border border-white/15 hover:border-[#C3A35E]/40 flex items-center justify-center text-white transition-all duration-300 group"
            aria-label="Previous slide"
          >
            <svg className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            onClick={goToNext}
            className="absolute right-3 md:right-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 bg-white/10 backdrop-blur-sm hover:bg-white/25 border border-white/15 hover:border-[#C3A35E]/40 flex items-center justify-center text-white transition-all duration-300 group"
            aria-label="Next slide"
          >
            <svg className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Dot Indicators — gold active state */}
          <div className="flex justify-center gap-2 mt-5">
            {displayCategories.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className="relative h-2 transition-all duration-400 group"
                style={{ width: index === currentIndex ? '28px' : '8px' }}
                aria-label={`Go to slide ${index + 1}`}
              >
                <div
                  className="absolute inset-0 transition-all duration-400"
                  style={{
                    background: index === currentIndex ? '#C3A35E' : 'rgba(107,31,43,0.2)',
                  }}
                />
                {/* Hover ring */}
                <div className="absolute -inset-1 border border-transparent group-hover:border-[#C3A35E]/30 transition-colors duration-200" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default ProductSlider

