'use client'

import React, { useEffect, useRef } from 'react'
import { useScrollReveal, revealClass } from '@/hooks/useScrollReveal'

/**
 * IndustriesMotionSlider — Infinite horizontal scrolling product gallery.
 * Ported from SUPREME's #motion-test section.
 * Smooth CSS-driven infinite loop of product images.
 */

const SLIDES = [
  { src: '/FMCG IMAGES/Pastas/pasta (5).png', alt: 'Premium Pasta' },
  { src: '/FMCG IMAGES/Snacks/Chips and Crisps/chips and crisp.png', alt: 'Chips & Crisps' },
  { src: '/FMCG IMAGES/Culinary/Seasoning,Spices and Marinade/SPices.png', alt: 'Spices & Seasoning' },
  { src: '/FMCG IMAGES/Culinary/Cooking Oil, Fats and Dressing/cooking oil.png', alt: 'Cooking Oil' },
  { src: '/FMCG IMAGES/Beverages/Carbonated/carbonated.png', alt: 'Carbonated Beverages' },
  { src: '/FMCG IMAGES/Frozen Foods/Chicken Nuggets/chicken nuggets.png', alt: 'Frozen Foods' },
]

const IndustriesMotionSlider: React.FC = () => {
  const trackRef = useRef<HTMLDivElement>(null)
  const { ref: sectionRef, isVisible } = useScrollReveal()

  useEffect(() => {
    const track = trackRef.current
    if (!track) return

    let animId: number
    let position = 0
    const speed = 0.4 // pixels per frame

    const animate = () => {
      position -= speed
      const slideWidth = track.scrollWidth / 2
      if (Math.abs(position) >= slideWidth) {
        position = 0
      }
      track.style.transform = `translateX(${position}px)`
      animId = requestAnimationFrame(animate)
    }

    animId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animId)
  }, [])

  return (
    <section ref={sectionRef} className="bg-[#F5F1E8] py-24 overflow-hidden">
      <div className={`max-w-[1200px] mx-auto px-6 mb-12 ${revealClass(isVisible, 'up')}`}>
        <div className="text-xs font-bold text-[#C3A35E] uppercase tracking-[0.2em] mb-4">
          INDUSTRIES
        </div>
        <h2
          className="text-3xl md:text-4xl font-bold text-[#6B1F2B] mb-3 leading-[1.1]"
          style={{ letterSpacing: '-0.03em' }}
        >
          Designed to scale across categories.
        </h2>
        <p className="text-base text-[#6B1F2B]/60 max-w-[600px] leading-relaxed">
          A consistent operating rhythm — like Apple — with category depth — like M&S.
        </p>
      </div>

      {/* Infinite slider track */}
      <div className="relative w-full overflow-hidden">
        <div
          ref={trackRef}
          className="flex gap-6 will-change-transform"
          style={{ width: 'max-content' }}
        >
          {/* Double the slides for seamless infinite loop */}
          {[...SLIDES, ...SLIDES].map((slide, idx) => (
            <div
              key={idx}
              className="flex-shrink-0 w-[400px] h-[280px] overflow-hidden"
              style={{ borderRadius: 0 }}
            >
              <img
                src={slide.src}
                alt={slide.alt}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default IndustriesMotionSlider
