import Link from 'next/link'
import { generateAllLocaleParams } from '@/lib/generateLocaleParams'
import { ALL_PRODUCTS } from '@/data/harvictrade-products'

export async function generateStaticParams() {
  return generateAllLocaleParams()
}

const SUBCATEGORIES = ['Apple — iPhone', 'Apple — Mac', 'Apple — iPad', 'Apple — Watch & AirPods', 'Samsung', 'Google & Others']

export default async function ElectronicsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const products = ALL_PRODUCTS.filter(p => p.categorySlug === 'electronics')

  return (
    <main className="min-h-screen bg-white pt-[136px]">

      {/* Hero */}
      <section className="relative bg-harvics-burgundy py-16 px-4 border-b border-harvics-gold/30 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-[0.04]"
          style={{
            backgroundImage: 'linear-gradient(rgba(195, 163, 94,1) 1px, transparent 1px), linear-gradient(90deg, rgba(195, 163, 94,1) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }} />
        <div className="max-w-[1100px] mx-auto relative z-10">
          <div className="flex items-center gap-2 text-[10px] text-white/30 mb-5 tracking-[0.2em] uppercase">
            <Link href={`/${locale}/harvictrade`} className="hover:text-harvics-gold transition-colors">HarvicTrade</Link>
            <span>/</span>
            <span className="text-harvics-gold">Consumer Electronics</span>
          </div>
          <div className="flex items-start justify-between gap-6">
            <div>
              <div className="w-10 h-10 border border-harvics-gold/30 flex items-center justify-center mb-5">
                <span className="text-[11px] font-bold text-harvics-gold/70 tracking-widest">CE</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-3" style={{ letterSpacing: '-0.025em' }}>
                Consumer Electronics
              </h1>
              <p className="text-white/40 max-w-xl text-sm leading-relaxed">
                Premium flagship devices — Apple, Samsung, Google, Xiaomi. Sourced globally, available for B2B bulk enquiry through Harvyoice, a Harvics Global Ventures brand.
              </p>
            </div>
            <div className="hidden md:flex flex-col items-end gap-1 shrink-0">
              <div className="text-2xl font-bold text-harvics-gold" style={{ letterSpacing: '-0.03em' }}>{products.length}+</div>
              <div className="text-[10px] text-white/30 uppercase tracking-[0.18em]">Products</div>
            </div>
          </div>
          <div className="mt-8 inline-flex items-center gap-2 bg-harvics-gold/10 border border-harvics-gold/20 px-4 py-2.5">
            <span className="text-[10px] font-bold text-harvics-gold uppercase tracking-wider">Powered by</span>
            <span className="text-sm font-bold text-white">Harvyoice</span>
            <span className="text-[10px] text-white/30">— A Harvics Global Ventures Brand</span>
          </div>
        </div>
      </section>

      {/* Products by subcategory */}
      <section className="max-w-[1100px] mx-auto px-4 py-16">
        <div className="space-y-14">
          {SUBCATEGORIES.map(sub => {
            const subProducts = products.filter(p => p.subcategory === sub)
            if (!subProducts.length) return null
            return (
              <div key={sub}>
                <div className="flex items-center justify-between mb-7">
                  <div>
                    <h2 className="text-lg font-bold text-harvics-burgundy" style={{ letterSpacing: '-0.02em' }}>{sub}</h2>
                    <span className="text-[10px] text-harvics-gold font-bold uppercase tracking-wider">{subProducts.length} products</span>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-harvics-gold/10">
                  {subProducts.map(p => (
                    <Link
                      key={p.name}
                      href={`/${locale}/harvictrade/rfq?product=${encodeURIComponent(p.name)}&category=Consumer+Electronics`}
                      className="group bg-white p-7 hover:bg-[#faf8f5] transition-colors"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-[9px] font-bold text-harvics-gold bg-harvics-gold/10 px-2 py-0.5 uppercase tracking-wider">CE</span>
                        {p.verified && <span className="text-[9px] font-bold text-emerald-600">✓ Verified</span>}
                      </div>
                      <h3 className="text-sm font-semibold text-harvics-burgundy mb-4 leading-snug group-hover:text-harvics-gold transition-colors min-h-[2.5rem]">
                        {p.name}
                      </h3>
                      <div className="space-y-1.5 text-[11px] text-harvics-burgundy/40 mb-4">
                        <div className="flex justify-between">
                          <span>Origin</span>
                          <span className="font-semibold text-harvics-burgundy/60">{p.origin}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>MOQ</span>
                          <span className="font-semibold text-harvics-burgundy/60">{p.moq}</span>
                        </div>
                      </div>
                      <div className="pt-3 border-t border-harvics-gold/10 flex items-center justify-between">
                        <div className="text-sm font-bold text-harvics-burgundy">{p.price}</div>
                        <span className="text-[9px] font-bold text-harvics-burgundy/25 uppercase tracking-wider group-hover:text-harvics-gold transition-colors">RFQ →</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* B2B CTA */}
      <section className="bg-harvics-burgundy border-t border-harvics-gold/20">
        <div className="max-w-[1100px] mx-auto px-4 py-14 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-lg font-bold text-white mb-1" style={{ letterSpacing: '-0.02em' }}>Bulk Order or Custom Configuration?</h3>
            <p className="text-white/40 text-sm">Submit an RFQ and our team will source the exact spec, quantity, and warranty configuration you need.</p>
          </div>
          <Link href={`/${locale}/harvictrade/rfq?category=Consumer+Electronics`}
            className="shrink-0 px-8 py-3 bg-harvics-gold text-harvics-burgundy text-xs font-bold uppercase tracking-[0.18em] hover:bg-[#d4b46e] transition-colors">
            Submit Bulk RFQ
          </Link>
        </div>
      </section>

    </main>
  )
}
