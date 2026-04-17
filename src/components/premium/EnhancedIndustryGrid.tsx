'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useLocale } from 'next-intl'
import { navVerticals } from '@/data/megaMenuData'

const industryMeta: Record<string, { desc: string; gradient: string; image?: string; products: number; markets: number; bg: string; accent: string; bgPhoto: string }> = {
  textiles:       { desc: 'Premium apparel, fabrics, and home textiles for global markets', gradient: 'from-slate-50 to-blue-50', image: '/Images/textile.webp', products: 240, markets: 28, bg: '#f8f9ff', accent: 'rgba(59,130,246,0.15)', bgPhoto: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1400&q=60&fit=crop' },
  fmcg:           { desc: 'Food, beverages, personal care and home essentials', gradient: 'from-slate-50 to-emerald-50', image: '/Images/FMCG.webp', products: 380, markets: 42, bg: '#f6fdf9', accent: 'rgba(16,185,129,0.15)', bgPhoto: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=1400&q=60&fit=crop' },
  commodities:    { desc: 'Strategic trading in agriculture, energy, and metals', gradient: 'from-slate-50 to-amber-50', image: '/Images/commodities.webp', products: 60, markets: 31, bg: '#fdfaf4', accent: 'rgba(195,163,94,0.2)', bgPhoto: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1400&q=60&fit=crop' },
  industrial:     { desc: 'Advanced chemicals, machinery, and safety equipment', gradient: 'from-slate-50 to-zinc-50', image: '/Images/industrialsolutions.webp', products: 180, markets: 22, bg: '#f8f8f9', accent: 'rgba(113,113,122,0.12)', bgPhoto: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1400&q=60&fit=crop' },
  minerals:       { desc: 'Precious metals, energy minerals, and industrial resources', gradient: 'from-slate-50 to-stone-50', image: '/Images/Minerals.webp', products: 45, markets: 18, bg: '#faf9f7', accent: 'rgba(120,113,108,0.12)', bgPhoto: 'https://images.unsplash.com/photo-1590247813693-5541d1c609fd?w=1400&q=60&fit=crop' },
  'oil-gas':      { desc: 'Complete upstream, midstream, and downstream operations', gradient: 'from-slate-50 to-orange-50', image: '/Images/oilandgas.webp', products: 30, markets: 15, bg: '#fdf8f3', accent: 'rgba(249,115,22,0.12)', bgPhoto: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=1400&q=60&fit=crop' },
  'real-estate':  { desc: 'Commercial and residential property development', gradient: 'from-slate-50 to-cyan-50', image: '/Images/real estate.webp', products: 120, markets: 12, bg: '#f3fbfd', accent: 'rgba(6,182,212,0.12)', bgPhoto: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1400&q=60&fit=crop' },
  sourcing:       { desc: 'Global sourcing, quality control, and logistics solutions', gradient: 'from-slate-50 to-violet-50', image: '/Images/sourcing-solutions.webp', products: 95, markets: 38, bg: '#f8f5ff', accent: 'rgba(139,92,246,0.12)', bgPhoto: 'https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?w=1400&q=60&fit=crop' },
  finance:        { desc: 'Trade finance, HPay digital payments, and compliance', gradient: 'from-slate-50 to-teal-50', image: '/Images/financial.webp', products: 20, markets: 24, bg: '#f3fdfb', accent: 'rgba(20,184,166,0.12)', bgPhoto: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1400&q=60&fit=crop' },
  ai:             { desc: 'Machine learning, predictive analytics, and automation', gradient: 'from-slate-50 to-pink-50', image: '/Images/it-solutions.webp', products: 15, markets: 10, bg: '#fdf4fa', accent: 'rgba(236,72,153,0.1)', bgPhoto: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=1400&q=60&fit=crop' },
}

const CARD_WIDTH = 420
const CARD_GAP = 16
const AUTO_ADVANCE_MS = 3800

const EnhancedIndustryGrid: React.FC = () => {
  const locale = useLocale()
  const [active, setActive] = useState(0)
  const [dragging, setDragging] = useState(false)
  const [dragStartX, setDragStartX] = useState(0)
  const [dragDelta, setDragDelta] = useState(0)
  const [isHoveringSlider, setIsHoveringSlider] = useState(false)
  const [winWidth, setWinWidth] = useState(1440)
  const autoRef = useRef<NodeJS.Timeout | null>(null)
  const total = navVerticals.length

  // Fix SSR/client mismatch for centering
  useEffect(() => {
    const update = () => setWinWidth(window.innerWidth)
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  const goTo = useCallback((idx: number) => {
    setActive((idx + total) % total)
    setDragDelta(0)
  }, [total])

  // Auto-advance
  useEffect(() => {
    if (isHoveringSlider) return
    autoRef.current = setInterval(() => goTo(active + 1), AUTO_ADVANCE_MS)
    return () => { if (autoRef.current) clearInterval(autoRef.current) }
  }, [active, isHoveringSlider, goTo])

  // Drag handlers
  const onDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    setDragging(true)
    const x = 'touches' in e ? e.touches[0].clientX : e.clientX
    setDragStartX(x)
    if (autoRef.current) clearInterval(autoRef.current)
  }
  const onDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!dragging) return
    const x = 'touches' in e ? e.touches[0].clientX : e.clientX
    setDragDelta(x - dragStartX)
  }
  const onDragEnd = () => {
    if (!dragging) return
    setDragging(false)
    if (dragDelta < -60) goTo(active + 1)
    else if (dragDelta > 60) goTo(active - 1)
    else setDragDelta(0)
  }

  // Offset: center the active card
  const baseOffset = winWidth / 2 - CARD_WIDTH / 2
  const trackX = baseOffset - active * (CARD_WIDTH + CARD_GAP) + dragDelta

  // Active industry background
  const activeKey = navVerticals[active]?.key
  const activeMeta = industryMeta[activeKey] || { bg: '#ffffff', accent: 'transparent' }

  return (
    <section
      className="relative h-full flex flex-col justify-center overflow-hidden"
      style={{ background: activeMeta.bg }}
      onMouseEnter={() => setIsHoveringSlider(true)}
      onMouseLeave={() => setIsHoveringSlider(false)}
    >
      {/* Cross-fading background photo — Option A: opacity 0.12, blur 40px */}
      {navVerticals.map((v, idx) => {
        const m = industryMeta[v.key]
        if (!m?.bgPhoto) return null
        // Only render DOM node for active, previous, and next — skip the rest until needed
        if (Math.abs(idx - active) > 2 && idx !== active) return null
        return (
          <div
            key={v.key}
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: `url(${m.bgPhoto})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'blur(42px) saturate(0.8)',
              transform: 'scale(1.12)',
              opacity: idx === active ? 0.12 : 0,
              transition: 'opacity 0.9s cubic-bezier(0.16, 1, 0.3, 1)',
              zIndex: 0,
            }}
          />
        )
      })}
      {/* White wash over the blurred photo to keep ivory tone */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'rgba(255,255,255,0.72)', zIndex: 1 }} />

      {/* Header */}
      <div className="text-center mb-6 relative px-6" style={{ zIndex: 2 }}>
        <p style={{
          fontSize: '10px', fontWeight: 700, letterSpacing: '0.18em',
          color: '#C3A35E', textTransform: 'uppercase', marginBottom: '10px',
          fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
        }}>
          10 Verticals &nbsp;·&nbsp; 42 Markets &nbsp;·&nbsp; 1,185+ Products
        </p>
        <h2 style={{
          fontSize: 'clamp(24px, 3vw, 40px)', fontWeight: 700, letterSpacing: '-0.03em',
          color: '#1d1d1f', lineHeight: 1.08,
          fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif'
        }}>
          One Platform.{' '}
          <span style={{ background: 'linear-gradient(135deg, #C3A35E 0%, #6B1F2B 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Ten Industries.
          </span>
        </h2>
        <p style={{
          fontSize: '14px', color: '#6e6e73', marginTop: '6px',
          fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
          letterSpacing: '-0.01em'
        }}>
          From commodities to AI — one intelligent commercial engine covering every sector.
        </p>
      </div>

      {/* Slider track */}
      <div
        className="relative select-none"
        style={{ cursor: dragging ? 'grabbing' : 'grab', overflow: 'visible', zIndex: 2 }}
        onMouseDown={onDragStart}
        onMouseMove={onDragMove}
        onMouseUp={onDragEnd}
        onMouseLeave={onDragEnd}
        onTouchStart={onDragStart}
        onTouchMove={onDragMove}
        onTouchEnd={onDragEnd}
      >
        <div
          style={{
            display: 'flex',
            gap: `${CARD_GAP}px`,
            transform: `translateX(${trackX}px)`,
            transition: dragging ? 'none' : 'transform 0.85s cubic-bezier(0.16, 1, 0.3, 1)',
            willChange: 'transform',
          }}
        >
          {navVerticals.map((vertical, idx) => {
            const meta = industryMeta[vertical.key] || { desc: '', gradient: 'from-slate-50 to-gray-50' }
            const isActive = idx === active
            const dist = Math.abs(idx - active)
            const scale = isActive ? 1 : dist === 1 ? 0.90 : 0.80
            const opacity = isActive ? 1 : dist === 1 ? 0.6 : 0.32
            const hasImage = !!meta.image

            return (
              <div
                key={vertical.key}
                style={{
                  width: `${CARD_WIDTH}px`,
                  flexShrink: 0,
                  transform: `scale(${scale})`,
                  opacity,
                  transition: dragging ? 'none' : 'transform 0.85s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.85s cubic-bezier(0.16, 1, 0.3, 1)',
                  transformOrigin: 'center center',
                  pointerEvents: isActive ? 'auto' : 'none',
                }}
                onClick={() => !dragging && idx !== active && goTo(idx)}
              >
                <Link
                  href={`/${locale}${vertical.href}`}
                  className="group relative block overflow-hidden"
                  style={{
                    height: '280px',
                    borderRadius: '20px',
                    background: hasImage ? '#000' : 'white',
                    boxShadow: isActive
                      ? '0 32px 64px rgba(0,0,0,0.18), 0 8px 16px rgba(0,0,0,0.1)'
                      : '0 4px 12px rgba(0,0,0,0.06)',
                    transition: 'box-shadow 0.72s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                  }}
                  onClick={e => { if (dragging || Math.abs(dragDelta) > 5) e.preventDefault() }}
                >
                  {/* Background image */}
                  {hasImage && (
                    <>
                      <div className="absolute inset-0 overflow-hidden" style={{ borderRadius: '20px' }}>
                        <Image
                          src={meta.image!}
                          alt={vertical.label}
                          fill
                          loading={idx <= 2 ? 'eager' : 'lazy'}
                          className="object-cover"
                          style={{
                            transform: isActive ? 'scale(1.05)' : 'scale(1)',
                            transition: 'transform 0.85s cubic-bezier(0.16, 1, 0.3, 1)',
                          }}
                        />
                      </div>
                      <div className="absolute inset-0" style={{
                        background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)',
                        borderRadius: '20px'
                      }} />
                    </>
                  )}

                  {/* Maroon+gold border glow on active */}
                  {isActive && (
                    <div className="absolute inset-0 pointer-events-none" style={{
                      borderRadius: '20px',
                      border: '2px solid rgba(107,31,43,0.8)',
                      boxShadow: '0 0 0 1px rgba(195,163,94,0.4), 0 0 32px rgba(107,31,43,0.25) inset, 0 0 40px rgba(107,31,43,0.15)',
                    }} />
                  )}

                  {/* Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <div style={{
                      fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em',
                      color: isActive ? '#C3A35E' : 'rgba(195,163,94,0.7)',
                      textTransform: 'uppercase', marginBottom: '8px',
                      fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                    }}>
                      {String(idx + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
                    </div>
                    <h3 style={{
                      fontSize: '22px', fontWeight: 600, letterSpacing: '-0.02em',
                      color: hasImage ? '#fff' : '#1d1d1f',
                      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                      marginBottom: '6px',
                    }}>
                      {vertical.label}
                    </h3>
                    <p style={{
                      fontSize: '13px', color: hasImage ? 'rgba(255,255,255,0.75)' : '#6e6e73',
                      letterSpacing: '-0.005em', lineHeight: 1.5,
                      fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                    }}>
                      {meta.desc}
                    </p>
                    {/* Product count + Enter CTA row */}
                    <div style={{
                      marginTop: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      opacity: isActive ? 1 : 0,
                      transform: isActive ? 'translateY(0)' : 'translateY(8px)',
                      transition: 'opacity 0.4s ease 0.2s, transform 0.4s ease 0.2s',
                    }}>
                      <div style={{ display: 'flex', gap: '16px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(195,163,94,0.9)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                          {meta.products}+ Products
                        </span>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                          {meta.markets} Markets
                        </span>
                      </div>
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: '5px',
                        fontSize: '12px', fontWeight: 700,
                        color: '#E5C07B',
                        letterSpacing: '0.08em', textTransform: 'uppercase',
                        background: 'rgba(107,31,43,0.6)',
                        backdropFilter: 'blur(8px)',
                        padding: '5px 12px',
                        border: '1px solid rgba(195,163,94,0.35)',
                      }}>
                        Enter
                        <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            )
          })}
        </div>
      </div>

      {/* Dot indicators */}
      <div className="flex justify-center gap-2 mt-6" style={{ zIndex: 2, position: 'relative' }}>
        {navVerticals.map((_, idx) => (
          <button
            key={idx}
            onClick={() => goTo(idx)}
            style={{
              width: idx === active ? '20px' : '6px',
              height: '6px',
              borderRadius: '3px',
              background: idx === active ? '#C3A35E' : 'rgba(195,163,94,0.3)',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            }}
          />
        ))}
      </div>

      {/* Prev / Next arrows */}
      <button
        onClick={() => goTo(active - 1)}
        style={{
          position: 'absolute', left: '24px', top: '50%', transform: 'translateY(-50%)',
          zIndex: 20, background: '#ffffff',
          border: '1px solid rgba(0,0,0,0.08)', borderRadius: '50%',
          width: '44px', height: '44px', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          transition: 'all 0.2s ease',
        }}
      >
        <svg width="18" height="18" fill="none" stroke="#1d1d1f" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        onClick={() => goTo(active + 1)}
        style={{
          position: 'absolute', right: '24px', top: '50%', transform: 'translateY(-50%)',
          zIndex: 20, background: '#ffffff',
          border: '1px solid rgba(0,0,0,0.08)', borderRadius: '50%',
          width: '44px', height: '44px', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          transition: 'all 0.2s ease',
        }}
      >
        <svg width="18" height="18" fill="none" stroke="#1d1d1f" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </section>
  )
}

export default EnhancedIndustryGrid
