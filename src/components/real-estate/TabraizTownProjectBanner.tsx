'use client'

import Link from 'next/link'
import { useLocale } from 'next-intl'
import HarvicsImage, { IMAGE_SIZES } from '@/components/ui/HarvicsImage'

const HERO_IMAGE = '/tabraiz-town/images/tabraiz_hero_aerial_dusk.png'

export default function TabraizTownProjectBanner() {
  const locale = useLocale()

  return (
    <section className="relative overflow-hidden mb-14 border border-harvics-gold/25 bg-[#0a0a0a]">
      <div className="absolute inset-0">
        <HarvicsImage
          src={HERO_IMAGE}
          alt="Tabraiz Town aerial dusk — Rahim Yar Khan"
          fill
          sizes={IMAGE_SIZES.hero}
          className="object-cover opacity-55"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/85 to-black/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
      </div>

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 px-6 md:px-10 py-12 md:py-16">
        <div className="lg:col-span-7 flex flex-col justify-center">
          <p className="text-[10px] uppercase tracking-[0.28em] text-harvics-gold font-bold mb-4">
            Landmark Upcoming Project
          </p>
          <h2 className="font-serif text-3xl md:text-5xl text-white leading-[1.05] mb-4">
            Tabraiz Town
          </h2>
          <p className="text-sm md:text-base text-white/70 max-w-[540px] leading-relaxed mb-3">
            Rahim Yar Khan — a 30-Kanal vertical mixed-use monolith for Southern Punjab.
            Architecture, materiality, alliances, and investment underwriting in one cinematic
            experience.
          </p>
          <p className="text-[11px] uppercase tracking-[0.18em] text-white/45 mb-8">
            Mixed-use · Residential · Commercial · Upcoming landmark
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href={`/${locale}/projects/tabraiz-town`}
              className="inline-flex items-center justify-center px-7 py-3 bg-harvics-gold text-harvics-burgundy text-xs font-bold uppercase tracking-[0.16em] hover:bg-[#d4b46e] transition-colors"
            >
              Explore the Project
            </Link>
            <a
              href="/tabraiz-town/index.html"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-7 py-3 border border-harvics-gold/40 text-harvics-gold text-xs font-bold uppercase tracking-[0.16em] hover:bg-harvics-gold/10 transition-colors"
            >
              Full Screen
            </a>
          </div>
        </div>

        <div className="lg:col-span-5 flex flex-col justify-end gap-3">
          <div className="border border-white/10 bg-white/5 backdrop-blur-sm px-5 py-4">
            <p className="text-[9px] uppercase tracking-[0.2em] text-harvics-gold/80 mb-1">Scale</p>
            <p className="text-white text-sm font-semibold">30-Kanal vertical ecosystem</p>
          </div>
          <div className="border border-white/10 bg-white/5 backdrop-blur-sm px-5 py-4">
            <p className="text-[9px] uppercase tracking-[0.2em] text-harvics-gold/80 mb-1">Location</p>
            <p className="text-white text-sm font-semibold">Rahim Yar Khan, Southern Punjab</p>
          </div>
          <div className="border border-white/10 bg-white/5 backdrop-blur-sm px-5 py-4">
            <p className="text-[9px] uppercase tracking-[0.2em] text-harvics-gold/80 mb-1">Status</p>
            <p className="text-white text-sm font-semibold">Upcoming landmark development</p>
          </div>
        </div>
      </div>
    </section>
  )
}
