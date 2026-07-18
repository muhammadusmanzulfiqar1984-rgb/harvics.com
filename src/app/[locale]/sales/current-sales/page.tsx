// Header and Footer are provided by layout.tsx - DO NOT import them here
import Link from 'next/link'
import type { Metadata } from 'next'
import { generateLocalizedMetadata } from '@/lib/seo'
import { generateAllLocaleParams } from '@/lib/generateLocaleParams'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  return generateLocalizedMetadata(locale, 'sales')
}

export async function generateStaticParams() {
  return generateAllLocaleParams()
}

interface CurrentSalesPageProps {
  params: Promise<{ locale: string }>
}

export default async function CurrentSalesPage({ params }: CurrentSalesPageProps) {
  const { locale } = await params

  const navItems = [
    { label: 'Current Offers', href: `/${locale}/sales/current-sales`, active: true },
    { label: 'Seasonal', href: `/${locale}/sales/seasonal`, active: false },
    { label: 'Clearance', href: `/${locale}/sales/clearance`, active: false },
  ]

  const offers = [
    { category: 'FMCG', title: 'Snacks & Confectionery — Spring Bulk Offer', desc: 'Wafer bars, chips, biscuits, and confectionery from our European and Asian suppliers. Minimum order 1 pallet. FOB Dubai/CIF available.', moq: '500 cartons', saving: 'Up to 18% off list', regions: 'GCC, Africa, South Asia' },
    { category: 'Textiles', title: 'Workwear & Safety Apparel — Q2 Stock', desc: 'Hi-vis jackets, safety boots, FR coveralls, and industrial gloves. Certified to EN ISO 20471, EN 11612. Ready stock ex-Dubai warehouse.', moq: '200 pieces', saving: 'Up to 25% off list', regions: 'Middle East, Africa, Europe' },
    { category: 'Commodities', title: 'Basmati Rice — Pakistani Origin', desc: 'Premium 1121 Sella Basmati, crop year 2025. SGS inspected, fumigation certificate included. Containerised shipment 20ft/40ft.', moq: '1 FCL (25 MT)', saving: 'Spot price advantage', regions: 'GCC, Africa, Southeast Asia' },
    { category: 'FMCG', title: 'Sauces & Condiments — European Brands', desc: 'Ketchup, mayonnaise, mustard, and specialty sauces from Spain and Italy. Private label and branded options available.', moq: '300 cartons', saving: 'Up to 15% off list', regions: 'Middle East, Africa' },
    { category: 'Industrial', title: 'PPE & Safety Equipment Bundle', desc: 'Complete workplace safety packages: hard hats, goggles, ear protection, respiratory masks, and first aid kits. CE certified.', moq: '100 units', saving: 'Bundle discount 20%', regions: 'Global' },
    { category: 'Textiles', title: 'Cotton Apparel — Summer Collection', desc: 'Men\'s and women\'s cotton basics: t-shirts, polos, casual trousers. 180-220 GSM combed cotton, pre-shrunk. Custom branding available.', moq: '500 pieces', saving: 'Up to 22% off list', regions: 'Europe, Middle East' },
  ]

  return (
    <main className="min-h-screen pt-[136px]" style={{ background: '#ffffff' }}>
      {/* Hero */}
      <section className="relative bg-harvics-burgundy py-20 px-4 border-b border-harvics-gold/40 overflow-hidden">
        <div className="absolute inset-0" style={{ background: 'linear-gradient(105deg, rgba(107,31,43,0.95) 0%, rgba(90,26,36,0.9) 100%)' }} />
        <div className="max-w-[1200px] mx-auto text-center relative z-10">
          <div className="text-xs text-harvics-gold font-bold uppercase tracking-[0.2em] mb-3">Trade Offers</div>
          <h1 className="text-4xl md:text-5xl font-semibold text-white mb-4" style={{ letterSpacing: '-0.02em' }}>
            Current Trade Offers
          </h1>
          <p className="text-lg text-white/60 max-w-[700px] mx-auto leading-relaxed">
            Live wholesale offers across FMCG, textiles, commodities, and industrial products. Updated weekly.
          </p>
        </div>
      </section>

      {/* Sales Nav */}
      <section className="bg-[#5a1a24] border-b border-harvics-gold/20">
        <div className="max-w-[1200px] mx-auto px-4 flex gap-0">
          {navItems.map((n) => (
            <Link key={n.label} href={n.href}
              className={`px-6 py-4 text-sm font-semibold transition-colors ${n.active ? 'text-harvics-gold border-b-2 border-harvics-gold' : 'text-white/50 hover:text-white/80'}`}>
              {n.label}
            </Link>
          ))}
        </div>
      </section>

      {/* Offers Grid */}
      <section className="max-w-[1200px] mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {offers.map((offer) => (
            <div key={offer.title} className="bg-white border border-harvics-gold/15 p-8 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-harvics-gold bg-harvics-gold/10 px-2 py-0.5 uppercase tracking-wider">{offer.category}</span>
                <span className="text-xs font-bold text-harvics-burgundy bg-harvics-burgundy/5 px-2 py-0.5">{offer.saving}</span>
              </div>
              <h3 className="text-lg font-semibold text-harvics-burgundy mb-3" style={{ letterSpacing: '-0.01em' }}>{offer.title}</h3>
              <p className="text-sm text-harvics-burgundy/55 leading-relaxed mb-6 flex-1">{offer.desc}</p>
              <div className="border-t border-harvics-gold/10 pt-4 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-harvics-burgundy/40">MOQ</span>
                  <span className="font-semibold text-harvics-burgundy">{offer.moq}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-harvics-burgundy/40">Markets</span>
                  <span className="font-semibold text-harvics-burgundy">{offer.regions}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-harvics-burgundy border-t border-harvics-gold/30">
        <div className="max-w-[1200px] mx-auto px-4 py-14 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-semibold text-white mb-2">Request a Quote</h3>
            <p className="text-white/50 text-sm">All offers subject to availability. Contact our trade desk for pricing and lead times.</p>
          </div>
          <a href="mailto:trade@harvics.com"
            className="px-8 py-3 bg-harvics-gold text-harvics-burgundy text-sm font-bold hover:bg-[#d4b46e] transition-colors">
            Contact Trade Desk
          </a>
        </div>
      </section>
    </main>
  )
}

