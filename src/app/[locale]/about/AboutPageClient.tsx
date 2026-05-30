'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

/* ───── Animated Counter ───── */
function useAnimatedCounter(target: string, isVisible: boolean) {
  const [display, setDisplay] = useState('0')
  const numericPart = parseInt(target.replace(/[^0-9]/g, ''), 10)
  const suffix = target.replace(/[0-9,]/g, '')

  useEffect(() => {
    if (!isVisible || isNaN(numericPart)) { setDisplay(target); return }
    let frame = 0
    const total = 40
    const timer = setInterval(() => {
      frame++
      const eased = 1 - Math.pow(1 - frame / total, 3)
      setDisplay(Math.round(numericPart * eased).toLocaleString() + suffix)
      if (frame >= total) clearInterval(timer)
    }, 30)
    return () => clearInterval(timer)
  }, [isVisible, numericPart, suffix, target])
  return display
}

/* ───── Intersection Observer ───── */
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true) }, { threshold })
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return { ref, inView }
}

/* ───── Stat tile (uses the counter hook safely) ───── */
function StatTile({ stat, index, inView }: { stat: { value: string; label: string }; index: number; inView: boolean }) {
  const display = useAnimatedCounter(stat.value, inView)
  return (
    <div
      className="transition-all duration-700"
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(20px)',
        transitionDelay: `${index * 120}ms`,
      }}
    >
      <div className="text-3xl md:text-4xl font-bold text-[#C3A35E] mb-2 tabular-nums">{display}</div>
      <div className="text-xs text-white/45 uppercase tracking-[0.15em] font-medium">{stat.label}</div>
    </div>
  )
}

interface AboutPageClientProps {
  locale: string
  translations: {
    title: string
    subtitle: string
    ourStory: string
    story1: string
    story2: string
    est2018: string
    countries40: string
    productLines6: string
  }
}

const verticals = [
  { icon: '🧵', label: 'Textiles', key: 'textiles' },
  { icon: '🛒', label: 'FMCG', key: 'fmcg' },
  { icon: '📦', label: 'Commodities', key: 'commodities' },
  { icon: '🏭', label: 'Industrial', key: 'industrial' },
  { icon: '⛏️', label: 'Minerals', key: 'minerals' },
  { icon: '🛢️', label: 'Oil & Gas', key: 'oil-gas' },
  { icon: '🏢', label: 'Real Estate', key: 'real-estate' },
  { icon: '🔍', label: 'Sourcing', key: 'sourcing' },
  { icon: '💳', label: 'Finance', key: 'finance' },
  { icon: '🤖', label: 'AI & Tech', key: 'ai' },
]

const stats = [
  { value: '42+', label: 'Countries' },
  { value: '10', label: 'Industry Verticals' },
  { value: '38', label: 'Languages Supported' },
  { value: '2019', label: 'Founded' },
]

const AboutPageClient: React.FC<AboutPageClientProps> = ({ locale, translations: t }) => {
  const heroRef = useInView(0.1)
  const storyRef = useInView(0.15)
  const capRef = useInView(0.1)
  const statsRef = useInView(0.2)
  const locRef = useInView(0.2)

  return (
    <main className="min-h-screen" style={{ background: '#ffffff' }}>
      <div className="pt-20">
        {/* ═══════ HERO ═══════ */}
        <section
          ref={heroRef.ref}
          className="relative bg-gradient-to-br from-[#6B1F2B] via-[#5a1a24] to-[#4a1520] py-28 md:py-32 px-4 overflow-hidden"
        >
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 right-0 w-[600px] h-[600px] opacity-[0.06]"
              style={{ background: 'radial-gradient(circle, #C3A35E 0%, transparent 65%)' }} />
            <div className="absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage: 'linear-gradient(rgba(195,163,94,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(195,163,94,0.5) 1px, transparent 1px)',
                backgroundSize: '60px 60px',
              }} />
          </div>
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#C3A35E]/40 to-transparent" />

          <div className="relative z-10 max-w-[1200px] mx-auto text-center">
            <div
              className="transition-all duration-700"
              style={{ opacity: heroRef.inView ? 1 : 0, transform: heroRef.inView ? 'translateY(0)' : 'translateY(12px)' }}
            >
              <span className="inline-block text-xs font-bold text-[#C3A35E] uppercase tracking-[0.25em] mb-5 border border-[#C3A35E]/30 px-3 py-1">
                Since 2019 · Dubai, UAE
              </span>
            </div>
            <h1
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 transition-all duration-700 delay-100"
              style={{
                letterSpacing: '-0.03em',
                opacity: heroRef.inView ? 1 : 0,
                transform: heroRef.inView ? 'translateY(0)' : 'translateY(16px)',
              }}
            >
              {t.title}
            </h1>
            <p
              className="text-lg text-white/50 max-w-2xl mx-auto leading-relaxed transition-all duration-700 delay-200"
              style={{ opacity: heroRef.inView ? 1 : 0, transform: heroRef.inView ? 'translateY(0)' : 'translateY(12px)' }}
            >
              {t.subtitle}
            </p>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#C3A35E]/30 to-transparent" />
        </section>

        {/* ═══════ STORY CARD ═══════ */}
        <section ref={storyRef.ref} className="relative px-4 pb-20 -mt-16 z-20">
          <div className="max-w-[1200px] mx-auto">
            <div
              className="bg-white border border-[#C3A35E]/15 p-8 md:p-12 transition-all duration-700"
              style={{
                opacity: storyRef.inView ? 1 : 0,
                transform: storyRef.inView ? 'translateY(0)' : 'translateY(24px)',
              }}
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="order-2 lg:order-1">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-6 h-[2px] bg-[#C3A35E]/50" />
                    <span className="text-xs font-bold text-[#C3A35E] uppercase tracking-[0.2em]">Our Story</span>
                  </div>
                  <h2 className="text-3xl font-bold text-[#6B1F2B] mb-6" style={{ letterSpacing: '-0.02em' }}>{t.ourStory}</h2>
                  <p className="text-[#6B1F2B]/55 mb-6 leading-relaxed text-base">{t.story1}</p>
                  <p className="text-[#6B1F2B]/55 mb-8 leading-relaxed text-base">{t.story2}</p>
                  <div className="flex flex-wrap gap-3">
                    {[t.est2018, t.countries40, t.productLines6].map((badge) => (
                      <div key={badge} className="bg-white px-5 py-2.5 border border-[#C3A35E]/15">
                        <span className="text-[#6B1F2B] font-bold text-sm uppercase tracking-wide">{badge}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="relative order-1 lg:order-2 flex items-center justify-center">
                  <div className="w-full h-64 md:h-96 flex items-center justify-center bg-white border border-[#C3A35E]/15 p-8 md:p-12">
                    <img src="/Images/logo.png" alt="Harvics Logo" className="max-w-full max-h-full object-contain" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════ CAPABILITIES ═══════ */}
        <section ref={capRef.ref} className="px-4 pb-20">
          <div className="max-w-[1200px] mx-auto">
            <div
              className="text-center mb-12 transition-all duration-700"
              style={{ opacity: capRef.inView ? 1 : 0, transform: capRef.inView ? 'translateY(0)' : 'translateY(16px)' }}
            >
              <div className="flex items-center justify-center gap-2 mb-3">
                <div className="w-6 h-[2px] bg-[#C3A35E]/50" />
                <span className="text-xs font-bold text-[#C3A35E] uppercase tracking-[0.2em]">What We Do</span>
                <div className="w-6 h-[2px] bg-[#C3A35E]/50" />
              </div>
              <h2 className="text-3xl font-bold text-[#6B1F2B]" style={{ letterSpacing: '-0.02em' }}>10 Industry Verticals. One Platform.</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {verticals.map((v, i) => (
                <Link
                  key={v.key}
                  href={`/${locale}/${v.key}`}
                  className="group relative bg-white border border-[#C3A35E]/15 p-6 text-center overflow-hidden transition-all duration-300 hover:border-[#C3A35E]/50"
                  style={{
                    opacity: capRef.inView ? 1 : 0,
                    transform: capRef.inView ? 'translateY(0)' : 'translateY(16px)',
                    transitionDelay: `${100 + i * 50}ms`,
                  }}
                >
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#C3A35E] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                  <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300">{v.icon}</div>
                  <div className="text-sm font-semibold text-[#6B1F2B] group-hover:text-[#C3A35E] transition-colors duration-200">{v.label}</div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════ KEY NUMBERS ═══════ */}
        <section
          ref={statsRef.ref}
          className="relative bg-[#6B1F2B] py-20 px-4 overflow-hidden"
        >
          <div className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: 'radial-gradient(circle at 2px 2px, #C3A35E 1px, transparent 0)',
              backgroundSize: '24px 24px',
            }} />
          <div className="max-w-[1200px] mx-auto relative z-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {stats.map((stat, i) => (
                <StatTile key={stat.label} stat={stat} index={i} inView={statsRef.inView} />
              ))}
            </div>
          </div>
        </section>

        {/* ═══════ LOCATIONS ═══════ */}
        <section ref={locRef.ref} className="py-20 px-4">
          <div className="max-w-[1200px] mx-auto text-center">
            <div
              className="transition-all duration-700"
              style={{ opacity: locRef.inView ? 1 : 0, transform: locRef.inView ? 'translateY(0)' : 'translateY(16px)' }}
            >
              <div className="flex items-center justify-center gap-2 mb-3">
                <div className="w-6 h-[2px] bg-[#C3A35E]/50" />
                <span className="text-xs font-bold text-[#C3A35E] uppercase tracking-[0.2em]">Global Presence</span>
                <div className="w-6 h-[2px] bg-[#C3A35E]/50" />
              </div>
              <h2 className="text-3xl font-bold text-[#6B1F2B] mb-4" style={{ letterSpacing: '-0.02em' }}>Dubai · London · Lahore · Karachi</h2>
              <div className="w-12 h-[2px] bg-[#C3A35E]/40 mx-auto mb-8" />
              <p className="text-[#6B1F2B]/50 max-w-2xl mx-auto leading-relaxed">
                Headquartered in Dubai, UAE with operations spanning the Middle East, South Asia, Europe, and Africa.
                Our multi-regional presence enables real-time market intelligence and rapid execution.
              </p>
            </div>

            {/* Location cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-10">
              {[
                { city: 'Dubai', country: 'UAE', type: 'HQ' },
                { city: 'London', country: 'UK', type: 'Europe' },
                { city: 'Lahore', country: 'Pakistan', type: 'South Asia' },
                { city: 'Karachi', country: 'Pakistan', type: 'South Asia' },
              ].map((loc, i) => (
                <div
                  key={loc.city}
                  className="bg-white border border-[#C3A35E]/15 p-6 text-center transition-all duration-700"
                  style={{
                    opacity: locRef.inView ? 1 : 0,
                    transform: locRef.inView ? 'translateY(0)' : 'translateY(16px)',
                    transitionDelay: `${200 + i * 80}ms`,
                  }}
                >
                  <div className="text-lg font-bold text-[#6B1F2B] mb-1">{loc.city}</div>
                  <div className="text-xs text-[#6B1F2B]/40 uppercase tracking-wider">{loc.country}</div>
                  <div className="text-[10px] text-[#C3A35E] font-semibold uppercase tracking-wider mt-2 border-t border-[#C3A35E]/10 pt-2">{loc.type}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}

export default AboutPageClient
