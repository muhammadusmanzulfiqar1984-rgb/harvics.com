'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import { navVerticals } from '@/data/megaMenuData'
import { useScrollReveal, revealClass } from '@/hooks/useScrollReveal'

/**
 * SupremeIndustryGrid — Displays all 10 industry verticals as a premium grid.
 * Features: staggered reveal, hover lift with gold accent, icon pulse, and gradient overlay.
 */

const industryMeta: Record<string, { icon: string; desc: string }> = {
  textiles:       { icon: '🧵', desc: 'Apparel, fabrics, home textiles and accessories for global markets.' },
  fmcg:           { icon: '🛒', desc: 'Food, personal care, home care and distribution logistics.' },
  commodities:    { icon: '📦', desc: 'Agri, energy, metals, softs and strategic commodities trading.' },
  industrial:     { icon: '🏭', desc: 'Chemicals, machinery, safety equipment and MRO supplies.' },
  minerals:       { icon: '⛏️', desc: 'Metals, energy minerals, precious metals and industrial minerals.' },
  'oil-gas':      { icon: '🛢️', desc: 'Upstream exploration, midstream pipelines, downstream refining.' },
  'real-estate':  { icon: '🏢', desc: 'Commercial, residential, industrial real estate and FM services.' },
  sourcing:       { icon: '🔍', desc: 'Global sourcing, QC, logistics, consulting and OEM/ODM.' },
  finance:        { icon: '💳', desc: 'Trade finance, HPay, invoicing, risk and compliance.' },
  ai:             { icon: '🤖', desc: 'Forecasting, vision, chat, data pipelines and ERP integration.' },
}

const SupremeIndustryGrid: React.FC = () => {
  const locale = useLocale()
  const { ref, isVisible } = useScrollReveal()
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  return (
    <section ref={ref} className={`bg-white py-20 px-4 ${revealClass(isVisible, 'up')}`}>
      <div className="max-w-[1200px] mx-auto">
        {/* Section Header */}
        <div className="text-center mb-14">
          <h2 className="text-3xl font-semibold text-[#6B1F2B] mb-3" style={{ letterSpacing: '-0.02em' }}>
            Industries & Markets
          </h2>
          <p className="text-base text-[#6B1F2B]/50 max-w-[550px] mx-auto leading-relaxed">
            End-to-end supply chain solutions across 10 verticals,
            operating from sourcing through manufacturing to delivery.
          </p>
          <div className="w-12 h-[2px] bg-[#C3A35E]/40 mx-auto mt-5" />
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {navVerticals.map((vertical, i) => {
            const meta = industryMeta[vertical.key] || { icon: '📊', desc: '' }
            const isHovered = hoveredIndex === i
            return (
              <Link
                key={vertical.key}
                href={`/${locale}${vertical.href}`}
                className="group relative bg-white border border-[#C3A35E]/20 p-6 text-center overflow-hidden"
                style={{
                  transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
                  borderColor: isHovered ? '#C3A35E' : undefined,
                  transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
                  boxShadow: isHovered ? '0 12px 32px rgba(107, 31, 43, 0.12), 0 4px 12px rgba(195, 163, 94, 0.08)' : 'none',
                }}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* Top gold accent line — expands on hover */}
                <div
                  className="absolute top-0 left-0 right-0 h-[2px] bg-[#C3A35E]"
                  style={{
                    transform: isHovered ? 'scaleX(1)' : 'scaleX(0)',
                    transformOrigin: 'left',
                    transition: 'transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                />

                {/* Icon with pulse animation on hover */}
                <div
                  className="text-3xl mb-3 inline-block"
                  style={{
                    transition: 'transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
                    transform: isHovered ? 'scale(1.2)' : 'scale(1)',
                    animation: isHovered ? 'iconPulse 1.2s ease-in-out infinite' : 'none',
                  }}
                >
                  {meta.icon}
                </div>

                <h3
                  className="text-sm font-bold uppercase tracking-wide mb-2"
                  style={{
                    color: isHovered ? '#C3A35E' : '#6B1F2B',
                    transition: 'color 0.25s ease',
                  }}
                >
                  {vertical.label}
                </h3>

                <p className="text-xs text-[#6B1F2B]/45 leading-relaxed">
                  {meta.desc}
                </p>

                {/* Subtle bottom arrow that appears on hover */}
                <div
                  className="mt-3 text-xs font-semibold text-[#C3A35E] uppercase tracking-wider"
                  style={{
                    opacity: isHovered ? 1 : 0,
                    transform: isHovered ? 'translateY(0)' : 'translateY(6px)',
                    transition: 'all 0.3s ease',
                  }}
                >
                  Explore →
                </div>

                {/* Background glow on hover */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: isHovered
                      ? 'linear-gradient(135deg, rgba(195,163,94,0.04) 0%, rgba(107,31,43,0.03) 100%)'
                      : 'transparent',
                    transition: 'background 0.35s ease',
                  }}
                />
              </Link>
            )
          })}
        </div>
      </div>

      {/* Keyframes for icon pulse */}
      <style jsx>{`
        @keyframes iconPulse {
          0%, 100% { transform: scale(1.2); }
          50% { transform: scale(1.3); }
        }
      `}</style>
    </section>
  )
}

export default SupremeIndustryGrid
