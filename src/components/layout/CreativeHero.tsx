'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useTranslations, useLocale } from 'next-intl'
import type { ProductCategory } from '@/data/folderBasedProducts'

interface CreativeHeroProps {
  categories: ProductCategory[]
}

const CreativeHero: React.FC<CreativeHeroProps> = ({ categories }) => {
  const t = useTranslations('home')
  const locale = useLocale()
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Use categories from props, limit to 4 for the slider
  const slides = (categories || []).slice(0, 4).map(category => ({
    name: category.name,
    icon: category.icon,
    color: category.color,
    href: `/${locale}${category.url}`,
    image: category.image || '/Images/logo.png',
    description: category.description || 'Premium Quality Products'
  }))

  // Auto-sliding functionality
  useEffect(() => {
    if (slides.length <= 1 || isPaused) {
      return
    }

    const slideInterval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 6000)

    return () => {
      clearInterval(slideInterval)
    }
  }, [slides.length, isPaused])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
    setIsPaused(true)
    setTimeout(() => setIsPaused(false), 5000)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
    setIsPaused(true)
    setTimeout(() => setIsPaused(false), 5000)
  }

  return (
    <section className="relative w-full h-[600px] lg:h-[700px] overflow-hidden bg-gradient-to-br from-maroon to-maroon-deep">
      {/* Background Slider */}
      <div className="absolute inset-0 w-full h-full">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            {/* Split Layout Background */}
            <div className="absolute inset-0 flex">
              {/* Left Side - Solid Color/Pattern */}
              <div className="w-full lg:w-1/2 bg-maroon-deep relative overflow-hidden">
                <div className="absolute inset-0 bg-gold/5 opacity-10"></div>
                {/* Decorative Circle */}
                <div className="absolute -left-20 -bottom-20 w-96 h-96 bg-gold/10 rounded-full blur-3xl"></div>
              </div>
              {/* Right Side - Image Background */}
              <div className="hidden lg:block lg:w-1/2 bg-maroon-deep relative">
                 <img 
                    src={slide.image} 
                    alt={slide.name}
                    className="w-full h-full object-cover opacity-60 mix-blend-overlay"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=2574&auto=format&fit=crop'
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-l from-maroon to-maroon-deep"></div>
              </div>
            </div>
            
            {/* Mobile Image (Full Background) */}
            <div className="lg:hidden absolute inset-0">
               <img 
                  src={slide.image} 
                  alt={slide.name}
                  className="w-full h-full object-cover opacity-20"
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=2574&auto=format&fit=crop'
                  }}
                />
            </div>
          </div>
        ))}
      </div>

      {/* Content Container */}
      <div className="relative z-20 h-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-full flex items-center">
          <div className="w-full lg:w-1/2 pr-0 lg:pr-16 pt-12 relative">
            <div className="relative bg-white/85 rounded-xl shadow-xl border-l-4 border-gold px-6 sm:px-8 lg:px-10 py-6 sm:py-8 lg:py-10">
              <div className="mb-8 border-b border-gold/40 pb-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16">
                    <img 
                      src="/Images/logo.png" 
                      alt="Harvics Logo" 
                      className="w-full h-full object-contain brightness-0 invert"
                    />
                  </div>
                  <div>
                    <h2 className="text-2xl text-maroon-deep font-harvics-logo tracking-wide">
                      Harvics Global
                    </h2>
                  </div>
                </div>
                <p className="text-maroon-deep/80 text-sm leading-relaxed max-w-md font-light">
                  {t('brandStatement') || 'A leading global consumer goods company delivering premium food products across diverse categories with international quality standards.'}
                </p>
              </div>

              {slides.map((slide, index) => (
                <div
                  key={index}
                  className={`transition-all duration-700 ease-out transform ${
                    index === currentSlide 
                      ? 'opacity-100 translate-y-0' 
                      : 'opacity-0 translate-y-8 absolute top-[200px] pointer-events-none'
                  }`}
                >
                  <span className="inline-block py-1 px-3 border border-gold text-maroon-deep text-xs font-semibold uppercase tracking-[0.2em] mb-6 rounded-sm bg-white-soft">
                    Premium Selection
                  </span>
                  
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif text-maroon-deep leading-none mb-6">
                    {slide.name}
                  </h1>
                  
                  <p className="text-maroon-deep/80 text-lg sm:text-xl font-light leading-relaxed mb-8 max-w-lg">
                    Experience the finest quality with Harvics. {slide.description}. 
                    Sourced responsibly, delivered with care.
                  </p>
                  
                  <div className="flex flex-wrap gap-4">
                    <Link 
                      href={slide.href}
                      className="bg-maroon-deep text-gold px-8 py-3.5 text-sm uppercase tracking-widest font-semibold border border-gold/70 hover:bg-gold hover:text-maroon-deep transition-colors shadow-md shadow-maroon-deep/30"
                    >
                      Shop Now
                    </Link>
                    <Link 
                      href={`/${locale}/products`}
                      className="bg-maroon-deep text-gold px-8 py-3.5 text-sm uppercase tracking-widest font-semibold border border-gold/40 hover:bg-gold hover:text-maroon-deep transition-colors"
                    >
                      View Range
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Right Side - Image Display (Desktop) */}
          <div className="hidden lg:flex w-1/2 h-full items-center justify-center relative">
             {slides.map((slide, index) => (
                <div 
                  key={index}
                  className={`absolute transition-all duration-1000 ease-out transform ${
                     index === currentSlide 
                    ? 'opacity-100 scale-100 translate-x-0' 
                    : 'opacity-0 scale-95 translate-x-12'
                  }`}
                >
                  <div className="relative w-[500px] h-[500px]">
                    {/* Floating Product Image */}
                    <img 
                      src={slide.image} 
                      alt={slide.name}
                      className="w-full h-full object-contain drop-shadow-2xl"
                      onError={(e) => {
                         // Fallback to an icon if image fails
                         e.currentTarget.style.display = 'none';
                      }}
                    />
                    {/* Fallback Icon if Image is missing/hidden */}
                     <div className="absolute inset-0 flex items-center justify-center pointer-events-none -z-10">
                        <div className="w-[400px] h-[400px] bg-white rounded-full shadow-2xl flex items-center justify-center">
                            {/* If image loads, this is behind. If not, we can show text */}
                        </div>
                     </div>
                  </div>
                </div>
             ))}
          </div>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="absolute bottom-10 left-0 w-full z-30">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-end">
          {/* Dots */}
          <div className="flex space-x-3">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-1 transition-all duration-300 ${
                  index === currentSlide ? 'w-12 bg-gold' : 'w-6 bg-white/30 hover:bg-gold'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
          
          {/* Arrows */}
          <div className="flex gap-2">
            <button 
              onClick={prevSlide}
              className="w-12 h-12 border border-gold/50 text-gold flex items-center justify-center hover:bg-gold hover:text-maroon-deep transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button 
              onClick={nextSlide}
              className="w-12 h-12 border border-gold/50 text-gold flex items-center justify-center hover:bg-gold hover:text-maroon-deep transition-all"
            >
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default CreativeHero
