'use client'

import React, { useEffect, useRef } from 'react'
import { useScrollReveal, revealClass } from '@/hooks/useScrollReveal'

const SLIDES = [
  { src: '/assets/verticals/02-fmcg/categories/pastas/pasta (5).png', alt: 'Premium Pasta' },
  { src: '/assets/verticals/02-fmcg/categories/snacks/chips-and-crisps/chips and crisp.png', alt: 'Chips & Crisps' },
  { src: '/assets/verticals/02-fmcg/categories/culinary/seasoning-spices-and-marinade/SPices.png', alt: 'Spices & Seasoning' },
  { src: '/assets/verticals/02-fmcg/categories/culinary/cooking-oil-fats-and-dressing/cooking oil.png', alt: 'Cooking Oil' },
  { src: '/assets/verticals/02-fmcg/categories/beverages/carbonated/carbonated.png', alt: 'Carbonated Beverages' },
  { src: '/assets/verticals/02-fmcg/categories/frozen-foods/chicken-nuggets/chicken nuggets.png', alt: 'Frozen Foods' },
]

const IndustriesMotionSlider: React.FC = () => {
  const { ref: sectionRef, isVisible } = useScrollReveal()
  const trackRef = useRef<HTMLDivElement>(null)

  // Pause CSS animation when section is off-screen to save GPU
  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    track.style.animationPlayState = isVisible ? 'running' : 'paused'
  }, [isVisible])

  return (
    <section ref={sectionRef} className="bg-white py-24 overflow-hidden">
      <style>{`
        @keyframes silk-scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .silk-track {
          display: flex;
          gap: 1.5rem;
          width: max-content;
          animation: silk-scroll 28s linear infinite;
          will-change: transform;
        }
        .silk-track:hover {
          animation-play-state: paused;
        }
      `}</style>

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

      <div className="relative w-full overflow-hidden">
        {/* Fade edges */}
        <div className="pointer-events-none absolute left-0 top-0 h-full w-24 z-10"
          style={{ background: 'linear-gradient(to right, white, transparent)' }} />
        <div className="pointer-events-none absolute right-0 top-0 h-full w-24 z-10"
          style={{ background: 'linear-gradient(to left, white, transparent)' }} />

        <div ref={trackRef} className="silk-track">
          {[...SLIDES, ...SLIDES].map((slide, idx) => (
            <div
              key={idx}
              className="flex-shrink-0 w-[400px] h-[280px] overflow-hidden rounded-sm"
            >
              <img
                src={slide.src}
                alt={slide.alt}
                width={400}
                height={280}
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
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
