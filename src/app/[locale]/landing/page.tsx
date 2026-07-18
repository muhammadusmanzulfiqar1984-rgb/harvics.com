// Header and Footer are provided by [locale]/layout.tsx — do NOT import them here.
import Link from 'next/link'
import type { Metadata } from 'next'
import { generateAllLocaleParams } from '@/lib/generateLocaleParams'
import { getProductImage } from '@/data/harvictradeImages'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Harvics Global Ventures — The Operating System for Global Trade',
    description:
      'Source, trade and scale across FMCG, textiles, commodities, industrial, minerals and energy. Verified suppliers, escrow-protected trade, and 42+ country logistics on one platform.',
  }
}

export async function generateStaticParams() {
  return generateAllLocaleParams()
}

const ECOSYSTEM = [
  {
    tag: 'Marketplace',
    title: 'HarvicTrade',
    desc: 'The enterprise B2B marketplace. 1,185+ products from verified suppliers across 42+ countries.',
    href: (l: string) => `/${l}/harvictrade`,
    cta: 'Enter marketplace',
  },
  {
    tag: 'Portals',
    title: 'Business Portals',
    desc: 'Dedicated distributor, supplier and company portals to manage orders, pricing and logistics.',
    href: (l: string) => `/${l}/portals`,
    cta: 'Open portals',
  },
  {
    tag: 'Software',
    title: 'Harvics Apps',
    desc: 'Vatify, Harvoice and the Harvics OS suite — purpose-built tools for modern trade operations.',
    href: (l: string) => `/${l}/apps`,
    cta: 'Explore apps',
  },
  {
    tag: 'Trust',
    title: 'Verified Trade & Escrow',
    desc: 'Trade Assurance, LC/TT and escrow-protected payments released only on confirmed delivery.',
    href: (l: string) => `/${l}/harvictrade`,
    cta: 'How it works',
  },
]

// Verticals link to the HarvicTrade category pages (known-good routes).
const VERTICALS = [
  { name: 'FMCG & Food', slug: 'fmcg', img: '/assets/verticals/02-fmcg/categories/food/hero.jpg' },
  { name: 'Textiles & Apparel', slug: 'textiles', img: '/assets/verticals/01-apparels/categories/apparel/hero.jpg' },
  { name: 'Commodities', slug: 'commodities', img: '/assets/verticals/03-commodities/categories/agri/hero.jpg' },
  { name: 'Industrial & PPE', slug: 'industrial', img: '/assets/verticals/04-industrial/categories/machinery/hero.jpg' },
  { name: 'Minerals & Metals', slug: 'minerals', img: '/assets/verticals/05-minerals/categories/metals/hero.jpg' },
  { name: 'Oil, Gas & Energy', slug: 'energy', img: '/assets/verticals/06-oil-gas/categories/downstream/hero.jpg' },
]

const STEPS = [
  { n: '01', t: 'Browse & Search', d: 'Explore verified listings. Filter by origin, MOQ, certification and Incoterms.' },
  { n: '02', t: 'Submit RFQ', d: 'Request quotes from vetted suppliers. Specify quantity, delivery and timeline.' },
  { n: '03', t: 'Compare & Negotiate', d: 'Receive competitive quotes. AI matches you to the best-fit supplier.' },
  { n: '04', t: 'Trade Securely', d: 'Execute orders with escrow, LC/TT and end-to-end shipment tracking.' },
]

const FEATURED = [
  { name: 'Premium Basmati Rice 1121 Sella', origin: 'Pakistan', slug: 'commodities' },
  { name: 'Hi-Vis Safety Jacket EN20471 Class 3', origin: 'Turkey', slug: 'textiles' },
  { name: 'Copper Cathode Grade A — LME Registered', origin: 'Chile', slug: 'minerals' },
  { name: 'iPhone 17 Pro Max — 256GB', origin: 'Global', slug: 'electronics' },
  { name: 'Extra Virgin Olive Oil — 1L Glass', origin: 'Spain', slug: 'fmcg' },
  { name: 'Diesel EN590 10ppm — FOB', origin: 'UAE', slug: 'energy' },
  { name: 'Portland Cement 42.5N — Bulk', origin: 'UAE', slug: 'industrial' },
  { name: 'Samsung Galaxy S25 Ultra — 256GB', origin: 'Global', slug: 'electronics' },
]

export default async function LandingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params

  return (
    <main className="min-h-screen bg-white">

      {/* ══ HERO (full-screen video) ══════════════════════════════════════ */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-harvics-burgundy">
        <video
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster="/assets/harvictrade/heroes/commodities-hero.jpg"
        >
          <source src="/assets/media/video/french.mp4" type="video/mp4" />
        </video>

        {/* overlays for readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-harvics-burgundy/80 via-[#3D1212]/55 to-harvics-burgundy/90" />
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(195, 163, 94,1) 1px, transparent 1px), linear-gradient(90deg, rgba(195, 163, 94,1) 1px, transparent 1px)',
            backgroundSize: '80px 80px',
          }}
        />

        <div className="relative z-10 max-w-[1100px] mx-auto text-center px-4">
          <p className="text-[10px] md:text-[11px] font-bold text-harvics-gold uppercase tracking-[0.4em] mb-6">
            Harvics Global Ventures
          </p>
          <h1
            className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-[1.05]"
            style={{ letterSpacing: '-0.04em' }}
          >
            The Operating System<br />for Global Trade.
          </h1>
          <p className="text-base md:text-lg text-white/70 max-w-2xl mx-auto leading-relaxed mb-10">
            Source, trade and scale across six industries. Verified suppliers, escrow-protected
            transactions, and end-to-end logistics — all on one platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href={`/${locale}/harvictrade`}
              className="px-9 py-4 bg-harvics-gold text-harvics-burgundy font-bold text-xs uppercase tracking-[0.18em] hover:bg-[#d4b46e] transition-colors"
            >
              Explore Marketplace
            </Link>
            <Link
              href={`/${locale}/harvictrade/rfq`}
              className="px-9 py-4 border border-white/30 text-white font-bold text-xs uppercase tracking-[0.18em] hover:bg-white/10 transition-colors"
            >
              Submit an RFQ
            </Link>
          </div>
        </div>

        {/* scroll hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/40 text-[10px] uppercase tracking-[0.3em]">
          Scroll
        </div>
      </section>

      {/* ══ TRUST BAR ═════════════════════════════════════════════════════ */}
      <section className="bg-harvics-burgundy border-t border-harvics-gold/15">
        <div className="max-w-[1100px] mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-white/10">
            {[
              { n: '1,185+', l: 'Products Listed' },
              { n: '42+', l: 'Source Countries' },
              { n: '1,200+', l: 'Verified Suppliers' },
              { n: '24 hrs', l: 'Quote Turnaround' },
            ].map((s) => (
              <div key={s.l} className="py-8 px-6 text-center">
                <div className="text-2xl md:text-3xl font-bold text-harvics-gold mb-1" style={{ letterSpacing: '-0.03em' }}>
                  {s.n}
                </div>
                <div className="text-[10px] text-white/40 uppercase tracking-[0.18em]">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ ECOSYSTEM ═════════════════════════════════════════════════════ */}
      <section className="max-w-[1100px] mx-auto px-4 py-24">
        <div className="mb-14 text-center">
          <p className="text-[10px] font-bold text-harvics-gold uppercase tracking-[0.28em] mb-3">One Ecosystem</p>
          <h2 className="text-3xl md:text-4xl font-bold text-harvics-burgundy" style={{ letterSpacing: '-0.03em' }}>
            Everything you need to trade globally.
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-harvics-gold/10">
          {ECOSYSTEM.map((e) => (
            <Link
              key={e.title}
              href={e.href(locale)}
              className="group bg-white p-8 hover:bg-[#faf8f5] transition-colors flex flex-col"
            >
              <span className="text-[9px] font-bold text-harvics-gold uppercase tracking-[0.2em] mb-4">{e.tag}</span>
              <h3 className="text-lg font-bold text-harvics-burgundy mb-3">{e.title}</h3>
              <p className="text-xs text-harvics-burgundy/50 leading-relaxed flex-1">{e.desc}</p>
              <span className="mt-6 text-[10px] font-bold text-harvics-burgundy/40 uppercase tracking-[0.18em] group-hover:text-harvics-gold transition-colors">
                {e.cta} →
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ══ VERTICALS ═════════════════════════════════════════════════════ */}
      <section className="bg-[#faf8f5] border-t border-b border-harvics-gold/10 py-24">
        <div className="max-w-[1100px] mx-auto px-4">
          <div className="mb-12">
            <p className="text-[10px] font-bold text-harvics-gold uppercase tracking-[0.28em] mb-3">Industries</p>
            <h2 className="text-3xl md:text-4xl font-bold text-harvics-burgundy" style={{ letterSpacing: '-0.03em' }}>
              Six verticals. One platform.
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-px bg-harvics-gold/10">
            {VERTICALS.map((v) => (
              <Link
                key={v.slug}
                href={`/${locale}/harvictrade/category/${v.slug}`}
                className="group relative overflow-hidden bg-harvics-burgundy aspect-[4/3]"
              >
                <img
                  src={v.img}
                  alt={v.name}
                  className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:opacity-90 group-hover:scale-105 transition-all duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-harvics-burgundy/90 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 p-5">
                  <h3 className="text-white font-bold text-sm md:text-base">{v.name}</h3>
                  <span className="text-[10px] text-harvics-gold uppercase tracking-[0.18em]">Browse →</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══ HOW IT WORKS ══════════════════════════════════════════════════ */}
      <section className="max-w-[1100px] mx-auto px-4 py-24">
        <div className="mb-14">
          <p className="text-[10px] font-bold text-harvics-gold uppercase tracking-[0.28em] mb-3">Process</p>
          <h2 className="text-3xl md:text-4xl font-bold text-harvics-burgundy" style={{ letterSpacing: '-0.03em' }}>
            From search to shipment.
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-0 border border-harvics-gold/12">
          {STEPS.map((s, i) => (
            <div key={s.n} className={`p-9 ${i < 3 ? 'border-b md:border-b-0 md:border-r border-harvics-gold/12' : ''}`}>
              <div className="text-3xl font-bold text-harvics-gold/25 mb-6" style={{ letterSpacing: '-0.04em' }}>{s.n}</div>
              <h3 className="text-sm font-bold text-harvics-burgundy mb-3">{s.t}</h3>
              <p className="text-xs text-harvics-burgundy/50 leading-relaxed">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══ FEATURED PRODUCTS ═════════════════════════════════════════════ */}
      <section className="bg-[#faf8f5] border-t border-harvics-gold/10 py-24">
        <div className="max-w-[1100px] mx-auto px-4">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="text-[10px] font-bold text-harvics-gold uppercase tracking-[0.28em] mb-3">Featured Listings</p>
              <h2 className="text-3xl md:text-4xl font-bold text-harvics-burgundy" style={{ letterSpacing: '-0.03em' }}>
                Top products this week.
              </h2>
            </div>
            <Link
              href={`/${locale}/harvictrade`}
              className="hidden md:block text-xs font-bold text-harvics-burgundy/50 uppercase tracking-[0.18em] hover:text-harvics-burgundy transition-colors"
            >
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-harvics-gold/10">
            {FEATURED.map((p) => (
              <Link
                key={p.name}
                href={`/${locale}/harvictrade/rfq?product=${encodeURIComponent(p.name)}`}
                className="group bg-white overflow-hidden hover:bg-harvics-cream transition-colors flex flex-col"
              >
                <div className="h-36 w-full overflow-hidden bg-[#f8f5f0]">
                  <img
                    src={getProductImage(p.name, p.slug)}
                    alt={p.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="text-xs font-semibold text-harvics-burgundy mb-2 leading-snug min-h-[2.6rem]">{p.name}</h3>
                  <div className="mt-auto flex items-center justify-between text-[10px] text-harvics-burgundy/40">
                    <span>{p.origin}</span>
                    <span className="font-bold text-harvics-burgundy/30 uppercase tracking-wider group-hover:text-harvics-gold transition-colors">RFQ →</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FINAL CTA ═════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-harvics-burgundy py-28 px-4">
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.05]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(195, 163, 94,1) 1px, transparent 1px), linear-gradient(90deg, rgba(195, 163, 94,1) 1px, transparent 1px)',
            backgroundSize: '80px 80px',
          }}
        />
        <div className="relative z-10 max-w-[700px] mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-5" style={{ letterSpacing: '-0.03em' }}>
            Ready to trade globally?
          </h2>
          <p className="text-white/50 mb-10 max-w-md mx-auto text-sm leading-relaxed">
            Join 1,200+ verified suppliers and buyers. Register free and submit your first RFQ today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href={`/${locale}/harvictrade/register`}
              className="px-10 py-4 bg-harvics-gold text-harvics-burgundy font-bold text-xs uppercase tracking-[0.18em] hover:bg-[#d4b46e] transition-colors"
            >
              Get Started
            </Link>
            <Link
              href={`/${locale}/harvictrade`}
              className="px-10 py-4 border border-white/30 text-white font-bold text-xs uppercase tracking-[0.18em] hover:bg-white/10 transition-colors"
            >
              Explore Marketplace
            </Link>
          </div>
        </div>
      </section>

    </main>
  )
}
