'use client'

import Link from 'next/link'
import { useLocale } from 'next-intl'

/**
 * Trial 08 — HarvicTrade marketplace gate.
 */
export default function HarvicTradeGateSection() {
  const locale = useLocale()

  return (
    <section className="relative flex min-h-[70vh] items-center overflow-hidden bg-harvics-burgundy" id="market">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/assets/shared/heroes/harvictrade-marketplace.jpg"
        alt=""
        className="absolute inset-0 h-full w-full object-cover brightness-50"
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(105deg, rgba(61, 18, 18,0.9) 0%, rgba(61, 18, 18,0.55) 55%, rgba(61, 18, 18,0.25) 100%)',
        }}
      />
      <div className="relative z-10 mx-auto w-full max-w-[1440px] px-5 py-24 md:px-12">
        <p className="mb-3 harvics-corridor-eyebrow text-[11px] tracking-[0.22em]">
          08 · HarvicTrade
        </p>
        <h2
          className="mb-4 max-w-[12ch] harvics-corridor-display text-harvics-cream"
          style={{
            fontSize: 'clamp(40px, 7vw, 72px)',
          }}
        >
          HarvicTrade.
        </h2>
        <p className="mb-8 max-w-[42ch] harvics-corridor-body !text-harvics-cream/70">
          The enterprise marketplace where verified listings meet protected settlement — built for
          buyers who cannot afford guesswork.
        </p>
        <div className="mb-8 flex flex-wrap gap-8 border-t border-harvics-gold/25 pt-6">
          {[
            ['1,185+', 'Live listings'],
            ['42+', 'Active corridors'],
            ['24h', 'Avg. quote response'],
          ].map(([n, l]) => (
            <div key={l}>
              <strong
                className="block text-harvics-gold"
                style={{
                  fontFamily: 'var(--font-playfair-display), Georgia, "Times New Roman", serif',
                  fontSize: 28,
                  fontWeight: 500,
                }}
              >
                {n}
              </strong>
              <span className="text-[10px] uppercase tracking-[0.16em] text-harvics-cream/45">{l}</span>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href={`/${locale}/harvictrade`}
            className="inline-flex items-center px-6 py-3.5 bg-harvics-gold text-harvics-burgundy text-[11px] font-bold uppercase tracking-[0.14em]"
          >
            Open marketplace
          </Link>
          <Link
            href={`/${locale}/portals`}
            className="inline-flex items-center px-6 py-3.5 border border-harvics-cream/35 text-harvics-cream text-[11px] font-bold uppercase tracking-[0.14em] hover:border-harvics-gold hover:text-harvics-gold"
          >
            Supplier or distributor portal
          </Link>
        </div>
      </div>
    </section>
  )
}
