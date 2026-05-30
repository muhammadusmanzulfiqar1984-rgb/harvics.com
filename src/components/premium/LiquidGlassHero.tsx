'use client'

import React, { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useLocale } from 'next-intl'

const STATS = [
  { label: 'Track Record', value: '$1.2B+' },
  { label: 'Operating Legacy', value: '18 Years' },
  { label: 'Industry Verticals', value: '10' },
  { label: 'Continents', value: '3' },
  { label: 'HarvicsOS Modules', value: '71' },
  { label: 'Trade Corridors', value: 'EU-GCC-South Asia' },
]

function useCountUp(target: number, duration = 1800, start = false) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!start) return
    let startTime: number | null = null
    const step = (ts: number) => {
      if (!startTime) startTime = ts
      const progress = Math.min((ts - startTime) / duration, 1)
      setCount(Math.floor(progress * target))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [start, target, duration])
  return count
}

const LiquidGlassHero: React.FC = () => {
  const locale = useLocale()
  const [isLoaded, setIsLoaded] = useState(false)
  const [statsVisible, setStatsVisible] = useState(false)
  const statsRef = useRef<HTMLDivElement>(null)

  const trackRecord = useCountUp(12, 1800, statsVisible)
  const years = useCountUp(18, 1200, statsVisible)
  const verticals = useCountUp(10, 1200, statsVisible)
  const continents = useCountUp(3, 900, statsVisible)

  useEffect(() => { setIsLoaded(true) }, [])

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setStatsVisible(true) }, { threshold: 0.3 })
    if (statsRef.current) obs.observe(statsRef.current)
    return () => obs.disconnect()
  }, [])

  // Ticker now runs as a pure CSS animation (no React re-renders).

  const tickerText = STATS.map(s => `${s.value}  ${s.label}`).join('   ·   ')
  const repeated = `${tickerText}   ·   ${tickerText}   ·   ${tickerText}`

  return (
    <section className="hero relative w-full min-h-screen overflow-hidden bg-harvics-dark">

      {/* Background image with parallax zoom */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/assets/shared/heroes/hero-page-1.webp"
          alt="Global Trade Operations"
          fill
          priority
          className="object-cover hero-zoom"
          draggable={false}
          style={{ filter: 'brightness(0.75) contrast(1.1) saturate(1.05)' }}
        />
        {/* Cinematic gradient overlay */}
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(105deg, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.55) 45%, rgba(0,0,0,0.2) 100%)'
        }} />
        {/* Gold shimmer sweep */}
        <div className="absolute inset-0 shimmer-sweep" style={{ mixBlendMode: 'screen', opacity: 0.18 }} />
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className={`relative z-20 h-full max-w-harvics-layout mx-auto px-6 flex flex-col justify-center pb-12 transition-all duration-700 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>

        {/* Primary Headline */}
        <h1 style={{
          fontSize: 'clamp(34px, 4.2vw, 60px)',
          fontWeight: 300,
          lineHeight: 1.08,
          letterSpacing: '-0.03em',
          color: '#ffffff',
          maxWidth: '600px',
          transform: isLoaded ? 'translateY(0)' : 'translateY(28px)',
          transition: 'transform 0.9s cubic-bezier(0.16,1,0.3,1) 0.2s',
          marginBottom: '12px',
          fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", sans-serif',
        }}>
          <span style={{ fontWeight: 600, color: '#E5C07B' }}>Harvics</span> Global<br />
          Ventures
        </h1>
        <div style={{
          fontSize: 'clamp(11px, 1.1vw, 14px)',
          color: 'rgba(195,163,94,0.75)',
          fontWeight: 500,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          marginBottom: '28px',
          fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
        }}>
          Sovereign Trade Infrastructure
        </div>

        {/* CTAs */}
        <div style={{
          display: 'flex', gap: '12px', flexWrap: 'wrap',
          transform: isLoaded ? 'translateY(0)' : 'translateY(20px)',
          transition: 'transform 0.9s cubic-bezier(0.16,1,0.3,1) 0.5s',
          marginBottom: '40px',
        }}>
          <Link href={`/${locale}/products`} className="gold-btn" style={{
            display: 'inline-flex', alignItems: 'center', gap: '7px',
            padding: '11px 26px',
            background: 'linear-gradient(105deg, #C3A35E 0%, #E5C07B 40%, #f0d08e 52%, #E5C07B 64%, #C3A35E 100%)',
            backgroundSize: '220% 100%',
            border: 'none',
            color: '#1a0d00',
            fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em',
            textTransform: 'uppercase', textDecoration: 'none',
            fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
          }}>
            Explore Industries
            <svg width="10" height="10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
          <Link href={`/${locale}/contact`} style={{
            display: 'inline-flex', alignItems: 'center',
            padding: '11px 26px',
            background: 'transparent',
            border: '1px solid rgba(195,163,94,0.55)',
            color: '#E5C07B',
            fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em',
            textTransform: 'uppercase', textDecoration: 'none',
            fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
            transition: 'border-color 0.25s ease, background 0.25s ease',
          }}>
            Contact Us
          </Link>
        </div>

        {/* Animated Stats Row */}
        <div ref={statsRef} style={{ display: 'flex', gap: 'clamp(20px, 4vw, 52px)', flexWrap: 'wrap' }}>
          {[
            { num: trackRecord / 10, prefix: '$', suffix: 'B+', label: 'Track Record' },
            { num: years, suffix: '', label: 'Years' },
            { num: verticals, suffix: '', label: 'Verticals' },
            { num: continents, suffix: '', label: 'Continents' },
          ].map((s, i) => (
            <div key={i} style={{
              transform: isLoaded ? 'translateY(0)' : 'translateY(24px)',
              transition: `transform 0.8s ease ${0.6 + i * 0.1}s`,
            }}>
              <div style={{
                fontSize: 'clamp(22px, 2.4vw, 32px)',
                fontWeight: 700,
                color: '#ffffff',
                letterSpacing: '-0.03em',
                lineHeight: 1,
                fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
              }}>
                {s.prefix || ''}{s.num}{s.suffix}
              </div>
              <div style={{
                fontSize: '9px', fontWeight: 700, letterSpacing: '0.12em',
                color: 'rgba(195,163,94,0.8)', textTransform: 'uppercase', marginTop: '5px',
                fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
              }}>
                {s.label}
              </div>
            </div>
          ))}
          <div style={{
            width: '1px',
            background: 'rgba(195,163,94,0.25)',
            alignSelf: 'stretch',
            margin: '4px 0',
          }} />
        </div>

        {/* Trust badges row */}
        <div style={{
          display: 'flex', gap: '18px', flexWrap: 'wrap', alignItems: 'center',
          marginTop: '24px',
          transform: isLoaded ? 'translateY(0)' : 'translateY(20px)',
          transition: 'transform 0.9s cubic-bezier(0.16,1,0.3,1) 1.0s',
        }}>
          {['ISO Certified', 'HACCP Compliant', 'Halal Verified', 'BRC Approved'].map((badge, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: '5px',
              fontSize: '9px', fontWeight: 700, letterSpacing: '0.12em',
              color: 'rgba(195,163,94,0.75)', textTransform: 'uppercase',
              fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
            }}>
              <svg width="8" height="8" viewBox="0 0 12 12" fill="none">
                <path d="M2 6l3 3 5-5" stroke="#C3A35E" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {badge}
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-14 right-8 z-30 flex flex-col items-center gap-2">
        <span style={{ fontSize: '9px', letterSpacing: '0.3em', fontWeight: 700, color: '#C3A35E', textTransform: 'uppercase' }}>Scroll</span>
        <svg width="18" height="28" viewBox="0 0 18 28" fill="none" className="animate-bounce">
          <path d="M9 0L9 24M9 24L2 17M9 24L16 17" stroke="#C3A35E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      {/* Live Ticker — TEMPORARILY HIDDEN (set to true to re-enable) */}
      {false && (
        <div className="absolute bottom-0 left-0 right-0 z-30" style={{
          background: 'rgba(107,31,43,0.92)',
          borderTop: '1px solid rgba(195,163,94,0.25)',
          height: '38px',
          overflow: 'hidden',
        }}>
          <div className="hv-ticker-track" style={{
            display: 'flex', alignItems: 'center', height: '100%',
            whiteSpace: 'nowrap',
            willChange: 'transform',
          }}>
            <span style={{
              fontSize: '10px', fontWeight: 800, letterSpacing: '0.14em',
              color: '#E5C07B', textTransform: 'uppercase',
            }}>
              {repeated}
            </span>
          </div>
        </div>
      )}

      <style jsx>{`
        .hero-zoom {
          animation: heroZoom 14s ease-in-out infinite alternate;
        }
        @keyframes heroZoom {
          from { transform: scale(1.0); }
          to   { transform: scale(1.06); }
        }
        .hv-ticker-track {
          animation: hvTickerScroll 60s linear infinite;
        }
        @keyframes hvTickerScroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        .shimmer-sweep {
          background: linear-gradient(110deg, transparent 30%, rgba(255,215,120,0.4) 50%, transparent 70%);
          animation: sweep 10s linear infinite;
        }
        @keyframes sweep {
          from { transform: translateX(-100%); }
          to   { transform: translateX(200%); }
        }
        .gold-btn {
          animation: goldShimmer 2.8s linear infinite;
          transition: opacity 0.2s ease, transform 0.2s ease;
        }
        .gold-btn:hover {
          opacity: 0.88;
          transform: translateY(-1px);
        }
        @keyframes goldShimmer {
          0%   { background-position: 100% 0; }
          100% { background-position: -100% 0; }
        }
      `}</style>
    </section>
  )
}

export default LiquidGlassHero