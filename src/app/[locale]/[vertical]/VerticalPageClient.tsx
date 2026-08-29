'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { slugify, type NavVertical } from '@/data/megaMenuData'
import { getVerticalProducts, getVerticalSubcategories, getSubcategoryProducts, getProductImage, type Product } from '@/data/productCatalog'
import { getVerticalLanding, getAllCategoryDescriptions } from '@/data/verticalDescriptions'
import SmartImage from '@/components/ui/SmartImage'
import PresentationAccessBanner from '@/components/presentations/PresentationAccessBanner'
import TabraizTownProjectBanner from '@/components/real-estate/TabraizTownProjectBanner'
import EnergiesInitiativeBanner from '@/components/energies/EnergiesInitiativeBanner'

/* ───── Intersection Observer Hook ───── */
function useInView(threshold = 0.2) {
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

/** Rich descriptions for each vertical */
const verticalMeta: Record<string, { tagline: string; description: string; icon: string; gradient: string }> = {
  textiles: {
    tagline: 'Apparel, Fabrics & Home Textiles',
    description: 'From premium menswear and womenswear to home textiles and accessories — Harvics sources, manufactures, and distributes across the full textile value chain. Factory-direct partnerships in South Asia, Turkey, and China.',
    icon: '🧵',
    gradient: 'from-harvics-burgundy via-[#120303] to-harvics-burgundy',
  },
  fmcg: {
    tagline: 'Food, Personal Care & Home Care',
    description: 'Full FMCG distribution — staples, dairy, packaged foods, beverages, personal care, and home care. Cold chain logistics, in-market distribution, and AI-driven demand forecasting.',
    icon: '🛒',
    gradient: 'from-harvics-burgundy via-[#120303] to-harvics-burgundy',
  },
  commodities: {
    tagline: 'Agri, Energy, Metals & Softs',
    description: 'Strategic commodities trading — energy, metals, agricultural products, edible oils, proteins, and industrial chemicals. Spot and contract-based trading with global counterparties.',
    icon: '📦',
    gradient: 'from-harvics-burgundy via-[#120303] to-harvics-burgundy',
  },
  industrial: {
    tagline: 'Chemicals, Machinery & Safety',
    description: 'Industrial procurement and supply — CNC machinery, safety equipment, copper wire, iron ore, and MRO supplies. Turnkey solutions for manufacturing and construction sectors.',
    icon: '🏭',
    gradient: 'from-harvics-burgundy via-[#120303] to-harvics-burgundy',
  },
  minerals: {
    tagline: 'Metals, Energy & Precious Minerals',
    description: 'Mining and minerals trading — iron ore, copper, aluminum, coal, lithium, gold, silver, and platinum. From mine to market with full compliance and traceability.',
    icon: '⛏️',
    gradient: 'from-harvics-burgundy via-[#120303] to-harvics-burgundy',
  },
  'oil-gas': {
    tagline: 'Upstream, Midstream & Downstream',
    description: 'End-to-end oil & gas services — exploration, pipeline EPC, refinery operations, trading & offtake, and HSE compliance. Operating across the Middle East, Africa, and Central Asia.',
    icon: '🛢️',
    gradient: 'from-harvics-burgundy via-[#120303] to-harvics-burgundy',
  },
  'real-estate': {
    tagline: 'Commercial, Residential & Industrial',
    description: 'Real estate development and facilities management — Grade-A offices, luxury residences, industrial parks, and landmark upcoming projects including Tabraiz Town, Rahim Yar Khan.',
    icon: '🏢',
    gradient: 'from-harvics-burgundy via-[#120303] to-harvics-burgundy',
  },
  sourcing: {
    tagline: 'Global Sourcing & Quality Control',
    description: 'Strategic sourcing, OEM/ODM manufacturing, quality inspection, logistics consulting, and sustainable procurement. AI-powered supplier matching and blockchain traceability.',
    icon: '🔍',
    gradient: 'from-harvics-burgundy via-[#120303] to-harvics-burgundy',
  },
  finance: {
    tagline: 'Trade Finance, HPay & Risk',
    description: 'Financial services for global trade — letters of credit, forfaiting, digital wallets (HPay), invoicing, reconciliation, KYC/AML compliance, and risk scoring.',
    icon: '💳',
    gradient: 'from-harvics-burgundy via-[#120303] to-harvics-burgundy',
  },
  ai: {
    tagline: 'Forecasting, Vision & Integration',
    description: 'AI-powered enterprise solutions — demand forecasting, computer vision for QC, conversational AI, data pipelines, ERP integration, and mobile apps. Built on Harvics\' proprietary ML models.',
    icon: '🤖',
    gradient: 'from-harvics-burgundy via-[#120303] to-harvics-burgundy',
  },
}

/** Hero images for each vertical — 3 sliding campaign frames each. */
const verticalHeroImages: Record<string, string> = {
  textiles: '/assets/harvictrade/heroes/textiles/01-trench.webp',
  fmcg: '/assets/harvictrade/heroes/fmcg/01-still.webp',
  commodities: '/assets/harvictrade/heroes/commodities/01-grain.webp',
  industrial: '/assets/harvictrade/heroes/industrial/01-cnc.webp',
  minerals: '/assets/harvictrade/heroes/minerals/01-copper.webp',
  'oil-gas': '/assets/harvictrade/heroes/oil-gas/01-offshore.webp',
  'real-estate': '/assets/harvictrade/heroes/real-estate/01-tower.webp',
  sourcing: '/assets/harvictrade/heroes/sourcing/01-factory.webp',
  finance: '/assets/harvictrade/heroes/finance/01-desk.webp',
  ai: '/assets/harvictrade/heroes/ai/01-datacenter.webp',
}

const verticalHeroSlides: Record<string, string[]> = {
  textiles: [
    '/assets/harvictrade/heroes/textiles/01-trench.webp',
    '/assets/harvictrade/heroes/textiles/02-rack.webp',
    '/assets/harvictrade/heroes/textiles/03-denim.webp',
    '/assets/harvictrade/heroes/textiles/04-silk.webp',
  ],
  fmcg: [
    '/assets/harvictrade/heroes/fmcg/01-still.webp',
    '/assets/harvictrade/heroes/fmcg/02-warehouse.webp',
    '/assets/harvictrade/heroes/fmcg/03-flatlay.webp',
  ],
  commodities: [
    '/assets/harvictrade/heroes/commodities/01-grain.webp',
    '/assets/harvictrade/heroes/commodities/02-coffee.webp',
    '/assets/harvictrade/heroes/commodities/03-port.webp',
  ],
  industrial: [
    '/assets/harvictrade/heroes/industrial/01-cnc.webp',
    '/assets/harvictrade/heroes/industrial/02-ppe.webp',
    '/assets/harvictrade/heroes/industrial/03-factory.webp',
  ],
  minerals: [
    '/assets/harvictrade/heroes/minerals/01-copper.webp',
    '/assets/harvictrade/heroes/minerals/02-ore.webp',
    '/assets/harvictrade/heroes/minerals/03-gold.webp',
  ],
  'oil-gas': [
    '/assets/harvictrade/heroes/oil-gas/01-offshore.webp',
    '/assets/harvictrade/heroes/oil-gas/02-refinery.webp',
    '/assets/harvictrade/heroes/oil-gas/03-tanker.webp',
  ],
  'real-estate': [
    '/assets/harvictrade/heroes/real-estate/01-tower.webp',
    '/assets/harvictrade/heroes/real-estate/02-interior.webp',
    '/assets/harvictrade/heroes/real-estate/03-aerial.webp',
  ],
  sourcing: [
    '/assets/harvictrade/heroes/sourcing/01-factory.webp',
    '/assets/harvictrade/heroes/sourcing/02-qc.webp',
    '/assets/harvictrade/heroes/sourcing/03-containers.webp',
  ],
  finance: [
    '/assets/harvictrade/heroes/finance/01-desk.webp',
    '/assets/harvictrade/heroes/finance/02-lobby.webp',
    '/assets/harvictrade/heroes/finance/03-fintech.webp',
  ],
  ai: [
    '/assets/harvictrade/heroes/ai/01-datacenter.webp',
    '/assets/harvictrade/heroes/ai/02-vision.webp',
    '/assets/harvictrade/heroes/ai/03-analytics.webp',
  ],
}

const defaultHeroSlides = [
  '/assets/verticals/02-fmcg/hero.jpg',
  '/assets/verticals/01-apparels/hero.jpg',
]

interface VerticalPageClientProps {
  vertical: NavVertical
  locale: string
}

const VerticalPageClient: React.FC<VerticalPageClientProps> = ({ vertical, locale }) => {
  const subcategories = getVerticalSubcategories(vertical.key)
  const allProducts = getVerticalProducts(vertical.key)
  const [activeFilter, setActiveFilter] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'name' | 'price'>('name')
  const [hoveredProduct, setHoveredProduct] = useState<number | null>(null)
  const meta = verticalMeta[vertical.key] || { tagline: '', description: '', icon: '📊', gradient: 'from-harvics-burgundy to-harvics-burgundy' }
  const landing = getVerticalLanding(vertical.key)
  const categoryDescs = getAllCategoryDescriptions(vertical.key)

  // Scroll-reveal refs
  const heroSection = useInView(0.1)
  const categorySection = useInView(0.15)
  const productSection = useInView(0.1)
  const ctaSection = useInView(0.2)

  const displayProducts = activeFilter
    ? getSubcategoryProducts(vertical.key, activeFilter)
    : allProducts

  const sortedProducts = [...displayProducts].sort((a, b) => {
    if (sortBy === 'name') return a.name.localeCompare(b.name)
    return 0
  })

  const heroSlides = (verticalHeroSlides[vertical.key] || [
    verticalHeroImages[vertical.key],
    ...defaultHeroSlides,
  ]).filter(Boolean) as string[]

  const [heroIndex, setHeroIndex] = useState(0)

  useEffect(() => {
    setHeroIndex(0)
  }, [vertical.key])

  useEffect(() => {
    if (heroSlides.length <= 1) return
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return
    }
    const id = window.setInterval(() => {
      setHeroIndex((i) => (i + 1) % heroSlides.length)
    }, 4200)
    return () => window.clearInterval(id)
  }, [heroSlides.length, vertical.key])

  return (
    <main className="min-h-screen" style={{ background: '#ffffff' }}>
      {/* ═══════ HERO — full-bleed auto-slider (no floating cards) ═══════ */}
      <section
        ref={heroSection.ref}
        className="relative min-h-[72vh] overflow-hidden border-b border-harvics-gold/30 md:min-h-[78vh]"
      >
        {heroSlides.map((src, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={src}
            src={src}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            style={{
              opacity: i === heroIndex ? 1 : 0,
              transform: i === heroIndex ? 'scale(1)' : 'scale(1.05)',
              transition: 'opacity 1.15s ease, transform 7s ease',
            }}
            loading={i === 0 ? 'eager' : 'lazy'}
            decoding="async"
            aria-hidden={i !== heroIndex}
          />
        ))}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(105deg, rgba(61,18,18,0.88) 0%, rgba(61,18,18,0.55) 48%, rgba(13,13,13,0.35) 100%)',
          }}
        />

        <div className="relative z-10 mx-auto flex min-h-[72vh] max-w-[1200px] flex-col justify-end px-4 py-14 md:min-h-[78vh] md:py-20">
          <nav className="mb-5 flex items-center gap-2 text-xs text-white/55">
            <Link href={`/${locale}`} className="transition-colors hover:text-harvics-gold">
              Home
            </Link>
            <span>→</span>
            <span className="text-harvics-gold/90">{vertical.label}</span>
          </nav>

          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-harvics-gold">
            {meta.tagline || 'Harvics Global Ventures'}
          </p>

          <h1
            className="mb-4 max-w-[18ch] text-4xl font-bold leading-[0.95] text-white md:text-6xl lg:text-[72px]"
            style={{ letterSpacing: '-0.03em' }}
          >
            {vertical.label}
          </h1>

          <p className="mb-8 max-w-[540px] text-base leading-relaxed text-white/75 md:text-lg">
            {meta.description ||
              `Comprehensive supply chain solutions across ${vertical.blocks.length} categories and ${allProducts.length}+ products.`}
          </p>

          <div className="flex flex-wrap gap-3">
            {vertical.key === 'real-estate' ? (
              <>
                <Link
                  href={`/${locale}/projects/tabraiz-town`}
                  className="inline-flex items-center justify-center bg-harvics-gold px-7 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-harvics-burgundy transition hover:bg-[#d4b46e]"
                >
                  Landmark Project
                </Link>
                <a
                  href="#products"
                  className="inline-flex items-center justify-center border border-white/35 px-7 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-white transition hover:border-harvics-gold"
                >
                  Browse Categories
                </a>
              </>
            ) : (
              <>
                <Link
                  href={`/${locale}/contact`}
                  className="inline-flex items-center justify-center bg-harvics-gold px-7 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-harvics-burgundy transition hover:bg-[#d4b46e]"
                >
                  Get a Quote
                </Link>
                <a
                  href="#products"
                  className="inline-flex items-center justify-center border border-white/35 px-7 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-white transition hover:border-harvics-gold"
                >
                  Browse Products
                </a>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Landmark upcoming project — Real Estate only */}
      {vertical.key === 'real-estate' && (
        <div className="max-w-[1200px] mx-auto px-4 mt-6 mb-4">
          <TabraizTownProjectBanner />
        </div>
      )}

      {vertical.key === 'oil-gas' && (
        <div className="max-w-[1200px] mx-auto px-4 mt-6 mb-4">
          <EnergiesInitiativeBanner />
        </div>
      )}

      <div className="max-w-[1100px] mx-auto px-4 mb-12">
        <PresentationAccessBanner verticalKey={vertical.key} />
      </div>

      {/* ═══════ CATEGORY BLOCKS ═══════ */}
      <section ref={categorySection.ref} className="bg-white border-b border-harvics-gold/15 py-14 px-4">
        <div className="max-w-[1200px] mx-auto">
          {landing && (
            <div
              className="text-center mb-10 transition-all duration-700"
              style={{
                opacity: categorySection.inView ? 1 : 0,
                transform: categorySection.inView ? 'translateY(0)' : 'translateY(20px)',
              }}
            >
              <h2 dir="ltr" className="text-2xl font-semibold text-harvics-burgundy mb-2" style={{ letterSpacing: '-0.02em' }}>
                {landing.title}
              </h2>
              <p dir="ltr" className="text-sm text-harvics-muted max-w-[550px] mx-auto leading-relaxed">{landing.description}</p>
              <div className="w-12 h-[2px] bg-harvics-gold/40 mx-auto mt-4" />
            </div>
          )}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {vertical.blocks.map((block, i) => {
              const catDesc = categoryDescs[slugify(block.title)] || categoryDescs[block.title.toLowerCase()]
              return (
                <Link
                  key={block.title}
                  href={`/${locale}/${vertical.key}/${slugify(block.title)}`}
                  className="group relative bg-white/60 border border-harvics-gold/15 px-5 py-5 text-center transition-all duration-300 hover:bg-harvics-burgundy hover:border-harvics-burgundy overflow-hidden"
                  title={catDesc?.description || ''}
                  style={{
                    opacity: categorySection.inView ? 1 : 0,
                    transform: categorySection.inView ? 'translateY(0)' : 'translateY(16px)',
                    transitionDelay: `${150 + i * 60}ms`,
                  }}
                >
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-harvics-gold scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                  <div className="text-sm font-semibold text-harvics-burgundy group-hover:text-white transition-colors duration-300">
                    {block.title}
                  </div>
                  <span className="block text-xs text-harvics-burgundy/40 group-hover:text-white/50 font-normal mt-1.5 transition-colors duration-300">
                    {block.items.length} items →
                  </span>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* ═══════ MAIN CONTENT — SIDEBAR + PRODUCT GRID ═══════ */}
      <div id="products" ref={productSection.ref} className="max-w-[1200px] mx-auto px-4 py-10 flex gap-8">
        {/* Sidebar Filters */}
        <aside className="hidden md:block w-[220px] flex-shrink-0">
          <div
            className="border border-harvics-gold/20 bg-white p-5 transition-all duration-700"
            style={{
              position: 'sticky',
              top: '100px',
              opacity: productSection.inView ? 1 : 0,
              transform: productSection.inView ? 'translateX(0)' : 'translateX(-20px)',
            }}
          >
            <h3 className="text-xs font-bold text-harvics-burgundy uppercase tracking-[0.15em] mb-4 flex items-center gap-2">
              <span className="w-4 h-[2px] bg-harvics-gold" />
              Categories
            </h3>
            <button
              onClick={() => setActiveFilter(null)}
              className={`block w-full text-left text-sm py-2.5 border-b border-harvics-gold/10 transition-all duration-200 ${!activeFilter ? 'text-harvics-burgundy font-bold pl-2 border-l-2 border-l-[#C3A35E]' : 'text-harvics-burgundy/50 hover:text-harvics-burgundy hover:pl-1'
                }`}
            >
              All ({allProducts.length})
            </button>
            {subcategories.map((sub) => {
              const count = getSubcategoryProducts(vertical.key, sub).length
              return (
                <button
                  key={sub}
                  onClick={() => setActiveFilter(sub)}
                  className={`block w-full text-left text-sm py-2.5 border-b border-harvics-gold/10 transition-all duration-200 capitalize ${activeFilter === sub ? 'text-harvics-burgundy font-bold pl-2 border-l-2 border-l-[#C3A35E]' : 'text-harvics-burgundy/50 hover:text-harvics-burgundy hover:pl-1'
                    }`}
                >
                  {sub.replace(/([A-Z])/g, ' $1').trim()} ({count})
                </button>
              )
            })}

            {/* Explore links */}
            <h3 className="text-xs font-bold text-harvics-burgundy uppercase tracking-[0.15em] mt-7 mb-3 flex items-center gap-2">
              <span className="w-4 h-[2px] bg-harvics-gold" />
              Explore
            </h3>
            {vertical.blocks.map((block) => (
              <Link
                key={block.title}
                href={`/${locale}/${vertical.key}/${slugify(block.title)}`}
                className="group block text-sm text-harvics-burgundy/50 hover:text-harvics-burgundy py-2 border-b border-harvics-gold/10 transition-all duration-200"
              >
                <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-harvics-gold mr-1">›</span>
                {block.title}
              </Link>
            ))}
          </div>
        </aside>

        {/* Product Grid */}
        <div className="flex-1">
          {/* Sort bar */}
          <div
            className="flex items-center justify-between mb-6 border-b border-harvics-gold/15 pb-4 transition-all duration-700 delay-200"
            style={{
              opacity: productSection.inView ? 1 : 0,
              transform: productSection.inView ? 'translateY(0)' : 'translateY(12px)',
            }}
          >
            <div className="flex items-center gap-3">
              <span className="text-sm text-harvics-burgundy/60">
                <strong className="text-harvics-burgundy font-semibold">{sortedProducts.length}</strong>{' '}
                {sortedProducts.length === 1 ? 'product' : 'products'}
              </span>
              {activeFilter && (
                <button
                  onClick={() => setActiveFilter(null)}
                  className="text-xs text-harvics-gold border border-harvics-gold/30 px-2 py-0.5 hover:bg-harvics-gold/5 transition-colors duration-200"
                >
                  ✕ Clear filter
                </button>
              )}
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'name' | 'price')}
              className="text-sm text-harvics-burgundy bg-white border border-harvics-gold/20 px-3 py-1.5 focus:border-harvics-gold focus:outline-none transition-colors"
            >
              <option value="name">Sort by Name</option>
              <option value="price">Sort by Price</option>
            </select>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedProducts.map((product, idx) => {
              const existingImage = getProductImage(product.keywords)
              const hasValidImage = existingImage && !existingImage.includes('placeholder')

              return (
                <div
                  key={idx}
                  className="group bg-white border border-harvics-gold/15 transition-all duration-300 hover:border-harvics-gold/50 overflow-hidden"
                  onMouseEnter={() => setHoveredProduct(idx)}
                  onMouseLeave={() => setHoveredProduct(null)}
                  style={{
                    opacity: productSection.inView ? 1 : 0,
                    transform: productSection.inView ? 'translateY(0)' : 'translateY(20px)',
                    transitionDelay: `${Math.min(idx * 40, 400) + 300}ms`,
                  }}
                >
                  {/* Image */}
                  <div className="relative h-[200px] bg-white border-b border-harvics-gold/10 overflow-hidden">
                    {hasValidImage ? (
                      <img
                        src={existingImage}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                        loading="lazy"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; (e.target as HTMLImageElement).parentElement!.innerHTML = '<span class="absolute inset-0 flex items-center justify-center text-5xl opacity-20">📦</span>' }}
                      />
                    ) : (
                      <SmartImage
                        alt={product.name}
                        context={{
                          category: (product as any).subcategory || vertical.key,
                          product: product.name,
                          industry: vertical.key,
                        }}
                        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                        fallbackSrc="/assets/shared/decorative/placeholder.png"
                      />
                    )}
                    {/* Overlay gradient on hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-harvics-burgundy/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    {/* Quick action on hover */}
                    <div className="absolute bottom-3 left-3 right-3 flex gap-2 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                      <Link
                        href={`/${locale}/contact`}
                        className="flex-1 text-center text-xs font-semibold uppercase tracking-wider py-2 bg-harvics-gold text-harvics-burgundy hover:bg-[#d4b46e] transition-colors duration-200"
                      >
                        Enquire
                      </Link>
                    </div>
                  </div>
                  {/* Info */}
                  <div className="p-4">
                    <h4 className="text-sm font-semibold text-harvics-burgundy mb-1 group-hover:text-harvics-gold transition-colors duration-200">
                      {product.name}
                    </h4>
                    {product.desc && (
                      <p className="text-xs text-harvics-burgundy/45 mb-2 leading-relaxed line-clamp-2">{product.desc}</p>
                    )}
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-bold text-harvics-gold">{product.price}</div>
                      {product.icon && <span className="text-lg">{product.icon}</span>}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {sortedProducts.length === 0 && (
            <div className="text-center py-20 text-harvics-burgundy/30">
              <div className="text-5xl mb-4 opacity-30">📦</div>
              <p className="text-lg font-medium mb-2">No products in this category yet.</p>
              <p className="text-sm text-harvics-burgundy/40">Try selecting a different category or clearing your filter.</p>
            </div>
          )}
        </div>
      </div>

      {/* ═══════ CTA BANNER ═══════ */}
      <section
        ref={ctaSection.ref}
        className="relative bg-harvics-burgundy border-t border-harvics-gold/20 overflow-hidden"
      >
        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, #C3A35E 1px, transparent 0)',
            backgroundSize: '24px 24px',
          }} />
        <div className="max-w-[1200px] mx-auto px-4 py-16 flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
          <div
            className="transition-all duration-700"
            style={{
              opacity: ctaSection.inView ? 1 : 0,
              transform: ctaSection.inView ? 'translateX(0)' : 'translateX(-20px)',
            }}
          >
            <h3 className="text-2xl font-semibold text-white mb-2" style={{ letterSpacing: '-0.02em' }}>
              Ready to Source {vertical.label}?
            </h3>
            <p className="text-white/45 text-sm max-w-[400px]">
              Connect with our global team for competitive quotes, factory-direct partnerships, and end-to-end supply chain solutions.
            </p>
          </div>
          <div
            className="flex gap-3 transition-all duration-700 delay-200"
            style={{
              opacity: ctaSection.inView ? 1 : 0,
              transform: ctaSection.inView ? 'translateX(0)' : 'translateX(20px)',
            }}
          >
            <Link
              href={`/${locale}/contact`}
              className="group relative px-8 py-3.5 bg-harvics-gold text-harvics-burgundy text-sm font-bold uppercase tracking-wider overflow-hidden"
            >
              <span className="relative z-10">Get a Quote</span>
              <span className="absolute inset-0 bg-[#d4b46e] translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
            </Link>
            <Link
              href={`/${locale}`}
              className="px-8 py-3.5 border border-harvics-gold/30 text-harvics-gold text-sm font-medium hover:border-harvics-gold hover:bg-harvics-gold/5 transition-all duration-300"
            >
              ← All Industries
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}

export default VerticalPageClient
