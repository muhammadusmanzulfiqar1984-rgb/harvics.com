'use client'

import React, { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { useLocale } from 'next-intl'

const WORDS = ['Trading.', 'Distribution.', 'Growth.', 'Innovation.', 'Trust.', 'Intelligence.', 'Precision.']

const STATS = [
  { label: 'Active Markets', value: '42' },
  { label: 'Industry Verticals', value: '10' },
  { label: 'Trade Volume', value: '$1.2B+' },
  { label: 'Countries Served', value: '50+' },
  { label: 'Founded', value: '2019' },
  { label: 'On-Time Delivery', value: '94.2%' },
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
  const [wordIdx, setWordIdx] = useState(0)
  const [wordVisible, setWordVisible] = useState(true)
  const [tickerOffset, setTickerOffset] = useState(0)
  const [statsVisible, setStatsVisible] = useState(false)
  const statsRef = useRef<HTMLDivElement>(null)

  const markets = useCountUp(42, 1600, statsVisible)
  const products = useCountUp(1185, 2000, statsVisible)
  const countries = useCountUp(50, 1400, statsVisible)
  const delivery = useCountUp(94, 1800, statsVisible)

  useEffect(() => { setIsLoaded(true) }, [])

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setStatsVisible(true) }, { threshold: 0.3 })
    if (statsRef.current) obs.observe(statsRef.current)
    return () => obs.disconnect()
  }, [])

  // Word swap
  useEffect(() => {
    const t = setInterval(() => {
      setWordVisible(false)
      setTimeout(() => { setWordIdx(i => (i + 1) % WORDS.length); setWordVisible(true) }, 280)
    }, 2200)
    return () => clearInterval(t)
  }, [])

  // Ticker
  useEffect(() => {
    let frame: number; let pos = 0
    const step = () => { pos -= 0.7; setTickerOffset(pos); frame = requestAnimationFrame(step) }
    frame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame)
  }, [])

  const tickerText = STATS.map(s => `${s.value}  ${s.label}`).join('   ·   ')
  const repeated = `${tickerText}   ·   ${tickerText}   ·   ${tickerText}`

  return (
    <section className="hero relative w-full h-full overflow-hidden bg-black">

      {/* Background image with parallax zoom */}
      <div className="absolute inset-0 z-0">
        <img
          src="/Images/hero-page-1.png"
          alt="Global Trade Operations"
          className="w-full h-full object-cover hero-zoom"
          draggable={false}
          loading="eager"
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
      <div className={`relative z-20 h-full flex flex-col justify-center pl-[6%] pr-[4%] pb-12 transition-all duration-700 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>

        {/* Primary Headline */}
        <h1 style={{
          fontSize: 'clamp(32px, 4vw, 56px)',
          fontWeight: 300,
          lineHeight: 1.12,
          letterSpacing: '-0.02em',
          color: '#ffffff',
          maxWidth: '580px',
          transform: isLoaded ? 'translateY(0)' : 'translateY(28px)',
          transition: 'transform 0.9s cubic-bezier(0.16,1,0.3,1) 0.2s',
          marginBottom: '14px',
          fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", sans-serif',
        }}>
          <span style={{ fontWeight: 500, color: '#E5C07B' }}>Harvics</span> Global<br />
          Ventures
        </h1>
        <div style={{
          fontSize: 'clamp(13px, 1.3vw, 17px)',
          color: 'rgba(195,163,94,0.85)',
          fontWeight: 400,
          letterSpacing: '0.06em',
          marginBottom: '20px',
          fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
        }}>
          Enterprise-Grade Commerce &nbsp;·&nbsp; 10 Industry Verticals &nbsp;·&nbsp; 50+ Nations
        </div>

        {/* Animated Word Swap */}
        <div style={{
          fontSize: 'clamp(13px, 1.2vw, 16px)',
          color: 'rgba(255,255,255,0.6)',
          fontWeight: 300,
          lineHeight: 1.6,
          maxWidth: '440px',
          transform: isLoaded ? 'translateY(0)' : 'translateY(20px)',
          transition: 'transform 0.9s cubic-bezier(0.16,1,0.3,1) 0.35s',
          marginBottom: '28px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          flexWrap: 'wrap',
          fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
          letterSpacing: '-0.01em',
        }}>
          Connecting 42 markets through intelligent
          <span style={{
            display: 'inline-block',
            color: '#E5C07B',
            fontWeight: 500,
            opacity: wordVisible ? 1 : 0,
            transform: wordVisible ? 'translateY(0)' : 'translateY(5px)',
            transition: 'opacity 0.28s ease, transform 0.28s ease',
            minWidth: '110px',
          }}>
            {WORDS[wordIdx]}
          </span>
        </div>

        {/* CTAs */}
        <div style={{
          display: 'flex', gap: '12px', flexWrap: 'wrap',
          transform: isLoaded ? 'translateY(0)' : 'translateY(20px)',
          transition: 'transform 0.9s cubic-bezier(0.16,1,0.3,1) 0.5s',
          marginBottom: '40px',
        }}>
          <Link href={`/${locale}/products`} className="gold-btn" style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '10px 22px',
            background: 'linear-gradient(105deg, #C3A35E 0%, #E5C07B 40%, #f0d08e 52%, #E5C07B 64%, #C3A35E 100%)',
            backgroundSize: '220% 100%',
            border: 'none',
            color: '#1a0d00',
            fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em',
            textTransform: 'uppercase', textDecoration: 'none',
            fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
          }}>
            Explore Industries
            <svg width="11" height="11" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
          <Link href={`/${locale}/contact`} className="gold-btn" style={{
            display: 'inline-flex', alignItems: 'center',
            padding: '10px 22px',
            background: 'linear-gradient(105deg, #C3A35E 0%, #E5C07B 40%, #f0d08e 52%, #E5C07B 64%, #C3A35E 100%)',
            backgroundSize: '220% 100%',
            border: 'none',
            color: '#1a0d00',
            fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em',
            textTransform: 'uppercase', textDecoration: 'none',
            fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
          }}>
            Contact Us
          </Link>
        </div>

        {/* Animated Stats Row */}
        <div ref={statsRef} style={{ display: 'flex', gap: 'clamp(20px, 4vw, 52px)', flexWrap: 'wrap' }}>
          {[
            { num: markets, suffix: '+', label: 'Active Markets' },
            { num: products, suffix: '+', label: 'Products Listed' },
            { num: countries, suffix: '+', label: 'Countries Served' },
            { num: delivery, suffix: '%', label: 'On-Time Delivery' },
          ].map((s, i) => (
            <div key={i} style={{
              transform: isLoaded ? 'translateY(0)' : 'translateY(24px)',
              transition: `transform 0.8s ease ${0.6 + i * 0.1}s`,
            }}>
              <div style={{
                fontSize: 'clamp(22px, 2.4vw, 32px)',
                fontWeight: 700,
                color: '#ffffff',
                letterSpacing: '-0.02em',
                lineHeight: 1,
                fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
              }}>
                {s.num}{s.suffix}
              </div>
              <div style={{
                fontSize: '10px', fontWeight: 600, letterSpacing: '0.1em',
                color: '#C3A35E', textTransform: 'uppercase', marginTop: '4px',
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
          <div style={{
            transform: isLoaded ? 'translateY(0)' : 'translateY(24px)',
            transition: 'transform 0.8s ease 0.9s',
          }}>
            <div style={{
              fontSize: 'clamp(22px, 2.4vw, 32px)',
              fontWeight: 700,
              color: '#ffffff',
              letterSpacing: '-0.02em',
              lineHeight: 1,
              fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
            }}>
              $1.2B+
            </div>
            <div style={{
              fontSize: '10px', fontWeight: 600, letterSpacing: '0.1em',
              color: '#C3A35E', textTransform: 'uppercase', marginTop: '4px',
              fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
            }}>
              Annual Trade Volume
            </div>
          </div>
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

      {/* Live Ticker */}
      <div className="absolute bottom-0 left-0 right-0 z-30" style={{
        background: 'rgba(107,31,43,0.92)',
        backdropFilter: 'blur(12px)',
        borderTop: '1px solid rgba(195,163,94,0.25)',
        height: '38px',
        overflow: 'hidden',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', height: '100%',
          whiteSpace: 'nowrap',
          transform: `translateX(${tickerOffset % 2000}px)`,
        }}>
          <span style={{
            fontSize: '10px', fontWeight: 800, letterSpacing: '0.14em',
            color: '#E5C07B', textTransform: 'uppercase',
          }}>
            {repeated}
          </span>
        </div>
      </div>

      <style jsx>{`
        .hero-zoom {
          animation: heroZoom 14s ease-in-out infinite alternate;
        }
        @keyframes heroZoom {
          from { transform: scale(1.0); }
          to   { transform: scale(1.06); }
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