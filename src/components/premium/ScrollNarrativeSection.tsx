'use client'

import React, { useRef, useEffect, useState } from 'react'

const pillars = [
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: 'Global Reach',
    stat: '50+',
    unit: 'Countries',
    description: 'Operating across six continents with direct supply chain access and local market intelligence.',
    gradient: 'from-[#C3A35E] to-[#E8D5A3]',
    video: '/vedios/compressed/global-reach.mp4',
    hoverTitle: 'Across Every Continent',
    hoverDesc: 'Our network spans 50+ countries — sourcing locally, delivering globally with zero compromise on speed or quality.',
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    title: 'Quality Assured',
    stat: '100%',
    unit: 'Tested',
    description: 'Every product passes ISO, HACCP, BRC and Halal multi-stage certification before dispatch.',
    gradient: 'from-[#6B1F2B] to-[#9B3A4B]',
    video: '/vedios/compressed/principles.mp4',
    hoverTitle: 'Zero Compromise',
    hoverDesc: 'ISO, HACCP, Halal, BRC — every product certified before it leaves source. Our principles are non-negotiable.',
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    title: 'Fast Logistics',
    stat: '72h',
    unit: 'Transit',
    description: 'Multi-modal freight — air, sea, road — with real-time container tracking and SLA guarantees.',
    gradient: 'from-[#2563EB] to-[#60A5FA]',
    video: '/vedios/compressed/supply-chain.mp4',
    hoverTitle: 'Goods in Motion',
    hoverDesc: 'Air, sea, road — your cargo tracked in real time from factory floor to warehouse door. 72h is our promise.',
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
    title: 'AI-Powered',
    stat: '24/7',
    unit: 'Monitoring',
    description: 'Predictive demand forecasting and automated compliance checks running around the clock.',
    gradient: 'from-[#10B981] to-[#6EE7B7]',
    video: '/vedios/compressed/digital-infrastructure.mp4',
    hoverTitle: 'Intelligence at Scale',
    hoverDesc: 'Machine learning forecasts demand. AI flags compliance risks before they surface. Our infrastructure never sleeps.',
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    title: 'Trade Finance',
    stat: '$1.2B+',
    unit: 'Volume',
    description: 'Letters of credit, escrow, and HPAY digital settlements enabling seamless cross-border trade.',
    gradient: 'from-[#C3A35E] to-[#6B1F2B]',
    video: '/vedios/compressed/global-network.mp4',
    hoverTitle: 'Capital Flows Freely',
    hoverDesc: 'LCs, escrow, HPay digital payments — our financial network moves $1.2B+ annually across 50+ markets.',
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
    title: 'Multi-Industry',
    stat: '10',
    unit: 'Verticals',
    description: 'FMCG to Oil & Gas, Real Estate to AI — one commercial engine powering every sector.',
    gradient: 'from-[#7C3AED] to-[#A78BFA]',
    video: '/vedios/compressed/product-portfolio.mp4',
    hoverTitle: 'One Engine. Ten Sectors.',
    hoverDesc: 'FMCG, Commodities, Textiles, Oil & Gas, Real Estate, AI — a single commercial platform built to dominate every vertical.',
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
    title: 'Dedicated Teams',
    stat: '200+',
    unit: 'Specialists',
    description: 'Category experts, compliance officers, and field agents embedded in every market we serve.',
    gradient: 'from-[#6B1F2B] to-[#C3A35E]',
    video: '/vedios/compressed/who-we-are.mp4',
    hoverTitle: 'The People Behind It',
    hoverDesc: '200+ specialists — category experts, compliance officers, field agents — embedded in every market, every timezone.',
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
    title: 'Full Compliance',
    stat: '190+',
    unit: 'Jurisdictions',
    description: 'Sanctions checks, AML controls, and regulatory filing across every country we operate in.',
    gradient: 'from-[#0891B2] to-[#67E8F9]',
    video: '/vedios/compressed/speed.mp4',
    hoverTitle: 'Cleared at Every Border',
    hoverDesc: 'AML, sanctions screening, HS code filing — compliance processed at speed so your goods never stop moving.',
  },
]

const ScrollNarrativeSection: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null)
  const headingRef = useRef<HTMLDivElement>(null)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [headingVisible, setHeadingVisible] = useState(false)
  const [hoveredCard, setHoveredCard] = useState<number | null>(null)

  useEffect(() => {
    const handleScroll = () => {
      const el = sectionRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const viewHeight = window.innerHeight
      const progress = Math.max(0, Math.min(1, (viewHeight - rect.top) / (viewHeight + rect.height)))
      setScrollProgress(progress)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setHeadingVisible(true) },
      { threshold: 0.1 }
    )
    if (sectionRef.current) obs.observe(sectionRef.current)
    return () => obs.disconnect()
  }, [])

  // Equaliser bar heights — animate with scrollProgress
  const bars = [0.4, 0.7, 0.55, 0.9, 0.65, 0.45, 0.8, 0.6, 0.75, 0.5, 0.85, 0.4]

  return (
    <section ref={sectionRef} className="relative min-h-screen overflow-hidden flex flex-col" style={{
      display: 'grid',
      gridTemplateRows: 'auto auto auto',
      background: 'linear-gradient(180deg, #ffffff 0%, #faf9f7 50%, #f5f4f2 100%)',
    }}>

      {/* Fixed background grid lines — subtle Apple-style rule grid */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        {/* Vertical column dividers */}
        {['25%', '50%', '75%'].map(left => (
          <div key={left} style={{ position: 'absolute', left, top: '33.33%', bottom: 0, width: '1px', background: 'rgba(107,31,43,0.06)' }} />
        ))}
        {/* Horizontal row divider */}
        <div style={{ position: 'absolute', left: 0, right: 0, top: '66.66%', height: '1px', background: 'rgba(107,31,43,0.06)' }} />
      </div>

      {/* Equaliser bars — decorative, Apple-style, behind everything */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none" style={{ height: '33.34%', zIndex: 0, display: 'flex', alignItems: 'flex-end', padding: '0 24px', gap: '6px', opacity: 0.07 }}>
        {bars.map((h, i) => (
          <div key={i} style={{
            flex: 1,
            height: `${h * 80 + scrollProgress * 20}%`,
            background: 'linear-gradient(180deg, #C3A35E, #6B1F2B)',
            borderRadius: '2px 2px 0 0',
            transition: 'height 0.3s ease',
          }} />
        ))}
      </div>

      {/* TOP THIRD — Header with frosted glass panel */}
      <div className="relative z-10 flex flex-col items-center justify-center px-6">
        {/* Frosted glass backdrop */}
        <div style={{
          position: 'absolute',
          inset: '12px 10%',
          background: 'rgba(255,255,255,0.45)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderRadius: '16px',
          border: '1px solid rgba(255,255,255,0.8)',
          boxShadow: '0 4px 24px rgba(107,31,43,0.05), 0 1px 0 rgba(255,255,255,0.9) inset',
        }} />
        <div ref={headingRef} className="text-center relative z-10 py-2" style={{
            opacity: headingVisible ? 1 : 0,
            transform: headingVisible ? 'translateY(0)' : 'translateY(20px)',
            transition: 'opacity 0.8s ease, transform 0.8s ease',
          }}>
            {/* Eyebrow */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '8px' }}>
              <div style={{ height: '1px', width: '32px', background: 'linear-gradient(90deg, transparent, #C3A35E)' }} />
              <span style={{ color: '#C3A35E', fontSize: '10px', fontWeight: 700, letterSpacing: '0.25em', textTransform: 'uppercase', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>Why Harvics</span>
              <div style={{ height: '1px', width: '32px', background: 'linear-gradient(90deg, #C3A35E, transparent)' }} />
            </div>

            {/* Animated Headline */}
            <h2 style={{
              fontSize: 'clamp(20px, 2.8vw, 30px)',
              fontWeight: 700,
              letterSpacing: '-0.03em',
              color: '#1d1d1f',
              lineHeight: 1.1,
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
              marginBottom: '8px',
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: '0.28em',
              overflow: 'hidden',
            }}>
              {/* "Engineered for" — slides in from left */}
              <span style={{
                display: 'inline-block',
                transform: headingVisible ? 'translateX(0) skewX(0deg)' : 'translateX(-60px) skewX(-8deg)',
                opacity: headingVisible ? 1 : 0,
                transition: 'transform 0.7s cubic-bezier(0.22,1,0.36,1) 0.1s, opacity 0.5s ease 0.1s',
              }}>
                Engineered for
              </span>

              {/* "Excellence" — smooth gradient reveal */}
              <span style={{
                display: 'inline-block',
                background: 'linear-gradient(135deg, #C3A35E 0%, #E5C07B 40%, #6B1F2B 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                transform: headingVisible ? 'translateY(0)' : 'translateY(30px)',
                opacity: headingVisible ? 1 : 0,
                transition: 'transform 0.7s cubic-bezier(0.22,1,0.36,1) 0.45s, opacity 0.5s ease 0.45s',
              }}>
                Excellence
              </span>
            </h2>

            {/* Subtext — fades up after headline */}
            <p style={{
              color: 'rgba(107,31,43,0.5)',
              fontSize: '13px',
              maxWidth: '480px',
              margin: '0 auto',
              lineHeight: 1.6,
              fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
              letterSpacing: '-0.01em',
              opacity: headingVisible ? 1 : 0,
              transform: headingVisible ? 'translateY(0)' : 'translateY(14px)',
              transition: 'opacity 0.6s ease 1.1s, transform 0.6s ease 1.1s',
            }}>
              From sourcing to shelf, every step is optimized by technology,<br />validated by expertise, and driven by quality.
            </p>
          </div>
      </div>

      {/* MIDDLE THIRD — Row 1: 4 cards (pillars 0-3) */}
      <div className="relative z-10 grid grid-cols-4 gap-0" style={{ borderTop: '1px solid rgba(107,31,43,0.1)' }}>
        {[0,1,2,3].map((pi, i) => {
          const pillar = pillars[pi]
          const isHovered = hoveredCard === pi
          return (
            <div key={pi} className="h-fit" style={{
              opacity: headingVisible ? 1 : 0,
              transform: headingVisible ? 'translateY(0)' : 'translateY(24px)',
              transition: `opacity 0.6s ease ${0.3 + i * 0.06}s, transform 0.6s ease ${0.3 + i * 0.06}s`,
            }}>
              <div
                className="eq-card h-fit flex flex-col justify-between p-4 cursor-pointer"
                style={{
                  borderRight: i < 3 ? '1px solid rgba(160,130,60,0.15)' : 'none',
                  background: '#0d0608',
                  position: 'relative',
                  overflow: 'hidden',
                }}
                onMouseEnter={() => setHoveredCard(pi)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                {/* Video always playing */}
                <video
                  src={pillar.video}
                  autoPlay muted loop playsInline
                  style={{
                    position: 'absolute', inset: 0,
                    width: '100%', height: '100%',
                    objectFit: 'cover',
                    opacity: 1,
                    zIndex: 0,
                  }}
                />
                {/* Gold border on hover */}
                <div style={{
                  position: 'absolute', inset: 0,
                  border: isHovered ? '2px solid rgba(195,163,94,0.6)' : '1px solid rgba(195,163,94,0.12)',
                  transition: 'border 0.3s ease',
                  zIndex: 2, pointerEvents: 'none',
                }} />

                {/* Card content */}
                <div style={{ position: 'relative', zIndex: 3 }}>
                  <div className={`inline-flex items-center justify-center w-9 h-9 mb-3 text-white bg-gradient-to-br ${pillar.gradient}`} style={{ borderRadius: '10px', boxShadow: '0 4px 14px rgba(0,0,0,0.22)' }}>
                    {pillar.icon}
                  </div>
                  {/* Default state */}
                  <div style={{ opacity: isHovered ? 0 : 1, transition: 'opacity 0.3s ease', position: isHovered ? 'absolute' : 'relative' }}>
                    <div style={{ fontSize: 'clamp(28px, 3vw, 44px)', fontWeight: 800, color: '#f0d08e', lineHeight: 1, letterSpacing: '-0.04em', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif', marginBottom: '3px' }}>{pillar.stat}</div>
                    <div style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(240,208,142,0.55)', fontFamily: '-apple-system, sans-serif' }}>{pillar.unit}</div>
                    <p style={{ fontSize: '11px', color: 'rgba(240,208,142,0.4)', lineHeight: 1.5, fontFamily: '-apple-system, sans-serif', marginTop: '6px' }}>{pillar.description}</p>
                  </div>
                  {/* Hover state */}
                  <div style={{ opacity: isHovered ? 1 : 0, transition: 'opacity 0.4s ease 0.1s', position: isHovered ? 'relative' : 'absolute', top: 0 }}>
                    <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#f0d08e', letterSpacing: '-0.02em', marginBottom: '8px', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif', lineHeight: 1.2 }}>{pillar.hoverTitle}</h3>
                    <p style={{ fontSize: '11px', color: 'rgba(240,208,142,0.8)', lineHeight: 1.65, fontFamily: '-apple-system, sans-serif' }}>{pillar.hoverDesc}</p>
                  </div>
                </div>
                <div style={{ position: 'relative', zIndex: 3, height: '2px', background: isHovered ? 'linear-gradient(90deg, #C3A35E, transparent)' : 'linear-gradient(90deg, rgba(195,163,94,0.4), transparent)', marginTop: '10px', width: isHovered ? '80%' : '48px', borderRadius: '1px', transition: 'width 0.4s ease, background 0.3s ease' }} />
              </div>
            </div>
          )
        })}
      </div>

      {/* BOTTOM THIRD — Row 2: 4 cards (pillars 4-7) */}
      <div className="relative z-10 grid grid-cols-4 gap-0" style={{ borderTop: '1px solid rgba(160,130,60,0.2)' }}>
        {[4,5,6,7].map((pi, i) => {
          const pillar = pillars[pi]
          const isHovered = hoveredCard === pi
          return (
            <div key={pi} className="h-fit" style={{
              opacity: headingVisible ? 1 : 0,
              transform: headingVisible ? 'translateY(0)' : 'translateY(24px)',
              transition: `opacity 0.6s ease ${0.6 + i * 0.06}s, transform 0.6s ease ${0.6 + i * 0.06}s`,
            }}>
              <div
                className="eq-card h-fit flex flex-col justify-between p-4 cursor-pointer"
                style={{
                  borderRight: i < 3 ? '1px solid rgba(160,130,60,0.15)' : 'none',
                  background: '#0d0608',
                  position: 'relative',
                  overflow: 'hidden',
                }}
                onMouseEnter={() => setHoveredCard(pi)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <video
                  src={pillar.video}
                  autoPlay muted loop playsInline
                  style={{
                    position: 'absolute', inset: 0,
                    width: '100%', height: '100%',
                    objectFit: 'cover',
                    opacity: 1,
                    zIndex: 0,
                  }}
                />
                <div style={{
                  position: 'absolute', inset: 0,
                  border: isHovered ? '2px solid rgba(195,163,94,0.6)' : '1px solid rgba(195,163,94,0.12)',
                  transition: 'border 0.3s ease',
                  zIndex: 2, pointerEvents: 'none',
                }} />

                <div style={{ position: 'relative', zIndex: 3 }}>
                  <div className={`inline-flex items-center justify-center w-9 h-9 mb-3 text-white bg-gradient-to-br ${pillar.gradient}`} style={{ borderRadius: '10px', boxShadow: '0 4px 14px rgba(0,0,0,0.22)' }}>
                    {pillar.icon}
                  </div>
                  <div style={{ opacity: isHovered ? 0 : 1, transition: 'opacity 0.3s ease', position: isHovered ? 'absolute' : 'relative' }}>
                    <div style={{ fontSize: 'clamp(28px, 3vw, 44px)', fontWeight: 800, color: '#f0d08e', lineHeight: 1, letterSpacing: '-0.04em', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif', marginBottom: '3px' }}>{pillar.stat}</div>
                    <div style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(240,208,142,0.55)', fontFamily: '-apple-system, sans-serif' }}>{pillar.unit}</div>
                    <p style={{ fontSize: '11px', color: 'rgba(240,208,142,0.4)', lineHeight: 1.5, fontFamily: '-apple-system, sans-serif', marginTop: '6px' }}>{pillar.description}</p>
                  </div>
                  <div style={{ opacity: isHovered ? 1 : 0, transition: 'opacity 0.4s ease 0.1s', position: isHovered ? 'relative' : 'absolute', top: 0 }}>
                    <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#f0d08e', letterSpacing: '-0.02em', marginBottom: '8px', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif', lineHeight: 1.2 }}>{pillar.hoverTitle}</h3>
                    <p style={{ fontSize: '11px', color: 'rgba(240,208,142,0.8)', lineHeight: 1.65, fontFamily: '-apple-system, sans-serif' }}>{pillar.hoverDesc}</p>
                  </div>
                </div>
                <div style={{ position: 'relative', zIndex: 3, height: '2px', background: isHovered ? 'linear-gradient(90deg, #C3A35E, transparent)' : 'linear-gradient(90deg, rgba(195,163,94,0.35), transparent)', marginTop: '10px', width: isHovered ? '80%' : '48px', borderRadius: '1px', transition: 'width 0.4s ease, background 0.3s ease' }} />
              </div>
            </div>
          )
        })}
      </div>

      <style jsx>{`
        .eq-card {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          position: relative;
          overflow: hidden;
        }
        .eq-card:hover {
          box-shadow: 0 8px 32px rgba(0,0,0,0.3), 0 0 0 1px rgba(195,163,94,0.4);
          transform: translateY(-2px);
        }
        @keyframes eqSweep {
          0%   { left: -100%; }
          50%  { left: 200%; }
          100% { left: 200%; }
        }
      `}</style>
    </section>
  )
}

export default ScrollNarrativeSection
