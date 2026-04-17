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

interface ClearancePageProps {
  params: Promise<{ locale: string }>
}

export default async function ClearancePage({ params }: ClearancePageProps) {
  const { locale } = await params

  const navItems = [
    { label: 'Current Offers', href: `/${locale}/sales/current-sales`, active: false },
    { label: 'Seasonal', href: `/${locale}/sales/seasonal`, active: false },
    { label: 'Clearance', href: `/${locale}/sales/clearance`, active: true },
  ]

  const clearanceItems = [
    { category: 'FMCG', title: 'Spanish Snacks Assortment — Short Dated', desc: 'Mixed pallet of wafer bars, potato chips, and biscuits from Spanish suppliers. Best before within 90 days. Ideal for discount retail and market traders.', discount: '40–55% off', stock: '12 pallets remaining' },
    { category: 'Textiles', title: 'Previous Season Workwear — Mixed Sizes', desc: 'Hi-vis vests, cargo trousers, and safety boots from 2025 collection. Full size range but mixed colourways. CE certified, brand new.', discount: '50–65% off', stock: '3,200 pieces' },
    { category: 'Industrial', title: 'Surplus PPE Equipment', desc: 'Overstock of hard hats, safety goggles, and ear defenders from cancelled project order. All items factory sealed and CE marked.', discount: '60% off', stock: '1,500 units' },
    { category: 'FMCG', title: 'Italian Sauces — Label Change', desc: 'Premium pasta sauces and condiments with previous label design. Product quality identical, packaging updated by manufacturer. Perfect for foodservice.', discount: '35% off', stock: '8 pallets' },
    { category: 'Commodities', title: 'Basmati Rice — Previous Crop Year', desc: '1121 Sella Basmati from 2024 harvest. Fully inspected, fumigation valid. Excellent quality — cleared at reduced price to make room for new crop.', discount: '25% off', stock: '4 containers (100 MT)' },
    { category: 'Textiles', title: 'Cotton T-Shirts — Colour Discontinuation', desc: '180 GSM combed cotton t-shirts in discontinued colourways (sage green, dusty rose, slate blue). Premium quality, ready for immediate dispatch.', discount: '45% off', stock: '5,000 pieces' },
  ]

  return (
    <main className="min-h-screen pt-[136px]" style={{ background: '#ffffff' }}>
      {/* Hero */}
      <section className="relative bg-[#6B1F2B] py-20 px-4 border-b border-[#C3A35E]/40 overflow-hidden">
        <div className="absolute inset-0" style={{ background: 'linear-gradient(105deg, rgba(107,31,43,0.95) 0%, rgba(90,26,36,0.9) 100%)' }} />
        <div className="max-w-[1200px] mx-auto text-center relative z-10">
          <div className="text-xs text-[#C3A35E] font-bold uppercase tracking-[0.2em] mb-3">Limited Stock</div>
          <h1 className="text-4xl md:text-5xl font-semibold text-white mb-4" style={{ letterSpacing: '-0.02em' }}>
            Clearance & Surplus Stock
          </h1>
          <p className="text-lg text-white/60 max-w-[700px] mx-auto leading-relaxed">
            Deeply discounted stock from overruns, label changes, short-dated goods, and discontinued lines. First come, first served.
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

      {/* Notice */}
      <section className="max-w-[1200px] mx-auto px-4 pt-12">
        <div className="bg-[#C3A35E]/10 border border-[#C3A35E]/20 p-4 text-center">
          <p className="text-sm font-semibold text-[#6B1F2B]">
            All clearance stock is sold as-is, subject to availability. No returns on clearance items. Prices valid while stocks last.
          </p>
        </div>
      </section>

      {/* Clearance Items */}
      <section className="max-w-[1200px] mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clearanceItems.map((item) => (
            <div key={item.title} className="bg-white border border-[#C3A35E]/15 p-8 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-[#C3A35E] bg-[#C3A35E]/10 px-2 py-0.5 uppercase tracking-wider">{item.category}</span>
                <span className="text-xs font-bold text-white bg-[#6B1F2B] px-3 py-1">{item.discount}</span>
              </div>
              <h3 className="text-lg font-semibold text-[#6B1F2B] mb-3">{item.title}</h3>
              <p className="text-sm text-[#6B1F2B]/55 leading-relaxed mb-6 flex-1">{item.desc}</p>
              <div className="border-t border-[#C3A35E]/10 pt-4">
                <div className="flex justify-between text-xs">
                  <span className="text-[#6B1F2B]/40">Available</span>
                  <span className="font-semibold text-[#6B1F2B]">{item.stock}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#6B1F2B] border-t border-[#C3A35E]/30">
        <div className="max-w-[1200px] mx-auto px-4 py-14 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-semibold text-white mb-2">Interested in Clearance Stock?</h3>
            <p className="text-white/50 text-sm">Contact our trade desk immediately — clearance items move fast and cannot be reserved without deposit.</p>
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

