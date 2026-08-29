'use client'

import Link from 'next/link'
import { useLocale } from 'next-intl'

export default function EnergiesInitiativeBanner() {
  const locale = useLocale()

  return (
    <section className="relative overflow-hidden mb-14 border border-harvics-gold/25 bg-harvics-burgundy">
      <div className="absolute inset-0">
        <img
          src="/assets/energies/hero-complex.png"
          alt=""
          className="h-full w-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-harvics-burgundy via-harvics-burgundy/90 to-harvics-burgundy/45" />
      </div>

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 px-6 md:px-10 py-12 md:py-16">
        <div className="lg:col-span-7 flex flex-col justify-center">
          <p className="text-[10px] uppercase tracking-[0.28em] text-harvics-gold font-bold mb-4">
            Oil &amp; Gas · Initiative
          </p>
          <h2 className="font-serif text-3xl md:text-5xl text-harvics-cream leading-[1.05] mb-4">
            Harvics Energies
          </h2>
          <p className="text-sm md:text-base text-harvics-cream/70 max-w-[540px] leading-relaxed mb-8">
            Renewable fuels infrastructure from feedstock to global trade. A Harvics Global Ventures
            development platform — plant, process, and trade desk.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href={`/${locale}/energies`}
              className="inline-flex items-center justify-center px-7 py-3 bg-harvics-gold text-harvics-burgundy text-xs font-bold uppercase tracking-[0.16em] hover:bg-[#d4b46e] transition-colors"
            >
              Open Energies
            </Link>
            <Link
              href={`/${locale}/energies#plant`}
              className="inline-flex items-center justify-center px-7 py-3 border border-harvics-gold/40 text-harvics-gold text-xs font-bold uppercase tracking-[0.16em] hover:bg-harvics-gold/10 transition-colors"
            >
              View the Plant
            </Link>
          </div>
        </div>
        <div className="lg:col-span-5 flex flex-col justify-end gap-3">
          <div className="border border-white/10 bg-white/5 px-5 py-4">
            <p className="text-[9px] uppercase tracking-[0.2em] text-harvics-gold/80 mb-1">Status</p>
            <p className="text-harvics-cream text-sm font-semibold">Under development</p>
          </div>
          <div className="border border-white/10 bg-white/5 px-5 py-4">
            <p className="text-[9px] uppercase tracking-[0.2em] text-harvics-gold/80 mb-1">Class</p>
            <p className="text-harvics-cream text-sm font-semibold">Renewable fuels complex</p>
          </div>
        </div>
      </div>
    </section>
  )
}
