'use client'

import React from 'react'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import { useScrollReveal, revealClass } from '@/hooks/useScrollReveal'

/**
 * WhoWeAre — "Built for complex categories" split section.
 * Ported from SUPREME's #who-we-are section.
 * Left: headline + description + CTAs. Right: 2 stacked product images.
 */
const WhoWeAre: React.FC = () => {
  const locale = useLocale()
  const { ref, isVisible } = useScrollReveal()

  return (
    <section ref={ref} className="bg-[#F5F1E8] py-24 px-6">
      <div className="max-w-[1200px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left — Copy */}
          <div className={revealClass(isVisible, 'left')}>
            <div className="text-xs font-bold text-[#C3A35E] uppercase tracking-[0.2em] mb-4">
              WHO WE ARE
            </div>
            <h2
              className="text-4xl md:text-5xl font-bold text-[#6B1F2B] mb-6 leading-[1.1]"
              style={{ letterSpacing: '-0.03em' }}
            >
              Built for complex categories.
            </h2>
            <p className="text-lg text-[#6B1F2B]/70 leading-relaxed mb-8 max-w-[540px]">
              Harvics brings structure to high-variety trade — textiles, apparel,
              FMCG, commodities, industrial and energy — with a single quality-first
              execution model.
            </p>
            <div className="flex gap-4 flex-wrap">
              <Link
                href={`/${locale}/about`}
                className="inline-block px-8 py-3.5 bg-[#6B1F2B] text-white text-sm font-semibold border border-[#6B1F2B] hover:bg-[#5a1a24] transition-colors"
                style={{ borderRadius: 0 }}
              >
                Who We Are
              </Link>
              <Link
                href={`/${locale}/contact`}
                className="inline-block px-8 py-3.5 bg-transparent text-[#6B1F2B] text-sm font-semibold border border-[#6B1F2B] hover:bg-[#6B1F2B] hover:text-white transition-colors"
                style={{ borderRadius: 0 }}
              >
                Talk to Us
              </Link>
            </div>
          </div>

          {/* Right — Stacked product images */}
          <div className={`grid grid-cols-2 gap-4 ${revealClass(isVisible, 'right')}`}>
            <div className="overflow-hidden" style={{ borderRadius: 0 }}>
              <img
                src="/FMCG IMAGES/Product Photos/A Pop of Fun in Every Bite!.png"
                alt="Harvics Products"
                className="w-full h-[320px] object-cover hover:scale-105 transition-transform duration-700"
              />
            </div>
            <div className="overflow-hidden mt-8" style={{ borderRadius: 0 }}>
              <img
                src="/FMCG IMAGES/Product Photos/A Pop of Fun in Every Bite! (1).png"
                alt="Harvics Quality"
                className="w-full h-[320px] object-cover hover:scale-105 transition-transform duration-700"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default WhoWeAre
