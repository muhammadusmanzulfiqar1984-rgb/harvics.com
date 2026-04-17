// Header and Footer are provided by layout.tsx - DO NOT import them here
import Link from 'next/link'
import type { Metadata } from 'next'
import { generateLocalizedMetadata } from '@/lib/seo'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  return {
    title: 'HarvicTrade — Global B2B Marketplace | Harvics',
    description: 'Source products from verified suppliers across 40+ countries. FMCG, textiles, commodities, industrial — all on one platform.',
  }
}

export async function generateStaticParams() {
  return [
    { locale: 'en' }, { locale: 'ar' }, { locale: 'fr' },
    { locale: 'es' }, { locale: 'de' }, { locale: 'zh' }, { locale: 'he' }
  ]
}

export default async function HarvicTradePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params

  const categories = [
    { icon: '🧵', name: 'Textiles & Apparel', count: '2,400+', href: `/${locale}/harvictrade/category/textiles`, desc: 'Cotton, polyester, workwear, fashion basics, home textiles' },
    { icon: '🛒', name: 'FMCG & Food', count: '3,100+', href: `/${locale}/harvictrade/category/fmcg`, desc: 'Snacks, beverages, sauces, confectionery, personal care' },
    { icon: '📦', name: 'Commodities', count: '850+', href: `/${locale}/harvictrade/category/commodities`, desc: 'Rice, sugar, wheat, edible oils, pulses, spices' },
    { icon: '🏭', name: 'Industrial & PPE', count: '1,200+', href: `/${locale}/harvictrade/category/industrial`, desc: 'Safety equipment, chemicals, machinery, MRO supplies' },
    { icon: '⛏️', name: 'Minerals & Metals', count: '420+', href: `/${locale}/harvictrade/category/minerals`, desc: 'Iron ore, copper, zinc, precious metals, aggregates' },
    { icon: '🛢️', name: 'Oil, Gas & Energy', count: '180+', href: `/${locale}/harvictrade/category/energy`, desc: 'Crude, refined products, LPG, lubricants, petrochemicals' },
  ]

  const stats = [
    { num: '8,150+', label: 'Products Listed' },
    { num: '40+', label: 'Source Countries' },
    { num: '1,200+', label: 'Verified Suppliers' },
    { num: '50+', label: 'Buyer Countries' },
  ]

  const featuredProducts = [
    { name: 'Premium Basmati Rice 1121', origin: 'Pakistan', moq: '25 MT', price: '$850–950/MT', category: 'Commodities', verified: true },
    { name: 'Hi-Vis Safety Jacket EN20471', origin: 'Turkey', moq: '500 pcs', price: '$8.50–12.00', category: 'Industrial', verified: true },
    { name: 'Organic Extra Virgin Olive Oil', origin: 'Spain', moq: '1 pallet', price: '$4.20–5.80/L', category: 'FMCG', verified: true },
    { name: 'Combed Cotton T-Shirts 180 GSM', origin: 'Bangladesh', moq: '1,000 pcs', price: '$2.80–4.50', category: 'Textiles', verified: true },
    { name: 'Wafer Bar Assortment — Private Label', origin: 'Spain', moq: '500 cartons', price: '$0.35–0.55/unit', category: 'FMCG', verified: true },
    { name: 'Portland Cement 42.5N — Bulk', origin: 'UAE', moq: '100 MT', price: '$62–78/MT', category: 'Industrial', verified: true },
    { name: 'Cold Pressed Coconut Oil', origin: 'Sri Lanka', moq: '5 MT', price: '$1,800–2,200/MT', category: 'Commodities', verified: true },
    { name: 'FR Coverall — NFPA 2112', origin: 'Pakistan', moq: '300 pcs', price: '$18–28', category: 'Textiles', verified: true },
  ]

  const howItWorks = [
    { step: '01', title: 'Browse & Search', desc: 'Explore 8,150+ products across 6 industry categories. Filter by origin, MOQ, certification, and delivery terms.' },
    { step: '02', title: 'Send RFQ', desc: 'Request a quote directly from verified suppliers. Specify your quantity, delivery location, Incoterms, and timeline.' },
    { step: '03', title: 'Compare & Negotiate', desc: 'Receive competitive quotes. Our AI suggests the best supplier match based on price, lead time, and reliability score.' },
    { step: '04', title: 'Trade Securely', desc: 'Execute orders through Harvics — protected by escrow, trade finance (LC/TT), and end-to-end shipment tracking.' },
  ]

  return (
    <main className="min-h-screen" style={{ background: '#ffffff' }}>
      <div className="pt-20">

        {/* ═══════ HERO ═══════ */}
        <section className="relative bg-gradient-to-br from-[#6B1F2B] via-[#5a1a24] to-[#4a1520] py-24 md:py-32 px-4 overflow-hidden">
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
            <span className="inline-block text-xs font-bold text-[#C3A35E] uppercase tracking-[0.25em] mb-5 border border-[#C3A35E]/30 px-4 py-1.5">
              ◆ HarvicTrade — Global B2B Marketplace
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6" style={{ letterSpacing: '-0.03em' }}>
              Source. Trade. Scale.<br />
              <span className="text-[#C3A35E]">Across 40+ Countries.</span>
            </h1>
            <p className="text-lg text-white/50 max-w-2xl mx-auto leading-relaxed mb-10">
              The enterprise B2B marketplace by Harvics Global Ventures. Verified suppliers, AI-matched sourcing, trade finance, and end-to-end logistics — all on one platform.
            </p>

            {/* Search Bar */}
            <div className="max-w-[700px] mx-auto">
              <div className="flex bg-white overflow-hidden">
                <input
                  type="text"
                  placeholder="Search products, suppliers, or categories..."
                  className="flex-1 px-6 py-4 text-[#6B1F2B] placeholder-[#6B1F2B]/40 text-base focus:outline-none"
                  readOnly
                />
                <button className="px-8 bg-[#C3A35E] text-[#6B1F2B] font-bold text-sm uppercase tracking-wider hover:bg-[#d4b46e] transition-colors">
                  Search
                </button>
              </div>
              <div className="flex flex-wrap justify-center gap-2 mt-4">
                {['Basmati Rice', 'Safety Equipment', 'Cotton T-Shirts', 'Olive Oil', 'Workwear'].map((tag) => (
                  <span key={tag} className="text-xs text-white/40 border border-white/15 px-3 py-1 hover:border-[#C3A35E]/50 hover:text-[#C3A35E] cursor-pointer transition-colors">{tag}</span>
                ))}
              </div>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#C3A35E]/30 to-transparent" />
        </section>

        {/* ═══════ STATS BAR ═══════ */}
        <section className="bg-[#5a1a24] border-b border-[#C3A35E]/20">
          <div className="max-w-[1200px] mx-auto px-4 py-5 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            {stats.map((s) => (
              <div key={s.label}>
                <div className="text-xl md:text-2xl font-bold text-[#C3A35E]">{s.num}</div>
                <div className="text-xs text-white/50 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ═══════ CATEGORIES ═══════ */}
        <section className="max-w-[1200px] mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-3">
              <div className="w-6 h-[2px] bg-[#C3A35E]/50" />
              <span className="text-xs font-bold text-[#C3A35E] uppercase tracking-[0.2em]">Browse Categories</span>
              <div className="w-6 h-[2px] bg-[#C3A35E]/50" />
            </div>
            <h2 className="text-3xl font-bold text-[#6B1F2B]" style={{ letterSpacing: '-0.02em' }}>
              6 Industry Verticals. 8,150+ Products.
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.name}
                href={cat.href}
                className="group bg-white border border-[#C3A35E]/15 p-8 overflow-hidden transition-all duration-300 hover:border-[#C3A35E]/50"
              >
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#C3A35E] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-3xl group-hover:scale-110 transition-transform duration-300">{cat.icon}</span>
                  <div>
                    <h3 className="text-lg font-semibold text-[#6B1F2B] group-hover:text-[#C3A35E] transition-colors">{cat.name}</h3>
                    <span className="text-xs text-[#C3A35E] font-bold">{cat.count} products</span>
                  </div>
                </div>
                <p className="text-sm text-[#6B1F2B]/50 leading-relaxed">{cat.desc}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* ═══════ FEATURED PRODUCTS ═══════ */}
        <section className="bg-white border-t border-b border-[#C3A35E]/15 py-16 px-4">
          <div className="max-w-[1200px] mx-auto">
            <div className="text-center mb-12">
              <div className="flex items-center justify-center gap-2 mb-3">
                <div className="w-6 h-[2px] bg-[#C3A35E]/50" />
                <span className="text-xs font-bold text-[#C3A35E] uppercase tracking-[0.2em]">Featured Listings</span>
                <div className="w-6 h-[2px] bg-[#C3A35E]/50" />
              </div>
              <h2 className="text-3xl font-bold text-[#6B1F2B]" style={{ letterSpacing: '-0.02em' }}>Top Products This Week</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {featuredProducts.map((p) => (
                <div key={p.name} className="bg-white border border-[#C3A35E]/15 p-6 hover:border-[#C3A35E] transition-colors group cursor-pointer">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold text-[#C3A35E] bg-[#C3A35E]/10 px-2 py-0.5 uppercase tracking-wider">{p.category}</span>
                    {p.verified && <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5">✓ Verified</span>}
                  </div>
                  <h3 className="text-sm font-semibold text-[#6B1F2B] mb-2 leading-snug group-hover:text-[#C3A35E] transition-colors">{p.name}</h3>
                  <div className="space-y-1.5 text-xs text-[#6B1F2B]/50">
                    <div className="flex justify-between"><span>Origin</span><span className="font-semibold text-[#6B1F2B]">{p.origin}</span></div>
                    <div className="flex justify-between"><span>MOQ</span><span className="font-semibold text-[#6B1F2B]">{p.moq}</span></div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-[#C3A35E]/10">
                    <div className="text-base font-bold text-[#6B1F2B]">{p.price}</div>
                  </div>
                  <button className="w-full mt-4 py-2.5 bg-[#6B1F2B] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#5a1a24] transition-colors">
                    Request Quote
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════ HOW IT WORKS ═══════ */}
        <section className="max-w-[1200px] mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-3">
              <div className="w-6 h-[2px] bg-[#C3A35E]/50" />
              <span className="text-xs font-bold text-[#C3A35E] uppercase tracking-[0.2em]">How It Works</span>
              <div className="w-6 h-[2px] bg-[#C3A35E]/50" />
            </div>
            <h2 className="text-3xl font-bold text-[#6B1F2B]" style={{ letterSpacing: '-0.02em' }}>From Search to Shipment</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {howItWorks.map((s) => (
              <div key={s.step} className="text-center">
                <div className="w-16 h-16 bg-[#6B1F2B] flex items-center justify-center mx-auto mb-4">
                  <span className="text-[#C3A35E] font-bold text-lg">{s.step}</span>
                </div>
                <h3 className="text-base font-bold text-[#6B1F2B] mb-2">{s.title}</h3>
                <p className="text-sm text-[#6B1F2B]/50 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ═══════ TRUST BAR ═══════ */}
        <section className="bg-[#6B1F2B] py-16 px-4">
          <div className="max-w-[1200px] mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-2xl font-bold text-white mb-3" style={{ letterSpacing: '-0.02em' }}>Why Trade on HarvicTrade?</h2>
              <p className="text-white/40 max-w-xl mx-auto text-sm">Enterprise-grade infrastructure for serious B2B buyers and sellers.</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { icon: '🔒', title: 'Trade Assurance', desc: 'Escrow protection on every transaction. Your payment is released only on confirmed delivery.' },
                { icon: '🧠', title: 'AI-Matched Sourcing', desc: 'Our AI recommends the best suppliers based on price, reliability, lead time, and your history.' },
                { icon: '📋', title: 'Verified Suppliers', desc: 'Every supplier is verified — business license, factory audit, and trade references checked.' },
                { icon: '🌍', title: 'Global Logistics', desc: 'Integrated shipping across 40+ countries. Real-time tracking, customs clearance, and documentation.' },
              ].map((t) => (
                <div key={t.title} className="text-center">
                  <div className="text-3xl mb-3">{t.icon}</div>
                  <h3 className="text-sm font-bold text-[#C3A35E] mb-2">{t.title}</h3>
                  <p className="text-xs text-white/40 leading-relaxed">{t.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════ CTA ═══════ */}
        <section className="py-16 px-4">
          <div className="max-w-[800px] mx-auto text-center">
            <h2 className="text-3xl font-bold text-[#6B1F2B] mb-4" style={{ letterSpacing: '-0.02em' }}>
              Ready to Source Globally?
            </h2>
            <p className="text-[#6B1F2B]/50 mb-8 max-w-xl mx-auto">
              Join 1,200+ verified suppliers and thousands of buyers trading on HarvicTrade. Register now to post your first RFQ.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href={`/${locale}/harvictrade/register`}
                className="px-8 py-4 bg-[#6B1F2B] text-white font-bold text-sm uppercase tracking-wider hover:bg-[#5a1a24] transition-colors">
                Register as Buyer
              </Link>
              <Link href={`/${locale}/harvictrade/sell`}
                className="px-8 py-4 bg-[#C3A35E] text-[#6B1F2B] font-bold text-sm uppercase tracking-wider hover:bg-[#d4b46e] transition-colors">
                Sell on HarvicTrade
              </Link>
            </div>
          </div>
        </section>

      </div>
    </main>
  )
}
