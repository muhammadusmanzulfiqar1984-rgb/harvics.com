'use client'

import React from 'react'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import { navVerticals } from '@/data/megaMenuData'
import { useScrollReveal, revealClass } from '@/hooks/useScrollReveal'

/**
 * SupremeIndustryGrid — Displays all 10 industry verticals as a clean grid.
 * Matches Supreme's "Who We Are" / industry overview section.
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

  return (
    <section ref={ref} className={`bg-[#F5F1E8] py-16 px-4 ${revealClass(isVisible, 'up')}`}>
      <div className="max-w-[1200px] mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-semibold text-[#6B1F2B] mb-3" style={{ letterSpacing: '-0.02em' }}>
            Industries & Markets
          </h2>
          <p className="text-base text-[#6B1F2B]/60 max-w-[600px] mx-auto leading-relaxed">
            End-to-end supply chain solutions across 10 verticals,
            operating from sourcing through manufacturing to delivery.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {navVerticals.map((vertical) => {
            const meta = industryMeta[vertical.key] || { icon: '📊', desc: '' }
            return (
              <Link
                key={vertical.key}
                href={`/${locale}${vertical.href}`}
                className="group bg-white border border-[#C3A35E]/30 p-6 text-center transition-all hover:border-[#C3A35E]"
                style={{ borderRadius: 0, boxShadow: 'none' }}
              >
                <div className="text-3xl mb-3">{meta.icon}</div>
                <h3 className="text-sm font-bold text-[#6B1F2B] uppercase tracking-wide mb-2">
                  {vertical.label}
                </h3>
                <p className="text-xs text-[#6B1F2B]/50 leading-relaxed">
                  {meta.desc}
                </p>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default SupremeIndustryGrid
