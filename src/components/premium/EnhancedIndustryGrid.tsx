'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import { navVerticals } from '@/data/megaMenuData'

const industryMeta: Record<string, { desc: string; gradient: string; image?: string; products: number; markets: number; bg: string; accent: string; bgPhoto: string }> = {
  textiles:       { desc: 'Premium apparel, fabrics, and home textiles for global markets', gradient: 'from-slate-50 to-blue-50', image: '/assets/verticals/01-apparels/thumb.webp', products: 240, markets: 28, bg: '#f8f9ff', accent: 'rgba(201,168,76,0.15)', bgPhoto: '/assets/verticals/01-apparels/hero.jpg' },
  fmcg:           { desc: 'Food, beverages, personal care and home essentials', gradient: 'from-slate-50 to-emerald-50', image: '/assets/verticals/02-fmcg/thumb.webp', products: 380, markets: 42, bg: '#f6fdf9', accent: 'rgba(201,168,76,0.15)', bgPhoto: '/assets/verticals/02-fmcg/hero.jpg' },
  commodities:    { desc: 'Strategic trading in agriculture, energy, and metals', gradient: 'from-slate-50 to-amber-50', image: '/assets/verticals/03-commodities/thumb.webp', products: 60, markets: 31, bg: '#fdfaf4', accent: 'rgba(201,168,76,0.2)', bgPhoto: '/assets/verticals/03-commodities/hero.jpg' },
  industrial:     { desc: 'Advanced chemicals, machinery, and safety equipment', gradient: 'from-slate-50 to-zinc-50', image: '/assets/verticals/04-industrial/thumb.webp', products: 180, markets: 22, bg: '#f8f8f9', accent: 'rgba(201,168,76,0.12)', bgPhoto: '/assets/verticals/04-industrial/hero.jpg' },
  minerals:       { desc: 'Precious metals, energy minerals, and industrial resources', gradient: 'from-slate-50 to-stone-50', image: '/assets/verticals/05-minerals/thumb.webp', products: 45, markets: 18, bg: '#faf9f7', accent: 'rgba(201,168,76,0.12)', bgPhoto: '/assets/verticals/05-minerals/hero.jpg' },
  'oil-gas':      { desc: 'Complete upstream, midstream, and downstream operations', gradient: 'from-slate-50 to-orange-50', image: '/assets/verticals/06-oil-gas/thumb.webp', products: 30, markets: 15, bg: '#fdf8f3', accent: 'rgba(201,168,76,0.12)', bgPhoto: '/assets/verticals/06-oil-gas/hero.jpg' },
  'real-estate':  { desc: 'Commercial and residential property development', gradient: 'from-slate-50 to-cyan-50', image: '/assets/verticals/07-real-estate/thumb.webp', products: 120, markets: 12, bg: '#f3fbfd', accent: 'rgba(201,168,76,0.12)', bgPhoto: '/assets/verticals/07-real-estate/hero.jpg' },
  sourcing:       { desc: 'Global sourcing, quality control, and logistics solutions', gradient: 'from-slate-50 to-violet-50', image: '/assets/verticals/08-sourcing/thumb.webp', products: 95, markets: 38, bg: '#f8f5ff', accent: 'rgba(201,168,76,0.12)', bgPhoto: '/assets/verticals/08-sourcing/hero.jpg' },
  finance:        { desc: 'Trade finance, HPay digital payments, and compliance', gradient: 'from-slate-50 to-teal-50', image: '/assets/verticals/09-finance/thumb.webp', products: 20, markets: 24, bg: '#f3fdfb', accent: 'rgba(201,168,76,0.12)', bgPhoto: '/assets/verticals/09-finance/hero.jpg' },
  ai:             { desc: 'Machine learning, predictive analytics, and automation', gradient: 'from-slate-50 to-pink-50', image: '/assets/verticals/10-ai-tech/thumb.webp', products: 15, markets: 10, bg: '#fdf4fa', accent: 'rgba(201,168,76,0.1)', bgPhoto: '/assets/verticals/10-ai-tech/hero.jpg' },
}

const CARD_WIDTH = 420
const CARD_GAP = 16
const AUTO_ADVANCE_MS = 5500

const EnhancedIndustryGrid: React.FC = () => {
  const locale = useLocale()
  const [active, setActive] = useState(0)
  const [dragging, setDragging] = useState(false)
  const [dragStartX, setDragStartX] = useState(0)
  const [dragDelta, setDragDelta] = useState(0)
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

  // Auto-advance — always runs, never paused
  useEffect(() => {
    autoRef.current = setInterval(() => goTo(active + 1), AUTO_ADVANCE_MS)
    return () => { if (autoRef.current) clearInterval(autoRef.current) }
  }, [active, goTo])

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
      style={{ background: '#1A0505' }}
    >
      {/* Single cinematic backdrop — only render active */}
      {navVerticals.map((v, idx) => {
        const m = industryMeta[v.key]
        if (!m?.bgPhoto) return null
        if (Math.abs(idx - active) > 1 && idx !== active) return null
        return (
          <div
            key={v.key}
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: `url(${m.bgPhoto})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              opacity: idx === active ? 0.45 : 0,
              transition: 'opacity 0.6s ease-out',
              zIndex: 0,
            }}
          />
        )
      })}
      {/* Dark overlay — left-weighted for narrative depth */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'linear-gradient(105deg, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.2) 45%, rgba(0,0,0,0.55) 100%)',
        zIndex: 1,
      }} />



      {/* Header — Hubtown-style left-aligned narrative */}
      <div className="mb-6 relative px-8 md:px-14 max-w-3xl" style={{ zIndex: 2 }}>
        <p style={{
          fontSize: '10px', fontWeight: 700, letterSpacing: '0.22em',
          color: '#C3A35E', textTransform: 'uppercase', marginBottom: '14px',
          fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
          borderLeft: '2px solid #C3A35E', paddingLeft: '10px',
        }}>
          10 Verticals &nbsp;·&nbsp; 42 Markets &nbsp;·&nbsp; 1,185+ Products
        </p>
        <h2 style={{
          fontSize: 'clamp(26px, 3.2vw, 46px)', fontWeight: 200, letterSpacing: '-0.03em',
          color: '#ffffff', lineHeight: 1.1, textShadow: '0 2px 24px rgba(0,0,0,0.4)',
          fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif'
        }}>
          One platform.{' '}
          <br />
          <span style={{ color: '#C3A35E', fontWeight: 400 }}>
            Ten industries.
          </span>
        </h2>
        <p style={{
          fontSize: '14px', color: 'rgba(255,255,255,0.6)', marginTop: '10px',
          fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
          letterSpacing: '-0.005em', maxWidth: '420px',
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
                    background: 'rgba(0,0,0,0.5)',
                    border: isActive
                      ? '1px solid rgba(255,255,255,0.25)'
                      : '1px solid rgba(255,255,255,0.08)',
                    boxShadow: isActive
                      ? '0 20px 50px rgba(0,0,0,0.4)'
                      : '0 4px 12px rgba(0,0,0,0.2)',
                    transition: 'box-shadow 0.4s ease, border-color 0.4s ease',
                  }}
                  onClick={e => { if (dragging || Math.abs(dragDelta) > 5) e.preventDefault() }}
                >
                  {/* Card image — full with gradient fade + Samsung-style lift on hover */}
                  {hasImage && (
                    <div className="absolute inset-0 overflow-hidden" style={{ borderRadius: '20px' }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={meta.image!}
                          alt={vertical.label}
                          loading={idx <= 2 ? 'eager' : 'lazy'}
                          decoding="async"
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 group-hover:-translate-y-3 transition-all duration-300 ease-out"
                          style={{ opacity: 0.7 }}
                        />
                      <div className="absolute inset-0" style={{
                        background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.3) 50%, transparent 100%)',
                        borderRadius: '20px',
                      }} />
                    </div>
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
                      color: hasImage ? '#fff' : '#1A0505',
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
                    {/* Product count + Enter CTA row — Samsung-style slide-up reveal on hover */}
                    <div style={{
                      marginTop: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      opacity: isActive ? 1 : 0,
                      transform: isActive ? 'translateY(0)' : 'translateY(16px)',
                      transition: 'opacity 0.35s cubic-bezier(0.35, 0, 0.36, 1) 0.1s, transform 0.35s cubic-bezier(0.35, 0, 0.36, 1) 0.1s',
                      pointerEvents: isActive ? 'auto' : 'none',
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
                        color: '#C3A35E',
                        letterSpacing: '0.08em', textTransform: 'uppercase',
                        background: 'rgba(26, 5, 5, 0.72)',
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

      {/* Apple-style progress indicator */}
      <div className="flex flex-col items-center gap-3 mt-6" style={{ zIndex: 2, position: 'relative' }}>
        {/* Thin progress bar */}
        <div style={{ width: '200px', height: '2px', background: 'rgba(255,255,255,0.15)', borderRadius: '1px', overflow: 'hidden', position: 'relative' }}>
          <div style={{
            position: 'absolute', left: 0, top: 0, height: '100%',
            width: `${((active + 1) / total) * 100}%`,
            background: 'linear-gradient(90deg, #1A0505, #C3A35E)',
            borderRadius: '1px',
            transition: 'width 0.85s cubic-bezier(0.16, 1, 0.3, 1)',
          }} />
        </div>
        {/* Minimal dots */}
        <div className="flex justify-center gap-1.5">
          {navVerticals.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goTo(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              style={{
                width: idx === active ? '24px' : '4px',
                height: '4px',
                borderRadius: '2px',
                background: idx === active
                  ? 'linear-gradient(90deg, #1A0505, #C3A35E)'
                  : 'rgba(255,255,255,0.25)',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            />
          ))}
        </div>
        {/* Current label */}
        <p style={{
          fontSize: '11px', color: 'rgba(255,255,255,0.6)', fontWeight: 500,
          fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
          letterSpacing: '0.02em',
          transition: 'opacity 0.4s ease',
        }}>
          {navVerticals[active]?.label}
        </p>
      </div>

      {/* Invisible edge tap zones (Apple style — no visible arrows) */}
      <button
        onClick={() => goTo(active - 1)}
        aria-label="Previous"
        style={{
          position: 'absolute', left: 0, top: 0, bottom: 0,
          width: '80px', zIndex: 20, background: 'transparent',
          border: 'none', cursor: 'w-resize', opacity: 0,
        }}
      />
      <button
        onClick={() => goTo(active + 1)}
        aria-label="Next"
        style={{
          position: 'absolute', right: 0, top: 0, bottom: 0,
          width: '80px', zIndex: 20, background: 'transparent',
          border: 'none', cursor: 'e-resize', opacity: 0,
        }}
      />

      <style jsx>{`
        @keyframes floatOrb1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-40px, 30px) scale(1.1); }
          66% { transform: translate(20px, -20px) scale(0.95); }
        }
        @keyframes floatOrb2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -40px) scale(1.08); }
          66% { transform: translate(-25px, 25px) scale(0.92); }
        }
      `}</style>
    </section>
  )
}

export default EnhancedIndustryGrid
