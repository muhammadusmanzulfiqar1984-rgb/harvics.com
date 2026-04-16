'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import { navVerticals } from '@/data/megaMenuData'

const industryMeta: Record<string, { desc: string; gradient: string; image?: string; products: number; markets: number }> = {
  textiles:       { desc: 'Premium apparel, fabrics, and home textiles for global markets', gradient: 'from-slate-50 to-blue-50', image: '/Images/textile.png', products: 240, markets: 28 },
  fmcg:           { desc: 'Food, beverages, personal care and home essentials', gradient: 'from-slate-50 to-emerald-50', image: '/Images/FMCG.png', products: 380, markets: 42 },
  commodities:    { desc: 'Strategic trading in agriculture, energy, and metals', gradient: 'from-slate-50 to-amber-50', image: '/Images/commodities.png', products: 60, markets: 31 },
  industrial:     { desc: 'Advanced chemicals, machinery, and safety equipment', gradient: 'from-slate-50 to-zinc-50', image: '/Images/industrialsolutions.png', products: 180, markets: 22 },
  minerals:       { desc: 'Precious metals, energy minerals, and industrial resources', gradient: 'from-slate-50 to-stone-50', image: '/Images/Minerals.png', products: 45, markets: 18 },
  'oil-gas':      { desc: 'Complete upstream, midstream, and downstream operations', gradient: 'from-slate-50 to-orange-50', image: '/Images/oilandgas.png', products: 30, markets: 15 },
  'real-estate':  { desc: 'Commercial and residential property development', gradient: 'from-slate-50 to-cyan-50', image: '/Images/real estate.png', products: 120, markets: 12 },
  sourcing:       { desc: 'Global sourcing, quality control, and logistics solutions', gradient: 'from-slate-50 to-violet-50', image: '/Images/sourcing-solutions.png', products: 95, markets: 38 },
  finance:        { desc: 'Trade finance, HPay digital payments, and compliance', gradient: 'from-slate-50 to-teal-50', image: '/Images/financial.png', products: 20, markets: 24 },
  ai:             { desc: 'Machine learning, predictive analytics, and automation', gradient: 'from-slate-50 to-pink-50', image: '/Images/it-solutions.png', products: 15, markets: 10 },
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
  const autoRef = useRef<NodeJS.Timeout | null>(null)
  const total = navVerticals.length

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
  const baseOffset = (typeof window !== 'undefined' ? window.innerWidth : 1440) / 2 - CARD_WIDTH / 2
  const trackX = baseOffset - active * (CARD_WIDTH + CARD_GAP) + dragDelta

  return (
    <section
      className="relative h-full flex flex-col justify-center overflow-hidden"
      style={{ background: '#ffffff' }}
      onMouseEnter={() => setIsHoveringSlider(true)}
      onMouseLeave={() => setIsHoveringSlider(false)}
    >
      {/* Ambient glow */}
      <div className="absolute top-1/3 right-1/4 w-[600px] h-[600px] rounded-full blur-[180px] opacity-[0.07] pointer-events-none"
        style={{ background: 'radial-gradient(circle, #E5C07B, transparent)' }} />

      {/* Header */}
      <div className="text-center mb-6 relative z-10 px-6">
        <p style={{
          fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em',
          color: '#C3A35E', textTransform: 'uppercase', marginBottom: '8px',
          fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
        }}>
          10 Verticals · 42 Markets · 1,185+ Products
        </p>
        <h2 style={{
          fontSize: '28px', fontWeight: 600, letterSpacing: '-0.03em',
          color: '#1d1d1f', lineHeight: 1.1,
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
        className="relative z-10 select-none"
        style={{ cursor: dragging ? 'grabbing' : 'grab', overflow: 'visible' }}
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
            transition: dragging ? 'none' : 'transform 0.72s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            willChange: 'transform',
          }}
        >
          {navVerticals.map((vertical, idx) => {
            const meta = industryMeta[vertical.key] || { desc: '', gradient: 'from-slate-50 to-gray-50' }
            const isActive = idx === active
            const dist = Math.abs(idx - active)
            const scale = isActive ? 1 : dist === 1 ? 0.88 : 0.78
            const opacity = isActive ? 1 : dist === 1 ? 0.55 : 0.3
            const hasImage = !!meta.image

            return (
              <div
                key={vertical.key}
                style={{
                  width: `${CARD_WIDTH}px`,
                  flexShrink: 0,
                  transform: `scale(${scale})`,
                  opacity,
                  transition: dragging ? 'none' : 'transform 0.72s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.72s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
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
                        <img
                          src={meta.image}
                          alt={vertical.label}
                          className="w-full h-full object-cover"
                          style={{
                            transform: isActive ? 'scale(1.05)' : 'scale(1)',
                            transition: 'transform 0.72s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
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
      <div className="flex justify-center gap-2 mt-6 relative z-10">
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
