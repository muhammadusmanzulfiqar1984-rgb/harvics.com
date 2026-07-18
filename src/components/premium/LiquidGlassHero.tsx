'use client'

import React, { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { VictorianAnalogClock } from '@/components/ui/VictorianHorology'

gsap.registerPlugin(ScrollTrigger)

const STATS = [
  { label: 'Track Record', value: '$1.2B+' },
  { label: 'Operating Legacy', value: '20 Years' },
  { label: 'Industry Verticals', value: '10' },
  { label: 'Continents', value: '4' },
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
  const [statsVisible, setStatsVisible] = useState(false)
  const [reelReady, setReelReady] = useState(false)
  const statsRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const sectionRef = useRef<HTMLElement>(null)

  const trackRecord = useCountUp(12, 1800, statsVisible)
  const years = useCountUp(20, 1200, statsVisible)
  const verticals = useCountUp(10, 1200, statsVisible)
  const continents = useCountUp(4, 900, statsVisible)

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setStatsVisible(true) }, { threshold: 0.3 })
    if (statsRef.current) obs.observe(statsRef.current)
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    const el = videoRef.current
    if (!el) return
    el.muted = true
    el.defaultMuted = true
    el.playsInline = true

    const markReady = () => setReelReady(true)
    const play = () => {
      const p = el.play()
      if (p) void p.then(markReady).catch(() => {})
    }

    play()
    el.addEventListener('loadeddata', play)
    el.addEventListener('canplay', play)
    el.addEventListener('playing', markReady)
    return () => {
      el.removeEventListener('loadeddata', play)
      el.removeEventListener('canplay', play)
      el.removeEventListener('playing', markReady)
    }
  }, [])

  useEffect(() => {
    const section = sectionRef.current
    const video = videoRef.current
    if (!section || !video) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const ctx = gsap.context(() => {
      gsap.to(video, {
        scale: 1.14,
        y: '10%',
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      })
    }, section)

    return () => ctx.revert()
  }, [])

  // Ticker now runs as a pure CSS animation (no React re-renders).

  const tickerText = STATS.map(s => `${s.value}  ${s.label}`).join('   ·   ')
  const repeated = `${tickerText}   ·   ${tickerText}   ·   ${tickerText}`

  return (
    <section ref={sectionRef} className="hero relative w-full min-h-screen overflow-hidden bg-harvics-burgundy">

      {/* Background hero reel */}
      <div className="absolute inset-0 z-0 hero-media">
        <video
          ref={videoRef}
          className={`absolute inset-0 w-full h-full object-cover hero-zoom${reelReady ? ' is-playing' : ''}`}
          src="/assets/media/video/corridor-reel.mp4?v=night2"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster="/assets/shared/heroes/corridor-reel-poster.jpg"
          aria-hidden
        />

        {/* Cinematic overlays — keep brand left, let reel breathe right */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(105deg, rgba(61, 18, 18,0.78) 0%, rgba(13,13,13,0.42) 48%, rgba(13,13,13,0.18) 100%), linear-gradient(to top, rgba(61, 18, 18,0.58) 0%, transparent 46%)',
          }}
        />

        {/* Layered gold shimmer waves */}
        <div className="hero-shimmer-wave hero-shimmer-wave--primary" aria-hidden />
        <div className="hero-shimmer-wave hero-shimmer-wave--secondary" aria-hidden />

        {/* Soft bottom-right mask (clips watermark edge on some cuts) */}
        <div className="hero-corner-mask" aria-hidden />
      </div>

      {/* Hero header — textile-v2 horology clock */}
      <div
        className="absolute top-0 left-0 right-0 z-30 pointer-events-none"
      >
        <div className="max-w-harvics-layout mx-auto px-6 pt-5 flex items-center justify-start">
          <div
            className="pointer-events-auto flex items-center gap-3 px-3 py-1.5"
            style={{
              background: 'rgba(13,11,8,0.55)',
              border: '1px solid rgba(200,169,110,0.35)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <VictorianAnalogClock size={44} />
            <span
              style={{
                fontSize: '9px',
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                color: 'rgba(232,204,138,0.85)',
                fontFamily: 'var(--font-playfair-display), Georgia, "Times New Roman", serif',
              }}
            >
              Local Time
            </span>
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="relative z-20 h-full max-w-harvics-layout mx-auto px-6 flex flex-col justify-center pt-[18vh]">

        {/* Primary Headline */}
        <p
          className="harvics-corridor-eyebrow"
          style={{ marginBottom: '14px', color: 'rgba(195, 163, 94,0.95)' }}
        >
          01 · Corridor film
        </p>
        <h1 style={{
          fontSize: 'clamp(34px, 4.2vw, 60px)',
          fontWeight: 500,
          lineHeight: 1.08,
          letterSpacing: '-0.03em',
          color: 'var(--harvics-cream)',
          maxWidth: '600px',
          transform: 'translateY(0)',
          transition: 'transform 0.9s cubic-bezier(0.16,1,0.3,1) 0.2s',
          marginBottom: '12px',
          fontFamily: 'var(--font-playfair-display), Georgia, "Times New Roman", serif',
        }}>
          <span style={{ fontWeight: 600, color: 'var(--harvics-gold)' }}>Harvics Global</span><br />
          Ventures
        </h1>
        <div style={{
          fontSize: 'clamp(13px, 1.32vw, 17px)',
          color: 'rgba(245,240,232,0.75)',
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
          transform: 'translateY(0)',
          transition: 'transform 0.9s cubic-bezier(0.16,1,0.3,1) 0.5s',
          marginBottom: '40px',
        }}>
          <Link href={`/${locale}/products`} className="gold-btn" style={{
            display: 'inline-flex', alignItems: 'center', gap: '7px',
            padding: '11px 26px',
            background: 'linear-gradient(105deg, #C3A35E 0%, #C3A35E 40%, #f0d08e 52%, #C3A35E 64%, #C3A35E 100%)',
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
            border: '1px solid rgba(195, 163, 94,0.55)',
            color: 'var(--harvics-gold)',
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
              transform: 'translateY(0)',
              transition: `transform 0.8s ease ${0.6 + i * 0.1}s`,
            }}>
              <div style={{
                fontSize: 'clamp(22px, 2.4vw, 32px)',
                fontWeight: 700,
                color: 'var(--harvics-cream)',
                letterSpacing: '-0.03em',
                lineHeight: 1,
                fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
              }}>
                {s.prefix || ''}{s.num}{s.suffix}
              </div>
              <div style={{
                fontSize: '9px', fontWeight: 700, letterSpacing: '0.12em',
                color: 'rgba(195, 163, 94,0.85)', textTransform: 'uppercase', marginTop: '5px',
                fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
              }}>
                {s.label}
              </div>
            </div>
          ))}
          <div style={{
            width: '1px',
            background: 'rgba(195, 163, 94,0.25)',
            alignSelf: 'stretch',
            margin: '4px 0',
          }} />
        </div>

        {/* Trust badges row */}
        <div style={{
          display: 'flex', gap: '18px', flexWrap: 'wrap', alignItems: 'center',
          marginTop: '24px',
          transform: 'translateY(0)',
          transition: 'transform 0.9s cubic-bezier(0.16,1,0.3,1) 1.0s',
        }}>
          {['ISO Certified', 'HACCP Compliant', 'Halal Verified', 'BRC Approved'].map((badge, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: '5px',
              fontSize: '9px', fontWeight: 700, letterSpacing: '0.12em',
              color: 'rgba(195, 163, 94,0.75)', textTransform: 'uppercase',
              fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
            }}>
              <svg width="8" height="8" viewBox="0 0 12 12" fill="none">
                <path d="M2 6l3 3 5-5" stroke="var(--harvics-gold)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {badge}
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-14 right-8 z-30 flex flex-col items-center gap-2">
        <span style={{ fontSize: '9px', letterSpacing: '0.3em', fontWeight: 700, color: 'var(--harvics-gold)', textTransform: 'uppercase' }}>Scroll</span>
        <svg width="18" height="28" viewBox="0 0 18 28" fill="none" className="animate-bounce">
          <path d="M9 0L9 24M9 24L2 17M9 24L16 17" stroke="var(--harvics-gold)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      {/* Live Ticker — TEMPORARILY HIDDEN (set to true to re-enable) */}
      {false && (
        <div className="absolute bottom-0 left-0 right-0 z-30" style={{
          background: 'rgba(107,31,43,0.92)',
          borderTop: '1px solid rgba(195, 163, 94,0.25)',
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
              color: 'var(--harvics-gold)', textTransform: 'uppercase',
            }}>
              {repeated}
            </span>
          </div>
        </div>
      )}

      <style jsx>{`
        .hero-media {
          overflow: hidden;
        }
        .hero-media video {
          filter: brightness(0.82) contrast(1.08) saturate(1.04);
          transform-origin: center center;
          opacity: 0.92;
          transition: opacity 0.45s ease;
        }
        .hero-media video.is-playing {
          opacity: 1;
        }
        .hero-zoom {
          animation: heroZoom 18s ease-in-out infinite alternate;
        }
        @keyframes heroZoom {
          from { transform: scale(1.04); }
          to   { transform: scale(1.1); }
        }
        .hero-corner-mask {
          position: absolute;
          right: 0;
          bottom: 0;
          width: min(22vw, 280px);
          height: min(18vw, 200px);
          background: radial-gradient(
            ellipse 100% 100% at 100% 100%,
            rgba(13, 13, 13, 0.9) 0%,
            rgba(13, 13, 13, 0.5) 42%,
            transparent 72%
          );
          pointer-events: none;
          z-index: 2;
        }
        .hero-shimmer-wave {
          position: absolute;
          inset: -20% -40%;
          pointer-events: none;
          z-index: 1;
          mix-blend-mode: soft-light;
        }
        .hero-shimmer-wave--primary {
          opacity: 0.55;
          background: linear-gradient(
            105deg,
            transparent 0%,
            transparent 38%,
            rgba(195, 163, 94, 0.08) 44%,
            rgba(240, 208, 142, 0.38) 50%,
            rgba(195, 163, 94, 0.1) 56%,
            transparent 62%,
            transparent 100%
          );
          animation: heroShimmerWave 7.5s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite;
        }
        .hero-shimmer-wave--secondary {
          opacity: 0.28;
          background: linear-gradient(
            118deg,
            transparent 0%,
            transparent 46%,
            rgba(232, 204, 138, 0.22) 50%,
            transparent 54%,
            transparent 100%
          );
          animation: heroShimmerWave 11s cubic-bezier(0.4, 0.1, 0.4, 1) infinite;
          animation-delay: 2.4s;
        }
        @keyframes heroShimmerWave {
          0% {
            transform: translate3d(-55%, 0, 0) skewX(-8deg);
          }
          100% {
            transform: translate3d(55%, 0, 0) skewX(-8deg);
          }
        }
        .hv-ticker-track {
          animation: hvTickerScroll 60s linear infinite;
        }
        @keyframes hvTickerScroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
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
        @media (prefers-reduced-motion: reduce) {
          .hero-zoom,
          .hero-shimmer-wave--primary,
          .hero-shimmer-wave--secondary,
          .gold-btn,
          .hv-ticker-track {
            animation: none !important;
          }
          .hero-media video {
            transform: scale(1.06);
          }
        }
      `}</style>
    </section>
  )
}

export default LiquidGlassHero