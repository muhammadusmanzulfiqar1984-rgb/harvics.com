'use client'

import React, { useRef, useEffect, useState } from 'react'
import ScrollMotion, { ScrollMotionGroup } from './ScrollMotion'

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
    description: 'Operating across six continents with direct supply chain access.',
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
    description: 'Every product passes rigorous multi-stage quality inspection.',
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
    description: 'Optimized supply routes for rapid regional delivery.',
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
    description: 'Machine learning forecasting and automated quality control.',
    gradient: 'from-[#10B981] to-[#6EE7B7]',
  },
]

const ScrollNarrativeSection: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null)
  const [scrollProgress, setScrollProgress] = useState(0)

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
        <ScrollMotion animation="blur" duration={1200}>
          <div className="text-center relative z-10 py-4">
            {/* Eyebrow */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '8px' }}>
              <div style={{ height: '1px', width: '32px', background: 'linear-gradient(90deg, transparent, #C3A35E)' }} />
              <span style={{ color: '#C3A35E', fontSize: '10px', fontWeight: 700, letterSpacing: '0.25em', textTransform: 'uppercase', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>Why Harvics</span>
              <div style={{ height: '1px', width: '32px', background: 'linear-gradient(90deg, #C3A35E, transparent)' }} />
            </div>
            {/* Headline */}
            <h2 style={{
              fontSize: 'clamp(22px, 3vw, 34px)',
              fontWeight: 700,
              letterSpacing: '-0.03em',
              color: '#1d1d1f',
              lineHeight: 1.1,
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
              marginBottom: '8px',
            }}>
              Engineered for{' '}
              <span style={{ background: 'linear-gradient(135deg, #C3A35E 0%, #6B1F2B 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Excellence
              </span>
            </h2>
            {/* Subtext */}
            <p style={{ color: 'rgba(107,31,43,0.5)', fontSize: '13px', maxWidth: '480px', margin: '0 auto', lineHeight: 1.6, fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif', letterSpacing: '-0.01em' }}>
              From sourcing to shelf, every step is optimized by technology,<br />validated by expertise, and driven by quality.
            </p>
          </div>
        </ScrollMotion>
      </div>

      {/* MIDDLE THIRD — Row 1: 4 cards */}
      <div className="relative z-10 grid grid-cols-4 gap-0" style={{ borderTop: '1px solid rgba(107,31,43,0.1)' }}>
        {[
          { pillar: pillars[0], delay: 0, stat: null, label: null },
          { pillar: pillars[1], delay: 60, stat: pillars[1].stat, label: pillars[1].unit },
          { pillar: pillars[3], delay: 120, stat: pillars[3].stat, label: pillars[3].unit },
          { pillar: pillars[3], delay: 180, stat: null, label: null, override: { title: pillars[3].title, description: pillars[3].description } },
        ].map(({ pillar, delay, stat, label, override }, i) => (
          <ScrollMotion key={i} animation={i === 0 ? 'fade-right' : i === 3 ? 'fade-left' : 'fade-up'} delay={delay} className="h-full">
            <div className="eq-card h-full flex flex-col justify-between p-5 cursor-pointer" style={{
              borderRight: i < 3 ? '1px solid rgba(107,31,43,0.08)' : 'none',
              background: i % 2 === 0
                ? 'rgba(253,252,249,0.75)'
                : 'rgba(237,232,220,0.55)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
            }}>
              {/* Top: icon */}
              <div>
                <div className={`inline-flex items-center justify-center w-9 h-9 mb-3 text-white bg-gradient-to-br ${pillar.gradient}`} style={{ borderRadius: '10px', boxShadow: '0 4px 14px rgba(0,0,0,0.12)' }}>
                  {pillar.icon}
                </div>
                {stat ? (
                  <>
                    <div style={{ fontSize: 'clamp(26px, 3vw, 40px)', fontWeight: 800, color: 'rgba(107,31,43,0.12)', lineHeight: 1, letterSpacing: '-0.04em', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif', marginBottom: '3px' }}>{stat}</div>
                    <div style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#C3A35E', fontFamily: '-apple-system, sans-serif' }}>{label}</div>
                  </>
                ) : (
                  <>
                    <h3 style={{ fontSize: '13px', fontWeight: 600, color: '#6B1F2B', letterSpacing: '-0.02em', marginBottom: '4px', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif' }}>{(override || pillar).title}</h3>
                    <p style={{ fontSize: '11px', color: 'rgba(107,31,43,0.48)', lineHeight: 1.55, fontFamily: '-apple-system, sans-serif' }}>{(override || pillar).description}</p>
                  </>
                )}
              </div>
              {/* Bottom: gold accent line */}
              <div style={{ height: '1.5px', background: `linear-gradient(90deg, ${i % 2 === 0 ? '#C3A35E' : '#6B1F2B'}, transparent)`, marginTop: '10px', width: stat ? '36px' : '55%', opacity: 0.7 }} />
            </div>
          </ScrollMotion>
        ))}
      </div>

      {/* BOTTOM THIRD — Row 2: 4 cards */}
      <div className="relative z-10 grid grid-cols-4 gap-0" style={{ borderTop: '1px solid rgba(107,31,43,0.1)' }}>
        {[
          { pillar: pillars[0], delay: 0, stat: pillars[0].stat, label: pillars[0].unit },
          { pillar: pillars[1], delay: 60, stat: null, label: null },
          { pillar: pillars[2], delay: 120, stat: null, label: null },
          { pillar: pillars[2], delay: 180, stat: pillars[2].stat, label: pillars[2].unit },
        ].map(({ pillar, delay, stat, label }, i) => (
          <ScrollMotion key={i} animation={i === 0 ? 'fade-right' : i === 3 ? 'fade-left' : 'fade-up'} delay={delay} className="h-full">
            <div className="eq-card h-full flex flex-col justify-between p-5 cursor-pointer" style={{
              borderRight: i < 3 ? '1px solid rgba(107,31,43,0.08)' : 'none',
              background: i % 2 === 0
                ? 'rgba(237,232,220,0.55)'
                : 'rgba(253,252,249,0.75)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
            }}>
              <div>
                <div className={`inline-flex items-center justify-center w-9 h-9 mb-3 text-white bg-gradient-to-br ${pillar.gradient}`} style={{ borderRadius: '10px', boxShadow: '0 4px 14px rgba(0,0,0,0.12)' }}>
                  {pillar.icon}
                </div>
                {stat ? (
                  <>
                    <div style={{ fontSize: 'clamp(26px, 3vw, 40px)', fontWeight: 800, color: 'rgba(107,31,43,0.12)', lineHeight: 1, letterSpacing: '-0.04em', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif', marginBottom: '3px' }}>{stat}</div>
                    <div style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#C3A35E', fontFamily: '-apple-system, sans-serif' }}>{label}</div>
                  </>
                ) : (
                  <>
                    <h3 style={{ fontSize: '13px', fontWeight: 600, color: '#6B1F2B', letterSpacing: '-0.02em', marginBottom: '4px', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif' }}>{pillar.title}</h3>
                    <p style={{ fontSize: '11px', color: 'rgba(107,31,43,0.48)', lineHeight: 1.55, fontFamily: '-apple-system, sans-serif' }}>{pillar.description}</p>
                  </>
                )}
              </div>
              <div style={{ height: '1.5px', background: `linear-gradient(90deg, ${i % 2 === 0 ? '#6B1F2B' : '#C3A35E'}, transparent)`, marginTop: '10px', width: stat ? '36px' : '55%', opacity: 0.7 }} />
            </div>
          </ScrollMotion>
        ))}
      </div>

      <style jsx>{`
        .eq-card {
          transition: background 0.25s ease, box-shadow 0.25s ease;
          position: relative;
          overflow: hidden;
        }
        .eq-card::after {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, rgba(255,255,255,0.85), rgba(195,163,94,0.3), rgba(255,255,255,0.85));
        }
        .eq-card:hover {
          background: rgba(255,250,245,0.92) !important;
          box-shadow: 0 0 0 1px rgba(195,163,94,0.22) inset, 0 6px 24px rgba(107,31,43,0.08);
        }
      `}</style>
    </section>
  )
}

export default ScrollNarrativeSection
