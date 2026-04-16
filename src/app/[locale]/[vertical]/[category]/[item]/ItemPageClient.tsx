'use client'

import React, { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import SmartImage from '@/components/ui/SmartImage'

/* ───── Intersection Observer ───── */
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

/* ───── Types ───── */
interface ItemPageClientProps {
  locale: string
  verticalLabel: string
  verticalKey: string
  blockTitle: string
  categorySlug: string
  matchedItem: string
  itemSlug: string
  description: string
  specs: string[]
  imageSrc: string
  relatedItems: { name: string; slug: string }[]
}

/* ───── Image Zoom Lightbox ───── */
function ImageZoomLightbox({ src, alt, useSmartImage, keyword }: { src: string; alt: string; useSmartImage?: boolean; keyword?: string }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <div
        className="group relative w-full md:w-[340px] h-[280px] bg-white border border-[#C3A35E]/15 flex-shrink-0 overflow-hidden cursor-zoom-in"
        onClick={() => setIsOpen(true)}
      >
        {useSmartImage && keyword ? (
          <SmartImage
            keyword={keyword}
            alt={alt}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <img
            src={src}
            alt={alt}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
            onError={(e) => { (e.target as HTMLImageElement).src = '/Images/logo.png' }}
          />
        )}
        {/* Zoom icon overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
          <div className="w-10 h-10 bg-white/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <svg className="w-5 h-5 text-[#6B1F2B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm cursor-zoom-out"
          onClick={() => setIsOpen(false)}
        >
          <div className="relative max-w-[90vw] max-h-[85vh]">
            {useSmartImage && keyword ? (
              <SmartImage
                keyword={keyword}
                alt={alt}
                className="max-w-full max-h-[85vh] object-contain"
                style={{ animation: 'zoomIn 0.3s ease-out' }}
              />
            ) : (
              <img
                src={src}
                alt={alt}
                className="max-w-full max-h-[85vh] object-contain"
                style={{ animation: 'zoomIn 0.3s ease-out' }}
              />
            )}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute -top-3 -right-3 w-8 h-8 bg-white flex items-center justify-center text-[#6B1F2B] font-bold text-sm hover:bg-[#C3A35E] hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
          <style jsx>{`
            @keyframes zoomIn {
              from { transform: scale(0.85); opacity: 0; }
              to { transform: scale(1); opacity: 1; }
            }
          `}</style>
        </div>
      )}
    </>
  )
}

/* ───── Main Component ───── */
const ItemPageClient: React.FC<ItemPageClientProps> = ({
  locale,
  verticalLabel,
  verticalKey,
  blockTitle,
  categorySlug,
  matchedItem,
  itemSlug,
  description,
  specs,
  imageSrc,
  relatedItems,
}) => {
  const heroRef = useInView(0.1)
  const contentRef = useInView(0.1)
  const specsRef = useInView(0.15)
  const relatedRef = useInView(0.1)
  const ctaRef = useInView(0.15)

  return (
    <main className="min-h-screen" style={{ background: '#ffffff' }}>
      {/* ═══════ BREADCRUMBS ═══════ */}
      <div className="bg-[#5a1a24] border-b border-[#C3A35E]/20">
        <div className="max-w-[1200px] mx-auto px-4 py-3 flex items-center gap-2 text-sm text-white/50">
          <Link href={`/${locale}`} className="hover:text-[#C3A35E] transition-colors duration-200">Home</Link>
          <span className="text-white/20">›</span>
          <Link href={`/${locale}/${verticalKey}`} className="hover:text-[#C3A35E] transition-colors duration-200">{verticalLabel}</Link>
          <span className="text-white/20">›</span>
          <Link href={`/${locale}/${verticalKey}/${categorySlug}`} className="hover:text-[#C3A35E] transition-colors duration-200">{blockTitle}</Link>
          <span className="text-white/20">›</span>
          <span className="text-[#C3A35E] font-medium">{matchedItem}</span>
        </div>
      </div>

      {/* ═══════ HERO ═══════ */}
      <section
        ref={heroRef.ref}
        className="relative bg-gradient-to-br from-[#6B1F2B] via-[#5a1a24] to-[#4a1520] py-16 px-4 overflow-hidden"
      >
        {/* Hero Background Image */}
        <div className="absolute inset-0">
          <SmartImage
            keyword={matchedItem.toLowerCase()}
            alt=""
            className="w-full h-full object-cover"
            style={{ filter: 'brightness(0.75) contrast(1.1) saturate(1.05)' }}
          />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(105deg, rgba(107,31,43,0.85) 0%, rgba(107,31,43,0.5) 45%, rgba(107,31,43,0.25) 100%)' }} />
        </div>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] opacity-[0.05]"
            style={{ background: 'radial-gradient(circle, #C3A35E 0%, transparent 65%)' }} />
          <div className="absolute inset-0 opacity-[0.02]"
            style={{
              backgroundImage: 'linear-gradient(rgba(195,163,94,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(195,163,94,0.5) 1px, transparent 1px)',
              backgroundSize: '50px 50px',
            }} />
        </div>
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#C3A35E]/30 to-transparent" />

        <div className="relative z-10 max-w-[1200px] mx-auto text-center">
          <div
            className="transition-all duration-700"
            style={{ opacity: heroRef.inView ? 1 : 0, transform: heroRef.inView ? 'translateY(0)' : 'translateY(12px)' }}
          >
            <span className="inline-block text-[10px] font-bold text-[#C3A35E] uppercase tracking-[0.25em] mb-4 border border-[#C3A35E]/25 px-3 py-1">
              {verticalLabel} · {blockTitle}
            </span>
          </div>
          <h1
            className="text-3xl md:text-4xl font-bold text-white mb-3 transition-all duration-700 delay-100"
            style={{
              letterSpacing: '-0.02em',
              opacity: heroRef.inView ? 1 : 0,
              transform: heroRef.inView ? 'translateY(0)' : 'translateY(16px)',
            }}
          >
            {matchedItem}
          </h1>
          {description && (
            <p
              className="text-sm text-white/45 max-w-[600px] mx-auto leading-relaxed transition-all duration-700 delay-200"
              style={{ opacity: heroRef.inView ? 1 : 0, transform: heroRef.inView ? 'translateY(0)' : 'translateY(12px)' }}
            >
              {description.slice(0, 140)}…
            </p>
          )}
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#C3A35E]/25 to-transparent" />
      </section>

      {/* ═══════ CONTENT ═══════ */}
      <div ref={contentRef.ref} className="max-w-[960px] mx-auto px-4 py-12">
        <div
          className="bg-white border border-[#C3A35E]/15 p-8 md:p-10 transition-all duration-700"
          style={{
            opacity: contentRef.inView ? 1 : 0,
            transform: contentRef.inView ? 'translateY(0)' : 'translateY(24px)',
          }}
        >
          <div className="flex flex-col md:flex-row gap-8">
            {/* Product Image with Zoom */}
            <ImageZoomLightbox 
              src={imageSrc} 
              alt={matchedItem}
              useSmartImage={verticalKey === 'textiles'}
              keyword={matchedItem.toLowerCase()}
            />

            {/* Details */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-5 h-[2px] bg-[#C3A35E]/50" />
                <span className="text-[10px] font-bold text-[#C3A35E] uppercase tracking-[0.2em]">Product Details</span>
              </div>
              <h2 className="text-xl font-bold text-[#6B1F2B] mb-4" style={{ letterSpacing: '-0.01em' }}>{matchedItem}</h2>
              <p className="text-sm text-[#6B1F2B]/50 leading-relaxed mb-6">
                {description ||
                  `Harvics provides comprehensive ${matchedItem.toLowerCase()} solutions as part of our ${blockTitle.toLowerCase()} portfolio within the ${verticalLabel.toLowerCase()} vertical. Backed by our global supply chain network operating across multiple continents.`}
              </p>

              {/* Specs Table */}
              {specs.length > 0 && (
                <div ref={specsRef.ref} className="mb-6">
                  <h3 className="text-[10px] font-bold text-[#6B1F2B] uppercase tracking-[0.15em] mb-3">Specifications</h3>
                  <div className="space-y-0">
                    {specs.map((spec, idx) => {
                      const [label, ...rest] = spec.split(':')
                      const value = rest.join(':').trim()
                      return (
                        <div
                          key={idx}
                          className="flex justify-between text-sm py-2.5 border-b border-[#C3A35E]/8 transition-all duration-500"
                          style={{
                            opacity: specsRef.inView ? 1 : 0,
                            transform: specsRef.inView ? 'translateX(0)' : 'translateX(-8px)',
                            transitionDelay: `${idx * 60}ms`,
                          }}
                        >
                          <span className="text-[#6B1F2B]/40 font-medium text-xs uppercase tracking-wider">{label}</span>
                          <span className="font-semibold text-[#6B1F2B] text-right max-w-[60%] text-sm">{value}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Meta Info */}
              <div className="border-t border-[#C3A35E]/15 pt-4 space-y-2.5">
                {[
                  { label: 'Vertical', value: verticalLabel },
                  { label: 'Category', value: blockTitle },
                  { label: 'Availability', value: 'Global', isGold: true },
                ].map((meta) => (
                  <div key={meta.label} className="flex justify-between text-sm">
                    <span className="text-[#6B1F2B]/40 text-xs uppercase tracking-wider">{meta.label}</span>
                    <span className={`font-semibold ${meta.isGold ? 'text-[#C3A35E]' : 'text-[#6B1F2B]'}`}>{meta.value}</span>
                  </div>
                ))}
              </div>

              {/* CTA Button */}
              <Link
                href={`/${locale}/contact`}
                className="group relative inline-block mt-6 px-8 py-3 bg-[#6B1F2B] text-white text-sm font-semibold border border-[#6B1F2B] overflow-hidden transition-all duration-300"
              >
                <span className="relative z-10">Request Quote</span>
                <div className="absolute inset-0 bg-[#5a1a24] transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300" />
              </Link>
            </div>
          </div>
        </div>

        {/* ═══════ RELATED ITEMS ═══════ */}
        {relatedItems.length > 0 && (
          <div ref={relatedRef.ref} className="mt-12">
            <div
              className="flex items-center gap-2 mb-5 transition-all duration-700"
              style={{ opacity: relatedRef.inView ? 1 : 0, transform: relatedRef.inView ? 'translateY(0)' : 'translateY(12px)' }}
            >
              <div className="w-5 h-[2px] bg-[#C3A35E]/50" />
              <span className="text-xs font-bold text-[#C3A35E] uppercase tracking-[0.2em]">More in {blockTitle}</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {relatedItems.map((relItem, i) => (
                <Link
                  key={relItem.slug}
                  href={`/${locale}/${verticalKey}/${categorySlug}/${relItem.slug}`}
                  className="group relative bg-white border border-[#C3A35E]/10 p-4 text-center text-sm text-[#6B1F2B] overflow-hidden transition-all duration-300 hover:border-[#C3A35E]/40"
                  style={{
                    opacity: relatedRef.inView ? 1 : 0,
                    transform: relatedRef.inView ? 'translateY(0)' : 'translateY(12px)',
                    transitionDelay: `${200 + i * 60}ms`,
                  }}
                >
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#C3A35E] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                  <span className="font-medium group-hover:text-[#C3A35E] transition-colors duration-200">{relItem.name}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ═══════ CTA BANNER ═══════ */}
      <section
        ref={ctaRef.ref}
        className="relative bg-gradient-to-r from-[#6B1F2B] to-[#5a1a24] border-t border-[#C3A35E]/25 overflow-hidden"
      >
        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, #C3A35E 1px, transparent 0)',
            backgroundSize: '24px 24px',
          }} />
        <div
          className="max-w-[1200px] mx-auto px-4 py-14 flex flex-col md:flex-row items-center justify-between gap-6 relative z-10 transition-all duration-700"
          style={{
            opacity: ctaRef.inView ? 1 : 0,
            transform: ctaRef.inView ? 'translateY(0)' : 'translateY(16px)',
          }}
        >
          <div>
            <h3 className="text-xl font-bold text-white mb-2" style={{ letterSpacing: '-0.01em' }}>
              Interested in {matchedItem}?
            </h3>
            <p className="text-white/40 text-sm">Get a custom quote from our global sourcing team — competitive pricing, reliable supply.</p>
          </div>
          <div className="flex gap-3">
            <Link
              href={`/${locale}/contact`}
              className="group relative px-8 py-3 bg-[#C3A35E] text-[#6B1F2B] text-sm font-bold overflow-hidden transition-all duration-300"
            >
              <span className="relative z-10">Request Quote</span>
              <div className="absolute inset-0 bg-[#d4b46e] transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300" />
            </Link>
            <Link
              href={`/${locale}/${verticalKey}/${categorySlug}`}
              className="px-8 py-3 border border-[#C3A35E]/30 text-[#C3A35E] text-sm font-medium hover:border-[#C3A35E] transition-colors duration-200"
            >
              ← Back to {blockTitle}
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}

export default ItemPageClient
