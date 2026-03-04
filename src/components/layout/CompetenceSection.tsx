'use client'

import React from 'react'
import { useScrollReveal, revealClass } from '@/hooks/useScrollReveal'

/**
 * CompetenceSection — "End-to-end coverage, without chaos."
 * Ported from SUPREME's #competence full-bleed section.
 * Full-width background image with dark overlay and card.
 */
const CompetenceSection: React.FC = () => {
  const { ref, isVisible } = useScrollReveal()

  return (
    <section
      ref={ref}
      className="relative w-full overflow-hidden"
      style={{ minHeight: '85vh' }}
    >
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src="/FMCG IMAGES/Confectionary/Jelly/bearpops.jpg"
          alt="Our Competence"
          className="w-full h-full object-cover"
          style={{ transform: 'scale(1.05)' }}
        />
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(135deg, rgba(107,31,43,0.85) 0%, rgba(107,31,43,0.6) 100%)' }}
        />
      </div>

      {/* Content overlay */}
      <div className="relative z-10 flex items-center min-h-[85vh] px-6">
        <div className="max-w-[1200px] mx-auto w-full">
          <div
            className={`max-w-[600px] bg-[#F5F1E8]/95 p-12 ${revealClass(isVisible, 'up')}`}
            style={{ borderRadius: 0, backdropFilter: 'blur(8px)' }}
          >
            <div className="text-xs font-bold text-[#C3A35E] uppercase tracking-[0.2em] mb-4">
              OUR COMPETENCE
            </div>
            <h2
              className="text-3xl md:text-4xl font-bold text-[#6B1F2B] mb-5 leading-[1.1]"
              style={{ letterSpacing: '-0.03em' }}
            >
              End-to-end coverage, without chaos.
            </h2>
            <p className="text-base text-[#6B1F2B]/70 leading-relaxed">
              We translate your category goals into factories, materials, compliance,
              inspection, freight and delivery — with consistent controls at every step.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default CompetenceSection
