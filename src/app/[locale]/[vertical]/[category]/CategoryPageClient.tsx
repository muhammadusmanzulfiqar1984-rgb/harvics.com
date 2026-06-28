'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { slugify, type NavVertical } from '@/data/megaMenuData'
import { getProductImage } from '@/data/productCatalog'
import SmartImage from '@/components/ui/SmartImage'
import ImageCarousel from '@/components/ui/ImageCarousel'

const verticalFallbackSlides: Record<string, string[]> = {
  textiles:      ['/assets/verticals/01-apparels/hero.jpg'],
  fmcg:          ['/assets/verticals/02-fmcg/hero.jpg'],
  commodities:   ['/assets/verticals/03-commodities/hero.jpg'],
  industrial:    ['/assets/verticals/04-industrial/hero.jpg'],
  minerals:      ['/assets/verticals/05-minerals/hero.jpg'],
  'oil-gas':     ['/assets/verticals/06-oil-gas/hero.jpg'],
  'real-estate': ['/assets/verticals/07-real-estate/hero.jpg'],
  sourcing:      ['/assets/verticals/08-sourcing/hero.jpg'],
  finance:       ['/assets/verticals/09-finance/hero.jpg'],
  ai:            ['/assets/verticals/10-ai-tech/hero.jpg'],
}

const defaultSlides = [
  '/assets/verticals/02-fmcg/hero.jpg',
  '/assets/verticals/01-apparels/hero.jpg',
]

/* ───── Intersection Observer Hook ───── */
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

/* ───── Vertical Icon Map ───── */
const verticalIcons: Record<string, string> = {
  textiles: '🧵', fmcg: '🛒', commodities: '📦', industrial: '🏭',
  minerals: '⛏️', 'oil-gas': '🛢️', 'real-estate': '🏢', sourcing: '🔍',
  finance: '💳', ai: '🤖',
}

interface CategoryPageClientProps {
  locale: string
  vertical: string
  category: string
  verticalData: NavVertical
  block: { title: string; items: string[] }
  products: any[]
  catDesc: { description: string; highlights: string[] } | null | undefined
}

const CategoryPageClient: React.FC<CategoryPageClientProps> = ({
  locale, vertical, category, verticalData, block, products, catDesc,
}) => {
  const heroRef = useInView(0.1)
  const gridRef = useInView(0.1)
  const productsRef = useInView(0.1)
  const ctaRef = useInView(0.2)

  const icon = verticalIcons[vertical] || '📊'
  const categoryImage = getProductImage(block.title.toLowerCase())
  const categorySlides = [
    categoryImage,
    ...(verticalFallbackSlides[vertical] || []),
    ...defaultSlides,
  ].filter((src, index, arr) => Boolean(src) && !String(src).includes('placeholder') && arr.indexOf(src) === index)

  return (
    <main className="min-h-screen" style={{ background: '#ffffff' }}>
      {/* ═══════ BREADCRUMBS ═══════ */}
      <div className="bg-gradient-to-r from-[#5a1a24] to-[#4a1018] border-b border-[#C3A35E]/15">
        <div className="max-w-[1200px] mx-auto px-4 py-3 flex items-center gap-2 text-xs text-white/50">
          <Link href={`/${locale}`} className="hover:text-[#C3A35E] transition-colors duration-200">Home</Link>
          <span className="text-[#C3A35E]/30">—</span>
          <Link href={`/${locale}/${vertical}`} className="hover:text-[#C3A35E] transition-colors duration-200">{verticalData.label}</Link>
          <span className="text-[#C3A35E]/30">—</span>
          <span className="text-[#C3A35E] font-medium">{block.title}</span>
        </div>
      </div>

      {/* ═══════ HERO ═══════ */}
      <section
        ref={heroRef.ref}
        className="relative bg-gradient-to-br from-[#3D1212] via-[#5a1a24] to-[#4a1520] py-20 md:py-24 px-4 overflow-hidden"
      >
        {/* Background image for all categories */}
        <div className="absolute inset-0">
          <ImageCarousel images={categorySlides} autoSlideInterval={4500} height="h-full" />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(105deg, rgba(107,31,43,0.85) 0%, rgba(107,31,43,0.5) 45%, rgba(107,31,43,0.25) 100%)' }} />
        </div>
        
        {/* Background decorations */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] opacity-[0.06]"
            style={{ background: 'radial-gradient(circle, #C3A35E 0%, transparent 65%)' }} />
          <div className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: 'linear-gradient(rgba(195,163,94,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(195,163,94,0.4) 1px, transparent 1px)',
              backgroundSize: '50px 50px',
            }} />
          <div className="absolute top-10 right-10 text-[100px] opacity-[0.04] select-none">{icon}</div>
        </div>

        {/* Top accent line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#C3A35E]/30 to-transparent" />

        <div className="max-w-[1200px] mx-auto relative z-10">
          <div className="text-center max-w-[700px] mx-auto">
            {/* Parent vertical badge */}
            <div
              className="transition-all duration-700"
              style={{
                opacity: heroRef.inView ? 1 : 0,
                transform: heroRef.inView ? 'translateY(0)' : 'translateY(12px)',
              }}
            >
              <Link
                href={`/${locale}/${vertical}`}
                className="inline-flex items-center gap-2 text-xs text-[#C3A35E]/80 font-bold uppercase tracking-[0.2em] mb-4 border border-[#C3A35E]/20 px-3 py-1 hover:border-[#C3A35E]/40 transition-colors duration-200"
              >
                <span>{icon}</span>
                {verticalData.label}
              </Link>
            </div>

            {/* Title */}
            <h1
              className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-5 transition-all duration-700 delay-100"
              style={{
                letterSpacing: '-0.03em',
                lineHeight: 1.15,
                opacity: heroRef.inView ? 1 : 0,
                transform: heroRef.inView ? 'translateY(0)' : 'translateY(16px)',
              }}
            >
              {block.title}
            </h1>

            {/* Description */}
            {catDesc && (
              <p
                className="text-base text-white/50 leading-relaxed max-w-[600px] mx-auto mb-6 transition-all duration-700 delay-200"
                style={{
                  opacity: heroRef.inView ? 1 : 0,
                  transform: heroRef.inView ? 'translateY(0)' : 'translateY(12px)',
                }}
              >
                {catDesc.description}
              </p>
            )}

            {/* Highlights pills */}
            {catDesc && catDesc.highlights.length > 0 && (
              <div className="flex flex-wrap justify-center gap-2 mt-6">
                {catDesc.highlights.map((h, i) => (
                  <span
                    key={h}
                    className="px-4 py-1.5 border border-[#C3A35E]/25 text-xs text-[#C3A35E] font-medium uppercase tracking-wider transition-all duration-700"
                    style={{
                      opacity: heroRef.inView ? 1 : 0,
                      transform: heroRef.inView ? 'translateY(0)' : 'translateY(10px)',
                      transitionDelay: `${300 + i * 80}ms`,
                    }}
                  >
                    {h}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Bottom accent */}
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#C3A35E]/25 to-transparent" />
      </section>

      {/* ═══════ ITEMS GRID ═══════ */}
      <div ref={gridRef.ref} className="max-w-[1200px] mx-auto px-4 py-12">
        {/* Section header */}
        <div
          className="flex items-center gap-3 mb-8 transition-all duration-700"
          style={{
            opacity: gridRef.inView ? 1 : 0,
            transform: gridRef.inView ? 'translateY(0)' : 'translateY(12px)',
          }}
        >
          <div className="w-8 h-[2px] bg-[#C3A35E]/50" />
          <h2 className="text-sm font-bold text-[#3D1212] uppercase tracking-[0.15em]">
            Browse {block.title}
          </h2>
          <span className="text-xs text-[#3D1212]/40">{block.items.length} items</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {block.items.map((item, i) => {
            const imageUrl = getProductImage(item.toLowerCase())
            return (
              <Link
                key={item}
                href={`/${locale}/${vertical}/${category}/${slugify(item)}`}
                className="group relative bg-white border border-[#C3A35E]/15 overflow-hidden transition-all duration-300 hover:border-[#C3A35E]/50"
                style={{
                  opacity: gridRef.inView ? 1 : 0,
                  transform: gridRef.inView ? 'translateY(0)' : 'translateY(20px)',
                  transitionDelay: `${100 + i * 60}ms`,
                }}
              >
                {/* Image */}
                <div className="relative h-[140px] bg-white overflow-hidden">
                  {vertical === 'textiles' ? (
                    <SmartImage
                      keyword={item.toLowerCase()}
                      alt={item}
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                    />
                  ) : (
                    <img
                      src={imageUrl}
                      alt={item}
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                      loading="lazy"
                    />
                  )}
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#3D1212]/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  {/* View label on hover */}
                  <div className="absolute bottom-2 left-0 right-0 text-center translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                    <span className="text-xs font-semibold text-white uppercase tracking-wider">View →</span>
                  </div>
                </div>
                {/* Title */}
                <div className="p-4 text-center">
                  <h3 className="text-sm font-semibold text-[#3D1212] group-hover:text-[#C3A35E] transition-colors duration-200">
                    {item}
                  </h3>
                </div>
                {/* Top accent line on hover */}
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#C3A35E] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
              </Link>
            )
          })}
        </div>
      </div>

      {/* ═══════ PRODUCTS LIST ═══════ */}
      {products.length > 0 && (
        <div ref={productsRef.ref} className="bg-white border-t border-b border-[#C3A35E]/10">
          <div className="max-w-[1200px] mx-auto px-4 py-12">
            {/* Section header */}
            <div
              className="flex items-center gap-3 mb-8 transition-all duration-700"
              style={{
                opacity: productsRef.inView ? 1 : 0,
                transform: productsRef.inView ? 'translateY(0)' : 'translateY(12px)',
              }}
            >
              <div className="w-8 h-[2px] bg-[#C3A35E]/50" />
              <h2 className="text-sm font-bold text-[#3D1212] uppercase tracking-[0.15em]">
                Products
              </h2>
              <span className="text-xs text-[#3D1212]/40">{products.length} available</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((product: any, idx: number) => {
                const imageUrl = getProductImage(product.keywords || '')
                const hasImage = imageUrl && !imageUrl.includes('placeholder')

                return (
                  <div
                    key={idx}
                    className="group bg-white/50 border border-[#C3A35E]/15 overflow-hidden transition-all duration-300 hover:border-[#C3A35E]/40"
                    style={{
                      opacity: productsRef.inView ? 1 : 0,
                      transform: productsRef.inView ? 'translateY(0)' : 'translateY(16px)',
                      transitionDelay: `${100 + idx * 50}ms`,
                    }}
                  >
                    {/* Product image */}
                    <div className="relative h-[160px] bg-white overflow-hidden border-b border-[#C3A35E]/10">
                      {hasImage ? (
                        <img
                          src={imageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                          loading="lazy"
                        />
                      ) : (
                        <SmartImage
                          alt={product.name}
                          context={{
                            category: category,
                            product: product.name,
                            industry: vertical,
                          }}
                          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                          fallbackSrc="/assets/shared/decorative/placeholder.png"
                        />
                      )}
                      {/* Overlay gradient */}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#3D1212]/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                    {/* Info */}
                    <div className="p-5">
                      <h4 className="text-sm font-semibold text-[#3D1212] mb-1 group-hover:text-[#C3A35E] transition-colors duration-200">
                        {product.name}
                      </h4>
                      {product.desc && (
                        <p className="text-xs text-[#3D1212]/45 mb-3 leading-relaxed line-clamp-2">{product.desc}</p>
                      )}
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-bold text-[#C3A35E]">{product.price}</div>
                        {product.icon && <span className="text-base">{product.icon}</span>}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* ═══════ CTA BANNER ═══════ */}
      <section
        ref={ctaRef.ref}
        className="relative bg-[#3D1212] border-t border-[#C3A35E]/20 overflow-hidden"
      >
        {/* Subtle dot pattern */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, #C3A35E 1px, transparent 0)',
            backgroundSize: '20px 20px',
          }} />
        <div className="max-w-[1200px] mx-auto px-4 py-16 flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
          <div
            className="transition-all duration-700"
            style={{
              opacity: ctaRef.inView ? 1 : 0,
              transform: ctaRef.inView ? 'translateX(0)' : 'translateX(-20px)',
            }}
          >
            <h3 className="text-2xl font-semibold text-white mb-2" style={{ letterSpacing: '-0.02em' }}>
              Need {block.title} Solutions?
            </h3>
            <p className="text-white/45 text-sm max-w-[400px]">
              Contact our sourcing team for competitive quotes, factory-direct pricing, and global supply chain solutions.
            </p>
          </div>
          <div
            className="flex gap-3 transition-all duration-700 delay-200"
            style={{
              opacity: ctaRef.inView ? 1 : 0,
              transform: ctaRef.inView ? 'translateX(0)' : 'translateX(20px)',
            }}
          >
            <Link
              href={`/${locale}/contact`}
              className="group relative px-8 py-3.5 bg-[#C3A35E] text-[#3D1212] text-sm font-bold uppercase tracking-wider overflow-hidden"
            >
              <span className="relative z-10">Get a Quote</span>
              <span className="absolute inset-0 bg-[#d4b46e] translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
            </Link>
            <Link
              href={`/${locale}/${vertical}`}
              className="px-8 py-3.5 border border-[#C3A35E]/30 text-[#C3A35E] text-sm font-medium hover:border-[#C3A35E] hover:bg-[#C3A35E]/5 transition-all duration-300"
            >
              ← {verticalData.label}
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}

export default CategoryPageClient
