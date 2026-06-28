import Link from 'next/link'
import type { Metadata } from 'next'
import { generateAllLocaleParams } from '@/lib/generateLocaleParams'
import HarvicTradeSearch from '@/components/harvictrade/HarvicTradeSearch'
import HarvicTradeTabs from '@/components/harvictrade/HarvicTradeTabs'
import { ALL_PRODUCTS, CATEGORY_META } from '@/data/harvictrade-products'


export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'HarvicTrade — Global B2B Marketplace | Harvics',
    description: 'Source products from verified suppliers across 42+ countries. FMCG, textiles, commodities, industrial — all on one platform.',
  }
}

export async function generateStaticParams() {
  return generateAllLocaleParams()
}

const FEATURED = ALL_PRODUCTS.filter(p =>
  ['Premium Basmati Rice 1121 Sella', 'Hi-Vis Safety Jacket EN20471 Class 3',
   'Extra Virgin Olive Oil — 1L Glass', 'Combed Cotton T-Shirt 180 GSM',
   'Copper Cathode Grade A — LME Registered', 'Diesel EN590 10ppm — FOB',
   'ICUMSA 45 White Refined Sugar', 'Portland Cement 42.5N — Bulk'].includes(p.name)
)

const TRUST = [
  { label: 'Trade Assurance', desc: 'Escrow-protected transactions. Payment released only on confirmed delivery.' },
  { label: 'Verified Suppliers', desc: 'Business licence, factory audit, and trade references checked on every supplier.' },
  { label: 'AI Matching', desc: 'Our engine matches RFQs to the best-fit supplier on price, lead time, and reliability.' },
  { label: 'Global Logistics', desc: '42+ country network. Freight forwarding, customs clearance, and documentation included.' },
]

const HOW = [
  { n: '01', t: 'Browse & Search', d: 'Explore 1,185+ products. Filter by origin, MOQ, certification, and Incoterms.' },
  { n: '02', t: 'Submit RFQ', d: 'Request a quote from verified suppliers. Specify quantity, delivery, and timeline.' },
  { n: '03', t: 'Compare & Negotiate', d: 'Receive competitive quotes. AI suggests best supplier match for your requirements.' },
  { n: '04', t: 'Trade Securely', d: 'Execute orders via Harvics — escrow, LC/TT, and end-to-end shipment tracking.' },
]

export default async function HarvicTradePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params

  return (
    <HarvicTradeTabs locale={locale}>
    <main className="min-h-screen bg-white">
      <div className="pt-20">

        {/* ══ HERO ══════════════════════════════════════════════════════ */}
        <section className="relative bg-[#0D0D0D] py-28 md:py-36 px-4 overflow-hidden">
          {/* Subtle grid texture */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.04]"
            style={{
              backgroundImage: 'linear-gradient(rgba(195,163,94,1) 1px, transparent 1px), linear-gradient(90deg, rgba(195,163,94,1) 1px, transparent 1px)',
              backgroundSize: '80px 80px',
            }} />
          {/* Radial accent */}
          <div className="absolute top-0 right-1/4 w-[800px] h-[800px] opacity-[0.05] pointer-events-none"
            style={{ background: 'radial-gradient(circle, #C3A35E 0%, transparent 60%)' }} />

          <div className="relative z-10 max-w-[1100px] mx-auto text-center">
            <p className="text-[10px] font-bold text-[#C3A35E]/60 uppercase tracking-[0.35em] mb-6">
              Harvics Global Ventures &nbsp;·&nbsp; HarvicTrade
            </p>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-[1.04]" style={{ letterSpacing: '-0.04em' }}>
              Source. Trade. Scale.
            </h1>
            <p className="text-lg text-white/35 max-w-xl mx-auto leading-relaxed mb-12">
              The enterprise B2B marketplace for verified global trade. 1,185+ products. 42+ countries. One platform.
            </p>

            <HarvicTradeSearch locale={locale} />

            {/* Quick tags */}
            <div className="flex flex-wrap justify-center gap-2 mt-5">
              {['Basmati Rice', 'Safety Equipment', 'Denim Fabric', 'Olive Oil', 'Copper Cathode', 'Diesel EN590'].map(tag => (
                <span key={tag}
                  className="text-[10px] text-white/30 border border-white/10 px-3 py-1 hover:border-[#C3A35E]/40 hover:text-[#C3A35E]/70 cursor-pointer transition-colors tracking-wider">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ══ STATS ═════════════════════════════════════════════════════ */}
        <section className="border-b border-[#C3A35E]/12">
          <div className="max-w-[1100px] mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-[#C3A35E]/12">
              {[
                { n: '1,185+', l: 'Products Listed' },
                { n: '42+', l: 'Source Countries' },
                { n: '1,200+', l: 'Verified Suppliers' },
                { n: '24 hrs', l: 'Quote Turnaround' },
              ].map(s => (
                <div key={s.l} className="py-7 px-8 text-center">
                  <div className="text-2xl font-bold text-[#3D1212] mb-0.5" style={{ letterSpacing: '-0.03em' }}>{s.n}</div>
                  <div className="text-[10px] text-[#3D1212]/40 uppercase tracking-[0.18em]">{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ CATEGORIES ════════════════════════════════════════════════ */}
        <section className="max-w-[1100px] mx-auto px-4 py-20">
          <div className="mb-12">
            <p className="text-[10px] font-bold text-[#C3A35E] uppercase tracking-[0.28em] mb-3">Browse Categories</p>
            <h2 className="text-3xl font-bold text-[#3D1212]" style={{ letterSpacing: '-0.025em' }}>
              Six Verticals. One Platform.
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-[#C3A35E]/10">
            {CATEGORY_META.map((cat) => (
              <Link
                key={cat.slug}
                href={`/${locale}/harvictrade/category/${cat.slug}`}
                className="group bg-white p-10 hover:bg-[#F5F0E8] transition-colors relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-[2px] h-0 bg-[#3D1212] group-hover:h-full transition-all duration-300" />
                <div className="flex items-start justify-between mb-6">
                  <div className="w-10 h-10 border border-[#3D1212]/15 flex items-center justify-center group-hover:border-[#3D1212]/40 transition-colors">
                    <span className="text-[11px] font-bold text-[#3D1212]/50 tracking-widest group-hover:text-[#3D1212] transition-colors">{cat.abbr}</span>
                  </div>
                  <span className="text-[10px] font-bold text-[#C3A35E] tracking-wider">{cat.count}</span>
                </div>
                <h3 className="text-base font-bold text-[#3D1212] mb-2 group-hover:text-[#3D1212] transition-colors">{cat.name}</h3>
                <p className="text-xs text-[#3D1212]/45 leading-relaxed">{cat.desc}</p>
                <div className="mt-6 text-[10px] font-bold text-[#3D1212]/30 uppercase tracking-[0.18em] group-hover:text-[#C3A35E] transition-colors">
                  Browse →
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ══ FEATURED PRODUCTS ═════════════════════════════════════════ */}
        <section className="bg-[#faf8f5] border-t border-b border-[#C3A35E]/10 py-20 px-4">
          <div className="max-w-[1100px] mx-auto">
            <div className="flex items-end justify-between mb-12">
              <div>
                <p className="text-[10px] font-bold text-[#C3A35E] uppercase tracking-[0.28em] mb-3">Featured Listings</p>
                <h2 className="text-3xl font-bold text-[#3D1212]" style={{ letterSpacing: '-0.025em' }}>Top Products</h2>
              </div>
              <Link href={`/${locale}/harvictrade/rfq`}
                className="hidden md:block text-xs font-bold text-[#3D1212]/50 uppercase tracking-[0.18em] hover:text-[#3D1212] transition-colors">
                Submit Custom RFQ →
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-[#C3A35E]/10">
              {FEATURED.map(p => (
                <Link
                  key={p.name}
                  href={`/${locale}/harvictrade/rfq?product=${encodeURIComponent(p.name)}&category=${encodeURIComponent(p.category)}`}
                  className="group bg-white p-7 hover:bg-[#F5F0E8] transition-colors"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[9px] font-bold text-[#C3A35E] bg-[#C3A35E]/10 px-2 py-0.5 uppercase tracking-wider">{p.categorySlug.toUpperCase()}</span>
                    {p.verified && <span className="text-[9px] font-bold text-emerald-600">✓ Verified</span>}
                  </div>
                  <h3 className="text-sm font-semibold text-[#3D1212] mb-4 leading-snug group-hover:text-[#3D1212] transition-colors min-h-[2.8rem]">{p.name}</h3>
                  <div className="space-y-1.5 text-[11px] text-[#3D1212]/40 mb-4">
                    <div className="flex justify-between">
                      <span>Origin</span>
                      <span className="font-semibold text-[#3D1212]/70">{p.origin}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>MOQ</span>
                      <span className="font-semibold text-[#3D1212]/70">{p.moq}</span>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-[#C3A35E]/10 flex items-center justify-between">
                    <div className="text-sm font-bold text-[#3D1212]">{p.price}</div>
                    <span className="text-[9px] font-bold text-[#3D1212]/30 uppercase tracking-wider group-hover:text-[#C3A35E] transition-colors">RFQ →</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ══ HOW IT WORKS ══════════════════════════════════════════════ */}
        <section className="max-w-[1100px] mx-auto px-4 py-20">
          <div className="mb-14">
            <p className="text-[10px] font-bold text-[#C3A35E] uppercase tracking-[0.28em] mb-3">Process</p>
            <h2 className="text-3xl font-bold text-[#3D1212]" style={{ letterSpacing: '-0.025em' }}>From Search to Shipment</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-0 border border-[#C3A35E]/12">
            {HOW.map((s, i) => (
              <div key={s.n} className={`p-10 ${i < 3 ? 'border-b md:border-b-0 md:border-r border-[#C3A35E]/12' : ''}`}>
                <div className="text-3xl font-bold text-[#C3A35E]/20 mb-6" style={{ letterSpacing: '-0.04em' }}>{s.n}</div>
                <h3 className="text-sm font-bold text-[#3D1212] mb-3">{s.t}</h3>
                <p className="text-xs text-[#3D1212]/45 leading-relaxed">{s.d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ══ TRUST ═════════════════════════════════════════════════════ */}
        <section className="bg-[#0D0D0D] py-20 px-4">
          <div className="max-w-[1100px] mx-auto">
            <div className="mb-14 text-center">
              <p className="text-[10px] font-bold text-[#C3A35E]/60 uppercase tracking-[0.28em] mb-3">Why HarvicTrade</p>
              <h2 className="text-3xl font-bold text-white" style={{ letterSpacing: '-0.025em' }}>
                Enterprise-grade infrastructure<br />for serious global trade.
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-white/5">
              {TRUST.map(t => (
                <div key={t.label} className="bg-[#0D0D0D] p-10">
                  <div className="w-6 h-[2px] bg-[#C3A35E]/40 mb-6" />
                  <h3 className="text-sm font-bold text-white mb-3">{t.label}</h3>
                  <p className="text-xs text-white/30 leading-relaxed">{t.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ CTA ═══════════════════════════════════════════════════════ */}
        <section className="py-24 px-4">
          <div className="max-w-[700px] mx-auto text-center">
            <h2 className="text-4xl font-bold text-[#3D1212] mb-5" style={{ letterSpacing: '-0.03em' }}>
              Ready to Source Globally?
            </h2>
            <p className="text-[#3D1212]/50 mb-10 max-w-md mx-auto text-sm leading-relaxed">
              Join 1,200+ verified suppliers and buyers on HarvicTrade. Register free and submit your first RFQ today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href={`/${locale}/harvictrade/register`}
                className="px-10 py-4 bg-[#3D1212] text-white font-bold text-xs uppercase tracking-[0.18em] hover:bg-[#0d0303] transition-colors">
                Register as Buyer
              </Link>
              <Link href={`/${locale}/harvictrade/sell`}
                className="px-10 py-4 border border-[#C3A35E]/40 text-[#3D1212] font-bold text-xs uppercase tracking-[0.18em] hover:bg-[#C3A35E]/8 transition-colors">
                Sell on HarvicTrade
              </Link>
              <Link href={`/${locale}/harvictrade/rfq`}
                className="px-10 py-4 bg-[#C3A35E] text-[#3D1212] font-bold text-xs uppercase tracking-[0.18em] hover:bg-[#d4b46e] transition-colors">
                Submit RFQ
              </Link>
            </div>
          </div>
        </section>

      </div>
    </main>
    </HarvicTradeTabs>
  )
}
