'use client'

import React, { useRef, useEffect, useState } from 'react'

/**
 * ScrollNarrativeSection — Full-width scroll-triggered narrative.
 * Text, images, and elements animate into place as user scrolls,
 * creating a cinematic storytelling flow.
 */

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
  },
]

const ScrollNarrativeSection: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null)
  const headingRef = useRef<HTMLDivElement>(null)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [headingVisible, setHeadingVisible] = useState(false)

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
    <section ref={sectionRef} className="relative h-full overflow-hidden" style={{
      display: 'grid',
      gridTemplateRows: '33.33% 33.33% 33.34%',
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
        <div ref={headingRef} className="text-center relative z-10 py-4" style={{
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
              fontSize: 'clamp(22px, 3vw, 34px)',
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
        {[
          { pillar: pillars[0], delay: 0, stat: null, label: null },
          { pillar: pillars[1], delay: 60, stat: pillars[1].stat, label: pillars[1].unit },
          { pillar: pillars[2], delay: 120, stat: pillars[2].stat, label: pillars[2].unit },
          { pillar: pillars[3], delay: 180, stat: null, label: null },
        ].map(({ pillar, delay, stat, label }, i) => (
          <div key={i} className="h-full" style={{
            opacity: headingVisible ? 1 : 0,
            transform: headingVisible ? 'translateY(0)' : 'translateY(24px)',
            transition: `opacity 0.6s ease ${0.3 + delay / 1000}s, transform 0.6s ease ${0.3 + delay / 1000}s`,
          }}>
            <div className="eq-card h-full flex flex-col justify-between p-5 cursor-pointer" style={{
              borderRight: i < 3 ? '1px solid rgba(160,130,60,0.2)' : 'none',
              background: 'linear-gradient(105deg, #C3A35E 0%, #E5C07B 40%, #f0d08e 52%, #E5C07B 64%, #C3A35E 100%)',
              backgroundSize: '220% 100%',
            }}>
              {/* Top: icon */}
              <div>
                <div className={`inline-flex items-center justify-center w-9 h-9 mb-3 text-white bg-gradient-to-br ${pillar.gradient}`} style={{ borderRadius: '10px', boxShadow: '0 4px 14px rgba(0,0,0,0.22)' }}>
                  {pillar.icon}
                </div>
                {stat ? (
                  <>
                    <div style={{ fontSize: 'clamp(32px, 3.5vw, 48px)', fontWeight: 800, color: '#1a0d00', lineHeight: 1, letterSpacing: '-0.04em', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif', marginBottom: '3px' }}>{stat}</div>
                    <div style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#6B1F2B', fontFamily: '-apple-system, sans-serif' }}>{label}</div>
                    <p style={{ fontSize: '11px', color: 'rgba(26,13,0,0.55)', lineHeight: 1.5, fontFamily: '-apple-system, sans-serif', marginTop: '6px' }}>{pillar.description}</p>
                  </>
                ) : (
                  <>
                    <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#1a0d00', letterSpacing: '-0.02em', marginBottom: '5px', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif' }}>{pillar.title}</h3>
                    <p style={{ fontSize: '11px', color: 'rgba(26,13,0,0.55)', lineHeight: 1.55, fontFamily: '-apple-system, sans-serif' }}>{pillar.description}</p>
                  </>
                )}
              </div>
              {/* Bottom: accent line */}
              <div style={{ height: '2px', background: 'linear-gradient(90deg, rgba(26,13,0,0.25), transparent)', marginTop: '10px', width: stat ? '48px' : '60%', borderRadius: '1px' }} />
            </div>
          </div>
        ))}
      </div>

      {/* BOTTOM THIRD — Row 2: 4 cards (pillars 4-7) */}
      <div className="relative z-10 grid grid-cols-4 gap-0" style={{ borderTop: '1px solid rgba(160,130,60,0.2)' }}>
        {[
          { pillar: pillars[4], delay: 0, stat: pillars[4].stat, label: pillars[4].unit },
          { pillar: pillars[5], delay: 60, stat: null, label: null },
          { pillar: pillars[6], delay: 120, stat: null, label: null },
          { pillar: pillars[7], delay: 180, stat: pillars[7].stat, label: pillars[7].unit },
        ].map(({ pillar, delay, stat, label }, i) => (
          <div key={i} className="h-full" style={{
            opacity: headingVisible ? 1 : 0,
            transform: headingVisible ? 'translateY(0)' : 'translateY(24px)',
            transition: `opacity 0.6s ease ${0.6 + delay / 1000}s, transform 0.6s ease ${0.6 + delay / 1000}s`,
          }}>
            <div className="eq-card h-full flex flex-col justify-between p-5 cursor-pointer" style={{
              borderRight: i < 3 ? '1px solid rgba(160,130,60,0.2)' : 'none',
              background: 'linear-gradient(105deg, #C3A35E 0%, #E5C07B 40%, #f0d08e 52%, #E5C07B 64%, #C3A35E 100%)',
              backgroundSize: '220% 100%',
            }}>
              <div>
                <div className={`inline-flex items-center justify-center w-9 h-9 mb-3 text-white bg-gradient-to-br ${pillar.gradient}`} style={{ borderRadius: '10px', boxShadow: '0 4px 14px rgba(0,0,0,0.22)' }}>
                  {pillar.icon}
                </div>
                {stat ? (
                  <>
                    <div style={{ fontSize: 'clamp(32px, 3.5vw, 48px)', fontWeight: 800, color: '#1a0d00', lineHeight: 1, letterSpacing: '-0.04em', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif', marginBottom: '3px' }}>{stat}</div>
                    <div style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#6B1F2B', fontFamily: '-apple-system, sans-serif' }}>{label}</div>
                    <p style={{ fontSize: '11px', color: 'rgba(26,13,0,0.55)', lineHeight: 1.5, fontFamily: '-apple-system, sans-serif', marginTop: '6px' }}>{pillar.description}</p>
                  </>
                ) : (
                  <>
                    <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#1a0d00', letterSpacing: '-0.02em', marginBottom: '5px', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif' }}>{pillar.title}</h3>
                    <p style={{ fontSize: '11px', color: 'rgba(26,13,0,0.55)', lineHeight: 1.55, fontFamily: '-apple-system, sans-serif' }}>{pillar.description}</p>
                  </>
                )}
              </div>
              <div style={{ height: '2px', background: 'linear-gradient(90deg, rgba(26,13,0,0.25), transparent)', marginTop: '10px', width: stat ? '48px' : '60%', borderRadius: '1px' }} />
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .eq-card {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          position: relative;
          overflow: hidden;
          animation: eqGoldShimmer 2.8s linear infinite;
        }
        .eq-card::after {
          content: '';
          position: absolute;
          top: 0; left: -100%;
          width: 60%;
          height: 100%;
          background: linear-gradient(110deg, transparent 20%, rgba(255,255,255,0.35) 50%, transparent 80%);
          animation: eqSweep 3s ease-in-out infinite;
          pointer-events: none;
        }
        .eq-card:hover {
          box-shadow: 0 6px 24px rgba(195,163,94,0.4), 0 2px 8px rgba(0,0,0,0.1);
          transform: translateY(-2px);
        }
        @keyframes eqGoldShimmer {
          0%   { background-position: 100% 0; }
          100% { background-position: -100% 0; }
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
