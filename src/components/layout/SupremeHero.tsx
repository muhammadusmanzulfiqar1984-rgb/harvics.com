'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useLocale } from 'next-intl'

/**
 * SupremeHero — Premium hero slider with smooth Ken Burns effect.
 * Features parallax zoom, elegant transitions, and refined typography.
 */

const slides = [
  {
    img: '/assets/verticals/02-fmcg/categories/pastas/pasta (5).png',
    alt: 'Premium Pasta Selection',
    tagline: 'Authentic Italian Heritage',
  },
  {
    img: '/assets/verticals/02-fmcg/categories/confectionery/jelly/bearpops.jpg',
    alt: 'Confectionary Delights',
    tagline: 'Sweet Moments of Joy',
  },
  {
    img: '/assets/verticals/02-fmcg/categories/bakery/wafer-and-wafer-bars/wafer3.jpg',
    alt: 'Quality Bakery Items',
    tagline: 'Crafted with Excellence',
  },
]

const SupremeHero: React.FC = () => {
  const locale = useLocale()
  const [current, setCurrent] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [progress, setProgress] = useState(0)

  // Ken Burns animation direction alternates
  const [animationDirection, setAnimationDirection] = useState<'in' | 'out'>('in')

  useEffect(() => {
    const loadTimer = setTimeout(() => setIsLoaded(true), 100)
    return () => clearTimeout(loadTimer)
  }, [])

  const goToSlide = useCallback((index: number) => {
    if (isTransitioning || index === current) return
    setIsTransitioning(true)
    setAnimationDirection(prev => prev === 'in' ? 'out' : 'in')
    setCurrent(index)
    setProgress(0)
    setTimeout(() => setIsTransitioning(false), 800)
  }, [current, isTransitioning])

  // Auto-advance with progress tracking
  useEffect(() => {
    const DURATION = 6000
    const TICK = 30
    let elapsed = 0
    const timer = setInterval(() => {
      elapsed += TICK
      setProgress(Math.min((elapsed / DURATION) * 100, 100))
      if (elapsed >= DURATION) {
        goToSlide((current + 1) % slides.length)
        elapsed = 0
      }
    }, TICK)
    return () => clearInterval(timer)
  }, [current, goToSlide])

  const prev = () => goToSlide((current - 1 + slides.length) % slides.length)
  const next = () => goToSlide((current + 1) % slides.length)

  return (
    <section className="relative w-full h-[75vh] min-h-[550px] overflow-hidden bg-white">
      {/* Slides with Ken Burns effect */}
      {slides.map((slide, idx) => (
        <div
          key={idx}
          className="absolute inset-0"
          style={{
            opacity: idx === current ? 1 : 0,
            zIndex: idx === current ? 10 : 0,
            transition: 'opacity 1.2s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          <div
            className="w-full h-full"
            style={{
              animation: idx === current 
                ? `kenBurns${animationDirection === 'in' ? 'In' : 'Out'} 8s ease-out forwards` 
                : 'none',
            }}
          >
            <img
              src={slide.img}
              alt={slide.alt}
              className="w-full h-full object-cover"
              loading={idx === 0 ? 'eager' : 'lazy'}
            />
          </div>
          {/* Multi-layer gradient for depth */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-black/15" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/5 via-transparent to-transparent" />
        </div>
      ))}

      {/* Floating particles effect */}
      <div className="absolute inset-0 z-15 pointer-events-none overflow-hidden">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: `${2 + (i % 3)}px`,
              height: `${2 + (i % 3)}px`,
              background: `rgba(195,163,94,${0.15 + (i % 3) * 0.08})`,
              left: `${10 + i * 11}%`,
              animation: `floatParticle ${7 + i * 1.5}s ease-in-out infinite`,
              animationDelay: `${i * 0.7}s`,
            }}
          />
        ))}
      </div>

      {/* Overlay Card — Refined glassmorphism */}
      <div className={`absolute inset-0 z-20 flex items-center justify-center transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div
          className="relative bg-white/80 backdrop-blur-2xl border border-white/60 p-12 max-w-xl text-center group"
          style={{ 
            boxShadow: '0 8px 32px rgba(107, 31, 43, 0.08), 0 2px 8px rgba(195, 163, 94, 0.12)',
          }}
        >
          {/* Decorative corner accents */}
          <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-harvics-gold/50 transition-all duration-500 group-hover:w-8 group-hover:h-8" />
          <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-harvics-gold/50 transition-all duration-500 group-hover:w-8 group-hover:h-8" />
          <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-harvics-gold/50 transition-all duration-500 group-hover:w-8 group-hover:h-8" />
          <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-harvics-gold/50 transition-all duration-500 group-hover:w-8 group-hover:h-8" />
          
          {/* Dynamic tagline */}
          <div className="overflow-hidden h-5 mb-3">
            <div 
              className="text-[#C3A35E] text-xs font-bold uppercase tracking-[0.25em] transition-transform duration-700"
              style={{ transform: isTransitioning ? 'translateY(-100%)' : 'translateY(0)' }}
            >
              {slides[current].tagline}
            </div>
          </div>
          
          <h1 className="text-3xl md:text-4xl lg:text-[42px] font-semibold text-[#6B1F2B] mb-5 leading-[1.15]" style={{ letterSpacing: '-0.025em' }}>
            Intelligence-led sourcing.<br />Built for scale.
          </h1>
          <p className="text-sm md:text-[15px] text-[#6B1F2B]/65 mb-8 leading-relaxed font-light max-w-md mx-auto">
            A disciplined operating system for global supply chains — from strategy
            and development to quality, logistics and delivery.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              href={`/${locale}/contact`}
              className="relative inline-block px-8 py-3.5 bg-[#6B1F2B] text-white text-sm font-semibold overflow-hidden group/btn transition-all duration-300 hover:shadow-lg hover:shadow-[#6B1F2B]/20"
            >
              <span className="relative z-10">Request Quote</span>
              <div className="absolute inset-0 bg-[#5a1a24] transform -translate-x-full group-hover/btn:translate-x-0 transition-transform duration-300" />
            </Link>
            <Link
              href={`/${locale}/textiles`}
              className="relative inline-block px-8 py-3.5 bg-transparent text-[#6B1F2B] text-sm font-semibold border-2 border-[#6B1F2B] overflow-hidden group/btn transition-all duration-300 hover:text-white"
            >
              <span className="relative z-10">Explore Industries</span>
              <div className="absolute inset-0 bg-[#6B1F2B] transform -translate-x-full group-hover/btn:translate-x-0 transition-transform duration-300" />
            </Link>
          </div>
        </div>
      </div>

      {/* Navigation Arrows — Elegant minimal style */}
      <button
        onClick={prev}
        disabled={isTransitioning}
        className="absolute left-6 top-1/2 -translate-y-1/2 z-30 w-12 h-12 flex items-center justify-center text-white/70 hover:text-white bg-black/15 hover:bg-black/30 backdrop-blur-sm transition-all duration-300 disabled:opacity-50 group"
        aria-label="Previous Slide"
      >
        <svg className="w-5 h-5 transform group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        onClick={next}
        disabled={isTransitioning}
        className="absolute right-6 top-1/2 -translate-y-1/2 z-30 w-12 h-12 flex items-center justify-center text-white/70 hover:text-white bg-black/15 hover:bg-black/30 backdrop-blur-sm transition-all duration-300 disabled:opacity-50 group"
        aria-label="Next Slide"
      >
        <svg className="w-5 h-5 transform group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Dots with progress indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex gap-2.5">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => goToSlide(idx)}
            disabled={isTransitioning}
            className="relative h-1.5 transition-all duration-500 disabled:cursor-default group"
            style={{ width: idx === current ? '32px' : '6px' }}
            aria-label={`Slide ${idx + 1}`}
          >
            {/* Background track */}
            <div className={`absolute inset-0 transition-colors duration-300 ${
              idx === current ? 'bg-white/25' : 'bg-white/40 group-hover:bg-white/60'
            }`} />
            {/* Active progress fill */}
            {idx === current && (
              <div
                className="absolute inset-y-0 left-0 bg-[#C3A35E]"
                style={{ width: `${progress}%`, transition: 'width 0.05s linear' }}
              />
            )}
          </button>
        ))}
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes kenBurnsIn {
          0% { transform: scale(1); }
          100% { transform: scale(1.08); }
        }
        @keyframes kenBurnsOut {
          0% { transform: scale(1.08); }
          100% { transform: scale(1); }
        }
        @keyframes floatParticle {
          0%, 100% { transform: translateY(100vh) rotate(0deg); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(-10vh) rotate(360deg); opacity: 0; }
        }
      `}</style>
    </section>
  )
}

export default SupremeHero
