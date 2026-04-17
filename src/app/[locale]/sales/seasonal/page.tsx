// Header and Footer are provided by layout.tsx - DO NOT import them here
import Link from 'next/link'
import type { Metadata } from 'next'
import { generateLocalizedMetadata } from '@/lib/seo'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  return generateLocalizedMetadata(locale, 'sales')
}

export async function generateStaticParams() {
  return [
    { locale: 'en' },
    { locale: 'ar' },
    { locale: 'fr' },
    { locale: 'es' },
    { locale: 'de' },
    { locale: 'zh' },
    { locale: 'he' }
  ]
}

interface SeasonalPageProps {
  params: Promise<{ locale: string }>
}

export default async function SeasonalPage({ params }: SeasonalPageProps) {
  const { locale } = await params

  const navItems = [
    { label: 'Current Offers', href: `/${locale}/sales/current-sales`, active: false },
    { label: 'Seasonal', href: `/${locale}/sales/seasonal`, active: true },
    { label: 'Clearance', href: `/${locale}/sales/clearance`, active: false },
  ]

  const seasons = [
    { icon: '🌸', title: 'Spring/Ramadan — Q1', period: 'January – March', offers: [
      'Ramadan gifting hampers — dates, chocolates, juices (GCC & South Asia)',
      'Spring fashion basics — cotton polos, linen shirts (Europe & Middle East)',
      'Agricultural commodities — pre-harvest forward contracts (Africa)',
    ]},
    { icon: '☀️', title: 'Summer — Q2', period: 'April – June', offers: [
      'Beverages & frozen goods — ice cream, juices, water (all markets)',
      'Lightweight workwear — breathable safety gear for hot climates',
      'Commodity spot trading — sugar, rice, wheat pre-monsoon (South Asia)',
    ]},
    { icon: '🍂', title: 'Autumn/Back-to-School — Q3', period: 'July – September', offers: [
      'School uniforms & apparel — bulk orders for educational institutions',
      'FMCG back-to-school packs — stationery bundles, lunch snacks',
      'Winter stock pre-orders — early booking discounts on winter lines',
    ]},
    { icon: '❄️', title: 'Winter/Festive — Q4', period: 'October – December', offers: [
      'Festive confectionery — Christmas, Diwali, New Year gift boxes',
      'Thermal workwear — insulated jackets, thermal boots, cold-weather PPE',
      'Year-end clearance — bulk discounts on slow-moving inventory across all verticals',
    ]},
  ]

  return (
    <main className="min-h-screen pt-[136px]" style={{ background: '#ffffff' }}>
      {/* Hero */}
      <section className="relative bg-[#6B1F2B] py-20 px-4 border-b border-[#C3A35E]/40 overflow-hidden">
        <div className="absolute inset-0" style={{ background: 'linear-gradient(105deg, rgba(107,31,43,0.95) 0%, rgba(90,26,36,0.9) 100%)' }} />
        <div className="max-w-[1200px] mx-auto text-center relative z-10">
          <div className="text-xs text-[#C3A35E] font-bold uppercase tracking-[0.2em] mb-3">Trade Calendar</div>
          <h1 className="text-4xl md:text-5xl font-semibold text-white mb-4" style={{ letterSpacing: '-0.02em' }}>
            Seasonal Trade Programmes
          </h1>
          <p className="text-lg text-white/60 max-w-[700px] mx-auto leading-relaxed">
            Harvics aligns trade offers with cultural calendars, climate patterns, and market demand cycles across 40+ countries.
          </p>
        </div>
      </section>

      {/* Sales Nav */}
      <section className="bg-[#5a1a24] border-b border-[#C3A35E]/20">
        <div className="max-w-[1200px] mx-auto px-4 flex gap-0">
          {navItems.map((n) => (
            <Link key={n.label} href={n.href}
              className={`px-6 py-4 text-sm font-semibold transition-colors ${n.active ? 'text-[#C3A35E] border-b-2 border-[#C3A35E]' : 'text-white/50 hover:text-white/80'}`}>
              {n.label}
            </Link>
          ))}
        </div>
      </section>

      {/* Seasonal Grid */}
      <section className="max-w-[1200px] mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {seasons.map((s) => (
            <div key={s.title} className="bg-white border border-[#C3A35E]/15 p-8">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">{s.icon}</span>
                <div>
                  <h3 className="text-lg font-semibold text-[#6B1F2B]">{s.title}</h3>
                  <span className="text-xs text-[#C3A35E] font-bold uppercase tracking-wider">{s.period}</span>
                </div>
              </div>
              <ul className="space-y-3">
                {s.offers.map((offer) => (
                  <li key={offer} className="flex items-start gap-2">
                    <span className="text-[#C3A35E] mt-0.5 flex-shrink-0">→</span>
                    <span className="text-sm text-[#6B1F2B]/55 leading-relaxed">{offer}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#6B1F2B] border-t border-[#C3A35E]/30">
        <div className="max-w-[1200px] mx-auto px-4 py-14 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-semibold text-white mb-2">Plan Your Seasonal Orders</h3>
            <p className="text-white/50 text-sm">Early booking secures priority allocation and the best trade pricing. Contact us to discuss volume commitments.</p>
          </div>
          <a href="mailto:trade@harvics.com"
            className="px-8 py-3 bg-[#C3A35E] text-[#6B1F2B] text-sm font-bold hover:bg-[#d4b46e] transition-colors">
            Contact Trade Desk
          </a>
        </div>
      </section>
    </main>
  )
}

