'use client'

/**
 * Wheel × Map trial — uses the REAL production components from the original web.
 * No SVG recreations. This is SupplyChainSection + SupplyChainWheel + CinematicTradeMap.
 */

import Link from 'next/link'
import { useParams } from 'next/navigation'
import SupplyChainSection from '@/components/SupplyChainSection'
import SupplyChainWheel from '@/components/layout/SupplyChainWheel'
import CinematicTradeMap from '@/components/premium/CinematicTradeMap'

export default function WheelMapTrialPage() {
  const params = useParams()
  const locale = (params?.locale as string) || 'en'

  return (
    <main className="min-h-screen bg-harvics-cream">
      {/* Trial intro — corridor language, then the real pieces */}
      <section
        className="relative overflow-hidden"
        style={{
          background:
            'radial-gradient(ellipse at 20% 0%, rgba(107,31,43,0.55) 0%, transparent 50%), linear-gradient(180deg, #0f0408 0%, #3D1212 100%)',
        }}
      >
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 pt-16 pb-20 md:pt-24 md:pb-28">
          <p className="text-[10px] font-bold tracking-[0.28em] uppercase text-harvics-gold mb-5 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-harvics-gold animate-pulse" />
            Trial · Original web DNA · Not a mock
          </p>
          <h1
            className="text-white font-light tracking-tight leading-[0.95] mb-6"
            style={{
              fontFamily: 'var(--font-playfair-display), Georgia, "Times New Roman", serif',
              fontSize: 'clamp(40px, 7vw, 78px)',
            }}
          >
            The wheel.
            <br />
            <em className="text-harvics-gold not-italic" style={{ fontStyle: 'italic' }}>
              The map.
            </em>
          </h1>
          <p className="text-white/55 text-[15px] leading-relaxed max-w-xl mb-8">
            These are the live components from the original Harvics homepage — particle supply-chain
            disc, dark OS cockpit wheel, and cinematic trade network. Scroll to experience them as
            they actually ship.
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href="#particle"
              className="px-6 py-3 bg-harvics-gold text-harvics-burgundy text-[11px] font-bold tracking-[0.14em] uppercase"
            >
              Particle wheel
            </a>
            <a
              href="#cockpit"
              className="px-6 py-3 border border-harvics-gold/40 text-harvics-gold text-[11px] font-bold tracking-[0.14em] uppercase"
            >
              OS cockpit
            </a>
            <a
              href="#network"
              className="px-6 py-3 border border-white/25 text-white/80 text-[11px] font-bold tracking-[0.14em] uppercase"
            >
              Trade map
            </a>
            <Link
              href={`/${locale}`}
              className="px-6 py-3 text-white/40 text-[11px] font-bold tracking-[0.14em] uppercase hover:text-white/70"
            >
              ← Home
            </Link>
          </div>
        </div>
      </section>

      {/* 1 — Particle living wheel (batcloud / SupplyChainSection) */}
      <div id="particle">
        <div className="bg-harvics-cream border-b border-harvics-gold/20 px-6 py-4 flex items-center justify-between max-w-[1440px] mx-auto">
          <div>
            <p className="text-[10px] font-bold tracking-[0.22em] uppercase text-harvics-gold">01 · SupplyChainSection</p>
            <p className="text-[13px] text-harvics-muted mt-1">2,200 gold particles · hover a rim stage to energize that sector</p>
          </div>
        </div>
        <SupplyChainSection />
      </div>

      {/* 2 — Original rotating SVG cockpit wheel */}
      <div id="cockpit">
        <div className="bg-white border-y border-harvics-gold/15 px-6 py-4 flex items-center justify-between max-w-[1440px] mx-auto">
          <div>
            <p className="text-[10px] font-bold tracking-[0.22em] uppercase text-harvics-gold">02 · SupplyChainWheel</p>
            <p className="text-[13px] text-harvics-muted mt-1">14-stage OS · auto-rotate · hover nodes for live KPIs</p>
          </div>
        </div>
        <SupplyChainWheel />
      </div>

      {/* 3 — Cinematic trade map */}
      <div id="network">
        <div className="bg-harvics-burgundy border-b border-harvics-gold/20 px-6 py-4 max-w-[1440px] mx-auto">
          <p className="text-[10px] font-bold tracking-[0.22em] uppercase text-harvics-gold">03 · CinematicTradeMap</p>
          <p className="text-[13px] text-white/45 mt-1">9 hubs · air + sea corridors · live ticker · the original “Watch HARVICS move”</p>
        </div>
        <CinematicTradeMap />
      </div>

      <section className="bg-harvics-cream py-20 px-6 text-center">
        <p className="text-[10px] font-bold tracking-[0.22em] uppercase text-harvics-gold mb-4">Next</p>
        <h2
          className="text-harvics-burgundy mb-4"
          style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 500 }}
        >
          Pick which DNA to fuse into the corridor homepage.
        </h2>
        <p className="text-harvics-muted text-[14px] max-w-lg mx-auto mb-8">
          Particle disc, cockpit wheel, cinematic map — or a scroll-synced combination of two.
          Tell me which feel right and we wire that into The Corridor.
        </p>
        <Link
          href={`/${locale}/landing`}
          className="inline-block px-7 py-3.5 bg-harvics-burgundy text-harvics-cream text-[11px] font-bold tracking-[0.14em] uppercase"
        >
          Compare with landing
        </Link>
      </section>
    </main>
  )
}
