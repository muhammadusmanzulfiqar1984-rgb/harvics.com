'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useLocale } from 'next-intl'

/**
 * SupremeHero — Matches the Supreme project's hero slider.
 * 3-slide image hero with maroon overlay card, nav arrows, dots.
 */

const slides = [
  {
    img: '/FMCG IMAGES/Pastas/pasta (5).png',
    alt: 'Premium Pasta Selection',
  },
  {
    img: '/FMCG IMAGES/Confectionary/Jelly/bearpops.jpg',
    alt: 'Confectionary Delights',
  },
  {
    img: '/FMCG IMAGES/Bakery/Wafer and Wafer Bars/wafer3.jpg',
    alt: 'Quality Bakery Items',
  },
]

const SupremeHero: React.FC = () => {
  const locale = useLocale()
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const prev = () => setCurrent((c) => (c - 1 + slides.length) % slides.length)
  const next = () => setCurrent((c) => (c + 1) % slides.length)

  return (
    <section className="relative w-full h-[70vh] min-h-[500px] overflow-hidden bg-[#F5F1E8]" style={{ borderRadius: 0 }}>
      {/* Slides */}
      {slides.map((slide, idx) => (
        <div
          key={idx}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            idx === current ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        >
          <img
            src={slide.img}
            alt={slide.alt}
            className="w-full h-full object-cover"
          />
        </div>
      ))}

      {/* Overlay Card */}
      <div className="absolute inset-0 z-20 flex items-center justify-center">
        <div
          className="bg-[#F5F1E8]/90 border border-[#C3A35E]/60 p-10 max-w-xl text-center"
          style={{ borderRadius: 0, boxShadow: 'none', backdropFilter: 'blur(8px)' }}
        >
          <div className="text-[#C3A35E] text-xs font-bold uppercase tracking-[0.2em] mb-3">
            HARVICS
          </div>
          <h1 className="text-3xl md:text-4xl font-semibold text-[#6B1F2B] mb-4 leading-tight" style={{ letterSpacing: '-0.02em' }}>
            Intelligence-led sourcing.<br />Built for scale.
          </h1>
          <p className="text-sm text-[#6B1F2B]/70 mb-6 leading-relaxed font-light">
            A disciplined operating system for global supply chains — from strategy
            and development to quality, logistics and delivery.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link
              href={`/${locale}/contact`}
              className="inline-block px-8 py-3 bg-[#6B1F2B] text-white text-sm font-semibold border border-[#6B1F2B] hover:bg-[#5a1a24] transition-colors"
              style={{ borderRadius: 0 }}
            >
              Request Quote
            </Link>
            <Link
              href={`/${locale}/textiles`}
              className="inline-block px-8 py-3 bg-transparent text-[#6B1F2B] text-sm font-semibold border border-[#6B1F2B] hover:bg-[#6B1F2B] hover:text-white transition-colors"
              style={{ borderRadius: 0 }}
            >
              Explore Industries
            </Link>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-30 text-white/80 hover:text-white text-3xl bg-black/20 w-10 h-10 flex items-center justify-center"
        style={{ borderRadius: 0 }}
        aria-label="Previous Slide"
      >
        &#10094;
      </button>
      <button
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 text-white/80 hover:text-white text-3xl bg-black/20 w-10 h-10 flex items-center justify-center"
        style={{ borderRadius: 0 }}
        aria-label="Next Slide"
      >
        &#10095;
      </button>

      {/* Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex gap-2">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrent(idx)}
            className={`w-2 h-2 transition-all ${
              idx === current
                ? 'bg-[#C3A35E] scale-125'
                : 'bg-white/60 hover:bg-white'
            }`}
            style={{ borderRadius: 0 }}
            aria-label={`Slide ${idx + 1}`}
          />
        ))}
      </div>
    </section>
  )
}

export default SupremeHero
