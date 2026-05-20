'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { slugify, type NavVertical } from '@/data/megaMenuData'
import { getVerticalProducts, getVerticalSubcategories, getSubcategoryProducts, getProductImage, type Product } from '@/data/productCatalog'
import { getVerticalLanding, getAllCategoryDescriptions } from '@/data/verticalDescriptions'
import SmartImage from '@/components/ui/SmartImage'
import ImageCarousel from '@/components/ui/ImageCarousel'

/* ───── Animated Counter Hook ───── */
function useAnimatedCounter(target: string, isVisible: boolean) {
  const [display, setDisplay] = useState('0')
  const numericPart = parseInt(target.replace(/[^0-9]/g, ''), 10)
  const suffix = target.replace(/[0-9,]/g, '')

  useEffect(() => {
    if (!isVisible || isNaN(numericPart)) {
      setDisplay(target)
      return
    }
    let frame = 0
    const totalFrames = 40
    const timer = setInterval(() => {
      frame++
      const progress = frame / totalFrames
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = Math.round(numericPart * eased)
      setDisplay(current.toLocaleString() + suffix)
      if (frame >= totalFrames) clearInterval(timer)
    }, 30)
    return () => clearInterval(timer)
  }, [isVisible, numericPart, suffix, target])

  return display
}

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

/* ───── Stat Card ───── */
const StatCard: React.FC<{ label: string; value: string; isVisible: boolean; delay: number }> = ({ label, value, isVisible, delay }) => {
  const display = useAnimatedCounter(value, isVisible)
  return (
    <div
      className="text-center transition-all duration-700 ease-out"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(24px)',
        transitionDelay: `${delay}ms`,
      }}
    >
      <div className="text-3xl md:text-4xl font-bold text-[#C3A35E] tabular-nums">{display}</div>
      <div className="text-xs text-white/50 uppercase tracking-[0.15em] mt-1.5 font-medium">{label}</div>
    </div>
  )
}

/** Rich descriptions & stats for each vertical */
const verticalMeta: Record<string, { tagline: string; description: string; stats: { label: string; value: string }[]; icon: string; gradient: string }> = {
  textiles: {
    tagline: 'Apparel, Fabrics & Home Textiles',
    description: 'From premium menswear and womenswear to home textiles and accessories — Harvics sources, manufactures, and distributes across the full textile value chain. Factory-direct partnerships in South Asia, Turkey, and China.',
    stats: [{ label: 'Categories', value: '17' }, { label: 'SKUs', value: '2,400+' }, { label: 'Countries', value: '22' }],
    icon: '🧵',
    gradient: 'from-[#6B1F2B] via-[#5a1a24] to-[#4a1520]',
  },
  fmcg: {
    tagline: 'Food, Personal Care & Home Care',
    description: 'Full FMCG distribution — staples, dairy, packaged foods, beverages, personal care, and home care. Cold chain logistics, in-market distribution, and AI-driven demand forecasting.',
    stats: [{ label: 'Product Lines', value: '6' }, { label: 'SKUs', value: '1,800+' }, { label: 'Retail Points', value: '15,000+' }],
    icon: '🛒',
    gradient: 'from-[#6B1F2B] via-[#5c2030] to-[#4d1825]',
  },
  commodities: {
    tagline: 'Agri, Energy, Metals & Softs',
    description: 'Strategic commodities trading — energy, metals, agricultural products, edible oils, proteins, and industrial chemicals. Spot and contract-based trading with global counterparties.',
    stats: [{ label: 'Verticals', value: '10' }, { label: 'Trade Volume', value: '$120M+' }, { label: 'Partners', value: '80+' }],
    icon: '📦',
    gradient: 'from-[#6B1F2B] via-[#582028] to-[#461820]',
  },
  industrial: {
    tagline: 'Chemicals, Machinery & Safety',
    description: 'Industrial procurement and supply — CNC machinery, safety equipment, copper wire, iron ore, and MRO supplies. Turnkey solutions for manufacturing and construction sectors.',
    stats: [{ label: 'Product Range', value: '500+' }, { label: 'Industries Served', value: '12' }, { label: 'Countries', value: '15' }],
    icon: '🏭',
    gradient: 'from-[#6B1F2B] via-[#551d24] to-[#40151c]',
  },
  minerals: {
    tagline: 'Metals, Energy & Precious Minerals',
    description: 'Mining and minerals trading — iron ore, copper, aluminum, coal, lithium, gold, silver, and platinum. From mine to market with full compliance and traceability.',
    stats: [{ label: 'Mineral Types', value: '14' }, { label: 'Mining Partners', value: '25+' }, { label: 'Regions', value: '8' }],
    icon: '⛏️',
    gradient: 'from-[#6B1F2B] via-[#5a1e28] to-[#491620]',
  },
  'oil-gas': {
    tagline: 'Upstream, Midstream & Downstream',
    description: 'End-to-end oil & gas services — exploration, pipeline EPC, refinery operations, trading & offtake, and HSE compliance. Operating across the Middle East, Africa, and Central Asia.',
    stats: [{ label: 'Service Lines', value: '4' }, { label: 'Projects', value: '30+' }, { label: 'Countries', value: '11' }],
    icon: '🛢️',
    gradient: 'from-[#6B1F2B] via-[#501a22] to-[#3a1018]',
  },
  'real-estate': {
    tagline: 'Commercial, Residential & Industrial',
    description: 'Real estate development and facilities management — Grade-A offices, luxury residences, industrial parks, SEZ facilities, and full FM services across the GCC and South Asia.',
    stats: [{ label: 'Asset Classes', value: '4' }, { label: 'Sq Ft Managed', value: '2M+' }, { label: 'Cities', value: '8' }],
    icon: '🏢',
    gradient: 'from-[#6B1F2B] via-[#5e1f2c] to-[#4a1520]',
  },
  sourcing: {
    tagline: 'Global Sourcing & Quality Control',
    description: 'Strategic sourcing, OEM/ODM manufacturing, quality inspection, logistics consulting, and sustainable procurement. AI-powered supplier matching and blockchain traceability.',
    stats: [{ label: 'Services', value: '8' }, { label: 'Factories Audited', value: '400+' }, { label: 'Countries', value: '18' }],
    icon: '🔍',
    gradient: 'from-[#6B1F2B] via-[#571c26] to-[#441420]',
  },
  finance: {
    tagline: 'Trade Finance, HPay & Risk',
    description: 'Financial services for global trade — letters of credit, forfaiting, digital wallets (HPay), invoicing, reconciliation, KYC/AML compliance, and risk scoring.',
    stats: [{ label: 'Products', value: '12' }, { label: 'Transactions/Mo', value: '50K+' }, { label: 'Compliance', value: '100%' }],
    icon: '💳',
    gradient: 'from-[#6B1F2B] via-[#5d1e2b] to-[#4c1622]',
  },
  ai: {
    tagline: 'Forecasting, Vision & Integration',
    description: 'AI-powered enterprise solutions — demand forecasting, computer vision for QC, conversational AI, data pipelines, ERP integration, and mobile apps. Built on Harvics\' proprietary ML models.',
    stats: [{ label: 'Models', value: '6' }, { label: 'Accuracy', value: '94%+' }, { label: 'Integrations', value: '15+' }],
    icon: '🤖',
    gradient: 'from-[#6B1F2B] via-[#541b25] to-[#3e1018]',
  },
}

/** Unsplash hero images for each vertical */
const verticalHeroImages: Record<string, string> = {
  textiles: 'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=1200&h=600&fit=crop&q=75',
  fmcg: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=1200&h=600&fit=crop&q=75',
  commodities: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1200&h=600&fit=crop&q=75',
  industrial: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1200&h=600&fit=crop&q=75',
  minerals: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=1200&h=600&fit=crop&q=75',
  'oil-gas': 'https://images.unsplash.com/photo-1513828583688-c52646db42da?w=1200&h=600&fit=crop&q=75',
  'real-estate': 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&h=600&fit=crop&q=75',
  sourcing: 'https://images.unsplash.com/photo-1553413077-190dd305871c?w=1200&h=600&fit=crop&q=75',
  finance: 'https://images.unsplash.com/photo-1560472355-536de3962603?w=1200&h=600&fit=crop&q=75',
  ai: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&h=600&fit=crop&q=75',
}

const verticalHeroSlides: Record<string, string[]> = {
  industrial: [
    '/Industries Picture/Industrial Solutions.jpg',
    '/Images/industrialsolutions.webp',
    '/Images/industrialsolutions.png',
  ],
}

const defaultHeroSlides = [
  'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&h=600&fit=crop&q=75',
  'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=600&fit=crop&q=75',
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
  const meta = verticalMeta[vertical.key] || { tagline: '', description: '', stats: [], icon: '📊', gradient: 'from-[#6B1F2B] to-[#4a1520]' }
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

  const heroSlides = verticalHeroSlides[vertical.key] || [
    verticalHeroImages[vertical.key],
    ...defaultHeroSlides,
  ]

  return (
    <main className="min-h-screen" style={{ background: '#ffffff' }}>
      {/* ═══════ HERO BANNER ═══════ */}
      <section
        ref={heroSection.ref}
        className={`relative bg-gradient-to-br ${meta.gradient} py-24 md:py-32 px-4 overflow-hidden border-b border-[#C3A35E]/20`}
      >
        {/* Hero Background Image */}
        {heroSlides.length > 0 ? (
          <div className="absolute inset-0">
            <ImageCarousel images={heroSlides} autoSlideInterval={4500} height="h-full" />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(105deg, rgba(107,31,43,0.82) 0%, rgba(107,31,43,0.48) 45%, rgba(107,31,43,0.24) 100%)' }} />
          </div>
        ) : verticalHeroImages[vertical.key] && (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={verticalHeroImages[vertical.key]}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
              style={{ filter: 'brightness(0.75) contrast(1.1) saturate(1.05)' }}
            />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(105deg, rgba(107,31,43,0.85) 0%, rgba(107,31,43,0.5) 45%, rgba(107,31,43,0.25) 100%)' }} />
          </>
        )}
        {/* Top gold accent */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#C3A35E]/40 to-transparent" />

        <div className="max-w-[1200px] mx-auto relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-10">
            <div className="lg:max-w-[680px]">
              {/* Breadcrumb */}
              <nav
                className="flex items-center text-xs text-white/60 mb-6 transition-all duration-700"
                style={{
                  opacity: heroSection.inView ? 1 : 0,
                  transform: heroSection.inView ? 'translateY(0)' : 'translateY(12px)',
                }}
              >
                <Link href={`/${locale}`} className="hover:text-[#C3A35E] transition-colors">Home</Link>
                <span className="mx-2 text-[#C3A35E]/40">—</span>
                <span className="text-[#C3A35E] font-medium">{vertical.label}</span>
              </nav>

              {/* Tagline badge */}
              <div
                className="transition-all duration-700 delay-100"
                style={{
                  opacity: heroSection.inView ? 1 : 0,
                  transform: heroSection.inView ? 'translateY(0)' : 'translateY(16px)',
                }}
              >
                <span className="inline-block text-xs text-[#C3A35E] font-bold uppercase tracking-[0.25em] mb-4 border border-[#C3A35E]/30 px-3 py-1">
                  {meta.tagline || 'Harvics Global Ventures'}
                </span>
              </div>

              {/* Title */}
              <h1
                className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-5 transition-all duration-700 delay-200"
                style={{
                  letterSpacing: '-0.03em',
                  lineHeight: 1.1,
                  opacity: heroSection.inView ? 1 : 0,
                  transform: heroSection.inView ? 'translateY(0)' : 'translateY(20px)',
                }}
              >
                {vertical.label}
              </h1>

              {/* Description */}
              <p
                className="text-base md:text-lg text-white/55 leading-relaxed max-w-[580px] mb-8 transition-all duration-700 delay-300"
                style={{
                  opacity: heroSection.inView ? 1 : 0,
                  transform: heroSection.inView ? 'translateY(0)' : 'translateY(16px)',
                }}
              >
                {meta.description || `Comprehensive supply chain solutions across ${vertical.blocks.length} categories and ${allProducts.length}+ products.`}
              </p>

              {/* CTA Buttons */}
              <div
                className="flex flex-wrap gap-3 transition-all duration-700 delay-[400ms]"
                style={{
                  opacity: heroSection.inView ? 1 : 0,
                  transform: heroSection.inView ? 'translateY(0)' : 'translateY(16px)',
                }}
              >
                <Link
                  href={`/${locale}/contact`}
                  className="group relative px-7 py-3 bg-[#C3A35E] text-[#6B1F2B] text-sm font-bold uppercase tracking-wider overflow-hidden"
                >
                  <span className="relative z-10">Get a Quote</span>
                  <span className="absolute inset-0 bg-[#d4b46e] translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                </Link>
                <a
                  href="#products"
                  className="px-7 py-3 border border-[#C3A35E]/30 text-white text-sm font-medium uppercase tracking-wider hover:border-[#C3A35E] hover:bg-[#C3A35E]/10 transition-all duration-300"
                >
                  Browse Products
                </a>
              </div>
            </div>

            {/* Stats */}
            {meta.stats.length > 0 && (
              <div className="flex gap-8 lg:gap-12 lg:pb-2">
                {meta.stats.map((s, i) => (
                  <StatCard key={s.label} label={s.label} value={s.value} isVisible={heroSection.inView} delay={500 + i * 150} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Bottom gold accent */}
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#C3A35E]/30 to-transparent" />
      </section>

      {/* ═══════ CATEGORY BLOCKS ═══════ */}
      <section ref={categorySection.ref} className="bg-white border-b border-[#C3A35E]/15 py-14 px-4">
        <div className="max-w-[1200px] mx-auto">
          {landing && (
            <div
              className="text-center mb-10 transition-all duration-700"
              style={{
                opacity: categorySection.inView ? 1 : 0,
                transform: categorySection.inView ? 'translateY(0)' : 'translateY(20px)',
              }}
            >
              <h2 className="text-2xl font-semibold text-[#6B1F2B] mb-2" style={{ letterSpacing: '-0.02em' }}>
                {landing.title}
              </h2>
              <p className="text-sm text-[#6B1F2B]/45 max-w-[550px] mx-auto leading-relaxed">{landing.description}</p>
              <div className="w-12 h-[2px] bg-[#C3A35E]/40 mx-auto mt-4" />
            </div>
          )}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {vertical.blocks.map((block, i) => {
              const catDesc = categoryDescs[slugify(block.title)] || categoryDescs[block.title.toLowerCase()]
              return (
                <Link
                  key={block.title}
                  href={`/${locale}/${vertical.key}/${slugify(block.title)}`}
                  className="group relative bg-white/60 border border-[#C3A35E]/15 px-5 py-5 text-center transition-all duration-300 hover:bg-[#6B1F2B] hover:border-[#6B1F2B] overflow-hidden"
                  title={catDesc?.description || ''}
                  style={{
                    opacity: categorySection.inView ? 1 : 0,
                    transform: categorySection.inView ? 'translateY(0)' : 'translateY(16px)',
                    transitionDelay: `${150 + i * 60}ms`,
                  }}
                >
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#C3A35E] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                  <div className="text-sm font-semibold text-[#6B1F2B] group-hover:text-white transition-colors duration-300">
                    {block.title}
                  </div>
                  <span className="block text-xs text-[#6B1F2B]/40 group-hover:text-white/50 font-normal mt-1.5 transition-colors duration-300">
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
            className="border border-[#C3A35E]/20 bg-white p-5 transition-all duration-700"
            style={{
              position: 'sticky',
              top: '100px',
              opacity: productSection.inView ? 1 : 0,
              transform: productSection.inView ? 'translateX(0)' : 'translateX(-20px)',
            }}
          >
            <h3 className="text-xs font-bold text-[#6B1F2B] uppercase tracking-[0.15em] mb-4 flex items-center gap-2">
              <span className="w-4 h-[2px] bg-[#C3A35E]" />
              Categories
            </h3>
            <button
              onClick={() => setActiveFilter(null)}
              className={`block w-full text-left text-sm py-2.5 border-b border-[#C3A35E]/10 transition-all duration-200 ${
                !activeFilter ? 'text-[#6B1F2B] font-bold pl-2 border-l-2 border-l-[#C3A35E]' : 'text-[#6B1F2B]/50 hover:text-[#6B1F2B] hover:pl-1'
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
                  className={`block w-full text-left text-sm py-2.5 border-b border-[#C3A35E]/10 transition-all duration-200 capitalize ${
                    activeFilter === sub ? 'text-[#6B1F2B] font-bold pl-2 border-l-2 border-l-[#C3A35E]' : 'text-[#6B1F2B]/50 hover:text-[#6B1F2B] hover:pl-1'
                  }`}
                >
                  {sub.replace(/([A-Z])/g, ' $1').trim()} ({count})
                </button>
              )
            })}

            {/* Explore links */}
            <h3 className="text-xs font-bold text-[#6B1F2B] uppercase tracking-[0.15em] mt-7 mb-3 flex items-center gap-2">
              <span className="w-4 h-[2px] bg-[#C3A35E]" />
              Explore
            </h3>
            {vertical.blocks.map((block) => (
              <Link
                key={block.title}
                href={`/${locale}/${vertical.key}/${slugify(block.title)}`}
                className="group block text-sm text-[#6B1F2B]/50 hover:text-[#6B1F2B] py-2 border-b border-[#C3A35E]/10 transition-all duration-200"
              >
                <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-[#C3A35E] mr-1">›</span>
                {block.title}
              </Link>
            ))}
          </div>
        </aside>

        {/* Product Grid */}
        <div className="flex-1">
          {/* Sort bar */}
          <div
            className="flex items-center justify-between mb-6 border-b border-[#C3A35E]/15 pb-4 transition-all duration-700 delay-200"
            style={{
              opacity: productSection.inView ? 1 : 0,
              transform: productSection.inView ? 'translateY(0)' : 'translateY(12px)',
            }}
          >
            <div className="flex items-center gap-3">
              <span className="text-sm text-[#6B1F2B]/60">
                <strong className="text-[#6B1F2B] font-semibold">{sortedProducts.length}</strong>{' '}
                {sortedProducts.length === 1 ? 'product' : 'products'}
              </span>
              {activeFilter && (
                <button
                  onClick={() => setActiveFilter(null)}
                  className="text-xs text-[#C3A35E] border border-[#C3A35E]/30 px-2 py-0.5 hover:bg-[#C3A35E]/5 transition-colors duration-200"
                >
                  ✕ Clear filter
                </button>
              )}
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'name' | 'price')}
              className="text-sm text-[#6B1F2B] bg-white border border-[#C3A35E]/20 px-3 py-1.5 focus:border-[#C3A35E] focus:outline-none transition-colors"
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
                  className="group bg-white border border-[#C3A35E]/15 transition-all duration-300 hover:border-[#C3A35E]/50 overflow-hidden"
                  onMouseEnter={() => setHoveredProduct(idx)}
                  onMouseLeave={() => setHoveredProduct(null)}
                  style={{
                    opacity: productSection.inView ? 1 : 0,
                    transform: productSection.inView ? 'translateY(0)' : 'translateY(20px)',
                    transitionDelay: `${Math.min(idx * 40, 400) + 300}ms`,
                  }}
                >
                  {/* Image */}
                  <div className="relative h-[200px] bg-white border-b border-[#C3A35E]/10 overflow-hidden">
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
                        fallbackSrc="/Images/placeholder.png"
                      />
                    )}
                    {/* Overlay gradient on hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#6B1F2B]/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    {/* Quick action on hover */}
                    <div className="absolute bottom-3 left-3 right-3 flex gap-2 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                      <Link
                        href={`/${locale}/contact`}
                        className="flex-1 text-center text-xs font-semibold uppercase tracking-wider py-2 bg-[#C3A35E] text-[#6B1F2B] hover:bg-[#d4b46e] transition-colors duration-200"
                      >
                        Enquire
                      </Link>
                    </div>
                  </div>
                  {/* Info */}
                  <div className="p-4">
                    <h4 className="text-sm font-semibold text-[#6B1F2B] mb-1 group-hover:text-[#C3A35E] transition-colors duration-200">
                      {product.name}
                    </h4>
                    {product.desc && (
                      <p className="text-xs text-[#6B1F2B]/45 mb-2 leading-relaxed line-clamp-2">{product.desc}</p>
                    )}
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-bold text-[#C3A35E]">{product.price}</div>
                      {product.icon && <span className="text-lg">{product.icon}</span>}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {sortedProducts.length === 0 && (
            <div className="text-center py-20 text-[#6B1F2B]/30">
              <div className="text-5xl mb-4 opacity-30">📦</div>
              <p className="text-lg font-medium mb-2">No products in this category yet.</p>
              <p className="text-sm text-[#6B1F2B]/40">Try selecting a different category or clearing your filter.</p>
            </div>
          )}
        </div>
      </div>

      {/* ═══════ CTA BANNER ═══════ */}
      <section
        ref={ctaSection.ref}
        className="relative bg-[#6B1F2B] border-t border-[#C3A35E]/20 overflow-hidden"
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
              className="group relative px-8 py-3.5 bg-[#C3A35E] text-[#6B1F2B] text-sm font-bold uppercase tracking-wider overflow-hidden"
            >
              <span className="relative z-10">Get a Quote</span>
              <span className="absolute inset-0 bg-[#d4b46e] translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
            </Link>
            <Link
              href={`/${locale}`}
              className="px-8 py-3.5 border border-[#C3A35E]/30 text-[#C3A35E] text-sm font-medium hover:border-[#C3A35E] hover:bg-[#C3A35E]/5 transition-all duration-300"
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
